import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/base_ui/pagination_controller.dart';
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
import 'package:henox/view/layouts/layout.dart';

class PaginationScreen extends StatefulWidget {
  const PaginationScreen({super.key});

  @override
  State<PaginationScreen> createState() => _PaginationScreenState();
}

class _PaginationScreenState extends State<PaginationScreen> with SingleTickerProviderStateMixin, UIMixin {
  PaginationController controller = Get.put(PaginationController());

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'pagination_controller',
        builder: (controller) {
          return Column(
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Pagination", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Base UI'),
                        MyBreadcrumbItem(name: 'Pagination'),
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
                    MyFlexItem(sizes: 'lg-6 mg-6', child: defaultPagination()),
                    MyFlexItem(sizes: 'lg-6 mg-6', child: roundPagination()),
                    MyFlexItem(sizes: 'lg-6 mg-6', child: disabledAndActiveStates()),
                    MyFlexItem(sizes: 'lg-6 mg-6', child: sizing()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget defaultPagination() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Default Pagination", fontWeight: 600),
          MySpacing.height(20),
          MyContainer.bordered(
              paddingAll: 8,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  IconButton(
                    icon: Icon(LucideIcons.chevrons_left, size: 18),
                    onPressed: () {},
                  ),
                  for (int i = 1; i <= 5; i++)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4.0),
                      child: MyButton(
                        backgroundColor: i == 2 ? contentTheme.primary : contentTheme.disabled,
                        elevation: 0,
                        borderRadiusAll: 4,
                        onPressed: () {},
                        child: MyText.bodyMedium('$i', muted: true, color: i == 2 ? contentTheme.onPrimary : null),
                      ),
                    ),
                  IconButton(icon: Icon(LucideIcons.chevrons_right, size: 18), onPressed: () {}),
                ],
              ))
        ],
      ),
    );
  }

  Widget roundPagination() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Round Pagination", fontWeight: 600),
          MySpacing.height(20),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              IconButton(
                icon: Icon(LucideIcons.chevrons_left, size: 18),
                onPressed: () => controller.roundedPagination > 1 ? controller.goToRoundPagination(controller.roundedPagination - 1) : null,
              ),
              for (int i = 1; i <= 5; i++)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: MyContainer(
                    height: 32,
                    width: 32,
                    paddingAll: 0,
                    color: i == controller.roundedPagination ? contentTheme.primary : null,
                    borderRadiusAll: 100,
                    onTap: () => controller.goToRoundPagination(i),
                    child: Center(
                      child: MyText.bodySmall('$i', muted: true, color: i == controller.roundedPagination ? contentTheme.onPrimary : null),
                    ),
                  ),
                ),
              IconButton(
                  icon: Icon(LucideIcons.chevrons_right, size: 18),
                  onPressed: () {
                    controller.roundedPagination < 5 ? controller.goToRoundPagination(controller.roundedPagination + 1) : null;
                  }),
            ],
          )
        ],
      ),
    );
  }

  Widget disabledAndActiveStates() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Disabled and active states", fontWeight: 600),
          MySpacing.height(20),
          Row(
            children: <Widget>[
              MyButton(
                onPressed: null,
                backgroundColor: contentTheme.secondary,
                borderRadiusAll: 8,
                child: MyText.bodySmall('Previous', fontWeight: 600),
              ),
              MySpacing.width(12),
              for (int i = 1; i <= 3; i++)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4.0),
                  child: MyButton(
                    backgroundColor: i == 2 ? contentTheme.primary : contentTheme.secondary.withAlpha(36),
                    elevation: 0,
                    borderRadiusAll: 4,
                    onPressed: () {},
                    child: MyText.bodyMedium('$i', muted: true, color: i == 2 ? contentTheme.onPrimary : null),
                  ),
                ),
              MySpacing.width(12),
              MyButton(
                onPressed: () {},
                borderRadiusAll: 8,
                elevation: 0,
                backgroundColor: contentTheme.primary,
                child: MyText.bodyMedium('Next', fontWeight: 600, color: contentTheme.onPrimary),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget sizing() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Sizing", fontWeight: 600),
          MySpacing.height(20),
          MyContainer.bordered(
              paddingAll: 12,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  IconButton(
                    icon: Icon(LucideIcons.chevrons_left, size: 18),
                    onPressed: () {},
                  ),
                  for (int i = 1; i <= 5; i++)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4.0),
                      child: MyButton(
                        backgroundColor: i == 2 ? contentTheme.primary : contentTheme.secondary.withAlpha(36),
                        elevation: 0,
                        padding: MySpacing.all(20),
                        borderRadiusAll: 4,
                        onPressed: () {},
                        child: MyText.bodyMedium('$i', fontWeight: 600, color: i == 2 ? contentTheme.onPrimary : null),
                      ),
                    ),
                  IconButton(icon: Icon(LucideIcons.chevrons_right, size: 18), onPressed: () {}),
                ],
              )),
          MySpacing.height(20),
          MyContainer.bordered(
              paddingAll: 12,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  IconButton(
                    icon: Icon(LucideIcons.chevrons_left, size: 18),
                    onPressed: () {},
                  ),
                  for (int i = 1; i <= 5; i++)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4.0),
                      child: MyButton(
                        backgroundColor: i == 2 ? contentTheme.primary : contentTheme.secondary.withAlpha(36),
                        elevation: 0,
                        padding: MySpacing.all(4),
                        borderRadiusAll: 4,
                        onPressed: () {},
                        child: MyText.bodySmall('$i', fontWeight: 600, color: i == 2 ? contentTheme.onPrimary : null),
                      ),
                    ),
                  IconButton(icon: Icon(LucideIcons.chevrons_right, size: 18), onPressed: () {}),
                ],
              ))
        ],
      ),
    );
  }
}
