import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/extended_ui/rating_bar_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_button.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_flex.dart';
import 'package:henox/helpers/widgets/my_flex_item.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_star_rating.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/view/layouts/layout.dart';
import 'package:remixicon/remixicon.dart';

class RatingBarScreen extends StatefulWidget {
  const RatingBarScreen({super.key});

  @override
  State<RatingBarScreen> createState() => _RatingBarScreenState();
}

class _RatingBarScreenState extends State<RatingBarScreen> with UIMixin {
  RatingBarController controller = Get.put(RatingBarController());

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'rating_bar_controller',
        builder: (controller) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Ratings", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Extended UI'),
                        MyBreadcrumbItem(name: 'Ratings'),
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
                    MyFlexItem(sizes: 'lg-6 md-6', child: defaultRating()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: remixIcon()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: iconFontChangeIcon()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: iconFontSizing()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: progressiveEnhancement()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: rtlSupport()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: settingAndGettingValues()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget defaultRating() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [MyText.bodyMedium("Default Rating", muted: true, fontWeight: 600), MySpacing.height(20), MyStarRating(rating: 3, size: 24)],
      ),
    );
  }

  Widget remixIcon() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Remix Icons", fontWeight: 600, muted: true),
          MySpacing.height(20),
          MyStarRating(rating: 3.5, size: 24, inactiveIcon: Remix.star_line, activeIcon: Remix.star_fill, halfIcon: Remix.star_half_line),
          MySpacing.height(20),
          MyStarRating(rating: 3.5, size: 24, inactiveIcon: Remix.heart_line, activeIcon: Remix.heart_fill, halfIcon: Remix.heart_fill),
        ],
      ),
    );
  }

  Widget iconFontChangeIcon() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Icon font - change icon", fontWeight: 600, muted: true),
          MySpacing.height(20),
          MyStarRating(rating: 3.5, size: 24, inactiveIcon: Remix.at_line, activeIcon: Remix.at_line, halfIcon: Remix.at_line),
        ],
      ),
    );
  }

  Widget iconFontSizing() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [MyText.bodyMedium("Icon font - Sizing", muted: true, fontWeight: 600), MySpacing.height(20), MyStarRating(rating: 2.5, size: 36)],
      ),
    );
  }

  Widget progressiveEnhancement() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Progressive enhancement (using select)", muted: true, fontWeight: 600),
          MySpacing.height(20),
          DropdownButton<int>(
            value: controller.selectedValue,
            items: controller.dropdownItems,
            dropdownColor: contentTheme.disabled,
            onChanged: (int? newValue) => controller.onProgressiveEnhancement(newValue),
          ),
          MySpacing.height(12),
          Row(
            children: List.generate(5, (index) {
              return IconButton(
                icon: Icon(index <= controller.progressiveEnhancementRating ? Icons.star : Icons.star_border, color: Colors.amber),
                onPressed: () {
                  setState(() {
                    controller.progressiveEnhancementRating = index;
                    controller.selectedValue = index;
                  });
                },
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget rtlSupport() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("RTL Support", fontWeight: 600, muted: true),
          MySpacing.height(20),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Directionality(textDirection: TextDirection.rtl, child: MyStarRating(rating: 3, size: 24)),
            ],
          ),
        ],
      ),
    );
  }

  Widget settingAndGettingValues() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Setting and Getting values", muted: true, fontWeight: 600),
          MySpacing.height(20),
          MyText.bodySmall("All properties can also be set on the fly. Here are a few examples:", xMuted: true, fontWeight: 600),
          MySpacing.height(20),
          Row(
            children: List.generate(controller.maxValue, (index) {
              return IconButton(
                icon: Icon(
                  index < controller.rating ? Icons.star : Icons.star_border,
                  color: Colors.amber,
                ),
                onPressed: controller.isReadOnly
                    ? null
                    : () {
                        setState(() {
                          controller.rating = index + 1;
                        });
                      },
              );
            }),
          ),
          SizedBox(height: 20),
          Wrap(
            spacing: 10.0,
            runSpacing: 10.0,
            children: [
              MyButton(
                elevation: 0,
                borderRadiusAll: 4,backgroundColor: contentTheme.primary,
                onPressed: controller.onGetValue,
                child: MyText.bodySmall("Get value", fontWeight: 600, color: contentTheme.onPrimary),
              ),
              MyButton(
                elevation: 0,
                borderRadiusAll: 4,backgroundColor: contentTheme.primary,
                child: MyText.bodySmall("Set value", fontWeight: 600, color: contentTheme.onPrimary),
                onPressed: () async => controller.onSetValue(),
              ),
              MyButton(
                elevation: 0,
                borderRadiusAll: 4,backgroundColor: contentTheme.primary,
                onPressed: controller.onGetMaxValue,
                child: MyText.bodySmall("Get max value", fontWeight: 600, color: contentTheme.onPrimary),
              ),
              MyButton(
                elevation: 0,
                borderRadiusAll: 4,backgroundColor: contentTheme.primary,
                child: MyText.bodySmall("Set max value", fontWeight: 600, color: contentTheme.onPrimary),
                onPressed: () async => controller.onSetMaxValue(),
              ),
              MyButton(
                elevation: 0,
                borderRadiusAll: 4,backgroundColor: contentTheme.primary,
                onPressed: controller.onGetStepSize,
                child: MyText.bodySmall("Get step size", fontWeight: 600, color: contentTheme.onPrimary),
              ),
              MyButton(
                elevation: 0,
                borderRadiusAll: 4,backgroundColor: contentTheme.primary,
                child: MyText.bodySmall("Set step size", fontWeight: 600, color: contentTheme.onPrimary),
                onPressed: () async => controller.onSetStepSize(),
              ),
              MyButton(
                elevation: 0,
                borderRadiusAll: 4,backgroundColor: contentTheme.primary,
                onPressed: controller.onGetReadOnlyValue,
                child: MyText.bodySmall("Get readonly value", fontWeight: 600, color: contentTheme.onPrimary),
              ),
              MyButton(
                elevation: 0,
                borderRadiusAll: 4,backgroundColor: contentTheme.primary,
                onPressed: controller.toggleReadOnly,
                child: MyText.bodySmall("Toggle readonly", fontWeight: 600, color: contentTheme.onPrimary),
              ),
              MyButton(
                elevation: 0,
                borderRadiusAll: 4,backgroundColor: contentTheme.primary,
                onPressed: controller.getIsPreSetValue,
                child: MyText.bodySmall("Get ispreset value", fontWeight: 600, color: contentTheme.onPrimary),
              ),
              MyButton(
                elevation: 0,
                borderRadiusAll: 4,backgroundColor: contentTheme.primary,
                onPressed: controller.onToggleIsPreset,
                child: MyText.bodySmall("Toggle ispreset", fontWeight: 600, color: contentTheme.onPrimary),
              ),
              MyButton(
                elevation: 0,
                borderRadiusAll: 4,
                backgroundColor: contentTheme.primary,
                onPressed: controller.resetValue,
                child: MyText.bodySmall("Reset", fontWeight: 600, color: contentTheme.onPrimary),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
