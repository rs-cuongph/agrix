import 'package:flutter/material.dart';
import '../../core/theme.dart';

/// Dialog for recording a customer debt payment
class PaymentDebtDialog extends StatefulWidget {
  final String customerId;
  final String customerName;
  final int outstandingDebt;

  const PaymentDebtDialog({
    super.key,
    required this.customerId,
    required this.customerName,
    required this.outstandingDebt,
  });

  @override
  State<PaymentDebtDialog> createState() => _PaymentDebtDialogState();
}

class _PaymentDebtDialogState extends State<PaymentDebtDialog> {
  final _amountController = TextEditingController();
  final _noteController = TextEditingController();
  bool _isSubmitting = false;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      child: Container(
        width: 400,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.payment, color: AgrixColors.success),
                const SizedBox(width: 8),
                const Text('Thu tiền công nợ', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
              ],
            ),
            const Divider(),
            Text('Khách hàng: ${widget.customerName}', style: const TextStyle(fontWeight: FontWeight.w500)),
            Text(
              'Nợ hiện tại: ${_formatVND(widget.outstandingDebt)}',
              style: TextStyle(color: AgrixColors.error, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Số tiền thu',
                suffixText: 'đ',
                prefixIcon: Icon(Icons.attach_money),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _noteController,
              decoration: const InputDecoration(
                labelText: 'Ghi chú (tùy chọn)',
                prefixIcon: Icon(Icons.note),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Hủy'),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _isSubmitting ? null : _submit,
                  style: ElevatedButton.styleFrom(backgroundColor: AgrixColors.success),
                  child: Text(_isSubmitting ? 'Đang xử lý...' : 'Xác nhận'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _submit() {
    final amount = int.tryParse(_amountController.text.replaceAll('.', ''));
    if (amount == null || amount <= 0) return;

    setState(() => _isSubmitting = true);
    // TODO: Call API to record payment
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        Navigator.pop(context, {
          'amount': amount,
          'note': _noteController.text,
        });
      }
    });
  }

  String _formatVND(int amount) {
    return '${amount.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]}.')}đ';
  }
}
