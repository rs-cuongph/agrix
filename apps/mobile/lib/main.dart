import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme.dart';
import 'data/local/database.dart';
import 'data/remote/api_client.dart';
import 'services/connectivity_service.dart';
import 'services/sync_engine.dart';
import 'services/printer_service.dart';
import 'presentation/screens/pos_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  final db = AppDatabase();
  final api = ApiClient(baseUrl: 'http://localhost:3000/api/v1');
  final connectivity = ConnectivityService();

  runApp(
    MultiProvider(
      providers: [
        Provider<AppDatabase>.value(value: db),
        Provider<ApiClient>.value(value: api),
        ChangeNotifierProvider<ConnectivityService>.value(value: connectivity),
        ChangeNotifierProvider<SyncEngine>(
          create: (_) => SyncEngine(db: db, api: api, connectivity: connectivity),
        ),
        ChangeNotifierProvider<PrinterService>(
          create: (_) => PrinterService(),
        ),
      ],
      child: const AgrixApp(),
    ),
  );
}

class AgrixApp extends StatelessWidget {
  const AgrixApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Agrix - Nông Nghiệp Thông Minh',
      theme: AgrixTheme.light,
      debugShowCheckedModeBanner: false,
      home: const PosScreen(),
    );
  }
}
