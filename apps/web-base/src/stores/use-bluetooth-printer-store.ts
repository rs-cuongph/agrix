import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedBluetoothDevice {
  id: string; // Used to try matching on reconnection natively, though Web BLE typically forces you to re-pair via dialog.
  originalName: string;
  alias: string;
  lastConnectedAt: number;
}

interface BluetoothPrinterState {
  savedDevices: SavedBluetoothDevice[];
  defaultDeviceId: string | null;
  addDevice: (device: Pick<SavedBluetoothDevice, 'id' | 'originalName' | 'alias'>) => void;
  removeDevice: (id: string) => void;
  updateDeviceAlias: (id: string, newAlias: string) => void;
  setDefaultDevice: (id: string | null) => void;
}

export const useBluetoothPrinterStore = create<BluetoothPrinterState>()(
  persist(
    (set) => ({
      savedDevices: [],
      defaultDeviceId: null,
      addDevice: (deviceData) => set((state) => {
        const device: SavedBluetoothDevice = {
          ...deviceData,
          lastConnectedAt: Date.now(),
        };

        const existsIndex = state.savedDevices.findIndex(d => d.id === device.id);
        
        let newDevices;
        if (existsIndex >= 0) {
          newDevices = [...state.savedDevices];
          newDevices[existsIndex] = { ...newDevices[existsIndex], ...device };
        } else {
          newDevices = [...state.savedDevices, device];
        }

        return { 
          savedDevices: newDevices,
          // Automatically set as default if it's the first device
          ...(state.defaultDeviceId === null ? { defaultDeviceId: device.id } : {})
        };
      }),
      removeDevice: (id) => set((state) => ({
        savedDevices: state.savedDevices.filter(d => d.id !== id),
        defaultDeviceId: state.defaultDeviceId === id ? null : state.defaultDeviceId,
      })),
      updateDeviceAlias: (id, newAlias) => set((state) => ({
        savedDevices: state.savedDevices.map(d => 
          d.id === id ? { ...d, alias: newAlias } : d
        )
      })),
      setDefaultDevice: (id) => set({ defaultDeviceId: id }),
    }),
    {
      name: 'bluetooth-printer-storage',
    }
  )
);
