# Feature Specification: Group Sidebar Menus

**Feature Branch**: `005-group-menus`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "các menu cần xem xét gom lại thành sub menu"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find and navigate to admin modules efficiently (Priority: P1)

As an admin user, I want related sidebar menus to be grouped into submenus so that I can easily navigate the admin panel without being overwhelmed by a long list of options.

**Why this priority**: A cluttered sidebar degrades the user experience and slows down navigation in the admin panel. Grouping menus is the core value of this feature.

**Independent Test**: Can be fully tested by opening the admin panel, clicking on a parent menu item, and verifying that the correct submenus are revealed and navigable.

**Acceptance Scenarios**:

1. **Given** the admin sidebar is loaded, **When** I view the sidebar, **Then** I should see top-level grouped menu items instead of a flat list.
2. **Given** I am looking at the sidebar, **When** I click on a parent group (e.g., "Bán hàng"), **Then** it should expand to reveal its submenus (e.g., "Đơn hàng", "Khách hàng").
3. **Given** a parent group is already expanded, **When** I click it again, **Then** it should collapse its submenus.

---

### Edge Cases

- What happens when a user navigates to a URL of a submenu directly? (The parent menu should automatically be expanded in the sidebar).
- How does the system handle responsive design? (Grouping should remain accessible and navigable on mobile/tablet screens in off-canvas mode).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display the admin sidebar with categorized parent menu items.
- **FR-002**: System MUST allow parent menu items to be expandable/collapsible to reveal/hide their respective submenus.
- **FR-003**: System MUST group the existing menus into the following specific categories: Cửa hàng (Đơn hàng, Khách hàng, Kho hàng, Đánh giá), Nội dung / Web (Blog, FAQ, Liên hệ), Hệ thống (Cài đặt, Trợ lý AI). The "Tổng quan" menu remains as a standalone top-level item.
- **FR-004**: System MUST automatically expand the relevant parent menu when a user directly accesses a child page via URL.
- **FR-005**: System MUST visualy highlight both the expanded parent group and the selected child menu to indicate current location.

### Assumptions

Based on typical admin panel structures, we propose the following reasonable default grouping:
- **Tổng quan** (Standalone)
- **Cửa hàng**: Đơn hàng, Khách hàng, Kho hàng, Đánh giá
- **Nội dung / Web**: Blog, FAQ, Liên hệ
- **Hệ thống**: Cài đặt, Trợ lý AI

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sidebar vertical space usage is reduced when menus are collapsed, allowing it to fit on a 1080p screen without scrolling.
- **SC-002**: Users can navigate between any two distinct features with no more than 2-3 clicks.
- **SC-003**: 100% of existing admin functionalities remain accessible via the new grouped menu structure.
