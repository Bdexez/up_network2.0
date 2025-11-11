import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/base_ui/dropdowns_controller.dart';
import 'package:henox/helpers/extensions/string.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_flex.dart';
import 'package:henox/helpers/widgets/my_flex_item.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/helpers/widgets/my_text_style.dart';
import 'package:henox/view/layouts/layout.dart';

class DropdownsScreen extends StatefulWidget {
  const DropdownsScreen({super.key});

  @override
  State<DropdownsScreen> createState() => _DropdownsScreenState();
}

class _DropdownsScreenState extends State<DropdownsScreen> with SingleTickerProviderStateMixin, UIMixin {
  DropdownsController controller = Get.put(DropdownsController());
  OutlineInputBorder outlineBorder = OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none);

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'dropdowns_controller',
        builder: (controller) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Dropdowns", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Base UI'),
                        MyBreadcrumbItem(name: 'Dropdowns'),
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
                    MyFlexItem(sizes: 'lg-6', child: singleButtonDropdowns()),
                    MyFlexItem(sizes: 'lg-6', child: variant()),
                    MyFlexItem(sizes: 'lg-6', child: sizing()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget singleButtonDropdowns() {
    return MyCard(
        shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
        paddingAll: 24,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          MyText.titleMedium("Single button dropdowns", fontWeight: 600),
          MySpacing.height(20),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    MyText.titleSmall("Dropdown Button", fontWeight: 600),
                    MySpacing.height(20),
                    DropdownButtonFormField<SingleButtonDropdowns>(
                      value: controller.singleButtonDropdowns1,
                      onChanged: (value) {},
                      dropdownColor: contentTheme.background,
                      items: SingleButtonDropdowns.values.map((SingleButtonDropdowns singleButton) {
                        return DropdownMenuItem<SingleButtonDropdowns>(
                            onTap: () => controller.onSelectSingleButtonDropdowns1(singleButton),
                            value: singleButton,
                            child: MyText.bodyMedium(singleButton.name.capitalizeWords, fontWeight: 600));
                      }).toList(),
                      decoration: InputDecoration(
                          labelText: "Select button",
                          labelStyle: MyTextStyle.bodyMedium(),
                          disabledBorder: outlineBorder,
                          enabledBorder: outlineBorder,
                          errorBorder: outlineBorder,
                          focusedBorder: outlineBorder,
                          focusedErrorBorder: outlineBorder,
                          border: outlineBorder,
                          contentPadding: MySpacing.all(16),
                          isCollapsed: true,
                          filled: true,
                          floatingLabelBehavior: FloatingLabelBehavior.never),
                    ),
                  ],
                ),
              ),
              SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    MyText.titleSmall("Dropdown Link", fontWeight: 600),
                    MySpacing.height(20),
                    DropdownButtonFormField<SingleButtonDropdowns>(
                      value: controller.singleButtonDropdowns2,
                      onChanged: (value) {},
                      dropdownColor: contentTheme.background,
                      items: SingleButtonDropdowns.values.map((SingleButtonDropdowns singleButton) {
                        return DropdownMenuItem<SingleButtonDropdowns>(
                            onTap: () => controller.onSelectSingleButtonDropdowns2(singleButton),
                            value: singleButton,
                            child: MyText.bodyMedium(singleButton.name.capitalizeWords, fontWeight: 600));
                      }).toList(),
                      decoration: InputDecoration(
                        labelText: "Select button link",
                        labelStyle: MyTextStyle.bodyMedium(),
                        disabledBorder: outlineBorder,
                        enabledBorder: outlineBorder,
                        errorBorder: outlineBorder,
                        focusedBorder: outlineBorder,
                        focusedErrorBorder: outlineBorder,
                        border: outlineBorder,
                        contentPadding: MySpacing.all(16),
                        filled: true,
                        isCollapsed: true,
                        isDense: true,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          )
        ]));
  }

  Widget variant() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Variant", fontWeight: 600),
          MySpacing.height(20),
          Wrap(
            spacing: 20,
            runSpacing: 20,
            children: [
              SizedBox(
                width: 170,
                child: DropdownButtonFormField<SingleButtonDropdowns>(
                  value: controller.primaryButton,
                  onChanged: (value) {},
                  focusColor: contentTheme.onPrimary,
                  dropdownColor: contentTheme.primary,
                  style: MyTextStyle.bodyMedium(color: contentTheme.onPrimary),
                  iconEnabledColor: contentTheme.onPrimary,
                  items: SingleButtonDropdowns.values
                      .map((SingleButtonDropdowns singleButton) => DropdownMenuItem<SingleButtonDropdowns>(
                          onTap: () => controller.onSelectSinglePrimaryButton(singleButton),
                          value: singleButton,
                          child: MyText.bodyMedium(singleButton.name.capitalizeWords,color: contentTheme.onPrimary, fontWeight: 600)))
                      .toList(),
                  decoration: InputDecoration(
                      labelText: "Primary",
                      labelStyle: MyTextStyle.bodyMedium(color: contentTheme.onPrimary),
                      disabledBorder: outlineBorder,
                      enabledBorder: outlineBorder,
                      errorBorder: outlineBorder,
                      focusedBorder: outlineBorder,
                      focusedErrorBorder: outlineBorder,
                      border: outlineBorder,
                      fillColor: contentTheme.primary,
                      contentPadding: MySpacing.all(16),
                      isCollapsed: true,
                      filled: true,
                      floatingLabelBehavior: FloatingLabelBehavior.never),
                ),
              ),
              SizedBox(
                width: 170,
                child: DropdownButtonFormField<SingleButtonDropdowns>(
                  value: controller.secondaryButton,
                  onChanged: (value) {},
                  focusColor: contentTheme.onPrimary,
                  dropdownColor: contentTheme.secondary,
                  iconEnabledColor: contentTheme.onPrimary,
                  style: MyTextStyle.bodyMedium(color: contentTheme.onPrimary),
                  items: SingleButtonDropdowns.values
                      .map((SingleButtonDropdowns singleButton) => DropdownMenuItem<SingleButtonDropdowns>(
                          onTap: () => controller.onSelectSingleSecondaryButton(singleButton),
                          value: singleButton,
                          child: MyText.bodyMedium(singleButton.name.capitalizeWords,color: contentTheme.onSecondary, fontWeight: 600)))
                      .toList(),
                  decoration: InputDecoration(
                      labelText: "Secondary",
                      labelStyle: MyTextStyle.bodyMedium(color: contentTheme.onPrimary),
                      disabledBorder: outlineBorder,
                      enabledBorder: outlineBorder,
                      errorBorder: outlineBorder,
                      focusedBorder: outlineBorder,
                      focusedErrorBorder: outlineBorder,
                      border: outlineBorder,
                      fillColor: contentTheme.secondary,
                      contentPadding: MySpacing.all(16),
                      isCollapsed: true,
                      filled: true,
                      floatingLabelBehavior: FloatingLabelBehavior.never),
                ),
              ),
              SizedBox(
                width: 170,
                child: DropdownButtonFormField<SingleButtonDropdowns>(
                  value: controller.successButton,
                  onChanged: (value) {},
                  focusColor: contentTheme.onPrimary,
                  dropdownColor: contentTheme.success,
                  iconEnabledColor: contentTheme.onPrimary,
                  style: MyTextStyle.bodyMedium(color: contentTheme.onPrimary),
                  items: SingleButtonDropdowns.values
                      .map((SingleButtonDropdowns singleButton) => DropdownMenuItem<SingleButtonDropdowns>(
                          onTap: () => controller.onSelectSingleSuccessButton(singleButton),
                          value: singleButton,
                          child: MyText.bodyMedium(singleButton.name.capitalizeWords,color: contentTheme.onSuccess, fontWeight: 600)))
                      .toList(),
                  decoration: InputDecoration(
                      labelText: "Success",
                      labelStyle: MyTextStyle.bodyMedium(color: contentTheme.onPrimary),
                      disabledBorder: outlineBorder,
                      enabledBorder: outlineBorder,
                      errorBorder: outlineBorder,
                      focusedBorder: outlineBorder,
                      focusedErrorBorder: outlineBorder,
                      border: outlineBorder,
                      fillColor: contentTheme.success,
                      contentPadding: MySpacing.all(16),
                      isCollapsed: true,
                      filled: true,
                      floatingLabelBehavior: FloatingLabelBehavior.never),
                ),
              ),
              SizedBox(
                width: 170,
                child: DropdownButtonFormField<SingleButtonDropdowns>(
                  value: controller.warningButton,
                  onChanged: (value) {},
                  focusColor: contentTheme.onPrimary,
                  dropdownColor: contentTheme.warning,
                  iconEnabledColor: contentTheme.onPrimary,
                  style: MyTextStyle.bodyMedium(color: contentTheme.onPrimary),
                  items: SingleButtonDropdowns.values
                      .map((SingleButtonDropdowns singleButton) => DropdownMenuItem<SingleButtonDropdowns>(
                          onTap: () => controller.onSelectSingleWarningButton(singleButton),
                          value: singleButton,
                          child: MyText.bodyMedium(singleButton.name.capitalizeWords,color: contentTheme.onPrimary, fontWeight: 600)))
                      .toList(),
                  decoration: InputDecoration(
                      labelText: "Warning",
                      labelStyle: MyTextStyle.bodyMedium(color: contentTheme.onPrimary),
                      disabledBorder: outlineBorder,
                      enabledBorder: outlineBorder,
                      errorBorder: outlineBorder,
                      focusedBorder: outlineBorder,
                      focusedErrorBorder: outlineBorder,
                      border: outlineBorder,
                      fillColor: contentTheme.warning,
                      contentPadding: MySpacing.all(16),
                      isCollapsed: true,
                      filled: true,
                      floatingLabelBehavior: FloatingLabelBehavior.never),
                ),
              ),
              SizedBox(
                width: 170,
                child: DropdownButtonFormField<SingleButtonDropdowns>(
                  value: controller.dangerButton,
                  iconDisabledColor: contentTheme.onPrimary,
                  onChanged: (value) {},
                  focusColor: contentTheme.onPrimary,
                  dropdownColor: contentTheme.danger,
                  iconEnabledColor: contentTheme.onPrimary,
                  style: MyTextStyle.bodyMedium(color: contentTheme.onPrimary),
                  items: SingleButtonDropdowns.values
                      .map((SingleButtonDropdowns singleButton) => DropdownMenuItem<SingleButtonDropdowns>(
                          onTap: () => controller.onSelectSingleDangerButton(singleButton),
                          value: singleButton,
                          child: MyText.bodyMedium(singleButton.name.capitalizeWords, fontWeight: 600, color: contentTheme.onDanger)))
                      .toList(),
                  decoration: InputDecoration(
                      labelText: "Danger",
                      labelStyle: MyTextStyle.bodyMedium(color: contentTheme.onPrimary),
                      disabledBorder: outlineBorder,
                      enabledBorder: outlineBorder,
                      errorBorder: outlineBorder,
                      focusedBorder: outlineBorder,
                      focusedErrorBorder: outlineBorder,
                      border: outlineBorder,
                      fillColor: contentTheme.danger,
                      contentPadding: MySpacing.all(16),
                      isCollapsed: true,
                      filled: true,
                      floatingLabelBehavior: FloatingLabelBehavior.never),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget sizing() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          MyText.titleMedium("Sizing", fontWeight: 600),
          MySpacing.height(20),
          Wrap(
            spacing: 20,
            runSpacing: 20,
            children: [
              DropdownButtonFormField<SingleButtonDropdowns>(
                value: controller.largeButton1,
                onChanged: (value) {},
                focusColor: contentTheme.onPrimary,
                dropdownColor: contentTheme.background,
                itemHeight: 70,
                style: MyTextStyle.bodyLarge(),
                items: SingleButtonDropdowns.values
                    .map((SingleButtonDropdowns singleButton) => DropdownMenuItem<SingleButtonDropdowns>(
                        onTap: () => controller.onSelectLargeButton1(singleButton),
                        value: singleButton,
                        child: MyText.bodyLarge(singleButton.name.capitalizeWords, fontWeight: 600)))
                    .toList(),
                decoration: InputDecoration(
                    labelText: "Large Button",
                    labelStyle: MyTextStyle.bodyLarge(),
                    disabledBorder: outlineBorder,
                    enabledBorder: outlineBorder,
                    errorBorder: outlineBorder,
                    focusedBorder: outlineBorder,
                    focusedErrorBorder: outlineBorder,
                    border: outlineBorder,
                    contentPadding: MySpacing.all(16),
                    isCollapsed: true,
                    filled: true,
                    floatingLabelBehavior: FloatingLabelBehavior.never),
              ),
              DropdownButtonFormField<SingleButtonDropdowns>(
                value: controller.largeButton2,
                onChanged: (value) {},
                focusColor: contentTheme.onPrimary,
                dropdownColor: contentTheme.background,
                itemHeight: 60,
                style: MyTextStyle.bodyMedium(),
                items: SingleButtonDropdowns.values
                    .map((SingleButtonDropdowns singleButton) => DropdownMenuItem<SingleButtonDropdowns>(
                        onTap: () => controller.onSelectLargeButton2(singleButton),
                        value: singleButton,
                        child: MyText.bodyMedium(singleButton.name.capitalizeWords, fontWeight: 600)))
                    .toList(),
                decoration: InputDecoration(
                    labelText: "Large Button",
                    labelStyle: MyTextStyle.bodyMedium(),
                    disabledBorder: outlineBorder,
                    enabledBorder: outlineBorder,
                    errorBorder: outlineBorder,
                    focusedBorder: outlineBorder,
                    focusedErrorBorder: outlineBorder,
                    border: outlineBorder,
                    contentPadding: MySpacing.all(16),
                    isCollapsed: true,
                    filled: true,
                    floatingLabelBehavior: FloatingLabelBehavior.never),
              ),
              DropdownButtonFormField<SingleButtonDropdowns>(
                value: controller.smallButton1,
                onChanged: (value) {},
                focusColor: contentTheme.onPrimary,
                dropdownColor: contentTheme.background,
                style: MyTextStyle.bodySmall(),
                itemHeight: 48,
                menuMaxHeight: 160,
                items: SingleButtonDropdowns.values
                    .map((SingleButtonDropdowns singleButton) => DropdownMenuItem<SingleButtonDropdowns>(
                        onTap: () => controller.onSelectSmallButton1(singleButton),
                        value: singleButton,
                        child: MyText.bodySmall(singleButton.name.capitalizeWords, fontWeight: 600)))
                    .toList(),
                decoration: InputDecoration(
                    labelText: "Small Button",
                    labelStyle: MyTextStyle.bodySmall(),
                    disabledBorder: outlineBorder,
                    enabledBorder: outlineBorder,
                    errorBorder: outlineBorder,
                    focusedBorder: outlineBorder,
                    focusedErrorBorder: outlineBorder,
                    border: outlineBorder,
                    contentPadding: MySpacing.all(16),
                    isCollapsed: true,
                    filled: true,
                    floatingLabelBehavior: FloatingLabelBehavior.never),
              ),
              DropdownButtonFormField<SingleButtonDropdowns>(
                value: controller.smallButton2,
                onChanged: (value) {},
                focusColor: contentTheme.onPrimary,
                dropdownColor: contentTheme.background,
                style: MyTextStyle.labelSmall(),
                items: SingleButtonDropdowns.values
                    .map((SingleButtonDropdowns singleButton) => DropdownMenuItem<SingleButtonDropdowns>(
                        onTap: () => controller.onSelectSmallButton2(singleButton),
                        value: singleButton,
                        child: MyText.labelSmall(singleButton.name.capitalizeWords, fontWeight: 600)))
                    .toList(),
                decoration: InputDecoration(
                    labelText: "Small Button",
                    labelStyle: MyTextStyle.labelSmall(),
                    disabledBorder: outlineBorder,
                    enabledBorder: outlineBorder,
                    errorBorder: outlineBorder,
                    focusedBorder: outlineBorder,
                    focusedErrorBorder: outlineBorder,
                    border: outlineBorder,
                    contentPadding: MySpacing.all(16),
                    isCollapsed: true,
                    filled: true,
                    floatingLabelBehavior: FloatingLabelBehavior.never),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class ButtonGroup extends StatefulWidget {
  final Color buttonColor;
  final String buttonText;
  final List<String> dropdownItems;

  ButtonGroup({required this.buttonColor, required this.buttonText, required this.dropdownItems});

  @override
  _ButtonGroupState createState() => _ButtonGroupState();
}

class _ButtonGroupState extends State<ButtonGroup> with UIMixin {
  String? selectedItem;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: 190,
          child: DropdownButtonFormField<String>(
            value: selectedItem,
            hint: MyText.bodyMedium('Options', fontWeight: 600),
            icon: Icon(Icons.arrow_drop_down),
            dropdownColor: contentTheme.disabled,
            decoration: InputDecoration(isCollapsed: true, isDense: true, contentPadding: MySpacing.all(12), border: OutlineInputBorder()),
            items: widget.dropdownItems.map((String item) {
              return DropdownMenuItem<String>(
                value: item,
                child: MyText.bodyMedium(item),
              );
            }).toList(),
            onChanged: (String? newValue) => setState(() => selectedItem = newValue),
          ),
        ),
        MyContainer(
          onTap: () {},
          borderRadiusAll: 4,
          paddingAll: 12,
          color: widget.buttonColor,
          child: MyText.bodyMedium(widget.buttonText, fontWeight: 600, color: contentTheme.onPrimary),
        ),
      ],
    );
  }
}
