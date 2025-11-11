import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/base_ui/progress_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_flex.dart';
import 'package:henox/helpers/widgets/my_flex_item.dart';
import 'package:henox/helpers/widgets/my_progress_bar.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/view/layouts/layout.dart';

class ProgressScreen extends StatefulWidget {
  const ProgressScreen({super.key});

  @override
  State<ProgressScreen> createState() => _ProgressScreenState();
}

class _ProgressScreenState extends State<ProgressScreen> with SingleTickerProviderStateMixin, UIMixin {
  ProgressController controller = Get.put(ProgressController());

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'progress_controller',
        builder: (controller) {
          return Column(
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Progress", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Base UI'),
                        MyBreadcrumbItem(name: 'Progress'),
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
                    MyFlexItem(sizes: 'lg-6', child: heightProgress()),
                    MyFlexItem(sizes: 'lg-6', child: background()),
                  ],
                ),
              ),
            ],
          );
        },
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
          MySpacing.height(20),
          MyProgressBar(progress: 0, height: 20, width: 750, inactiveColor: theme.colorScheme.secondary.withAlpha(36)),
          MySpacing.height(20),
          MyProgressBar(
              progress: .2, height: 20, width: 750, inactiveColor: theme.colorScheme.secondary.withAlpha(36), activeColor: contentTheme.primary),
          MySpacing.height(20),
          MyProgressBar(
              progress: .5, height: 20, width: 750, inactiveColor: theme.colorScheme.secondary.withAlpha(36), activeColor: contentTheme.primary),
          MySpacing.height(20),
          MyProgressBar(
              progress: .7, height: 20, width: 750, inactiveColor: theme.colorScheme.secondary.withAlpha(36), activeColor: contentTheme.primary),
          MySpacing.height(20),
          MyProgressBar(
              progress: 1, height: 20, width: 750, inactiveColor: theme.colorScheme.secondary.withAlpha(36), activeColor: contentTheme.primary),
        ],
      ),
    );
  }

  Widget heightProgress() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Height", fontWeight: 600),
          MySpacing.height(20),
          MyProgressBar(
              progress: .2, height: 4, width: 750, activeColor: contentTheme.primary, inactiveColor: theme.colorScheme.secondary.withAlpha(36)),
          MySpacing.height(20),
          MyProgressBar(
              progress: .2, height: 8, width: 750, inactiveColor: theme.colorScheme.secondary.withAlpha(36), activeColor: contentTheme.secondary),
          MySpacing.height(20),
          MyProgressBar(
              progress: .5, height: 12, width: 750, inactiveColor: theme.colorScheme.secondary.withAlpha(36), activeColor: contentTheme.info),
          MySpacing.height(20),
          MyProgressBar(
              progress: .7, height: 16, width: 750, inactiveColor: theme.colorScheme.secondary.withAlpha(36), activeColor: contentTheme.pink),
          MySpacing.height(20),
          MyProgressBar(
              progress: 1, height: 20, width: 750, inactiveColor: theme.colorScheme.secondary.withAlpha(36), activeColor: contentTheme.purple),
        ],
      ),
    );
  }

  Widget background() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Background", fontWeight: 600),
          MySpacing.height(20),
          MyProgressBar(
              progress: .2, height: 20, width: 750, inactiveColor: theme.colorScheme.secondary.withAlpha(36), activeColor: contentTheme.success),
          MySpacing.height(20),
          MyProgressBar(
              progress: .4, height: 20, width: 750, inactiveColor: theme.colorScheme.secondary.withAlpha(36), activeColor: contentTheme.info),
          MySpacing.height(20),
          MyProgressBar(
              progress: .7, height: 20, width: 750, inactiveColor: theme.colorScheme.secondary.withAlpha(36), activeColor: contentTheme.warning),
          MySpacing.height(20),
          MyProgressBar(
              progress: 1, height: 20, width: 750, inactiveColor: theme.colorScheme.secondary.withAlpha(36), activeColor: contentTheme.danger),
          MySpacing.height(20),
          MyProgressBar(
              progress: .8, height: 20, width: 750, inactiveColor: theme.colorScheme.secondary.withAlpha(36), activeColor: contentTheme.pink),
          MySpacing.height(20),
          MyProgressBar(
              progress: .7, height: 20, width: 750, inactiveColor: theme.colorScheme.secondary.withAlpha(36), activeColor: contentTheme.purple),
          MySpacing.height(20),
          MyProgressBar(
              progress: .4, height: 20, width: 750, inactiveColor: theme.colorScheme.secondary.withAlpha(36), activeColor: contentTheme.dark),
          MySpacing.height(20),
          MyProgressBar(
              progress: .2,
              height: 20,
              width: 750,
              inactiveColor: theme.colorScheme.secondary.withAlpha(36),
              activeColor: contentTheme.dark.withAlpha(70)),
        ],
      ),
    );
  }
}
