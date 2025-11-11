import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/widgets/my_text_utils.dart';

class AccordionController extends MyController {
  final List<bool> defaultAccordions = [false, true, false];
  final List<bool> flushAccordions = [true, false, false];
  final List<bool> simpleCardAccordions = [false, false, true];
  final List<bool> alwaysOpenAccordions = [false, false, true];

  List<String> dummyTexts =
      List.generate(12, (index) => MyTextUtils.getDummyText(60));
}
