import 'package:flutter/material.dart';
import 'package:henox/controller/my_controller.dart';

class RangeSliderController extends MyController {
  double defaultSliderValue = 10;
  RangeValues defaultSlider = RangeValues(550, 1000);
  RangeValues prefixSlider = RangeValues(200, 800);
  RangeValues rangeSlider = RangeValues(-500, 500);
  final double step = 250;
  final int stepDivisions = 2000 ~/ 250;
  RangeValues stepValue = RangeValues(-500, 500);
  final List<String> customValues = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  final double customMin = 0;
  final double customMax = 11;
  RangeValues values = RangeValues(3, 8);
  double labelSliderValue = 50;
  double tickSliderValue = 0;
  double dividerSliderValue = 50;

  DateTime yearValue = DateTime(2017, 01, 01);
  DateTime hourValue = DateTime(2020, 01, 01, 13, 00, 00);

  DateTime dateValue = DateTime(2016, 1, 01);
  double stepSliderValue = 0;

  void onDefaultSlider(value) {
    defaultSliderValue = value;
    update();
  }

  void onMinAndMaxRangeSlider(value) {
    defaultSlider = value;
    update();
  }

  void onPrefixSlider(value) {
    prefixSlider = value;
    update();
  }

  void onRangeSlider(value) {
    rangeSlider = value;
    update();
  }

  void onStepSlider(values) {
    stepValue = RangeValues(
      (values.start / step).round() * step,
      (values.end / step).round() * step,
    );
    update();
  }

  void onCustomValues(value) {
    values = value;
    update();
  }

  void onHourSlider(value){
    hourValue = value as DateTime;
    update();
  }

  void onYearSlider(value){
    yearValue = value as DateTime;
    update();
  }

  void onDividerSlider(value){
    dividerSliderValue = value as double;
    update();
  }

  void onTickSlider(value){
    tickSliderValue = value as double;
    update();
  }

  void onLabelSlider(value) {
    labelSliderValue = value as double;
    update();
  }

  void onStepSliderValue(value) {
    stepSliderValue = value as double;
    update();
  }

  void onDateValue(value){
    dateValue = value as DateTime;
    update();
  }
}
