# Implementation Plan: ACL + Admin Account Management (FR-016)

**Branch**: `001-agrix-core-platform` | **Date**: 2026-03-20
**Input**: FR-016 — RBAC + Module ACL for admin account management

## Summary

Add module-level permissions (ACL) to existing RBAC system and a new `/admin/accounts` page for managing admin users and their permissions. The existing `User` entity already serves as admin accounts — no new AdminUser entity needed.

## Technical Context — Existing Auth System

**Already exists:**
- ✅ `User` entity: id, username, passwordHash, fullName, role (ADMIN|CASHIER|INVENTORY), isActive
- ✅ `AuthService`: login, createUser (with bcrypt hashing)
- ✅ `RolesGuard`: checks `user.role` against `@Roles()` decorator
- ✅ JWT strategy: extracts user from token

**What's missing:**
- ❌ Module-level permissions per role (e.g., CASHIER can read Products but not edit Blog)
- ❌ Admin UI to manage users
- ❌ Admin UI to manage role-permission assignments

## Constitution Check

| Gate | Status |
|------|--------|
| II. Monorepo | ✅ PASS |
| III. Modular Monolith | ✅ PASS — extends auth module |
| IV. Security | ✅ PASS — bcrypt passwords, JWT auth, module ACL |

## Proposed Changes

### Phase 1: Backend — RolePermission Entity + Seed

#### [NEW] `apps/backend/src/auth/entities/role-permission.entity.ts`
- Entity: `role_permissions` table
- Fields: `id`, `role` (UserRole enum), `module` (string enum), `canRead`, `canCreate`, `canEdit`, `canDelete`
- Unique constraint on (role, module)

#### [MODIFY] [auth.module.ts](file:///Users/cuongph/Workspace/agrix/apps/backend/src/auth/auth.module.ts)
- Register `RolePermission` entity in TypeORM

#### [MODIFY] [seed.ts](file:///Users/cuongph/Workspace/agrix/apps/backend/src/database/seeds/seed.ts)
- Seed default permissions: ADMIN=full access, CASHIER=read products+orders, INVENTORY=read/edit products+stock

---

### Phase 2: Backend — Permissions Guard + Service

#### [NEW] `apps/backend/src/auth/guards/permissions.guard.ts`
- `@Permissions('products', 'canEdit')` decorator
- Guard checks user's role against `role_permissions` table
- ADMIN role bypasses all checks (superadmin)

#### [NEW] `apps/backend/src/auth/permissions.service.ts`
- `getPermissionsForRole(role)` — returns all module permissions
- `updatePermission(role, module, permissions)` — updates specific permission
- `getAllPermissions()` — returns role-permission matrix

#### [NEW] `apps/backend/src/auth/admin-users.controller.ts`
- `GET /admin-users` — list all users (without password)
- `POST /admin-users` — create new user
- `PUT /admin-users/:id` — update user (role, fullName, isActive)
- `DELETE /admin-users/:id` — deactivate user
- `GET /admin-users/permissions` — get full permission matrix
- `PUT /admin-users/permissions/:role` — update permissions for a role

---

### Phase 3: Frontend — Admin Accounts Page

#### [NEW] `apps/web-base/src/components/admin/accounts-client.tsx`
- Users table + CRUD (Create/Edit/Toggle Active)
- Permission matrix editor: checkboxes per module × action

#### [NEW] `apps/web-base/src/app/admin/accounts/page.tsx`
- Server component fetching users + permissions

#### [MODIFY] [sidebar.tsx](file:///Users/cuongph/Workspace/agrix/apps/web-base/src/components/admin/sidebar.tsx)
- Add "Tài khoản" nav item with Shield icon

## Data Model

### RolePermission
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | PK |
| role | ENUM(ADMIN,CASHIER,INVENTORY) | FK to UserRole |
| module | VARCHAR | products, orders, customers, blog, settings, units |
| canRead | BOOLEAN | default true |
| canCreate | BOOLEAN | default false |
| canEdit | BOOLEAN | default false |
| canDelete | BOOLEAN | default false |

### Default Permissions Seed

| Role | Products | Orders | Customers | Blog | Settings | Units |
|------|----------|--------|-----------|------|----------|-------|
| ADMIN | RCUD | RCUD | RCUD | RCUD | RCUD | RCUD |
| CASHIER | R--- | RC-- | RC-- | ---- | ---- | R--- |
| INVENTORY | RCU- | R--- | ---- | ---- | ---- | RCU- |

R=Read, C=Create, U=Update/Edit, D=Delete

## Verification Plan

- `npm run build` — zero errors
- Login as admin → see all modules
- Login as cashier → restricted to permitted modules
- Admin can create/edit users, toggle active, update role permissions
