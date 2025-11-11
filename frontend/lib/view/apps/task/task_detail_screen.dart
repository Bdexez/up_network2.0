import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/controller/apps/task/task_detail_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/utils/utils.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_button.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_dotted_line.dart';
import 'package:henox/helpers/widgets/my_flex.dart';
import 'package:henox/helpers/widgets/my_flex_item.dart';
import 'package:henox/helpers/widgets/my_list_extension.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/images.dart';
import 'package:henox/view/layouts/layout.dart';
import 'package:remixicon/remixicon.dart';

class TaskDetailScreen extends StatefulWidget {
  const TaskDetailScreen({super.key});

  @override
  State<TaskDetailScreen> createState() => _TaskDetailScreenState();
}

class _TaskDetailScreenState extends State<TaskDetailScreen> with SingleTickerProviderStateMixin, UIMixin {
  late TaskDetailController controller = Get.put(TaskDetailController());

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'task_detail_controller',
        builder: (controller) {
          return Column(
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Task Detail", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Apps'),
                        MyBreadcrumbItem(name: 'Task Detail'),
                      ],
                    ),
                  ],
                ),
              ),
              MySpacing.height(flexSpacing),
              Padding(
                padding: MySpacing.x(flexSpacing / 2),
                child: MyFlex(
                  children: [
                    taskDetail(),
                    attachments(),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  MyFlexItem taskDetail() {
    return MyFlexItem(
      sizes: 'lg-8',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          complete(),
          MySpacing.height(20),
          comments(),
        ],
      ),
    );
  }

  Widget comments() {
    return MyCard(
      shadow: MyShadow(elevation: 1, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              MyText.bodyMedium("Comment (51)", fontWeight: 600),
              PopupMenuButton(
                onSelected: controller.onSelectedComment,
                itemBuilder: (BuildContext context) {
                  return ["Recent", "Most Helpfully", "HIgh to Low", "Low to High"].map((behavior) {
                    return PopupMenuItem(
                      value: behavior,
                      height: 32,
                      child: MyText.bodySmall(
                        behavior.toString(),
                        color: theme.colorScheme.onSurface,
                        fontWeight: 600,
                      ),
                    );
                  }).toList();
                },
                color: theme.cardTheme.color,
                child: MyContainer.bordered(
                  padding: MySpacing.xy(8, 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: <Widget>[
                      MyText.labelMedium(controller.selectedComments.toString(), color: theme.colorScheme.onSurface),
                      Icon(LucideIcons.chevron_down, size: 20, color: theme.colorScheme.onSurface)
                    ],
                  ),
                ),
              )
            ],
          ),
          MySpacing.height(20),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              MyContainer.rounded(
                height: 32,
                width: 32,
                paddingAll: 0,
                clipBehavior: Clip.antiAliasWithSaveLayer,
                child: Image.asset(Images.avatars[2], fit: BoxFit.cover),
              ),
              MySpacing.width(12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        MyText.bodyMedium("Jeremy Tomlinson", fontWeight: 600),
                        MyText.bodySmall("5 hours ago", fontWeight: 600),
                      ],
                    ),
                    MySpacing.height(6),
                    MyText.bodySmall("Nice work, makes me think of The Money Pit.", fontWeight: 600, xMuted: true),
                    MySpacing.height(12),
                    Row(
                      children: [
                        Icon(Remix.reply_line, color: Colors.grey, size: 20),
                        MySpacing.width(4),
                        MyText.bodySmall("Reply"),
                      ],
                    ),
                    MySpacing.height(12),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        MyContainer.rounded(
                          height: 32,
                          width: 32,
                          paddingAll: 0,
                          clipBehavior: Clip.antiAliasWithSaveLayer,
                          child: Image.asset(Images.avatars[3], fit: BoxFit.cover),
                        ),
                        MySpacing.width(12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  MyText.bodyMedium("Thelma Fridley3", fontWeight: 600),
                                  MyText.bodySmall("3 hours ago", fontWeight: 600),
                                ],
                              ),
                              MySpacing.height(4),
                              MyText.bodySmall("i'm in the middle of a timelapse animation myself! (Very different though.) Awesome stuff.",
                                  xMuted: true, fontWeight: 600),
                              MySpacing.height(12),
                              Row(
                                children: [
                                  Icon(Remix.reply_line, color: Colors.grey, size: 20),
                                  MySpacing.width(4),
                                  MyText.bodySmall("Reply"),
                                ],
                              )
                            ],
                          ),
                        )
                      ],
                    )
                  ],
                ),
              )
            ],
          ),
          MySpacing.height(20),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              MyContainer.rounded(
                height: 32,
                width: 32,
                paddingAll: 0,
                clipBehavior: Clip.antiAliasWithSaveLayer,
                child: Image.asset(Images.avatars[4], fit: BoxFit.cover),
              ),
              MySpacing.width(12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        MyText.bodyMedium("Kevin Martinez1", fontWeight: 600),
                        MyText.bodySmall("5 hours ago", fontWeight: 600),
                      ],
                    ),
                    MySpacing.height(4),
                    MyText.bodySmall("It would be very nice to have.", xMuted: true, fontWeight: 600),
                    MySpacing.height(12),
                    Row(
                      children: [
                        Icon(Remix.reply_line, color: Colors.grey, size: 20),
                        MySpacing.width(4),
                        MyText.bodySmall("Reply"),
                      ],
                    )
                  ],
                ),
              )
            ],
          ),
          Center(
            child: MyButton.text(
                onPressed: () {},
                splashColor: contentTheme.danger.withAlpha(40),
                padding: MySpacing.all(4),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Remix.loader_2_line, size: 16, color: contentTheme.danger),
                    MySpacing.width(4),
                    MyText.labelMedium("Loading", fontWeight: 600, color: contentTheme.danger),
                  ],
                )),
          )
        ],
      ),
    );
  }

  Widget complete() {
    return MyCard(
      shadow: MyShadow(elevation: 1, position: MyShadowPosition.bottom),
      width: double.infinity,
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Theme(
                data: ThemeData(),
                child: Checkbox(
                  value: controller.taskCheck,
                  onChanged: (value) => controller.onChangeTaskCheckToggle(),
                ),
              ),
              MySpacing.width(8),
              MyText.bodyMedium("Mark as Complete", muted: true),
            ],
          ),
          MySpacing.height(20),
          MyText.titleMedium("Simple Admin Dashboard Template Design", fontWeight: 600, muted: true),
          MySpacing.height(20),
          completeTaskDetail(),
          MySpacing.height(20),
          taskOverView(),
          MySpacing.height(20),
          subTasks(),
        ],
      ),
    );
  }

  Widget subTasks() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        MyText.titleMedium("Checklists/Sub-tasks", fontWeight: 600, muted: true),
        MySpacing.height(12),
        ListView(
            shrinkWrap: true,
            children: controller.subTask.keys
                .map((String key) => Theme(
                      data: ThemeData(),
                      child: CheckboxListTile(
                        dense: true,
                        contentPadding: MySpacing.all(0),
                        visualDensity: VisualDensity.compact,
                        controlAffinity: ListTileControlAffinity.leading,
                        title: MyText.bodyMedium(key, muted: true),
                        value: controller.subTask[key],
                        onChanged: (value) => controller.onChangeSubTask(key, value),
                      ),
                    ))
                .toList())
      ],
    );
  }

  Widget taskOverView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        MyText.titleMedium("Overview:", fontWeight: 600, muted: true),
        MySpacing.height(8),
        MyText.bodySmall(controller.dummyTexts[2], maxLines: 2,muted: true, overflow: TextOverflow.ellipsis)
      ],
    );
  }

  Widget completeTaskDetail() {
    return Wrap(
      clipBehavior: Clip.antiAliasWithSaveLayer,
      spacing: 100,
      runSpacing: 20,
      crossAxisAlignment: WrapCrossAlignment.start,
      alignment: WrapAlignment.start,
      runAlignment: WrapAlignment.start,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            MyText.bodyMedium("Assigned To", xMuted: true, fontWeight: 600),
            MySpacing.height(8),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                MyContainer.rounded(
                  paddingAll: 0,
                  height: 28,
                  width: 28,
                  clipBehavior: Clip.antiAliasWithSaveLayer,
                  child: Image.asset(Images.avatars[8], fit: BoxFit.cover),
                ),
                MySpacing.width(12),
                MyText.bodyMedium("Jonathan Andrews"),
              ],
            )
          ],
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            MyText.bodyMedium("Project Name", xMuted: true, fontWeight: 600),
            MySpacing.height(8),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(LucideIcons.briefcase, color: contentTheme.success, size: 16),
                MySpacing.width(12),
                MyText.bodyMedium("Examron Envirenment"),
              ],
            )
          ],
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            MyText.bodyMedium("Due Date", xMuted: true, fontWeight: 600),
            MySpacing.height(8),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Remix.calendar_todo_line, color: contentTheme.success, size: 16),
                MySpacing.width(12),
                MyText.bodyMedium("Today 10am"),
              ],
            )
          ],
        )
      ],
    );
  }

  MyFlexItem attachments() {
    return MyFlexItem(
      sizes: 'lg-4',
      child: MyCard(
        shadow: MyShadow(elevation: 1, position: MyShadowPosition.bottom),
        paddingAll: 24,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            MyText.bodyMedium("Attachments", fontWeight: 600),
            MySpacing.height(12),
            InkWell(
              onTap: controller.pickFile,
              child: SizedBox(
                height: 190,
                child: MyDottedLine(
                  strokeWidth: 0.6,
                  color: contentTheme.cardShadow,
                  dottedLength: 8,
                  space: 4,
                  corner: MyDottedLineCorner(leftBottomCorner: 2, leftTopCorner: 2, rightBottomCorner: 2, rightTopCorner: 2),
                  child: Center(
                    heightFactor: 1.5,
                    child: Padding(
                      padding: MySpacing.all(8),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Icon(Remix.upload_cloud_line),
                          MyContainer(
                            width: 340,
                            alignment: Alignment.center,
                            paddingAll: 0,
                            child: MyText.bodyLarge("Drop files here or click to upload.",
                                fontWeight: 700, xMuted: true, fontSize: 18, textAlign: TextAlign.center),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
            MySpacing.height(16),
            if (controller.files.isNotEmpty) ...[
              Column(
                children: controller.files
                    .mapIndexed((index, file) => Padding(
                          padding: MySpacing.bottom(12),
                          child: attachmentFiles("ZIP", file.name, Utils.getStorageStringFromByte(file.bytes?.length ?? 0)),
                        ))
                    .toList(),
              ),
            ],
            attachmentFiles("ZIP", "Admin-sketch-design.zip", "2.3 MB", color: contentTheme.primary),
            MySpacing.height(12),
            attachmentFiles("JPG", "Dashboard-design.jpg", "3.25 MB", color: contentTheme.primary),
            MySpacing.height(12),
            attachmentFiles(".MP4", "Admin-bug-report.mp4", "7.05 MB", color: contentTheme.onBackground),
          ],
        ),
      ),
    );
  }

  Widget attachmentFiles(String fileType, fileName, size, {Color? color}) {
    return MyContainer.bordered(
      paddingAll: 12,
      child: Row(
        children: [
          MyContainer(
            paddingAll: 0,
            height: 44,
            width: 44,
            color: color?.withAlpha(32) ?? contentTheme.primary.withAlpha(60),
            child: Center(child: MyText.bodyMedium(fileType, color: color ?? contentTheme.primary)),
          ),
          MySpacing.width(12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                MyText.titleSmall(fileName, fontWeight: 700,xMuted: true, maxLines: 1, overflow: TextOverflow.ellipsis),
                MySpacing.height(4),
                MyText.bodySmall(size),
              ],
            ),
          ),
          MySpacing.width(12),
          Icon(Remix.download_line, size: 16, color: contentTheme.onBackground),
        ],
      ),
    );
  }
}
