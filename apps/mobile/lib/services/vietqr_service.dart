import 'package:qr_flutter/qr_flutter.dart';
import 'package:flutter/material.dart';

/// VietQR payment QR code generator following NAPAS EMV standard
class VietQRService {
  /// Generate VietQR payload string per EMV QR Code specification
  ///
  /// [bankBin] - NAPAS Bank BIN (e.g., '970422' for MB Bank)
  /// [accountNumber] - Beneficiary account number
  /// [amount] - Payment amount in VND
  /// [description] - Transaction description (max 25 chars)
  String generatePayload({
    required String bankBin,
    required String accountNumber,
    required int amount,
    String description = '',
  }) {
    final sb = StringBuffer();

    // Payload Format Indicator
    sb.write('000201');

    // Point of Initiation (dynamic QR)
    sb.write('010212');

    // Merchant Account Info (NAPAS)
    final accountInfo = _buildAccountInfo(bankBin, accountNumber);
    sb.write('38${_padLen(accountInfo.length)}$accountInfo');

    // Transaction Currency (VND = 704)
    sb.write('5303704');

    // Transaction Amount
    final amountStr = amount.toString();
    sb.write('54${_padLen(amountStr.length)}$amountStr');

    // Country Code (VN)
    sb.write('5802VN');

    // Additional Data (description as purpose)
    if (description.isNotEmpty) {
      final trimmed = description.length > 25 ? description.substring(0, 25) : description;
      final addData = '08${_padLen(trimmed.length)}$trimmed';
      sb.write('62${_padLen(addData.length)}$addData');
    }

    // CRC placeholder
    sb.write('6304');

    // Calculate and append CRC-16
    final crc = _calculateCRC16(sb.toString());
    return '${sb.toString().substring(0, sb.length - 4)}6304$crc';
  }

  String _buildAccountInfo(String bankBin, String accountNumber) {
    final guid = 'A000000727';
    final guidField = '00${_padLen(guid.length)}$guid';
    final bankField = '01${_padLen(bankBin.length)}$bankBin';
    final accField = '02${_padLen(accountNumber.length)}$accountNumber';
    return '$guidField$bankField$accField';
  }

  String _padLen(int len) => len.toString().padLeft(2, '0');

  String _calculateCRC16(String data) {
    int crc = 0xFFFF;
    for (int i = 0; i < data.length; i++) {
      crc ^= data.codeUnitAt(i) << 8;
      for (int j = 0; j < 8; j++) {
        if ((crc & 0x8000) != 0) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc <<= 1;
        }
        crc &= 0xFFFF;
      }
    }
    return crc.toRadixString(16).toUpperCase().padLeft(4, '0');
  }

  /// Build a QrImageView widget for display
  Widget buildQrWidget({
    required String bankBin,
    required String accountNumber,
    required int amount,
    String description = '',
    double size = 250,
  }) {
    final payload = generatePayload(
      bankBin: bankBin,
      accountNumber: accountNumber,
      amount: amount,
      description: description,
    );

    return QrImageView(
      data: payload,
      version: QrVersions.auto,
      size: size,
      backgroundColor: Colors.white,
      errorStateBuilder: (ctx, err) => const Center(
        child: Text('Lỗi tạo mã QR', style: TextStyle(color: Colors.red)),
      ),
    );
  }
}
