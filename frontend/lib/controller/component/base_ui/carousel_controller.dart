import 'dart:async';

import 'package:flutter/material.dart';
import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/widgets/my_text_utils.dart';

class CarouselController extends MyController {
  List<String> dummyTexts =
      List.generate(12, (index) => MyTextUtils.getDummyText(60));
  int pageControlSize = 3, withIndicatorsSize = 3, withCaptionSize = 3,withDarkVariantSize =3;
  int selectedSimpleCarousel = 0,
      selectedCarousel = 0,
      selectedWithIndicator = 0,
      withCaptionCarousel = 0,
      crossFadeCarousel = 0,darkVariantCarousel =0;

  Timer? timerAnimation;

  final PageController simplePageController = PageController(initialPage: 0);
  final PageController pageControls = PageController(initialPage: 0);
  final PageController indicatorControl = PageController(initialPage: 0);
  final PageController captionCarousel = PageController(initialPage: 0);
  final PageController crossFade = PageController(initialPage: 0);
  final PageController darkVariant = PageController(initialPage: 0);

  @override
  void onInit() {
    timerAnimation = Timer.periodic(Duration(seconds: 5), (Timer timer) {
      // Page Controls
      if (selectedCarousel < pageControlSize - 1) {
        selectedCarousel++;
      } else {
        selectedCarousel = 0;
      }

      pageControls.animateToPage(
        selectedCarousel,
        duration: Duration(milliseconds: 600),
        curve: Curves.ease,
      );
      // Indicators Controls
      if (selectedWithIndicator < withIndicatorsSize - 1) {
        selectedWithIndicator++;
      } else {
        selectedWithIndicator = 0;
      }

      indicatorControl.animateToPage(
        selectedWithIndicator,
        duration: Duration(milliseconds: 600),
        curve: Curves.ease,
      );

      // Caption Controls
      if (withCaptionCarousel < withCaptionSize - 1) {
        withCaptionCarousel++;
      } else {
        withCaptionCarousel = 0;
      }

      captionCarousel.animateToPage(
        withCaptionCarousel,
        duration: Duration(milliseconds: 600),
        curve: Curves.ease,
      );
      update();
    });
    super.onInit();
  }

  void onChangeSimpleCarousel(int value) {
    selectedSimpleCarousel = value;
    update();
  }

  void onChangeCarousel(int value) {
    selectedCarousel = value;
    update();
  }

  void onChangeNextControls() {
    pageControls.nextPage(
        duration: Duration(milliseconds: 600), curve: Curves.ease);
    update();
  }

  void onChangePreviewControls() {
    pageControls.previousPage(
        duration: Duration(milliseconds: 600), curve: Curves.ease);
    update();
  }

  void onChangeIndicatorCarousel(int value) {
    selectedWithIndicator = value;
    update();
  }

  void onChangeNextIndicatorControls() {
    indicatorControl.nextPage(
        duration: Duration(milliseconds: 600), curve: Curves.ease);
    update();
  }

  void onChangePreviewIndicatorControls() {
    indicatorControl.previousPage(
        duration: Duration(milliseconds: 600), curve: Curves.ease);
    update();
  }

  void onChangeCaptionCarousel(int value) {
    withCaptionCarousel = value;
    update();
  }

  void onChangeCrossFade(int value) {
    crossFadeCarousel = value;
    update();
  }

  void onChangeNextCrossFadeControls() {
    crossFade.nextPage(
        duration: Duration(milliseconds: 600), curve: Curves.fastLinearToSlowEaseIn);
    update();
  }

  void onChangePreviewCrossFadeControls() {
    crossFade.previousPage(
      duration: Duration(milliseconds: 600), curve: Curves.fastLinearToSlowEaseIn);
    update();
  }

  void onChangeDarkVariantCarousel(int value) {
    darkVariantCarousel = value;
    update();
  }

  void onChangeNextDarkVariant() {
    darkVariant.nextPage(
        duration: Duration(milliseconds: 600), curve: Curves.ease);
    update();
  }

  void onChangePreviewDarkVariant() {
    darkVariant.previousPage(
        duration: Duration(milliseconds: 600), curve: Curves.ease);
    update();
  }

  @override
  void dispose() {
    simplePageController.dispose();
    pageControls.dispose();
    super.dispose();
  }
}

