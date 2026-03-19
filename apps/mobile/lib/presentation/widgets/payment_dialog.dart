import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../services/printer_service.dart';
import '../../services/vietqr_service.dart';

/// Payment dialog: cash input, VietQR display, print bill
class PaymentDialog extends StatefulWidget {
  final List<Map<String, dynamic>> items;
  final int totalAmount;

  const PaymentDialog({
    super.key,
    required this.items,
    required this.totalAmount,
  });

  @override
  State<PaymentDialog> createState() => _PaymentDialogState();
}

class _PaymentDialogState extends State<PaymentDialog> {
  String _paymentMethod = 'CASH';
  final TextEditingController _cashController = TextEditingController();
  final _vietQRService = VietQRService();
  bool _isPrinting = false;

  int get _paidAmount {
    if (_paymentMethod == 'BANK_TRANSFER') return widget.totalAmount;
    return int.tryParse(_cashController.text.replaceAll('.', '')) ?? 0;
  }

  int get _change => _paidAmount - widget.totalAmount;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      insetPadding: const EdgeInsets.all(24),
      child: Container(
        width: 500,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title
            Row(
              children: [
                Icon(Icons.payment, color: AgrixColors.primary),
                const SizedBox(width: 8),
                const Text('Thanh Toán',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const Divider(),

            // Total
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Tổng cộng:', style: TextStyle(fontSize: 18)),
                Text(
                  _formatVND(widget.totalAmount),
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: AgrixColors.primary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Payment method toggle
            SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'CASH', label: Text('Tiền mặt'), icon: Icon(Icons.payments)),
                ButtonSegment(value: 'BANK_TRANSFER', label: Text('VietQR'), icon: Icon(Icons.qr_code)),
                ButtonSegment(value: 'MIXED', label: Text('Kết hợp'), icon: Icon(Icons.swap_horiz)),
              ],
              selected: {_paymentMethod},
              onSelectionChanged: (v) => setState(() => _paymentMethod = v.first),
            ),
            const SizedBox(height: 16),

            // Cash input (for CASH and MIXED)
            if (_paymentMethod != 'BANK_TRANSFER') ...[
              TextField(
                controller: _cashController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Số tiền nhận',
                  suffixText: 'đ',
                ),
                onChanged: (_) => setState(() {}),
              ),
              if (_change >= 0)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(
                    'Tiền thừa: ${_formatVND(_change)}',
                    style: TextStyle(
                      color: AgrixColors.success,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              const SizedBox(height: 16),
            ],

            // VietQR (for BANK_TRANSFER and MIXED)
            if (_paymentMethod != 'CASH') ...[
              Center(
                child: _vietQRService.buildQrWidget(
                  bankBin: '970422', // MB Bank default
                  accountNumber: '0123456789', // TODO: Configure in settings
                  amount: widget.totalAmount,
                  description: 'Agrix',
                  size: 200,
                ),
              ),
              const SizedBox(height: 8),
              Center(
                child: Text(
                  'Quét mã để thanh toán',
                  style: TextStyle(color: AgrixColors.textSecondary),
                )),
              const SizedBox(height: 16),
            ],

            const Divider(),
            const SizedBox(height: 8),

            // Action buttons
            Row(
              children: [
                // Print button
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _isPrinting ? null : _printReceipt,
                    icon: _isPrinting
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.print),
                    label: Text(_isPrinting ? 'Đang in...' : 'In hóa đơn'),
                  ),
                ),
                const SizedBox(width: 12),
                // Confirm button
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _paidAmount >= widget.totalAmount || _paymentMethod == 'BANK_TRANSFER'
                        ? () => _confirmPayment()
                        : null,
                    icon: const Icon(Icons.check),
                    label: const Text('Xác nhận'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _confirmPayment() {
    // TODO: Create order locally, add to sync queue
    Navigator.pop(context, {
      'paymentMethod': _paymentMethod,
      'paidAmount': _paidAmount,
    });
  }

  Future<void> _printReceipt() async {
    setState(() => _isPrinting = true);
    try {
      final printer = context.read<PrinterService>();
      if (!printer.isConnected) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Chưa kết nối máy in. Vào Cài đặt để kết nối.')),
        );
        return;
      }
      final receipt = printer.buildReceipt(
        storeName: 'AGRIX STORE',
        items: widget.items.map((i) => {
              'name': i['name'],
              'qty': i['quantity'],
              'unit': i['soldUnit'],
              'price': i['unitPrice'],
            }).toList(),
        total: widget.totalAmount,
        paid: _paidAmount,
        paymentMethod: _paymentMethod,
        date: DateTime.now(),
      );
      await printer.printReceipt(receipt);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi in: $e')),
      );
    } finally {
      setState(() => _isPrinting = false);
    }
  }

  String _formatVND(int amount) {
    return '${amount.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]}.')}đ';
  }
}
