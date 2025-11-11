import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/widgets/my_text_utils.dart';

class FaqsController extends MyController {
  final List<bool> dataExpansionPanel1 = [true, false, false];
  final List<bool> dataExpansionPanel2 = [true, false, false];

  List<String> dummyTexts =
      List.generate(12, (index) => MyTextUtils.getDummyText(60));
}
