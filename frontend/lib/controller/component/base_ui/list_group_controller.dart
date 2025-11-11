import 'package:henox/controller/my_controller.dart';
import 'package:remixicon/remixicon.dart';

class ListGroupController extends MyController {
  bool isFirstChecked = false;
  bool isSecondChecked = false;
  String? selectedRadio;
  int selectedIndex = 0;

  List basicExample = [
    {"icon": Remix.drive_line, "title": "Google Drive", "badge": 12},
    {"icon": Remix.messenger_line, "title": "Facebook Manager", "badge": 65},
    {"icon": Remix.apple_line, "title": "Apple Technology Company", "badge": 5},
    {"icon": Remix.lifebuoy_line, "title": "Intercom Support System", "badge": 99},
    {"icon": Remix.paypal_line, "title": "Paypal Payment Gateway", "badge": 8},
  ];

  List customContent = [
    {
      'heading': 'List group item heading',
      'timestamp': '3 days ago',
      'description': 'Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.',
      'footer': 'Donec id elit non mi porta.',
    },
    {
      'heading': 'List group item heading',
      'timestamp': '3 days ago',
      'description': 'Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.',
      'footer': 'Donec id elit non mi porta.',
    },
    {
      'heading': 'List group item heading',
      'timestamp': '3 days ago',
      'description': 'Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.',
      'footer': 'Donec id elit non mi porta.',
    },
  ];

  void onFirstCheckBox(bool? value) {
    isFirstChecked = value ?? false;
    update();
  }

  void onSecondCheckBox(bool? value) {
    isSecondChecked = value ?? false;
    update();
  }

  void onSelectRadio(String? value) {
    selectedRadio = value;
    update();
  }

  void onSelectContent(value) {
    selectedIndex = value;
    update();
  }
}
