import 'dart:async';

import 'package:flutter/material.dart';
import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/widgets/my_text_utils.dart';

class AuthLayoutController extends MyController {
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey();
  final scrollKey = GlobalKey();
  List<String> dummyTexts =
      List.generate(12, (index) => MyTextUtils.getDummyText(60));
  int animatedCarouselSize = 3;
  int selectedAnimatedCarousel = 0;
  final PageController animatedPageController = PageController(initialPage: 0);
  Timer? timerAnimation;

  @override
  void onInit() {
    timerAnimation = Timer.periodic(Duration(seconds: 5), (Timer timer) {
      if (selectedAnimatedCarousel < animatedCarouselSize - 1) {
        selectedAnimatedCarousel++;
      } else {
        selectedAnimatedCarousel = 0;
      }
      if (animatedPageController.hasClients) {
        animatedPageController.animateToPage(
          selectedAnimatedCarousel,
          duration: Duration(milliseconds: 600),
          curve: Curves.ease,
        );
      }
      update();
    });
    super.onInit();
  }

  void onChangeAnimatedCarousel(int value) {
    selectedAnimatedCarousel = value;
    update();
  }
}
