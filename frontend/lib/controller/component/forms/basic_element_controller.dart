import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/widgets/my_form_validator.dart';


enum StateName {
  alabama,
  alaska,
  arizona,
  arkansas,
  california,
  colorado,
  connecticut;
}

class BasicElementController extends MyController {
  MyFormValidator basicValidator = MyFormValidator();
  StateName stateName = StateName.alabama;
  bool isShowPassword = true;
  String? selectedValue;
  DateTime? selectedDate;
  final List<String> options = ['1', '2', '3', '4', '5'];
  final List<String> selectedOptions = [];
  String? fileName;
  TimeOfDay? selectedTime;
  Color pickerColor = Color(0xff443a49);
  Color currentColor = Color(0xff443a49);
  double currentRangeValue = 50;
  String? selectFloatingValue;
  String? selectedLayoutValue;
  bool isChecked1 = false;
  bool isChecked2 = false;
  bool isChecked3 = false;
  bool isChecked4 = false;
  int? selectedRadioValue;
  int? selectedInlineValue;
  int? selectedDisableRadioValue;
  int? selectedRadioColorValue;
  String? dropdownValue;
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  bool isChecked = false;
  final TextEditingController emailTE = TextEditingController();
  final TextEditingController passwordTE = TextEditingController();
  final TextEditingController rePasswordTE = TextEditingController();
  bool isHorizontalFormChecked = false;


  final List<Map<String, dynamic>> checkboxData = [
    {'label': 'Default Checkbox', 'color': Colors.black54, 'isChecked': true},
    {'label': 'Success Checkbox', 'color': Colors.green, 'isChecked': true},
    {'label': 'Info Checkbox', 'color': Colors.blue, 'isChecked': true},
    {'label': 'Secondary Checkbox', 'color': Colors.grey, 'isChecked': true},
    {'label': 'Warning Checkbox', 'color': Colors.amber, 'isChecked': true},
    {'label': 'Danger Checkbox', 'color': Colors.red, 'isChecked': true},
    {'label': 'Dark Checkbox', 'color': Colors.black, 'isChecked': true},
  ];
  final List<String> dropdownItems = ['Action', 'Another action', 'Something else here'];

  @override
  void onInit() {
    selectedDisableRadioValue = 2;
    selectedRadioColorValue = 1;
    super.onInit();
  }

  void onCheck(value){
    isChecked = value!;
    update();
  }

  void onHorizontalFormCheck(value){
    isHorizontalFormChecked = value!;
    update();
  }

  void onSelectRadio(value) {
    selectedRadioValue = value;
    update();
  }

  void onSelectColorRadio(value) {
    selectedRadioColorValue = value;
    update();
  }

  void onSelectInlineRadio(value) {
    selectedInlineValue = value;
    update();
  }

  void onSelectLayoutValue(value) {
    selectedLayoutValue = value;
    update();
  }

  void onSelectFloatingValue(String value) {
    selectFloatingValue = value;
    update();
  }

  void onChangeRangeValue(double rangeValue) {
    currentRangeValue = rangeValue;
    update();
  }

  void changeColor(Color color) {
    pickerColor = color;
    update();
  }

  void passwordToggle() {
    isShowPassword = !isShowPassword;
    update();
  }

  void onSelectValue(value) {
    selectedValue = value;
    update();
  }

  void toggleSelection(String value) {
    if (selectedOptions.contains(value)) {
      selectedOptions.remove(value);
    } else {
      selectedOptions.add(value);
    }
    update();
  }

  Future<void> pickFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles();
    if (result != null) {
      fileName = result.files.single.name;
      update();
    }
  }

  Future<void> pickDate() async {
    final DateTime? picked = await showDatePicker(
        context: Get.context!, initialDate: selectedDate ?? DateTime.now(), firstDate: DateTime(2015, 8), lastDate: DateTime(2101));
    if (picked != null && picked != selectedDate) {
      selectedDate = picked;
      update();
    }
  }

  void onCheckbox1() {
    isChecked1 = !isChecked1;
    update();
  }

  void onCheckbox2() {
    isChecked2 = !isChecked2;
    update();
  }

  void onCheckbox3() {
    isChecked3 = !isChecked3;
    update();
  }

  void onCheckbox4() {
    isChecked4 = !isChecked4;
    update();
  }

  void onColorCheckbox(index, value) {
    checkboxData[index]['isChecked'] = value;
    update();
  }
}
