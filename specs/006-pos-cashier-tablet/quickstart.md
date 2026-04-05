# Quick Start: POS Cashier Tablet App

## Prerequisites

1. Backend API is running: `npm run backend:dev`
2. Web frontend is running: `npm run web:dev`
3. A user account exists with ADMIN or sales role

## How to Access

1. Open Chrome on tablet (or desktop browser at tablet resolution)
2. Navigate to `http://localhost:3001/pos` (or your deployed URL)
3. Login with your Agrix credentials

## How to Test Each Feature

### US1: Search & Add Products
1. Type a product name in the large search bar at the top
2. Verify results appear in < 0.5 seconds
3. Tap a product card to add it to the cart (right panel)
4. If the product has multiple units, verify the unit picker dialog appears

### US2: Cart Management
1. In the cart panel, tap "+" to increase quantity
2. Tap "-" to decrease (minimum 1 before removal)
3. Swipe left or tap trash icon to remove
4. Verify total amount updates in real-time (large text at bottom)

### US3: Checkout
1. Tap the large "Thanh toán" button at the bottom of the cart
2. Choose "Tiền mặt" — enter amount paid, verify change calculation
3. Choose "Chuyển khoản" — verify VietQR code displays correctly
4. Confirm payment — verify success animation and cart reset

### US4: Customer Attachment
1. Tap "Khách hàng" area above the cart
2. Search by name or phone
3. Select a customer — verify name and debt display
4. For partial payment — verify debt is recorded

### US5: Category Filter
1. Tap category tabs above the product grid
2. Verify product list filters to selected category
3. Combine with search term and verify combined filtering

### US6: Print Receipt (Phase 2)
1. After successful checkout, tap "In hóa đơn"
2. Browser print dialog should appear (or direct print if configured)

### US7: Order History
1. Tap the clock/history icon in the header
2. Verify today's orders are listed
3. Tap an order to see detail in bottom sheet

## Tablet Testing

- Chrome DevTools: Toggle device toolbar → Select "iPad Pro" or custom 1280x800
- Real tablet: Open Chrome, navigate to the POS URL
- Test landscape orientation specifically (POS is optimized for landscape)
