# Tasks: ACL + Admin Account Management (FR-016) — ✅ COMPLETE

## Phase 1: Backend — RolePermission Entity + Registration
- [x] T001 Created `RolePermission` entity with role/module/CRUD booleans
- [x] T002 Registered entity in auth module TypeORM imports
- [x] T003 Seeded default permissions (ADMIN=full, CASHIER/INVENTORY=limited)

## Phase 2: Backend — Permissions Guard + Service + Controller
- [x] T004 Created `PermissionsService` with check/update/getAll methods
- [x] T005 Created `PermissionsGuard` + `@RequirePermission()` decorator
- [x] T006 Created `AdminUsersController` — user CRUD + permission matrix API
- [x] T007 Registered all in auth module (controllers, providers, exports)

## Phase 3: Frontend — Admin Accounts Page
- [x] T008 Created `AccountsClient` — two-tab UI (Users + Permissions)
- [x] T009 Created `/admin/accounts` server page
- [x] T010 Added "Tài khoản" nav item with Shield icon

## Phase 4: Polish
- [x] T011 Build verification — zero errors ✅
- [x] T012 All routes compiled ✅
