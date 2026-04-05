# API Contracts: Chatbot Rate Limiting by Source

**Branch**: `010-bot-landing-only` | **Date**: 2026-04-05

## Modified Endpoint

### POST `/api/v1/ai/public/chat` (Backend)

**Change**: Added optional `source` field to request body.

**Request Body** (updated):
```json
{
  "question": "Cách sử dụng phân bón NPK?",
  "sessionId": "uuid-optional",
  "productId": "uuid-optional",
  "source": "landing"
}
```

| Field | Type | Required | Values | Default |
|-------|------|----------|--------|---------|
| question | string | Yes | max 2000 chars | — |
| sessionId | string | No | UUID | — |
| productId | string | No | UUID | — |
| **source** | **string** | **No** | `"landing"`, `"pos"`, `"admin"` | `"landing"` |

**Response**: No changes. Same SSE stream format.

**Behavior Change**:
- If `source` is `"pos"` or `"admin"`: session message limit is **not enforced**
- If `source` is `"landing"` or omitted: session message limit is enforced as before
- IP rate limit (10 msg/min) remains enforced for all sources

---

## Modified Proxy

### POST `/api/chat` (Next.js Proxy)

**Change**: Forwards the `source` field from the client body to the backend.

Before:
```json
{ "question": "...", "sessionId": "...", "productId": "..." }
```

After:
```json
{ "question": "...", "sessionId": "...", "productId": "...", "source": "landing" }
```

No other changes to proxy behavior.
