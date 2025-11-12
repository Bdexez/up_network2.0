import 'package:henox/helpers/theme/theme_customizer.dart';
import 'package:henox/helpers/services/localizations/language.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocalStorage {
  static const String _loggedInUserKey = "user";
  static const String _themeCustomizerKey = "theme_customizer";
  static const String _languageKey = "lang_code";
  //static const String _tokenKey = "token";

  static SharedPreferences? _preferencesInstance;

  /// 🔹 Accès direct à l'instance
  static SharedPreferences get preferences {
    if (_preferencesInstance == null) {
      throw ("⚠️ Call LocalStorage.init() before using it.");
    }
    return _preferencesInstance!;
  }

  /// 🔹 Initialisation complète du stockage local
  static Future<void> init() async {
    _preferencesInstance = await SharedPreferences.getInstance();
    await initData();
  }

  /// 🔹 Chargement des données persistées
  static Future<void> initData() async {
    final prefs = preferences;

    // Statut connecté
    //final loggedIn = prefs.getBool(_loggedInUserKey) ?? false;

    // Token
    //final token = prefs.getString(_tokenKey);

    // Thème
    final themeJson = prefs.getString(_themeCustomizerKey);
    if (themeJson != null) ThemeCustomizer.fromJSON(themeJson);

    // Langue
    final langCode = prefs.getString(_languageKey);
    if (langCode != null) {
      Language.current = Language.fromCode(langCode);
    } else {
      Language.current = Language.languages.first; // Langue par défaut
    }
  }

  /// 🔹 Enregistre l’état de connexion de l’utilisateur
  static Future<void> setLoggedInUser(bool loggedIn) async {
    await preferences.setBool(_loggedInUserKey, loggedIn);
  }

  /// 🔹 Vérifie si l’utilisateur est connecté
  static Future<bool> isUserLoggedIn() async {
    return preferences.getBool(_loggedInUserKey) ?? false;
  }

  /// 🔹 Sauvegarde la langue sélectionnée
  static Future<void> setLanguage(Language language) async {
    await preferences.setString(_languageKey, language.locale.languageCode);
    Language.current = language;
  }

  /// 🔹 Récupère le code de langue actuel
  static String? getLanguage() => preferences.getString(_languageKey);

  /// 🔹 Sauvegarde une clé personnalisée
  static Future<void> setItem(String key, String value) async {
    await preferences.setString(key, value);
  }

  /// 🔹 Récupère une clé personnalisée
  static Future<String?> getItem(String key) async {
    return preferences.getString(key);
  }

  /// 🔹 Supprime une clé personnalisée
  static Future<void> removeItem(String key) async {
    await preferences.remove(key);
  }

  /// 🔹 Supprime l’état de connexion
  static Future<void> removeLoggedInUser() async {
    await preferences.remove(_loggedInUserKey);
  }

  /// 🔹 Vide totalement le stockage
  static Future<void> clear() async {
    await preferences.clear();
  }
}
