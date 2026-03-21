# Quickstart: AI Chatbot Assistant

**Branch**: `003-ai-chatbot-assistant`

## Prerequisites

1. PostgreSQL running with pgvector extension enabled
2. MinIO running for document storage
3. OpenAI API key and/or Google Gemini API key

## Setup Steps

### 1. Enable pgvector in PostgreSQL

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Or add to Docker init script (`docker/init.sql`):
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Install new backend dependencies

```bash
cd apps/backend
npm install pdf-parse mammoth @google/generative-ai pgvector
```

### 3. Run database migration

```bash
cd apps/backend
npm run migration:generate -- -n AddAIChatbot
npm run migration:run
```

### 4. Configure environment

Add to `apps/backend/.env`:
```env
# AI Provider (configure via admin UI after deployment)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
```

### 5. Start development

```bash
# From repo root
npm run docker:up     # Start PostgreSQL + MinIO
npm run backend:dev   # Start NestJS backend
npm run web:dev       # Start Next.js frontend
```

### 6. Access

- **Admin AI page**: http://localhost:3002/admin/ai-assistant
- **Chat widget**: Visible on all public pages (http://localhost:3002)
- **API docs**: http://localhost:3001/api

## Verification

1. Go to Admin → Trợ lý AI
2. Configure API key(s) in the config tab
3. Upload a test document (PDF/TXT)
4. Wait for status to change to "Sẵn sàng"
5. Open Landing Page → click chat bubble
6. Ask a question related to the uploaded document
7. Verify streaming response with source references
