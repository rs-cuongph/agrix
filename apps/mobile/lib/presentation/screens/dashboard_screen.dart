import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../widgets/stock_alerts_widget.dart';

/// Dashboard screen: revenue summary, top products, low stock alerts
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _isLoading = false;
  int _todayRevenue = 0;
  int _todayOrders = 0;
  List<Map<String, dynamic>> _topProducts = [];
  List<Map<String, dynamic>> _lowStock = [];
  List<Map<String, dynamic>> _expiring = [];

  @override
  void initState() {
    super.initState();
    // TODO: Load dashboard data from API
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('📊 Tổng quan'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async {
                // TODO: Reload data
              },
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Revenue summary cards
                  Row(
                    children: [
                      Expanded(child: _MetricCard(
                        icon: Icons.payments,
                        label: 'Doanh thu hôm nay',
                        value: _formatVND(_todayRevenue),
                        color: AgrixColors.primary,
                      )),
                      const SizedBox(width: 12),
                      Expanded(child: _MetricCard(
                        icon: Icons.receipt_long,
                        label: 'Đơn hàng hôm nay',
                        value: '$_todayOrders',
                        color: AgrixColors.secondary,
                      )),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Stock alerts
                  const Text('Cảnh báo tồn kho', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  StockAlertsWidget(lowStock: _lowStock, expiring: _expiring),
                  const SizedBox(height: 20),

                  // Top products
                  const Text('Sản phẩm bán chạy', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  if (_topProducts.isEmpty)
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Text('Chưa có dữ liệu', style: TextStyle(color: AgrixColors.textSecondary)),
                      ),
                    )
                  else
                    ...List.generate(_topProducts.length, (i) {
                      final p = _topProducts[i];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 4),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: AgrixColors.primary.withValues(alpha: 0.1),
                            child: Text('${i + 1}', style: TextStyle(color: AgrixColors.primary, fontWeight: FontWeight.w700)),
                          ),
                          title: Text(p['name'] as String? ?? ''),
                          subtitle: Text('${p['totalSold']} ${p['baseUnit']} đã bán'),
                          trailing: Text(
                            _formatVND(p['totalRevenue'] as int? ?? 0),
                            style: TextStyle(fontWeight: FontWeight.w700, color: AgrixColors.primary),
                          ),
                        ),
                      );
                    }),
                ],
              ),
            ),
    );
  }

  String _formatVND(int amount) {
    return '${amount.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]}.')}đ';
  }
}

class _MetricCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _MetricCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(label, style: TextStyle(fontSize: 12, color: AgrixColors.textSecondary)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: color),
            ),
          ],
        ),
      ),
    );
  }
}
