import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  final Dio _dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000'));
  final _storage = const FlutterSecureStorage();

  ApiService() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: 'accessToken');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
      ),
    );
  }

  Future<Response> login(String email, String password) async {
    return _dio
        .post('/auth/login', data: {'email': email, 'password': password});
  }

  Future<Response> register(
      String email, String username, String password, int companyId) async {
    return _dio.post('/auth/register', data: {
      'email': email,
      'username': username,
      'password': password,
      'companyId': companyId,
    });
  }

  Future<Response> getProfile() async {
    return _dio.get('/auth/profile');
  }

  Future<void> saveToken(String token) async {
    await _storage.write(key: 'accessToken', value: token);
  }
}
