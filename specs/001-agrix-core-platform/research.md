# Research: Web Admin Next.js Migration

## Decision 1: Auth Strategy for Admin Routes

**Decision**: Server-side middleware with JWT in httpOnly cookie
**Rationale**: Next.js middleware runs at the edge before page render, preventing unauthorized access at infrastructure level. httpOnly cookies prevent XSS token theft. Login goes through a Next.js API route that proxies to backend and sets the cookie.
**Alternatives Considered**:
- Client-side localStorage + useEffect guard → vulnerable to flash of unauthorized content
- BFF pattern with separate server → unnecessary complexity for single admin panel

## Decision 2: UI Component Library

**Decision**: shadcn/ui + Tailwind CSS
**Rationale**: Copy-paste components (not npm dependency), tree-shakeable, modern design. Provides DataTable, Form, Dialog, Card components out of the box — exactly what admin dashboards need.
**Alternatives Considered**:
- Ant Design → heavy bundle, opinionated styling hard to customize
- MUI → Google Material style but large dependency tree
- Custom CSS → too time-consuming for admin dashboard

## Decision 3: API Communication Pattern

**Decision**: Next.js Server Components fetch backend API directly (server-to-server); Client Components use Next.js API routes as proxy
**Rationale**: Server Components can fetch with the JWT from cookies directly. For mutations (create/update/delete), Client Components call Next.js API routes which forward to backend with the cookie JWT. This avoids CORS issues entirely for admin pages.
**Alternatives Considered**:
- Direct browser→backend calls → CORS issues, token in localStorage
- GraphQL gateway → overkill for existing REST API

## Decision 4: Flutter Web Admin Disposition

**Decision**: Keep but mark as deprecated
**Rationale**: Zero-risk rollback option. Can be removed after Next.js admin is verified stable.
**Alternatives Considered**:
- Delete immediately → no fallback
- Maintain both → double the maintenance cost
