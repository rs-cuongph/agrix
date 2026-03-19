import 'package:flutter/material.dart';

/// Web Admin Orders/History screen — paginated table view
class OrdersScreen extends StatelessWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('📋 Lịch sử đơn hàng', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
              Row(
                children: [
                  OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.calendar_today, size: 16),
                    label: const Text('Hôm nay'),
                  ),
                  const SizedBox(width: 8),
                  OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.download, size: 16),
                    label: const Text('Xuất Excel'),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Data table
          Expanded(
            child: Card(
              child: SingleChildScrollView(
                child: DataTable(
                  columns: const [
                    DataColumn(label: Text('Mã đơn')),
                    DataColumn(label: Text('Thời gian')),
                    DataColumn(label: Text('Khách hàng')),
                    DataColumn(label: Text('Số SP'), numeric: true),
                    DataColumn(label: Text('Tổng tiền'), numeric: true),
                    DataColumn(label: Text('Thanh toán')),
                    DataColumn(label: Text('Trạng thái')),
                  ],
                  rows: [
                    DataRow(cells: [
                      const DataCell(Text('—')),
                      DataCell(Text('Chưa có đơn hàng', style: TextStyle(color: Colors.grey.shade500))),
                      const DataCell(Text('')),
                      const DataCell(Text('')),
                      const DataCell(Text('')),
                      const DataCell(Text('')),
                      const DataCell(Text('')),
                    ]),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
