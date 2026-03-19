import 'package:flutter/material.dart';
import '../../core/theme.dart';

/// Product management screen: CRUD, unit conversions editor, QR generation
class ProductManagementScreen extends StatefulWidget {
  const ProductManagementScreen({super.key});

  @override
  State<ProductManagementScreen> createState() => _ProductManagementScreenState();
}

class _ProductManagementScreenState extends State<ProductManagementScreen> {
  List<Map<String, dynamic>> _products = [];
  bool _isLoading = false;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    // TODO: Load products
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🌿 Quản lý sản phẩm'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showProductForm(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              decoration: const InputDecoration(
                hintText: 'Tìm sản phẩm...',
                prefixIcon: Icon(Icons.search),
              ),
              onChanged: (v) => setState(() => _searchQuery = v),
            ),
          ),

          // Product list
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _products.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.inventory, size: 64, color: AgrixColors.textSecondary),
                            const SizedBox(height: 16),
                            Text('Chưa có sản phẩm nào', style: TextStyle(color: AgrixColors.textSecondary)),
                            const SizedBox(height: 8),
                            ElevatedButton.icon(
                              onPressed: () => _showProductForm(),
                              icon: const Icon(Icons.add),
                              label: const Text('Thêm sản phẩm'),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        itemCount: _products.length,
                        itemBuilder: (context, index) {
                          final p = _products[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: AgrixColors.primary.withValues(alpha: 0.1),
                                child: Icon(Icons.eco, color: AgrixColors.primary),
                              ),
                              title: Text(p['name'] as String? ?? '', style: const TextStyle(fontWeight: FontWeight.w600)),
                              subtitle: Text('${p['baseUnit']} | Kho: ${p['currentStockBase']} | SKU: ${p['sku']}'),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    '${_formatVND(p['baseSellPrice'] as int? ?? 0)}',
                                    style: TextStyle(color: AgrixColors.primary, fontWeight: FontWeight.w700),
                                  ),
                                  const SizedBox(width: 8),
                                  const Icon(Icons.chevron_right),
                                ],
                              ),
                              onTap: () => _showProductForm(product: p),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  void _showProductForm({Map<String, dynamic>? product}) {
    // TODO: Navigate to product form screen
  }

  String _formatVND(int amount) {
    return '${amount.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]}.')}đ';
  }
}
