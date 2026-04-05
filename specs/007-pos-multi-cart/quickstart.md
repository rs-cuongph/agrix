# Quickstart: Testing POS Multi-Cart & Persistence

## Prerequisites
- The backend must be running: `npm run backend:dev`
- The frontend must be running: `npm run web-base:dev`
- Navigate to `http://localhost:3002/pos` and log in with PIN.

## Test 1: Managing Multiple Carts
1. Open the POS interface. You start with "Giỏ hàng 1".
2. Add a product to the cart.
3. Click the "Thêm giỏ" (New Cart) icon in the cart header.
4. Verify a new tab/cart named "Giỏ hàng 2" is created and activated.
5. Add a different product to the new cart.
6. Switch back to "Giỏ hàng 1". Verify the previous product is still there and the total is correct.
7. Attempt to create up to 5 carts. Verify the system blocks creating a 6th cart.
8. Delete "Giỏ hàng 2". Verify the UI switches to an existing cart smoothly.

## Test 2: Persistence Across Reloads (F5)
1. Add specific products to the active cart.
2. Select a customer for the active cart.
3. Refresh the browser page (`F5` or `Cmd+R`).
4. Wait for the UI to load.
5. Verify the cart state (items, quantities, and selected customer) is fully restored automatically.
6. Delete all carts, refresh again. Verify it boots up cleanly with one empty cart.
