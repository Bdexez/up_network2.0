import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/widgets/my_text_utils.dart';
import 'package:henox/model/time_line_model.dart';

class TimelineController extends MyController {
  List<TimeLineModel> timeLine = [];

  List<String> dummyTexts =
      List.generate(12, (index) => MyTextUtils.getDummyText(60));

  @override
  void onInit() {
    TimeLineModel.dummyList.then((value) {
      timeLine = value;
      update();
    });
    super.onInit();
  }
}
