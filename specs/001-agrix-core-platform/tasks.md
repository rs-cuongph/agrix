# Tasks: ACL + Admin Account Management (FR-016)

**Input**: [plan.md](file:///Users/cuongph/Workspace/agrix/specs/001-agrix-core-platform/plan.md), [spec.md](file:///Users/cuongph/Workspace/agrix/specs/001-agrix-core-platform/spec.md)

## Format: `[ID] [P?] [Story?] Description`

---

## Phase 1: Backend — RolePermission Entity + Registration

**Goal**: Create module-level permission data model

- [ ] T001 Create `RolePermission` entity with role, module, canRead/canCreate/canEdit/canDelete in `apps/backend/src/auth/entities/role-permission.entity.ts`
- [ ] T002 Register `RolePermission` entity in TypeORM imports in `apps/backend/src/auth/auth.module.ts`
- [ ] T003 Seed default permissions (ADMIN=full, CASHIER=limited, INVENTORY=limited) in `apps/backend/src/database/seeds/seed.ts`

**Checkpoint**: Backend starts, `role_permissions` table created with seed data

---

## Phase 2: Backend — Permissions Guard + Service + Controller

**Goal**: Permission checking + admin user management API

- [ ] T004 Create `PermissionsService` with getForRole, updatePermission, getAllPermissions in `apps/backend/src/auth/permissions.service.ts`
- [ ] T005 Create `@Permissions()` decorator + `PermissionsGuard` in `apps/backend/src/auth/guards/permissions.guard.ts`
- [ ] T006 Create `AdminUsersController` (GET/POST/PUT/DELETE users + GET/PUT permissions) in `apps/backend/src/auth/admin-users.controller.ts`
- [ ] T007 Register PermissionsService, AdminUsersController, PermissionsGuard in `apps/backend/src/auth/auth.module.ts`

**Checkpoint**: `GET /admin-users` and `GET /admin-users/permissions` return data via curl

---

## Phase 3: Frontend — Admin Accounts Page

**Goal**: UI to manage users and permissions

- [ ] T008 Create `AccountsClient` component (users table + permission matrix) in `apps/web-base/src/components/admin/accounts-client.tsx`
- [ ] T009 Create accounts page (server component) in `apps/web-base/src/app/admin/accounts/page.tsx`
- [ ] T010 Add "Tài khoản" nav item with Shield icon in `apps/web-base/src/components/admin/sidebar.tsx`

**Checkpoint**: `/admin/accounts` page shows users list + permission checkboxes

---

## Phase 4: Polish

- [ ] T011 Run `cd apps/web-base && npm run build` — verify zero errors
- [ ] T012 Test: create user, toggle active, update permission matrix

---

## Dependencies

```text
T001 → T002 → T003 (sequential: entity → register → seed)
T004, T005 → parallel after T003
T006 → after T004, T005
T007 → after T006
T008, T009, T010 → parallel after T007 (frontend independent)
T011, T012 → after all above
```

## Implementation Strategy

**MVP**: T001-T007 (backend complete with API)
**Full**: T008-T012 (frontend + verification)
