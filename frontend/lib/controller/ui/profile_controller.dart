import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/widgets/my_text_utils.dart';
import 'package:henox/model/chat_modal.dart';
import 'package:henox/model/project_model.dart';

class ProfileController extends MyController {
  List<ChatModel> chat = [];
  List<ProjectModel> project = [];
  int isSelectTab = 0;
  List<String> dummyTexts =
      List.generate(12, (index) => MyTextUtils.getDummyText(60));

  @override
  void onInit() {
    ChatModel.dummyList.then((value) {
      chat = value.sublist(0, 5);
      update();
    });
    ProjectModel.dummyList.then((value) {
      project = value;
      update();
    });
    super.onInit();
  }

  void onSelectTabToggle(int tabIndex) {
    isSelectTab = tabIndex;
    update();
  }
}
