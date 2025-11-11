import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/base_ui/utilities_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_flex.dart';
import 'package:henox/helpers/widgets/my_flex_item.dart';
import 'package:henox/helpers/widgets/my_list_extension.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/helpers/widgets/my_text_style.dart';
import 'package:henox/view/layouts/layout.dart';

class UtilitiesScreen extends StatefulWidget {
  const UtilitiesScreen({super.key});

  @override
  State<UtilitiesScreen> createState() => _UtilitiesScreenState();
}

class _UtilitiesScreenState extends State<UtilitiesScreen> with UIMixin {
  UtilitiesController controller = Get.put(UtilitiesController());

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'utilities_controller',
        builder: (controller) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Utilities", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Base UI'),
                        MyBreadcrumbItem(name: 'Utilities'),
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
                    MyFlexItem(sizes: 'lg-6 md-6', child: backgroundColor()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: backgroundGradientColor()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: softBackground()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: colorAndBackground()),
                    MyFlexItem(child: backgroundOpacity()),
                    MyFlexItem(child: textColor()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: textOpacity()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: opacity()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: additiveAddBorder()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: subtractiveRemoveBorder()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: borderColor()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: borderWidthSize()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: borderOpacity()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: containerBorderRadius()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: borderRadiusSize()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: textSelection()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: overflow()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: shadow()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: objectFit()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: secondObjectFit()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget backgroundColor() {
    Widget backgroundColorWidget(String colorName, Color color) {
      return MyContainer(
        color: color,
        paddingAll: 12,
        width: double.infinity,
        margin: MySpacing.only(bottom: 17 ),
        child: MyText.bodyMedium(".bg-$colorName", color: colorName == 'Light' ? contentTheme.dark : contentTheme.onPrimary),
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      padding: MySpacing.nBottom(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Background Color", fontWeight: 600),
          MySpacing.height(25),
          ...controller.dismissingAlerts.mapIndexed(
            (index, element) {
              dynamic alert = controller.dismissingAlerts[index];
              return backgroundColorWidget(alert['colorName'], Color(int.parse(alert['color'])));
            },
          ),
        ],
      ),
    );
  }

  Widget backgroundGradientColor() {
    Widget gradientBox(Color color, String text, {Color? textColor}) {
      return Container(
        padding: MySpacing.all(8),
        width: double.infinity,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(4),
          gradient: LinearGradient(
            colors: [color.withOpacity(0.7), color],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: MyText.bodyMedium(text,  color: textColor),
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Background Gradient Color", fontWeight: 600),
          MySpacing.height(20),
          gradientBox(
            contentTheme.primary,
            '.bg-primary.bg-gradient',
          ),
          MySpacing.height(19),
          gradientBox(contentTheme.secondary, '.bg-secondary.bg-gradient'),
          MySpacing.height(19),
          gradientBox(contentTheme.success, '.bg-success.bg-gradient'),
          MySpacing.height(19),
          gradientBox(contentTheme.danger, '.bg-danger.bg-gradient'),
          MySpacing.height(19),
          gradientBox(contentTheme.warning, '.bg-warning.bg-gradient'),
          MySpacing.height(19),
          gradientBox(contentTheme.info, '.bg-info.bg-gradient'),
          MySpacing.height(19),
          gradientBox(contentTheme.pink, '.bg-pink.bg-gradient'),
          MySpacing.height(19),
          gradientBox(contentTheme.purple, '.bg-purple.bg-gradient'),
          MySpacing.height(19),
          gradientBox(contentTheme.light, '.bg-light.bg-gradient'),
          MySpacing.height(19),
          gradientBox(contentTheme.dark, '.bg-dark.bg-gradient'),
          MySpacing.height(19),
          gradientBox(Colors.black, '.bg-black.bg-gradient', textColor: Colors.white),
        ],
      ),
    );
  }

  Widget softBackground() {
    Widget linkColorWidget(String colorName, Color color) {
      return MyContainer(
        width: double.infinity,
        color: color.withOpacity(.2),
        paddingAll: 12,
        child: MyText.bodySmall(".text-$colorName-subtle", color: colorName == 'Light' ? contentTheme.dark : color),
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Soft Background", fontWeight: 600),
          MySpacing.height(16),
          linkColorWidget("Primary", contentTheme.primary),
          MySpacing.height(16),
          linkColorWidget("Secondary", contentTheme.secondary),
          MySpacing.height(16),
          linkColorWidget("Success", contentTheme.success),
          MySpacing.height(16),
          linkColorWidget("Error", contentTheme.danger),
          MySpacing.height(16),
          linkColorWidget("Warning", contentTheme.warning),
          MySpacing.height(16),
          linkColorWidget("Info", contentTheme.info),
          MySpacing.height(16),
          linkColorWidget("Pink", contentTheme.pink),
          MySpacing.height(16),
          linkColorWidget("Purple", contentTheme.purple),
          MySpacing.height(16),
          linkColorWidget("Light", contentTheme.light),
          MySpacing.height(16),
          linkColorWidget("Dark", contentTheme.dark),
        ],
      ),
    );
  }

  Widget colorAndBackground() {
    Widget backgroundColorWidget(String colorName, Color color) {
      return MyContainer(
        color: color,
        paddingAll: 12,
        width: double.infinity,
        margin: MySpacing.only(bottom: 16),
        child: MyText.bodySmall(".bg-$colorName", color: colorName == 'Light' ? contentTheme.dark : contentTheme.onPrimary),
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      padding: MySpacing.nBottom(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Color & Background", fontWeight: 600),
          MySpacing.height(24),
          ...controller.dismissingAlerts.mapIndexed(
            (index, element) {
              dynamic alert = controller.dismissingAlerts[index];
              return backgroundColorWidget(alert['colorName'], Color(int.parse(alert['color'])));
            },
          ),
        ],
      ),
    );
  }

  Widget backgroundOpacity() {
    Widget backgroundOpacityWidget(String text, double opacity) {
      return MyContainer(
        paddingAll: 12,
        width: double.infinity,
        color: contentTheme.primary.withOpacity(opacity),
        child: MyText(text, fontWeight: 600, color: contentTheme.onPrimary),
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Background Opacity", fontWeight: 600),
          MySpacing.height(20),
          backgroundOpacityWidget('This is default primary background', 1.0),
          backgroundOpacityWidget('This is 75% opacity primary background', 0.75),
          backgroundOpacityWidget('This is 50% opacity primary background', 0.50),
          backgroundOpacityWidget('This is 25% opacity primary background', 0.25),
          backgroundOpacityWidget('This is 10% opacity success background', 0.10),
        ],
      ),
    );
  }

  Widget textColor() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Text Color", fontWeight: 600),
          MySpacing.height(20),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    MyText.bodyMedium('.text-primary', fontWeight: 600, style: TextStyle(color: Colors.blue)),
                    MySpacing.height(20),
                    MyText.bodyMedium('.text-primary-emphasis', fontWeight: 600, style: TextStyle(color: Colors.blueAccent)),
                    MySpacing.height(20),
                    MyText.bodyMedium('.text-secondary', fontWeight: 600, style: TextStyle(color: Colors.grey)),
                    MySpacing.height(20),
                    MyText.bodyMedium('.text-secondary-emphasis', fontWeight: 600, style: TextStyle(color: Colors.grey[600])),
                    MySpacing.height(20),
                    MyText.bodyMedium('.text-success', fontWeight: 600, style: TextStyle(color: Colors.green)),
                    MySpacing.height(20),
                    MyText.bodyMedium('.text-success-emphasis', fontWeight: 600, style: TextStyle(color: Colors.greenAccent)),
                    MySpacing.height(20),
                    MyText.bodyMedium('.text-danger', fontWeight: 600, style: TextStyle(color: Colors.red)),
                    MySpacing.height(20),
                    MyText.bodyMedium('.text-danger-emphasis', fontWeight: 600, style: TextStyle(color: Colors.redAccent)),
                    MySpacing.height(20),
                    MyText.bodyMedium('.text-warning', fontWeight: 600, style: TextStyle(color: Colors.yellow, backgroundColor: Colors.black)),
                    MySpacing.height(20),
                    MyText.bodyMedium('.text-warning-emphasis', fontWeight: 600, style: TextStyle(color: Colors.yellowAccent)),
                    MySpacing.height(20),
                    MyText.bodyMedium('.text-info', fontWeight: 600, style: TextStyle(color: Colors.lightBlue, backgroundColor: Colors.black)),
                    MySpacing.height(20),
                    MyText.bodyMedium('.text-info-emphasis', fontWeight: 600, style: TextStyle(color: Colors.lightBlueAccent)),
                    MySpacing.height(20),
                    MyText.bodyMedium('.text-light', fontWeight: 600, style: TextStyle(color: Colors.white, backgroundColor: Colors.black)),
                    MySpacing.height(20),
                    MyText.bodyMedium('.text-light-emphasis', fontWeight: 600, style: TextStyle(color: Colors.white70)),
                  ],
                ),
              ),
              SizedBox(width: 20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    MyText.bodySmall('.text-dark', fontWeight: 600, style: TextStyle(color: Colors.black)),
                    MySpacing.height(20),
                    MyText.bodySmall('.text-dark-emphasis', fontWeight: 600, style: TextStyle(color: Colors.black87)),
                    MySpacing.height(20),
                    MyText.bodySmall('.text-muted', fontWeight: 600, style: TextStyle(color: Colors.grey)),
                    MySpacing.height(20),
                    MyText.bodySmall('.text-body', fontWeight: 600, style: TextStyle(color: Colors.black)),
                    MySpacing.height(20),
                    MyText.bodySmall('.text-body-emphasis', fontWeight: 600, style: TextStyle(color: Colors.black87)),
                    MySpacing.height(20),
                    MyText.bodySmall('.text-body-secondary', fontWeight: 600, style: TextStyle(color: Colors.grey[600])),
                    MySpacing.height(20),
                    MyText.bodySmall('.text-body-tertiary', fontWeight: 600, style: TextStyle(color: Colors.grey[400])),
                    MySpacing.height(20),
                    MyText.bodySmall('.text-black', fontWeight: 600, style: TextStyle(color: Colors.black)),
                    MySpacing.height(20),
                    MyText.bodySmall('.text-white', fontWeight: 600, style: TextStyle(color: Colors.white, backgroundColor: Colors.black)),
                    MySpacing.height(20),
                    MyText.bodySmall('.text-black-50', fontWeight: 600, style: TextStyle(color: Colors.black54)),
                    MySpacing.height(20),
                    MyText.bodySmall('.text-white-50', fontWeight: 600, style: TextStyle(color: Colors.white54, backgroundColor: Colors.black)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget textOpacity() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Text Opacity Color", fontWeight: 600),
          MySpacing.height(20),
          MyText.bodyMedium("This is 25% opacity primary text", color: contentTheme.primary.withOpacity(.25)),
          MySpacing.height(20),
          MyText.bodyMedium("This is 50% opacity primary text", color: contentTheme.primary.withOpacity(.5)),
          MySpacing.height(20),
          MyText.bodyMedium("This is 75% opacity primary text", color: contentTheme.primary.withOpacity(.75)),
          MySpacing.height(20),
          MyText.bodyMedium("This is default primary text", color: contentTheme.primary.withOpacity(1)),
        ],
      ),
    );
  }

  Widget opacity() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Opacity", fontWeight: 600),
          MySpacing.height(20),
          Wrap(
            spacing: 20,
            runSpacing: 20,
            children: [
              MyContainer(
                paddingAll: 12,
                color: contentTheme.primary,
                child: MyText.bodyMedium("100%", fontWeight: 600, color: contentTheme.onPrimary),
              ),
              MyContainer(
                paddingAll: 12,
                color: contentTheme.primary.withOpacity(.7),
                child: MyText.bodyMedium("75%", fontWeight: 600, color: contentTheme.onPrimary),
              ),
              MyContainer(
                paddingAll: 12,
                color: contentTheme.primary.withOpacity(.5),
                child: MyText.bodyMedium("50%", fontWeight: 600, color: contentTheme.onPrimary),
              ),
              MyContainer(
                paddingAll: 12,
                color: contentTheme.primary.withOpacity(.25),
                child: MyText.bodyMedium("25%", fontWeight: 600, color: contentTheme.onPrimary),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget additiveAddBorder() {
    Widget buildContainer({Border? border}) {
      return MyContainer.bordered(
        width: 100,
        height: 100,
        border: border,
        color: contentTheme.secondary.withOpacity(.5),
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Additive(Add) Border", fontWeight: 600),
          MySpacing.height(20),
          Wrap(
            spacing: 20,
            runSpacing: 20,
            children: [
              buildContainer(border: Border.all()),
              buildContainer(border: Border(top: BorderSide(color: Colors.black))),
              buildContainer(border: Border(right: BorderSide(color: Colors.black))),
              buildContainer(border: Border(bottom: BorderSide(color: Colors.black))),
              buildContainer(
                border: Border(left: BorderSide(color: Colors.black)),
              )
            ],
          )
        ],
      ),
    );
  }

  Widget subtractiveRemoveBorder() {
    Widget buildContainer({Border? border}) {
      return MyContainer.bordered(width: 100, height: 100, color: contentTheme.secondary.withOpacity(0.5), border: border);
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Subtractive(Remove) Border", fontWeight: 600),
          MySpacing.height(20),
          Wrap(
            spacing: 20,
            runSpacing: 20,
            children: [
              buildContainer(border: Border.all(width: 0)),
              buildContainer(
                  border: Border(
                      top: BorderSide.none,
                      right: BorderSide(color: Colors.black),
                      bottom: BorderSide(color: Colors.black),
                      left: BorderSide(color: Colors.black))),
              buildContainer(
                  border: Border(
                      top: BorderSide(color: Colors.black),
                      right: BorderSide.none,
                      bottom: BorderSide(color: Colors.black),
                      left: BorderSide(color: Colors.black))),
              buildContainer(
                  border: Border(
                      top: BorderSide(color: Colors.black),
                      right: BorderSide(color: Colors.black),
                      bottom: BorderSide.none,
                      left: BorderSide(color: Colors.black))),
              buildContainer(
                  border: Border(
                      top: BorderSide(color: Colors.black),
                      right: BorderSide(color: Colors.black),
                      bottom: BorderSide(color: Colors.black),
                      left: BorderSide.none)),
            ],
          )
        ],
      ),
    );
  }

  Widget borderColor() {
    Widget containerWidget(Color color) {
      return MyContainer.bordered(
        height: 70,
        width: 70,
        borderColor: color,
      );
    }

    List<Color> colors = [
      contentTheme.primary,
      contentTheme.secondary,
      contentTheme.info,
      contentTheme.danger,
      contentTheme.warning,
      contentTheme.pink,
      contentTheme.purple,
    ];

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Border Color", fontWeight: 600),
          MySpacing.height(20),
          Wrap(
            spacing: 20,
            runSpacing: 20,
            children: [
              for (var color in colors) containerWidget(color),
            ],
          )
        ],
      ),
    );
  }

  Widget borderWidthSize() {
    Widget borderContainerWidget(double width) {
      return MyContainer.bordered(
        paddingAll: 0,
        height: 70,
        width: 70,
        border: Border.all(width: width, color: contentTheme.secondary),
      );
    }

    List<double> sizes = [1, 2, 3, 4];

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Border width size", fontWeight: 600),
          MySpacing.height(20),
          Wrap(
            spacing: 20,
            runSpacing: 20,
            children: [
              for (var size in sizes) borderContainerWidget(size),
            ],
          )
        ],
      ),
    );
  }

  Widget borderOpacity() {
    List<double> opacityValues = [1.0, 0.75, 0.5, 0.25, 0.1];
    List<String> opacityTexts = [
      'This is default success border',
      'This is 75% opacity success border',
      'This is 50% opacity success border',
      'This is 25% opacity success border',
      'This is 10% opacity success border',
    ];

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Border Opacity", fontWeight: 600),
          MySpacing.height(20),
          for (int i = 0; i < opacityValues.length; i++)
            Padding(
              padding: const EdgeInsets.only(bottom: 10.0),
              child: MyContainer.bordered(
                borderColor: contentTheme.primary.withOpacity(opacityValues[i]),
                child: MyText.bodySmall(opacityTexts[i], fontWeight: 600),
              ),
            ),
        ],
      ),
    );
  }

  Widget containerBorderRadius() {
    Widget buildAvatar(String imagePath, BorderRadius? borderRadius) {
      return ClipRRect(
        borderRadius: borderRadius ?? BorderRadius.circular(0),
        child: Image.asset(
          imagePath,
          width: 60,
          height: 60,
          fit: BoxFit.cover,
        ),
      );
    }

    List<BorderRadius?> borderRadius = [
      null,
      BorderRadius.vertical(top: Radius.circular(8)),
      BorderRadius.horizontal(right: Radius.circular(8)),
      BorderRadius.vertical(bottom: Radius.circular(8)),
      BorderRadius.horizontal(left: Radius.circular(8)),
      BorderRadius.circular(50),
      BorderRadius.circular(20),
    ];

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Border Radius", fontWeight: 600),
          MySpacing.height(20),
          Wrap(
            spacing: 20,
            runSpacing: 20,
            children: [
              for (var radius in borderRadius) buildAvatar('assets/images/users/avatar-2.jpg', radius),
            ],
          ),
        ],
      ),
    );
  }

  Widget borderRadiusSize() {
    final List<String> avatarImages = [
      'assets/images/users/avatar-4.jpg',
      'assets/images/users/avatar-4.jpg',
      'assets/images/users/avatar-4.jpg',
      'assets/images/users/avatar-4.jpg',
      'assets/images/users/avatar-4.jpg',
      'assets/images/users/avatar-4.jpg',
    ];

    final List<double> borderRadius = [0.0, 5.0, 10.0, 15.0, 20.0, 25.0];

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Border Radius Size", fontWeight: 600),
          MySpacing.height(20),
          Wrap(
            spacing: 20,
            runSpacing: 20,
            children: List.generate(avatarImages.length, (index) {
              return ClipRRect(
                borderRadius: BorderRadius.circular(borderRadius[index]),
                child: Image.asset(avatarImages[index], width: 60, height: 60, fit: BoxFit.cover),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget textSelection() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Text Selection", fontWeight: 600),
          MySpacing.height(20),
          SelectableText(
            'This paragraph will be entirely selected when clicked by the user.',
            style: MyTextStyle.bodyMedium(),
            showCursor: true,
            contextMenuBuilder: (context, editableTextState) {
              return AdaptiveTextSelectionToolbar.editableText(
                editableTextState: editableTextState,
              );
            },
          ),
          SizedBox(height: 16.0),
          SelectableText(
            'This paragraph has default select behavior.',
            style: MyTextStyle.bodyMedium(),
          ),
          SizedBox(height: 16.0),
          MyText.bodyMedium(
            'This paragraph will not be selectable when clicked by the user.',
          ),
        ],
      ),
    );
  }

  Widget overflow() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Overflow", fontWeight: 600),
          MySpacing.height(20),
          Wrap(
            spacing: 20,
            runSpacing: 20,
            children: [
              MyContainer.bordered(
                paddingAll: 20,
                width: 260,
                height: 100,
                child: SingleChildScrollView(
                  child: MyText.bodyMedium(
                    "This is an example of using overflow-auto on an element with set width and height dimensions. By design, this content will vertically scroll.",
                  ),
                ),
              ),
              MyContainer.bordered(
                paddingAll: 20,
                width: 260,
                height: 100,
                child: MyText.bodyMedium(
                  "This is an example of using overflow-hidden on an element with set width and height dimensions.",
                  overflow: TextOverflow.clip,
                ),
              ),
              MyContainer.bordered(
                paddingAll: 20,
                width: 260,
                height: 100,
                child: MyText.bodyMedium(
                  "This is an example of using overflow-visible on an element with set width and height dimensions.",
                ),
              ),
              MyContainer.bordered(
                paddingAll: 20,
                width: 260,
                height: 100,
                child: SingleChildScrollView(
                  scrollDirection: Axis.vertical,
                  child: MyText.bodyMedium(
                    "This is an example of using overflow-scroll on an element with set width and height dimensions.",
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget shadow() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Shadow", fontWeight: 600),
          MySpacing.height(20),
          MyCard(
            shadow: MyShadow(elevation: 0),
            child: MyText.bodyMedium("No Shadow"),
          ),
          MySpacing.height(20),
          MyCard(shadow: MyShadow(elevation: .2), child: MyText.bodyMedium("Small Shadow")),
          MySpacing.height(20),
          MyCard(shadow: MyShadow(), child: MyText.bodyMedium("Regular Shadow")),
          MySpacing.height(20),
          MyCard(
            shadow: MyShadow(elevation: 4),
            child: MyText.bodyMedium("Large Shadow"),
          ),
        ],
      ),
    );
  }

  Widget objectFit() {
    Widget image(BoxFit fit) {
      return MyContainer.bordered(
          paddingAll: 0,
          height: 70,
          width: 70,
          clipBehavior: Clip.antiAliasWithSaveLayer,
          child: Image.asset('assets/images/small/small-1.jpg', fit: fit));
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Object fit", fontWeight: 600),
          MySpacing.height(20),
          Wrap(
            spacing: 20,
            runSpacing: 20,
            children: [
              image(BoxFit.none),
              image(BoxFit.cover),
              image(BoxFit.fill),
              image(BoxFit.contain),
              image(BoxFit.fitHeight),
              image(BoxFit.fitWidth),
              image(BoxFit.scaleDown),
            ],
          )
        ],
      ),
    );
  }

  Widget secondObjectFit() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Object fit", fontWeight: 600),
          MySpacing.height(20),
          SizedBox(
            width: 220,
            height: 220,
            child: Stack(
              children: [
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  child: MyContainer(
                    marginAll: 20,
                    paddingAll: 20,
                    color: Colors.red[100],
                  ),
                ),
                Positioned(
                  top: 10,
                  left: 10,
                  right: 10,
                  bottom: 10,
                  child: MyContainer(
                    marginAll: 20,
                    paddingAll: 20,
                    color: Colors.blue[100],
                  ),
                ),
                Positioned(
                  top: 20,
                  left: 20,
                  right: 20,
                  bottom: 20,
                  child: MyContainer(
                    marginAll: 20,
                    paddingAll: 20,
                    color: Colors.green[100],
                  ),
                ),
                Positioned(
                  top: 30,
                  left: 30,
                  right: 30,
                  bottom: 30,
                  child: MyContainer(
                    marginAll: 20,
                    paddingAll: 20,
                    color: Colors.purple[100],
                  ),
                ),
                Positioned(
                  top: 40,
                  left: 40,
                  right: 40,
                  bottom: 40,
                  child: MyContainer(
                    marginAll: 20,
                    paddingAll: 20,
                    color: Colors.yellow[100],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
