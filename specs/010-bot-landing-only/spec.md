# Feature Specification: Chatbot Rate Limiting by Source

**Feature Branch**: `010-bot-landing-only`  
**Created**: 2026-04-05  
**Status**: Draft  
**Input**: User description: "ở phần trợ lý bot thì hiện tịa đang giới hạn 5 đoạn hội thoại 1 phiên. tôi muốn api chỉ bắt khi chat ở landing page. ko bắt ở pos và admin (nếu có)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bypass Chat Limit on Internal Systems (Priority: P1)

As a POS staff member or admin, I want to use the AI chatbot without any session limits, so that I can continually ask questions and get assistance throughout my long shifts without having to restart the session or refresh the page constantly.

**Why this priority**: Core requirement. The staff needs uninterrupted assistance, unlike public consumers who are limited to prevent abuse.

**Independent Test**: Can be fully tested by opening the chatbot in the POS or Admin page, sending more than 5 messages, and verifying that the API doesn't block the 6th message.

**Acceptance Scenarios**:

1. **Given** I am logged into the POS or Admin interface, **When** I send my 6th message to the bot in a single session, **Then** the bot processes and responds without throwing a limit-exceeded error.
2. **Given** I am on the POS interface, **When** I start a chat, **Then** the chat API identifies the source correctly and applies the bypass logic.

---

### User Story 2 - Maintain Chat Limit on Landing Page (Priority: P1)

As a system owner, I want the AI chatbot to continue limiting public users on the landing page to 5 messages per session, so that I can prevent abuse, spam, and excessive API usage costs from anonymous users.

**Why this priority**: Crucial for cost control and preventing malicious abuse of the OpenAI endpoints.

**Independent Test**: Can be tested by opening the landing page in an incognito window, sending 5 messages, and verifying the 6th message is blocked by the system with a limit error.

**Acceptance Scenarios**:

1. **Given** I am an anonymous user on the Landing Page, **When** I send my 6th message in a single session, **Then** the API returns a 400 Bad Request error stating "Đã đạt giới hạn tin nhắn...".

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Frontend Chat Widget MUST send contextual information (e.g., `source: 'landing' | 'pos' | 'admin'`) with each chat request to the `/api/chat` proxy.
- **FR-002**: The Next.js API proxy (`/api/chat/route.ts`) MUST forward this source context to the proxy backend `/ai/public/chat`.
- **FR-003**: The Backend API (`ChatSessionService`) MUST evaluate the source context; if the source is `pos` or `admin`, it MUST bypass the 5-message per session limit.
- **FR-004**: If the source context is `landing` (or unspecified), the backend MUST continue enforcing the limit defined by `config.maxMessagesPerSession`.

### Key Entities

- **ChatMessage / ChatSession**: The data flow must allow passing a source flag down to the limit validation logic.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users on the landing page are blocked exactly on their `maxMessagesPerSession + 1` attempt.
- **SC-002**: POS and Admin users can send 100+ messages in a single continuous session without interruption.
- **SC-003**: Zero regressions in general chat functionality (responses, SSE streaming, performance) for all users.
