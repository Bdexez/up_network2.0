import 'package:flutter/material.dart';
import 'package:henox/helpers/services/localizations/language.dart';
import 'package:henox/helpers/theme/app_notifier.dart';
import 'package:provider/provider.dart';

class AppLocalizationsDelegate extends LocalizationsDelegate<void> {
  final BuildContext context;

  const AppLocalizationsDelegate(this.context);

  @override
  bool isSupported(Locale locale) =>
      Language.getLanguagesCodes().contains(locale.languageCode);

  @override
  Future<void> load(Locale locale) async {
    // Change dynamiquement la langue de l’application via AppNotifier
    Provider.of<AppNotifier>(context, listen: false)
        .changeLanguage(Language.getLanguageFromCode(locale.languageCode));
  }

  @override
  bool shouldReload(covariant LocalizationsDelegate<void> old) => false;
}
