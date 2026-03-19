import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../data/remote/api_client.dart';
import '../../services/connectivity_service.dart';
import '../../services/sync_engine.dart';
import '../widgets/cart_widget.dart';
import '../widgets/sync_status_indicator.dart';

/// POS main screen: product search + barcode scan + product grid
class PosScreen extends StatefulWidget {
  const PosScreen({super.key});

  @override
  State<PosScreen> createState() => _PosScreenState();
}

class _PosScreenState extends State<PosScreen> {
  final TextEditingController _searchController = TextEditingController();
  final List<Map<String, dynamic>> _cartItems = [];
  List<Map<String, dynamic>> _products = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts({String? search}) async {
    setState(() => _isLoading = true);
    try {
      final api = context.read<ApiClient>();
      final response = await api.getProducts(search: search);
      if (response.statusCode == 200) {
        final data = response.data['data'] as List;
        setState(() => _products = data.cast<Map<String, dynamic>>());
      }
    } catch (e) {
      // Offline: show locally cached products
      debugPrint('Failed to load products: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _addToCart(Map<String, dynamic> product) {
    setState(() {
      final existing = _cartItems.indexWhere((i) => i['productId'] == product['id']);
      if (existing >= 0) {
        _cartItems[existing]['quantity'] = (_cartItems[existing]['quantity'] as int) + 1;
      } else {
        _cartItems.add({
          'productId': product['id'],
          'name': product['name'],
          'unitPrice': product['baseSellPrice'],
          'soldUnit': product['baseUnit'],
          'quantity': 1,
        });
      }
    });
  }

  void _removeFromCart(int index) {
    setState(() => _cartItems.removeAt(index));
  }

  void _updateQuantity(int index, int qty) {
    if (qty <= 0) {
      _removeFromCart(index);
    } else {
      setState(() => _cartItems[index]['quantity'] = qty);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🌿 Agrix POS'),
        actions: const [
          SyncStatusIndicator(),
          SizedBox(width: 8),
        ],
      ),
      body: Row(
        children: [
          // Left: Product search & grid
          Expanded(
            flex: 3,
            child: Column(
              children: [
                // Search bar
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Tìm sản phẩm hoặc quét mã...',
                      prefixIcon: const Icon(Icons.search),
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.qr_code_scanner),
                        onPressed: () {
                          // TODO: Open scanner overlay
                        },
                      ),
                    ),
                    onChanged: (value) => _loadProducts(search: value),
                  ),
                ),

                // Product grid
                Expanded(
                  child: _isLoading
                      ? const Center(child: CircularProgressIndicator())
                      : _products.isEmpty
                          ? const Center(
                              child: Text(
                                'Không tìm thấy sản phẩm',
                                style: TextStyle(color: AgrixColors.textSecondary),
                              ),
                            )
                          : GridView.builder(
                              padding: const EdgeInsets.all(12),
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 3,
                                childAspectRatio: 0.85,
                                crossAxisSpacing: 8,
                                mainAxisSpacing: 8,
                              ),
                              itemCount: _products.length,
                              itemBuilder: (context, index) {
                                final product = _products[index];
                                return _ProductCard(
                                  product: product,
                                  onTap: () => _addToCart(product),
                                );
                              },
                            ),
                ),
              ],
            ),
          ),

          // Right: Cart
          SizedBox(
            width: 360,
            child: CartWidget(
              items: _cartItems,
              onRemove: _removeFromCart,
              onUpdateQuantity: _updateQuantity,
            ),
          ),
        ],
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final Map<String, dynamic> product;
  final VoidCallback onTap;

  const _ProductCard({required this.product, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final price = product['baseSellPrice'] as int? ?? 0;
    final name = product['name'] as String? ?? '';
    final unit = product['baseUnit'] as String? ?? '';
    final stock = product['currentStockBase'] as int? ?? 0;

    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.inventory_2, size: 40, color: AgrixColors.primary),
              const SizedBox(height: 8),
              Text(
                name,
                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                '${_formatVND(price)}/$unit',
                style: TextStyle(
                  color: AgrixColors.primary,
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                ),
              ),
              Text(
                'Kho: $stock $unit',
                style: TextStyle(
                  color: stock > 0 ? AgrixColors.textSecondary : AgrixColors.error,
                  fontSize: 11,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatVND(int amount) {
    return '${amount.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]}.')}đ';
  }
}
