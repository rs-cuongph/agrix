# Research: AI Chatbot Assistant

**Branch**: `003-ai-chatbot-assistant` | **Date**: 2026-03-20

## R1: Vector Search with pgvector

**Decision**: Use pgvector extension for PostgreSQL  
**Rationale**: Already in the project's tech stack (PostgreSQL). No need for standalone vector DB (Pinecone, Qdrant). pgvector supports cosine similarity search natively.  
**Alternatives considered**: Pinecone (SaaS, adds vendor dependency), Qdrant (self-hosted, adds Docker container complexity), simple keyword search (current state — too imprecise)  
**Action**: Enable pgvector extension in Docker PostgreSQL, add `vector` column type to `KnowledgeEmbedding` entity.

## R2: Dual AI Provider (OpenAI + Gemini) with Fallback

**Decision**: Support both OpenAI and Google Gemini as configurable providers with automatic failover  
**Rationale**: Reduces downtime risk. Admin configures primary + secondary. On API error/timeout, system tries secondary provider transparently.  
**Alternatives considered**: Single provider only (simpler but single point of failure), manual switchover (bad UX during outage)  
**Action**: Create provider abstraction interface. Implement OpenAI and Gemini adapters. `ChatbotService` tries primary, catches error, retries with secondary.

## R3: Streaming Responses

**Decision**: Use Server-Sent Events (SSE) for streaming chat responses  
**Rationale**: SSE is simpler than WebSockets for unidirectional server→client streaming. Native browser support via `EventSource` or `fetch` with ReadableStream. NestJS supports SSE via `@Sse()` decorator.  
**Alternatives considered**: WebSockets (overkill for chat, adds complexity), polling (poor UX, latency), full response then display (bad UX — user waits 3-5s seeing nothing)  
**Action**: Backend returns SSE stream. Frontend consumes via `fetch` + `ReadableStream`. Display tokens as they arrive.

## R4: Document Processing (PDF, DOCX, TXT)

**Decision**: Use `pdf-parse` for PDF, `mammoth` for DOCX, raw `utf-8` for TXT  
**Rationale**: Lightweight npm packages, no external services needed. Handles >90% of admin document uploads.  
**Alternatives considered**: Apache Tika (heavy Java dependency), cloud-based extraction (adds latency + cost)  
**Action**: Add `pdf-parse` and `mammoth` to backend dependencies. Extract text → chunk → embed → store.

## R5: Embedding Generation

**Decision**: Use OpenAI `text-embedding-3-small` (or Gemini equivalent) for embeddings  
**Rationale**: Matches the AI provider already configured. 1536-dimension vectors, good quality/cost ratio.  
**Alternatives considered**: Local models (needs GPU), sentence-transformers (adds Python dependency)  
**Action**: Call embedding API during document upload. Store vectors in pgvector column. Use cosine similarity for search.

## R6: Chat Session Persistence

**Decision**: Store sessions in PostgreSQL with 30-day TTL, auto-cleanup via CRON  
**Rationale**: Simple, no additional infrastructure. Scheduled task deletes old records.  
**Alternatives considered**: Redis (ephemeral, not good for 30-day history), separate analytics DB (overkill for v1)  
**Action**: Create `ChatSession` + `ChatMessage` entities. Add NestJS `@Cron` job to delete sessions older than 30 days.

## R7: Public Chat API (No Auth)

**Decision**: Create separate public chat endpoints without JWT guard  
**Rationale**: Customers on Landing Page are not authenticated. Chat must be accessible without login. Rate limiting by IP/session prevents abuse.  
**Alternatives considered**: Anonymous JWT tokens (adds complexity), proxy through Next.js API route (current pattern — simpler)  
**Action**: Add public `/ai/public/chat` endpoint without `AuthGuard`. Apply rate limiting middleware. Next.js API route proxies to it.
