import 'package:flutter/material.dart';
import '../../core/theme.dart';

/// Order history screen
class OrderHistoryScreen extends StatefulWidget {
  const OrderHistoryScreen({super.key});

  @override
  State<OrderHistoryScreen> createState() => _OrderHistoryScreenState();
}

class _OrderHistoryScreenState extends State<OrderHistoryScreen> {
  List<Map<String, dynamic>> _orders = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // TODO: Load orders from local DB + API
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Lịch sử đơn hàng'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _orders.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.receipt_long, size: 64, color: AgrixColors.textSecondary),
                      const SizedBox(height: 16),
                      Text(
                        'Chưa có đơn hàng nào',
                        style: TextStyle(
                          fontSize: 16,
                          color: AgrixColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  itemCount: _orders.length,
                  itemBuilder: (context, index) {
                    final order = _orders[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: AgrixColors.primary.withOpacity(0.1),
                          child: Icon(Icons.receipt, color: AgrixColors.primary),
                        ),
                        title: Text('Đơn #${(order['id'] as String).substring(0, 8)}'),
                        subtitle: Text(order['createdAt']?.toString() ?? ''),
                        trailing: Text(
                          '${order['totalAmount']}đ',
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            color: AgrixColors.primary,
                          ),
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
