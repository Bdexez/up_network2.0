import 'package:henox/controller/my_controller.dart';

class FileManagerController extends MyController {
  int selectGrid = 0;

  void onSelectGridToggle(int id) {
    selectGrid = id;
    update();
  }
}
