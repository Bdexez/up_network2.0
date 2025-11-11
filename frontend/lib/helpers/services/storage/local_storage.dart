import 'package:henox/helpers/services/theme_customizer.dart';
import 'package:henox/helpers/services/localizations/language.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocalStorage {
  static const String _loggedInUserKey = "user";
  static const String _themeCustomizerKey = "theme_customizer";
  static const String _languageKey = "lang_code";
  static const String _tokenKey = "token";

  static SharedPreferences? _preferencesInstance;

  static SharedPreferences get preferences {
    if (_preferencesInstance == null) {
      throw ("Call LocalStorage.init() first");
    }
    return _preferencesInstance!;
  }

  static Future<void> init() async {
    _preferencesInstance = await SharedPreferences.getInstance();
    await initData();
  }

  static Future<void> initData() async {
    final prefs = preferences;

    // Statut connecté
    final loggedIn = prefs.getBool(_loggedInUserKey) ?? false;

    // Token
    final token = prefs.getString(_tokenKey);

    // Theme
    final themeJson = prefs.getString(_themeCustomizerKey);
    if (themeJson != null) ThemeCustomizer.fromJSON(themeJson);

    // Langue
    final langCode = prefs.getString(_languageKey);
    if (langCode != null) Language.current = Language.fromCode(langCode);
  }

  static Future<void> setLoggedInUser(bool loggedIn) async {
    await preferences.setBool(_loggedInUserKey, loggedIn);
  }

  static Future<bool> isUserLoggedIn() async {
    return preferences.getBool(_loggedInUserKey) ?? false;
  }

  static Future<void> setLanguage(Language language) async {
    await preferences.setString(_languageKey, language.code);
    Language.current = language;
  }

  static String? getLanguage() => preferences.getString(_languageKey);

  static Future<void> setItem(String key, String value) async {
    await preferences.setString(key, value);
  }

  static Future<String?> getItem(String key) async {
    return preferences.getString(key);
  }

  static Future<void> removeItem(String key) async {
    await preferences.remove(key);
  }

  static Future<void> removeLoggedInUser() async {
    await preferences.remove(_loggedInUserKey);
  }

  static Future<void> clear() async {
    await preferences.clear();
  }
}
