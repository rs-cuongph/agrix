# Phase 0: Research — Agrix Core Platform

**Date**: 2026-03-19
**Feature**: [spec.md](spec.md)

## Research Topics & Decisions

### 1. Offline Sync Strategy for Flutter + NestJS

**Decision**: Implement a **queue-based idempotent sync** using Drift (SQLite) on mobile and a dedicated `/sync` endpoint on NestJS.

**Rationale**:
- Each offline transaction gets assigned a UUID (`idempotencyKey`) at creation time on the client.
- When online, the app's `SyncEngine` sends queued transactions to `POST /api/v1/sync/orders`.
- The server checks `idempotencyKey` against a `processed_sync_keys` table. If already processed → skip (return success). If new → process and record.
- This guarantees zero duplicate orders even if the sync request is retried or network flickers.

**Alternatives considered**:
- **CRDTs (Conflict-free Replicated Data Types)**: Powerful but overkill for a single-store POS. Complexity not justified.
- **Timestamp-based last-write-wins**: Risky for financial data since clock skew between tablets can cause data loss.

---

### 2. Dynamic Unit Conversion Arithmetic

**Decision**: Store all inventory quantities in the **smallest base unit** (e.g., "Chai"/Bottle is base). Conversion factors are stored per product.

**Rationale**:
- Arithmetic on integers (base units) avoids all floating-point precision issues.
- Display logic converts base units → user-selected display unit (e.g., 397 Bottles → "9 Thùng, 37 Chai").
- Pricing is calculated as: `baseUnitPrice * quantity_in_base_units`.

**Alternatives considered**:
- **Store in original import unit + fractional fields**: Complex to query, prone to rounding errors.
- **Decimal fields with precision**: PostgreSQL `NUMERIC` handles this, but integer base-unit is simpler and more universally safe on both SQLite and PostgreSQL.

---

### 3. AI Chatbot Architecture (RAG)

**Decision**: Use **OpenAI Embeddings + pgvector** for vector storage, with LangChain.js on NestJS for the RAG pipeline.

**Rationale**:
- `pgvector` extends the existing PostgreSQL database — no new infra needed.
- Admin uploads PDF/text documents → NestJS chunks them → generates embeddings → stores in `knowledge_embeddings` table.
- On query, the system retrieves top-K relevant chunks and passes them as context to GPT-4/Gemini for answer generation.
- Product-specific queries automatically include the product's own metadata (name, usage instructions) as extra context.

**Alternatives considered**:
- **Pinecone/Weaviate (managed vector DB)**: More scalable but adds external dependency and cost. pgvector is sufficient for <10K documents.
- **In-memory FAISS**: Fast but not persistent across restarts and can't be shared across multiple NestJS instances.

---

### 4. Thermal Printer Integration

**Decision**: Use the `esc_pos_utils` + `esc_pos_bluetooth` + `esc_pos_printer` Flutter packages for ESC/POS over Bluetooth and Wi-Fi/LAN.

**Rationale**:
- ESC/POS is the universal protocol for POS58/POS80 thermal printers.
- `esc_pos_bluetooth` handles Bluetooth discovery and connection.
- For Wi-Fi/LAN printers, raw TCP socket connection to the printer's IP:9100 using `esc_pos_printer`.
- Both share the same `esc_pos_utils` for formatting receipts (text alignment, QR codes on bill, cut commands).

**Alternatives considered**:
- **Platform channels with native Android printing SDK**: Maximum control but significantly more code and no iOS portability.
- **CUPS/OS-level printing**: Not suitable for raw thermal receipt formatting.

---

### 5. VietQR Payment Integration

**Decision**: Generate VietQR codes client-side using the NAPAS standard (VietQR format) with the `qr_flutter` package.

**Rationale**:
- VietQR follows the EMV QR Code standard. The QR payload encodes: bank BIN, account number, amount, and transaction description.
- No external API call needed — the QR is generated entirely on-device from pre-configured bank account details (stored in app settings).
- The cashier displays the QR on tablet screen for the customer to scan with their banking app.

**Alternatives considered**:
- **Payment gateway integration (VNPay, MoMo)**: Requires merchant registration, API keys, and transaction fees. Overkill for a simple "show QR to scan" workflow.

---

### 6. Monorepo Tooling

**Decision**: Use **Melos** for Dart/Flutter packages and **npm workspaces** for TypeScript packages.

**Rationale**:
- `melos` is the standard monorepo manager for Flutter/Dart. It handles inter-package dependencies, versioning, and running scripts across all packages.
- `npm workspaces` (built into npm 7+) manages the NestJS backend + Next.js web-base + shared TypeScript types without extra tooling (no Nx/Turborepo needed at this scale).

**Alternatives considered**:
- **Nx monorepo**: Powerful but heavy. Overkill for 2 TypeScript apps at this stage.
- **Turborepo**: Good caching but adds complexity. npm workspaces are sufficient.
