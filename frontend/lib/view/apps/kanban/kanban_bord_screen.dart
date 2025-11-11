import 'package:appflowy_board/appflowy_board.dart';
import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/controller/apps/kanban/add_kanban_controller.dart';
import 'package:henox/controller/apps/kanban/kanban_board_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/utils.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_list_extension.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/view/apps/kanban/add_kanban.dart';
import 'package:henox/view/layouts/layout.dart';
import 'package:remixicon/remixicon.dart';

class KanbanBoardScreen extends StatefulWidget {
  const KanbanBoardScreen({super.key});

  @override
  State<KanbanBoardScreen> createState() => _KanbanBoardScreenState();
}

class _KanbanBoardScreenState extends State<KanbanBoardScreen> with SingleTickerProviderStateMixin, UIMixin {
  KanbanBoardController controller = Get.put(KanbanBoardController());
  AddKanbanTaskController addKanbanTaskController = Get.put(AddKanbanTaskController());
  late ScrollController _controller;
  late OutlineInputBorder outlineBorder;

  @override
  void initState() {
    addKanbanTaskController.boardController = AppFlowyBoardScrollController();
    _controller = ScrollController();
    outlineBorder = OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'kanban_board_controller',
        builder: (controller) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Column(
                  children: [
                    Row(
                      children: [
                        MyText.titleMedium("Kanban Board", fontWeight: 600),
                        MySpacing.width(16),
                        MyContainer(
                          onTap: () {
                            setState(() => showDialog(context: context, builder: (context) => AddKanbanTask()));
                          },
                          color: contentTheme.success,
                          paddingAll: 8,
                          clipBehavior: Clip.antiAliasWithSaveLayer,
                          child: Center(child: MyText.bodyMedium("Add New", fontWeight: 600, color: contentTheme.onSuccess)),
                        ),
                        Spacer(),
                        MyBreadcrumb(
                          children: [
                            MyBreadcrumbItem(name: 'Apps'),
                            MyBreadcrumbItem(name: 'Kanban Board'),
                          ],
                        ),
                      ],
                    ),
                    MySpacing.height(20),
                    AppFlowyBoard(
                      config: AppFlowyBoardConfig(stretchGroupHeight: false, groupBackgroundColor: contentTheme.primary.withAlpha(20)),
                      controller: addKanbanTaskController.boardData,
                      cardBuilder: (context, group, groupItem) {
                        return AppFlowyGroupCard(
                          key: ValueKey(groupItem.id),
                          decoration: BoxDecoration(color: theme.colorScheme.surface, borderRadius: BorderRadius.circular(8)),
                          child: buildCard(groupItem),
                        );
                      },
                      boardScrollController: addKanbanTaskController.boardController,
                      footerBuilder: (context, columnData) {
                        return MySpacing.height(16);
                      },
                      headerBuilder: (context, columnData) {
                        return SizedBox(
                          height: 40,
                          child: ListView.builder(
                            controller: _controller,
                            shrinkWrap: true,
                            itemBuilder: (context, index) {
                              return AppFlowyGroupHeader(
                                  title: MyText.bodyMedium(columnData.headerData.groupName, fontSize: 16, fontWeight: 600, muted: true),
                                  margin: MySpacing.x(16),
                                  height: 40);
                            },
                          ),
                        );
                      },
                      groupConstraints: BoxConstraints.tightFor(width: 400),
                    ),
                  ],
                ),
              )
            ],
          );
        },
      ),
    );
  }

  Widget buildCard(AppFlowyGroupItem item) {
    if (addKanbanTaskController.addKanban == null) {
      return SizedBox();
    }
    if (item is TextItem) {
      return Padding(
        padding: MySpacing.xy(12, 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                MyText.bodyMedium(Utils.getDateStringFromDateTime(item.date), muted: true),
                MyContainer(
                  color: item.color,
                  borderRadiusAll: 4,
                  padding: MySpacing.xy(8, 4),
                  child: MyText.bodySmall(item.kanbanLevel, fontSize: 12, color: contentTheme.onPrimary),
                ),
              ],
            ),
            MySpacing.height(12),
            MyText.bodyMedium(item.title, fontWeight: 600),
            MySpacing.height(12),
            Row(
              children: [
                Icon(Remix.briefcase_4_line, size: 16),
                MySpacing.width(8),
                MyText.bodyMedium(item.jobTypeName, muted: true, fontWeight: 600),
                MySpacing.width(16),
                Icon(Remix.discuss_line, size: 16),
                MySpacing.width(8),
                MyText.bodyMedium("${item.comment} comments", muted: true, fontWeight: 600),
              ],
            ),
            MySpacing.height(12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: SizedBox(
                    height: 32,
                    child: Stack(
                        alignment: Alignment.centerRight,
                        children: item.avatar
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
                ),
                PopupMenuButton(
                  offset: Offset(-140, 30),
                  clipBehavior: Clip.antiAliasWithSaveLayer,
                  shape: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                  itemBuilder: (BuildContext context) => [
                    PopupMenuItem(
                        padding: MySpacing.xy(16, 8),
                        height: 10,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Remix.edit_box_line, size: 16),
                            MySpacing.width(12),
                            MyText.bodyMedium("Edit", fontWeight: 600),
                          ],
                        )),
                    PopupMenuItem(
                        padding: MySpacing.xy(16, 8),
                        height: 10,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Remix.delete_bin_6_line, size: 16),
                            MySpacing.width(12),
                            MyText.bodyMedium("Delete", fontWeight: 600),
                          ],
                        )),
                    PopupMenuItem(
                        padding: MySpacing.xy(16, 8),
                        height: 10,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Remix.user_add_line, size: 16),
                            MySpacing.width(12),
                            MyText.bodyMedium("Add People", fontWeight: 600),
                          ],
                        )),
                    PopupMenuItem(
                        padding: MySpacing.xy(16, 8),
                        height: 10,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Remix.logout_circle_line, size: 16),
                            MySpacing.width(12),
                            MyText.bodyMedium("Leave", fontWeight: 600),
                          ],
                        )),
                  ],
                  child: Icon(LucideIcons.ellipsis_vertical, size: 16),
                ),
              ],
            )
          ],
        ),
      );
    }
    if (item is RichTextItem) {
      return RichTextCard(item: item);
    }

    throw UnimplementedError();
  }
}

class RichTextCard extends StatefulWidget {
  final RichTextItem item;

  const RichTextCard({
    required this.item,
    super.key,
  });

  @override
  State<RichTextCard> createState() => _RichTextCardState();
}

class _RichTextCardState extends State<RichTextCard> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            MyText.bodyMedium(
              widget.item.title,
              textAlign: TextAlign.left,
            ),
          ],
        ),
      ),
    );
  }
}

class RichTextItem extends AppFlowyGroupItem {
  final String title;
  final String subtitle;

  RichTextItem({required this.title, required this.subtitle});

  @override
  String get id => title;
}
