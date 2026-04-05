# Technical Research: Bluetooth Device Setting

This document outlines the research and technical decisions for the Bluetooth Device Setting feature.

## 1. Web Bluetooth API Compatibility

**Decision**: Use `navigator.bluetooth` API for discovering and connecting to Bluetooth devices.
**Rationale**: This API is natively supported in modern Chrome, Edge (Desktop/Android), and Opera, covering the majority of the specified target platforms for the POS app without needing any backend or native wrappers.
**Alternatives considered**: 
- Native Cordova/Capacitor plugins: Rejected because this is a web application accessible via standard browsers.
- Local installed companion app (e.g., node server running on local machine): Overly complex for the user, negates the "zero-install web POS" benefit.

## 2. Printer Communication Protocol (ESC/POS)

**Decision**: Use an `esc-pos-encoder` library (or similar logic) to generate the raw byte commands. We will communicate via standard Generic Attribute Profile (GATT) services or specific SPP-over-GATT characteristics used by cheap generic thermal printers.
**Rationale**: Most generic 58mm/80mm Bluetooth thermal printers use a specific UUID for data transfer and speak the ESC/POS protocol. Sending raw bytes to the GATT characteristic allows for formatting text, barcodes, and receipts properly.
**Alternatives considered**: HTML to Image printing (canvas snapshot). While easier to format, thermal printers process ESC/POS much faster and more reliably (no blurry rendering or sizing issues).

## 3. Local Storage Management

**Decision**: Use `zustand` with its `persist` middleware, storing data in `localStorage`.
**Rationale**: We need to keep a list of "saved" devices and the "default" choice per cashier. The data needs to be retained across reloads. Since Web Bluetooth requires users to re-pair/re-select the device from the browser prompt after a full reload (security constraint), we only store the metadata (Name, ID) so we know which one *should* be default.
**Alternatives considered**: IndexedDB. Rejected as overkill for an array of 5-10 small objects. Backend sync. Rejected as unnecessary since devices are physically tied to the tablet/computer being used, not the user's account universally.
