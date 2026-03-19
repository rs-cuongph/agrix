import 'package:flutter/material.dart';

/// Web Admin Products management — table view with CRUD actions
class ProductsScreen extends StatelessWidget {
  const ProductsScreen({super.key});

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
              const Text('🌿 Quản lý sản phẩm', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
              ElevatedButton.icon(
                onPressed: () {
                  // TODO: Show add-product dialog
                },
                icon: const Icon(Icons.add),
                label: const Text('Thêm sản phẩm'),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Search & filters
          Row(
            children: [
              Expanded(
                child: TextField(
                  decoration: const InputDecoration(
                    hintText: 'Tìm sản phẩm...',
                    prefixIcon: Icon(Icons.search),
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              DropdownButton<String>(
                hint: const Text('Danh mục'),
                items: const [],
                onChanged: (v) {},
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
                    DataColumn(label: Text('SKU')),
                    DataColumn(label: Text('Tên sản phẩm')),
                    DataColumn(label: Text('Đơn vị')),
                    DataColumn(label: Text('Giá bán'), numeric: true),
                    DataColumn(label: Text('Tồn kho'), numeric: true),
                    DataColumn(label: Text('Thao tác')),
                  ],
                  rows: [
                    DataRow(cells: [
                      const DataCell(Text('—')),
                      DataCell(Text('Chưa có sản phẩm', style: TextStyle(color: Colors.grey.shade500))),
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
