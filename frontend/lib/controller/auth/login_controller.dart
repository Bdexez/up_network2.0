import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/services/auth_service.dart';
import 'package:henox/helpers/widgets/my_form_validator.dart';
import 'package:henox/helpers/widgets/my_validators.dart';
import 'package:henox/route/route_method.dart';

class LoginController extends MyController {
  final MyFormValidator basicValidator = MyFormValidator();
  bool isLoading = false;

  @override
  void onInit() {
    super.onInit();

    // Crée les champs et les controllers UNE seule fois
    basicValidator.addField<String>(
      'email',
      required: true,
      label: "Email",
    );

    basicValidator.addField<String>(
      'password',
      required: true,
      validators: [MyLengthValidator(min: 6, max: 20)],
    );
  }

  Future<void> onLogin() async {
    basicValidator.clearErrors();

    if (!basicValidator.validateForm()) {
      update();
      return;
    }

    try {
      isLoading = true;
      update();

      final errors = await AuthService.loginUser(basicValidator.getData());

      if (errors != null) {
        basicValidator.addErrors(errors);
        update();

        final message = errors['general'] ??
            errors['email'] ??
            errors['password'] ??
            "Login failed. Please try again.";
        showSnackBar(message: message, error: true);
        return;
      }

      AuthService.isLoggedIn = true;
      showSnackBar(message: "Login successful!");
      await Future.delayed(const Duration(milliseconds: 500));

      Get.offAllNamed(route.dashboard);
    } catch (_) {
      showSnackBar(
        message: "Network error: check your connection and try again.",
        error: true,
      );
    } finally {
      isLoading = false;
      update();
    }
  }

  void gotoRegister() {
    if (!isLoading) Get.toNamed(route.createAccount);
  }

  void clearFieldError(String fieldName) {
    basicValidator.errors.remove(fieldName);
    update();
  }

  bool get isFormValid => basicValidator.validateForm();

  void resetForm() {
    basicValidator.resetForm();
    basicValidator.clearErrors();
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
      duration: const Duration(seconds: 4),
      margin: const EdgeInsets.all(16),
      borderRadius: 8,
      isDismissible: true,
    );
  }

  @override
  void onClose() {
    // ❌ Ne rien disposer, Flutter gère les controllers automatiquement
    super.onClose();
  }
}
