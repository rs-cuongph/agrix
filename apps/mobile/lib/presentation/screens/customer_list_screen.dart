import 'package:flutter/material.dart';
import '../../core/theme.dart';

/// Customer list/search screen
class CustomerListScreen extends StatefulWidget {
  const CustomerListScreen({super.key});

  @override
  State<CustomerListScreen> createState() => _CustomerListScreenState();
}

class _CustomerListScreenState extends State<CustomerListScreen> {
  List<Map<String, dynamic>> _customers = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // TODO: Load customers from API
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('👥 Khách hàng'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add),
            onPressed: _showAddCustomerDialog,
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              decoration: const InputDecoration(
                hintText: 'Tìm khách hàng...',
                prefixIcon: Icon(Icons.search),
              ),
              onChanged: (v) {
                // TODO: Search
              },
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _customers.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.people_outline, size: 64, color: AgrixColors.textSecondary),
                            const SizedBox(height: 16),
                            Text('Chưa có khách hàng', style: TextStyle(color: AgrixColors.textSecondary)),
                          ],
                        ),
                      )
                    : ListView.builder(
                        itemCount: _customers.length,
                        itemBuilder: (context, index) {
                          final c = _customers[index];
                          final debt = c['outstandingDebt'] as int? ?? 0;
                          return Card(
                            margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: AgrixColors.primary.withValues(alpha: 0.1),
                                child: Text(
                                  (c['name'] as String? ?? '?')[0].toUpperCase(),
                                  style: TextStyle(color: AgrixColors.primary, fontWeight: FontWeight.w700),
                                ),
                              ),
                              title: Text(c['name'] as String? ?? '', style: const TextStyle(fontWeight: FontWeight.w600)),
                              subtitle: Text(c['phone'] as String? ?? 'Chưa có SĐT'),
                              trailing: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    debt > 0 ? _formatVND(debt) : 'Không nợ',
                                    style: TextStyle(
                                      color: debt > 0 ? AgrixColors.error : AgrixColors.success,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 13,
                                    ),
                                  ),
                                  if (debt > 0) Text('Công nợ', style: TextStyle(fontSize: 11, color: AgrixColors.textSecondary)),
                                ],
                              ),
                              onTap: () {
                                // TODO: Navigate to customer detail
                              },
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  void _showAddCustomerDialog() {
    // TODO: Show add customer dialog
  }

  String _formatVND(int amount) {
    return '${amount.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]}.')}đ';
  }
}
