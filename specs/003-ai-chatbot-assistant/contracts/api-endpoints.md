# API Contracts: AI Chatbot Assistant

**Branch**: `003-ai-chatbot-assistant` | **Date**: 2026-03-20

## Public Endpoints (No Auth)

### POST `/ai/public/chat`

Chat with the AI assistant (public, rate-limited).

**Request**:
```json
{
  "sessionId": "uuid-or-null",
  "question": "Thuốc trừ sâu này dùng cho cây gì?",
  "productId": "uuid-optional"
}
```

**Response** (SSE stream):
```
event: token
data: {"token": "Thuốc"}

event: token
data: {"token": " trừ sâu"}

event: done
data: {"sessionId": "uuid", "sources": [{"documentId": "...", "snippet": "..."}]}
```

**Error responses**:
- `429 Too Many Requests` — rate limit exceeded (10 msg/min)
- `400 Bad Request` — message too long (>2000 chars) or session limit reached
- `503 Service Unavailable` — chatbot disabled by admin

---

## Admin Endpoints (JWT Auth Required)

### GET `/ai/admin/knowledge`

List all uploaded knowledge documents.

**Response**:
```json
[
  {
    "id": "uuid",
    "filename": "huong-dan-thuoc-bvtv.pdf",
    "mimeType": "application/pdf",
    "fileSize": 245000,
    "status": "READY",
    "chunkCount": 15,
    "uploadedBy": "admin-uuid",
    "createdAt": "2026-03-20T10:00:00Z"
  }
]
```

### POST `/ai/admin/knowledge`

Upload a knowledge document (multipart/form-data).

**Request**: `Content-Type: multipart/form-data`
- `file`: PDF/DOCX/TXT, max 10MB

**Response** `201`:
```json
{
  "id": "uuid",
  "filename": "huong-dan.pdf",
  "status": "PROCESSING"
}
```

### DELETE `/ai/admin/knowledge/:id`

Delete a knowledge document and its embeddings.

**Response** `200`:
```json
{ "message": "Đã xóa tài liệu" }
```

---

### POST `/ai/admin/sync-products`

Sync all products into RAG knowledge base (manual trigger).

**Response** `200`:
```json
{
  "message": "Đồng bộ thành công",
  "productCount": 42,
  "chunkCount": 128
}
```

---

### GET `/ai/admin/config`

Get current chatbot configuration.

**Response**:
```json
{
  "systemPrompt": "Bạn là chuyên gia nông nghiệp...",
  "primaryProvider": "openai",
  "hasPrimaryKey": true,
  "secondaryProvider": "gemini",
  "hasSecondaryKey": true,
  "enabled": true,
  "maxMessagesPerSession": 20
}
```

### PUT `/ai/admin/config`

Update chatbot configuration.

**Request**:
```json
{
  "systemPrompt": "Bạn là chuyên gia...",
  "primaryProvider": "openai",
  "primaryApiKey": "sk-...",
  "secondaryProvider": "gemini",
  "secondaryApiKey": "AIza...",
  "enabled": true,
  "maxMessagesPerSession": 25
}
```

**Response** `200`:
```json
{ "message": "Đã cập nhật cấu hình" }
```

**Error**: `400` if API key validation fails.

---

### GET `/ai/admin/sessions`

List chat sessions with message counts (admin analytics).

**Query params**: `?page=1&limit=20&from=2026-03-01&to=2026-03-20`

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "messageCount": 8,
      "productContext": "Thuốc trừ sâu ABC",
      "createdAt": "2026-03-20T10:00:00Z"
    }
  ],
  "total": 150,
  "page": 1
}
```

### GET `/ai/admin/sessions/:id`

Get full chat session with messages.

**Response**:
```json
{
  "id": "uuid",
  "messages": [
    { "role": "user", "content": "...", "createdAt": "..." },
    { "role": "assistant", "content": "...", "sources": [...], "createdAt": "..." }
  ]
}
```
