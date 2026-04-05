# Spec: Add Token Export Endpoint to Whoop OAuth Server

**Target repo:** `compound-life-ai/whoop-OAuthserver`
**Purpose:** Allow the local CLI (compound-clawskill) to acquire Whoop tokens after the user completes the browser-based OAuth flow.

## Context

compound-clawskill is a local-first CLI tool. Its Python scripts need a Whoop access token and refresh token to call the Whoop API directly. The OAuth server currently stores tokens in httpOnly cookies — inaccessible to external scripts. We need a way for the user to extract the tokens once after authentication.

## Requirements

### 1. New route: `GET /api/whoop/export`

**Behavior:**
- Read `whoop_access_token` and `whoop_refresh_token` from the request's httpOnly cookies
- Return them as a JSON response:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "exported_at": "2026-03-24T12:00:00Z"
}
```

- If either cookie is missing, return `401`:

```json
{ "error": "Not authenticated. Complete the OAuth flow first." }
```

**Security considerations:**
- This endpoint intentionally exposes tokens so the user can save them locally. This is acceptable because:
  - The app is single-user (max 10 users in dev mode)
  - Tokens are only exposed to the authenticated user's own browser session
  - The user is explicitly choosing to export their own tokens
- Do NOT add CORS headers — this should only be accessible from the browser directly, not from cross-origin scripts

### 2. Update success page (`app/page.tsx`)

After OAuth callback redirects to `/?success=true`, the page should:

- Show a "Connected" status message
- Display a **"Copy Tokens for CLI"** button that:
  - Calls `GET /api/whoop/export`
  - Copies the JSON response to clipboard
  - Shows confirmation ("Copied! Paste into your CLI when prompted.")
- Alternatively, show a **"Download tokens.json"** link that triggers a file download of the JSON

Both options (copy + download) are ideal. At minimum, implement the copy button.

### 3. No other changes

- Do not modify the existing `/api/whoop/authorize`, `/api/whoop/callback`, `/api/whoop/refresh`, or `/api/whoop/me` routes
- Do not change token storage (keep httpOnly cookies as-is)
- Do not add new environment variables

## Expected Token JSON Shape

The exported JSON will be saved by compound-clawskill to `longevityOS-data/health/whoop_tokens.json` and used by the Python import script. The shape must be exactly:

```json
{
  "access_token": "string",
  "refresh_token": "string",
  "exported_at": "ISO-8601 timestamp"
}
```

## Test Plan

1. Complete OAuth flow → redirected to `/?success=true`
2. Click "Copy Tokens for CLI" → JSON copied to clipboard
3. Visit `/api/whoop/export` directly → JSON response with both tokens
4. Clear cookies → visit `/api/whoop/export` → 401 error
5. Visit `/?success=true` without cookies → button should show error state, not crash
