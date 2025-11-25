import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/helpers/services/auth_service.dart';
import 'package:henox/route/route_method.dart';

// === Écrans ===
import 'package:henox/view/auth/login_screen.dart';
import 'package:henox/view/auth/register_account_screen.dart';
import 'package:henox/view/auth/forgot_password_screen.dart';
import 'package:henox/view/auth/confirm_mail_screen.dart';
import 'package:henox/view/auth/lock_screen.dart';
import 'package:henox/view/auth/log_out_screen.dart';
import 'package:henox/view/products/product_list_screen.dart';
import 'package:henox/view/products/product_form_screen.dart';

import 'package:henox/view/dashboard/dashboard_screen.dart';
import 'package:henox/view/dashboard/second_dashboard_screen.dart';
import 'package:henox/view/apps/calendar_screen.dart';
import 'package:henox/view/apps/chat_screen.dart';
import 'package:henox/view/apps/email/inbox_screen.dart';
import 'package:henox/view/apps/email/read_email_screen.dart';
import 'package:henox/view/apps/file_manager_screen.dart';
import 'package:henox/view/apps/kanban/kanban_bord_screen.dart';
import 'package:henox/view/apps/task/task_list_screen.dart';
import 'package:henox/view/apps/task/task_detail_screen.dart';
import 'package:henox/view/ui/profile_screen.dart';
import 'package:henox/view/ui/faqs_screen.dart';
import 'package:henox/view/ui/pricing_screen.dart';
import 'package:henox/view/ui/maintenance_screen.dart';
import 'package:henox/view/ui/starter_pages.dart';
import 'package:henox/view/ui/with_preloader_screen.dart';
import 'package:henox/view/ui/timeline_screen.dart';
import 'package:henox/view/ui/invoice_screen.dart';
import 'package:henox/view/error/error_404.dart';
import 'package:henox/view/error/error_404_alt_screen.dart';
import 'package:henox/view/error/error_500_screen.dart';
import 'package:henox/view/components/chart_screen.dart';
import 'package:henox/view/components/forms/basic_element_screen.dart';
import 'package:henox/view/components/forms/validation_screen.dart';
import 'package:henox/view/components/forms/wizard_screen.dart';
import 'package:henox/view/components/forms/file_upload_screen.dart';
import 'package:henox/view/components/forms/editor_screen.dart';
import 'package:henox/view/components/icons_screen.dart';
import 'package:henox/view/components/map_screen.dart';
import 'package:henox/view/components/tables/basic_table_screen.dart';
import 'package:henox/view/components/widgets_screen.dart';
import 'package:henox/view/components/base_ui/alert_screen.dart';
import 'package:henox/view/components/base_ui/accordion_screen.dart';
import 'package:henox/view/components/base_ui/avatars_screen.dart';
import 'package:henox/view/components/base_ui/buttons_screen.dart';
import 'package:henox/view/components/base_ui/card_screen.dart';
import 'package:henox/view/components/base_ui/breadcrumb_screen.dart';
import 'package:henox/view/components/base_ui/utilities_screen.dart';
import 'package:henox/view/components/extended_ui/dragula_screen.dart';
import 'package:henox/view/components/extended_ui/range_slider_screen.dart';
import 'package:henox/view/components/extended_ui/rating_bar_screen.dart';
import 'package:henox/view/components/extended_ui/scroll_bar_screen.dart';

class AuthMiddleware extends GetMiddleware {
  @override
  RouteSettings? redirect(String? routeName) {
    final publicRoutes = [
      route.login,
      route.createAccount,
      route.forgotPassword,
      route.confirmMail,
      route.lock,
      route.logOut,
    ];

    // Laisser passer si route publique
    if (publicRoutes.contains(routeName)) return null;

    // Rediriger vers login si non connecté
    if (!AuthService.isLoggedIn) {
      return const RouteSettings(name: '/login');
    }

    return null;
  }
}

List<GetPage> getPageRoute() => [
      // === Routes publiques ===
      GetPage(name: route.login, page: () => LoginScreen()),
      GetPage(name: route.createAccount, page: () => RegisterAccountScreen()),
      GetPage(name: route.forgotPassword, page: () => ForgotPasswordScreen()),
      GetPage(name: route.confirmMail, page: () => ConfirmMailScreen()),
      GetPage(name: route.lock, page: () => LockScreen()),
      GetPage(name: route.logOut, page: () => LogOutScreen()),

      // === Routes protégées ===
      _protected('/', () => DashboardScreen()),
      _protected(route.dashboard, () => DashboardScreen()),
      _protected(route.dashboard2, () => SecondDashboardScreen()),
      _protected(route.calendar, () => CalendarScreen()),
      _protected(route.chat, () => ChatScreen()),
      _protected(route.emailInbox, () => InboxScreen()),
      _protected(route.readEmail, () => ReadEmailScreen()),
      _protected(route.taskList, () => TaskListScreen()),
      _protected(route.taskDetail, () => TaskDetailScreen()),
      _protected(route.kanbanBoard, () => KanbanBoardScreen()),
      _protected(route.profile, () => ProfileScreen()),
      _protected(route.faqs, () => FaqsScreen()),
      _protected(route.fileManager, () => FileManagerScreen()),
      _protected(route.pricing, () => PricingScreen()),
      _protected(route.maintenance, () => MaintenanceScreen()),
      _protected(route.starterPage, () => StarterPages()),
      _protected(route.withPreloader, () => WithPreloaderScreen()),
      _protected(route.timeLine, () => TimeLineScreen()),
      _protected(route.invoice, () => InvoiceScreen()),
      _protected(route.accordion, () => AccordionScreen()),
      _protected(route.alert, () => AlertScreen()),
      _protected(route.avatars, () => AvatarsScreen()),
      _protected(route.buttons, () => ButtonsScreen()),
      _protected(route.card, () => CardScreen()),
      _protected(route.breadcrumb, () => BreadcrumbScreen()),
      _protected(route.utilities, () => UtilitiesScreen()),
      _protected(route.dragula, () => DragulaScreen()),
      _protected(route.rangeSlider, () => RangeSliderScreen()),
      _protected(route.ratings, () => RatingBarScreen()),
      _protected(route.scrollbar, () => ScrollBarScreen()),
      _protected(route.basicTable, () => BasicTableScreen()),
      _protected(route.charts, () => ChartScreen()),
      _protected(route.basicElement, () => BasicElementScreen()),
      _protected(route.validation, () => ValidationScreen()),
      _protected(route.wizard, () => WizardScreen()),
      _protected(route.fileUpload, () => FileUploadScreen()),
      _protected(route.editor, () => EditorScreen()),
      _protected(route.map, () => MapScreen()),
      _protected(route.icon, () => IconsScreen()),
      _protected(route.widgets, () => WidgetsScreen()),
      _protected(route.error404, () => Error404Screen()),
      _protected(route.error404Alt, () => Error404AltScreen()),
      _protected(route.error500, () => Error500Screen()),
      // === Routes produits ===
      _protected('/products', () => ProductListScreen()),
      _protected('/products/create', () => ProductFormScreen()),
      _protected('/products/edit/:id', () => ProductFormScreen()),
    ];

GetPage _protected(String name, Widget Function() page) => GetPage(
      name: name,
      page: page,
      middlewares: [AuthMiddleware()],
    );
