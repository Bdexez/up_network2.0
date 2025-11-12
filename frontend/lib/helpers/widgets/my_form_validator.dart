import 'package:henox/helpers/widgets/my_field_validator.dart';
import 'package:flutter/material.dart';
import 'package:get/get_utils/get_utils.dart';

class MyFormValidator {
  Map<String, dynamic> errors = {};
  Map<String, dynamic> remainingError = {};
  GlobalKey<FormState> formKey = GlobalKey();
  bool consumeError = true;

  final Map<String, dynamic> _validators = {};
  final Map<String, TextEditingController> _controllers = {};
  final Map<String, dynamic> _data = {};

  /// 🔹 Ajoute un champ avec ou sans TextEditingController
  void addField<T>(String name,
      {bool required = false,
      List<MyFieldValidatorRule<T>> validators = const [],
      String? label,
      TextEditingController? controller}) {
    // Si aucun controller n’est fourni, on en crée un
    _controllers[name] = controller ?? TextEditingController();
    _validators[name] = _createValidation<T>(name,
        required: required, validators: validators, label: label);
  }

  MyFieldValidator<T>? getValidation<T>(String name) =>
      _validators[name] != null
          ? _validators[name] as MyFieldValidator<T>
          : null;

  TextEditingController getController(String name) => _controllers[name]!;

  MyFieldValidator<T> _createValidation<T>(String name,
      {bool required = false,
      List<MyFieldValidatorRule<T>> validators = const [],
      String? label}) {
    return (T? value) {
      label ??= name.capitalize;
      String? error = getError(name);
      if (error != null) return error;

      if (required && (value == null || (value.toString().isEmpty))) {
        return "$label is required";
      }

      for (MyFieldValidatorRule validator in validators) {
        String? validationError =
            validator.validate(value, required, getData());
        if (validationError != null) return validationError;
      }

      return null;
    };
  }

  String? getError(String name) {
    if (errors.containsKey(name)) {
      dynamic error = errors[name];
      String errorText;

      if (error is List && error.isNotEmpty) {
        errorText = error[0].toString();
      } else {
        errorText = error.toString();
      }

      if (consumeError) remainingError.remove(name);
      return errorText;
    }
    return null;
  }

  bool validateForm({bool clear = false, bool consumeError = true}) {
    if (clear) {
      errors.clear();
      remainingError.clear();
    }
    this.consumeError = consumeError;
    return formKey.currentState?.validate() ?? false;
  }

  ValueChanged<T> onChanged<T>(String key) {
    return (T value) {
      _data[key] = value;
    };
  }

  /// 🔹 Récupère toutes les données, incluant les controllers
  Map<String, dynamic> getData() {
    var map = {..._data};
    _controllers.forEach((key, controller) {
      map[key] = controller.text;
    });
    return map;
  }

  void resetForm() {
    formKey.currentState?.reset();
    _controllers.forEach((_, controller) => controller.clear());
  }

  void clearErrors() {
    errors.clear();
  }

  void addError(String key, dynamic error) {
    errors[key] = error;
  }

  void addErrors(Map<String, dynamic> errors) {
    errors.forEach((key, value) {
      this.errors[key] = value;
    });
  }

  /// 🔹 Récupère tous les controllers (utile si tu veux lier aux TextFormField)
  Map<String, TextEditingController> getAllControllers() => _controllers;
}
