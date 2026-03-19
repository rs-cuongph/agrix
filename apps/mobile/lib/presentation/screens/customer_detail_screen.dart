import 'package:flutter/material.dart';
import '../../core/theme.dart';

/// Customer detail: info, outstanding debt, ledger history
class CustomerDetailScreen extends StatefulWidget {
  final String customerId;
  const CustomerDetailScreen({super.key, required this.customerId});

  @override
  State<CustomerDetailScreen> createState() => _CustomerDetailScreenState();
}

class _CustomerDetailScreenState extends State<CustomerDetailScreen> {
  Map<String, dynamic>? _customer;
  List<Map<String, dynamic>> _ledger = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    // TODO: Load customer + debt ledger from API
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_customer?['name'] as String? ?? 'Chi tiết khách hàng'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Customer info card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 32,
                          backgroundColor: AgrixColors.primary.withValues(alpha: 0.1),
                          child: Icon(Icons.person, size: 32, color: AgrixColors.primary),
                        ),
                        const SizedBox(height: 12),
                        Text(_customer?['name'] as String? ?? '', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                        if (_customer?['phone'] != null)
                          Text(_customer!['phone'] as String, style: TextStyle(color: AgrixColors.textSecondary)),
                        if (_customer?['address'] != null)
                          Text(_customer!['address'] as String, style: TextStyle(color: AgrixColors.textSecondary)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Debt summary
                Card(
                  color: AgrixColors.error.withValues(alpha: 0.05),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Công nợ hiện tại', style: TextStyle(color: AgrixColors.textSecondary)),
                            Text(
                              _formatVND(_customer?['outstandingDebt'] as int? ?? 0),
                              style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: AgrixColors.error),
                            ),
                          ],
                        ),
                        ElevatedButton.icon(
                          onPressed: _showPaymentDialog,
                          icon: const Icon(Icons.payment, size: 18),
                          label: const Text('Thu tiền'),
                          style: ElevatedButton.styleFrom(backgroundColor: AgrixColors.success),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Ledger history
                Text('Lịch sử giao dịch', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                if (_ledger.isEmpty)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Text('Chưa có giao dịch', style: TextStyle(color: AgrixColors.textSecondary)),
                    ),
                  )
                else
                  ..._ledger.map((entry) {
                    final amount = entry['amount'] as int? ?? 0;
                    final isPayment = amount < 0;
                    return Card(
                      margin: const EdgeInsets.only(bottom: 4),
                      child: ListTile(
                        leading: Icon(
                          isPayment ? Icons.arrow_downward : Icons.arrow_upward,
                          color: isPayment ? AgrixColors.success : AgrixColors.error,
                        ),
                        title: Text(entry['type'] == 'PAYMENT' ? 'Thanh toán' : 'Mua hàng'),
                        subtitle: Text(entry['createdAt']?.toString() ?? ''),
                        trailing: Text(
                          '${isPayment ? '-' : '+'}${_formatVND(amount.abs())}',
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            color: isPayment ? AgrixColors.success : AgrixColors.error,
                          ),
                        ),
                      ),
                    );
                  }),
              ],
            ),
    );
  }

  void _showPaymentDialog() {
    // TODO: Show payment recording dialog
  }

  String _formatVND(int amount) {
    return '${amount.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]}.')}đ';
  }
}
