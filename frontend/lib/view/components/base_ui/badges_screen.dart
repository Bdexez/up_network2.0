import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/base_ui/badges_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_flex.dart';
import 'package:henox/helpers/widgets/my_flex_item.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/view/layouts/layout.dart';

class BadgesScreen extends StatefulWidget {
  const BadgesScreen({super.key});

  @override
  State<BadgesScreen> createState() => _BadgesScreenState();
}

class _BadgesScreenState extends State<BadgesScreen> with UIMixin {
  late BadgesController controller = Get.put(BadgesController());

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'badges_controller',
        builder: (controller) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium(
                      "Badges",
                      fontSize: 18,
                      fontWeight: 600,
                    ),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Base UI'),
                        MyBreadcrumbItem(name: 'Badges'),
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
                    MyFlexItem(sizes: 'lg-6', child: defaultBadges()),
                    MyFlexItem(sizes: 'lg-6', child: contextualVariation()),
                    MyFlexItem(sizes: 'lg-6', child: pillBadges()),
                    MyFlexItem(sizes: 'lg-6', child: badgePositioned()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget badgePositioned() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 20,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Badge Positioned", fontWeight: 600),
          MySpacing.height(12),
          MyText.bodySmall(controller.dummyTexts[1], maxLines: 2, fontWeight: 600),
          MySpacing.height(12),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              MyContainer(
                paddingAll: 0,
                height: 44,
                width: 90,
                child: Stack(
                  alignment: Alignment.bottomCenter,
                  children: [
                    MyContainer(
                      height: 40,
                      width: 80,
                      paddingAll: 0,
                      color: contentTheme.primary,
                      child: Center(child: MyText.bodyMedium("inbox", fontWeight: 600, color: contentTheme.onPrimary)),
                    ),
                    Positioned(
                      top: 0,
                      right: 0,
                      child: MyContainer(
                        padding: MySpacing.xy(4, 3),
                        borderRadiusAll: 100,
                        color: contentTheme.danger,
                        child: MyText.bodySmall("99+", fontSize: 10, color: contentTheme.onDanger),
                      ),
                    )
                  ],
                ),
              ),
              Spacer(),
              SizedBox(
                height: 44,
                width: 90,
                child: Stack(
                  alignment: Alignment.bottomCenter,
                  children: [
                    MyContainer(
                      height: 40,
                      width: 80,
                      paddingAll: 0,
                      color: contentTheme.primary,
                      child: Center(child: MyText.bodyMedium("Profile", fontWeight: 600, color: contentTheme.onPrimary)),
                    ),
                    Positioned(
                      top: 0,
                      right: 0,
                      child: MyContainer.rounded(paddingAll: 6, borderRadiusAll: 100, color: contentTheme.danger),
                    )
                  ],
                ),
              ),
              Spacer(),
            ],
          ),
          MySpacing.height(20),
          MyContainer(
            color: contentTheme.success,
            paddingAll: 12,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                MyText.bodyMedium("Notifications", fontWeight: 600, color: contentTheme.onSuccess),
                MySpacing.width(6),
                MyContainer(
                  paddingAll: 0,
                  height: 20,
                  width: 20,
                  color: contentTheme.disabled,
                  child: Center(child: MyText.bodySmall("4", fontWeight: 600, muted: true)),
                )
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget pillBadges() {
    Widget pillContainer(Color color, String text, [Color? textColor]) {
      return MyContainer(
        padding: MySpacing.xy(8, 6),
        borderRadiusAll: 100,
        color: color,
        child: MyText.labelMedium(text, fontWeight: 600, color: textColor),
      );
    }

    Widget lightenBadges(Color color, String text) {
      return MyContainer(
        padding: MySpacing.xy(8, 6),
        borderRadiusAll: 100,
        color: color.withOpacity(.2),
        child: MyText.labelMedium(text, fontWeight: 600, color: color),
      );
    }

    Widget outlinedBadges(Color color, String text) {
      return MyContainer.bordered(
        padding: MySpacing.xy(8, 6),
        borderRadiusAll: 100,
        borderColor: color.withOpacity(.2),
        child: MyText.labelMedium(text, fontWeight: 600, color: color),
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 20,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Pill Badges", fontWeight: 600),
          MySpacing.height(12),
          MyText.bodyMedium("Default", fontWeight: 600),
          MySpacing.height(12),
          Wrap(
            runSpacing: 8,
            spacing: 8,
            children: [
              pillContainer(contentTheme.primary, "Primary", contentTheme.onPrimary),
              pillContainer(contentTheme.secondary, "Secondary", contentTheme.onSecondary),
              pillContainer(contentTheme.success, "Success", contentTheme.onSuccess),
              pillContainer(contentTheme.danger, "Danger", contentTheme.onDanger),
              pillContainer(contentTheme.warning, "Warning", contentTheme.onWarning),
              pillContainer(contentTheme.info, "Info", contentTheme.onInfo),
              pillContainer(Colors.pink, "Pink", contentTheme.onInfo),
              pillContainer(Colors.purple, "Purple", contentTheme.onInfo),
              pillContainer(contentTheme.light, "Light"),
              pillContainer(contentTheme.dark, "Dark", contentTheme.onDark),
            ],
          ),
          MySpacing.height(12),
          MyText.bodyMedium("Lighten Badges", fontWeight: 600),
          MySpacing.height(12),
          Wrap(
            runSpacing: 8,
            spacing: 8,
            children: [
              lightenBadges(contentTheme.primary, "Primary"),
              lightenBadges(contentTheme.secondary, "Secondary"),
              lightenBadges(contentTheme.success, "Success"),
              lightenBadges(contentTheme.danger, "Danger"),
              lightenBadges(contentTheme.warning, "Warning"),
              lightenBadges(contentTheme.info, "Info"),
              lightenBadges(Colors.pink, "Pink"),
              lightenBadges(Colors.purple, "Purple"),
              lightenBadges(contentTheme.light, "Light"),
              lightenBadges(contentTheme.dark, "Dark"),
            ],
          ),
          MySpacing.height(12),
          MyText.bodyMedium("Outlined Badges", fontWeight: 600),
          MySpacing.height(12),
          Wrap(
            runSpacing: 8,
            spacing: 8,
            children: [
              outlinedBadges(contentTheme.primary, "Primary"),
              outlinedBadges(contentTheme.secondary, "Secondary"),
              outlinedBadges(contentTheme.success, "Success"),
              outlinedBadges(contentTheme.danger, "Danger"),
              outlinedBadges(contentTheme.warning, "Warning"),
              outlinedBadges(contentTheme.info, "Info"),
              outlinedBadges(Colors.pink, "Pink"),
              outlinedBadges(Colors.purple, "Purple"),
              outlinedBadges(contentTheme.light, "Light"),
              outlinedBadges(contentTheme.dark, "Dark"),
            ],
          ),
        ],
      ),
    );
  }

  Widget contextualVariation() {
    Widget contextualContainer(Color color, String text, [Color? textColor]) {
      return MyContainer(
        padding: MySpacing.xy(8, 6),
        color: color,
        child: MyText.labelMedium(text, fontWeight: 600, color: textColor),
      );
    }

    Widget lightenBadges(Color color, String text) {
      return MyContainer(
        padding: MySpacing.xy(8, 6),
        color: color.withOpacity(.2),
        child: MyText.labelMedium(text, fontWeight: 600, color: color),
      );
    }

    Widget outlinedBadges(Color color, String text) {
      return MyContainer.bordered(
        padding: MySpacing.xy(8, 6),
        borderColor: color.withOpacity(.2),
        child: MyText.labelMedium(text, fontWeight: 600, color: color),
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Contextual variations", fontWeight: 600),
          MySpacing.height(12),
          MyText.bodyMedium("Default", fontWeight: 600),
          MySpacing.height(12),
          Wrap(
            runSpacing: 8,
            spacing: 8,
            children: [
              contextualContainer(contentTheme.primary, "Primary", contentTheme.onPrimary),
              contextualContainer(contentTheme.secondary, "Secondary", contentTheme.onSecondary),
              contextualContainer(contentTheme.success, "Success", contentTheme.onSuccess),
              contextualContainer(contentTheme.danger, "Danger", contentTheme.onDanger),
              contextualContainer(contentTheme.warning, "Warning", contentTheme.onWarning),
              contextualContainer(contentTheme.info, "Info", contentTheme.onInfo),
              contextualContainer(Colors.pink, "Pink", contentTheme.onInfo),
              contextualContainer(Colors.purple, "Purple", contentTheme.onInfo),
              contextualContainer(contentTheme.light, "Light"),
              contextualContainer(contentTheme.dark, "Dark", contentTheme.onDark),
            ],
          ),
          MySpacing.height(12),
          MyText.bodyMedium("Lighten Badges", fontWeight: 600),
          MySpacing.height(12),
          Wrap(
            runSpacing: 8,
            spacing: 8,
            children: [
              lightenBadges(contentTheme.primary, "Primary"),
              lightenBadges(contentTheme.secondary, "Secondary"),
              lightenBadges(contentTheme.success, "Success"),
              lightenBadges(contentTheme.danger, "Danger"),
              lightenBadges(contentTheme.warning, "Warning"),
              lightenBadges(contentTheme.info, "Info"),
              lightenBadges(Colors.pink, "Pink"),
              lightenBadges(Colors.purple, "Purple"),
              lightenBadges(contentTheme.light, "Light"),
              lightenBadges(contentTheme.dark, "Dark"),
            ],
          ),
          MySpacing.height(12),
          MyText.bodyMedium("Outlined Badges", fontWeight: 600),
          MySpacing.height(12),
          Wrap(
            runSpacing: 8,
            spacing: 8,
            children: [
              outlinedBadges(contentTheme.primary, "Primary"),
              outlinedBadges(contentTheme.secondary, "Secondary"),
              outlinedBadges(contentTheme.success, "Success"),
              outlinedBadges(contentTheme.danger, "Danger"),
              outlinedBadges(contentTheme.warning, "Warning"),
              outlinedBadges(contentTheme.info, "Info"),
              outlinedBadges(Colors.pink, "Pink"),
              outlinedBadges(Colors.purple, "Purple"),
              outlinedBadges(contentTheme.light, "Light"),
              outlinedBadges(contentTheme.dark, "Dark"),
            ],
          ),
        ],
      ),
    );
  }

  Widget defaultBadges() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Default", fontWeight: 600),
          MySpacing.height(12),
          Row(
            children: [
              MyText.displaySmall("h1.Example heading", fontWeight: 600),
              MySpacing.width(4),
              MyContainer(
                padding: MySpacing.xy(8, 2),
                color: contentTheme.secondary,
                child: MyText.displaySmall("New", color: contentTheme.onSecondary),
              )
            ],
          ),
          MySpacing.height(8),
          Row(
            children: [
              MyText.titleLarge("h2.Example heading", fontWeight: 600),
              MySpacing.width(4),
              MyContainer(
                padding: MySpacing.xy(8, 2),
                color: contentTheme.success.withOpacity(.2),
                child: MyText.titleLarge("New", color: contentTheme.success),
              )
            ],
          ),
          MySpacing.height(8),
          Row(
            children: [
              MyText.bodyLarge("h4.Example heading", fontWeight: 600),
              MySpacing.width(4),
              MyContainer(
                padding: MySpacing.xy(6, 2),
                color: contentTheme.primary,
                child: MyText.bodyLarge("New", color: contentTheme.onPrimary),
              )
            ],
          ),
          MySpacing.height(8),
          Row(
            children: [
              MyText.titleMedium("h2.Example heading", fontWeight: 600),
              MySpacing.width(4),
              MyContainer(
                padding: MySpacing.xy(8, 2),
                color: contentTheme.info.withOpacity(.2),
                child: MyText.titleMedium("Info Link", color: contentTheme.info),
              )
            ],
          ),
          MySpacing.height(8),
          Row(
            children: [
              MyText.bodyMedium("h5.Example heading", fontWeight: 600),
              MySpacing.width(4),
              MyContainer.bordered(
                padding: MySpacing.xy(8, 2),
                borderColor: contentTheme.warning,
                child: MyText.bodyMedium("New", color: contentTheme.warning),
              )
            ],
          ),
          MySpacing.height(8),
          Row(
            children: [
              MyText.bodySmall("h6.Example heading", fontWeight: 600),
              MySpacing.width(4),
              MyContainer(
                padding: MySpacing.xy(4, 2),
                color: contentTheme.danger,
                child: MyText.bodySmall("New", color: contentTheme.onDanger),
              )
            ],
          ),
        ],
      ),
    );
  }
}
