import 'package:flutter/material.dart';

/// Web Admin Blog Management — CRUD for blog posts
class BlogManagementScreen extends StatelessWidget {
  const BlogManagementScreen({super.key});

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
              const Text('📝 Quản lý bài viết', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
              ElevatedButton.icon(
                onPressed: () {
                  // TODO: Navigate to blog editor
                },
                icon: const Icon(Icons.edit),
                label: const Text('Viết bài mới'),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
              ),
            ],
          ),
          const SizedBox(height: 16),

          Expanded(
            child: Card(
              child: SingleChildScrollView(
                child: DataTable(
                  columns: const [
                    DataColumn(label: Text('Tiêu đề')),
                    DataColumn(label: Text('Danh mục')),
                    DataColumn(label: Text('Ngày đăng')),
                    DataColumn(label: Text('Trạng thái')),
                    DataColumn(label: Text('Thao tác')),
                  ],
                  rows: [
                    DataRow(cells: [
                      DataCell(Text('Chưa có bài viết', style: TextStyle(color: Colors.grey.shade500))),
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
