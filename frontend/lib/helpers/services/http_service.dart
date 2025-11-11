import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:henox/helpers/services/storage/local_storage.dart';
import 'package:henox/helpers/services/auth_service.dart';

class HttpService {
  /// ⚠️ Mets ici ton IP locale si tu testes sur mobile (ex: http://192.168.1.100:3000)
  static const String baseUrl = "http://127.0.0.1:3000";

  /// 🔹 GET
  static Future<http.Response> get(String path,
      {Map<String, dynamic>? queryParams}) async {
    final headers = await _getHeaders();
    final uri =
        Uri.parse('$baseUrl$path').replace(queryParameters: queryParams);
    _logRequest('GET', uri.toString(), null, headers);
    final response = await http.get(uri, headers: headers);
    _logResponse(response);
    return response;
  }

  /// 🔹 POST
  static Future<http.Response> post(
      String path, Map<String, dynamic> data) async {
    final headers = await _getHeaders();
    final uri = Uri.parse('$baseUrl$path');
    _logRequest('POST', uri.toString(), data, headers);
    final response =
        await http.post(uri, headers: headers, body: jsonEncode(data));
    _logResponse(response);
    return response;
  }

  /// 🔹 PUT
  static Future<http.Response> put(
      String path, Map<String, dynamic> data) async {
    final headers = await _getHeaders();
    final uri = Uri.parse('$baseUrl$path');
    _logRequest('PUT', uri.toString(), data, headers);
    final response =
        await http.put(uri, headers: headers, body: jsonEncode(data));
    _logResponse(response);
    return response;
  }

  /// 🔹 DELETE
  static Future<http.Response> delete(String path) async {
    final headers = await _getHeaders();
    final uri = Uri.parse('$baseUrl$path');
    _logRequest('DELETE', uri.toString(), null, headers);
    final response = await http.delete(uri, headers: headers);
    _logResponse(response);
    return response;
  }

  /// 🔸 Headers automatiques (avec token si connecté)
  static Future<Map<String, String>> _getHeaders() async {
    String? token = AuthService.token ?? await LocalStorage.getItem("token");

    final headers = {"Content-Type": "application/json"};

    if (token != null && token.isNotEmpty) {
      headers["Authorization"] = "Bearer $token";
    }

    return headers;
  }

  /// 🧩 Log des requêtes (debug only)
  static void _logRequest(
      String method, String url, dynamic data, Map<String, String> headers) {
    print('---- HTTP REQUEST ----');
    print('[$method] $url');
    print('Headers: $headers');
    if (data != null) print('Body: $data');
    print('----------------------');
  }

  /// 🧩 Log des réponses (debug only)
  static void _logResponse(http.Response response) {
    print('---- HTTP RESPONSE ----');
    print('Status: ${response.statusCode}');
    print('Body: ${response.body}');
    print('-----------------------');
  }
}
