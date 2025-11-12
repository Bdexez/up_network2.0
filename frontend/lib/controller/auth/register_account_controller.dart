import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/services/auth_service.dart';
import 'package:henox/helpers/widgets/my_form_validator.dart';
import 'package:henox/helpers/widgets/my_validators.dart';

class RegisterAccountController extends MyController {
  final MyFormValidator basicValidator = MyFormValidator();
  bool termAndConditions = false;
  bool isLoading = false;

  @override
  void onInit() {
    super.onInit();

    basicValidator.addField<String>(
      'email',
      required: true,
      label: 'Email',
      validators: [MyEmailValidator()],
    );

    basicValidator.addField<String>(
      'username',
      required: true,
      label: 'Username',
      validators: [MyNameValidator(max: 15)],
    );

    basicValidator.addField<String>(
      'password',
      required: true,
      validators: [MyLengthValidator(min: 6, max: 20)],
    );
  }

  void termAndConditionsToggle() {
    termAndConditions = !termAndConditions;
    update();
  }

  Future<void> onRegister() async {
    if (!termAndConditions) {
      showSnackBar(
          message: "You must accept the terms and conditions", error: true);
      return;
    }

    if (!basicValidator.validateForm()) return;

    try {
      isLoading = true;
      update();

      Map<String, dynamic> registerData = basicValidator.getData();
      registerData['userType'] = 'internal';

      var errors = await AuthService.registerUser(registerData);

      if (errors != null) {
        basicValidator.addErrors(errors);
        update();

        final msg = errors['email'] ??
            errors['username'] ??
            errors['password'] ??
            errors['general'] ??
            "Registration failed";
        showSnackBar(message: msg, error: true);
        return;
      }

      showSnackBar(message: "Account created successfully!");
      await Future.delayed(Duration(milliseconds: 500));
      Get.offAllNamed('/auth/login');
    } catch (e) {
      showSnackBar(
          message: "Network error: Please check your connection and try again.",
          error: true);
    } finally {
      isLoading = false;
      update();
    }
  }

  void gotoLogin() {
    if (isLoading) return;
    Get.toNamed('/auth/login');
  }

  void clearFieldError(String fieldName) {
    basicValidator.errors.remove(fieldName);
    update();
  }

  void showSnackBar({required String message, bool error = false}) {
    if (Get.isSnackbarOpen) Get.closeCurrentSnackbar();

    Get.snackbar(
      error ? 'Error' : 'Success',
      message,
      backgroundColor: error ? Colors.red : Colors.green,
      colorText: Colors.white,
      snackPosition: SnackPosition.BOTTOM,
      duration: Duration(seconds: 4),
      margin: EdgeInsets.all(16),
      borderRadius: 8,
    );
  }

  @override
  void onClose() {
    // ❌ Ne pas disposer les controllers
    super.onClose();
  }
}
