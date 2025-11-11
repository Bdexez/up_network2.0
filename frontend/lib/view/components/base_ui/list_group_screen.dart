import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/base_ui/list_group_controller.dart';
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

class ListGroupScreen extends StatefulWidget {
  const ListGroupScreen({super.key});

  @override
  State<ListGroupScreen> createState() => _ListGroupScreenState();
}

class _ListGroupScreenState extends State<ListGroupScreen> with SingleTickerProviderStateMixin, UIMixin {
  ListGroupController controller = Get.put(ListGroupController());

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        builder: (controller) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("List Group", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Base UI'),
                        MyBreadcrumbItem(name: 'List Group'),
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
                    MyFlexItem(sizes: 'lg-4 md-6', child: basicExample()),
                    MyFlexItem(sizes: 'lg-4 md-6', child: activeItems()),
                    MyFlexItem(sizes: 'lg-4 md-6', child: disableItems()),
                    MyFlexItem(sizes: 'lg-4 md-6', child: linksAndButton()),
                    MyFlexItem(sizes: 'lg-4 md-6', child: flush()),
                    MyFlexItem(sizes: 'lg-4 md-6', child: horizontal()),
                    MyFlexItem(sizes: 'lg-4 md-6', child: contextualClasses()),
                    MyFlexItem(sizes: 'lg-4 md-6', child: contextualClassesWithLink()),
                    MyFlexItem(sizes: 'lg-4 md-6', child: customContent()),
                    MyFlexItem(sizes: 'lg-4 md-6', child: withBadge()),
                    MyFlexItem(sizes: 'lg-4 md-6', child: checkBoxAndRadio()),
                    MyFlexItem(sizes: 'lg-4 md-6', child: numbered()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget basicExample() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Basic Example", fontWeight: 600),
          MySpacing.height(20),
          MyContainer.bordered(
            paddingAll: 0,
            child: ListView.separated(
              itemCount: controller.basicExample.length,
              shrinkWrap: true,
              itemBuilder: (context, index) {
                dynamic basic = controller.basicExample[index];
                return MyContainer(
                  padding: MySpacing.all(16),
                  child: Row(
                    children: [
                      Icon(basic['icon'], size: 16),
                      MySpacing.width(16),
                      Expanded(child: MyText.bodyMedium(basic['title'], muted: true, fontWeight: 600, overflow: TextOverflow.ellipsis)),
                    ],
                  ),
                );
              },
              separatorBuilder: (context, index) {
                return Divider(height: 0);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget activeItems() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Active Items", fontWeight: 600),
          MySpacing.height(20),
          MyContainer.bordered(
            paddingAll: 0,
            child: ListView.separated(
              itemCount: controller.basicExample.length,
              shrinkWrap: true,
              itemBuilder: (context, index) {
                dynamic basic = controller.basicExample[index];
                return MyContainer(
                  padding: MySpacing.all(16),
                  clipBehavior: Clip.antiAliasWithSaveLayer,
                  color: index == 0 ? contentTheme.primary : null,
                  child: Row(
                    children: [
                      Icon(
                        basic['icon'],
                        size: 16,
                        color: index == 0 ? contentTheme.onPrimary : null,
                      ),
                      MySpacing.width(16),
                      Expanded(
                        child: MyText.bodyMedium(basic['title'],
                            muted: true, fontWeight: 600, color: index == 0 ? contentTheme.onPrimary : null, overflow: TextOverflow.ellipsis),
                      ),
                    ],
                  ),
                );
              },
              separatorBuilder: (context, index) {
                return Divider(height: 0);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget disableItems() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Disable Items", fontWeight: 600),
          MySpacing.height(20),
          MyContainer.bordered(
            paddingAll: 0,
            child: ListView.separated(
              itemCount: controller.basicExample.length,
              shrinkWrap: true,
              itemBuilder: (context, index) {
                dynamic basic = controller.basicExample[index];
                return MyContainer(
                  padding: MySpacing.all(16),
                  clipBehavior: Clip.antiAliasWithSaveLayer,
                  color: index == 0 ? contentTheme.light : null,
                  child: Row(
                    children: [
                      Icon(
                        basic['icon'],
                        size: 16,
                        color: index == 0 ? contentTheme.secondary : null,
                      ),
                      MySpacing.width(16),
                      Expanded(
                        child: MyText.bodyMedium(basic['title'],
                            muted: true, fontWeight: 600, color: index == 0 ? contentTheme.secondary : null, overflow: TextOverflow.ellipsis),
                      ),
                    ],
                  ),
                );
              },
              separatorBuilder: (context, index) {
                return Divider(height: 0);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget linksAndButton() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Link and Button", fontWeight: 600),
          MySpacing.height(20),
          MyContainer.bordered(
            paddingAll: 0,
            child: ListView.separated(
              itemCount: controller.basicExample.length,
              shrinkWrap: true,
              itemBuilder: (context, index) {
                dynamic basic = controller.basicExample[index];
                return MyButton(
                  padding: MySpacing.all(16),
                  backgroundColor: theme.colorScheme.surface.withAlpha(5),
                  splashColor: theme.colorScheme.onSurface.withAlpha(10),
                  onPressed: () {},
                  child: Row(
                    children: [
                      Icon(
                        basic['icon'],
                        size: 16,
                        color: contentTheme.dark,
                      ),
                      MySpacing.width(16),
                      Expanded(child: MyText.bodyMedium(basic['title'], muted: true, fontWeight: 600, overflow: TextOverflow.ellipsis)),
                    ],
                  ),
                );
              },
              separatorBuilder: (context, index) {
                return Divider(height: 0);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget flush() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Flush", fontWeight: 600),
          MySpacing.height(20),
          ListView.separated(
            itemCount: controller.basicExample.length,
            shrinkWrap: true,
            itemBuilder: (context, index) {
              dynamic basic = controller.basicExample[index];
              return MyText.bodyMedium(basic['title'], muted: true, fontWeight: 600);
            },
            separatorBuilder: (context, index) {
              return Divider(height: 29);
            },
          ),
        ],
      ),
    );
  }

  Widget horizontal() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Horizontal", fontWeight: 600),
          MySpacing.height(20),
          SizedBox(
            height: 55,
            child: ListView.separated(
              itemCount: controller.basicExample.length,
              scrollDirection: Axis.horizontal,
              shrinkWrap: true,
              itemBuilder: (context, index) {
                dynamic basic = controller.basicExample[index];
                return MyContainer.bordered(child: MyText.bodyMedium(basic['title'], muted: true, fontWeight: 600));
              },
              separatorBuilder: (context, index) {
                return MySpacing.width(20);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget contextualClasses() {
    Widget buildListItem(String text, Color? color) {
      return MyContainer(
        borderRadiusAll: 0,
        color: color!.withAlpha(36),
        paddingAll: 12,
        child: MyText.bodySmall(
          text,
          color: color,
        ),
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Contextual classes", fontWeight: 600),
          MySpacing.height(20),
          MyText.bodySmall("Use contextual classes to style list items with a stateful background and color.", fontWeight: 600),
          MySpacing.height(20),
          ListView(
            shrinkWrap: true,
            children: [
              buildListItem("Dapibus ac facilisis in", contentTheme.light),
              buildListItem("A simple primary list group item", contentTheme.primary),
              buildListItem("A simple secondary list group item", contentTheme.secondary),
              buildListItem("A simple success list group item", contentTheme.success),
              buildListItem("A simple danger list group item", contentTheme.danger),
              buildListItem("A simple warning list group item", contentTheme.warning),
              buildListItem("A simple info list group item", contentTheme.info),
              buildListItem("A simple light list group item", contentTheme.light),
              buildListItem("A simple dark list group item", contentTheme.dark),
            ],
          ),
        ],
      ),
    );
  }

  Widget contextualClassesWithLink() {
    Widget buildLinkItem(String text, Color color) {
      return MyContainer.bordered(
        color: color.withAlpha(36),
        borderColor: color,
        paddingAll: 11,
        borderRadiusAll: 0,
        child: MyText.bodySmall(text, color: color),
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Contextual classes with Link", fontWeight: 600),
          MySpacing.height(20),
          MyText.bodySmall("Use contextual classes to style list items with a stateful background and color.", fontWeight: 600),
          MySpacing.height(20),
          ListView(
            shrinkWrap: true,
            children: [
              buildLinkItem("Dapibus ac facilisis in", contentTheme.light),
              buildLinkItem("A simple primary list group item", contentTheme.primary),
              buildLinkItem("A simple secondary list group item", contentTheme.secondary),
              buildLinkItem("A simple success list group item", contentTheme.success),
              buildLinkItem("A simple danger list group item", contentTheme.danger),
              buildLinkItem("A simple warning list group item", contentTheme.warning),
              buildLinkItem("A simple info list group item", contentTheme.info),
              buildLinkItem("A simple light list group item", contentTheme.light),
              buildLinkItem("A simple dark list group item", contentTheme.dark),
            ],
          ),
        ],
      ),
    );
  }

  Widget customContent() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Custom content", fontWeight: 600),
          MySpacing.height(20),
          MyText.bodySmall("Add nearly any HTML within, even for linked list groups like the one below, with the help of flexbox utilities.",
              fontWeight: 600),
          MySpacing.height(20),
          Column(
            children: controller.customContent.asMap().entries.map(
              (content) {
                int index = content.key;
                Map<String, dynamic> value = content.value;
                bool isSelected = controller.selectedIndex == index;
                return MyContainer(
                  onTap: () => controller.onSelectContent(index),
                  color: isSelected ? contentTheme.primary : null,
                  height: 112,
                  bordered: !isSelected,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                              child: MyText.bodyMedium(value['heading'],
                                  fontWeight: 600, color: isSelected ? contentTheme.onPrimary : null, overflow: TextOverflow.ellipsis, maxLines: 1)),
                          MyText.bodySmall(value['timestamp'],
                              muted: true,
                              fontWeight: 600,
                              color: isSelected ? contentTheme.onPrimary : null,
                              overflow: TextOverflow.ellipsis,
                              maxLines: 1),
                        ],
                      ),
                      MyText.bodySmall(value['description'],
                          muted: true,
                          fontWeight: 600,
                          color: isSelected ? contentTheme.onPrimary : null,
                          overflow: TextOverflow.ellipsis,
                          maxLines: 1),
                      MyText.bodyMedium(value['footer'],
                          muted: true,
                          fontWeight: 600,
                          color: isSelected ? contentTheme.onPrimary : null,
                          overflow: TextOverflow.ellipsis,
                          maxLines: 1),
                    ],
                  ),
                );
              },
            ).toList(),
          )
        ],
      ),
    );
  }

  Widget withBadge() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("With badges", fontWeight: 600),
          MySpacing.height(20),
          MyContainer.bordered(
            paddingAll: 0,
            child: ListView.separated(
              itemCount: controller.basicExample.length,
              shrinkWrap: true,
              itemBuilder: (context, index) {
                dynamic basic = controller.basicExample[index];
                return MyButton(
                  padding: MySpacing.all(16),
                  backgroundColor: theme.colorScheme.surface.withAlpha(5),
                  splashColor: theme.colorScheme.onSurface.withAlpha(10),
                  onPressed: () {},
                  child: Row(
                    children: [
                      Expanded(child: MyText.bodyMedium(basic['title'], muted: true, fontWeight: 600, maxLines: 1, overflow: TextOverflow.ellipsis)),
                      MySpacing.width(20),
                      MyContainer(
                        paddingAll: 4,
                        color: contentTheme.primary,
                        child: MyText.bodySmall(basic['badge'].toString(), color: contentTheme.onPrimary),
                      )
                    ],
                  ),
                );
              },
              separatorBuilder: (context, index) {
                return Divider(height: 0);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget checkBoxAndRadio() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Checkboxes and radios", fontWeight: 600),
          MySpacing.height(20),
          MyContainer.bordered(
            paddingAll: 12,
            child: Column(
              children: [
                Theme(
                  data: ThemeData(visualDensity: VisualDensity.compact),
                  child: CheckboxListTile(
                    title: MyText.bodyMedium('First checkbox', muted: true, fontWeight: 600),
                    value: controller.isFirstChecked,
                    visualDensity: VisualDensity.compact,
                    contentPadding: MySpacing.x(4),
                    dense: true,
                    onChanged: (bool? value) => controller.onFirstCheckBox(value),
                  ),
                ),
                Divider(height: 0),
                Theme(
                  data: ThemeData(visualDensity: VisualDensity.compact),
                  child: CheckboxListTile(
                    title: MyText.bodyMedium('Second checkbox', muted: true, fontWeight: 600),
                    value: controller.isSecondChecked,
                    visualDensity: VisualDensity.compact,
                    contentPadding: MySpacing.x(4),
                    dense: true,
                    onChanged: (bool? value) => controller.onSecondCheckBox(value),
                  ),
                ),
              ],
            ),
          ),
          MySpacing.height(20),
          MyContainer.bordered(
            paddingAll: 12,
            child: Column(
              children: [
                RadioListTile<String>(
                  title: MyText.bodyMedium('First radio', muted: true, fontWeight: 600),
                  value: 'first',
                  groupValue: controller.selectedRadio,
                  visualDensity: VisualDensity.compact,
                  contentPadding: MySpacing.x(4),
                  dense: true,
                  onChanged: (String? value) => controller.onSelectRadio(value),
                ),
                Divider(height: 0),
                RadioListTile<String>(
                  title: MyText.bodyMedium('Second radio', muted: true, fontWeight: 600),
                  value: 'second',
                  groupValue: controller.selectedRadio,
                  visualDensity: VisualDensity.compact,
                  contentPadding: MySpacing.x(4),
                  dense: true,
                  onChanged: (String? value) => controller.onSelectRadio(value),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget numbered() {
    Widget buildListItem(String index, String title, String badgeText) {
      return MyContainer.bordered(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            MyText.bodySmall(index, fontWeight: 600),
            MySpacing.width(20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  MyText.bodyMedium(title, fontWeight: 600, maxLines: 1, overflow: TextOverflow.ellipsis),
                  MyText.bodySmall(title, fontWeight: 600, muted: true, maxLines: 1, overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
            MySpacing.width(20),
            MyContainer(
              padding: MySpacing.xy(6, 4),
              borderRadiusAll: 100,
              color: contentTheme.primary,
              child: MyText.bodySmall(badgeText, color: contentTheme.onPrimary),
            )
          ],
        ),
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Numbered", fontWeight: 600),
          MySpacing.height(20),
          ListView(
            shrinkWrap: true,
            children: [
              buildListItem("1.", 'Henox Admin', '865'),
              MySpacing.height(20),
              buildListItem("2.", 'Henox React Admin', '140'),
              MySpacing.height(20),
              buildListItem("3.", 'Angular Version', '85'),
            ],
          ),
        ],
      ),
    );
  }
}
