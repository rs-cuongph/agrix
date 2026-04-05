# Research: Chatbot Rate Limiting by Source

**Branch**: `010-bot-landing-only` | **Date**: 2026-04-05

## Research Tasks & Findings

### 1. Where is the session limit enforced?

**Task**: Identify exact code location of the 5-message limit.

**Decision**: The limit is enforced in `ChatSessionService.addUserMessage()` at line 52 of `apps/backend/src/ai/chat-session.service.ts`.

**Rationale**: The check `session.messageCount >= config.maxMessagesPerSession * 2` compares the session's total message count (user + assistant, hence `*2`) against the configured max. This is the single enforcement point — bypassing it here covers all cases.

### 2. How to identify the source context?

**Task**: Determine the best way to pass the source from the frontend to the backend.

**Decision**: Add an optional `source` field to the `AskDto` and the JSON body sent from `chat-context.tsx`. The frontend derives `source` from `window.location.pathname` using the existing `usePathname()` hook in the chat context/widget.

**Rationale**:
- Simple: adds 1 optional field to an existing DTO.
- Safe: the field defaults to `'landing'` if omitted, so existing callers (if any) are unaffected.
- No auth needed: `source` is a hint, not a security boundary. The rate limit protects against cost abuse from anonymous public users; POS/admin users are already authenticated separately.

**Alternatives considered**:
- Using JWT token presence to detect internal users → Rejected because the chat endpoint is public (no auth guard). Would require restructuring the entire auth flow.
- Separate endpoints for internal vs public chat → Rejected because it duplicates logic. A single `source` field is much simpler.

### 3. Security implications of a client-sent `source` field

**Task**: Can a malicious landing page user spoof `source: 'pos'` to bypass the limit?

**Decision**: Acceptable risk. The rate limit exists primarily for cost control, not security. A determined attacker could bypass it anyway by clearing cookies/sessions. The IP-based rate limit (10 messages/minute) still applies universally regardless of source.

**Rationale**:
- The `source` field is a soft hint, not a hard security boundary.
- The IP rate limit (10 msg/min) is the real abuse prevention mechanism and remains enforced.
- If stronger enforcement is needed in the future, the source can be validated server-side using JWT presence (for POS/admin routes that do have auth).

### 4. Data flow and propagation path

**Task**: Trace the full path from UI click to limit check.

**Decision**: The field flows through 4 touchpoints:

```
ChatProvider.sendMessage()     → adds `source` to POST body
  ↓
/api/chat/route.ts (proxy)     → forwards `source` in body to backend
  ↓
AIController.publicChat()      → receives `source` from AskDto
  ↓
ChatSessionService.addUserMessage() → checks `source`, skips limit if not 'landing'
```

**Rationale**: Minimal code changes at each layer. No database schema changes needed since `source` is a transient request parameter, not persisted.

## All NEEDS CLARIFICATION: Resolved ✅
