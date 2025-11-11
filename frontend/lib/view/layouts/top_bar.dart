import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/controller/layout/top_bar_controller.dart';
import 'package:henox/helpers/services/localizations/language.dart';
import 'package:henox/helpers/services/url_service.dart';
import 'package:henox/helpers/theme/app_notifier.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/theme/theme_customizer.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/widgets/my_button.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/helpers/widgets/my_text_style.dart';
import 'package:henox/images.dart';
import 'package:henox/view/auth/lock_screen.dart';
import 'package:henox/view/auth/login_screen.dart';
import 'package:henox/widgets/custom_pop_menu.dart';
import 'package:provider/provider.dart';
import 'package:remixicon/remixicon.dart';

class TopBar extends StatefulWidget {
  const TopBar({
    super.key,
  });

  @override
  _TopBarState createState() => _TopBarState();
}

class _TopBarState extends State<TopBar>
    with SingleTickerProviderStateMixin, UIMixin {
  Function? languageHideFn;
  @override
  late OutlineInputBorder outlineInputBorder;
  Function? hideFn;
  TopBarController controller = Get.put(TopBarController());

  @override
  void initState() {
    outlineInputBorder = OutlineInputBorder(borderSide: BorderSide.none);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return GetBuilder(
      init: controller,
      builder: (controller) {
        return MyCard(
          shadow:
              MyShadow(position: MyShadowPosition.bottomRight, elevation: 0.5),
          height: 70,
          borderRadiusAll: 0,
          padding: MySpacing.x(24),
          color: topBarTheme.background.withAlpha(246),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              InkWell(
                  onTap: () => Get.toNamed('/dashboard'),
                  child: Image.asset(
                      ThemeCustomizer.instance.theme == ThemeMode.dark
                          ? Images.logo
                          : Images.logoDark,
                      height: 26)),
              MySpacing.width(24),
              InkWell(
                  splashColor: colorScheme.onSurface,
                  highlightColor: colorScheme.onSurface,
                  onTap: () => ThemeCustomizer.toggleLeftBarCondensed(),
                  child: Icon(Icons.menu, color: topBarTheme.onBackground)),
              MySpacing.width(24),
              SizedBox(
                width: 250,
                child: TextFormField(
                  maxLines: 1,
                  style: MyTextStyle.bodyMedium(fontWeight: 600),
                  decoration: InputDecoration(
                      hintText: "Search...",
                      hintStyle: MyTextStyle.bodyMedium(fontWeight: 600),
                      border: outlineInputBorder,
                      enabledBorder: outlineInputBorder,
                      disabledBorder: outlineInputBorder,
                      errorBorder: outlineInputBorder,
                      focusedBorder: outlineInputBorder,
                      focusedErrorBorder: outlineInputBorder,
                      isDense: true,
                      filled: true,
                      fillColor: contentTheme.secondary.withAlpha(32),
                      prefixIcon: Icon(LucideIcons.search, size: 20),
                      contentPadding: MySpacing.all(16)),
                ),
              ),
              Spacer(),
              CustomPopupMenu(
                backdrop: true,
                hideFn: (hide) => languageHideFn = hide,
                onChange: (_) {},
                offsetX: -36,
                menu: Padding(
                  padding: MySpacing.xy(8, 8),
                  child: Center(
                      child: Row(
                    children: [
                      ClipRRect(
                          clipBehavior: Clip.antiAliasWithSaveLayer,
                          borderRadius: BorderRadius.circular(2),
                          child: Image.asset(
                              'assets/lang/${ThemeCustomizer.instance.currentLanguage.locale.languageCode}.jpg',
                              width: 24,
                              height: 18,
                              fit: BoxFit.cover)),
                    ],
                  )),
                ),
                menuBuilder: (_) => buildLanguageSelector(),
              ),
              MySpacing.width(6),
              CustomPopupMenu(
                backdrop: true,
                hideFn: (hide) => hideFn = hide,
                onChange: (_) {},
                offsetX: -120,
                menu: Padding(
                  padding: MySpacing.xy(8, 8),
                  child: Center(
                    child: Icon(LucideIcons.bell, size: 20),
                  ),
                ),
                menuBuilder: (_) => buildNotifications(),
              ),
              MySpacing.width(6),
              CustomPopupMenu(
                backdrop: true,
                hideFn: (hide) => hideFn = hide,
                onChange: (_) {},
                offsetX: -100,
                menu: Padding(
                  padding: MySpacing.xy(8, 8),
                  child: Center(
                    child: Icon(LucideIcons.grip, size: 20),
                  ),
                ),
                menuBuilder: (_) => buildApps(),
              ),
              MySpacing.width(6),
              InkWell(
                  onTap: () => controller.toggleRightBar(context),
                  child: Icon(LucideIcons.settings, size: 20)),
              MySpacing.width(14),
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
                  size: 20,
                  color: topBarTheme.onBackground,
                ),
              ),
              MySpacing.width(14),
              InkWell(
                  onTap: controller.goFullScreen,
                  child: controller.isFullScreen
                      ? Icon(LucideIcons.minimize, size: 20)
                      : Icon(LucideIcons.maximize, size: 20)),
              MySpacing.width(12),
              VerticalDivider(width: 0),
              MySpacing.width(12),
              CustomPopupMenu(
                  backdrop: true,
                  onChange: (_) {},
                  menuBuilder: (_) => buildAccountMenu(),
                  hideFn: (hide) => languageHideFn = hide,
                  menu: Padding(
                    padding: MySpacing.xy(8, 8),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        MyContainer.rounded(
                            paddingAll: 0,
                            child: Image.asset(
                              Images.avatars[0],
                              height: 28,
                              width: 28,
                              fit: BoxFit.cover,
                            )),
                        MySpacing.width(8),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            MyText.labelLarge("Bdex", fontWeight: 600),
                            MyText.bodySmall("Founder",
                                fontWeight: 600, muted: true)
                          ],
                        )
                      ],
                    ),
                  ))
            ],
          ),
        );
      },
    );
  }

  Widget buildApps() {
    return MyContainer(
      paddingAll: 0,
      width: 300,
      borderRadiusAll: 8,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: MySpacing.all(12),
            child: MyText.bodyMedium("My Apps", fontWeight: 600),
          ),
          Divider(height: 0),
          Padding(
            padding: MySpacing.all(12),
            child: GridView(
              shrinkWrap: true,
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
              ),
              children: [
                MyButton(
                  onPressed: () {
                    UrlService.goGitHub();
                    hideFn?.call();
                  },
                  elevation: 0,
                  backgroundColor: Colors.transparent,
                  borderRadiusAll: 4,
                  splashColor: contentTheme.secondary.withOpacity(.2),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      MyContainer(
                        height: 32,
                        width: 32,
                        paddingAll: 0,
                        clipBehavior: Clip.antiAliasWithSaveLayer,
                        child: Image.asset(Images.github, fit: BoxFit.fill),
                      ),
                      MySpacing.height(8),
                      MyText.bodyMedium("GitHub", fontWeight: 600)
                    ],
                  ),
                ),
                MyButton(
                  padding: MySpacing.zero,
                  onPressed: () {
                    UrlService.goBitBucket();
                    hideFn?.call();
                  },
                  elevation: 0,
                  borderRadiusAll: 4,
                  splashColor: contentTheme.secondary.withOpacity(.2),
                  backgroundColor: Colors.transparent,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      MyContainer(
                        height: 32,
                        width: 32,
                        paddingAll: 0,
                        clipBehavior: Clip.antiAliasWithSaveLayer,
                        child: Image.asset(Images.bitbucket, fit: BoxFit.fill),
                      ),
                      MySpacing.height(8),
                      MyText.bodyMedium("Bitbucket", fontWeight: 600)
                    ],
                  ),
                ),
                MyButton(
                  padding: MySpacing.zero,
                  onPressed: () {
                    UrlService.goDropBox();
                    hideFn?.call();
                  },
                  elevation: 0,
                  borderRadiusAll: 4,
                  splashColor: contentTheme.secondary.withOpacity(.2),
                  backgroundColor: Colors.transparent,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      MyContainer(
                        height: 32,
                        width: 32,
                        paddingAll: 0,
                        clipBehavior: Clip.antiAliasWithSaveLayer,
                        child: Image.asset(Images.dropbox, fit: BoxFit.cover),
                      ),
                      MySpacing.height(8),
                      MyText.bodyMedium("Dropbox", fontWeight: 600)
                    ],
                  ),
                ),
                MyButton(
                  padding: MySpacing.zero,
                  onPressed: () {
                    UrlService.goSlack();
                    hideFn?.call();
                  },
                  elevation: 0,
                  borderRadiusAll: 4,
                  splashColor: contentTheme.secondary.withOpacity(.2),
                  backgroundColor: Colors.transparent,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      MyContainer(
                        height: 32,
                        width: 32,
                        paddingAll: 0,
                        clipBehavior: Clip.antiAliasWithSaveLayer,
                        child: Image.asset(Images.slack, fit: BoxFit.fill),
                      ),
                      MySpacing.height(8),
                      MyText.bodyMedium("Slack", fontWeight: 600)
                    ],
                  ),
                ),
                MyButton(
                  padding: MySpacing.zero,
                  onPressed: () {
                    UrlService.goDribbble();
                    hideFn?.call();
                  },
                  elevation: 0,
                  borderRadiusAll: 4,
                  splashColor: contentTheme.secondary.withOpacity(.2),
                  backgroundColor: Colors.transparent,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      MyContainer(
                        height: 32,
                        width: 32,
                        paddingAll: 0,
                        clipBehavior: Clip.antiAliasWithSaveLayer,
                        child: Image.asset(Images.dribbble, fit: BoxFit.fill),
                      ),
                      MySpacing.height(8),
                      MyText.bodyMedium("Dribbble", fontWeight: 600)
                    ],
                  ),
                ),
                MyButton(
                  padding: MySpacing.zero,
                  onPressed: () {
                    UrlService.goBehance();
                    hideFn?.call();
                  },
                  elevation: 0,
                  borderRadiusAll: 4,
                  splashColor: contentTheme.secondary.withOpacity(.2),
                  backgroundColor: Colors.transparent,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      MyContainer(
                        height: 32,
                        width: 32,
                        paddingAll: 0,
                        clipBehavior: Clip.antiAliasWithSaveLayer,
                        child: Image.asset(Images.behance, fit: BoxFit.cover),
                      ),
                      MySpacing.height(8),
                      MyText.bodyMedium("Behance", fontWeight: 600)
                    ],
                  ),
                )
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget buildLanguageSelector() {
    return MyContainer.bordered(
      padding: MySpacing.xy(8, 8),
      width: 125,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: Language.languages
            .map((language) => MyButton.text(
                  padding: MySpacing.xy(8, 4),
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  splashColor: contentTheme.onBackground.withAlpha(20),
                  onPressed: () async {
                    languageHideFn?.call();
                    await Provider.of<AppNotifier>(context, listen: false)
                        .changeLanguage(language, notify: true);
                    ThemeCustomizer.notify();
                    setState(() {});
                  },
                  child: Row(
                    children: [
                      ClipRRect(
                          clipBehavior: Clip.antiAliasWithSaveLayer,
                          borderRadius: BorderRadius.circular(2),
                          child: Image.asset(
                            'assets/lang/${language.locale.languageCode}.jpg',
                            width: 18,
                            height: 14,
                            fit: BoxFit.cover,
                          )),
                      MySpacing.width(8),
                      MyText.labelMedium(language.languageName)
                    ],
                  ),
                ))
            .toList(),
      ),
    );
  }

  Widget buildNotifications() {
    return MyContainer(
      paddingAll: 0,
      width: 320,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: MySpacing.x(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                MyText.titleSmall("Notification",
                    fontWeight: 700, xMuted: true),
                MyButton.text(
                    padding: MySpacing.xy(8, 12),
                    onPressed: () => hideFn?.call(),
                    elevation: 0,
                    backgroundColor: Colors.transparent,
                    splashColor: Colors.transparent,
                    child: MyText.labelSmall("Clear All",
                        xMuted: true, decoration: TextDecoration.underline))
              ],
            ),
          ),
          Divider(height: 0),
          SizedBox(
            height: 260,
            child: ListView(
              padding: MySpacing.only(left: 16, right: 16, top: 14),
              shrinkWrap: true,
              children: [
                MyText.labelMedium("TODAY", fontWeight: 700, xMuted: true),
                MySpacing.height(12),
                MyButton(
                  onPressed: () {},
                  elevation: 0,
                  padding: MySpacing.zero,
                  backgroundColor: Colors.transparent,
                  splashColor: Colors.transparent,
                  child: Row(
                    children: [
                      MyContainer.rounded(
                        paddingAll: 0,
                        height: 36,
                        width: 36,
                        color: contentTheme.primary,
                        child: Icon(Remix.message_3_line,
                            color: contentTheme.onPrimary, size: 16),
                      ),
                      MySpacing.width(16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                MyText.labelMedium("Datacrop",
                                    fontWeight: 600, muted: true),
                                MyText.bodySmall("1 min ago", muted: true)
                              ],
                            ),
                            MySpacing.height(2),
                            MyText.labelSmall(
                                "Caleb Flakera commented on admin",
                                xMuted: true),
                          ],
                        ),
                      )
                    ],
                  ),
                ),
                MySpacing.height(16),
                MyButton(
                  onPressed: () {},
                  elevation: 0,
                  padding: MySpacing.zero,
                  backgroundColor: Colors.transparent,
                  splashColor: Colors.transparent,
                  child: Row(
                    children: [
                      MyContainer.rounded(
                        paddingAll: 0,
                        height: 36,
                        width: 36,
                        color: contentTheme.info,
                        child: Icon(Remix.user_add_line,
                            color: contentTheme.onPrimary, size: 16),
                      ),
                      MySpacing.width(16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                MyText.labelMedium("Admin",
                                    fontWeight: 600, muted: true),
                                MySpacing.height(2),
                                MyText.bodySmall("1 hr ago", muted: true)
                              ],
                            ),
                            MyText.labelSmall("New user registered",
                                xMuted: true),
                          ],
                        ),
                      )
                    ],
                  ),
                ),
                MySpacing.height(16),
                MyText.labelMedium("YESTERDAY", fontWeight: 700, xMuted: true),
                MySpacing.height(12),
                MyButton(
                  onPressed: () {},
                  elevation: 0,
                  padding: MySpacing.zero,
                  backgroundColor: Colors.transparent,
                  splashColor: Colors.transparent,
                  child: Row(
                    children: [
                      MyContainer.rounded(
                        paddingAll: 0,
                        height: 36,
                        width: 36,
                        color: contentTheme.info,
                        child: Image.asset(Images.avatars[1]),
                      ),
                      MySpacing.width(16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                MyText.labelMedium("Cristina Pride ",
                                    fontWeight: 600, muted: true),
                                MySpacing.height(2),
                                MyText.bodySmall("1 day ago", muted: true)
                              ],
                            ),
                            MyText.labelSmall(
                                "Hi, How are you? What about our next meeting",
                                xMuted: true,
                                maxLines: 1),
                          ],
                        ),
                      )
                    ],
                  ),
                ),
                MySpacing.height(16),
                MyText.labelMedium("31 JAN 2023",
                    fontWeight: 700, xMuted: true),
                MySpacing.height(12),
                MyButton(
                  onPressed: () {},
                  elevation: 0,
                  padding: MySpacing.zero,
                  backgroundColor: Colors.transparent,
                  splashColor: Colors.transparent,
                  child: Row(
                    children: [
                      MyContainer.rounded(
                        paddingAll: 0,
                        height: 36,
                        width: 36,
                        color: contentTheme.primary,
                        child: Icon(Remix.discuss_line,
                            color: contentTheme.onPrimary, size: 16),
                      ),
                      MySpacing.width(16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            MyText.labelMedium("Datacorp",
                                fontWeight: 600, muted: true),
                            MySpacing.height(2),
                            MyText.labelSmall(
                                "Caleb Flakelar commented on Admin",
                                xMuted: true),
                          ],
                        ),
                      )
                    ],
                  ),
                ),
                MySpacing.height(16),
                MyButton(
                  onPressed: () {},
                  elevation: 0,
                  padding: MySpacing.zero,
                  backgroundColor: Colors.transparent,
                  splashColor: Colors.transparent,
                  child: Row(
                    children: [
                      MyContainer.rounded(
                        paddingAll: 0,
                        height: 36,
                        width: 36,
                        color: contentTheme.info,
                        child: Image.asset(Images.avatars[3]),
                      ),
                      MySpacing.width(16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            MyText.labelMedium("Karen Robinson",
                                fontWeight: 600, muted: true),
                            MySpacing.height(2),
                            MyText.labelSmall(
                                "Wow ! this admin looks good and awesome design",
                                xMuted: true,
                                maxLines: 1),
                          ],
                        ),
                      )
                    ],
                  ),
                ),
                MySpacing.height(12),
              ],
            ),
          ),
          Divider(height: 0),
          Center(
            child: MyButton.text(
              padding: MySpacing.xy(8, 12),
              onPressed: () => hideFn?.call(),
              elevation: 0,
              backgroundColor: Colors.transparent,
              splashColor: Colors.transparent,
              child: MyText.labelSmall("View All", color: contentTheme.primary),
            ),
          )
        ],
      ),
    );
  }

  Widget buildAccountMenu() {
    return MyContainer(
      borderRadiusAll: 8,
      width: 150,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.labelMedium("Welcome!", fontWeight: 600),
          MySpacing.height(12),
          MyButton(
            onPressed: () {
              languageHideFn?.call();
              Get.toNamed('/pages/profile');
            },
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            borderRadiusAll: AppStyle.buttonRadius.medium,
            padding: MySpacing.xy(8, 4),
            splashColor: colorScheme.onSurface.withAlpha(20),
            backgroundColor: Colors.transparent,
            child: Row(
              children: [
                Icon(LucideIcons.user,
                    size: 14, color: contentTheme.onBackground),
                MySpacing.width(8),
                MyText.labelMedium("My Account", fontWeight: 600)
              ],
            ),
          ),
          MySpacing.height(8),
          MyButton(
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            onPressed: () {
              languageHideFn?.call();
              Get.toNamed('/pages/profile');
            },
            borderRadiusAll: AppStyle.buttonRadius.medium,
            padding: MySpacing.xy(8, 4),
            splashColor: colorScheme.onSurface.withAlpha(20),
            backgroundColor: Colors.transparent,
            child: Row(
              children: [
                Icon(LucideIcons.settings,
                    size: 14, color: contentTheme.onBackground),
                MySpacing.width(8),
                MyText.labelMedium("Settings", fontWeight: 600)
              ],
            ),
          ),
          MySpacing.height(8),
          MyButton(
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            onPressed: () {
              languageHideFn?.call();
              Get.toNamed('/pages/faqs');
            },
            borderRadiusAll: AppStyle.buttonRadius.medium,
            padding: MySpacing.xy(8, 4),
            splashColor: colorScheme.onSurface.withAlpha(20),
            backgroundColor: Colors.transparent,
            child: Row(
              children: [
                Icon(Icons.support_rounded,
                    size: 14, color: contentTheme.onBackground),
                MySpacing.width(8),
                MyText.labelMedium("Support", fontWeight: 600)
              ],
            ),
          ),
          MySpacing.height(8),
          MyButton(
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            onPressed: () {
              languageHideFn?.call();
              Get.off(LockScreen());
            },
            borderRadiusAll: AppStyle.buttonRadius.medium,
            padding: MySpacing.xy(8, 4),
            splashColor: colorScheme.onSurface.withAlpha(20),
            backgroundColor: Colors.transparent,
            child: Row(
              children: [
                Icon(LucideIcons.lock_keyhole,
                    size: 14, color: contentTheme.onBackground),
                MySpacing.width(8),
                MyText.labelMedium("Lock Screen", fontWeight: 600)
              ],
            ),
          ),
          MySpacing.height(8),
          MyButton(
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            onPressed: () {
              languageHideFn?.call();
              Get.offAll(LoginScreen());
            },
            borderRadiusAll: AppStyle.buttonRadius.medium,
            padding: MySpacing.xy(8, 4),
            splashColor: contentTheme.danger.withAlpha(28),
            backgroundColor: Colors.transparent,
            child: Row(
              children: [
                Icon(LucideIcons.log_out, size: 14, color: contentTheme.danger),
                MySpacing.width(8),
                MyText.labelMedium("Log out",
                    fontWeight: 600, color: contentTheme.danger)
              ],
            ),
          )
        ],
      ),
    );
  }
}
