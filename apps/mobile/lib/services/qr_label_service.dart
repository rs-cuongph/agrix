import 'package:flutter/material.dart';
import 'dart:typed_data';
import 'package:qr_flutter/qr_flutter.dart';

/// Service for generating and printing QR code labels for products
class QrLabelService {
  /// Generate a QR code widget for a product
  static Widget buildQrLabel({
    required String productId,
    required String productName,
    required String sku,
    required String price,
    double size = 200,
  }) {
    final qrData = 'agrix:product:$productId';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.black, width: 1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Store name
          const Text(
            'AGRIX',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, letterSpacing: 2),
          ),
          const SizedBox(height: 8),

          // QR Code
          QrImageView(
            data: qrData,
            version: QrVersions.auto,
            size: size,
            gapless: true,
          ),
          const SizedBox(height: 8),

          // Product name
          Text(
            productName,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),

          // SKU + Price
          const SizedBox(height: 4),
          Text(
            'SKU: $sku',
            style: const TextStyle(fontSize: 10, color: Colors.grey),
          ),
          Text(
            price,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
          ),
        ],
      ),
    );
  }

  /// Generate ESC/POS bytes for printing a QR label on thermal printer
  static Uint8List buildEscPosLabel({
    required String productId,
    required String productName,
    required String sku,
    required String price,
  }) {
    final bytes = BytesBuilder();
    final qrData = 'agrix:product:$productId';

    // Initialize printer
    bytes.add([0x1B, 0x40]); // ESC @
    // Center align
    bytes.add([0x1B, 0x61, 0x01]);

    // Store name
    bytes.add([0x1B, 0x45, 0x01]); // Bold on
    bytes.addByte(0x0A);
    bytes.add('AGRIX\n'.codeUnits);
    bytes.add([0x1B, 0x45, 0x00]); // Bold off

    // Product name
    bytes.add('$productName\n'.codeUnits);
    bytes.add('SKU: $sku\n'.codeUnits);
    bytes.add('Gia: $price\n'.codeUnits);

    // QR Code (GS ( k - QR Code command)
    final qrBytes = qrData.codeUnits;
    final store = qrBytes.length + 3;
    bytes.add([0x1D, 0x28, 0x6B, store & 0xFF, (store >> 8) & 0xFF, 0x31, 0x50, 0x30]);
    bytes.add(qrBytes);

    // Print QR
    bytes.add([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30]);

    // Feed and cut
    bytes.add('\n\n\n'.codeUnits);
    bytes.add([0x1D, 0x56, 0x00]); // Full cut

    return bytes.toBytes();
  }
}
