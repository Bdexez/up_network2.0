import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/controller/layout/layout_controller.dart';
import 'package:henox/helpers/theme/admin_theme.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/theme/theme_customizer.dart';
import 'package:henox/helpers/widgets/my_button.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_dashed_divider.dart';
import 'package:henox/helpers/widgets/my_responsive.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/images.dart';
import 'package:henox/view/layouts/left_bar.dart';
import 'package:henox/view/layouts/right_bar.dart';
import 'package:henox/view/layouts/top_bar.dart';
import 'package:henox/widgets/custom_pop_menu.dart';

class Layout extends StatelessWidget {
  final Widget? child;

  final LayoutController controller = LayoutController();
  final topBarTheme = AdminTheme.theme.topBarTheme;
  final contentTheme = AdminTheme.theme.contentTheme;

  Layout({super.key, this.child});

  @override
  Widget build(BuildContext context) {
    return MyResponsive(builder: (BuildContext context, _, screenMT) {
      return GetBuilder(
          init: controller,
          builder: (controller) {
            if (screenMT.isMobile || screenMT.isTablet) {
              return mobileScreen();
            } else {
              return largeScreen();
            }
          });
    });
  }

  Widget mobileScreen() {
    return Scaffold(
      key: controller.scaffoldKey,
      endDrawer: RightBar(),
      appBar: AppBar(
        elevation: 0,
        actions: [
          InkWell(
            onTap: () {
              ThemeCustomizer.setTheme(
                  ThemeCustomizer.instance.theme == ThemeMode.dark
                      ? ThemeMode.light
                      : ThemeMode.dark);
            },
            child: Icon(
              ThemeCustomizer.instance.theme == ThemeMode.dark
                  ? LucideIcons.sun
                  : LucideIcons.moon,
              size: 18,
              color: topBarTheme.onBackground,
            ),
          ),
          MySpacing.width(8),
          CustomPopupMenu(
            backdrop: true,
            onChange: (_) {},
            offsetX: -180,
            menu: Padding(
              padding: MySpacing.xy(8, 8),
              child: Center(
                child: Icon(
                  LucideIcons.bell,
                  size: 18,
                ),
              ),
            ),
            menuBuilder: (_) => buildNotifications(),
          ),
          MySpacing.width(8),
          CustomPopupMenu(
            backdrop: true,
            onChange: (_) {},
            offsetX: -90,
            offsetY: 4,
            menu: Padding(
              padding: MySpacing.xy(8, 8),
              child: MyContainer.rounded(
                  paddingAll: 0,
                  child: Image.asset(
                    Images.avatars[0],
                    height: 28,
                    width: 28,
                    fit: BoxFit.cover,
                  )),
            ),
            menuBuilder: (_) => buildAccountMenu(),
          ),
          MySpacing.width(20)
        ],
      ), // endDrawer: RightBar(),
      drawer: LeftBar(),
      body: SingleChildScrollView(
        key: controller.scrollKey,
        child: child,
      ),
    );
  }

  Widget largeScreen() {
    return Scaffold(
      key: controller.scaffoldKey,
      floatingActionButtonAnimator: FloatingActionButtonAnimator.scaling,
      endDrawer: RightBar(),
      body: Row(
        children: [
          Expanded(
              child: Stack(
            clipBehavior: Clip.antiAliasWithSaveLayer,
            children: [
              Padding(
                padding: MySpacing.top(60),
                child: LeftBar(
                    isCondensed: ThemeCustomizer.instance.leftBarCondensed),
              ),
              Positioned(
                top: 0,
                right: 0,
                left: ThemeCustomizer.instance.leftBarCondensed ? 60 : 250,
                bottom: 0,
                child: SingleChildScrollView(
                    padding:
                        MySpacing.fromLTRB(0, 72 + flexSpacing, 0, flexSpacing),
                    child: child),
              ),
              Positioned(top: 0, left: 0, right: 0, child: TopBar()),
            ],
          )),
        ],
      ),
    );
  }

  Widget buildNotifications() {
    Widget buildNotification(String title, String description) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.labelLarge(title),
          MySpacing.height(4),
          MyText.bodySmall(description)
        ],
      );
    }

    return MyContainer.bordered(
      paddingAll: 0,
      width: 250,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: MySpacing.xy(16, 12),
            child: MyText.titleMedium("Notification", fontWeight: 600),
          ),
          MyDashedDivider(
              height: 1, color: theme.dividerColor, dashSpace: 4, dashWidth: 6),
          Padding(
            padding: MySpacing.xy(16, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                buildNotification("Your order is received",
                    "Order #1232 is ready to deliver"),
                MySpacing.height(12),
                buildNotification("Account Security ",
                    "Your account password changed 1 hour ago"),
              ],
            ),
          ),
          MyDashedDivider(
              height: 1, color: theme.dividerColor, dashSpace: 4, dashWidth: 6),
          Padding(
            padding: MySpacing.xy(16, 0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                MyButton.text(
                  onPressed: () {},
                  splashColor: contentTheme.primary.withAlpha(28),
                  child: MyText.labelSmall(
                    "View All",
                    color: contentTheme.primary,
                  ),
                ),
                MyButton.text(
                  onPressed: () {},
                  splashColor: contentTheme.danger.withAlpha(28),
                  child: MyText.labelSmall(
                    "Clear",
                    color: contentTheme.danger,
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget buildAccountMenu() {
    return MyContainer.bordered(
      paddingAll: 0,
      width: 150,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: MySpacing.xy(8, 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                MyButton(
                  onPressed: () => {},
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  borderRadiusAll: AppStyle.buttonRadius.medium,
                  padding: MySpacing.xy(8, 4),
                  splashColor: contentTheme.onBackground.withAlpha(20),
                  backgroundColor: Colors.transparent,
                  child: Row(
                    children: [
                      Icon(
                        LucideIcons.user,
                        size: 14,
                        color: contentTheme.onBackground,
                      ),
                      MySpacing.width(8),
                      MyText.labelMedium(
                        "My Account",
                        fontWeight: 600,
                      )
                    ],
                  ),
                ),
                MySpacing.height(4),
                MyButton(
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  onPressed: () => {},
                  borderRadiusAll: AppStyle.buttonRadius.medium,
                  padding: MySpacing.xy(8, 4),
                  splashColor: contentTheme.onBackground.withAlpha(20),
                  backgroundColor: Colors.transparent,
                  child: Row(
                    children: [
                      Icon(
                        LucideIcons.settings,
                        size: 14,
                        color: contentTheme.onBackground,
                      ),
                      MySpacing.width(8),
                      MyText.labelMedium(
                        "Settings",
                        fontWeight: 600,
                      )
                    ],
                  ),
                ),
              ],
            ),
          ),
          Divider(
            height: 1,
            thickness: 1,
          ),
          Padding(
            padding: MySpacing.xy(8, 8),
            child: MyButton(
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              onPressed: () => {},
              borderRadiusAll: AppStyle.buttonRadius.medium,
              padding: MySpacing.xy(8, 4),
              splashColor: contentTheme.danger.withAlpha(28),
              backgroundColor: Colors.transparent,
              child: Row(
                children: [
                  Icon(
                    LucideIcons.log_out,
                    size: 14,
                    color: contentTheme.danger,
                  ),
                  MySpacing.width(8),
                  MyText.labelMedium(
                    "Log out",
                    fontWeight: 600,
                    color: contentTheme.danger,
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
