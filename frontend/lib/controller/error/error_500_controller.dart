import 'package:get/get.dart';
import 'package:henox/controller/my_controller.dart';

class Error500Controller extends MyController{
  void backToHome() {
    Get.back();
  }

  void goToRegisterScreen() {
    Get.toNamed('/auth/register_account');
  }
}