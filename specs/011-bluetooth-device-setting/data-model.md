# Data Model: Bluetooth Device Setting

This document outlines the data structures for the Bluetooth Device Setting feature. These models live entirely on the client side (in browser memory and `localStorage`) and are not synced to the backend database.

## 1. SavedBluetoothDevice

Represents a printer device that the cashier has scanned, connected to, and saved.

```typescript
interface SavedBluetoothDevice {
  /**
   * The unique ID provided by the Web Bluetooth API.
   * Note: This ID can change depending on OS/Browser matching, but it's used for reconnect attempts natively if possible.
   */
  id: string;
  
  /**
   * The original name of the device broadcasted via Bluetooth (e.g., "MTP-II").
   */
  originalName: string;

  /**
   * Custom alias given by the cashier (e.g., "Máy in quầy 1").
   * Defaults to originalName if not set.
   */
  alias: string;

  /**
   * Timestamp of the last successful connection.
   */
  lastConnectedAt: number;
}
```

## 2. BluetoothPrinterStore (Zustand Persisted State)

Used to manage the list of saved devices and which one is the default.

```typescript
interface BluetoothPrinterState {
  /**
   * List of all devices the current user has saved.
   */
  savedDevices: SavedBluetoothDevice[];

  /**
   * The `id` of the device chosen to be the default printer.
   * Null if no device is set as default.
   */
  defaultDeviceId: string | null;

  // Actions
  addDevice: (device: SavedBluetoothDevice) => void;
  removeDevice: (id: string) => void;
  updateDeviceAlias: (id: string, newAlias: string) => void;
  setDefaultDevice: (id: string) => void;
}
```

## 3. PrintJob (Runtime transient state)

Represents a print command being dispatched (not persisted).

```typescript
type PrintStatus = "idle" | "connecting" | "printing" | "success" | "error";

interface PrintJob {
  /**
   * A reference ID for the order being printed to correlate logs.
   */
  orderId: string;

  /**
   * Current status of the job.
   */
  status: PrintStatus;

  /**
   * The actual byte array generated via ESC/POS protocol encoding, ready to be sent to the GATT Characteristic.
   */
  payload: Uint8Array;

  /**
   * Detailed error message if status is 'error'.
   */
  errorDetails?: string;
}
```
