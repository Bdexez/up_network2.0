import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/app_constant.dart';
import 'package:henox/controller/apps/task/add_task_controller.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/helpers/widgets/my_text_style.dart';
import 'package:henox/images.dart';

class AddTaskScreen extends StatefulWidget {
  const AddTaskScreen({super.key});

  @override
  State<AddTaskScreen> createState() => _AddTaskScreenState();
}

class _AddTaskScreenState extends State<AddTaskScreen> with UIMixin {
  AddTaskController controller = Get.put(AddTaskController());

  @override
  Widget build(BuildContext context) {
    return GetBuilder(
      init: controller,
      tag: 'add_task_controller',
      builder: (controller) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: 450, minWidth: 250),
            child: SingleChildScrollView(
              child: Form(
                key: controller.formKey,
                child: Padding(
                  padding: MySpacing.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          MyText.bodyMedium("Add Task", fontWeight: 600),
                          IconButton(onPressed: () => Get.back(), visualDensity: VisualDensity.compact, iconSize: 18, icon: Icon(LucideIcons.x))
                        ],
                      ),
                      MySpacing.height(12),
                      TextFormField(
                          controller: controller.projectNameController,
                          decoration: InputDecoration(
                              hintText: 'Project Name',
                              hintStyle: MyTextStyle.bodyMedium(),
                              border: OutlineInputBorder(),
                              contentPadding: MySpacing.all(12)),
                          validator: (value) => controller.projectNameValidation(value)),
                      MySpacing.height(20),
                      TextFormField(
                        controller: controller.titleController,
                        decoration: InputDecoration(
                            hintText: 'Title', hintStyle: MyTextStyle.bodyMedium(), border: OutlineInputBorder(), contentPadding: MySpacing.all(12)),
                        validator: (value) => controller.titleValidation(value),
                      ),
                      MySpacing.height(20),
                      TextFormField(
                        controller: controller.clientNameController,
                        decoration: InputDecoration(
                            hintText: 'Client Name',
                            hintStyle: MyTextStyle.bodyMedium(),
                            border: OutlineInputBorder(),
                            contentPadding: MySpacing.all(12)),
                        validator: (value) => controller.titleValidation(value),
                      ),
                      MySpacing.height(12),
                      MyText.titleMedium('Assigned To', fontWeight: 600),
                      MySpacing.height(12),
                      SizedBox(
                        height: 100,
                        child: ListView(
                          children: controller.checkboxItems
                              .asMap()
                              .entries
                              .map(
                                (e) => Row(
                                  children: [
                                    Checkbox(
                                      value: e.value.isChecked,
                                      onChanged: (value) => setState(() => e.value.isChecked = value ?? false),
                                      fillColor: WidgetStateProperty.resolveWith((states) {
                                        if (!states.contains(WidgetState.selected)) {
                                          return Colors.white;
                                        }
                                        return null;
                                      }),
                                    ),
                                    MySpacing.width(20),
                                    CircleAvatar(
                                      backgroundImage: AssetImage(Images.avatars[e.key % Images.avatars.length]),
                                      radius: 12,
                                    ),
                                    MySpacing.width(20),
                                    MyText.bodyMedium(e.value.label)
                                  ],
                                ),
                              )
                              .toList(),
                        ),
                      ),
                      MySpacing.height(12),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              decoration: InputDecoration(labelText: 'Due Date', border: OutlineInputBorder(), contentPadding: MySpacing.all(12)),
                              readOnly: true,
                              style: MyTextStyle.bodyMedium(),
                              controller: TextEditingController(
                                  text: controller.selectedDate != null ? dateFormatter.format(controller.selectedDate!) : "Select Date"),
                              onTap: () => controller.pickDate(),
                            ),
                          ),
                          MySpacing.width(20),
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: controller.status,
                              decoration: InputDecoration(labelText: 'Status', border: OutlineInputBorder(), contentPadding: MySpacing.all(12)),
                              dropdownColor: contentTheme.disabled,
                              onChanged: (String? newValue) => setState(() => controller.status = newValue!),
                              items: ['Completed', 'New', 'InProgress', 'Pending'].map<DropdownMenuItem<String>>((String value) {
                                return DropdownMenuItem<String>(
                                  value: value,
                                  child: MyText.bodyMedium(value, fontWeight: 600),
                                );
                              }).toList(),
                            ),
                          ),
                        ],
                      ),
                      MySpacing.height(20),
                      DropdownButtonFormField<String>(
                        value: controller.priority,
                        dropdownColor: contentTheme.disabled,
                        decoration: InputDecoration(labelText: 'Priority', border: OutlineInputBorder(), contentPadding: MySpacing.all(12)),
                        onChanged: (String? newValue) => controller.onSelectPriority(newValue!),
                        items: ['High', 'Medium', 'Low'].map<DropdownMenuItem<String>>((String value) {
                          return DropdownMenuItem<String>(
                            value: value,
                            child: MyText.bodyMedium(value, fontWeight: 600),
                          );
                        }).toList(),
                      ),
                      SizedBox(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          MyContainer(
                            paddingAll: 12,
                            onTap: () => controller.onTapAddTask(),
                            color: contentTheme.secondary.withAlpha(36),
                            child: MyText.bodyMedium('Add Task', fontWeight: 600, color: contentTheme.secondary),
                          ),
                          SizedBox(width: 10),
                          MyContainer(
                            paddingAll: 12,
                            onTap: () => Get.back(),
                            color: contentTheme.primary,
                            child: MyText.bodyMedium('Close', fontWeight: 600, color: contentTheme.onPrimary),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
