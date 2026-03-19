from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from scripts.common.storage import load_json, utc_now_iso, write_json


DEFAULT_CACHE_TTL_DAYS = 90

MACRO_FIELDS = (
    "calories_kcal",
    "protein_g",
    "carbs_g",
    "fat_g",
    "fiber_g",
)

INGREDIENT_ALIASES = {
    "鸡蛋": "egg whole raw",
    "eggs": "egg whole raw",
    "egg": "egg whole raw",
    "salmon": "salmon atlantic raw",
    "三文鱼": "salmon atlantic raw",
    "white rice": "rice white cooked",
    "米饭": "rice white cooked",
    "白米饭": "rice white cooked",
    "oatmeal": "oats",
    "燕麦": "oats",
}

# Deterministic nutrition seed data, mostly based on standard USDA-style per-100g values.
INGREDIENT_CATALOG = {
    "egg whole raw": {
        "calories_kcal": 143.0,
        "protein_g": 12.6,
        "carbs_g": 0.72,
        "fat_g": 9.51,
        "fiber_g": 0.0,
        "micronutrients": {
            "selenium_mcg": 30.7,
            "vitamin_b12_mcg": 1.11,
            "choline_mg": 294.0,
        },
    },
    "salmon atlantic raw": {
        "calories_kcal": 208.67,
        "protein_g": 20.24,
        "carbs_g": 0.0,
        "fat_g": 13.42,
        "fiber_g": 0.0,
        "micronutrients": {
            "vitamin_d_mcg": 10.9,
            "selenium_mcg": 36.5,
            "vitamin_b12_mcg": 3.18,
        },
    },
    "rice white cooked": {
        "calories_kcal": 130.32,
        "protein_g": 2.86,
        "carbs_g": 28.17,
        "fat_g": 0.28,
        "fiber_g": 0.4,
        "micronutrients": {
            "manganese_mg": 0.47,
            "selenium_mcg": 7.5,
            "folate_mcg": 58.0,
        },
    },
    "oats": {
        "calories_kcal": 389.0,
        "protein_g": 16.89,
        "carbs_g": 66.27,
        "fat_g": 6.9,
        "fiber_g": 10.6,
        "micronutrients": {
            "iron_mg": 4.72,
            "magnesium_mg": 177.0,
            "manganese_mg": 4.92,
        },
    },
}

PORTION_GRAMS = {
    "egg whole raw": {
        "1 egg": 50.0,
        "2 eggs": 100.0,
    },
    "rice white cooked": {
        "1 bowl": 158.0,
        "1 cup": 158.0,
    },
    "oats": {
        "1 bowl": 40.0,
        "1 cup": 80.0,
    },
}


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
