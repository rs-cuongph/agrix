import 'package:flutter/material.dart';
import '../../core/theme.dart';
import 'payment_dialog.dart';

/// Cart widget — displayed on the right side of POS screen
class CartWidget extends StatelessWidget {
  final List<Map<String, dynamic>> items;
  final void Function(int index) onRemove;
  final void Function(int index, int qty) onUpdateQuantity;

  const CartWidget({
    super.key,
    required this.items,
    required this.onRemove,
    required this.onUpdateQuantity,
  });

  int get _total => items.fold<int>(
        0,
        (sum, item) => sum + ((item['unitPrice'] as int) * (item['quantity'] as int)),
      );

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(left: BorderSide(color: AgrixColors.divider)),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(16),
            color: AgrixColors.primary.withOpacity(0.05),
            child: Row(
              children: [
                Icon(Icons.shopping_cart, color: AgrixColors.primary),
                const SizedBox(width: 8),
                Text(
                  'Giỏ hàng (${items.length})',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),

          // Items list
          Expanded(
            child: items.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.add_shopping_cart, size: 48, color: AgrixColors.textSecondary),
                        const SizedBox(height: 8),
                        Text('Chọn sản phẩm để thêm vào giỏ',
                            style: TextStyle(color: AgrixColors.textSecondary)),
                      ],
                    ),
                  )
                : ListView.separated(
                    itemCount: items.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (context, index) {
                      final item = items[index];
                      final qty = item['quantity'] as int;
                      final price = item['unitPrice'] as int;
                      return ListTile(
                        title: Text(item['name'] as String,
                            style: const TextStyle(fontWeight: FontWeight.w500)),
                        subtitle: Text('${_formatVND(price)} / ${item['soldUnit']}'),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove_circle_outline),
                              iconSize: 20,
                              onPressed: () => onUpdateQuantity(index, qty - 1),
                            ),
                            Text('$qty', style: const TextStyle(fontWeight: FontWeight.w600)),
                            IconButton(
                              icon: const Icon(Icons.add_circle_outline),
                              iconSize: 20,
                              onPressed: () => onUpdateQuantity(index, qty + 1),
                            ),
                            IconButton(
                              icon: Icon(Icons.delete_outline, color: AgrixColors.error, size: 20),
                              onPressed: () => onRemove(index),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),

          // Total + checkout
          if (items.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, -2))],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('TỔNG CỘNG', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                      Text(
                        _formatVND(_total),
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 20,
                          color: AgrixColors.primary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        showDialog(
                          context: context,
                          builder: (_) => PaymentDialog(
                            items: items,
                            totalAmount: _total,
                          ),
                        );
                      },
                      icon: const Icon(Icons.payment),
                      label: const Text('THANH TOÁN'),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  String _formatVND(int amount) {
    return '${amount.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]}.')}đ';
  }
}
