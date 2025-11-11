import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/services/auth_service.dart';
import 'package:henox/helpers/widgets/my_form_validator.dart';
import 'package:henox/helpers/widgets/my_validators.dart';

class ForgotPasswordController extends MyController {
  MyFormValidator basicValidator = MyFormValidator();

  @override
  void onInit() {
    super.onInit();
    basicValidator.addField(
      'email',
      required: true,
      label: "Email",
      validators: [MyEmailValidator()],
      controller: TextEditingController(text: "demo@gmail.com"),
    );
  }

  Future<void> onLogin() async {
    if (basicValidator.validateForm()) {
      update();
      var errors = await AuthService.loginUser(basicValidator.getData());
      if (errors != null) {
        basicValidator.validateForm();
        basicValidator.clearErrors();
      }
      Get.toNamed('/auth/reset_password');
      update();
    }
  }

  void gotoLogIn() {
    Get.offNamed('/auth/login');
  }
}
