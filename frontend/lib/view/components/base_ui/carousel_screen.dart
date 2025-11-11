import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/base_ui/carousel_controller.dart' as carousel;
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
import 'package:henox/images.dart';
import 'package:henox/view/layouts/layout.dart';

class CarouselScreen extends StatefulWidget {
  const CarouselScreen({super.key});

  @override
  State<CarouselScreen> createState() => _CarouselScreenState();
}

class _CarouselScreenState extends State<CarouselScreen> with SingleTickerProviderStateMixin, UIMixin {
  carousel.CarouselController controller = Get.put(carousel.CarouselController());

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'carousel_controller',
        builder: (controller) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Carousel", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [MyBreadcrumbItem(name: 'Base UI'), MyBreadcrumbItem(name: 'Carousel', active: true)],
                    ),
                  ],
                ),
              ),
              MySpacing.height(flexSpacing),
              Padding(
                padding: MySpacing.x(flexSpacing / 2),
                child: MyFlex(children: [
                  MyFlexItem(sizes: 'lg-6', child: slidesOnlyWidget()),
                  MyFlexItem(sizes: 'lg-6', child: withControls()),
                  MyFlexItem(sizes: 'lg-6', child: withIndicators()),
                  MyFlexItem(sizes: 'lg-6', child: withCaption()),
                  MyFlexItem(sizes: 'lg-6', child: crossFade()),
                  MyFlexItem(sizes: 'lg-6', child: darkVariant()),
                ]),
              )
            ],
          );
        },
      ),
    );
  }

  Widget slidesOnlyWidget() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      clipBehavior: Clip.antiAliasWithSaveLayer,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [MyText.titleMedium("Slides Only", fontWeight: 600), MySpacing.height(20), simpleCarousel()],
      ),
    );
  }

  Widget withControls() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      clipBehavior: Clip.antiAliasWithSaveLayer,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [MyText.titleMedium("With Controls", fontWeight: 600), MySpacing.height(20), controlsCarousel()],
      ),
    );
  }

  Widget withIndicators() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("With Indicators", fontWeight: 600),
          MySpacing.height(20),
          indicatorCarousel(),
        ],
      ),
    );
  }

  Widget withCaption() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("With Caption", fontWeight: 600),
          MySpacing.height(20),
          withCaptionCarousel(),
        ],
      ),
    );
  }

  Widget darkVariant() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Dark Variant", fontWeight: 600),
          MySpacing.height(20),
          withDarkVariant(),
        ],
      ),
    );
  }

  Widget withDarkVariant() {
    List<Widget> buildPageIndicatorStatic() {
      List<Widget> list = [];
      for (int i = 0; i < controller.withDarkVariantSize; i++) {
        list.add(AnimatedContainer(
          duration: Duration(milliseconds: 300),
          curve: Curves.easeInToLinear,
          margin: EdgeInsets.symmetric(horizontal: 4.0),
          height: 8.0,
          width: 8,
          decoration: BoxDecoration(
            color: i == controller.withDarkVariantSize ? Colors.black : Colors.black.withAlpha(140),
            borderRadius: BorderRadius.all(Radius.circular(4)),
          ),
        ));
      }
      return list;
    }

    return Stack(
      alignment: AlignmentDirectional.center,
      children: <Widget>[
        SizedBox(
          height: 400,
          child: PageView(
            pageSnapping: true,
            scrollBehavior: MaterialScrollBehavior(),
            physics: ClampingScrollPhysics(),
            controller: controller.darkVariant,
            onPageChanged: controller.onChangeDarkVariantCarousel,
            children: <Widget>[
              MyContainer(
                borderRadiusAll: 8,
                clipBehavior: Clip.antiAliasWithSaveLayer,
                paddingAll: 0,
                child: Image.asset(
                  Images.small[4],
                  fit: BoxFit.fill,
                ),
              ),
              MyContainer(
                borderRadiusAll: 8,
                clipBehavior: Clip.antiAliasWithSaveLayer,
                paddingAll: 0,
                child: Image.asset(
                  Images.small[5],
                  fit: BoxFit.fill,
                ),
              ),
              MyContainer(
                borderRadiusAll: 8,
                clipBehavior: Clip.antiAliasWithSaveLayer,
                paddingAll: 0,
                child: Image.asset(
                  Images.small[6],
                  fit: BoxFit.fill,
                ),
              ),
            ],
          ),
        ),
        Positioned(
          bottom: 10,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: buildPageIndicatorStatic(),
          ),
        ),
        Positioned(
            left: 12,
            child: InkWell(onTap: () => controller.onChangePreviewDarkVariant(), child: Icon(LucideIcons.chevron_left, color: Colors.black))),
        Positioned(
            right: 12,
            child: InkWell(onTap: () => controller.onChangeNextDarkVariant(), child: Icon(LucideIcons.chevron_right, color: Colors.black))),
      ],
    );
  }

  Widget crossFade() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 20,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Cross Fade", fontWeight: 600),
          MySpacing.height(20),
          withCrossFade(),
        ],
      ),
    );
  }

  Widget controlsCarousel() {
    return Stack(
      alignment: AlignmentDirectional.center,
      children: <Widget>[
        SizedBox(
          height: 400,
          child: PageView(
            pageSnapping: true,
            scrollBehavior: MaterialScrollBehavior(),
            physics: ClampingScrollPhysics(),
            controller: controller.pageControls,
            onPageChanged: controller.onChangeCarousel,
            children: <Widget>[
              MyContainer(
                borderRadiusAll: 8,
                clipBehavior: Clip.antiAliasWithSaveLayer,
                paddingAll: 0,
                child: Image.asset(
                  Images.small[0],
                  fit: BoxFit.cover,
                ),
              ),
              MyContainer(
                borderRadiusAll: 8,
                clipBehavior: Clip.antiAliasWithSaveLayer,
                paddingAll: 0,
                child: Image.asset(
                  Images.small[1],
                  fit: BoxFit.cover,
                ),
              ),
              MyContainer(
                borderRadiusAll: 8,
                clipBehavior: Clip.antiAliasWithSaveLayer,
                paddingAll: 0,
                child: Image.asset(
                  Images.small[2],
                  fit: BoxFit.cover,
                ),
              ),
            ],
          ),
        ),
        Positioned(left: 12, child: InkWell(onTap: () => controller.onChangePreviewControls(), child: Icon(LucideIcons.chevron_left))),
        Positioned(right: 12, child: InkWell(onTap: () => controller.onChangeNextControls(), child: Icon(LucideIcons.chevron_right))),
      ],
    );
  }

  Widget simpleCarousel() {
    return Stack(
      alignment: AlignmentDirectional.center,
      children: <Widget>[
        SizedBox(
          height: 400,
          child: PageView(
            pageSnapping: true,
            scrollBehavior: MaterialScrollBehavior(),
            controller: controller.simplePageController,
            onPageChanged: controller.onChangeSimpleCarousel,
            children: <Widget>[
              MyContainer(
                borderRadiusAll: 8,
                clipBehavior: Clip.antiAliasWithSaveLayer,
                paddingAll: 0,
                child: Image.asset(
                  Images.small[0],
                  fit: BoxFit.cover,
                ),
              ),
              MyContainer(
                borderRadiusAll: 8,
                clipBehavior: Clip.antiAliasWithSaveLayer,
                paddingAll: 0,
                child: Image.asset(
                  Images.small[1],
                  fit: BoxFit.cover,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget indicatorCarousel() {
    List<Widget> buildPageIndicatorStatic() {
      List<Widget> list = [];
      for (int i = 0; i < controller.withIndicatorsSize; i++) {
        list.add(i == controller.selectedWithIndicator ? indicator(true) : indicator(false));
      }
      return list;
    }

    return Stack(
      alignment: AlignmentDirectional.center,
      children: <Widget>[
        SizedBox(
          height: 400,
          child: PageView(
            pageSnapping: true,
            scrollBehavior: MaterialScrollBehavior(),
            physics: ClampingScrollPhysics(),
            controller: controller.indicatorControl,
            onPageChanged: controller.onChangeIndicatorCarousel,
            children: <Widget>[
              MyContainer(
                borderRadiusAll: 8,
                clipBehavior: Clip.antiAliasWithSaveLayer,
                paddingAll: 0,
                child: Image.asset(
                  Images.small[0],
                  fit: BoxFit.cover,
                ),
              ),
              MyContainer(
                borderRadiusAll: 8,
                clipBehavior: Clip.antiAliasWithSaveLayer,
                paddingAll: 0,
                child: Image.asset(
                  Images.small[1],
                  fit: BoxFit.cover,
                ),
              ),
              MyContainer(
                borderRadiusAll: 8,
                clipBehavior: Clip.antiAliasWithSaveLayer,
                paddingAll: 0,
                child: Image.asset(Images.small[2], fit: BoxFit.cover),
              ),
            ],
          ),
        ),
        Positioned(
          bottom: 12,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: buildPageIndicatorStatic(),
          ),
        ),
        Positioned(left: 12, child: InkWell(onTap: () => controller.onChangePreviewIndicatorControls(), child: Icon(LucideIcons.chevron_left))),
        Positioned(right: 12, child: InkWell(onTap: () => controller.onChangeNextIndicatorControls(), child: Icon(LucideIcons.chevron_right))),
      ],
    );
  }

  Widget withCaptionCarousel() {
    List<Widget> buildPageIndicatorStatic() {
      List<Widget> list = [];
      for (int i = 0; i < controller.withCaptionSize; i++) {
        list.add(i == controller.withCaptionCarousel ? indicator(true) : indicator(false));
      }
      return list;
    }

    return Stack(
      alignment: AlignmentDirectional.center,
      children: <Widget>[
        SizedBox(
          height: 400,
          child: PageView(
            pageSnapping: true,
            scrollBehavior: MaterialScrollBehavior(),
            physics: const ClampingScrollPhysics(),
            controller: controller.captionCarousel,
            onPageChanged: controller.onChangeCaptionCarousel,
            children: <Widget>[
              Stack(
                children: [
                  MyContainer(
                    paddingAll: 0,
                    borderRadiusAll: 8,
                    clipBehavior: Clip.antiAliasWithSaveLayer,
                    child: Image.asset(Images.small[0], fit: BoxFit.cover, height: 400, width: double.infinity),
                  ),
                  MyContainer(
                    borderRadiusAll: 8,
                    paddingAll: 12,
                    color: contentTheme.dark.withAlpha(150),
                    height: 400,
                    clipBehavior: Clip.antiAliasWithSaveLayer,
                    child: Center(
                      child: MyText.bodySmall(controller.dummyTexts[4],
                          maxLines: 2, overflow: TextOverflow.ellipsis, color: contentTheme.light, fontWeight: 600),
                    ),
                  ),
                ],
              ),
              Stack(
                children: [
                  MyContainer(
                    paddingAll: 0,
                    borderRadiusAll: 8,
                    clipBehavior: Clip.antiAliasWithSaveLayer,
                    child: Image.asset(Images.small[1], fit: BoxFit.cover, height: 400, width: double.infinity),
                  ),
                  MyContainer(
                    borderRadiusAll: 8,
                    paddingAll: 12,
                    color: contentTheme.dark.withAlpha(150),
                    height: 400,
                    clipBehavior: Clip.antiAliasWithSaveLayer,
                    child: Center(
                      child: MyText.bodySmall(controller.dummyTexts[5],
                          maxLines: 2, overflow: TextOverflow.ellipsis, color: contentTheme.light, fontWeight: 600),
                    ),
                  ),
                ],
              ),
              Stack(
                children: [
                  MyContainer(
                    paddingAll: 0,
                    borderRadiusAll: 8,
                    clipBehavior: Clip.antiAliasWithSaveLayer,
                    child: Image.asset(Images.small[2], fit: BoxFit.cover, height: 400, width: double.infinity),
                  ),
                  MyContainer(
                    borderRadiusAll: 8,
                    paddingAll: 12,
                    color: contentTheme.dark.withAlpha(150),
                    height: 400,
                    clipBehavior: Clip.antiAliasWithSaveLayer,
                    child: Center(
                      child: MyText.bodySmall(controller.dummyTexts[6],
                          maxLines: 2, overflow: TextOverflow.ellipsis, color: contentTheme.light, fontWeight: 600),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        Positioned(
          bottom: 10,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: buildPageIndicatorStatic(),
          ),
        ),
      ],
    );
  }

  Widget withCrossFade() {
    return Stack(
      alignment: AlignmentDirectional.center,
      children: <Widget>[
        SizedBox(
          height: 400,
          child: PageView(
            pageSnapping: true,
            scrollBehavior: MaterialScrollBehavior(),
            physics: ClampingScrollPhysics(),
            controller: controller.crossFade,
            onPageChanged: controller.onChangeCrossFade,
            children: <Widget>[
              MyContainer(
                borderRadiusAll: 8,
                clipBehavior: Clip.antiAliasWithSaveLayer,
                paddingAll: 0,
                child: Image.asset(Images.small[0], fit: BoxFit.cover),
              ),
              MyContainer(
                borderRadiusAll: 8,
                clipBehavior: Clip.antiAliasWithSaveLayer,
                paddingAll: 0,
                child: Image.asset(Images.small[1], fit: BoxFit.cover),
              ),
              MyContainer(
                borderRadiusAll: 8,
                clipBehavior: Clip.antiAliasWithSaveLayer,
                paddingAll: 0,
                child: Image.asset(Images.small[2], fit: BoxFit.cover),
              ),
            ],
          ),
        ),
        Positioned(left: 12, child: InkWell(onTap: () => controller.onChangePreviewCrossFadeControls(), child: Icon(LucideIcons.chevron_left))),
        Positioned(right: 12, child: InkWell(onTap: () => controller.onChangeNextCrossFadeControls(), child: Icon(LucideIcons.chevron_right))),
      ],
    );
  }

  Widget indicator(bool isActive) {
    return AnimatedContainer(
      duration: Duration(milliseconds: 300),
      curve: Curves.easeInToLinear,
      margin: EdgeInsets.symmetric(horizontal: 4.0),
      height: 8.0,
      width: 8,
      decoration: BoxDecoration(
        color: isActive ? Colors.white : Colors.white.withAlpha(140),
        borderRadius: BorderRadius.all(Radius.circular(4)),
      ),
    );
  }
}
