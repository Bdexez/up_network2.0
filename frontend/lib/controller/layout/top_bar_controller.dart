import 'package:flutter/material.dart';
import 'package:henox/controller/my_controller.dart';
import 'package:universal_html/html.dart';

class TopBarController extends MyController {
  bool isFullScreen = false;

  void goFullScreen() {
    isFullScreen ? document.exitFullscreen() : document.documentElement!.requestFullscreen();

    isFullScreen = !isFullScreen;
    update();
  }

  void toggleRightBar(BuildContext context) {
    Scaffold.of(context).openEndDrawer();
  }
}
