import 'package:get/get.dart';
import 'package:henox/controller/my_controller.dart';

class LogOutController extends MyController{
  void goToLogInScreen() {
    Get.toNamed('/auth/login');
  }

}