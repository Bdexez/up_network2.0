import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/extended_ui/scroll_bar_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_flex.dart';
import 'package:henox/helpers/widgets/my_flex_item.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/view/layouts/layout.dart';

class ScrollBarScreen extends StatefulWidget {
  const ScrollBarScreen({super.key});

  @override
  State<ScrollBarScreen> createState() => _ScrollBarScreenState();
}

class _ScrollBarScreenState extends State<ScrollBarScreen> with UIMixin {
  ScrollBarController controller = Get.put(ScrollBarController());

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'scrollbar_controller',
        builder: (controller) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Scrollbar", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Extended UI'),
                        MyBreadcrumbItem(name: 'Scrollbar'),
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
                    MyFlexItem(sizes: 'lg-6 md-6', child: defaultScroll()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: rtlSupport()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: scrollSize()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: scrollBarColor()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget defaultScroll() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 0,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: MySpacing.nBottom(20),
            child: MyText.bodyMedium("Default Scroll", fontWeight: 600),
          ),
          SizedBox(
            height: 400,
            child: ListView(
              shrinkWrap: true,
              padding: MySpacing.all(20),
              children: [
                MyText.bodySmall(controller.dummyTexts[0],muted: true),
                MySpacing.height(20),
                MyText.bodySmall(controller.dummyTexts[1],muted: true),
                MySpacing.height(20),
                MyText.bodySmall(controller.dummyTexts[2],muted: true),
                MySpacing.height(20),
                MyText.bodySmall(controller.dummyTexts[3],muted: true),
                MySpacing.height(20),
                MyText.bodySmall(controller.dummyTexts[4],muted: true),
                MySpacing.height(20),
                MyText.bodySmall(controller.dummyTexts[5],muted: true),
                MySpacing.height(20),
                MyText.bodySmall(controller.dummyTexts[6],muted: true),
                MySpacing.height(20),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget rtlSupport() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 0,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: MySpacing.nBottom(20),
            child: MyText.bodyMedium("RTL Position", fontWeight: 600),
          ),
          SizedBox(
            height: 400,
            child: Directionality(
              textDirection: TextDirection.rtl,
              child: SingleChildScrollView(
                child: Padding(
                  padding: MySpacing.all(20),
                  child: Column(
                    children: [
                      MyText.bodySmall(controller.dummyTexts[0],muted: true),
                      MySpacing.height(20),
                      MyText.bodySmall(controller.dummyTexts[1],muted: true),
                      MySpacing.height(20),
                      MyText.bodySmall(controller.dummyTexts[2],muted: true),
                      MySpacing.height(20),
                      MyText.bodySmall(controller.dummyTexts[3],muted: true),
                      MySpacing.height(20),
                      MyText.bodySmall(controller.dummyTexts[4],muted: true),
                      MySpacing.height(20),
                      MyText.bodySmall(controller.dummyTexts[5],muted: true),
                      MySpacing.height(20),
                      MyText.bodySmall(controller.dummyTexts[6],muted: true),
                      MySpacing.height(20),
                    ],
                  ),
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget scrollSize() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 0,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: MySpacing.nBottom(20),
            child: MyText.bodyMedium("Scroll Size", fontWeight: 600),
          ),
          SizedBox(
            height: 400,
            child: Scrollbar(
              thickness: 12,
              thumbVisibility: true,
              controller: controller.scrollController,
              child: ScrollConfiguration(
                behavior: ScrollConfiguration.of(context).copyWith(scrollbars: false),
                child: ListView(
                  shrinkWrap: true,
                  controller: controller.scrollController,
                  padding: MySpacing.all(20),
                  children: [
                    MyText.bodySmall(controller.dummyTexts[0],muted: true),
                    MySpacing.height(20),
                    MyText.bodySmall(controller.dummyTexts[1],muted: true),
                    MySpacing.height(20),
                    MyText.bodySmall(controller.dummyTexts[2],muted: true),
                    MySpacing.height(20),
                    MyText.bodySmall(controller.dummyTexts[3],muted: true),
                    MySpacing.height(20),
                    MyText.bodySmall(controller.dummyTexts[4],muted: true),
                    MySpacing.height(20),
                    MyText.bodySmall(controller.dummyTexts[5],muted: true),
                    MySpacing.height(20),
                    MyText.bodySmall(controller.dummyTexts[6],muted: true),
                    MySpacing.height(20),
                  ],
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget scrollBarColor() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 0,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: MySpacing.nBottom(20),
            child: MyText.bodyMedium("Scroll Color", fontWeight: 600),
          ),
          SizedBox(
            height: 400,
            child: ScrollbarTheme(
              data: ScrollbarThemeData(thumbColor: WidgetStatePropertyAll(contentTheme.primary)),
              child: ListView(
                shrinkWrap: true,
                padding: MySpacing.all(20),
                children: [
                  MyText.bodySmall(controller.dummyTexts[0],muted: true),
                  MySpacing.height(20),
                  MyText.bodySmall(controller.dummyTexts[1],muted: true),
                  MySpacing.height(20),
                  MyText.bodySmall(controller.dummyTexts[2],muted: true),
                  MySpacing.height(20),
                  MyText.bodySmall(controller.dummyTexts[3],muted: true),
                  MySpacing.height(20),
                  MyText.bodySmall(controller.dummyTexts[4],muted: true),
                  MySpacing.height(20),
                  MyText.bodySmall(controller.dummyTexts[5],muted: true),
                  MySpacing.height(20),
                  MyText.bodySmall(controller.dummyTexts[6],muted: true),
                  MySpacing.height(20),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
