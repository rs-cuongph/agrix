import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

/// Scanner service for barcode (EAN-13) and QR code scanning
class ScannerService {
  MobileScannerController? _controller;
  final _resultController = StreamController<String>.broadcast();

  Stream<String> get onScanned => _resultController.stream;

  MobileScannerController get controller {
    _controller ??= MobileScannerController(
      detectionSpeed: DetectionSpeed.normal,
      facing: CameraFacing.back,
      torchEnabled: false,
    );
    return _controller!;
  }

  void handleBarcode(BarcodeCapture capture) {
    for (final barcode in capture.barcodes) {
      final value = barcode.rawValue;
      if (value != null && value.isNotEmpty) {
        _resultController.add(value);
        debugPrint('Scanned: $value (format: ${barcode.format})');
      }
    }
  }

  Future<void> dispose() async {
    await _controller?.dispose();
    await _resultController.close();
  }
}
