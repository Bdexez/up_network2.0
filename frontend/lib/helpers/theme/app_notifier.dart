import 'package:flutter/material.dart';
import 'package:henox/helpers/services/localizations/language.dart';
import 'package:henox/helpers/services/storage/local_storage.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/theme/theme_customizer.dart';
import 'package:henox/helpers/widgets/my.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppNotifier extends ChangeNotifier {
  AppNotifier();

  /// 🔹 Initialisation complète (appelée au démarrage)
  Future<void> init() async {
    _changeTheme();
    notifyListeners();
  }

  /// 🔹 Met à jour le thème courant et sauvegarde la config
  Future<void> updateTheme(ThemeCustomizer themeCustomizer) async {
    _changeTheme();
    notifyListeners();

    // ✅ On enregistre le thème directement via SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString("theme_customizer", themeCustomizer.toJSON());
  }

  /// 🔹 Met à jour les préférences du thème en local
  Future<void> updateInStorage(ThemeCustomizer themeCustomizer) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString("theme_customizer", themeCustomizer.toJSON());
  }

  /// 🔹 Gère la direction du texte (LTR/RTL)
  void changeDirectionality(TextDirection textDirection, [bool notify = true]) {
    AppTheme.textDirection = textDirection;
    My.setTextDirection(textDirection);
    if (notify) notifyListeners();
  }

  /// 🔹 Change la langue et la direction (RTL/LTR)
  Future<void> changeLanguage(Language language,
      {bool notify = true, bool changeDirection = true}) async {
    if (changeDirection) {
      if (language.supportRTL) {
        changeDirectionality(TextDirection.rtl, false);
      } else {
        changeDirectionality(TextDirection.ltr, false);
      }
    }

    // ✅ Sauvegarde dans les préférences
    await LocalStorage.setLanguage(language);

    // ✅ Applique via le ThemeCustomizer
    await ThemeCustomizer.changeLanguage(language);

    if (notify) notifyListeners();
  }

  /// 🔹 Applique le thème actif
  void _changeTheme() {
    AppTheme.theme = AppTheme.getThemeFromThemeMode();
    AppStyle.changeMyTheme();
  }
}
