# Feature Specification: POS Multi-Cart Management

**Feature Branch**: `007-pos-multi-cart`  
**Created**: 2026-04-05  
**Status**: Draft  
**Input**: User description: "có 1 case là có thể có nhiều khách hàng mua 1 lúc , do đó tôi muôn có thể quản lý được phần này. ví dụ khách A vào mua 2 sản phẩm, xong lại tìm sản phẩm khác, khác b vào mua => cần phải tạo thêm 1 giỏ mới. sau khi khách b xong thì phải swtich lại giỏ của khách A. ngoài ra khi f5 tôi ko muốn bị mất thông tin giỏ hiện tại"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Multiple Concurrent Carts (Priority: P1)

As a cashier, I want to be able to create and switch between multiple active carts, so that I can serve a new customer while a previous customer is still deciding on their products without losing their selected items.

**Why this priority**: Core requirement for accelerating retail checkout process. Handling concurrent customers prevents line blocking.

**Independent Test**: Can be fully tested by creating two carts, adding different items to each, and switching back and forth to verify that the items in each cart remain isolated and accurate.

**Acceptance Scenarios**:

1. **Given** an active cart with items for Customer A, **When** I click "New Cart", **Then** a new empty cart is created and becomes the active cart.
2. **Given** multiple active carts in the system, **When** I select a specific cart from the cart list/tabs, **Then** that cart becomes active and its items are displayed correctly.
3. **Given** multiple active carts, **When** I complete the checkout for the currently active cart, **Then** that cart is cleared/closed, and I am automatically switched to the next available cart (or a new empty one if none remain).
4. **Given** an active cart, **When** I decide to cancel the order, **Then** I can completely remove this cart from the list.

---

### User Story 2 - Cart Persistence Across Reloads (Priority: P1)

As a cashier, I want my active carts and their contents to persist if the browser is accidentally refreshed or closed, so that I don't lose unpaid order data.

**Why this priority**: Essential to prevent data loss and frustration during checkout, especially on unstable devices or networks.

**Independent Test**: Can be fully tested by adding items to a cart, refreshing the page (F5), and verifying that the cart and its contents are exactly as they were before the refresh.

**Acceptance Scenarios**:

1. **Given** I have an active cart with items, **When** I refresh the browser, **Then** the cart and its items are restored upon page load.
2. **Given** I have multiple open carts, **When** I refresh the browser, **Then** all carts are restored and the previously active cart remains active.

---

### Edge Cases

- What happens if the maximum number of allowed concurrent carts is reached? (Prevent creating new carts, show error)
- How does the system handle persistence if the browser clears local storage? (Fallback to a default empty cart gracefully)
- What happens to a cart when its associated products are modified (price changed) while the cart is held? (Should refresh price or use held price? Assuming current POS logic applies).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow the user to create a new empty cart at any time without discarding existing uncompleted carts.
- **FR-002**: System MUST provide a UI mechanism to switch between all currently active carts.
- **FR-003**: System MUST isolate cart states (items, quantities, attached customer) so that activity in one cart does not affect another.
- **FR-004**: System MUST persist cart data (including multiple carts and active cart index) locally across browser reloads.
- **FR-005**: System MUST allow removing/cancelling a specific held cart.
- **FR-006**: System MUST limit the number of open carts to a maximum of 5 concurrent carts to prevent UI clutter and ensure performance.

### Key Entities

- **Cart Session**: Represents a single checkout instance. Includes Cart Items and attached Customer ID.
- **Cart Manager**: Manages the collection of all Cart Sessions and tracks the currently active session.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Cashiers can switch between held carts in under 0.5 seconds.
- **SC-002**: Page refresh completely restores all carts state within 1 second of the app UI loading.
- **SC-003**: Zero data loss for items added to cart when browser is refreshed or closed.
