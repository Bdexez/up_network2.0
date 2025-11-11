import 'package:henox/controller/my_controller.dart';
import 'package:file_picker/file_picker.dart';
import 'package:henox/helpers/widgets/my_text_utils.dart';

class TaskDetailController extends MyController {
  List<PlatformFile> files = [];
  bool taskCheck = false;
  String selectedComments = "Recent";
  List<String> dummyTexts =
      List.generate(12, (index) => MyTextUtils.getDummyText(60));

  Future<void> pickFile() async {
    var result = await FilePicker.platform.pickFiles();
    if (result?.files[0] != null) files.add(result!.files[0]);
    update();
  }

  void onSelectedComment(String comment) {
    selectedComments = comment;
    update();
  }

  void onChangeTaskCheckToggle() {
    taskCheck = !taskCheck;
    update();
  }

  Map<String, bool> subTask = {
    "Find out the old contract documents": false,
    "Organize meeting sales associates to understand need in detail": false,
    "Make sure to cover every small details": false
  };

  void onChangeSubTask(key,value){
    subTask[key] = value!;
    update();
  }
}
