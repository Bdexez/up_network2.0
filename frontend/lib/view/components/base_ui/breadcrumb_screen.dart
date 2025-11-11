import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/base_ui/breadcrumb_controller.dart';
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
import 'package:remixicon/remixicon.dart';

class BreadcrumbScreen extends StatefulWidget {
  const BreadcrumbScreen({super.key});

  @override
  State<BreadcrumbScreen> createState() => _BreadcrumbScreenState();
}

class _BreadcrumbScreenState extends State<BreadcrumbScreen> with UIMixin {
  BreadcrumbController controller = Get.put(BreadcrumbController());

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'breadcrumb_controller',
        builder: (controller) {
          return Column(
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium(
                      "Breadcrumb",
                      fontSize: 18,
                      fontWeight: 600,
                    ),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Base UI'),
                        MyBreadcrumbItem(name: 'Breadcrumb'),
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
                    MyFlexItem(sizes: 'lg-6', child: example()),
                    MyFlexItem(sizes: 'lg-6', child: withIcon()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget withIcon() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Example", fontWeight: 600),
          MySpacing.height(12),
          MyText.bodySmall("Optionally you can also specify the icon with your breadcrumb item.", fontWeight: 600),
          MySpacing.height(12),
          MyContainer(
            paddingAll: 12,
            color: contentTheme.secondary.withAlpha(10),
            child: Row(
              children: [
                Icon(Remix.home_5_line, size: 16),
                MySpacing.width(12),
                MyText.bodyMedium("Home",  xMuted: true),
              ],
            ),
          ),
          MySpacing.height(20),
          MyContainer(
            paddingAll: 12,
            color: contentTheme.secondary.withAlpha(10),
            child: Row(
              children: [
                Icon(Remix.home_5_line, size: 16, color: contentTheme.primary),
                MySpacing.width(12),
                MyText.bodyMedium("Home",  xMuted: true, color: contentTheme.primary),
                MySpacing.width(4),
                Icon(LucideIcons.chevron_right, size: 16),
                MySpacing.width(4),
                MyText.bodyMedium("Library",  xMuted: true),
              ],
            ),
          ),
          MySpacing.height(20),
          MyContainer(
            paddingAll: 12,
            color: contentTheme.secondary.withAlpha(10),
            child: Row(
              children: [
                Icon(Remix.home_5_line, size: 16, color: contentTheme.primary),
                MySpacing.width(12),
                MyText.bodyMedium("Home", xMuted: true, color: contentTheme.primary),
                MySpacing.width(4),
                Icon(LucideIcons.chevron_right, size: 16),
                MySpacing.width(4),
                MyText.bodyMedium("Library",  xMuted: true, color: contentTheme.primary),
                Icon(LucideIcons.chevron_right, size: 16),
                MySpacing.width(4),
                MyText.bodyMedium("Data",  xMuted: true),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget example() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Example", fontWeight: 600),
          MySpacing.height(12),
          MyText.bodyMedium("Home",  xMuted: true),
          MySpacing.height(20),
          Row(
            children: [
              MyText.bodyMedium("Home", xMuted: true, color: contentTheme.primary),
              MySpacing.width(4),
              Icon(LucideIcons.chevron_right, size: 16),
              MySpacing.width(4),
              MyText.bodyMedium("Library",  xMuted: true),
            ],
          ),
          MySpacing.height(20),
          Row(
            children: [
              MyText.bodyMedium("Home", xMuted: true, color: contentTheme.primary),
              MySpacing.width(4),
              Icon(LucideIcons.chevron_right, size: 16),
              MySpacing.width(4),
              MyText.bodyMedium("Library",  xMuted: true, color: contentTheme.primary),
              Icon(LucideIcons.chevron_right, size: 16),
              MySpacing.width(4),
              MyText.bodyMedium("Data",  xMuted: true),
            ],
          ),
        ],
      ),
    );
  }
}
