# Bluetooth GATT Contracts (Hardware Interface)

When connecting to generic ESC/POS thermal printers via Web Bluetooth, we don't have a standard REST or GraphQL API. Instead, we interface via Bluetooth Generic Attribute Profile (GATT) services and characteristics.

Common thermal printers broadcast the following services to receive print commands:

- **Service UUID**: `000018f0-0000-1000-8000-00805f9b34fb` or generic BLE standard fallback.
- **Write Characteristic UUID**: `00002af1-0000-1000-8000-00805f9b34fb` (Typically used to write print data without response).

*Note: Some printers use a different service UUID. Our scanner logic will request all optional services or use a primary `requestDevice` filter that detects the standard serial port emulate UUIDs.*

**Data Payload**:
The data written to the characteristic must be chunks of `Uint8Array` (max 512 bytes per chunk usually, because of BLE MTU limits).
The raw bytes must conform to the ESC/POS specification (e.g. `0x1B 0x40` for initialization).
