import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/controller/apps/task/add_task_controller.dart';
import 'package:henox/controller/apps/task/task_list_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/cache.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/utils/utils.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_flex.dart';
import 'package:henox/helpers/widgets/my_flex_item.dart';
import 'package:henox/helpers/widgets/my_list_extension.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/view/apps/task/add_task_screen.dart';
import 'package:henox/view/layouts/layout.dart';

class TaskListScreen extends StatefulWidget {
  const TaskListScreen({super.key});

  @override
  State<TaskListScreen> createState() => _TaskListScreenState();
}

class _TaskListScreenState extends State<TaskListScreen> with SingleTickerProviderStateMixin, UIMixin {
  late TaskListController controller = Get.put(TaskListController());

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'task_list_controller',
        builder: (controller) {
          return Column(
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Task", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Apps'),
                        MyBreadcrumbItem(name: 'Task List'),
                      ],
                    ),
                  ],
                ),
              ),
              MySpacing.height(flexSpacing),
              Padding(
                padding: MySpacing.x(flexSpacing / 2),
                child: MyFlex(children: [
                  MyFlexItem(
                      sizes: 'lg-3 md-6',
                      child: buildTaskOverView(LucideIcons.ticket, theme.colorScheme.primary, "Total Task", "242k", "19.45%", LucideIcons.arrow_up)),
                  MyFlexItem(
                      sizes: 'lg-3 md-6',
                      child: buildTaskOverView(
                          LucideIcons.badge_check, contentTheme.success, "Completed Task", "192k", "14.45%", LucideIcons.arrow_down)),
                  MyFlexItem(
                      sizes: 'lg-3 md-6',
                      child: buildTaskOverView(LucideIcons.clock, contentTheme.warning, "Pending Tasks", "12.42k", "8.14%", LucideIcons.arrow_down)),
                  MyFlexItem(
                      sizes: 'lg-3 md-6',
                      child:
                          buildTaskOverView(LucideIcons.octagon_x, contentTheme.danger, "Canceled Tasks", "8.14k", "12.98%", LucideIcons.arrow_up)),
                  MyFlexItem(child: totalTaskList()),
                ]),
              )
            ],
          );
        },
      ),
    );
  }

  Widget totalTaskList() {
    return MyCard(
      paddingAll: 24,
      shadow: MyShadow(elevation: 1, position: MyShadowPosition.bottom),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: MyText.bodyMedium("Total Task", fontWeight: 600)),
              MyContainer(
                  onTap: () {
                    setState(() {
                      showDialog(
                        context: context,
                        builder: (BuildContext context) => AddTaskScreen(),
                      );
                    });
                  },
                  color: contentTheme.primary,
                  paddingAll: 8,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(LucideIcons.plus, size: 16, color: contentTheme.onPrimary),
                      MySpacing.width(12),
                      MyText.bodyMedium("Create Task", fontWeight: 600, color: contentTheme.onPrimary),
                    ],
                  )),
              MySpacing.width(12),
              buildPopUpMenu(),
            ],
          ),
          MySpacing.height(20),
          GetBuilder(
              init: AddTaskController(),
              builder: (addTaskController) {
                if (addTaskController.totalTask.isNotEmpty) {
                  return SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: MyContainer.none(
                      borderRadiusAll: 4,
                      clipBehavior: Clip.antiAliasWithSaveLayer,
                      child: DataTable(
                        sortColumnIndex: 1,
                        sortAscending: true,
                        onSelectAll: (_) => {},
                        headingRowColor: WidgetStatePropertyAll(contentTheme.secondary.withAlpha(40)),
                        dataRowMaxHeight: 60,
                        columnSpacing: 105,
                        showBottomBorder: false,
                        columns: [
                          DataColumn(label: MyText.labelLarge('Task', fontWeight: 600)),
                          DataColumn(label: MyText.labelLarge('Task ID', fontWeight: 600)),
                          DataColumn(label: MyText.labelLarge('Assigned Date', fontWeight: 600)),
                          DataColumn(label: MyText.labelLarge('Due date', fontWeight: 600)),
                          DataColumn(label: MyText.labelLarge('Status', fontWeight: 600)),
                          DataColumn(label: MyText.labelLarge('Priority', fontWeight: 600)),
                          DataColumn(label: MyText.labelLarge('Assigned to', fontWeight: 600)),
                          DataColumn(label: MyText.labelLarge('Action', fontWeight: 600))
                        ],
                        rows: TotalTaskCache.totalTask
                            .mapIndexed(
                              (index, data) => DataRow(
                                cells: [
                                  DataCell(MyText.bodyMedium(data.task)),
                                  DataCell(MyText.bodyMedium(data.taskID)),
                                  DataCell(MyText.bodyMedium(Utils.getDateStringFromDateTime(data.assignedDate))),
                                  DataCell(MyText.bodyMedium(Utils.getDateStringFromDateTime(data.dueDate))),
                                  DataCell(MyContainer(
                                    padding: MySpacing.xy(4, 3),
                                    color: getStatusColor(data.status)!.withAlpha(36),
                                    child: MyText.bodySmall(data.status, color: getStatusColor(data.status)),
                                  )),
                                  DataCell(MyContainer(
                                    padding: MySpacing.xy(4, 3),
                                    color: getPriorityColor(data.priority),
                                    child: MyText.bodySmall(data.priority, color: Colors.white),
                                  )),
                                  DataCell(
                                      Expanded(
                                        child: SizedBox(
                                          height: 32,
                                          child: Stack(
                                              alignment: Alignment.centerRight,
                                              children: data.assignedTo!
                                                  .mapIndexed((index, image) => Positioned(
                                                left: (20 * index).toDouble(),
                                                child: MyContainer.rounded(
                                                  paddingAll: 2,
                                                  child: MyContainer.rounded(
                                                    height: 32,
                                                    width: 32,
                                                    paddingAll: 0,
                                                    child: Image.asset(image, fit: BoxFit.cover),
                                                  ),
                                                ),
                                              ))
                                                  .toList()),
                                        ),
                                      )
                                  ),
                                  DataCell(Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      MyContainer(
                                        onTap: (){},
                                        paddingAll: 8,
                                        color: contentTheme.success.withAlpha(36),
                                        child: Icon(LucideIcons.square_pen, size: 16, color: contentTheme.success),
                                      ),
                                      MySpacing.width(12),
                                      MyContainer(
                                        onTap: (){},
                                        paddingAll: 8,
                                        color: contentTheme.danger.withAlpha(36),
                                        child: Icon(LucideIcons.trash_2, size: 16, color: contentTheme.danger),
                                      ),
                                    ],
                                  )),
                                ],
                              ),
                            )
                            .toList(),
                      ),
                    ),
                  );
                }
                return SizedBox();
              }),
        ],
      ),
    );
  }

  Color? getStatusColor(String? status) {
    switch (status) {
      case "New":
        return contentTheme.primary;
      case "InProgress":
        return contentTheme.info;
      default:
        return contentTheme.secondary;
    }
  }

  Color? getPriorityColor(String? status) {
    switch (status) {
      case "Medium":
        return contentTheme.secondary;
      case "High":
        return contentTheme.danger;
      case "Low":
        return Colors.blue;
      default:
        return contentTheme.secondary;
    }
  }

  Widget buildPopUpMenu() {
    return PopupMenuButton(
      offset: Offset(0, 40),
      clipBehavior: Clip.antiAliasWithSaveLayer,
      shape: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
      itemBuilder: (BuildContext context) => [
        PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("New Tasks", fontWeight: 600)),
        PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Pending Tasks", fontWeight: 600)),
        PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Completed Tasks", fontWeight: 600)),
        PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("InProgress Tasks", fontWeight: 600)),
      ],
      child: MyContainer.bordered(paddingAll: 8, child: Icon(LucideIcons.ellipsis_vertical, size: 16)),
    );
  }

  Widget buildTaskOverView(IconData icon, Color iconColor, String title, description, percentage, IconData arrowIcon) {
    return MyCard(
      paddingAll: 24,
      shadow: MyShadow(elevation: 1, position: MyShadowPosition.bottom),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              MyContainer(
                  height: 70,
                  width: 70,
                  borderRadiusAll: 10,
                  paddingAll: 0,
                  clipBehavior: Clip.antiAliasWithSaveLayer,
                  color: iconColor.withAlpha(50),
                  child: Icon(icon, color: iconColor, size: 32)),
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    MyText.bodyLarge(title, fontWeight: 600, muted: true, overflow: TextOverflow.ellipsis),
                    MySpacing.height(4),
                    MyText.titleLarge(description, fontWeight: 700, fontSize: 28, muted: true, color: contentTheme.dark),
                  ],
                ),
              )
            ],
          ),
          MySpacing.height(20),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              MyContainer(
                  color: arrowIcon == LucideIcons.arrow_up ? contentTheme.success.withAlpha(32) : contentTheme.danger.withAlpha(32),
                  padding: MySpacing.all(3),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    Icon(arrowIcon, size: 14, color: arrowIcon == LucideIcons.arrow_up ? contentTheme.success : contentTheme.danger),
                    MySpacing.width(2),
                    MyText.bodySmall(percentage,
                        fontWeight: 600, muted: true, color: arrowIcon == LucideIcons.arrow_up ? contentTheme.success : contentTheme.danger)
                  ])),
              MySpacing.width(4),
              Expanded(child: MyText.bodyMedium("vs. previous month", muted: true, maxLines: 1, overflow: TextOverflow.ellipsis)),
            ],
          )
        ],
      ),
    );
  }
}
