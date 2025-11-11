import 'package:get/get.dart';
import 'package:henox/controller/my_controller.dart';

class ConfirmMailController extends MyController {
  void onLogin() {
    Get.toNamed('/dashboard');
  }
}