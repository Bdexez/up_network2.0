import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/base_ui/alert_controller.dart';
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
import 'package:henox/helpers/widgets/my_list_extension.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/view/layouts/layout.dart';

class AlertScreen extends StatefulWidget {
  const AlertScreen({super.key});

  @override
  State<AlertScreen> createState() => _AlertScreenState();
}

class _AlertScreenState extends State<AlertScreen> with UIMixin {
  late AlertController controller;

  @override
  void initState() {
    controller = Get.put(AlertController());

    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'alert_controller',
        builder: (controller) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Alerts", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Base UI'),
                        MyBreadcrumbItem(name: 'Alerts'),
                      ],
                    ),
                  ],
                ),
              ),
              MySpacing.height(flexSpacing),
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: MyFlex(
                  contentPadding: false,
                  children: [
                    MyFlexItem(sizes: 'lg-6 md-6', child: defaultAlert()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: dismissingAlerts()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: customAlerts()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: linkColor()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: iconWithAlert()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: additionalContent()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: liveAlert()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget defaultAlert() {
    Widget defaultAlertWidget(String colorName, Color color) {
      return MyContainer.bordered(
        width: MediaQuery.of(context).size.width,
        color: color.withOpacity(.2),
        borderColor: color,
        paddingAll: 12,
        onTap: () {},
        child: Row(
          children: [
            MyText.bodySmall("$colorName - ", fontWeight: 600, color: colorName == 'Light' ? contentTheme.dark : color),
            Expanded(child: MyText.bodySmall("A Simple $colorName alert--Check it out!",overflow: TextOverflow.ellipsis, muted: true, color: colorName == 'Light' ? contentTheme.dark : color)),
          ],
        ),
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Default Alert", fontWeight: 600),
          MySpacing.height(16),
          defaultAlertWidget("Primary", contentTheme.primary),
          MySpacing.height(16),
          defaultAlertWidget("Secondary", contentTheme.secondary),
          MySpacing.height(16),
          defaultAlertWidget("Success", contentTheme.success),
          MySpacing.height(16),
          defaultAlertWidget("Error", contentTheme.danger),
          MySpacing.height(16),
          defaultAlertWidget("Warning", contentTheme.warning),
          MySpacing.height(16),
          defaultAlertWidget("Info", contentTheme.info),
          MySpacing.height(16),
          defaultAlertWidget("Pink", contentTheme.pink),
          MySpacing.height(16),
          defaultAlertWidget("Purple", contentTheme.purple),
          MySpacing.height(16),
          defaultAlertWidget("Light", contentTheme.light),
          MySpacing.height(16),
          defaultAlertWidget("Dark", contentTheme.dark),
        ],
      ),
    );
  }

  Widget dismissingAlerts() {
    Widget dismissingAlertsWidgets(String colorName, Color color, void Function()? onTap) {
      return MyContainer(
        color: color,
        paddingAll: 12,
        margin: MySpacing.only(bottom: 15),
        child: Row(
          children: [
            MyText.bodySmall("$colorName - ", fontWeight: 600, color: colorName == 'Light' ? contentTheme.dark : contentTheme.onPrimary),
            Expanded(
              child: MyText.bodySmall("A Simple $colorName alert--Check it out!",overflow: TextOverflow.ellipsis,
                  muted: true, color: colorName == 'Light' ? contentTheme.dark : contentTheme.onPrimary),
            ),
            InkWell(onTap: onTap, child: Icon(LucideIcons.x, size: 17, color: colorName == 'Light' ? contentTheme.dark : contentTheme.onPrimary))
          ],
        ),
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Dismissing Alerts", fontWeight: 600),
          MySpacing.height(16),
          ...controller.dismissingAlerts.mapIndexed(
            (index, element) {
              dynamic alert = controller.dismissingAlerts[index];
              return dismissingAlertsWidgets(alert['colorName'], Color(int.parse(alert['color'])), () => controller.removeColorToggle(index));
            },
          ),
        ],
      ),
    );
  }

  Widget customAlerts() {
    Widget customAlertsWidget(String colorName, Color color) {
      return MyContainer.bordered(
        width: MediaQuery.of(context).size.width,
        paddingAll: 12,
        borderColor: color,
        child: Row(
          children: [
            MyText.bodySmall("This is a ", muted: true, color: colorName == 'Light' ? contentTheme.dark : color),
            MyText.bodySmall("$colorName ", fontWeight: 600, color: colorName == 'Light' ? contentTheme.dark : color),
            MyText.bodySmall("alert--Check it out!", muted: true, color: colorName == 'Light' ? contentTheme.dark : color),
          ],
        ),
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Custom Alerts", fontWeight: 600),
          MySpacing.height(16),
          customAlertsWidget("Primary", contentTheme.primary),
          MySpacing.height(16),
          customAlertsWidget("Secondary", contentTheme.secondary),
          MySpacing.height(16),
          customAlertsWidget("Success", contentTheme.success),
          MySpacing.height(16),
          customAlertsWidget("Error", contentTheme.danger),
          MySpacing.height(16),
          customAlertsWidget("Warning", contentTheme.warning),
          MySpacing.height(16),
          customAlertsWidget("Info", contentTheme.info),
          MySpacing.height(16),
          customAlertsWidget("Pink", contentTheme.pink),
          MySpacing.height(16),
          customAlertsWidget("Purple", contentTheme.purple),
          MySpacing.height(16),
          customAlertsWidget("Light", contentTheme.light),
          MySpacing.height(16),
          customAlertsWidget("Dark", contentTheme.dark),
        ],
      ),
    );
  }

  Widget linkColor() {
    Widget linkColorWidget(String colorName, Color color) {
      return MyContainer.bordered(
        width: MediaQuery.of(context).size.width,
        color: color.withOpacity(.2),
        borderColor: color,
        paddingAll: 12,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Flexible(child: MyText.bodySmall("A simple $colorName alert with",overflow: TextOverflow.ellipsis, muted: true, color: colorName == 'Light' ? contentTheme.dark : color)),
            MySpacing.width(4),
            InkWell(
                onTap: () {}, child: MyText.bodySmall("an example link.",overflow: TextOverflow.ellipsis,maxLines: 1, fontWeight: 800, color: colorName == 'Light' ? contentTheme.dark : color)),
            MySpacing.width(4),
            Expanded(child: MyText.bodySmall("Give it a click if you like",overflow: TextOverflow.ellipsis,maxLines: 1, muted: true, color: colorName == 'Light' ? contentTheme.dark : color)),
          ],
        ),
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Link Color", fontWeight: 600),
          MySpacing.height(16),
          linkColorWidget("Primary", contentTheme.primary),
          MySpacing.height(16),
          linkColorWidget("Secondary", contentTheme.secondary),
          MySpacing.height(16),
          linkColorWidget("Success", contentTheme.success),
          MySpacing.height(16),
          linkColorWidget("Error", contentTheme.danger),
          MySpacing.height(16),
          linkColorWidget("Warning", contentTheme.warning),
          MySpacing.height(16),
          linkColorWidget("Info", contentTheme.info),
          MySpacing.height(16),
          linkColorWidget("Pink", contentTheme.pink),
          MySpacing.height(16),
          linkColorWidget("Purple", contentTheme.purple),
          MySpacing.height(16),
          linkColorWidget("Light", contentTheme.light),
          MySpacing.height(16),
          linkColorWidget("Dark", contentTheme.dark),
        ],
      ),
    );
  }

  Widget iconWithAlert() {
    Widget iconWithAlertWidget(IconData icon, String colorName, Color color) {
      return MyContainer.bordered(
        color: color.withOpacity(.2),
        borderColor: color,
        paddingAll: 12,
        child: Row(
          children: [
            Icon(icon, size: 16, color: color),
            MySpacing.width(12),
            MyText.bodySmall("This is ", muted: true, color: color),
            MyText.bodySmall("$colorName ", fontWeight: 600, color: color),
            MyText.bodySmall("alert - check it out!", muted: true, color: color),
          ],
        ),
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Icons with Alerts", fontWeight: 600),
          MySpacing.height(16),
          iconWithAlertWidget(LucideIcons.check, "Success", contentTheme.success),
          MySpacing.height(16),
          iconWithAlertWidget(LucideIcons.circle_x, "Danger", contentTheme.danger),
          MySpacing.height(16),
          iconWithAlertWidget(LucideIcons.triangle_alert, "Warning", contentTheme.warning),
          MySpacing.height(16),
          iconWithAlertWidget(LucideIcons.info, "Info", contentTheme.info),
        ],
      ),
    );
  }

  Widget additionalContent() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Additional content", fontWeight: 600),
          MySpacing.height(16),
          MyContainer.bordered(
            color: contentTheme.info.withOpacity(.2),
            borderColor: contentTheme.info,
            width: MediaQuery.of(context).size.width,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                MyContainer.roundBordered(
                  borderColor: contentTheme.info,
                  color: contentTheme.info,
                  paddingAll: 8,
                  child: Icon(LucideIcons.check, size: 20, color: contentTheme.onInfo),
                ),
                MySpacing.height(12),
                MyText.titleMedium("Well Done!", fontWeight: 600, color: contentTheme.info),
                MySpacing.height(12),
                MyText.bodySmall(
                    "Aww yeah, you successfully read this important alert message. This example text is going to run a bit longer so that you can see how spacing within an alert works with this kind of content.",
                    textAlign: TextAlign.center,
                    color: contentTheme.info,
                    muted: true),
                Divider(color: contentTheme.info, thickness: .5, height: 20),
                MyText.bodySmall("Whenever you need to, be sure to use margin utilities to keep things nice and tidy.",
                    textAlign: TextAlign.center, color: contentTheme.info, muted: true)
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget liveAlert() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Live Alert", fontWeight: 600),
          MySpacing.height(16),
          MyButton(
            onPressed: () => _showAlertDialog(context),
            elevation: 0,
            backgroundColor: contentTheme.primary,
            borderRadiusAll: 8,
            child: MyText.bodyMedium('Show live alert', color: contentTheme.onPrimary),
          ),
        ],
      ),
    );
  }

  void _showAlertDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          insetPadding: MySpacing.x(MediaQuery.of(context).size.width / 3),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 0,
          title: MyText.titleMedium('Alert', fontWeight: 600),
          content: MyText.bodyMedium(controller.dummyTexts[0], maxLines: 3, fontWeight: 600),
          actions: <Widget>[
            TextButton(
              child: MyText('Close', fontWeight: 600),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }
}
