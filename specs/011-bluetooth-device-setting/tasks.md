# Task Breakdown: Bluetooth Device Setting

**Branch**: `011-bluetooth-device-setting`  
**Generated**: 2026-04-05

## Task List

### Phase 1: Setup

- [x] T001 Install `esc-pos-encoder-ionic` (or equivalent package supporting browser exports) in `apps/web-base/package.json`

### Phase 2: Foundational

- [x] T002 Implement `useBluetoothPrinterStore` Zustand store in `apps/web-base/src/stores/use-bluetooth-printer-store.ts`
- [x] T003 Expand POS header to include gear icon opening a Drawer in `apps/web-base/src/app/pos/(app)/layout.tsx`
- [x] T004 Create empty `PosSettingsDrawer` component wrapping shadcn `Drawer` in `apps/web-base/src/components/pos/pos-settings-drawer.tsx`

### Phase 3: [US1] Scan & Connect Printer (P1)

*Goal*: Allow cashier to scan Web Bluetooth API for ESC/POS printers and connect.
*Independent Test*: Click "Scan", browser prompts Bluetooth pairing, select device, success toast displays and saves to store.

- [x] T005 [P] [US1] Create Web Bluetooth scan hook/logic in `apps/web-base/src/components/pos/bluetooth-printer-settings.tsx`
- [x] T006 [US1] Build Bluetooth scanner UI inside the settings Drawer in `apps/web-base/src/components/pos/bluetooth-printer-settings.tsx`

### Phase 4: [US2] Manage Saved Devices (P2)

*Goal*: Cashier can list, rename, delete, and set defaults for paired printers.
*Independent Test*: Change alias of a test entry, delete it, and set a new default.

- [x] T007 [US2] Build Saved Devices list UI utilizing store data in `apps/web-base/src/components/pos/bluetooth-printer-settings.tsx`
- [x] T008 [US2] Implement delete, rename (Dialog/Input), and set default operations in `apps/web-base/src/components/pos/bluetooth-printer-settings.tsx`

### Phase 5: [US3] Print Receipt (P1)

*Goal*: Formulate the ESC/POS payload and dispatch to the GATT characteristic.
*Independent Test*: Pressing print button physically produces a receipt with store logo, items, QR code, and total.

- [x] T009 [P] [US3] Implement ESC/POS layout formatting logic (receipt templating) in `apps/web-base/src/components/pos/receipt-printer.ts`
- [x] T010 [US3] Implement GATT Characteristic write function mapping to `defaultDeviceId` in `apps/web-base/src/components/pos/receipt-printer.ts`
- [x] T011 [US3] Add "In hóa đơn" button to POS order completion dialog linking to print function
- [x] T012 [US3] Implement connection fallback & `sonner` error toasts for failed print jobs

### Phase 6: [US4] Browser Compatibility (P2)

*Goal*: Graceful degradation on unsupported browsers.
*Independent Test*: Open on Firefox, see "Unsupported Browser" notice instead of "Scan" button.

- [x] T013 [US4] Add `!!navigator.bluetooth` check and warning alert UI in `apps/web-base/src/components/pos/bluetooth-printer-settings.tsx`

## Execution Strategy

**Dependencies**:
- Phase 2 (Foundational) blocks all UI implementation inside the drawer.
- Phase 3 (Scan) must precede Phase 4 (Manage list) to have real data.
- Phase 5 (Print) depends on `defaultDeviceId` existing in the Zustand store.

**Parallel Execution Opportunities**:
- T005 (Web Bluetooth core logic) can be built independently parallel to T009 (ESC/POS encoder logic) since they are functionally decoupled until final wire-up.

**MVP Scope**:
Implement Setup, Foundational, and US1 & US3 to achieve basic scanning and printing. US2 (Rename/Delete) and US4 (Browser warnings) can follow as UX polish.
