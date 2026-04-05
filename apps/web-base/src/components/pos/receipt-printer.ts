import ReceiptPrinterEncoder from '@point-of-sale/receipt-printer-encoder';
import { toast } from 'sonner';
import { useBluetoothPrinterStore } from '@/stores/use-bluetooth-printer-store';

export interface PrintJobData {
  orderId: string;
  storeName: string;
  items: { name: string; quantity: number; price: number; total: number }[];
  total: number;
  paymentMethod: string;
  date: Date;
  cashierName?: string;
  qrCodeUrl?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Replace accented characters with unaccented (useful for simple ESC/POS printers without VI codepages)
const removeVietnameseTones = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

export async function printReceipt(data: PrintJobData) {
  const store = useBluetoothPrinterStore.getState();
  const defaultDeviceId = store.defaultDeviceId;

  if (!defaultDeviceId) {
    toast.error('Chưa chọn máy in mặc định', { description: 'Vui lòng vào Cài đặt để chọn máy in' });
    return false;
  }

  try {
    toast.loading('Đang chuẩn bị in...', { id: 'print-job' });

    // 1. Get Bluetooth Device
    let device: BluetoothDevice | undefined;
    
    // Check if we already have permission granted and can get it via getDevices
    if (typeof (navigator.bluetooth as any).getDevices === 'function') {
      const devices: BluetoothDevice[] = await (navigator.bluetooth as any).getDevices();
      device = devices.find(d => d.id === defaultDeviceId);
    }

    if (!device) {
      // If we don't have it, we must prompt the user
      // We filter by name of the stored device
      const savedDevice = store.savedDevices.find(d => d.id === defaultDeviceId);
      if (!savedDevice) throw new Error("Máy in mặc định không còn trong danh sách");
      
      device = await navigator.bluetooth.requestDevice({
        filters: [{ name: savedDevice.originalName }],
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });
    }

    if (!device.gatt) throw new Error("Thiết bị không hỗ trợ kết nối GATT");

    toast.loading('Đang kết nối máy in...', { id: 'print-job' });
    const server = await device.gatt.connect();
    // Typical thermal printer service
    const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
    // Typical output characteristic
    const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

    toast.loading('Đang gửi dữ liệu in...', { id: 'print-job' });

    // 2. Generate ESC/POS Payload
    const encoder = new ReceiptPrinterEncoder({
      language: 'esc-pos',
      imageMode: 'column',
      feedBeforeCut: 2,
    });

    let currentEncoder = encoder
      .initialize()
      .codepage('auto')
      .align('center')
      .bold(true)
      .line(removeVietnameseTones(data.storeName))
      .bold(false)
      .line('--------------------------------')
      .align('left')
      .line(`Ma don: ${data.orderId}`)
      .line(`Ngay: ${data.date.toLocaleString('vi-VN')}`)
      .line(`Thu ngan: ${removeVietnameseTones(data.cashierName || 'Admin')}`);

    currentEncoder = currentEncoder.line('--------------------------------');

    data.items.forEach(item => {
      currentEncoder = currentEncoder
        .line(`${removeVietnameseTones(item.name)}`)
        .line(`  ${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.total)}`);
    });

    currentEncoder = currentEncoder
      .line('--------------------------------')
      .align('right')
      .bold(true)
      .line(`TONG TIEN: ${formatCurrency(data.total)}`)
      .bold(false)
      .line(`Thanh toan: ${removeVietnameseTones(data.paymentMethod)}`)
      .align('center')
      .line(' ')
      .line('Cam on quy khach!')
      .line(' ')
      .line(' ')
      .line(' ');

    const payload: Uint8Array = currentEncoder.encode();

    // 3. Dispatch payload in BLE chunks 
    // (characteristic writeValue usually max length is ~512 bytes, play safe with 256)
    const CHUNK_SIZE = 256;
    for (let i = 0; i < payload.length; i += CHUNK_SIZE) {
      const chunk = payload.slice(i, i + CHUNK_SIZE);
      await characteristic.writeValue(chunk);
    }

    toast.success('Đã in thành công!', { id: 'print-job' });
    
    // Disconnect to free up resources
    device.gatt.disconnect();
    
    return true;
  } catch (err: any) {
    if (err.name === 'NotFoundError') {
      toast.error('Đã hủy kết nối máy in', { id: 'print-job' });
    } else {
      toast.error(`Lỗi in: ${err.message}`, { id: 'print-job' });
    }
    return false;
  }
}
