import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/widgets/my_form_validator.dart';
import 'package:henox/helpers/widgets/my_validators.dart';

class LockController extends MyController {
  MyFormValidator basicValidator = MyFormValidator();

  @override
  void onInit() {
    basicValidator.addField('password',
        required: true,
        label: "Password",
        validators: [MyLengthValidator(min: 6, max: 10)],
        controller: TextEditingController(text: '123456789'));
    super.onInit();
  }

  Future<void> onLogin() async {
    if (basicValidator.validateForm()) {
      update();
      await Future.delayed(Duration(seconds: 1));
      Get.toNamed('/dashboard');
      update();
    }
  }
  void goToRegisterScreen() {
    Get.toNamed('/auth/register_account');
  }
}