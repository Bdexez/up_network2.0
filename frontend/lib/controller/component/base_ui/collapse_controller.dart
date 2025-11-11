import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/widgets/my_text_utils.dart';

class CollapseController extends MyController {
  List<String> dummyTexts =
      List.generate(12, (index) => MyTextUtils.getDummyText(60));
  bool isCollapse = false;
  bool isPanel1Expanded = false;
  bool isPanel2Expanded = false;
  bool isCollapseHorizontal = false;

  void togglePanel1() {
    isPanel1Expanded = !isPanel1Expanded;
    update();
  }

  void togglePanel2() {
    isPanel2Expanded = !isPanel2Expanded;
    update();
  }

  void toggleAllPanels() {
    isPanel1Expanded = !isPanel1Expanded;
    isPanel2Expanded = !isPanel2Expanded;
    update();
  }

  void onCollapse() {
    isCollapse = !isCollapse;
    update();
  }

  void onCollapseHorizontal() {
    isCollapseHorizontal = !isCollapseHorizontal;
    update();
  }
}
