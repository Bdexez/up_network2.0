import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/utils/cache.dart';
import 'package:henox/model/total_task_model.dart';

class CheckboxItem {
  final String label;
  final String avatar;
  bool isChecked;

  CheckboxItem(
      {required this.label, required this.avatar, this.isChecked = false});
}

class AddTaskController extends MyController {
  final formKey = GlobalKey<FormState>();
  List<TotalTaskModel> totalTask = [];
  late TextEditingController projectNameController,
      titleController,
      clientNameController;
  DateTime? selectedDate;
  String status = 'New';
  String priority = 'Medium';

  @override
  void onInit() {
    TotalTaskModel.dummyList.then((value) {
      totalTask = value;
      update();
    });
    fetchData();
    projectNameController = TextEditingController();
    titleController = TextEditingController();
    clientNameController = TextEditingController();
    super.onInit();
  }

  fetchData() async {
    await TotalTaskCache.initDummy();
  }

  String? projectNameValidation(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter a project name';
    }
    return null;
  }

  String? titleValidation(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter a title';
    }
    return null;
  }

  String? clientNameValidation(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter a client name';
    }
    return null;
  }

  Future<void> pickDate() async {
    final DateTime? picked = await showDatePicker(
        context: Get.context!,
        initialDate: selectedDate ?? DateTime.now(),
        firstDate: DateTime(2015, 8),
        lastDate: DateTime(2101));
    if (picked != null && picked != selectedDate) {
      selectedDate = picked;
      update();
    }
  }

  void onSelectPriority(String value) {
    priority = value;
    update();
  }

  void onTapAddTask() {
    if (formKey.currentState?.validate() ?? false) {
      TotalTaskCache.totalTask.add(
        TotalTaskModel(
            1,
            projectNameController.value.text,
            "SYF-03",
            selectedDate!,
            selectedDate!,
            status,
            priority, [
          'assets/images/users/avatar-1.jpg',
          'assets/images/users/avatar-2.jpg',
        ]),
      );
      projectNameController.clear();
      clientNameController.clear();
      titleController.clear();
      Get.back();
    }
    update();
  }

  List<CheckboxItem> checkboxItems = [
    CheckboxItem(label: 'James Forbes', avatar: 'avatar-2.jpg'),
    CheckboxItem(label: 'John Robles', avatar: 'avatar-3.jpg'),
    CheckboxItem(label: 'Mary Gant', avatar: 'avatar-4.jpg'),
    CheckboxItem(label: 'Curtis Saenz', avatar: 'avatar-1.jpg'),
    CheckboxItem(label: 'Virgie Price', avatar: 'avatar-5.jpg'),
    CheckboxItem(label: 'Anthony Mills', avatar: 'avatar-10.jpg'),
    CheckboxItem(label: 'Marian Angel', avatar: 'avatar-6.jpg'),
    CheckboxItem(label: 'Johnnie Walton', avatar: 'avatar-7.jpg'),
    CheckboxItem(label: 'Donna Weston', avatar: 'avatar-8.jpg'),
    CheckboxItem(label: 'Diego Norris', avatar: 'avatar-9.jpg'),
  ];
}
