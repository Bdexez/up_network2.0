import 'package:henox/controller/my_controller.dart';

enum SingleButtonDropdowns {
  action,
  anotherAction,
  somethingElse,
}

class DropdownsController extends MyController {
  SingleButtonDropdowns singleButtonDropdowns1 = SingleButtonDropdowns.action;
  SingleButtonDropdowns singleButtonDropdowns2 = SingleButtonDropdowns.action;
  SingleButtonDropdowns primaryButton = SingleButtonDropdowns.action;
  SingleButtonDropdowns secondaryButton = SingleButtonDropdowns.action;
  SingleButtonDropdowns successButton = SingleButtonDropdowns.action;
  SingleButtonDropdowns infoButton = SingleButtonDropdowns.action;
  SingleButtonDropdowns warningButton = SingleButtonDropdowns.action;
  SingleButtonDropdowns dangerButton = SingleButtonDropdowns.action;
  SingleButtonDropdowns largeButton1 = SingleButtonDropdowns.action;
  SingleButtonDropdowns largeButton2 = SingleButtonDropdowns.action;
  SingleButtonDropdowns smallButton1 = SingleButtonDropdowns.action;
  SingleButtonDropdowns smallButton2 = SingleButtonDropdowns.action;

  void onSelectSingleButtonDropdowns1(SingleButtonDropdowns value) {
    singleButtonDropdowns1 = value;
    update();
  }

  void onSelectSingleButtonDropdowns2(SingleButtonDropdowns value) {
    singleButtonDropdowns2 = value;
    update();
  }

  void onSelectSinglePrimaryButton(SingleButtonDropdowns value) {
    primaryButton = value;
    update();
  }

  void onSelectSingleSecondaryButton(SingleButtonDropdowns value) {
    secondaryButton = value;
    update();
  }

  void onSelectSingleSuccessButton(SingleButtonDropdowns value) {
    successButton = value;
    update();
  }

  void onSelectSingleInfoButton(SingleButtonDropdowns value) {
    infoButton = value;
    update();
  }

  void onSelectSingleWarningButton(SingleButtonDropdowns value) {
    warningButton = value;
    update();
  }

  void onSelectSingleDangerButton(SingleButtonDropdowns value) {
    dangerButton = value;
    update();
  }

  void onSelectLargeButton1(SingleButtonDropdowns value) {
    largeButton1 = value;
    update();
  }

  void onSelectLargeButton2(SingleButtonDropdowns value) {
    largeButton2 = value;
    update();
  }

  void onSelectSmallButton1(SingleButtonDropdowns value) {
    smallButton1 = value;
    update();
  }

  void onSelectSmallButton2(SingleButtonDropdowns value) {
    smallButton2 = value;
    update();
  }
}
