# Research: ACL + Admin Account Management

## Decision 1: Reuse User Entity vs New AdminUser Entity

**Decision**: Reuse existing `User` entity — it already has username, password, role, isActive
**Rationale**: User entity IS the admin user entity. Creating a separate AdminUser would duplicate schema and auth logic. The `UserRole` enum (ADMIN, CASHIER, INVENTORY) already provides role distinction.
**Alternatives Considered**: New AdminUser entity — rejected as unnecessary duplication

## Decision 2: Permission Storage

**Decision**: `RolePermission` table with role → module → permissions mapping
**Rationale**: Flexible yet simple. Allows admin to customize what each role can do per module. Unique constraint on (role, module) prevents duplicates. Permissions are cached on login via JWT payload for performance.
**Alternatives Considered**:
- Hardcoded permissions — too rigid, can't be customized at runtime
- Full ACL with custom roles — overengineered for 3 fixed roles

## Decision 3: ADMIN Bypass

**Decision**: ADMIN role always has full access (superadmin), bypasses permission checks
**Rationale**: At least one role must always have full access to manage the system. Prevents lockout scenarios. Only CASHIER and INVENTORY roles are subject to ACL restrictions.
