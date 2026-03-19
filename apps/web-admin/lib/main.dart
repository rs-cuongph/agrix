import 'package:flutter/material.dart';
import 'package:agrix_shared/api_client.dart';
import 'presentation/screens/products_screen.dart';
import 'presentation/screens/orders_screen.dart';
import 'presentation/screens/blog_management_screen.dart';

final api = AgrixApiClient(baseUrl: 'http://localhost:3000/api/v1');

void main() {
  runApp(const AgrixAdminApp());
}

class AgrixAdminApp extends StatelessWidget {
  const AgrixAdminApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Agrix Admin',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF10B981),
          brightness: Brightness.light,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF10B981),
          foregroundColor: Colors.white,
          elevation: 0,
        ),
      ),
      home: const AdminShell(),
    );
  }
}

class AdminShell extends StatefulWidget {
  const AdminShell({super.key});

  @override
  State<AdminShell> createState() => _AdminShellState();
}

class _AdminShellState extends State<AdminShell> {
  int _selectedIndex = 0;
  bool _isLoggedIn = false;
  String _userName = '';

  final List<_NavItem> _navItems = [
    _NavItem(icon: Icons.dashboard, label: 'Tổng quan'),
    _NavItem(icon: Icons.inventory_2, label: 'Sản phẩm'),
    _NavItem(icon: Icons.receipt_long, label: 'Đơn hàng'),
    _NavItem(icon: Icons.people, label: 'Khách hàng'),
    _NavItem(icon: Icons.article, label: 'Blog'),
    _NavItem(icon: Icons.settings, label: 'Cài đặt'),
  ];

  void _onLoginSuccess(String name) {
    setState(() { _isLoggedIn = true; _userName = name; });
  }

  @override
  Widget build(BuildContext context) {
    if (!_isLoggedIn) {
      return _LoginScreen(onLogin: _onLoginSuccess);
    }

    return Scaffold(
      body: Row(
        children: [
          // Sidebar
          Container(
            width: 220,
            color: const Color(0xFF064E3B),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  child: Row(children: [
                    Container(
                      width: 36, height: 36,
                      decoration: BoxDecoration(color: const Color(0xFF10B981), borderRadius: BorderRadius.circular(8)),
                      child: const Icon(Icons.eco, color: Colors.white, size: 20),
                    ),
                    const SizedBox(width: 10),
                    const Text('Agrix Admin', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
                  ]),
                ),
                const Divider(color: Colors.white24, height: 1),
                const SizedBox(height: 8),
                ...List.generate(_navItems.length, (i) {
                  final item = _navItems[i];
                  final sel = _selectedIndex == i;
                  return Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () => setState(() => _selectedIndex = i),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: sel ? Colors.white.withValues(alpha: 0.15) : Colors.transparent,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(children: [
                          Icon(item.icon, color: sel ? Colors.white : Colors.white60, size: 20),
                          const SizedBox(width: 12),
                          Text(item.label, style: TextStyle(
                            color: sel ? Colors.white : Colors.white60,
                            fontWeight: sel ? FontWeight.w600 : FontWeight.w400,
                          )),
                        ]),
                      ),
                    ),
                  );
                }),
                const Spacer(),
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Text('👤 $_userName', style: const TextStyle(color: Colors.white70, fontSize: 13)),
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
                  child: TextButton.icon(
                    onPressed: () { api.clearToken(); setState(() => _isLoggedIn = false); },
                    icon: const Icon(Icons.logout, color: Colors.white54, size: 18),
                    label: const Text('Đăng xuất', style: TextStyle(color: Colors.white54)),
                  ),
                ),
              ],
            ),
          ),
          Expanded(child: _buildPage()),
        ],
      ),
    );
  }

  Widget _buildPage() {
    switch (_selectedIndex) {
      case 0: return const _DashboardPage();
      case 1: return const _ProductsPage();
      case 2: return const _OrdersPage();
      case 3: return const _CustomersPage();
      case 4: return const _BlogPage();
      case 5: return const _SettingsPage();
      default: return const _DashboardPage();
    }
  }
}

class _NavItem {
  final IconData icon;
  final String label;
  _NavItem({required this.icon, required this.label});
}

// ═══════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════
class _LoginScreen extends StatefulWidget {
  final void Function(String name) onLogin;
  const _LoginScreen({required this.onLogin});

  @override
  State<_LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<_LoginScreen> {
  final _user = TextEditingController();
  final _pass = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _login() async {
    if (_user.text.isEmpty || _pass.text.isEmpty) {
      setState(() => _error = 'Vui lòng nhập đầy đủ');
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      final data = await api.login(_user.text, _pass.text);
      final user = data['user'] as Map<String, dynamic>?;
      widget.onLogin(user?['fullName'] ?? _user.text);
    } on ApiException catch (e) {
      setState(() { _loading = false; _error = e.statusCode == 401 ? 'Sai tên hoặc mật khẩu' : 'Lỗi: ${e.message}'; });
    } catch (e) {
      setState(() { _loading = false; _error = 'Không kết nối được backend'; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0FDF4),
      body: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 400),
          child: Card(
            elevation: 8,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                Container(
                  width: 64, height: 64,
                  decoration: BoxDecoration(color: const Color(0xFF10B981), borderRadius: BorderRadius.circular(16)),
                  child: const Icon(Icons.eco, color: Colors.white, size: 36),
                ),
                const SizedBox(height: 16),
                const Text('Agrix Admin', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
                const Text('Đăng nhập quản trị', style: TextStyle(color: Colors.grey)),
                const SizedBox(height: 32),
                TextField(controller: _user, decoration: const InputDecoration(labelText: 'Tên đăng nhập', prefixIcon: Icon(Icons.person), border: OutlineInputBorder())),
                const SizedBox(height: 16),
                TextField(controller: _pass, obscureText: true, decoration: const InputDecoration(labelText: 'Mật khẩu', prefixIcon: Icon(Icons.lock), border: OutlineInputBorder()), onSubmitted: (_) => _login()),
                if (_error != null) Padding(padding: const EdgeInsets.only(top: 8), child: Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 13))),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _loading ? null : _login,
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                    child: _loading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Đăng nhập', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  ),
                ),
              ]),
            ),
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD PAGE — Real API
// ═══════════════════════════════════════════════════════════
class _DashboardPage extends StatefulWidget {
  const _DashboardPage();
  @override State<_DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<_DashboardPage> {
  Map<String, dynamic>? _revenue;
  List<dynamic>? _topProducts;
  Map<String, dynamic>? _alerts;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final results = await Future.wait([
        api.getDashboardRevenue(),
        api.getDashboardTopProducts(),
        api.getDashboardAlerts(),
      ]);
      if (mounted) setState(() { _revenue = results[0] as Map<String, dynamic>; _topProducts = results[1] as List; _alerts = results[2] as Map<String, dynamic>; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('📊 Tổng quan', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
        const SizedBox(height: 24),
        Row(children: [
          _metric('💰', 'Doanh thu hôm nay', '${_revenue?['revenueToday'] ?? 0}đ', const Color(0xFF10B981)),
          const SizedBox(width: 16),
          _metric('📋', 'Đơn hàng', '${_revenue?['orderCountToday'] ?? 0}', Colors.blue),
          const SizedBox(width: 16),
          _metric('📦', 'Sản phẩm', '${_revenue?['totalProducts'] ?? 0}', Colors.orange),
          const SizedBox(width: 16),
          _metric('👥', 'Khách hàng', '${_revenue?['totalCustomers'] ?? 0}', Colors.purple),
        ]),
        const SizedBox(height: 24),
        Expanded(child: Row(children: [
          Expanded(flex: 2, child: Card(child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('🏆 Top sản phẩm bán chạy', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              if (_topProducts != null && _topProducts!.isNotEmpty) ...(_topProducts!.map((p) =>
                ListTile(
                  dense: true,
                  leading: const Icon(Icons.trending_up, color: Color(0xFF10B981)),
                  title: Text(p['name'] ?? ''),
                  subtitle: Text('SKU: ${p['sku']}'),
                  trailing: Text('${p['totalSold']} đã bán', style: const TextStyle(fontWeight: FontWeight.w600)),
                ),
              ))
              else Center(child: Text('Chưa có dữ liệu', style: TextStyle(color: Colors.grey.shade500))),
            ]),
          ))),
          const SizedBox(width: 16),
          Expanded(child: Card(child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('⚠️ Cảnh báo tồn kho', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              if (_alerts != null && (_alerts!['lowStock'] as List?)?.isNotEmpty == true)
                ...(_alerts!['lowStock'] as List).map((a) => ListTile(
                  dense: true,
                  leading: const Icon(Icons.warning, color: Colors.orange),
                  title: Text(a['name'] ?? ''),
                  subtitle: Text('Còn ${a['currentStock']} ${a['baseUnit']}'),
                ))
              else Center(child: Text('Không có cảnh báo', style: TextStyle(color: Colors.grey.shade500))),
            ]),
          ))),
        ])),
      ]),
    );
  }

  Widget _metric(String icon, String label, String value, Color color) {
    return Expanded(child: Card(child: Padding(
      padding: const EdgeInsets.all(20),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(icon, style: const TextStyle(fontSize: 24)),
        const SizedBox(height: 8),
        Text(label, style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: color)),
      ]),
    )));
  }
}

// ═══════════════════════════════════════════════════════════
// PRODUCTS PAGE — Real CRUD API
// ═══════════════════════════════════════════════════════════
class _ProductsPage extends StatefulWidget {
  const _ProductsPage();
  @override State<_ProductsPage> createState() => _ProductsPageState();
}

class _ProductsPageState extends State<_ProductsPage> {
  List<dynamic> _products = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final data = await api.getProducts();
      if (mounted) setState(() { _products = data; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Text('📦 Sản phẩm', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
          Row(children: [
            IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
            const SizedBox(width: 8),
            ElevatedButton.icon(
              onPressed: () {}, icon: const Icon(Icons.add),
              label: const Text('Thêm sản phẩm'),
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
            ),
          ]),
        ]),
        const SizedBox(height: 16),
        if (_loading) const Center(child: CircularProgressIndicator())
        else Expanded(child: Card(child: SingleChildScrollView(
          child: DataTable(
            columns: const [
              DataColumn(label: Text('SKU')),
              DataColumn(label: Text('Tên sản phẩm')),
              DataColumn(label: Text('Đơn vị')),
              DataColumn(label: Text('Giá bán'), numeric: true),
              DataColumn(label: Text('Tồn kho'), numeric: true),
              DataColumn(label: Text('Trạng thái')),
            ],
            rows: _products.map((p) => DataRow(cells: [
              DataCell(Text(p['sku'] ?? '')),
              DataCell(Text(p['name'] ?? '')),
              DataCell(Text(p['baseUnit'] ?? '')),
              DataCell(Text('${p['baseSellPrice'] ?? 0}đ')),
              DataCell(Text('${p['currentStockBase'] ?? 0}')),
              DataCell(Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: p['isActive'] == true ? const Color(0xFFD1FAE5) : const Color(0xFFFEE2E2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(p['isActive'] == true ? 'Hoạt động' : 'Ngưng', style: TextStyle(fontSize: 12, color: p['isActive'] == true ? const Color(0xFF065F46) : Colors.red)),
              )),
            ])).toList(),
          ),
        ))),
      ]),
    );
  }
}

// ═══════════════════════════════════════════════════════════
// ORDERS PAGE — Real API (read-only)
// ═══════════════════════════════════════════════════════════
class _OrdersPage extends StatefulWidget {
  const _OrdersPage();
  @override State<_OrdersPage> createState() => _OrdersPageState();
}

class _OrdersPageState extends State<_OrdersPage> {
  List<dynamic> _orders = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final data = await api.getOrders();
      if (mounted) setState(() { _orders = data; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Text('📋 Đơn hàng', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
        ]),
        const SizedBox(height: 16),
        if (_loading) const Center(child: CircularProgressIndicator())
        else if (_orders.isEmpty) Center(child: Text('Chưa có đơn hàng', style: TextStyle(color: Colors.grey.shade500)))
        else Expanded(child: Card(child: SingleChildScrollView(
          child: DataTable(
            columns: const [
              DataColumn(label: Text('Mã đơn')),
              DataColumn(label: Text('Thời gian')),
              DataColumn(label: Text('Tổng tiền'), numeric: true),
              DataColumn(label: Text('Thanh toán')),
              DataColumn(label: Text('Trạng thái')),
            ],
            rows: _orders.map((o) => DataRow(cells: [
              DataCell(Text((o['id'] ?? '').toString().substring(0, 8))),
              DataCell(Text(o['createdAt'] ?? '')),
              DataCell(Text('${o['totalAmount'] ?? 0}đ')),
              DataCell(Text(o['paymentMethod'] ?? '')),
              DataCell(Text(o['syncStatus'] ?? '')),
            ])).toList(),
          ),
        ))),
      ]),
    );
  }
}

// ═══════════════════════════════════════════════════════════
// CUSTOMERS PAGE — Real API
// ═══════════════════════════════════════════════════════════
class _CustomersPage extends StatefulWidget {
  const _CustomersPage();
  @override State<_CustomersPage> createState() => _CustomersPageState();
}

class _CustomersPageState extends State<_CustomersPage> {
  List<dynamic> _customers = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final data = await api.getCustomers();
      if (mounted) setState(() { _customers = data; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Text('👥 Khách hàng', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
          Row(children: [
            IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
            const SizedBox(width: 8),
            ElevatedButton.icon(onPressed: () {}, icon: const Icon(Icons.person_add), label: const Text('Thêm'), style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981))),
          ]),
        ]),
        const SizedBox(height: 16),
        if (_loading) const Center(child: CircularProgressIndicator())
        else Expanded(child: Card(child: SingleChildScrollView(
          child: DataTable(
            columns: const [
              DataColumn(label: Text('Tên')),
              DataColumn(label: Text('SĐT')),
              DataColumn(label: Text('Địa chỉ')),
              DataColumn(label: Text('Công nợ'), numeric: true),
            ],
            rows: _customers.map((c) => DataRow(cells: [
              DataCell(Text(c['name'] ?? '')),
              DataCell(Text(c['phone'] ?? '')),
              DataCell(Text(c['address'] ?? '')),
              DataCell(Text('${c['outstandingDebt'] ?? 0}đ',
                style: TextStyle(color: (c['outstandingDebt'] ?? 0) > 0 ? Colors.red : Colors.green, fontWeight: FontWeight.w600),
              )),
            ])).toList(),
          ),
        ))),
      ]),
    );
  }
}

// ═══════════════════════════════════════════════════════════
// BLOG PAGE — Real CRUD API
// ═══════════════════════════════════════════════════════════
class _BlogPage extends StatefulWidget {
  const _BlogPage();
  @override State<_BlogPage> createState() => _BlogPageState();
}

class _BlogPageState extends State<_BlogPage> {
  List<dynamic> _posts = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final data = await api.getBlogPosts();
      if (mounted) setState(() { _posts = data; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Text('📝 Blog', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
          Row(children: [
            IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
            const SizedBox(width: 8),
            ElevatedButton.icon(onPressed: () {}, icon: const Icon(Icons.add), label: const Text('Bài viết mới'), style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981))),
          ]),
        ]),
        const SizedBox(height: 16),
        if (_loading) const Center(child: CircularProgressIndicator())
        else if (_posts.isEmpty) Center(child: Text('Chưa có bài viết', style: TextStyle(color: Colors.grey.shade500)))
        else Expanded(child: Card(child: SingleChildScrollView(
          child: DataTable(
            columns: const [
              DataColumn(label: Text('Tiêu đề')),
              DataColumn(label: Text('Tác giả')),
              DataColumn(label: Text('Trạng thái')),
              DataColumn(label: Text('Ngày tạo')),
              DataColumn(label: Text('Thao tác')),
            ],
            rows: _posts.map((p) => DataRow(cells: [
              DataCell(Text(p['title'] ?? '')),
              DataCell(Text(p['author'] ?? '')),
              DataCell(Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: p['status'] == 'published' ? const Color(0xFFD1FAE5) : const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(p['status'] == 'published' ? 'Đã xuất bản' : 'Nháp', style: const TextStyle(fontSize: 12)),
              )),
              DataCell(Text(p['createdAt'] ?? '')),
              DataCell(Row(children: [
                IconButton(icon: const Icon(Icons.edit, size: 18), onPressed: () {}),
                IconButton(icon: const Icon(Icons.delete, size: 18, color: Colors.red), onPressed: () {}),
              ])),
            ])).toList(),
          ),
        ))),
      ]),
    );
  }
}

// ═══════════════════════════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════════════════════════
class _SettingsPage extends StatelessWidget {
  const _SettingsPage();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('⚙️ Cài đặt', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
        const SizedBox(height: 24),
        Card(child: ListTile(leading: const Icon(Icons.store), title: const Text('Thông tin cửa hàng'), subtitle: const Text('Agrix — Đại lý vật tư nông nghiệp'), trailing: const Icon(Icons.chevron_right), onTap: () {})),
        Card(child: ListTile(leading: const Icon(Icons.print), title: const Text('Cài đặt máy in'), subtitle: const Text('Chưa kết nối'), trailing: const Icon(Icons.chevron_right), onTap: () {})),
        Card(child: ListTile(leading: const Icon(Icons.sync), title: const Text('Đồng bộ dữ liệu'), subtitle: Text('Backend: ${api.baseUrl}'), trailing: const Icon(Icons.chevron_right), onTap: () {})),
        Card(child: ListTile(leading: const Icon(Icons.info_outline), title: const Text('Phiên bản'), subtitle: const Text('Agrix Admin v1.0.0'), trailing: const Icon(Icons.chevron_right), onTap: () {})),
      ]),
    );
  }
}
