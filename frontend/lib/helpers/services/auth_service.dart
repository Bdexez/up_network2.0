import 'dart:convert';
import 'package:henox/helpers/services/http_service.dart';
import 'package:henox/helpers/services/storage/local_storage.dart';

class AuthService {
  static bool isLoggedIn = false;
  static String? token;

  /// 🔹 Connexion utilisateur
  static Future<Map<String, String>?> loginUser(
      Map<String, dynamic> data) async {
    try {
      final response = await HttpService.post('/auth/login', data);

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        token = json["access_token"];

        if (token != null) {
          await LocalStorage.setItem("token", token!);
          await LocalStorage.setLoggedInUser(true);
          isLoggedIn = true;
        }

        return null;
      }

      if (response.statusCode == 401)
        return {"password": "Invalid email or password"};
      if (response.statusCode == 404) return {"username": "User not found"};

      return {"general": "Unexpected error: ${response.statusCode}"};
    } catch (e) {
      return {"general": "Connection error: $e"};
    }
  }

  /// 🔹 Inscription utilisateur
  static Future<Map<String, String>?> registerUser(
      Map<String, dynamic> data) async {
    try {
      final response = await HttpService.post('/auth/register', data);

      if (response.statusCode == 201 || response.statusCode == 200) {
        return null;
      } else {
        final json = jsonDecode(response.body);
        Map<String, String> errors = {};
        if (json["message"] is List) {
          for (var msg in json["message"]) {
            if (msg.toString().contains("username"))
              errors["username"] = msg.toString();
            else if (msg.toString().contains("password"))
              errors["password"] = msg.toString();
            else
              errors["general"] = msg.toString();
          }
        } else if (json["message"] is String)
          errors["general"] = json["message"];
        return errors;
      }
    } catch (e) {
      return {"general": "Connection error: $e"};
    }
  }

  /// 🔹 Déconnexion utilisateur
  static Future<void> logout() async {
    isLoggedIn = false;
    token = null;
    await LocalStorage.setLoggedInUser(false);
    await LocalStorage.removeItem("token");
  }
}
