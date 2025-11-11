import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/app_constant.dart';
import 'package:henox/controller/apps/kanban/add_kanban_controller.dart';
import 'package:henox/helpers/extensions/string.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/helpers/widgets/my_text_style.dart';

class AddKanbanTask extends StatefulWidget {
  const AddKanbanTask({super.key});

  @override
  State<AddKanbanTask> createState() => _AddKanbanTaskState();
}

class _AddKanbanTaskState extends State<AddKanbanTask> with UIMixin {
  AddKanbanTaskController controller = Get.put(AddKanbanTaskController());
  OutlineInputBorder outlineBorder = OutlineInputBorder(
      borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none);

  String projectToString(Project project) {
    switch (project) {
      case Project.select:
        return 'Select';
      case Project.adminDashboard:
        return 'Admin Dashboard';
      case Project.crmDesignDevelopment:
        return 'CRM - Design & Development';
      case Project.iosAppDesign:
        return 'iOS - App Design';
    }
  }

  @override
  Widget build(BuildContext context) {
    return GetBuilder(
      init: controller,
      tag: 'add_kanban_task_controller',
      builder: (controller) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: 450, minWidth: 250),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: MySpacing.nBottom(20),
                  child: MyText.titleMedium("Create New Task", fontWeight: 600),
                ),
                Divider(height: 44),
                Padding(
                  padding: MySpacing.nTop(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      MyText.titleMedium('Projects', fontWeight: 600),
                      MySpacing.height(12),
                      DropdownButtonFormField<Project>(
                        value: controller.selectedProject,
                        onChanged: controller.basicValidator
                            .onChanged<Object?>('project'),
                        dropdownColor: contentTheme.background,
                        items: Project.values.map((Project project) {
                          return DropdownMenuItem<Project>(
                              onTap: () =>
                                  controller.onSelectProjectTitle(project),
                              value: project,
                              child: MyText.bodyMedium(projectToString(project),
                                  fontWeight: 600));
                        }).toList(),
                        decoration: InputDecoration(
                            hintText: "Select project",
                            hintStyle: MyTextStyle.bodyMedium(),
                            disabledBorder: outlineBorder,
                            enabledBorder: outlineBorder,
                            errorBorder: outlineBorder,
                            focusedBorder: outlineBorder,
                            focusedErrorBorder: outlineBorder,
                            border: outlineBorder,
                            contentPadding: MySpacing.all(12),
                            isCollapsed: true,
                            filled: true,
                            floatingLabelBehavior: FloatingLabelBehavior.never),
                      ),
                      MySpacing.height(20),
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                MyText.titleMedium('Title', fontWeight: 600),
                                MySpacing.height(12),
                                TextFormField(
                                  controller: controller.titleController,
                                  decoration: InputDecoration(
                                      hintText: "Select title",
                                      hintStyle: MyTextStyle.bodyMedium(),
                                      disabledBorder: outlineBorder,
                                      enabledBorder: outlineBorder,
                                      errorBorder: outlineBorder,
                                      focusedBorder: outlineBorder,
                                      focusedErrorBorder: outlineBorder,
                                      border: outlineBorder,
                                      contentPadding: MySpacing.all(15),
                                      isCollapsed: true,
                                      filled: true,
                                      floatingLabelBehavior:
                                          FloatingLabelBehavior.never),
                                )
                              ],
                            ),
                          ),
                          MySpacing.width(20),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                MyText.titleMedium('Priority', fontWeight: 600),
                                MySpacing.height(12),
                                DropdownButtonFormField<Priority>(
                                  value: controller.selectPriority,
                                  onChanged: controller.basicValidator
                                      .onChanged<Object?>('project'),
                                  dropdownColor: contentTheme.background,
                                  items:
                                      Priority.values.map((Priority priority) {
                                    return DropdownMenuItem<Priority>(
                                        onTap: () => controller
                                            .onSelectPriority(priority),
                                        value: priority,
                                        child: MyText.bodyMedium(
                                            priority.name.capitalizeWords,
                                            fontWeight: 600));
                                  }).toList(),
                                  decoration: InputDecoration(
                                      hintText: "Select priority",
                                      hintStyle: MyTextStyle.bodyMedium(),
                                      disabledBorder: outlineBorder,
                                      enabledBorder: outlineBorder,
                                      errorBorder: outlineBorder,
                                      focusedBorder: outlineBorder,
                                      focusedErrorBorder: outlineBorder,
                                      border: outlineBorder,
                                      contentPadding: MySpacing.all(12),
                                      isCollapsed: true,
                                      filled: true,
                                      floatingLabelBehavior:
                                          FloatingLabelBehavior.never),
                                ),
                              ],
                            ),
                          )
                        ],
                      ),
                      MySpacing.height(20),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          MyText.titleMedium('Description', fontWeight: 600),
                          MySpacing.height(12),
                          TextFormField(
                            maxLines: 3,
                            controller: controller.detailController,
                            decoration: InputDecoration(
                                hintText: "Description",
                                hintStyle: MyTextStyle.bodyMedium(),
                                disabledBorder: outlineBorder,
                                enabledBorder: outlineBorder,
                                errorBorder: outlineBorder,
                                focusedBorder: outlineBorder,
                                focusedErrorBorder: outlineBorder,
                                border: outlineBorder,
                                contentPadding: MySpacing.all(12),
                                isCollapsed: true,
                                filled: true,
                                floatingLabelBehavior:
                                    FloatingLabelBehavior.never),
                          ),
                        ],
                      ),
                      MySpacing.height(20),
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                MyText.titleMedium("Assign", fontWeight: 600),
                                MySpacing.height(20),
                                DropdownButtonFormField<Assign>(
                                  value: controller.selectAssign,
                                  onChanged: controller.basicValidator
                                      .onChanged<Object?>('assign'),
                                  dropdownColor: contentTheme.background,
                                  items: Assign.values.map((Assign assign) {
                                    return DropdownMenuItem<Assign>(
                                        onTap: () =>
                                            controller.onSelectAssign(assign),
                                        value: assign,
                                        child: MyText.bodyMedium(
                                            assign.name.capitalizeWords,
                                            fontWeight: 600));
                                  }).toList(),
                                  decoration: InputDecoration(
                                      hintText: "Select assign",
                                      hintStyle: MyTextStyle.bodyMedium(),
                                      disabledBorder: outlineBorder,
                                      enabledBorder: outlineBorder,
                                      errorBorder: outlineBorder,
                                      focusedBorder: outlineBorder,
                                      focusedErrorBorder: outlineBorder,
                                      border: outlineBorder,
                                      contentPadding: MySpacing.all(12),
                                      isCollapsed: true,
                                      filled: true,
                                      floatingLabelBehavior:
                                          FloatingLabelBehavior.never),
                                ),
                              ],
                            ),
                          ),
                          MySpacing.width(20),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                MyText.titleMedium("Select Date",
                                    fontWeight: 600),
                                MySpacing.height(20),
                                MyContainer.bordered(
                                  onTap: () => controller.pickDate(),
                                  paddingAll: 10,
                                  borderRadiusAll: 8,
                                  child: Row(
                                    children: <Widget>[
                                      Icon(Icons.calendar_today_outlined,
                                          size: 16),
                                      MySpacing.width(10),
                                      MyText.labelMedium(
                                          controller.selectedDate != null
                                              ? dateFormatter.format(
                                                  controller.selectedDate!)
                                              : "",
                                          fontWeight: 600),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          )
                        ],
                      ),
                      MySpacing.height(20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          MyContainer(
                            paddingAll: 12,
                            onTap: () => Get.back(),
                            color: contentTheme.secondary.withAlpha(36),
                            child: MyText.bodyMedium('Cancel',
                                fontWeight: 600, color: contentTheme.secondary),
                          ),
                          SizedBox(width: 10),
                          MyContainer(
                            paddingAll: 12,
                            onTap: () => controller.onTapAddTask(),
                            color: contentTheme.primary,
                            child: MyText.bodyMedium('Add Task',
                                fontWeight: 600, color: contentTheme.onPrimary),
                          ),
                        ],
                      ),
                    ],
                  ),
                )
              ],
            ),
          ),
        );
      },
    );
  }
}
