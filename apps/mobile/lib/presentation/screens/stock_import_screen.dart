import 'package:flutter/material.dart';
import '../../core/theme.dart';

/// Stock Import screen: select product, enter quantity per unit, batch number
class StockImportScreen extends StatefulWidget {
  const StockImportScreen({super.key});

  @override
  State<StockImportScreen> createState() => _StockImportScreenState();
}

class _StockImportScreenState extends State<StockImportScreen> {
  final _formKey = GlobalKey<FormState>();
  String? _selectedProductId;
  String? _selectedProductName;
  String _selectedUnit = '';
  final _quantityController = TextEditingController();
  final _batchController = TextEditingController();
  List<Map<String, dynamic>> _availableUnits = [];
  bool _isSubmitting = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('📦 Nhập Kho'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Product selector
              Card(
                child: ListTile(
                  leading: Icon(Icons.inventory_2, color: AgrixColors.primary),
                  title: Text(
                    _selectedProductName ?? 'Chọn sản phẩm',
                    style: TextStyle(
                      color: _selectedProductName != null
                          ? AgrixColors.textPrimary
                          : AgrixColors.textSecondary,
                    ),
                  ),
                  subtitle: _selectedProductId != null
                      ? Text('ID: ${_selectedProductId!.substring(0, 8)}...')
                      : null,
                  trailing: const Icon(Icons.chevron_right),
                  onTap: _pickProduct,
                ),
              ),
              const SizedBox(height: 16),

              // Unit selector
              if (_availableUnits.isNotEmpty) ...[
                Text('Đơn vị nhập', style: TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: _availableUnits.map((unit) {
                    final isSelected = _selectedUnit == unit['unitName'];
                    return ChoiceChip(
                      label: Text('${unit['unitName']} (×${unit['conversionFactor']})'),
                      selected: isSelected,
                      onSelected: (_) => setState(() => _selectedUnit = unit['unitName'] as String),
                      selectedColor: AgrixColors.primaryLight,
                    );
                  }).toList(),
                ),
                const SizedBox(height: 16),
              ],

              // Quantity
              TextFormField(
                controller: _quantityController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: 'Số lượng',
                  suffixText: _selectedUnit.isNotEmpty ? _selectedUnit : null,
                  prefixIcon: const Icon(Icons.add_box),
                ),
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Nhập số lượng';
                  final qty = int.tryParse(v);
                  if (qty == null || qty <= 0) return 'Số lượng phải > 0';
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Batch number
              TextFormField(
                controller: _batchController,
                decoration: const InputDecoration(
                  labelText: 'Số lô (tùy chọn)',
                  prefixIcon: Icon(Icons.tag),
                ),
              ),
              const SizedBox(height: 24),

              // Calculated summary
              if (_selectedProductId != null && _selectedUnit.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AgrixColors.primary.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AgrixColors.primary.withValues(alpha: 0.2)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Quy đổi ra đơn vị gốc:'),
                          Text(
                            _calculateBaseUnits(),
                            style: TextStyle(fontWeight: FontWeight.w700, color: AgrixColors.primary),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
              ],

              // Submit button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _isSubmitting ? null : _submitImport,
                  icon: _isSubmitting
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.check),
                  label: Text(_isSubmitting ? 'Đang nhập...' : 'Xác nhận nhập kho'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _calculateBaseUnits() {
    final qty = int.tryParse(_quantityController.text) ?? 0;
    final unit = _availableUnits.firstWhere(
      (u) => u['unitName'] == _selectedUnit,
      orElse: () => {'conversionFactor': 1, 'unitName': ''},
    );
    final factor = unit['conversionFactor'] as int? ?? 1;
    return '${qty * factor} đơn vị gốc';
  }

  void _pickProduct() {
    // TODO: Show product picker dialog
  }

  Future<void> _submitImport() async {
    if (!_formKey.currentState!.validate() || _selectedProductId == null) return;
    setState(() => _isSubmitting = true);

    try {
      // TODO: Call API to import stock
      await Future.delayed(const Duration(seconds: 1));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('✅ Nhập kho thành công!')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('❌ Lỗi: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }
}
