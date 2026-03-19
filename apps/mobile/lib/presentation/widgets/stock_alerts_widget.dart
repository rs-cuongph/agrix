import 'package:flutter/material.dart';
import '../../core/theme.dart';

/// Stock alerts widget: low stock + expiring items
class StockAlertsWidget extends StatelessWidget {
  final List<Map<String, dynamic>> lowStock;
  final List<Map<String, dynamic>> expiring;

  const StockAlertsWidget({
    super.key,
    this.lowStock = const [],
    this.expiring = const [],
  });

  @override
  Widget build(BuildContext context) {
    final hasAlerts = lowStock.isNotEmpty || expiring.isNotEmpty;

    if (!hasAlerts) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Icon(Icons.check_circle, color: AgrixColors.success),
              const SizedBox(width: 12),
              Text('Không có cảnh báo tồn kho',
                  style: TextStyle(color: AgrixColors.success, fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Low stock
        if (lowStock.isNotEmpty) ...[
          _SectionHeader(
            icon: Icons.warning_amber,
            title: 'Sắp hết hàng (${lowStock.length})',
            color: AgrixColors.warning,
          ),
          ...lowStock.map((item) => Card(
                margin: const EdgeInsets.only(bottom: 4),
                child: ListTile(
                  dense: true,
                  leading: Icon(Icons.inventory_2, color: AgrixColors.warning, size: 20),
                  title: Text(item['name'] as String? ?? '', style: const TextStyle(fontSize: 14)),
                  subtitle: Text('Còn: ${item['currentStockBase']} ${item['baseUnit']}'),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AgrixColors.warning.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'Min: ${item['minStockThreshold']}',
                      style: TextStyle(fontSize: 11, color: AgrixColors.warning, fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
              )),
          const SizedBox(height: 12),
        ],

        // Expiring
        if (expiring.isNotEmpty) ...[
          _SectionHeader(
            icon: Icons.schedule,
            title: 'Sắp hết hạn (${expiring.length})',
            color: AgrixColors.error,
          ),
          ...expiring.map((item) => Card(
                margin: const EdgeInsets.only(bottom: 4),
                child: ListTile(
                  dense: true,
                  leading: Icon(Icons.timer_off, color: AgrixColors.error, size: 20),
                  title: Text(item['name'] as String? ?? '', style: const TextStyle(fontSize: 14)),
                  subtitle: Text('HSD: ${item['expirationDate']}'),
                ),
              )),
        ],
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final IconData icon;
  final String title;
  final Color color;

  const _SectionHeader({
    required this.icon,
    required this.title,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, color: color, size: 18),
          const SizedBox(width: 6),
          Text(title, style: TextStyle(fontWeight: FontWeight.w600, color: color, fontSize: 14)),
        ],
      ),
    );
  }
}
