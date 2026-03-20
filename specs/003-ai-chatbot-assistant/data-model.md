# Data Model: AI Chatbot Assistant

**Branch**: `003-ai-chatbot-assistant` | **Date**: 2026-03-20

## Entities

### KnowledgeDocument (MODIFY existing)

Existing entity at `apps/backend/src/ai/entities/knowledge-document.entity.ts`

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| id | UUID | PK, auto-generated | Existing |
| filename | string | NOT NULL | Existing |
| mimeType | string | NOT NULL | Existing |
| fileSize | number | NOT NULL | **NEW** — bytes |
| status | enum | NOT NULL, default 'PROCESSING' | **NEW** — PROCESSING / READY / ERROR |
| statusMessage | string | NULLABLE | **NEW** — error detail |
| chunkCount | number | default 0 | Existing |
| uploadedBy | string | NOT NULL | Existing |
| storageKey | string | NULLABLE | **NEW** — MinIO key for original file |
| createdAt | timestamp | auto | Existing |
| updatedAt | timestamp | auto | Existing |

### KnowledgeEmbedding (MODIFY existing)

Existing entity at `apps/backend/src/ai/entities/knowledge-embedding.entity.ts`

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| id | UUID | PK | Existing |
| documentId | UUID | FK → KnowledgeDocument | Existing |
| chunkIndex | number | NOT NULL | Existing |
| content | text | NOT NULL | Existing |
| embedding | vector(1536) | NULLABLE | **MODIFY** — change from JSON array to pgvector |

### ChatSession (NEW)

New entity at `apps/backend/src/ai/entities/chat-session.entity.ts`

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| id | UUID | PK, auto-generated | |
| productId | UUID | FK → Product, NULLABLE | Product context if started from product page |
| productContext | text | NULLABLE | Cached product info at chat start |
| messageCount | number | default 0 | For enforcing session limit |
| ipAddress | string | NULLABLE | For rate limiting |
| createdAt | timestamp | auto | |
| updatedAt | timestamp | auto | |

**Retention**: Auto-delete after 30 days via CRON job.

### ChatMessage (NEW)

New entity at `apps/backend/src/ai/entities/chat-message.entity.ts`

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| id | UUID | PK, auto-generated | |
| sessionId | UUID | FK → ChatSession, CASCADE | |
| role | enum | NOT NULL | 'user' / 'assistant' |
| content | text | NOT NULL | |
| sources | jsonb | NULLABLE | Array of `{documentId, chunkIndex, snippet}` |
| createdAt | timestamp | auto | |

### ChatbotConfig (NEW)

New entity at `apps/backend/src/ai/entities/chatbot-config.entity.ts`

Singleton pattern — only one row in table.

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| id | UUID | PK | Single row |
| systemPrompt | text | NOT NULL | Default agricultural prompt |
| primaryProvider | enum | NOT NULL, default 'openai' | 'openai' / 'gemini' |
| primaryApiKey | string | NULLABLE, encrypted | AES-256 encrypted |
| secondaryProvider | enum | NULLABLE | Fallback provider |
| secondaryApiKey | string | NULLABLE, encrypted | AES-256 encrypted |
| enabled | boolean | default true | Toggle chatbot visibility |
| maxMessagesPerSession | number | default 20 | Configurable soft limit |
| createdAt | timestamp | auto | |
| updatedAt | timestamp | auto | |

## Relationships

```
ChatSession 1 ──── N ChatMessage (cascade delete)
ChatSession N ──── 1 Product (optional, nullable)
KnowledgeDocument 1 ──── N KnowledgeEmbedding (cascade delete)
ChatbotConfig (singleton — 1 row)
```

## State Transitions

### KnowledgeDocument.status

```
PROCESSING → READY   (document chunks + embeddings generated successfully)
PROCESSING → ERROR   (text extraction or embedding generation failed)
ERROR → PROCESSING   (admin re-uploads or retries)
READY → (deleted)    (admin removes document)
```
