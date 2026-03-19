import 'package:flutter/material.dart';
import '../../core/theme.dart';

/// Dropdown widget showing all available units with calculated prices
class UnitSelectorWidget extends StatelessWidget {
  final List<Map<String, dynamic>> units; // [{unitName, conversionFactor, price}]
  final String selectedUnit;
  final ValueChanged<String> onUnitChanged;

  const UnitSelectorWidget({
    super.key,
    required this.units,
    required this.selectedUnit,
    required this.onUnitChanged,
  });

  @override
  Widget build(BuildContext context) {
    if (units.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Đơn vị bán', style: TextStyle(fontSize: 12, color: AgrixColors.textSecondary)),
        const SizedBox(height: 4),
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: AgrixColors.divider),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Column(
            children: units.map((unit) {
              final unitName = unit['unitName'] as String;
              final price = unit['price'] as int;
              final factor = unit['conversionFactor'] as int;
              final isSelected = unitName == selectedUnit;

              return InkWell(
                onTap: () => onUnitChanged(unitName),
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: isSelected ? AgrixColors.primary.withValues(alpha: 0.08) : null,
                    border: Border(
                      bottom: BorderSide(color: AgrixColors.divider, width: 0.5),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
                        color: isSelected ? AgrixColors.primary : AgrixColors.textSecondary,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              unitName,
                              style: TextStyle(
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                color: isSelected ? AgrixColors.primary : AgrixColors.textPrimary,
                              ),
                            ),
                            if (factor > 1)
                              Text(
                                '= $factor đơn vị gốc',
                                style: TextStyle(fontSize: 11, color: AgrixColors.textSecondary),
                              ),
                          ],
                        ),
                      ),
                      Text(
                        _formatVND(price),
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          color: isSelected ? AgrixColors.primary : AgrixColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  String _formatVND(int amount) {
    return '${amount.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]}.')}đ';
  }
}
