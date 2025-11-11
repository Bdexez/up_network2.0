import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:get/get.dart';
import 'package:henox/helpers/extensions/app_localization_delegate.dart';
import 'package:henox/helpers/services/localizations/language.dart';
import 'package:henox/helpers/services/navigation_services.dart';
import 'package:henox/helpers/services/storage/local_storage.dart';
import 'package:henox/helpers/theme/app_notifier.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/theme/theme_customizer.dart';
import 'package:henox/route/routes.dart';
import 'package:henox/route/routes_name.dart';
import 'package:provider/provider.dart';
import 'package:url_strategy/url_strategy.dart';
import 'package:henox/helpers/services/auth_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  setPathUrlStrategy();

  await LocalStorage.init();
  AppStyle.init();
  await ThemeCustomizer.init();
  await AuthService.init(); // Ajouté pour initialiser le statut utilisateur

  runApp(ChangeNotifierProvider<AppNotifier>(
    create: (_) => AppNotifier(),
    child: const MyApp(),
  ));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final route = RoutesName();

    return Consumer<AppNotifier>(
      builder: (_, notifier, __) {
        return GetMaterialApp(
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: ThemeCustomizer.instance.theme,
          navigatorKey: NavigationService.navigatorKey,
          initialRoute: AuthService.isLoggedIn ? route.dashboard : route.login,
          getPages: getPageRoute(),
          builder: (context, child) {
            NavigationService.registerContext(context);
            return Directionality(
              textDirection: AppTheme.textDirection,
              child: child ?? const SizedBox.shrink(),
            );
          },
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: Language.getLocales(),
        );
      },
    );
  }
}
