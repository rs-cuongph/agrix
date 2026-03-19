import 'package:flutter/material.dart';

/// Web Admin Dashboard — overview of store operations
class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          // Sidebar
          NavigationRail(
            selectedIndex: 0,
            extended: true,
            minExtendedWidth: 200,
            leading: Padding(
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.eco, color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 8),
                  const Text('Agrix', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                ],
              ),
            ),
            destinations: const [
              NavigationRailDestination(icon: Icon(Icons.dashboard), label: Text('Tổng quan')),
              NavigationRailDestination(icon: Icon(Icons.inventory), label: Text('Sản phẩm')),
              NavigationRailDestination(icon: Icon(Icons.receipt_long), label: Text('Đơn hàng')),
              NavigationRailDestination(icon: Icon(Icons.people), label: Text('Khách hàng')),
              NavigationRailDestination(icon: Icon(Icons.article), label: Text('Blog')),
              NavigationRailDestination(icon: Icon(Icons.settings), label: Text('Cài đặt')),
            ],
            onDestinationSelected: (index) {
              // TODO: Navigate between pages
            },
          ),

          const VerticalDivider(width: 1),

          // Content
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('📊 Tổng quan', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 24),

                  // Metric cards
                  Row(
                    children: [
                      _MetricCard(icon: Icons.payments, label: 'Doanh thu hôm nay', value: '0đ', color: const Color(0xFF10B981)),
                      const SizedBox(width: 16),
                      _MetricCard(icon: Icons.receipt, label: 'Đơn hàng', value: '0', color: Colors.blue),
                      const SizedBox(width: 16),
                      _MetricCard(icon: Icons.inventory_2, label: 'Sản phẩm', value: '0', color: Colors.orange),
                      const SizedBox(width: 16),
                      _MetricCard(icon: Icons.people, label: 'Khách hàng', value: '0', color: Colors.purple),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Placeholder for charts
                  Expanded(
                    child: Card(
                      child: Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.bar_chart, size: 64, color: Colors.grey.shade300),
                            const SizedBox(height: 16),
                            Text('Biểu đồ doanh thu sẽ hiển thị ở đây',
                                style: TextStyle(color: Colors.grey.shade500)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
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
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(icon, color: color, size: 20),
                  const SizedBox(width: 8),
                  Text(label, style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                ],
              ),
              const SizedBox(height: 8),
              Text(value, style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: color)),
            ],
          ),
        ),
      ),
    );
  }
}
