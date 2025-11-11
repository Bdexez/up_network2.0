import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/base_ui/accordion_controller.dart';
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

class AccordionScreen extends StatefulWidget {
  const AccordionScreen({super.key});

  @override
  State<AccordionScreen> createState() => _AccordionScreenState();
}

class _AccordionScreenState extends State<AccordionScreen> with SingleTickerProviderStateMixin, UIMixin {
  late AccordionController controller;

  @override
  void initState() {
    controller = AccordionController();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'accordion_controller',
        builder: (controller) {
          return Column(
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium(
                      "Accordion",
                      fontSize: 18,
                      fontWeight: 600,
                    ),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Base UI'),
                        MyBreadcrumbItem(name: 'Accordion'),
                      ],
                    ),
                  ],
                ),
              ),
              MySpacing.height(flexSpacing),
              Padding(
                padding: MySpacing.x(flexSpacing),
                child:
                    MyFlex(contentPadding: false, children: [defaultAccordions(), flushAccordions(), simpleCardAccordions(), alwaysOpenAccordions()]),
              )
            ],
          );
        },
      ),
    );
  }

  MyFlexItem alwaysOpenAccordions() {
    return MyFlexItem(
        sizes: "lg-6",
        child: MyCard(
          shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
          paddingAll: 24,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              MyText.titleMedium("Always Open Accordions", fontWeight: 600),
              MySpacing.height(12),
              ExpansionPanelList(
                expandedHeaderPadding: EdgeInsets.all(0),
                expansionCallback: (int index, bool isExpanded) => setState(() => controller.alwaysOpenAccordions[index] = isExpanded),
                animationDuration: Duration(milliseconds: 500),
                children: <ExpansionPanel>[
                  ExpansionPanel(
                      canTapOnHeader: true,
                      headerBuilder: (BuildContext context, bool isExpanded) => title(isExpanded, "Accordions Item #1"),
                      body: Padding(
                        padding: MySpacing.all(20),
                        child: MyText.bodyMedium(controller.dummyTexts[1], xMuted: true),
                      ),
                      isExpanded: controller.alwaysOpenAccordions[0]),
                  ExpansionPanel(
                      canTapOnHeader: true,
                      headerBuilder: (BuildContext context, bool isExpanded) => title(isExpanded, "Accordions Item #2"),
                      body: Padding(
                        padding: MySpacing.all(20),
                        child: MyText.bodyMedium(controller.dummyTexts[1], xMuted: true),
                      ),
                      isExpanded: controller.alwaysOpenAccordions[1]),
                  ExpansionPanel(
                      canTapOnHeader: true,
                      headerBuilder: (BuildContext context, bool isExpanded) => title(isExpanded, "Accordions Item #3"),
                      body: Padding(
                        padding: MySpacing.all(20),
                        child: MyText.bodyMedium(controller.dummyTexts[1], xMuted: true),
                      ),
                      isExpanded: controller.alwaysOpenAccordions[2])
                ],
              ),
            ],
          ),
        ));
  }

  MyFlexItem defaultAccordions() {
    return MyFlexItem(
        sizes: "lg-6",
        child: MyCard(
          shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
          paddingAll: 24,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              MyText.titleMedium("Default Accordions", fontWeight: 600),
              MySpacing.height(12),
              ExpansionPanelList(
                expandedHeaderPadding: EdgeInsets.all(0),
                expansionCallback: (int index, bool isExpanded) => setState(() => controller.defaultAccordions[index] = isExpanded),
                animationDuration: Duration(milliseconds: 500),
                children: <ExpansionPanel>[
                  ExpansionPanel(
                      canTapOnHeader: true,
                      headerBuilder: (BuildContext context, bool isExpanded) => title(isExpanded, "Accordions Item #1"),
                      body: Padding(
                        padding: MySpacing.all(20),
                        child: MyText.bodyMedium(controller.dummyTexts[1], xMuted: true),
                      ),
                      isExpanded: controller.defaultAccordions[0]),
                  ExpansionPanel(
                      canTapOnHeader: true,
                      headerBuilder: (BuildContext context, bool isExpanded) => title(isExpanded, "Accordions Item #2"),
                      body: Padding(
                        padding: MySpacing.all(20),
                        child: MyText.bodyMedium(controller.dummyTexts[1], xMuted: true),
                      ),
                      isExpanded: controller.defaultAccordions[1]),
                  ExpansionPanel(
                      canTapOnHeader: true,
                      headerBuilder: (BuildContext context, bool isExpanded) => title(isExpanded, "Accordions Item #3"),
                      body: Padding(
                        padding: MySpacing.all(20),
                        child: MyText.bodyMedium(controller.dummyTexts[1], xMuted: true),
                      ),
                      isExpanded: controller.defaultAccordions[2])
                ],
              ),
            ],
          ),
        ));
  }

  MyFlexItem simpleCardAccordions() {
    return MyFlexItem(
        sizes: "lg-6",
        child: MyCard(
          shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
          paddingAll: 24,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              MyText.titleMedium("Simple Accordions", fontWeight: 600),
              MySpacing.height(12),
              ExpansionPanelList(
                expandedHeaderPadding: EdgeInsets.all(0),
                expansionCallback: (int index, bool isExpanded) => setState(() => controller.simpleCardAccordions[index] = isExpanded),
                animationDuration: Duration(milliseconds: 500),
                children: <ExpansionPanel>[
                  ExpansionPanel(
                      canTapOnHeader: true,
                      headerBuilder: (BuildContext context, bool isExpanded) => title(isExpanded, "Accordions Item #1"),
                      body: Padding(
                        padding: MySpacing.all(20),
                        child: MyText.bodyMedium(controller.dummyTexts[1], xMuted: true),
                      ),
                      isExpanded: controller.simpleCardAccordions[0]),
                  ExpansionPanel(
                      canTapOnHeader: true,
                      headerBuilder: (BuildContext context, bool isExpanded) => title(isExpanded, "Accordions Item #2"),
                      body: Padding(
                        padding: MySpacing.all(20),
                        child: MyText.bodyMedium(controller.dummyTexts[1], xMuted: true),
                      ),
                      isExpanded: controller.simpleCardAccordions[1]),
                  ExpansionPanel(
                      canTapOnHeader: true,
                      headerBuilder: (BuildContext context, bool isExpanded) => title(isExpanded, "Accordions Item #3"),
                      body: Padding(
                        padding: MySpacing.all(20),
                        child: MyText.bodyMedium(controller.dummyTexts[1], xMuted: true),
                      ),
                      isExpanded: controller.simpleCardAccordions[2])
                ],
              ),
            ],
          ),
        ));
  }

  MyFlexItem flushAccordions() {
    return MyFlexItem(
        sizes: "lg-6",
        child: MyCard(
          shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
          paddingAll: 24,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              MyText.titleMedium("Flash Accordions", fontWeight: 600),
              MySpacing.height(12),
              ExpansionPanelList(
                expandedHeaderPadding: EdgeInsets.all(0),
                expansionCallback: (int index, bool isExpanded) => setState(() => controller.flushAccordions[index] = isExpanded),
                animationDuration: Duration(milliseconds: 500),
                children: <ExpansionPanel>[
                  ExpansionPanel(
                      canTapOnHeader: true,
                      headerBuilder: (BuildContext context, bool isExpanded) => title(isExpanded, "Accordions Item #1"),
                      body: Padding(
                        padding: MySpacing.all(20),
                        child: MyText.bodyMedium(controller.dummyTexts[1], xMuted: true),
                      ),
                      isExpanded: controller.flushAccordions[0]),
                  ExpansionPanel(
                      canTapOnHeader: true,
                      headerBuilder: (BuildContext context, bool isExpanded) => title(isExpanded, "Accordions Item #2"),
                      body: Padding(
                        padding: MySpacing.all(20),
                        child: MyText.bodyMedium(controller.dummyTexts[1], xMuted: true),
                      ),
                      isExpanded: controller.flushAccordions[1]),
                  ExpansionPanel(
                      canTapOnHeader: true,
                      headerBuilder: (BuildContext context, bool isExpanded) => title(isExpanded, "Accordions Item #3"),
                      body: Padding(
                        padding: MySpacing.all(20),
                        child: MyText.bodyMedium(controller.dummyTexts[1], xMuted: true),
                      ),
                      isExpanded: controller.flushAccordions[2])
                ],
              ),
            ],
          ),
        ));
  }

  Widget title(bool isExpanded, title) {
    return ListTile(
        title: MyText.bodyMedium(title,
            color: isExpanded ? theme.colorScheme.primary : theme.colorScheme.onSurface, fontWeight: isExpanded ? 600 : 500));
  }
}
