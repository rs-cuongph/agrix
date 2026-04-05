# Data Model: Chatbot Rate Limiting by Source

**Branch**: `010-bot-landing-only` | **Date**: 2026-04-05

## Schema Changes

**None.** This feature does not modify any database tables.

The `source` field is a transient request parameter passed through the API call chain. It is used only at the moment of limit checking and is **not persisted** anywhere.

## Existing Entities (No Changes)

### ChatSession (`chat_sessions` table)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID (PK) | Primary key |
| productId | VARCHAR (nullable) | Product context ID |
| productContext | TEXT (nullable) | Product context text |
| ipAddress | VARCHAR (nullable) | Client IP for rate limiting |
| messageCount | INT | Total messages in session (user + assistant) |
| createdAt | TIMESTAMP | Session creation time |

### ChatMessage (`chat_messages` table)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID (PK) | Primary key |
| sessionId | UUID (FK) | Parent session |
| role | ENUM(USER, ASSISTANT) | Message sender |
| content | TEXT | Message content |
| sources | JSONB (nullable) | RAG source references |
| createdAt | TIMESTAMP | Message creation time |

## Request DTO Change (In-Memory Only)

### AskDto (modified)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| question | string | Yes | User's question (max 2000 chars) |
| sessionId | string | No | Existing session ID |
| productId | string | No | Product context |
| **source** | **string** | **No** | **NEW: `'landing'` \| `'pos'` \| `'admin'` (default: `'landing'`)** |

## Logic Change

In `ChatSessionService.addUserMessage()`:

```diff
  // Check session message limit
+ // Skip limit for internal sources (POS, Admin)
+ if (source !== 'pos' && source !== 'admin') {
    if (session.messageCount >= config.maxMessagesPerSession * 2) {
      throw new BadRequestException(
        `Đã đạt giới hạn ${config.maxMessagesPerSession} tin nhắn cho phiên này.`,
      );
    }
+ }
```
