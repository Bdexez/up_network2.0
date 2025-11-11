import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/widgets/my_text_utils.dart';

class AlertController extends MyController {
  List<String> dummyTexts =
      List.generate(12, (index) => MyTextUtils.getDummyText(60));

  List dismissingAlerts = [
    {"colorName": "Primary", "color": "0xff007bff"},
    {"colorName": "Secondary", "color": "0xff6c757d"},
    {"colorName": "Success", "color": "0xff28a745"},
    {"colorName": "Error", "color": "0xffdc3545"},
    {"colorName": "Warning", "color": "0xffffc107"},
    {"colorName": "Info", "color": "0xff17a2b8"},
    {"colorName": "Pink", "color": "0xffe83e8c"},
    {"colorName": "Purple", "color": "0xff6f42c1"},
    {"colorName": "Light", "color": "0xfff8f9fa"},
    {"colorName": "Dark", "color": "0xff343a40"}
  ];

  void removeColorToggle(index) {
    dismissingAlerts.removeAt(index);
    update();
  }
}
