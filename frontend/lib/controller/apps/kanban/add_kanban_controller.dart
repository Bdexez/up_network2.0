import 'package:appflowy_board/appflowy_board.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/widgets/my_form_validator.dart';
import 'package:henox/images.dart';

enum Project {
  select,
  adminDashboard,
  crmDesignDevelopment,
  iosAppDesign,
}

enum Priority {
  high,
  medium,
  low;
}

enum Assign {
  coderthemes,
  robertCarlile,
  louisAllen,
  seanWhite,
  rileySteele,
  zakTurnbull,
}

class AddKanbanTaskController extends MyController {
  MyFormValidator basicValidator = MyFormValidator();
  Project selectedProject = Project.select;
  Priority selectPriority = Priority.medium;
  Assign selectAssign = Assign.coderthemes;
  TextEditingController titleController = TextEditingController();
  TextEditingController dateTEController = TextEditingController();
  TextEditingController detailController = TextEditingController();
  DateTime? selectedDate;
  List<TextItem>? addKanban = <TextItem>[];

  final AppFlowyBoardController boardData = AppFlowyBoardController(
    onMoveGroup: (fromGroupId, fromIndex, toGroupId, toIndex) {
      debugPrint('Move item from $fromIndex to $toIndex');
    },
    onMoveGroupItem: (groupId, fromIndex, toIndex) {
      debugPrint('Move $groupId:$fromIndex to $groupId:$toIndex');
    },
    onMoveGroupItemToGroup: (fromGroupId, fromIndex, toGroupId, toIndex) {
      debugPrint('Move $fromGroupId:$fromIndex to $toGroupId:$toIndex');
    },
  );
  late AppFlowyBoardScrollController boardController;

  void onSelectProjectTitle(Project project) {
    selectedProject = project;
    update();
  }

  void onSelectPriority(Priority priority) {
    selectPriority = priority;
    update();
  }

  void onSelectAssign(Assign assign) {
    selectAssign = assign;
    update();
  }

  Future<void> pickDate() async {
    final DateTime? picked = await showDatePicker(
        context: Get.context!, initialDate: selectedDate ?? DateTime.now(), firstDate: DateTime(2015, 8), lastDate: DateTime(2101));
    if (picked != null && picked != selectedDate) {
      selectedDate = picked;
      update();
    }
  }

  void onTapAddTask() {
    if (titleController.text.isNotEmpty && selectedDate != null) {
      TextItem appFlowyGroupItem = TextItem(
        selectPriority.toString().split('.').last.capitalize!,
        selectPriority == Priority.high
            ? Colors.red.shade400
            : selectPriority == Priority.medium
                ? Colors.brown
                : Colors.green.shade400,
        DateTime.parse(selectedDate.toString()),
        titleController.text,
        Images.avatars[0],
        "Flutter",
        8,
        [Images.avatars[0], Images.avatars[2], Images.avatars[3]],
      );
      addKanban!.add(appFlowyGroupItem);
      boardData.addGroupItem("To Do", appFlowyGroupItem);
      titleController.clear();
      detailController.clear();
      selectedDate = null;
      Get.back();
      update();
    }
  }

  @override
  void onInit() {
    super.onInit();
    final group1 = AppFlowyGroupData(
      id: "To Do",
      items: [
        TextItem("High", Colors.red.shade400, DateTime.parse('2024-09-08T17:33:12Z'), "ios App home page", Images.avatars[0], "ios", 12,
            [Images.avatars[0], Images.avatars[2], Images.avatars[3]]),
        TextItem(
            "Medium", Colors.brown, DateTime.parse('2024-07-29T08:23:44Z'), "Top Nav Layout Design", Images.avatars[1], "Hyper", 32, [Images.avatars[1], Images.avatars[3]]),
        TextItem("Low", Colors.green.shade400, DateTime.parse('2023-10-05T21:37:07Z'), "Invite user to a project", Images.avatars[2], "CRM", 10,
            [Images.avatars[4], Images.avatars[5]]),
      ],
      name: 'To Do',
    );
    final group2 = AppFlowyGroupData(
      id: "In Progress",
      items: [
        TextItem(
            "Medium", Colors.brown, DateTime.parse('2024-07-03T20:07:12Z'), "Write A release note", Images.avatars[3], "Hyper", 20, [Images.avatars[6], Images.avatars[7]]),
        TextItem("Low", Colors.green.shade400, DateTime.parse('2024-02-11T09:45:52Z'), "Enable analytics tracking", Images.avatars[4], "CRM", 24,
            [Images.avatars[9], Images.avatars[8]]),
      ],
      name: 'In Progress',
    );

    final group3 = AppFlowyGroupData(
      id: "Done",
      items: [
        TextItem(
            "High", Colors.red.shade400, DateTime.parse('2023-12-25T20:09:22Z'), "KanBan Board Design", Images.avatars[5], "CRM", 78, [Images.avatars[1], Images.avatars[3]]),
        TextItem("Medium", Colors.brown, DateTime.parse('2024-02-28T09:55:41Z'), "Code HTML emial Template", Images.avatars[6], "CRM", 40,
            [Images.avatars[0], Images.avatars[9], Images.avatars[4]]),
        TextItem("Medium", Colors.brown, DateTime.parse('2024-03-25T15:45:36Z'), "Brand Logo Design", Images.avatars[7], "Design", 65, [Images.avatars[0]]),
        TextItem("High", Colors.red.shade400, DateTime.parse('2024-07-27T07:51:01Z'), "Improve animation loader", Images.avatars[8], "CRM", 11,
            [Images.avatars[1], Images.avatars[3]]),
      ],
      name: 'Review',
    );

    final group4 = AppFlowyGroupData(
      id: "Wait",
      items: [
        TextItem("Low", Colors.green.shade400, DateTime.parse('2024-04-30T00:31:16Z'), "DashBoard Design", Images.avatars[9], "Hyper", 200,
            [Images.avatars[0], Images.avatars[2], Images.avatars[7]]),
      ],
      name: 'Done',
    );

    boardData.addGroup(group1);
    boardData.addGroup(group2);
    boardData.addGroup(group3);
    boardData.addGroup(group4);
  }
}

class TextItem extends AppFlowyGroupItem {
  final String kanbanLevel;
  final Color color;
  final DateTime date;
  final String title, image, jobTypeName;
  final double comment;
  final List<String> avatar;

  TextItem(this.kanbanLevel, this.color, this.date, this.title, this.image, this.jobTypeName, this.comment, this.avatar);

  @override
  String get id => title;
}
