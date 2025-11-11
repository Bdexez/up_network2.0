import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/icons_controller.dart';
import 'package:henox/helpers/services/url_service.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_button.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/view/layouts/layout.dart';

class IconsScreen extends StatefulWidget {
  const IconsScreen({super.key});

  @override
  State<IconsScreen> createState() => _IconsScreenState();
}

class _IconsScreenState extends State<IconsScreen> with UIMixin {
  IconsController controller = Get.put(IconsController());
  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'icons_controller',
        builder: (controller) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Icons", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Icons'),
                      ],
                    ),
                  ],
                ),
              ),
              MySpacing.height(flexSpacing),
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: MyCard(
                  shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
                  paddingAll: 24,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      MyText.titleMedium("Remix Icons",fontWeight: 600),
                      MySpacing.height(20),
                      GridView.builder(
                        itemCount: controller.remixIcons.length,
                        shrinkWrap: true,
                        gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
                          maxCrossAxisExtent: 250,
                          crossAxisSpacing: 20,
                          mainAxisSpacing: 20,
                          mainAxisExtent: 32,
                        ),
                        itemBuilder: (context, index) {
                          dynamic icon = controller.remixIcons[index];
                          return Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(icon['icon'],size: 20),
                              MySpacing.width(12),
                              MyText.bodySmall(icon['name'],muted: true, fontWeight: 600),
                            ],
                          );
                        },
                      ),
                      MySpacing.height(20),
                      Center(
                        child: MyButton(
                            onPressed: () => UrlService.goToRemixIcon(),
                            elevation: 0,
                            padding: MySpacing.all(12),
                            backgroundColor: contentTheme.primary,
                            borderRadiusAll: 4,
                            child: MyText.labelMedium("More Icons",fontWeight: 600,color: contentTheme.onPrimary)),
                      )
                    ],
                  ),
                ),
              ),
              MySpacing.height(20),
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: MyCard(
                  shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
                  paddingAll: 24,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      MyText.titleMedium("Lucide Icons",fontWeight: 600),
                      MySpacing.height(20),
                      GridView.builder(
                        itemCount: controller.lucideIcons.length,
                        shrinkWrap: true,
                        gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
                          maxCrossAxisExtent: 250,
                          crossAxisSpacing: 20,
                          mainAxisSpacing: 20,
                          mainAxisExtent: 32,
                        ),
                        itemBuilder: (context, index) {
                          dynamic icon = controller.lucideIcons[index];
                          return Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(icon['icon'],size: 20),
                              MySpacing.width(12),
                              MyText.bodySmall(icon['name'],muted: true, fontWeight: 600),
                            ],
                          );
                        },
                      ),
                      MySpacing.height(20),
                      Center(
                        child: MyButton(
                            onPressed: () => UrlService.goToLucideIcon(),
                            elevation: 0,
                            padding: MySpacing.all(12),
                            backgroundColor: contentTheme.primary,
                            borderRadiusAll: 4,
                            child: MyText.labelMedium("More Icons",fontWeight: 600,color: contentTheme.onPrimary)),
                      )
                    ],
                  ),
                ),
              )
            ],
          );
        },
      ),
    );
  }
}
