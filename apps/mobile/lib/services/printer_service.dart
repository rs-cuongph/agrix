import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'dart:io';

/// ESC/POS thermal printer service supporting Bluetooth and Wi-Fi/LAN
class PrinterService extends ChangeNotifier {
  BluetoothDevice? _btDevice;
  BluetoothCharacteristic? _btChar;
  Socket? _wifiSocket;
  String _connectionType = 'none'; // 'bluetooth', 'wifi', 'none'
  bool _isConnected = false;

  bool get isConnected => _isConnected;
  String get connectionType => _connectionType;

  // ── Bluetooth Connection ──

  Future<List<ScanResult>> scanBluetooth() async {
    final results = <ScanResult>[];
    await FlutterBluePlus.startScan(timeout: const Duration(seconds: 4));
    FlutterBluePlus.scanResults.listen((r) => results.addAll(r));
    await Future.delayed(const Duration(seconds: 5));
    await FlutterBluePlus.stopScan();
    return results;
  }

  Future<void> connectBluetooth(BluetoothDevice device) async {
    await device.connect();
    final services = await device.discoverServices();
    for (final service in services) {
      for (final char in service.characteristics) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          _btDevice = device;
          _btChar = char;
          _isConnected = true;
          _connectionType = 'bluetooth';
          notifyListeners();
          return;
        }
      }
    }
    throw Exception('No writable characteristic found');
  }

  // ── Wi-Fi/LAN Connection (TCP port 9100) ──

  Future<void> connectWifi(String ip, {int port = 9100}) async {
    _wifiSocket = await Socket.connect(ip, port);
    _isConnected = true;
    _connectionType = 'wifi';
    notifyListeners();
  }

  // ── Print ──

  Future<void> printReceipt(Uint8List escPosBytes) async {
    if (_connectionType == 'bluetooth' && _btChar != null) {
      // Bluetooth: write in chunks of 20 bytes
      for (int i = 0; i < escPosBytes.length; i += 20) {
        final end = (i + 20 > escPosBytes.length) ? escPosBytes.length : i + 20;
        await _btChar!.write(escPosBytes.sublist(i, end), withoutResponse: true);
      }
    } else if (_connectionType == 'wifi' && _wifiSocket != null) {
      _wifiSocket!.add(escPosBytes);
      await _wifiSocket!.flush();
    } else {
      throw Exception('Printer not connected');
    }
  }

  /// Build a simple receipt in ESC/POS format
  Uint8List buildReceipt({
    required String storeName,
    required List<Map<String, dynamic>> items,
    required int total,
    required int paid,
    required String paymentMethod,
    required DateTime date,
  }) {
    final bytes = <int>[];

    // Initialize printer
    bytes.addAll([0x1B, 0x40]); // ESC @ (reset)

    // Center align
    bytes.addAll([0x1B, 0x61, 0x01]);
    bytes.addAll('$storeName\n'.codeUnits);
    bytes.addAll('--------------------------------\n'.codeUnits);

    // Left align
    bytes.addAll([0x1B, 0x61, 0x00]);

    for (final item in items) {
      final name = item['name'] as String;
      final qty = item['qty'] as int;
      final unit = item['unit'] as String;
      final price = item['price'] as int;
      final lineTotal = qty * price;
      bytes.addAll('$name\n'.codeUnits);
      bytes.addAll('  $qty $unit x ${_formatVND(price)} = ${_formatVND(lineTotal)}\n'.codeUnits);
    }

    bytes.addAll('--------------------------------\n'.codeUnits);
    bytes.addAll('TONG CONG: ${_formatVND(total)}\n'.codeUnits);
    bytes.addAll('DA TRA:    ${_formatVND(paid)}\n'.codeUnits);
    if (total - paid > 0) {
      bytes.addAll('CON NO:    ${_formatVND(total - paid)}\n'.codeUnits);
    }
    bytes.addAll('Thanh toan: $paymentMethod\n'.codeUnits);
    bytes.addAll('Ngay: ${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}\n'.codeUnits);

    // Center + thank you
    bytes.addAll([0x1B, 0x61, 0x01]);
    bytes.addAll('\nCam on quy khach!\n\n\n'.codeUnits);

    // Cut paper
    bytes.addAll([0x1D, 0x56, 0x00]);

    return Uint8List.fromList(bytes);
  }

  String _formatVND(int amount) {
    return '${amount.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]}.')}d';
  }

  // ── Disconnect ──

  Future<void> disconnect() async {
    if (_btDevice != null) {
      await _btDevice!.disconnect();
      _btDevice = null;
      _btChar = null;
    }
    if (_wifiSocket != null) {
      await _wifiSocket!.close();
      _wifiSocket = null;
    }
    _isConnected = false;
    _connectionType = 'none';
    notifyListeners();
  }
}
