from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from scripts.common.storage import load_json, utc_now_iso, write_json
from scripts.nutrition.catalog_data import (
    INGREDIENT_ALIASES,
    INGREDIENT_CATALOG,
    PORTION_GRAMS,
)


DEFAULT_CACHE_TTL_DAYS = 90

MACRO_FIELDS = (
    "calories_kcal",
    "protein_g",
    "carbs_g",
    "fat_g",
    "fiber_g",
)


def normalize_ingredient_name(name: str) -> str:
    cleaned = re.sub(r"\s+", " ", name.strip().lower())
    if not cleaned:
        return ""
    return INGREDIENT_ALIASES.get(cleaned, cleaned)


def nutrition_cache_path(data_root: Path) -> Path:
    return data_root / "nutrition" / "nutrition_cache.json"


def recipe_library_path(data_root: Path) -> Path:
    return data_root / "nutrition" / "recipe_library.json"


def default_nutrition_cache() -> dict[str, Any]:
    return {"items": {}}


def default_recipe_library() -> dict[str, Any]:
    return {"items": []}


def load_nutrition_cache(data_root: Path) -> dict[str, Any]:
    payload = load_json(nutrition_cache_path(data_root), default_nutrition_cache())
    if not isinstance(payload, dict) or not isinstance(payload.get("items"), dict):
        return default_nutrition_cache()
    return payload


def write_nutrition_cache(data_root: Path, payload: dict[str, Any]) -> None:
    write_json(nutrition_cache_path(data_root), payload)


def ingredient_has_explicit_nutrients(ingredient: dict[str, Any]) -> bool:
    if any(field in ingredient for field in MACRO_FIELDS):
        return True
    micros = ingredient.get("micronutrients")
    return isinstance(micros, dict) and bool(micros)


def _parse_timestamp(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _coerce_float(value: Any, default: float = 0.0) -> float:
    if value in (None, "", False):
        return default
    return round(float(value), 2)


def infer_amount_g(ingredient: dict[str, Any], normalized_name: str) -> float:
    if "amount_g" in ingredient and ingredient["amount_g"] not in (None, ""):
        return _coerce_float(ingredient["amount_g"])

    portion = str(ingredient.get("portion") or "").strip().lower()
    if not portion:
        return 100.0

    match = re.search(r"(\d+(?:\.\d+)?)\s*g\b", portion)
    if match:
        return round(float(match.group(1)), 2)

    mapped = PORTION_GRAMS.get(normalized_name, {}).get(portion)
    if mapped is not None:
        return mapped

    return 100.0


def scale_nutrients(nutrients_per_100g: dict[str, Any], amount_g: float) -> dict[str, Any]:
    factor = amount_g / 100.0
    scaled = {
        field: round(_coerce_float(nutrients_per_100g.get(field)) * factor, 2)
        for field in MACRO_FIELDS
    }
    micros = nutrients_per_100g.get("micronutrients", {})
    scaled["micronutrients"] = {
        key: round(_coerce_float(value) * factor, 2)
        for key, value in micros.items()
    }
    return scaled


def _cache_entry_is_fresh(entry: dict[str, Any], now: datetime) -> bool:
    expires_at = entry.get("expires_at")
    if not expires_at:
        return False
    return _parse_timestamp(str(expires_at)) > now


def get_cached_nutrition(data_root: Path, normalized_name: str) -> dict[str, Any] | None:
    cache = load_nutrition_cache(data_root)
    entry = cache["items"].get(normalized_name)
    if not isinstance(entry, dict):
        return None
    if not _cache_entry_is_fresh(entry, datetime.now(timezone.utc)):
        return None
    nutrients = entry.get("nutrients_per_100g")
    if not isinstance(nutrients, dict):
        return None
    return {
        "source": str(entry.get("source") or "cache"),
        "nutrients_per_100g": nutrients,
    }


def cache_nutrition(
    data_root: Path,
    normalized_name: str,
    nutrients_per_100g: dict[str, Any],
    *,
    source: str,
    ttl_days: int = DEFAULT_CACHE_TTL_DAYS,
) -> None:
    cache = load_nutrition_cache(data_root)
    cached_at = _parse_timestamp(utc_now_iso())
    expires_at = cached_at + timedelta(days=ttl_days)
    cache["items"][normalized_name] = {
        "source": source,
        "cached_at": cached_at.isoformat(),
        "expires_at": expires_at.isoformat(),
        "ttl_days": ttl_days,
        "nutrients_per_100g": nutrients_per_100g,
    }
    write_nutrition_cache(data_root, cache)


def get_catalog_nutrition(normalized_name: str) -> dict[str, Any] | None:
    nutrients = INGREDIENT_CATALOG.get(normalized_name)
    if nutrients is None:
        return None
    return {
        "source": "catalog",
        "nutrients_per_100g": nutrients,
    }


def enrich_ingredient(ingredient: dict[str, Any], data_root: Path) -> dict[str, Any]:
    ingredient_name = str(ingredient.get("name") or "").strip()
    if not ingredient_name:
        raise ValueError("each ingredient needs a non-empty name")

    normalized_name = normalize_ingredient_name(ingredient_name)
    amount_g = infer_amount_g(ingredient, normalized_name)

    if ingredient_has_explicit_nutrients(ingredient):
        enriched = {
            "name": ingredient_name,
            "normalized_name": normalized_name,
            "amount_g": amount_g,
            "portion": str(ingredient.get("portion") or ""),
            "calories_kcal": _coerce_float(ingredient.get("calories_kcal")),
            "protein_g": _coerce_float(ingredient.get("protein_g")),
            "carbs_g": _coerce_float(ingredient.get("carbs_g")),
            "fat_g": _coerce_float(ingredient.get("fat_g")),
            "fiber_g": _coerce_float(ingredient.get("fiber_g")),
            "micronutrients": {
                str(key): _coerce_float(value)
                for key, value in dict(ingredient.get("micronutrients") or {}).items()
            },
            "nutrient_source": "provided",
        }
        if "confidence" in ingredient:
            enriched["confidence"] = _coerce_float(ingredient.get("confidence"))
        return enriched

    lookup_result = get_cached_nutrition(data_root, normalized_name)
    if lookup_result is None:
        lookup_result = get_catalog_nutrition(normalized_name)
        if lookup_result is not None:
            cache_nutrition(
                data_root,
                normalized_name,
                lookup_result["nutrients_per_100g"],
                source="catalog",
            )

    if lookup_result is None:
        raise ValueError(f"no deterministic nutrition lookup available for ingredient: {ingredient_name}")

    scaled = scale_nutrients(lookup_result["nutrients_per_100g"], amount_g)
    enriched = {
        "name": ingredient_name,
        "normalized_name": normalized_name,
        "amount_g": amount_g,
        "portion": str(ingredient.get("portion") or ""),
        **scaled,
        "nutrient_source": lookup_result["source"],
    }
    if "confidence" in ingredient:
        enriched["confidence"] = _coerce_float(ingredient.get("confidence"))
    return enriched
