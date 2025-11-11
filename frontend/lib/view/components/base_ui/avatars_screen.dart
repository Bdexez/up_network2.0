import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/base_ui/avatars_controller.dart';
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
import 'package:henox/images.dart';
import 'package:henox/view/layouts/layout.dart';

class AvatarsScreen extends StatefulWidget {
  const AvatarsScreen({super.key});

  @override
  State<AvatarsScreen> createState() => _AvatarsScreenState();
}

class _AvatarsScreenState extends State<AvatarsScreen> with UIMixin {
  late AvatarsController controller = Get.put(AvatarsController());

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'avatars_controller',
        builder: (controller) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Avatars", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Base UI'),
                        MyBreadcrumbItem(name: 'Avatars'),
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
                    MyFlexItem(sizes: 'lg-6', child: sizingImage()),
                    MyFlexItem(sizes: 'lg-6', child: roundedCircle()),
                    MyFlexItem(sizes: 'lg-6', child: sizingBackgroundColor()),
                    MyFlexItem(sizes: 'lg-6', child: roundedCircleBackground()),
                    MyFlexItem(child: imageShapes()),
                    MyFlexItem(child: avatarGroup()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget sizingImage() {
    Widget imageWidget(double size, String image, String imageSizeName) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyContainer(
            height: size,
            width: size,
            borderRadiusAll: 4,
            paddingAll: 0,
            clipBehavior: Clip.antiAlias,
            child: Image.asset(image, fit: BoxFit.cover),
          ),
          MySpacing.height(4),
          MyText.bodySmall(imageSizeName, muted: true, color: contentTheme.primary),
        ],
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Sizing-Image", fontWeight: 600),
          MySpacing.height(20),
          Wrap(
            spacing: 40,
            runSpacing: 40,
            children: [
              imageWidget(32, Images.avatars[1], '.avatar.xs'),
              imageWidget(48, Images.avatars[2], '.avatar.sm'),
              imageWidget(68, Images.avatars[3], '.avatar.md'),
              imageWidget(88, Images.avatars[4], '.avatar.lg'),
              imageWidget(110, Images.avatars[5], '.avatar.xl'),
            ],
          )
        ],
      ),
    );
  }

  Widget roundedCircle() {
    Widget roundedWidget(double size, String image, String imageSizeName) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyContainer.rounded(
            height: size,
            width: size,
            paddingAll: 0,
            clipBehavior: Clip.antiAlias,
            child: Image.asset(image, fit: BoxFit.cover),
          ),
          MySpacing.height(4),
          MyText.bodySmall(imageSizeName, muted: true, color: contentTheme.primary),
        ],
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Rounded Circle", fontWeight: 600),
          MySpacing.height(20),
          Wrap(
            spacing: 40,
            runSpacing: 40,
            children: [
              roundedWidget(68, Images.avatars[6], ".avatar-md .rounded-circle"),
              roundedWidget(88, Images.avatars[7], ".avatar-lg .rounded-circle"),
              roundedWidget(110, Images.avatars[8], ".avatar-xl .rounded-circle"),
            ],
          )
        ],
      ),
    );
  }

  Widget sizingBackgroundColor() {
    Widget sizingBackgroundWidget(double size, Color color, String title, String sizingName) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyContainer(
            height: size,
            width: size,
            paddingAll: 0,
            borderRadiusAll: 4,
            clipBehavior: Clip.antiAlias,
            color: color.withAlpha(40),
            child: Center(child: MyText.bodySmall(title, color: color, fontWeight: 600)),
          ),
          MySpacing.height(4),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              MyText.bodySmall("Using", muted: true),
              MySpacing.width(4),
              MyText.bodySmall(sizingName, muted: true, color: contentTheme.primary),
            ],
          ),
        ],
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Sizing - Background Color", fontWeight: 600),
          MySpacing.height(20),
          Wrap(
            spacing: 40,
            runSpacing: 40,
            children: [
              sizingBackgroundWidget(32, contentTheme.primary, "XS", ".avatar-xs"),
              sizingBackgroundWidget(48, contentTheme.success, "SM", ".avatar-sm"),
              sizingBackgroundWidget(68, contentTheme.primary, "MD", ".avatar-md"),
              sizingBackgroundWidget(88, contentTheme.info, "LG", ".avatar-lg"),
              sizingBackgroundWidget(110, contentTheme.warning, "XL", ".avatar-xl"),
            ],
          )
        ],
      ),
    );
  }

  Widget roundedCircleBackground() {
    Widget roundedCircleBackgroundWidget(double size, String title, String sizingName) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyContainer.rounded(
            height: size,
            width: size,
            paddingAll: 0,
            color: contentTheme.secondary.withAlpha(40),
            child: Center(child: MyText.bodyMedium(title, fontWeight: 600, color: contentTheme.secondary)),
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              MyText.bodySmall("Using"),
              MySpacing.width(4),
              MyText.bodySmall(sizingName, muted: true, color: contentTheme.primary),
            ],
          ),
        ],
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Rounded Circle Background", fontWeight: 600),
          MySpacing.height(20),
          Wrap(
            spacing: 40,
            runSpacing: 40,
            children: [
              roundedCircleBackgroundWidget(68, "MD", ".avatar-md .rounded-circle"),
              roundedCircleBackgroundWidget(88, "LG", ".avatar-lg .rounded-circle"),
              roundedCircleBackgroundWidget(110, "XL", ".avatar-xl .rounded-circle"),
            ],
          )
        ],
      ),
    );
  }

  Widget imageShapes() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Images Shapes", fontWeight: 600),
          MySpacing.height(20),
          MyText.bodyMedium("Avatars with different sizes and shapes.", fontWeight: 600, muted: true),
          MySpacing.height(20),
          Wrap(
            spacing: 40,
            runSpacing: 40,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  MyContainer(
                    height: 150,
                    width: 250,
                    paddingAll: 0,
                    borderRadiusAll: 4,
                    clipBehavior: Clip.antiAlias,
                    child: Image.asset(Images.small[1], fit: BoxFit.cover),
                  ),
                  MySpacing.height(4),
                  MyText.bodySmall('.rounded', muted: true, color: contentTheme.primary),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  MyContainer(
                    height: 150,
                    width: 150,
                    paddingAll: 0,
                    borderRadiusAll: 4,
                    clipBehavior: Clip.antiAlias,
                    child: Image.asset(Images.avatars[5], fit: BoxFit.cover),
                  ),
                  MySpacing.height(4),
                  MyText.bodySmall('.rounded', muted: true, color: contentTheme.primary),

                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  MyContainer.rounded(
                    height: 150,
                    width: 150,
                    paddingAll: 0,
                    borderRadiusAll: 4,
                    clipBehavior: Clip.antiAlias,
                    child: Image.asset(Images.avatars[6], fit: BoxFit.cover),
                  ),
                  MySpacing.height(4),
                  MyText.bodySmall('.rounded-circle', muted: true, color: contentTheme.primary),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  MyContainer.bordered(
                    paddingAll: 4,
                    borderRadiusAll: 4,
                    child: MyContainer(
                      height: 150,
                      width: 250,
                      paddingAll: 0,
                      borderRadiusAll: 4,
                      clipBehavior: Clip.antiAlias,
                      child: Image.asset(Images.small[3], fit: BoxFit.cover),
                    ),
                  ),
                  MySpacing.height(4),
                  MyText.bodySmall('.img-thumbnail', muted: true, color: contentTheme.primary),

                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  MyContainer.roundBordered(
                    paddingAll: 4,
                    borderRadiusAll: 4,
                    child: MyContainer.rounded(
                      height: 150,
                      width: 150,
                      paddingAll: 0,
                      borderRadiusAll: 4,
                      clipBehavior: Clip.antiAlias,
                      child: Image.asset(Images.avatars[7], fit: BoxFit.fill),
                    ),
                  ),
                  MySpacing.height(4),
                  MyText.bodySmall('.rounded-circle .img-thumbnail', muted: true, color: contentTheme.primary),
                ],
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget avatarGroup() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Avatar Group", fontWeight: 600),
          MySpacing.height(20),
          MyFlex(
            children: [
              MyFlexItem(
                sizes: 'lg-6 md-6 sm-6',
                child: SizedBox(
                  width: 200,
                  height: 32,
                  child: Stack(
                      alignment: Alignment.centerRight,
                      children: controller.images
                          .mapIndexed((index, image) => Positioned(
                                left: (0 + (24 * index)).toDouble(),
                                child: MyContainer.rounded(
                                  paddingAll: 0,
                                  clipBehavior: Clip.antiAlias,
                                  child: Image.asset(image, height: 32, width: 32, fit: BoxFit.cover),
                                ),
                              ))
                          .toList()),
                ),
              ),
              MyFlexItem(
                sizes: 'lg-6 md-6 sm-6',
                child: SizedBox(
                  width: 200,
                  height: 32,
                  child: Stack(
                      alignment: Alignment.centerRight,
                      children: controller.avatars
                          .mapIndexed((index, image) => Positioned(
                                left: (0 + (24 * index)).toDouble(),
                                child: image.imageUrl == null
                                    ? MyContainer.rounded(
                                        height: 32,
                                        width: 32,
                                        paddingAll: 0,
                                        clipBehavior: Clip.antiAliasWithSaveLayer,
                                        color: contentTheme.primary,
                                        child: Center(child: MyText.bodySmall(image.title!, fontWeight: 600, color: contentTheme.onPrimary)))
                                    : MyContainer.rounded(
                                        paddingAll: 0,
                                        height: 32,
                                        width: 32,
                                        clipBehavior: Clip.antiAlias,
                                        child: Center(
                                          child: Image.asset(image.imageUrl!, height: 32, width: 32, fit: BoxFit.cover),
                                        ),
                                      ),
                              ))
                          .toList()),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
