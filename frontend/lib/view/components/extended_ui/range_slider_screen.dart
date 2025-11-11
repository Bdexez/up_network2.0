import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/extended_ui/range_slider_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_flex.dart';
import 'package:henox/helpers/widgets/my_flex_item.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/view/layouts/layout.dart';
import 'package:intl/intl.dart';
import 'package:intl/intl.dart' as intl;
import 'package:syncfusion_flutter_core/theme.dart';
import 'package:syncfusion_flutter_sliders/sliders.dart';

class RangeSliderScreen extends StatefulWidget {
  const RangeSliderScreen({super.key});

  @override
  State<RangeSliderScreen> createState() => _RangeSliderScreenState();
}

class _RangeSliderScreenState extends State<RangeSliderScreen> with UIMixin {
  RangeSliderController controller = Get.put(RangeSliderController());

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'range_slider_controller',
        builder: (controller) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Range Slider", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Extended UI'),
                        MyBreadcrumbItem(name: 'Range Slider'),
                      ],
                    ),
                  ],
                ),
              ),
              MySpacing.height(flexSpacing),
              Padding(
                padding: MySpacing.x(flexSpacing / 2),
                child: MyFlex(
                  children: [
                    MyFlexItem(sizes: 'lg-6 md-6', child: defaultSlider()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: minAndMixSlider()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: prefixSlider()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: rangeSlider()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: stepRange()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: customValues()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: labelSlider()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: tickSlider()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: dividerSlider()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: yearSlider()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: hourSlider()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: stepDurationSlider()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: stepSlider()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget defaultSlider() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Default", fontWeight: 600),
          MySpacing.height(20),
          MyText.bodySmall("Start with default options",muted: true, fontWeight: 600),
          MySpacing.height(12),
          Slider(
            value: controller.defaultSliderValue,
            min: 0,
            max: 100,
            divisions: 50,
            label: controller.defaultSliderValue.round().toString(),
            onChanged: (value) => controller.onDefaultSlider(value),
          ),
        ],
      ),
    );
  }

  Widget minAndMixSlider() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Min-Max Slider", fontWeight: 600),
          MySpacing.height(20),
          MyText.bodySmall("Set min value, max value and start point",muted: true, fontWeight: 600),
          MySpacing.height(12),
          RangeSlider(
            values: controller.defaultSlider,
            min: 100,
            max: 1000,
            divisions: 18,
            labels: RangeLabels(
              controller.defaultSlider.start.round().toString(),
              controller.defaultSlider.end.round().toString(),
            ),
            onChanged: (RangeValues values) => controller.onMinAndMaxRangeSlider(values),
          ),
        ],
      ),
    );
  }

  Widget prefixSlider() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Prefix Slider", fontWeight: 600),
          MySpacing.height(20),
          MyText.bodySmall("Showing grid and adding prefix \$",muted: true, fontWeight: 600),
          MySpacing.height(20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              MyText.bodyMedium("\$${controller.prefixSlider.start.toStringAsFixed(0)}", fontWeight: 600),
              MyText.bodyMedium("\$${controller.prefixSlider.end.toStringAsFixed(0)}", fontWeight: 600),
            ],
          ),
          RangeSlider(
            values: controller.prefixSlider,
            min: 100,
            max: 1000,
            divisions: 50,
            labels: RangeLabels(
              '\$${controller.prefixSlider.start.toStringAsFixed(0)}',
              '\$${controller.prefixSlider.end.toStringAsFixed(0)}',
            ),
            onChanged: (RangeValues values) => controller.onPrefixSlider(values),
          ),
        ],
      ),
    );
  }

  Widget rangeSlider() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Range", fontWeight: 600),
          MySpacing.height(20),
          MyText.bodySmall("Set up range with negative values",muted: true, fontWeight: 600),
          MySpacing.height(20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              MyText.bodyMedium("\$${controller.rangeSlider.start.toStringAsFixed(0)}", fontWeight: 600),
              MyText.bodyMedium("\$${controller.rangeSlider.end.toStringAsFixed(0)}", fontWeight: 600),
            ],
          ),
          RangeSlider(
            values: controller.rangeSlider,
            min: -1000,
            max: 1000,
            divisions: 20,
            labels: RangeLabels(
              '${controller.rangeSlider.start.toStringAsFixed(0)}',
              '${controller.rangeSlider.end.toStringAsFixed(0)}',
            ),
            onChanged: (RangeValues values) => controller.onRangeSlider(values),
          ),
        ],
      ),
    );
  }

  Widget stepRange() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Step", fontWeight: 600),
          MySpacing.height(20),
          MyText.bodySmall("Increment with specific value only (step)",muted: true, fontWeight: 600),
          MySpacing.height(20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              MyText.bodyMedium("\$${controller.stepValue.start.toStringAsFixed(0)}", fontWeight: 600),
              MyText.bodyMedium("\$${controller.stepValue.end.toStringAsFixed(0)}", fontWeight: 600),
            ],
          ),
          RangeSlider(
            values: controller.stepValue,
            min: -1000,
            max: 1000,
            divisions: controller.stepDivisions,
            labels: RangeLabels(
              '${controller.stepValue.start.toStringAsFixed(0)}',
              '${controller.stepValue.end.toStringAsFixed(0)}',
            ),
            onChanged: (RangeValues values) => controller.onStepSlider(values),
          ),
        ],
      ),
    );
  }

  Widget customValues() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Custom Values", fontWeight: 600),
          MySpacing.height(20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              MyText.bodyMedium("${controller.customValues[controller.values.start.toInt().toInt()]}", fontWeight: 600),
              MyText.bodyMedium("${controller.customValues[controller.values.end.toInt().toInt()]}", fontWeight: 600),
            ],
          ),
          RangeSlider(
            values: controller.values,
            min: controller.customMin,
            max: controller.customMax,
            divisions: controller.customValues.length - 1,
            labels: RangeLabels(
              controller.customValues[controller.values.start.toInt()],
              controller.customValues[controller.values.end.toInt()],
            ),
            onChanged: (RangeValues values) => controller.onCustomValues(values),
          ),
        ],
      ),
    );
  }

  Widget stepDurationSlider() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Step Duration Slider", fontWeight: 600),
          SfSliderTheme(
              data: SfSliderThemeData(),
              child: SfSlider(
                min: DateTime(2010, 01, 01),
                max: DateTime(2020, 01, 01),
                showLabels: true,
                interval: 2,
                stepDuration: const SliderStepDuration(years: 2),
                dateFormat: DateFormat.y(),
                labelPlacement: LabelPlacement.onTicks,
                dateIntervalType: DateIntervalType.years,
                showTicks: true,
                value: controller.dateValue,
                activeColor: contentTheme.primary,
                onChanged: (dynamic values) => controller.onDateValue(values),
                enableTooltip: true,
                tooltipTextFormatterCallback: (dynamic actualLabel, String formattedText) {
                  return DateFormat.y().format(actualLabel);
                },
              )),
        ],
      ),
    );
  }

  Widget stepSlider() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Step Slider", fontWeight: 600),
          SfSliderTheme(
              data: SfSliderThemeData(),
              child: SfSlider(
                  showLabels: true,
                  interval: 5,
                  min: -10.0,
                  max: 10.0,
                  stepSize: 5,
                  showTicks: true,
                  activeColor: contentTheme.primary,
                  value: controller.stepSliderValue,
                  onChanged: (dynamic values) => controller.onStepSliderValue(values),
                  enableTooltip: true)),
        ],
      ),
    );
  }

  Widget labelSlider() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Label Slider", fontWeight: 600),
          SfSliderTheme(
              data: SfSliderThemeData(),
              child: SfSlider(
                showLabels: true,
                interval: 20,
                min: 0.0,
                max: 100.0,
                value: controller.labelSliderValue,
                activeColor: contentTheme.primary,
                onChanged: (dynamic values) => controller.onLabelSlider(values),
                enableTooltip: true,
                numberFormat: NumberFormat('#'),
              )),
        ],
      ),
    );
  }

  Widget tickSlider() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Tick Slider", fontWeight: 600),
          SfSliderTheme(
              data: SfSliderThemeData(),
              child: SfSlider(
                showLabels: true,
                showTicks: true,
                interval: 25,
                min: -50.0,
                max: 50.0,
                activeColor: contentTheme.primary,
                value: controller.tickSliderValue,
                onChanged: (dynamic values) => controller.onTickSlider(values),
                enableTooltip: true,
                numberFormat: NumberFormat('#'),
              )),
        ],
      ),
    );
  }

  Widget dividerSlider() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Divider Slider", fontWeight: 600),
          SfSliderTheme(
              data: SfSliderThemeData(),
              child: SfSlider(
                interval: 25,
                showDividers: true,
                min: 0.0,
                max: 100.0,
                activeColor: contentTheme.primary,
                value: controller.dividerSliderValue,
                onChanged: (dynamic values) => controller.onDividerSlider(values),
                enableTooltip: true,
                numberFormat: NumberFormat('#'),
              )),
        ],
      ),
    );
  }

  Widget yearSlider() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Year Slider", fontWeight: 600),
          SfSliderTheme(
              data: SfSliderThemeData(),
              child: SfSlider(
                min: DateTime(2016, 01, 01),
                max: DateTime(2019, 01, 01),
                showLabels: true,
                interval: 1,
                dateFormat: intl.DateFormat.y(),
                labelPlacement: LabelPlacement.onTicks,
                dateIntervalType: DateIntervalType.years,
                showTicks: true,
                activeColor: contentTheme.primary,
                value: controller.yearValue,
                onChanged: (dynamic value) => controller.onYearSlider(value),
                enableTooltip: true,
                tooltipTextFormatterCallback: (dynamic actualLabel, String formattedText) {
                  return intl.DateFormat.yMMM().format(actualLabel);
                },
              )),
        ],
      ),
    );
  }

  Widget hourSlider() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Hour Slider", fontWeight: 600),
          SfSliderTheme(
              data: SfSliderThemeData(),
              child: SfSlider(
                min: DateTime(2020, 01, 01, 9, 00, 00),
                max: DateTime(2020, 01, 01, 21, 05, 00),
                showLabels: true,
                interval: 4,
                showTicks: true,
                minorTicksPerInterval: 3,
                dateFormat: intl.DateFormat('h a'),
                labelPlacement: LabelPlacement.onTicks,
                dateIntervalType: DateIntervalType.hours,
                activeColor: contentTheme.primary,
                value: controller.hourValue,
                onChanged: (dynamic value) => controller.onHourSlider(value),
                enableTooltip: true,
                tooltipTextFormatterCallback: (dynamic actualLabel, String formattedText) {
                  return intl.DateFormat('h:mm a').format(actualLabel);
                },
              )),
        ],
      ),
    );
  }
}
