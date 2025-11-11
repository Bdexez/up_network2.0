import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/services/auth_service.dart';
import 'package:henox/helpers/widgets/my_form_validator.dart';
import 'package:henox/helpers/widgets/my_validators.dart';

class RegisterAccountController extends MyController {
  MyFormValidator basicValidator = MyFormValidator();
  bool termAndConditions = false;
  bool isLoading = false;

  @override
  void onInit() {
    super.onInit();

    // Email field (obligatoire pour l'authentification)
    basicValidator.addField<String>(
      'email',
      required: true,
      label: 'Email',
      validators: [MyEmailValidator()],
      controller: TextEditingController(),
    );

    // Username field (pour l'affichage uniquement)
    basicValidator.addField<String>(
      'username',
      required: true,
      label: 'Username',
      validators: [MyNameValidator(max: 15)],
      controller: TextEditingController(),
    );

    // Password field
    basicValidator.addField<String>(
      'password',
      required: true,
      validators: [MyLengthValidator(min: 6, max: 20)],
      controller: TextEditingController(),
    );
  }

  /// Toggle Terms & Conditions
  void termAndConditionsToggle() {
    termAndConditions = !termAndConditions;
    update();
  }

  /// Action d'inscription
  Future<void> onRegister() async {
    if (!termAndConditions) {
      showSnackBar(message: "You must accept the terms and conditions", error: true);
      return;
    }

    if (!basicValidator.validateForm()) {
      return;
    }

    try {
      isLoading = true;
      update();

      // Préparer les données pour l'inscription
      Map<String, dynamic> registerData = basicValidator.getData();

      // Ajouter le userType "internal" par défaut
      registerData['userType'] = 'internal';

      var errors = await AuthService.registerUser(registerData);

      if (errors != null) {
        basicValidator.addErrors(errors);
        update();

        // Afficher les erreurs spécifiques
        if (errors.containsKey('email')) {
          showSnackBar(message: errors['email']!, error: true);
        } else if (errors.containsKey('username')) {
          showSnackBar(message: errors['username']!, error: true);
        } else if (errors.containsKey('password')) {
          showSnackBar(message: errors['password']!, error: true);
        } else if (errors.containsKey('general')) {
          showSnackBar(message: errors['general']!, error: true);
        } else {
          showSnackBar(message: "Registration failed. Please try again.", error: true);
        }
        return;
      }

      // Succès de l'inscription
      showSnackBar(message: "Account created successfully!");

      // Petite pause pour voir le message de succès
      await Future.delayed(Duration(milliseconds: 500));

      // Redirection vers l'écran de login
      Get.offAllNamed('/auth/login');

    } catch (e) {
      showSnackBar(
        message: "Network error: Please check your connection and try again.",
        error: true
      );
    } finally {
      isLoading = false;
      update();
    }
  }

  /// Aller à l'écran de connexion
  void gotoLogin() {
    if (isLoading) return;
    Get.toNamed('/auth/login');
  }

  /// Effacer l'erreur d'un champ spécifique
  void clearFieldError(String fieldName) {
    if (basicValidator.errors.containsKey(fieldName)) {
      basicValidator.errors.remove(fieldName);
      update();
    }
  }

  /// Afficher un message snackbar
  void showSnackBar({required String message, bool error = false}) {
    if (Get.isSnackbarOpen) {
      Get.closeCurrentSnackbar();
    }

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
    // Nettoyage des contrôleurs
    basicValidator.getController('email')?.dispose();
    basicValidator.getController('username')?.dispose();
    basicValidator.getController('password')?.dispose();

    super.onClose();
  }
}
