import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/base_ui/spinners_controller.dart';
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

class SpinnersScreen extends StatefulWidget {
  const SpinnersScreen({super.key});

  @override
  State<SpinnersScreen> createState() => _SpinnersScreenState();
}

class _SpinnersScreenState extends State<SpinnersScreen> with SingleTickerProviderStateMixin, UIMixin {
  late SpinnersController controller;

  @override
  void initState() {
    controller = Get.put(SpinnersController());
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'spinners_controller',
        builder: (controller) {
          return Column(
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Spinners", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [MyBreadcrumbItem(name: 'Base UI'), MyBreadcrumbItem(name: 'Spinners', active: true)],
                    ),
                  ],
                ),
              ),
              MySpacing.height(flexSpacing),
              Padding(
                padding: MySpacing.x(flexSpacing / 2),
                child: MyFlex(
                  children: [
                    MyFlexItem(sizes: 'lg-6 md-6', child: borderSpinner()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: colors()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: alignmentSpinner()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: placementSpinner()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: sizeSpinner()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: buttonsSpinner()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget borderSpinner() {
    return MyCard(
        shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
        paddingAll: 24,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [MyText.titleMedium("Border Spinner", fontWeight: 600), MySpacing.height(20), CircularProgressIndicator()],
        ));
  }

  Widget colors() {
    return MyCard(
        shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
        paddingAll: 24,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            MyText.titleMedium("Color", fontWeight: 600),
            MySpacing.height(20),
            Wrap(
              spacing: 20,
              runSpacing: 20,
              children: [
                CircularProgressIndicator(),
                CircularProgressIndicator(color: contentTheme.secondary),
                CircularProgressIndicator(color: contentTheme.success),
                CircularProgressIndicator(color: contentTheme.danger),
                CircularProgressIndicator(color: contentTheme.pink),
                CircularProgressIndicator(color: contentTheme.light),
                CircularProgressIndicator(color: contentTheme.dark),
              ],
            )
          ],
        ));
  }

  Widget alignmentSpinner() {
    return MyCard(
        shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
        paddingAll: 24,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [MyText.titleMedium("Alignment", fontWeight: 600), MySpacing.height(20), Center(child: CircularProgressIndicator())],
        ));
  }

  Widget placementSpinner() {
    return MyCard(
        shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
        paddingAll: 24,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            MyText.titleMedium("Placement", fontWeight: 600),
            MySpacing.height(20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                MyText.titleMedium("Loading...", fontWeight: 600),
                CircularProgressIndicator(),
              ],
            )
          ],
        ));
  }

  Widget sizeSpinner() {
    return MyCard(
        shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
        paddingAll: 24,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            MyText.titleMedium("Size", fontWeight: 600),
            MySpacing.height(20),
            Wrap(
              spacing: 20,
              runSpacing: 20,
              children: [
                SizedBox(
                  height: 100,
                  width: 100,
                  child: CircularProgressIndicator(),
                ),
                SizedBox(
                  height: 50,
                  width: 50,
                  child: CircularProgressIndicator(),
                ),
                CircularProgressIndicator(),
                SizedBox(
                  height: 25,
                  width: 25,
                  child: CircularProgressIndicator(),
                ),
              ],
            )
          ],
        ));
  }

  Widget buttonsSpinner() {
    return MyCard(
        shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
        paddingAll: 24,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            MyText.titleMedium("Buttons Spinner", fontWeight: 600),
            MySpacing.height(20),
            Wrap(
              spacing: 20,
              runSpacing: 20,
              children: [
                MyContainer(
                    paddingAll: 12,
                    color: contentTheme.primary,
                    child: SizedBox(height: 28, width: 28, child: CircularProgressIndicator(color: contentTheme.onPrimary))),
                MyContainer(
                    paddingAll: 12,
                    color: contentTheme.primary,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        SizedBox(height: 28, width: 28, child: CircularProgressIndicator(color: contentTheme.onPrimary)),
                        SizedBox(width: 12),
                        MyText.bodyMedium("Loading...", fontWeight: 600, color: contentTheme.onPrimary),
                      ],
                    ))
              ],
            )
          ],
        ));
  }
}
