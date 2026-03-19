import 'dart:convert';
import 'package:http/http.dart' as http;

/// Shared API client for Agrix backend — used by both mobile and web-admin
class AgrixApiClient {
  final String baseUrl;
  String? _token;

  AgrixApiClient({this.baseUrl = 'http://localhost:3000/api/v1'});

  /// Set JWT token for authenticated requests
  void setToken(String token) => _token = token;
  void clearToken() => _token = null;
  bool get isAuthenticated => _token != null;

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_token != null) 'Authorization': 'Bearer $_token',
  };

  // ─── Auth ──────────────────────────────────────────────
  Future<Map<String, dynamic>> login(String username, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );
    if (res.statusCode != 201 && res.statusCode != 200) {
      throw ApiException(res.statusCode, 'Login failed');
    }
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    _token = data['accessToken'] as String?;
    return data;
  }

  // ─── Dashboard ─────────────────────────────────────────
  Future<Map<String, dynamic>> getDashboardRevenue() => _get('/dashboard/revenue');
  Future<List<dynamic>> getDashboardTopProducts() async {
    final res = await _get('/dashboard/top-products');
    return res['_list'] as List<dynamic>;
  }
  Future<Map<String, dynamic>> getDashboardAlerts() => _get('/dashboard/alerts');

  // ─── Products ──────────────────────────────────────────
  Future<List<dynamic>> getProducts({String? search}) async {
    final query = search != null ? '?search=$search' : '';
    return _getList('/products$query');
  }
  Future<Map<String, dynamic>> createProduct(Map<String, dynamic> data) => _post('/products', data);
  Future<Map<String, dynamic>> updateProduct(String id, Map<String, dynamic> data) => _put('/products/$id', data);
  Future<void> deleteProduct(String id) => _delete('/products/$id');

  // ─── Orders ────────────────────────────────────────────
  Future<List<dynamic>> getOrders() => _getList('/orders');

  // ─── Customers ─────────────────────────────────────────
  Future<List<dynamic>> getCustomers({String? search}) async {
    final query = search != null ? '?search=$search' : '';
    return _getList('/customers$query');
  }
  Future<Map<String, dynamic>> getCustomerDetail(String id) => _get('/customers/$id');
  Future<Map<String, dynamic>> getDebtLedger(String id) => _get('/customers/$id/debt-ledger');
  Future<Map<String, dynamic>> recordPayment(String id, int amount, {String? note}) =>
    _post('/customers/$id/payment', {'amount': amount, if (note != null) 'note': note});

  // ─── Blog ──────────────────────────────────────────────
  Future<List<dynamic>> getBlogPosts() => _getList('/blog/admin/posts');
  Future<Map<String, dynamic>> createBlogPost(Map<String, dynamic> data) => _post('/blog/admin/posts', data);
  Future<Map<String, dynamic>> updateBlogPost(String id, Map<String, dynamic> data) => _put('/blog/admin/posts/$id', data);
  Future<void> deleteBlogPost(String id) => _delete('/blog/admin/posts/$id');

  // ─── Categories ────────────────────────────────────────
  Future<List<dynamic>> getCategories() => _getList('/categories');

  // ─── Private helpers ───────────────────────────────────
  Future<Map<String, dynamic>> _get(String path) async {
    final res = await http.get(Uri.parse('$baseUrl$path'), headers: _headers);
    _checkStatus(res);
    final decoded = jsonDecode(res.body);
    if (decoded is List) return {'_list': decoded};
    return decoded as Map<String, dynamic>;
  }

  Future<List<dynamic>> _getList(String path) async {
    final res = await http.get(Uri.parse('$baseUrl$path'), headers: _headers);
    _checkStatus(res);
    final decoded = jsonDecode(res.body);
    if (decoded is List) return decoded;
    if (decoded is Map) {
      if (decoded.containsKey('data')) return decoded['data'] as List;
      if (decoded.containsKey('items')) return decoded['items'] as List;
    }
    return [decoded];
  }

  Future<Map<String, dynamic>> _post(String path, Map<String, dynamic> body) async {
    final res = await http.post(Uri.parse('$baseUrl$path'), headers: _headers, body: jsonEncode(body));
    _checkStatus(res);
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> _put(String path, Map<String, dynamic> body) async {
    final res = await http.put(Uri.parse('$baseUrl$path'), headers: _headers, body: jsonEncode(body));
    _checkStatus(res);
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<void> _delete(String path) async {
    final res = await http.delete(Uri.parse('$baseUrl$path'), headers: _headers);
    _checkStatus(res);
  }

  void _checkStatus(http.Response res) {
    if (res.statusCode >= 400) {
      throw ApiException(res.statusCode, res.body);
    }
  }
}

class ApiException implements Exception {
  final int statusCode;
  final String message;
  ApiException(this.statusCode, this.message);

  @override
  String toString() => 'ApiException($statusCode): $message';
}
