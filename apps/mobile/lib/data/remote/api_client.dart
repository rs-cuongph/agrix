import 'package:dio/dio.dart';

/// API client for Agrix backend with JWT interceptor
class ApiClient {
  late final Dio _dio;
  String? _accessToken;

  ApiClient({required String baseUrl}) {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        if (_accessToken != null) {
          options.headers['Authorization'] = 'Bearer $_accessToken';
        }
        return handler.next(options);
      },
      onError: (error, handler) {
        if (error.response?.statusCode == 401) {
          _accessToken = null;
          // TODO: Trigger re-authentication flow
        }
        return handler.next(error);
      },
    ));
  }

  void setToken(String token) => _accessToken = token;
  void clearToken() => _accessToken = null;
  bool get isAuthenticated => _accessToken != null;

  // ── Auth ──
  Future<Response> login(String username, String password) =>
      _dio.post('/auth/login', data: {
        'username': username,
        'password': password,
      });

  // ── Products ──
  Future<Response> getProducts({String? search, int page = 1, int limit = 20}) =>
      _dio.get('/products', queryParameters: {
        if (search != null) 'search': search,
        'page': page,
        'limit': limit,
      });

  Future<Response> getProduct(String id) => _dio.get('/products/$id');

  Future<Response> lookupProduct({String? barcode, String? qr}) =>
      _dio.get('/products/lookup', queryParameters: {
        if (barcode != null) 'barcode': barcode,
        if (qr != null) 'qr': qr,
      });

  // ── Orders ──
  Future<Response> createOrder(Map<String, dynamic> data) =>
      _dio.post('/orders', data: data);

  Future<Response> getOrders({String? from, String? to, int page = 1}) =>
      _dio.get('/orders', queryParameters: {
        if (from != null) 'from': from,
        if (to != null) 'to': to,
        'page': page,
      });

  // ── Sync ──
  Future<Response> syncOrders(List<Map<String, dynamic>> orders) =>
      _dio.post('/sync/orders', data: {'orders': orders});

  // ── Customers ──
  Future<Response> getCustomers({String? search}) =>
      _dio.get('/customers', queryParameters: {
        if (search != null) 'search': search,
      });

  Future<Response> createCustomer(Map<String, dynamic> data) =>
      _dio.post('/customers', data: data);

  Future<Response> getDebtLedger(String customerId) =>
      _dio.get('/customers/$customerId/debt-ledger');

  Future<Response> recordPayment(String customerId, int amount, String? note) =>
      _dio.post('/customers/$customerId/payment', data: {
        'amount': amount,
        if (note != null) 'note': note,
      });

  // ── Stock ──
  Future<Response> importStock(Map<String, dynamic> data) =>
      _dio.post('/stock/import', data: data);

  // ── AI ──
  Future<Response> askAI(String question, {String? productId}) =>
      _dio.post('/ai/ask', data: {
        'question': question,
        if (productId != null) 'productId': productId,
      });
}
