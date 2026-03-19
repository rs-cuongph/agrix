import 'dart:async';
import 'dart:convert';
import 'package:drift/drift.dart';
import 'package:flutter/foundation.dart';
import '../data/local/database.dart';
import '../data/remote/api_client.dart';
import 'connectivity_service.dart';

/// Background sync engine: pushes local offline orders to the server
/// using idempotency keys to prevent duplicates.
class SyncEngine extends ChangeNotifier {
  final AppDatabase _db;
  final ApiClient _api;
  final ConnectivityService _connectivity;
  Timer? _syncTimer;
  bool _isSyncing = false;
  int _pendingCount = 0;

  int get pendingCount => _pendingCount;
  bool get isSyncing => _isSyncing;

  SyncEngine({
    required AppDatabase db,
    required ApiClient api,
    required ConnectivityService connectivity,
  })  : _db = db,
        _api = api,
        _connectivity = connectivity {
    _connectivity.addListener(_onConnectivityChanged);
    _startPeriodicSync();
  }

  void _onConnectivityChanged() {
    if (_connectivity.isOnline) {
      syncNow();
    }
  }

  void _startPeriodicSync() {
    _syncTimer = Timer.periodic(const Duration(minutes: 5), (_) {
      if (_connectivity.isOnline) syncNow();
    });
  }

  /// Enqueue a local order for sync
  Future<void> enqueueOrder(String orderId, Map<String, dynamic> payload) async {
    await _db.into(_db.syncQueue).insert(SyncQueueCompanion.insert(
          entityType: 'order',
          entityId: orderId,
          payload: jsonEncode(payload),
          createdAt: DateTime.now(),
        ));
    await _refreshPendingCount();
    notifyListeners();
  }

  /// Attempt to sync all pending items
  Future<void> syncNow() async {
    if (_isSyncing || !_connectivity.isOnline) return;
    _isSyncing = true;
    notifyListeners();

    try {
      final pendingItems = await (_db.select(_db.syncQueue)
            ..where((q) => q.entityType.equals('order'))
            ..orderBy([(q) => OrderingTerm(expression: q.createdAt)]))
          .get();

      if (pendingItems.isEmpty) {
        _isSyncing = false;
        notifyListeners();
        return;
      }

      final orders = pendingItems
          .map((item) => jsonDecode(item.payload) as Map<String, dynamic>)
          .toList();

      final response = await _api.syncOrders(orders);

      if (response.statusCode == 200) {
        // Remove synced items from queue
        for (final item in pendingItems) {
          await (_db.delete(_db.syncQueue)
                ..where((q) => q.id.equals(item.id)))
              .go();
        }
      }
    } catch (e) {
      debugPrint('Sync failed: $e');
    } finally {
      _isSyncing = false;
      await _refreshPendingCount();
      notifyListeners();
    }
  }

  Future<void> _refreshPendingCount() async {
    final items = await _db.select(_db.syncQueue).get();
    _pendingCount = items.length;
  }

  @override
  void dispose() {
    _syncTimer?.cancel();
    _connectivity.removeListener(_onConnectivityChanged);
    super.dispose();
  }
}
