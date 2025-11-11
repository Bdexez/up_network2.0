import 'package:get/get.dart';
import 'package:henox/controller/my_controller.dart';

class Error404Controller extends MyController {
  void goToRegisterScreen() {
    Get.toNamed('/auth/register_account');
  }

  void backToHome() {
    Get.back();
  }
}