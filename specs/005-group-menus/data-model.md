# Data Model: Group Sidebar Menus

## Overview

No new database models or backend entities are introduced by this feature. The modifications are purely frontend UI components.

## Interface Types (React)

To support nested hierarchical menus, the internal data structure for navigation items will evolve as follows:

```typescript
type Permission = {
  module: string;
  canRead: boolean;
};

// Represents a child item under a menu group
interface NavItemChild {
  href: string;
  label: string;
  icon: React.ElementType;
  module: string | null;
}

// Represents either a standalone link or a group with children
interface NavItemGroup {
  label: string;
  icon: React.ElementType;
  href?: string;
  module?: string | null;
  children?: NavItemChild[];
}
```
