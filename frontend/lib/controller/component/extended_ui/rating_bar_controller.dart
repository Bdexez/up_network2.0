import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/widgets/my_button.dart';
import 'package:henox/helpers/widgets/my_text.dart';

class RatingBarController extends MyController {
  int selectedValue = 1;
  int progressiveEnhancementRating = 1;

  int rating = 3;
  int maxValue = 5;
  double stepSize = 1.0;
  bool isReadOnly = false;
  bool isPreset = false;

  final List<DropdownMenuItem<int>> dropdownItems = [
    DropdownMenuItem(value: 0, child: MyText.bodyMedium("Bad")),
    DropdownMenuItem(value: 1, child: MyText.bodyMedium("OK")),
    DropdownMenuItem(value: 2, child: MyText.bodyMedium("Good")),
    DropdownMenuItem(value: 3, child: MyText.bodyMedium("Great")),
    DropdownMenuItem(value: 4, child: MyText.bodyMedium("Excellent")),
  ];

  void onProgressiveEnhancement(value) {
    selectedValue = value!;
    progressiveEnhancementRating = selectedValue;
    update();
  }

  Future<String?> getUserInput(BuildContext context, String title) async {
    TextEditingController controller = TextEditingController();
    return await showDialog<String>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: MyText.bodyMedium(title),
          content: TextField(
            controller: controller,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(hintText: "Enter a value"),
          ),
          actions: <Widget>[
            MyButton(
              child: MyText.bodyMedium("Submit", fontWeight: 600),
              onPressed: () {
                Navigator.of(context).pop(controller.text);
              },
            ),
          ],
        );
      },
    );
  }

  void onGetValue() {
    ScaffoldMessenger.of(Get.context!).showSnackBar(SnackBar(
      content: MyText.bodyMedium("Current rating value: ${rating}"),
    ));
    update();
  }

  void onSetValue() async {
    String? value = await getUserInput(Get.context!, "Input numerical value");
    if (value != null && int.tryParse(value) != null) {
      rating = int.parse(value).clamp(0, maxValue);
      update();
    }
  }

  void onGetMaxValue() {
    ScaffoldMessenger.of(Get.context!).showSnackBar(SnackBar(
      content: MyText.bodyMedium("Max value: ${maxValue}"),
    ));
    update();
  }

  Future<void> onSetMaxValue() async {
    String? value = await getUserInput(Get.context!, "Input max value");
    if (value != null && int.tryParse(value) != null) {
      maxValue = int.parse(value);
      update();
    }
  }

  void onGetStepSize() {
    ScaffoldMessenger.of(Get.context!).showSnackBar(SnackBar(
      content: MyText.bodyMedium("Step size: ${stepSize}"),
    ));
    update();
  }

  Future<void> onSetStepSize() async {
    String? value = await getUserInput(Get.context!, "Input step size");
    if (value != null && double.tryParse(value) != null) {
      stepSize = double.parse(value);
      update();
    }
  }

  void onGetReadOnlyValue() {
    ScaffoldMessenger.of(Get.context!).showSnackBar(SnackBar(
      content: MyText.bodyMedium("Readonly: ${isReadOnly}"),
    ));
    update();
  }

  void toggleReadOnly() {
    isReadOnly = !isReadOnly;
    update();
  }

  void getIsPreSetValue() {
    ScaffoldMessenger.of(Get.context!).showSnackBar(SnackBar(
      content: MyText.bodyMedium("IsPreset: ${isPreset}"),
    ));
    update();
  }

  void onToggleIsPreset() {
    isPreset = !isPreset;
    update();
  }

  void resetValue() {
    rating = 0;
    update();
  }
}
