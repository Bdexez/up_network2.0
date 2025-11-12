import 'package:flutter/material.dart';

class Language {
  final Locale locale;
  final bool supportRTL;
  final String languageName;

  /// 🔹 Langue actuellement sélectionnée (modifiable par LocalStorage)
  static late Language current;

  /// 🔹 Liste des langues supportées
  static final List<Language> languages = [
    Language(const Locale('en'), "English"),
    Language(const Locale('hi'), "हिंदी"),
    Language(const Locale('es'), "Español"),
    Language(const Locale('ar'), "عربي", true),
    Language(const Locale('fr'), "Français"),
  ];

  Language(this.locale, this.languageName, [this.supportRTL = false]);

  /// 🔹 Retourne la liste des locales Flutter supportées
  static List<Locale> getLocales() => languages.map((e) => e.locale).toList();

  /// 🔹 Retourne la liste des codes langues
  static List<String> getLanguagesCodes() =>
      languages.map((e) => e.locale.languageCode).toList();

  /// 🔹 Récupère la langue à partir du code (utilisée par LocalStorage)
  static Language fromCode(String code) {
    return languages.firstWhere(
      (lang) => lang.locale.languageCode == code,
      orElse: () => languages.first,
    );
  }

  /// 🔹 Récupère la langue à partir du code (utilisée par AppLocalizationsDelegate)
  static Language getLanguageFromCode(String code) => fromCode(code);

  /// 🔹 Recherche par Locale
  static Language? findFromLocale(Locale locale) {
    return languages.firstWhere(
      (l) => l.locale.languageCode == locale.languageCode,
      orElse: () => languages.first,
    );
  }

  /// 🔹 Clonage optionnel
  Language clone() => Language(locale, languageName, supportRTL);

  @override
  String toString() =>
      'Language{locale: ${locale.languageCode}, RTL: $supportRTL, name: $languageName}';
}
