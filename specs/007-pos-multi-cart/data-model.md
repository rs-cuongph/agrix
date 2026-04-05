# Data Model: POS Multi-Cart Management

## CartData Entity
Represents a single cart session.

**Fields**:
- `id`: `string` (UUID or unique string, e.g., 'cart-1234')
- `name`: `string` (e.g., 'Khách 1', 'Đơn #2' based on customer name or sequential number)
- `items`: `CartItem[]` (Existing structure: `product`, `quantity`, `unit`, `discount`)
- `customer`: `Customer | null` (Existing structure)
- `createdAt`: `timestamp`
- `updatedAt`: `timestamp`

## CartManager Context State
Represents the overarching state in `CartContext`.

**Fields**:
- `carts`: `CartData[]` (Array of up to 5 carts)
- `activeCartId`: `string` (ID of the currently focused cart)

**State Transitions**:
- `ADD_CART`: Creates a new `CartData` instance, appends it to `carts` array, limits to 5. Updates `activeCartId` to the new cart.
- `SWITCH_CART`: Updates `activeCartId` to a given ID.
- `REMOVE_CART`: Removes a cart by ID. If active, sets `activeCartId` to the next available cart or creates a new empty one if empty.
- `ADD_ITEM` / `UPDATE_ITEM` / `REMOVE_ITEM`: Applies mutations to the cart uniquely identified by `activeCartId`.
- `SET_CUSTOMER`: Applies customer data exclusively to `activeCartId`.
- `CLEAR_CART`: Clears items of `activeCartId`.

## Persistence Strategy
- Key: `agrix_pos_carts`
- Mechanism: On every `CartContext` state change (reducer mutation), `useEffect` or middleware syncs the entire `CartManager` state to `window.localStorage`.
- Initialization: On component mount, the initial state is hydrated by parsing `localStorage.getItem('agrix_pos_carts')`.
