# Quickstart: Bluetooth Device Setting

This document details how a developer can set up and run the code related to the Bluetooth Device Setting feature.

## Requirements

1. Ensure you are running the project on `localhost` or an `https://` secure context, as the Web Bluetooth API (`navigator.bluetooth.requestDevice`) strictly requires a secure context to function.
2. Ensure you have a physical Bluetooth thermal printer (like a generic 58mm or 80mm ESC/POS printer) nearby for testing.
3. Your development machine (Mac/Windows/Linux/Android) must have Bluetooth enabled.

## Verifying Web Bluetooth API

To quickly test if your browser environment supports the API, open the Developer Console (F12) while on `localhost:3002` and type:

```javascript
!!navigator.bluetooth
```

It should return `true`.

## Debugging

Because interacting with hardware can be tricky:
- Print jobs often fail if the `characteristic` UUID used to write data doesn't match what the printer exposes. 
- Cheap thermal printers often use standard base UUIDs or custom serial port profile equivalents over GATT.
- Ensure the drawer component uses `toast.error` logging from `sonner` so you catch any rejected promises gracefully.
