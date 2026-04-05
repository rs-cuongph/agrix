# Research: Sidebar Menu Grouping

## Findings

1. **Current Implementation**: The `AdminSidebar` currently uses a flat `navItems` array mapped to render `<Link>` components styled with Tailwind CSS. It extracts a `visibleItems` subset based on role and permissions.
2. **Icons**: Uses `lucide-react` icons. We can easily add a chevron icon (like `ChevronDown` and `ChevronUp`) to indicate expand/collapse behavior.
3. **State Management**: The sidebar is already a client component (`"use client"`). We can use `useState` to track which menu groups are currently expanded.
4. **URL matching**: The `active` state logic relies on `usePathname()`. With a grouped menu, the system will need to match the current path against the parent's children to keep the parent expanded and visually active, while also highlighting the specific active child.

**Decision**:
Refactor `navItems` into a hierarchical structure (some items have a `children` array while others do not). Track expanded groups using a standard `useState<string[]>` array in the `AdminSidebar` component.

**Rationale**:
Since `AdminSidebar` is already a client-side component holding authentication and routing logic, keeping the group expansion state locally ensures a simple and declarative implementation without needing third-party libraries for such a localized feature.

**Alternatives considered**:
Using `shadcn/ui` `Accordion` or `Collapsible` components. While robust, the sidebar's styles heavily rely on custom transparency/hover designs (`bg-white/10`, `text-white/60`). Managing the state manually gives the most direct control over the animations and appearance of these specific links.
