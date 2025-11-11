import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/ui/faqs_controller.dart';
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

class FaqsScreen extends StatefulWidget {
  const FaqsScreen({super.key});

  @override
  State<FaqsScreen> createState() => _FaqsScreenState();
}

class _FaqsScreenState extends State<FaqsScreen> with SingleTickerProviderStateMixin, UIMixin {
  late FaqsController controller = Get.put(FaqsController());

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'faqs_controller',
        builder: (controller) {
          return Column(
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("FAQs", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Pages'),
                        MyBreadcrumbItem(name: 'FAQs'),
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
                  width: double.infinity,
                  child: Column(
                    children: [
                      MyText.titleLarge("Frequently Asked Questions", fontWeight: 700, xMuted: true),
                      MySpacing.height(12),
                      SizedBox(
                        width: MediaQuery.of(context).size.width / 2.6,
                        child: Center(
                          child: MyText.bodySmall(
                              "Do you have a question about your subscription, a recent order, products, shipping or you want to suggest a new magazine? Here you can find some helpful answers to frequently asked questions (FAQ).",
                              textAlign: TextAlign.center,
                              fontWeight: 600,
                              xMuted: true),
                        ),
                      ),
                      MySpacing.height(20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          MyContainer(
                            onTap: (){},
                            color: contentTheme.success,
                            paddingAll: 12,
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Remix.mail_line, size: 16, color: contentTheme.onSuccess),
                                MySpacing.width(8),
                                MyText.bodyMedium("Email us your question", fontWeight: 600, color: contentTheme.onSuccess),
                              ],
                            ),
                          ),
                          MySpacing.width(12),
                          MyContainer(
                            onTap: (){},
                            color: contentTheme.info,
                            paddingAll: 12,
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Remix.twitter_x_line, size: 16, color: contentTheme.onSuccess),
                                MySpacing.width(8),
                                MyText.bodyMedium("Send us a tweet", fontWeight: 600, color: contentTheme.onSuccess),
                              ],
                            ),
                          ),
                        ],
                      ),
                      MySpacing.height(20),
                      MyFlex(
                        children: [
                          MyFlexItem(
                              sizes: "lg-5",
                              child: ExpansionPanelList(
                                expandedHeaderPadding: EdgeInsets.all(0),
                                expansionCallback: (int index, bool isExpanded) => setState(() => controller.dataExpansionPanel1[index] = isExpanded),
                                animationDuration: Duration(milliseconds: 500),
                                children: <ExpansionPanel>[
                                  ExpansionPanel(
                                      canTapOnHeader: true,
                                      headerBuilder: (BuildContext context, bool isExpanded) => title(isExpanded, "What is lorem ipsum"),
                                      body: Padding(
                                        padding: MySpacing.all(20),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            MyText.bodyMedium(controller.dummyTexts[1], xMuted: true),
                                            MySpacing.height(20),
                                            MyText.bodyMedium(controller.dummyTexts[2], xMuted: true),
                                          ],
                                        ),
                                      ),
                                      isExpanded: controller.dataExpansionPanel1[0]),
                                  ExpansionPanel(
                                      canTapOnHeader: true,
                                      headerBuilder: (BuildContext context, bool isExpanded) => title(isExpanded, "Is safe use Lorem Ipsum?"),
                                      body: Padding(
                                        padding: MySpacing.all(20),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            MyText.bodyMedium(controller.dummyTexts[1], xMuted: true),
                                            MySpacing.height(20),
                                            MyText.bodyMedium(controller.dummyTexts[2], xMuted: true),
                                          ],
                                        ),
                                      ),
                                      isExpanded: controller.dataExpansionPanel1[1]),
                                  ExpansionPanel(
                                      canTapOnHeader: true,
                                      headerBuilder: (BuildContext context, bool isExpanded) => title(isExpanded, "Why use Lorem Ipsum?"),
                                      body: Padding(
                                        padding: MySpacing.all(20),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            MyText.bodyMedium(controller.dummyTexts[1], xMuted: true),
                                            MySpacing.height(20),
                                            MyText.bodyMedium(controller.dummyTexts[2], xMuted: true),
                                          ],
                                        ),
                                      ),
                                      isExpanded: controller.dataExpansionPanel1[2])
                                ],
                              )),
                          MyFlexItem(
                              sizes: "lg-5",
                              child: ExpansionPanelList(
                                expandedHeaderPadding: EdgeInsets.all(0),
                                expansionCallback: (int index, bool isExpanded) => setState(() => controller.dataExpansionPanel2[index] = isExpanded),
                                animationDuration: Duration(milliseconds: 500),
                                children: <ExpansionPanel>[
                                  ExpansionPanel(
                                      canTapOnHeader: true,
                                      headerBuilder: (BuildContext context, bool isExpanded) => title(isExpanded, "License & Copyright"),
                                      body: Padding(
                                        padding: MySpacing.all(20),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            MyText.bodyMedium(controller.dummyTexts[1], xMuted: true),
                                            MySpacing.height(20),
                                            MyText.bodyMedium(controller.dummyTexts[2], xMuted: true),
                                          ],
                                        ),
                                      ),
                                      isExpanded: controller.dataExpansionPanel2[0]),
                                  ExpansionPanel(
                                      canTapOnHeader: true,
                                      headerBuilder: (BuildContext context, bool isExpanded) => title(isExpanded, "How many variations exist?"),
                                      body: Padding(
                                        padding: MySpacing.all(20),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            MyText.bodyMedium(controller.dummyTexts[1], xMuted: true),
                                            MySpacing.height(20),
                                            MyText.bodyMedium(controller.dummyTexts[2], xMuted: true),
                                          ],
                                        ),
                                      ),
                                      isExpanded: controller.dataExpansionPanel2[1]),
                                  ExpansionPanel(
                                      canTapOnHeader: true,
                                      headerBuilder: (BuildContext context, bool isExpanded) => title(isExpanded, "Why use Lorem Ipsum?"),
                                      body: Padding(
                                        padding: MySpacing.all(20),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            MyText.bodyMedium(controller.dummyTexts[1], xMuted: true),
                                            MySpacing.height(20),
                                            MyText.bodyMedium(controller.dummyTexts[2], xMuted: true),
                                          ],
                                        ),
                                      ),
                                      isExpanded: controller.dataExpansionPanel2[2])
                                ],
                              ))
                        ],
                      ),
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

  Widget title(bool isExpanded, title) {
    return ListTile(
        title:
            MyText.bodyLarge(title, color: isExpanded ? theme.colorScheme.primary : theme.colorScheme.onSurface, fontWeight: isExpanded ? 700 : 600));
  }
}
