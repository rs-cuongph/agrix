import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../services/connectivity_service.dart';
import '../../services/sync_engine.dart';

/// Sync status indicator — shows cloud icon in AppBar
class SyncStatusIndicator extends StatelessWidget {
  const SyncStatusIndicator({super.key});

  @override
  Widget build(BuildContext context) {
    final connectivity = context.watch<ConnectivityService>();
    final syncEngine = context.watch<SyncEngine>();

    IconData icon;
    Color color;
    String tooltip;

    if (!connectivity.isOnline) {
      icon = Icons.cloud_off;
      color = AgrixColors.warning;
      tooltip = 'Ngoại tuyến — ${syncEngine.pendingCount} đơn chờ đồng bộ';
    } else if (syncEngine.isSyncing) {
      icon = Icons.cloud_sync;
      color = AgrixColors.secondary;
      tooltip = 'Đang đồng bộ...';
    } else if (syncEngine.pendingCount > 0) {
      icon = Icons.cloud_upload;
      color = AgrixColors.warning;
      tooltip = '${syncEngine.pendingCount} đơn chờ đồng bộ';
    } else {
      icon = Icons.cloud_done;
      color = Colors.white;
      tooltip = 'Đã đồng bộ';
    }

    return Tooltip(
      message: tooltip,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: 22),
            if (syncEngine.pendingCount > 0) ...[
              const SizedBox(width: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AgrixColors.warning,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '${syncEngine.pendingCount}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
