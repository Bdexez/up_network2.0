import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/base_ui/tool_tip_controller.dart';
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

class ToolTipScreen extends StatefulWidget {
  const ToolTipScreen({super.key});

  @override
  State<ToolTipScreen> createState() => _ToolTipScreenState();
}

class _ToolTipScreenState extends State<ToolTipScreen> with UIMixin {
  ToolTipController controller = Get.put(ToolTipController());
  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'tool_tip_controller',
        builder: (controller) {
          return Column(
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Tooltips", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Base UI'),
                        MyBreadcrumbItem(name: 'Tooltips'),
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
                    MyFlexItem(sizes: 'lg-6', child: fourDirections()),
                    MyFlexItem(sizes: 'lg-6', child: htmlTag()),
                    MyFlexItem(sizes: 'lg-6', child: disableElement()),
                    MyFlexItem(sizes: 'lg-6', child: colorToolTip()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget fourDirections() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Four Directions", fontWeight: 600),
          MySpacing.height(20),
          Wrap(
            spacing: 20,
            runSpacing: 20,
            children: [
              Tooltip(
                  verticalOffset: -48,
                  message: "Tool tip on top",
                  child: MyContainer(
                      padding: MySpacing.xy(12, 8),
                      color: contentTheme.info,
                      child: MyText.bodySmall("Tooltip on top", fontWeight: 600, color: contentTheme.onPrimary))),
              Tooltip(
                  message: "Tool tip on bottom",
                  child: MyContainer(
                      padding: MySpacing.xy(12, 8),
                      color: contentTheme.info,
                      child: MyText.bodySmall("Tooltip on bottom", fontWeight: 600, color: contentTheme.onPrimary))),
              Tooltip(
                  message: "Tool tip on left",
                  preferBelow: true,
                  margin: MySpacing.left(240),
                  verticalOffset: -12,
                  child: MyContainer(
                      padding: MySpacing.xy(12, 8),
                      color: contentTheme.info,
                      child: MyText.bodySmall("Tooltip on left", fontWeight: 600, color: contentTheme.onPrimary))),
              Tooltip(
                  message: "Tool tip on right",
                  preferBelow: true,
                  margin: MySpacing.right(240),
                  verticalOffset: -12,
                  child: MyContainer(
                      padding: MySpacing.xy(12, 8),
                      color: contentTheme.info,
                      child: MyText.bodySmall("Tooltip on right", fontWeight: 600, color: contentTheme.onPrimary))),
            ],
          ),
        ],
      ),
    );
  }

  Widget htmlTag() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("HTML Tag", fontWeight: 600),
          MySpacing.height(20),
          Tooltip(
            message: 'Tooltip with HTML',
            child: MyContainer(
              padding: MySpacing.xy(12, 8),
              color: contentTheme.secondary,
              onTap: () {},
              child: MyText.bodySmall('Tooltip with HTML', fontWeight: 600, color: contentTheme.onSecondary),
            ),
          ),
        ],
      ),
    );
  }

  Widget disableElement() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Disable Element", fontWeight: 600),
          MySpacing.height(20),
          Tooltip(
            message: 'Disable',
            child: MyContainer(
              padding: MySpacing.xy(12, 8),
              color: contentTheme.secondary,
              child: MyText.bodySmall('Disable button', fontWeight: 600, color: contentTheme.onSecondary),
            ),
          ),
        ],
      ),
    );
  }

  Widget colorToolTip() {
    Widget colorToolTipWidget(String name, Color color) {
      return Tooltip(
        message: '$name Tooltip',
        decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(8)),
        child: MyContainer(
          padding: MySpacing.xy(12, 8),

          color: color,
          onTap: () {},
          child: MyText.bodySmall('$name Tooltip', fontWeight: 600, color: contentTheme.onPrimary),
        ),
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Color Tooltip", fontWeight: 600),
          MySpacing.height(20),
          Wrap(
            spacing: 20,
            runSpacing: 20,
            children: [
              colorToolTipWidget("Primary", contentTheme.primary),
              colorToolTipWidget("Danger", contentTheme.danger),
              colorToolTipWidget("Info", contentTheme.info),
              colorToolTipWidget("Success", contentTheme.success),
              colorToolTipWidget("Pink", contentTheme.pink),
              colorToolTipWidget("Purple", contentTheme.purple),
            ],
          )
        ],
      ),
    );
  }
}
