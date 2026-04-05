# Research: POS Multi-Cart Management

## Local Storage vs IndexedDB for Persistence
- **Decision**: `localStorage` (or `idb-keyval` wrapped as simple setter/getter if payload big). Given the payload is just up to 5 small JSON objects (items array, customer info), `localStorage` is extremely synchronous, easy to integrate with React's `useEffect`, and well within the 5MB limit. However, since the app may use `idb` for offline sync later, we can stick to `localStorage` just for the *current session UI state* (Cart State) because it blocks render synchronously which is good for avoiding FOUC (Flash of Unstyled Content) during hydration. 
- **Rationale**: Simplicity and synchronous read on initial load.
- **Alternatives considered**: `IndexedDB` (asynchronous, overkill for small state, though better for the whole POS offline catalog). 

## Multi-Cart State Management
- **Decision**: Upgrade existing single `CartContext` to hold an array of `CartData` and an `activeCartId`. 
- **Rationale**: Avoids rewriting the entire React tree. The cart hooks (`useCart()`) can maintain their signature `cart.items`, `cart.customer`, etc., but under the hood, those access `carts.find(c => c.id === activeCartId)`.
- **Alternatives considered**: Spinning up multiple separate context providers (Too complex), using a global state manager like Zustand (We already use vanilla React Context for the cart, let's keep it).
