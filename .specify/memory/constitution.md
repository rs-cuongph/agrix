<!-- Sync Impact Report
Version change: 0.0.0 → 1.0.0
Modified principles: None (Initial Ratification)
Added sections: 
- I. Mobile-First & Offline-First
- II. Monorepo Architecture
- III. Scalable Core
- IV. Traceability & Financial Accuracy
- V. Simple & Intuitive UI
- Technical Constraints
- Development Workflow
Removed sections: None
Templates requiring updates: 
- ⚠ .specify/templates/plan-template.md
- ⚠ .specify/templates/spec-template.md
- ⚠ .specify/templates/tasks-template.md
Follow-up TODOs: Implement automated testing requirements.
-->

# Agrix Constitution

## Core Principles

### I. Mobile-First & Offline-First
The application must function reliably without an internet connection using local SQLite storage. All offline actions must gracefully queue and perform seamless background synchronization (Idempotency) once the network is restored, guaranteeing zero data loss.

### II. Monorepo Architecture
All source code (Flutter Mobile App, Next.js/Flutter Web, and NestJS Backend) must reside in a single repository. This ensures maximum code reusability (especially shared DTOs or logic) and provides a unified CI/CD context for the entire platform.

### III. Scalable Core (Modular Monolith)
The backend starts as a modular monolith in NestJS to minimize initial operational overhead. However, domain boundaries (Inventory, Auth, Orders) MUST remain strictly decoupled so they can easily be split into microservices in the future if scaling is required.

### IV. Traceability & Financial Accuracy
All inventory modifications and financial transactions must be precisely traceable. The system must enforce robust mechanisms for unit conversions (e.g., dynamically converting 'Boxes' to 'Bottles' accurately) and strict Role-Based Access Control (RBAC) to ensure security.

### V. Simple & Intuitive UI
The user interface must prioritize operational speed and clarity. It must adhere to Clean & Minimalist Material Design 3 principles, relying on ample negative space, unambiguous color coding (Emerald Green for primary actions), and support for hardware (EAN-13 Barcode scanners, thermal Bluetooth printers).

## Technical & Infrastructure Constraints

- **Backend**: NestJS (Node.js) with PostgreSQL as the primary RDBMS.
- **Frontend**: Flutter for Mobile (Android/iOS) and Web Admin; Next.js for the Web Base (Landing/SEO).
- **Storage & Deployment**: MinIO for self-hosted S3-compatible object storage. Everything must be fully containerized using Docker and orchestrated via Docker Compose.
- **AI Integration**: Chatbot and analytical features must leverage OpenAI (GPT-4) or Gemini APIs, anchored securely with local Retrieval-Augmented Generation (RAG) context.

## Development Workflow & Code Quality

- **Testing**: All Pull Requests addressing offline synchronization or financial transactions MUST pass automated unit and integration tests prior to merging.
- **Code Reviews**: Business logic altering inventory arithmetic or user permissions requires at least one peer review.

## Governance

The strict architectural guidelines regarding the offline-first sync mechanism and the monorepo structure supersede generic coding practices.
Any amendments to these core rules (e.g., splitting the monorepo, changing the primary datastore) require formal documentation, impact analysis on the background sync worker, and approval from the lead engineer.

**Version**: 1.0.0 | **Ratified**: 2026-03-19 | **Last Amended**: 2026-03-19
