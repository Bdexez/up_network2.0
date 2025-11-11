import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/base_ui/notification_controller.dart';
import 'package:henox/helpers/theme/admin_theme.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_button.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_flex.dart';
import 'package:henox/helpers/widgets/my_flex_item.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/helpers/widgets/my_text_style.dart';
import 'package:henox/images.dart';
import 'package:henox/view/layouts/layout.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> with SingleTickerProviderStateMixin, UIMixin {
  late NotificationController controller;

  @override
  void initState() {
    controller = Get.put(NotificationController(this));
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'notification_controller',
        builder: (controller) {
          return Column(
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Notifications", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Base UI'),
                        MyBreadcrumbItem(name: 'Notifications'),
                      ],
                    ),
                  ],
                ),
              ),
              MySpacing.height(flexSpacing),
              Padding(
                padding: MySpacing.x(flexSpacing / 2),
                child: MyFlex(
                  children: [
                    MyFlexItem(sizes: 'lg-6', child: customNotification()),
                    MyFlexItem(sizes: 'lg-6', child: toastNotificationCustomizer()),
                    MyFlexItem(sizes: 'lg-6', child: basic()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget toastNotificationCustomizer() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 0,
      clipBehavior: Clip.antiAliasWithSaveLayer,
      borderRadiusAll: 8,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: MySpacing.only(left: 23, top: 20, bottom: 8, right: 23),
            child: MyText.titleMedium("${controller.showBanner ? "${"Banner"}" : "${"Toast"}"} Customizer", fontWeight: 600),
          ),
          Divider(height: 24),
          Padding(
            padding: MySpacing.only(left: 23, top: 8, bottom: 23, right: 23),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  clipBehavior: Clip.antiAliasWithSaveLayer,
                  spacing: 16,
                  runSpacing: 16,
                  children: [
                    buildMessageType(),
                    buildColorVariation(),
                    if (!controller.showBanner) buildFloatingType(),
                  ],
                ),
                MySpacing.height(12),
                MyText.bodyMedium("Title Text", fontWeight: 600),
                MySpacing.height(8),
                TextFormField(
                  controller: controller.toastTitleController,
                  decoration: InputDecoration(
                      labelText: "Toast Text",
                      filled: true,
                      contentPadding: MySpacing.all(16),
                      border: outlineInputBorder,
                      disabledBorder: outlineInputBorder,
                      enabledBorder: outlineInputBorder,
                      focusedBorder: outlineInputBorder,
                      isCollapsed: true,
                      floatingLabelBehavior: FloatingLabelBehavior.never),
                ),
                MySpacing.height(12),
                buildAction(),
                MySpacing.height(12),
                buildTimeOut(),
                Center(
                  child: MyButton(
                    onPressed: controller.show,
                    elevation: 0,
                    padding: MySpacing.xy(20, 16),
                    backgroundColor: contentTheme.primary,
                    borderRadiusAll: 8,
                    child: MyText.bodySmall(
                      'Show',
                      color: contentTheme.onPrimary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget basic() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Basic", fontWeight: 600),
          MySpacing.height(20),
          if (!controller.isShowBasicNotification)
            MyContainer.bordered(
              paddingAll: 0,
              width: 400,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    color: contentTheme.secondary.withAlpha(32),
                    child: Padding(
                      padding: MySpacing.xy(12, 4),
                      child: Row(
                        children: [
                          Image.asset(Images.logoSm, height: 20),
                          MySpacing.width(12),
                          MyText.bodySmall("Admin Template", fontWeight: 600),
                          Spacer(),
                          MyText.bodySmall("Admin Template", fontWeight: 600),
                          MySpacing.width(12),
                          IconButton(
                              onPressed: controller.onShowBasicNotification,
                              visualDensity: VisualDensity.compact,
                              icon: Icon(LucideIcons.x, size: 12))
                        ],
                      ),
                    ),
                  ),
                  Divider(height: 0),
                  Padding(
                    padding: MySpacing.all(8),
                    child: MyText.bodyMedium("Hello, world! This is a toast message.", fontWeight: 600),
                  ),
                ],
              ),
            )
        ],
      ),
    );
  }

  Widget customNotification() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      padding: MySpacing.nBottom(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Custom Content", fontWeight: 600),
          MySpacing.height(20),
          MyText.titleMedium("Basic", fontWeight: 600),
          MySpacing.height(20),
          CustomNotificationContentOne(color: contentTheme.secondary),
          CustomNotificationContentOne(color: contentTheme.primary),
          CustomNotificationContentTwo(),
          CustomNotificationContentTwo(color: contentTheme.primary),
        ],
      ),
    );
  }

  Widget buildTimeOut() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        MyText.bodyMedium("Timeout", fontWeight: 600),
        SwitchListTile(
            value: controller.sticky,
            onChanged: controller.onChangeSticky,
            controlAffinity: ListTileControlAffinity.leading,
            visualDensity: getCompactDensity,
            contentPadding: MySpacing.zero,
            dense: true,
            title: MyText.bodyMedium("${"Infinite"} (∞)", fontWeight: 600)),
      ],
    );
  }

  Widget buildAction() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        MyText.bodyMedium("Actions", fontWeight: 600),
        MySpacing.height(8),
        Theme(
          data: ThemeData(unselectedWidgetColor: contentTheme.light),
          child: CheckboxListTile(
              value: controller.showCloseIcon,
              onChanged: controller.onChangeShowCloseIcon,
              controlAffinity: ListTileControlAffinity.leading,
              visualDensity: getCompactDensity,
              contentPadding: MySpacing.zero,
              activeColor: contentTheme.primary,
              dense: true,
              title: MyText.bodyMedium("Show Close Icon", fontWeight: 600)),
        ),
        Theme(
          data: ThemeData(unselectedWidgetColor: contentTheme.light),
          child: CheckboxListTile(
              value: controller.showBanner ? controller.showLeadingIcon : controller.showOkAction,
              onChanged: controller.onAction,
              activeColor: contentTheme.primary,
              controlAffinity: ListTileControlAffinity.leading,
              visualDensity: getCompactDensity,
              contentPadding: MySpacing.zero,
              dense: true,
              title: MyText.bodyMedium(
                controller.showBanner ? "Show Leading Icon" : "Show ok Action",
                fontWeight: 600,
              )),
        ),
      ],
    );
  }

  Widget buildFloatingType() {
    return SizedBox(
      width: 150,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Floating Type", fontWeight: 600),
          MySpacing.height(12),
          DropdownButtonFormField<SnackBarBehavior>(
            value: controller.selectedBehavior,
            decoration: InputDecoration(
              hintText: "Select Type",
              hintStyle: MyTextStyle.bodyMedium(),
              border: outlineInputBorder,
              disabledBorder: outlineInputBorder,
              enabledBorder: outlineInputBorder,
              focusedBorder: outlineInputBorder,
              contentPadding: MySpacing.all(12),
              isCollapsed: true,
              filled: true,
              floatingLabelBehavior: FloatingLabelBehavior.never,
            ),
            dropdownColor: contentTheme.background,
            onChanged: (SnackBarBehavior? newValue) {
              if (newValue != null) {
                controller.onChangeBehavior(newValue);
              }
            },
            items: SnackBarBehavior.values.map<DropdownMenuItem<SnackBarBehavior>>(
              (SnackBarBehavior behavior) {
                return DropdownMenuItem<SnackBarBehavior>(
                  value: behavior,
                  child: InkWell(
                    onTap: () => controller.onChangeBehavior(behavior),
                    child: MyText.labelMedium(behavior.name.capitalize!),
                  ),
                );
              },
            ).toList(),
          ),
        ],
      ),
    );
  }

  Widget buildColorVariation() {
    return SizedBox(
      width: 150,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Color variation", fontWeight: 600),
          MySpacing.height(12),
          DropdownButtonFormField<ContentThemeColor>(
            dropdownColor: contentTheme.background,
            value: controller.selectedColor,
            onChanged: controller.onChangeColor,
            decoration: InputDecoration(
              hintText: "Select Type",
              hintStyle: MyTextStyle.bodyMedium(),
              border: outlineInputBorder,
              disabledBorder: outlineInputBorder,
              enabledBorder: outlineInputBorder,
              focusedBorder: outlineInputBorder,
              contentPadding: MySpacing.all(12),
              isCollapsed: true,
              filled: true,
              floatingLabelBehavior: FloatingLabelBehavior.never,
            ),
            items: ContentThemeColor.values.map((color) {
              return DropdownMenuItem<ContentThemeColor>(
                value: color,
                child: InkWell(
                  onTap: () => controller.onChangeColor(color),
                  child: MyText.labelMedium(
                    color.name.capitalize!,
                    fontWeight: 600,
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget buildMessageType() {
    return SizedBox(
      width: 150,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Message Type", fontWeight: 600),
          MySpacing.height(12),
          DropdownButtonFormField<bool>(
            value: controller.showBanner,
            decoration: InputDecoration(
              hintText: "Select Type",
              hintStyle: MyTextStyle.bodyMedium(),
              border: outlineInputBorder,
              disabledBorder: outlineInputBorder,
              enabledBorder: outlineInputBorder,
              focusedBorder: outlineInputBorder,
              contentPadding: MySpacing.all(12),
              isCollapsed: true,
              filled: true,
              floatingLabelBehavior: FloatingLabelBehavior.never,
            ),
            dropdownColor: contentTheme.background,
            onChanged: (bool? newValue) {
              controller.setBannerType(newValue!);
            },
            items: [
              DropdownMenuItem<bool>(
                value: false,
                child: InkWell(
                  onTap: () => controller.setBannerType(false),
                  child: MyText.labelMedium("Toast"),
                ),
              ),
              DropdownMenuItem<bool>(
                value: true,
                child: InkWell(onTap: () => controller.setBannerType(true), child: MyText.labelMedium("Banner")),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class CustomNotificationContentOne extends StatefulWidget {
  final Color? color;
  CustomNotificationContentOne({super.key, this.color});

  @override
  State<CustomNotificationContentOne> createState() => _CustomNotificationContentOneState();
}

class _CustomNotificationContentOneState extends State<CustomNotificationContentOne> with UIMixin {
  bool isShowNotification = false;

  void onShowBasicNotification() {
    isShowNotification = !isShowNotification;
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return isShowNotification
        ? SizedBox()
        : MyContainer(
            margin: MySpacing.bottom(20),
            paddingAll: 0,
            color: widget.color,
            child: Padding(
              padding: MySpacing.xy(12, 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  MyText.bodySmall("Hello, world! This is a toast message.", fontWeight: 600,muted: true
                      , color: contentTheme.onPrimary),
                  IconButton(
                      onPressed: onShowBasicNotification,
                      visualDensity: VisualDensity.compact,
                      icon: Icon(LucideIcons.x, size: 12, color: contentTheme.onPrimary))
                ],
              ),
            ),
          );
  }
}

class CustomNotificationContentTwo extends StatefulWidget {
  final Color? color;
  CustomNotificationContentTwo({super.key, this.color});

  @override
  State<CustomNotificationContentTwo> createState() => _CustomNotificationContentTwoState();
}

class _CustomNotificationContentTwoState extends State<CustomNotificationContentTwo> with UIMixin {
  bool isShowNotification = false;

  void onShowBasicNotification() {
    isShowNotification = !isShowNotification;
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return isShowNotification
        ? SizedBox()
        : MyCard(
            color: widget.color,
            margin: MySpacing.bottom(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                MyText.bodySmall("Hello, world! This is a toast message.",
                    fontWeight: 600, color: widget.color == null ? contentTheme.dark : contentTheme.onPrimary),
                Divider(height: 28),
                Row(
                  children: [
                    MyContainer(
                      paddingAll: 8,
                      color: widget.color == null ? contentTheme.primary : contentTheme.onPrimary,
                      child:
                          MyText.bodySmall("Tack Action", fontWeight: 600, color: widget.color == null ? contentTheme.onPrimary : contentTheme.dark),
                    ),
                    MySpacing.width(20),
                    MyContainer(
                      onTap: onShowBasicNotification,
                      paddingAll: 8,
                      color: contentTheme.secondary,
                      child: MyText.bodyMedium("Close", fontWeight: 600, color: contentTheme.onPrimary),
                    ),
                  ],
                ),
              ],
            ),
          );
  }
}
