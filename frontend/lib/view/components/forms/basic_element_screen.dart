import 'package:flutter/material.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/app_constant.dart';
import 'package:henox/controller/component/forms/basic_element_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_button.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_flex.dart';
import 'package:henox/helpers/widgets/my_flex_item.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/helpers/widgets/my_text_style.dart';
import 'package:henox/view/layouts/layout.dart';

class BasicElementScreen extends StatefulWidget {
  const BasicElementScreen({super.key});

  @override
  State<BasicElementScreen> createState() => _BasicElementScreenState();
}

class _BasicElementScreenState extends State<BasicElementScreen> with UIMixin {
  BasicElementController controller = Get.put(BasicElementController());
  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'basic_element_controller',
        builder: (controller) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Form Elements", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Forms'),
                        MyBreadcrumbItem(name: 'Form Elements'),
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
                    MyFlexItem(child: inputTypes()),
                    MyFlexItem(child: floatingLabels()),
                    MyFlexItem(sizes: 'lg-6', child: checkBoxes()),
                    MyFlexItem(sizes: 'lg-6', child: radios()),
                    MyFlexItem(sizes: 'lg-6', child: inputSize()),
                    MyFlexItem(sizes: 'lg-6', child: basicExample()),
                    MyFlexItem(child: inlineForm()),
                    MyFlexItem(child: horizontalFormLabelSizing()),
                    MyFlexItem(child: formRow()),
                    MyFlexItem(sizes: 'lg-6', child: horizontalForm()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget inputTypes() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Input Types", fontWeight: 600),
          MySpacing.height(20),
          MyFlex(
            contentPadding: false,
            children: [
              MyFlexItem(
                  sizes: 'lg-6',
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      MyText.labelMedium("Text", muted: true, fontWeight: 600),
                      MySpacing.height(8),
                      TextField(
                        decoration: InputDecoration(
                          border: OutlineInputBorder(),
                          isDense: true,
                          isCollapsed: true,
                          contentPadding: MySpacing.all(12),
                        ),
                      ),
                      MySpacing.height(20),
                      MyText.labelMedium("Email", muted: true, fontWeight: 600),
                      MySpacing.height(8),
                      TextField(
                        style: MyTextStyle.bodySmall(),
                        decoration: InputDecoration(
                          border: OutlineInputBorder(),
                          isDense: true,
                          isCollapsed: true,
                          hintText: "Email",
                          hintStyle: MyTextStyle.bodySmall(),
                          contentPadding: MySpacing.all(12),
                        ),
                      ),
                      MySpacing.height(20),
                      MyText.labelMedium("Password", muted: true, fontWeight: 600),
                      MySpacing.height(8),
                      TextField(
                        style: MyTextStyle.bodySmall(),
                        controller: TextEditingController(text: "Password"),
                        obscureText: true,
                        decoration: InputDecoration(
                          border: OutlineInputBorder(),
                          isDense: true,
                          isCollapsed: true,
                          hintText: "Password",
                          hintStyle: MyTextStyle.bodySmall(),
                          contentPadding: MySpacing.all(12),
                        ),
                      ),
                      MySpacing.height(20),
                      MyText.labelMedium("Show/Hide Password", muted: true, fontWeight: 600),
                      MySpacing.height(8),
                      TextField(
                        style: MyTextStyle.bodySmall(),
                        controller: TextEditingController(text: "Password"),
                        obscureText: controller.isShowPassword,
                        decoration: InputDecoration(
                          border: OutlineInputBorder(),
                          isDense: true,
                          isCollapsed: true,
                          hintText: "Password",
                          hintStyle: MyTextStyle.bodySmall(),
                          suffixIcon: InkWell(
                              onTap: () => controller.passwordToggle(),
                              child: Icon(controller.isShowPassword ? LucideIcons.eye : LucideIcons.eye_off)),
                          contentPadding: MySpacing.all(16),
                        ),
                      ),
                      MySpacing.height(20),
                      MyText.labelMedium("Placeholder", muted: true, fontWeight: 600),
                      MySpacing.height(8),
                      TextField(
                        style: MyTextStyle.bodySmall(),
                        decoration: InputDecoration(
                          border: OutlineInputBorder(),
                          isDense: true,
                          isCollapsed: true,
                          hintText: "Placeholder",
                          hintStyle: MyTextStyle.bodySmall(),
                          contentPadding: MySpacing.all(12),
                        ),
                      ),
                      MySpacing.height(20),
                      MyText.labelMedium("TextArea", muted: true, fontWeight: 600),
                      MySpacing.height(8),
                      TextField(
                        maxLines: 4,
                        minLines: 4,
                        style: MyTextStyle.bodySmall(),
                        decoration: InputDecoration(
                          border: OutlineInputBorder(),
                          isDense: true,
                          isCollapsed: true,
                          hintText: "Text Area",
                          hintStyle: MyTextStyle.bodySmall(),
                          contentPadding: MySpacing.all(12),
                        ),
                      ),
                      MySpacing.height(20),
                      MyText.labelMedium("Read Only", muted: true, fontWeight: 600),
                      MySpacing.height(8),
                      TextField(
                        readOnly: true,
                        style: MyTextStyle.bodySmall(),
                        decoration: InputDecoration(
                          border: OutlineInputBorder(),
                          isDense: true,
                          isCollapsed: true,
                          hintText: "Read Only",
                          hintStyle: MyTextStyle.bodySmall(),
                          contentPadding: MySpacing.all(12),
                        ),
                      ),
                      MySpacing.height(20),
                      MyText.labelMedium("Disable", muted: true, fontWeight: 600),
                      MySpacing.height(8),
                      TextField(
                        enabled: false,
                        style: MyTextStyle.bodySmall(),
                        decoration: InputDecoration(
                          border: OutlineInputBorder(),
                          isDense: true,
                          isCollapsed: true,
                          hintText: "Disable Value",
                          hintStyle: MyTextStyle.bodySmall(),
                          contentPadding: MySpacing.all(12),
                        ),
                      ),
                      MySpacing.height(20),
                      MyText.labelMedium("Disable", muted: true, fontWeight: 600),
                      MySpacing.height(8),
                      TextField(
                        decoration: InputDecoration(
                          hintText: 'Helping text',
                          hintStyle: MyTextStyle.bodySmall(),
                          border: OutlineInputBorder(),
                          isDense: true,
                          isCollapsed: true,
                          contentPadding: MySpacing.all(12),
                        ),
                      ),
                      MySpacing.height(8),
                      MyText.bodySmall('A block of help text that breaks onto a new line and may extend beyond one line.', fontWeight: 600),
                    ],
                  )),
              MyFlexItem(
                  sizes: 'lg-6',
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      MyText.bodyMedium("Input Select", fontWeight: 600),
                      MySpacing.height(8),
                      DropdownButtonFormField<String>(
                        value: controller.selectedValue,
                        dropdownColor: contentTheme.onPrimary,
                        hint: MyText.bodyMedium('Select an option', fontWeight: 600),
                        isExpanded: true,
                        items: ['1', '2', '3', '4', '5']
                            .map((value) => DropdownMenuItem<String>(
                                  value: value,
                                  child: MyText.bodyMedium(value, fontWeight: 600),
                                ))
                            .toList(),
                        onChanged: (newValue) => controller.onSelectValue(newValue),
                        borderRadius: BorderRadius.circular(12),
                        decoration:
                            InputDecoration(isDense: true, isCollapsed: true, border: OutlineInputBorder(), contentPadding: MySpacing.all(12)),
                      ),
                      MySpacing.height(20),
                      MyText.labelMedium("Multiple Select", fontWeight: 600),
                      MySpacing.height(8),
                      MyContainer.bordered(
                        height: 100,
                        paddingAll: 0,
                        child: ListView(
                          children: controller.options.map((option) {
                            return CheckboxListTile(
                              controlAffinity: ListTileControlAffinity.leading,
                              materialTapTargetSize: MaterialTapTargetSize.padded,
                              dense: true,
                              fillColor: WidgetStateProperty.resolveWith((states) {
                                if (!states.contains(WidgetState.selected)) {
                                  return Colors.white;
                                }
                                return null;
                              }),
                              visualDensity: VisualDensity.compact,
                              title: MyText.bodyMedium(option, fontWeight: 600),
                              value: controller.selectedOptions.contains(option),
                              onChanged: (bool? value) => controller.toggleSelection(option),
                            );
                          }).toList(),
                        ),
                      ),
                      MySpacing.height(20),
                      MyText.labelMedium("Default file input", fontWeight: 600),
                      MySpacing.height(8),
                      Row(
                        children: [
                          MyButton(
                            onPressed: controller.pickFile,
                            elevation: 0,
                            backgroundColor: contentTheme.primary,
                            borderRadiusAll: 8,
                            child: MyText.bodyMedium('Select File', fontWeight: 600, color: contentTheme.onPrimary),
                          ),
                          MySpacing.width(8),
                          if (controller.fileName != null)
                            MyText.bodyMedium(
                              'Selected File: ${controller.fileName}',
                            ),
                        ],
                      ),
                      MySpacing.height(20),
                      MyText.bodyMedium("Date", fontWeight: 600),
                      MySpacing.height(20),
                      MyButton.outlined(
                        onPressed: () => controller.pickDate(),
                        borderColor: colorScheme.primary,
                        padding: MySpacing.xy(16, 16),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: <Widget>[
                            Icon(
                              LucideIcons.calendar,
                              color: colorScheme.primary,
                              size: 16,
                            ),
                            MySpacing.width(10),
                            MyText.labelMedium(controller.selectedDate != null ? dateFormatter.format(controller.selectedDate!) : "Select Date",
                                fontWeight: 600, color: colorScheme.primary),
                          ],
                        ),
                      ),
                      MySpacing.height(20),
                      MyText.bodyMedium("Color", fontWeight: 600),
                      MySpacing.height(20),
                      MyContainer(
                          width: double.infinity,
                          paddingAll: 12,
                          onTap: () => showDialog(
                              builder: (context) => AlertDialog(
                                    title: MyText.bodyMedium('Pick a color!', fontWeight: 600),
                                    content: SingleChildScrollView(
                                      child: ColorPicker(
                                        pickerColor: controller.pickerColor,
                                        onColorChanged: controller.changeColor,
                                      ),
                                    ),
                                    actions: <Widget>[
                                      MyButton(
                                        elevation: 0,
                                        borderRadiusAll: 4,
                                        backgroundColor: contentTheme.primary,
                                        child: MyText.bodyMedium('Got it', fontWeight: 600, color: contentTheme.onPrimary),
                                        onPressed: () {
                                          setState(() => controller.currentColor = controller.pickerColor);
                                          Navigator.of(context).pop();
                                        },
                                      ),
                                    ],
                                  ),
                              context: context),
                          color: controller.pickerColor,
                          child: Center(child: MyText.bodyMedium("Pick Color", color: contentTheme.onPrimary))),
                      MySpacing.height(20),
                      MyText.titleMedium("Range", fontWeight: 600),
                      MySpacing.height(20),
                      Slider(
                        value: controller.currentRangeValue,
                        min: 0,
                        max: 100,
                        divisions: 100,
                        label: controller.currentRangeValue.round().toString(),
                        onChanged: (double value) => controller.onChangeRangeValue(value),
                      ),
                    ],
                  )),
            ],
          ),
        ],
      ),
    );
  }

  Widget floatingLabels() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: MyFlex(
        contentPadding: false,
        children: [
          MyFlexItem(
            sizes: 'lg-6',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                MyText.bodyMedium("Example", fontWeight: 600),
                MySpacing.height(20),
                TextField(
                  decoration: InputDecoration(
                    labelText: 'Email address',
                    labelStyle: MyTextStyle.bodyMedium(),
                    hintText: 'name@example.com',
                    hintStyle: MyTextStyle.bodyMedium(),
                    border: OutlineInputBorder(),
                    isDense: true,
                    isCollapsed: true,
                    contentPadding: MySpacing.all(12),
                    floatingLabelBehavior: FloatingLabelBehavior.auto,
                  ),
                  keyboardType: TextInputType.emailAddress,
                ),
                MySpacing.height(20),
                TextField(
                  decoration: InputDecoration(
                    labelText: 'Password',
                    labelStyle: MyTextStyle.bodyMedium(),
                    hintText: 'Password',
                    hintStyle: MyTextStyle.bodyMedium(),
                    border: OutlineInputBorder(),
                    isDense: true,
                    isCollapsed: true,
                    contentPadding: MySpacing.all(12),
                    floatingLabelBehavior: FloatingLabelBehavior.auto,
                  ),
                ),
                MySpacing.height(20),
                TextField(
                  maxLines: 5,
                  minLines: 5,
                  decoration: InputDecoration(
                    labelText: 'Comments',
                    labelStyle: MyTextStyle.bodyMedium(),
                    hintText: 'Leave a comment here',
                    hintStyle: MyTextStyle.bodyMedium(),
                    border: OutlineInputBorder(),
                    isDense: true,
                    isCollapsed: true,
                    contentPadding: MySpacing.all(12),
                    floatingLabelBehavior: FloatingLabelBehavior.auto,
                  ),
                )
              ],
            ),
          ),
          MyFlexItem(
            sizes: 'lg-6',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                MyText.bodyMedium("Selects", fontWeight: 600),
                MySpacing.height(20),
                DropdownButtonFormField<String>(
                  value: controller.selectFloatingValue,
                  hint: MyText.bodyMedium('Open this select menu', fontWeight: 600),
                  dropdownColor: contentTheme.light,
                  decoration: InputDecoration(
                    labelText: 'Works with selects',
                    border: OutlineInputBorder(),
                    isDense: true,
                    isCollapsed: true,
                    contentPadding: MySpacing.all(12),
                  ),
                  items: [
                    DropdownMenuItem(value: '1', child: MyText.labelMedium('One')),
                    DropdownMenuItem(value: '2', child: MyText.labelMedium('Two')),
                    DropdownMenuItem(value: '3', child: MyText.labelMedium('Three')),
                  ],
                  onChanged: (String? newValue) => controller.onSelectFloatingValue(newValue!),
                ),
                MySpacing.height(20),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    DropdownButtonFormField<String>(
                      value: controller.selectedLayoutValue,
                      hint: MyText.bodyMedium('Open this select menu', fontWeight: 600),
                      dropdownColor: contentTheme.light,
                      decoration: InputDecoration(
                        labelText: 'Works with selects',
                        border: OutlineInputBorder(),
                        isDense: true,
                        isCollapsed: true,
                        contentPadding: MySpacing.all(12),
                      ),
                      isExpanded: true,
                      items: [
                        DropdownMenuItem(value: '1', child: MyText.labelMedium('One')),
                        DropdownMenuItem(value: '2', child: MyText.labelMedium('Two')),
                        DropdownMenuItem(value: '3', child: MyText.labelMedium('Three')),
                      ],
                      onChanged: (value) => controller.onSelectLayoutValue(value),
                    ),
                    if (controller.selectedLayoutValue != null)
                      Padding(
                        padding: MySpacing.top(16),
                        child: MyText.bodyMedium(
                          'Selected: ${controller.selectedLayoutValue}',
                          fontWeight: 600,
                        ),
                      ),
                  ],
                )
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget checkBoxes() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Checkboxes", fontWeight: 600),
          MySpacing.height(20),
          Row(
            children: [
              Checkbox(
                value: controller.isChecked1,
                fillColor: WidgetStateProperty.resolveWith((states) {
                  if (!states.contains(WidgetState.selected)) {
                    return Colors.white;
                  }
                  return null;
                }),
                overlayColor: WidgetStatePropertyAll(Colors.white),
                onChanged: (bool? value) => controller.onCheckbox1(),
              ),
              MyText.bodyMedium('Check this custom checkbox', muted: true, fontWeight: 600),
            ],
          ),
          Row(
            children: [
              Checkbox(
                value: controller.isChecked2,
                fillColor: WidgetStateProperty.resolveWith((states) {
                  if (!states.contains(WidgetState.selected)) {
                    return Colors.white;
                  }
                  return null;
                }),
                overlayColor: WidgetStatePropertyAll(Colors.white),
                onChanged: (bool? value) => controller.onCheckbox2(),
              ),
              MyText.bodyMedium('Check this custom checkbox', muted: true, fontWeight: 600),
            ],
          ),
          MySpacing.height(20),
          MyText.bodyMedium("Inline", fontWeight: 600),
          MySpacing.height(8),
          Row(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              Expanded(
                child: CheckboxListTile(
                  visualDensity: VisualDensity.compact,
                  value: controller.isChecked3,
                  controlAffinity: ListTileControlAffinity.leading,
                  contentPadding: MySpacing.all(0),
                  fillColor: WidgetStateProperty.resolveWith((states) {
                    if (!states.contains(WidgetState.selected)) {
                      return Colors.white;
                    }
                    return null;
                  }),
                  overlayColor: WidgetStatePropertyAll(Colors.white),
                  dense: true,
                  onChanged: (bool? value) => controller.onCheckbox3(),
                  title: MyText.bodyMedium('Check this custom checkbox', muted: true, fontWeight: 600),
                ),
              ),
              MySpacing.width(20),
              Expanded(
                child: CheckboxListTile(
                  visualDensity: VisualDensity.compact,
                  value: controller.isChecked4,
                  onChanged: (bool? value) => controller.onCheckbox4(),
                  controlAffinity: ListTileControlAffinity.leading,
                  fillColor: WidgetStateProperty.resolveWith((states) {
                    if (!states.contains(WidgetState.selected)) {
                      return Colors.white;
                    }
                    return null;
                  }),
                  overlayColor: WidgetStatePropertyAll(Colors.white),
                  contentPadding: MySpacing.all(0),
                  dense: true,
                  title: MyText.bodyMedium('Check this custom checkbox', muted: true, fontWeight: 600),
                ),
              ),
            ],
          ),
          MySpacing.height(12),
          MyText.bodyMedium("Disabled", fontWeight: 600),
          MySpacing.height(12),
          Wrap(
            children: [
              Row(
                children: [
                  Checkbox(
                    value: true,
                    onChanged: null,
                    fillColor: WidgetStateProperty.resolveWith((states) {
                      if (!states.contains(WidgetState.selected)) {
                        return Colors.white;
                      }
                      return null;
                    }),
                    overlayColor: WidgetStatePropertyAll(Colors.white),
                  ),
                  MyText.bodyMedium('Check this custom checkbox', fontWeight: 600, xMuted: true),
                ],
              ),
              MySpacing.width(20),
              Row(
                children: [
                  Checkbox(
                    value: false,
                    onChanged: null,
                    fillColor: WidgetStateProperty.resolveWith((states) {
                      if (!states.contains(WidgetState.selected)) {
                        return Colors.white;
                      }
                      return null;
                    }),
                    overlayColor: WidgetStatePropertyAll(Colors.white),
                  ),
                  MyText.bodyMedium('Check this custom checkbox', fontWeight: 600, xMuted: true),
                ],
              ),
            ],
          ),
          MySpacing.height(20),
          MyText.bodyMedium("Colors", fontWeight: 600),
          MySpacing.height(12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: List.generate(controller.checkboxData.length, (index) {
              return Row(
                children: [
                  Checkbox(
                    onChanged: (bool? value) => controller.onColorCheckbox(index, value),
                    activeColor: controller.checkboxData[index]['color'],
                    visualDensity: VisualDensity.compact,
                    fillColor: WidgetStateProperty.resolveWith((states) {
                      if (!states.contains(WidgetState.selected)) {
                        return Colors.white;
                      }
                      return null;
                    }),
                    overlayColor: WidgetStatePropertyAll(Colors.white),
                    value: controller.checkboxData[index]['isChecked'],
                  ),
                  MyText.bodyMedium(controller.checkboxData[index]['label'], muted: true, fontWeight: 600),
                ],
              );
            }),
          )
        ],
      ),
    );
  }

  Widget radios() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Radios", fontWeight: 600),
          MySpacing.height(12),
          ListTile(
            visualDensity: VisualDensity.compact,
            contentPadding: MySpacing.zero,
            title: MyText.bodyMedium('Toggle this custom radio', fontWeight: 600),
            leading: Radio<int>(
              value: 1,
              groupValue: controller.selectedRadioValue,
              onChanged: (value) => controller.onSelectRadio(value),
            ),
          ),
          ListTile(
            visualDensity: VisualDensity.compact,
            contentPadding: MySpacing.zero,
            title: MyText.bodyMedium('Or toggle this other custom radio', fontWeight: 600),
            leading: Radio<int>(
              value: 2,
              groupValue: controller.selectedRadioValue,
              onChanged: (value) => controller.onSelectRadio(value),
            ),
          ),
          MySpacing.height(20),
          MyText.bodyMedium("Inline", fontWeight: 600),
          Wrap(
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Radio<int>(
                    value: 1,
                    groupValue: controller.selectedInlineValue,
                    onChanged: (value) => controller.onSelectInlineRadio(value),
                  ),
                  MyText.bodyMedium('Toggle this custom radio', fontWeight: 600),
                ],
              ),
              MySpacing.width(20),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Radio<int>(
                    value: 2,
                    groupValue: controller.selectedInlineValue,
                    onChanged: (value) => controller.onSelectInlineRadio(value),
                  ),
                  MyText.bodyMedium('Or toggle this other custom radio', fontWeight: 600),
                ],
              ),
            ],
          ),
          MySpacing.height(20),
          MyText.bodyMedium("Disabled", fontWeight: 600),
          MySpacing.height(20),
          Wrap(
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Radio<int>(
                    value: 1,
                    groupValue: controller.selectedDisableRadioValue,
                    onChanged: null,
                  ),
                  MyText.bodyMedium('Toggle this custom radio', fontWeight: 600),
                ],
              ),
              MySpacing.width(20),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Radio<int>(
                    value: 2,
                    groupValue: controller.selectedDisableRadioValue,
                    onChanged: null,
                  ),
                  MyText.bodyMedium('Or toggle this other custom radio', fontWeight: 600),
                ],
              ),
            ],
          ),
          MySpacing.height(20),
          MyText.bodyMedium("Color Radio", fontWeight: 600),
          MySpacing.height(20),
          buildRadio(1, 'Default Radio', Colors.grey),
          buildRadio(2, 'Success Radio', Colors.green),
          buildRadio(3, 'Info Radio', Colors.blue),
          buildRadio(4, 'Secondary Radio', Colors.orange),
          buildRadio(5, 'Warning Radio', Colors.amber),
          buildRadio(6, 'Danger Radio', Colors.red),
          buildRadio(7, 'Dark Radio', Colors.black),
        ],
      ),
    );
  }

  Widget buildRadio(int value, String label, Color color) {
    return Row(
      children: [
        Radio<int>(
          value: value,
          groupValue: controller.selectedRadioColorValue,
          onChanged: (newValue) => controller.onSelectColorRadio(newValue),
          activeColor: color,
        ),
        MyText.bodyMedium(label, fontWeight: 600),
      ],
    );
  }

  Widget inputSize() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Input Size", fontWeight: 600),
          MySpacing.height(20),
          MyText.bodyMedium('Small', fontWeight: 600),
          MySpacing.height(8),
          TextField(
            decoration: InputDecoration(
                hintText: '.input-sm', border: OutlineInputBorder(), contentPadding: MySpacing.all(8), isDense: true, isCollapsed: true),
            style: MyTextStyle.bodySmall(),
          ),
          MySpacing.height(16),
          MyText.bodyMedium('Normal', fontWeight: 600),
          MySpacing.height(8),
          TextField(
            style: MyTextStyle.bodyLarge(),
            decoration: InputDecoration(
                hintText: 'Normal', border: OutlineInputBorder(), contentPadding: MySpacing.all(12), isDense: true, isCollapsed: true),
          ),
          MySpacing.height(16),
          MyText.bodyMedium('Large', fontWeight: 600),
          MySpacing.height(8),
          TextField(
            style: MyTextStyle.titleMedium(),
            decoration: InputDecoration(
                hintText: '.input-lg', border: OutlineInputBorder(), contentPadding: MySpacing.all(16), isDense: true, isCollapsed: true),
          ),
          MySpacing.height(16),
          MyText.bodyMedium('Grid Sizes', fontWeight: 600),
          MySpacing.height(8),
          TextField(
            style: MyTextStyle.titleLarge(),
            decoration: InputDecoration(
              hintText: '.col-sm-4',
              border: OutlineInputBorder(),
            ),
          ),
        ],
      ),
    );
  }

  Widget basicExample() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium(
            "Basic Element",
            fontWeight: 600,
          ),
          MySpacing.height(20),
          MyText.bodyMedium('Email Address', muted: true, fontWeight: 600),
          MySpacing.height(8),
          TextField(
            controller: controller.emailController,
            decoration: InputDecoration(
                hintText: 'Enter email',
                hintStyle: MyTextStyle.bodyMedium(muted: true),
                helperText: "We'll never share your email with anyone else.",
                isDense: true,
                isCollapsed: true,
                contentPadding: MySpacing.all(12),
                border: OutlineInputBorder()),
            keyboardType: TextInputType.emailAddress,
          ),
          MySpacing.height(20),
          MyText.bodyMedium('Password', muted: true, fontWeight: 600),
          MySpacing.height(8),
          TextField(
            controller: controller.passwordController,
            decoration: InputDecoration(hintText: 'Password',
                isDense: true,
                isCollapsed: true,
                contentPadding: MySpacing.all(12),
                border: OutlineInputBorder()),
            obscureText: true,
          ),
          SizedBox(height: 16),
          Row(
            children: [
              Checkbox(
                value: controller.isChecked,
                onChanged: (bool? value) => controller.onCheck(value),
                fillColor: WidgetStateProperty.resolveWith((states) {
                  if (!states.contains(WidgetState.selected)) {
                    return Colors.white;
                  }
                  return null;
                }),
              ),
              MyText.bodyMedium('Check me out!', fontWeight: 600),
            ],
          ),
          SizedBox(height: 16),
          MyButton(
            onPressed: () {},
            elevation: 0,
            backgroundColor: contentTheme.primary,
            borderRadiusAll: 8,
            child: MyText.bodyMedium('Submit', fontWeight: 600, color: contentTheme.onPrimary),
          ),
        ],
      ),
    );
  }

  Widget horizontalForm() {
    Widget buildTextField(String label, TextEditingController controller, bool obscureText) {
      return Row(
        children: [
          Expanded(
            flex: 3,
            child: Padding(
              padding: MySpacing.right(16.0),
              child: MyText.bodyMedium(label, muted: true, fontWeight: 600),
            ),
          ),
          Expanded(
            flex: 9,
            child: TextField(
                controller: controller,
                decoration: InputDecoration(
                  hintText: label,
                  border: OutlineInputBorder(),
                ),
                obscureText: obscureText),
          ),
        ],
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Horizontal Form", fontWeight: 600),
          MySpacing.height(20),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              buildTextField('Email', controller.emailTE, false),
              MySpacing.height(16),
              buildTextField('Password', controller.passwordTE, true),
              MySpacing.height(16),
              buildTextField('Re Password', controller.rePasswordTE, true),
              MySpacing.height(16),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Checkbox(
                    value: controller.isHorizontalFormChecked,
                    onChanged: (bool? value) => controller.onHorizontalFormCheck(value),
                    fillColor: WidgetStateProperty.resolveWith((states) {
                      if (!states.contains(WidgetState.selected)) {
                        return Colors.white;
                      }
                      return null;
                    }),
                  ),
                  MyText.bodyMedium('Check me out!', fontWeight: 600),
                ],
              ),
              MySpacing.height(16),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  MyButton(
                    onPressed: () {},
                    elevation: 0,
                    borderRadiusAll: 8,
                    backgroundColor: contentTheme.primary,
                    child: MyText.bodyMedium('Sign in', fontWeight: 600, color: contentTheme.onPrimary),
                  ),
                ],
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget inlineForm() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Inline Form", fontWeight: 600),
          MySpacing.height(20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: TextFormField(
                  readOnly: true,
                  decoration: InputDecoration(
                    labelText: 'Email',
                    hintText: 'email@example.com',
                    isDense: true,
                    isCollapsed: true,
                    contentPadding: MySpacing.all(12),
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
              MySpacing.width(12),
              Expanded(
                child: TextFormField(
                  obscureText: true,
                  decoration: InputDecoration(
                    labelText: 'Password',
                    hintText: 'Password',
                    isDense: true,
                    isCollapsed: true,
                    contentPadding: MySpacing.all(12),
                    border: OutlineInputBorder(),
                  ),
                ),
              ),

            ],
          ),
          MySpacing.height(8),
          MyButton(
            onPressed: () {},
            elevation: 0,
            borderRadiusAll: 8,
            backgroundColor: contentTheme.primary,
            child: MyText.bodyMedium('Confirm identity', fontWeight: 600, color: contentTheme.onPrimary),
          ),
          MySpacing.height(24),
          MyText.bodyMedium('Auto-sizing', muted: true, fontWeight: 600),
          MySpacing.height(8),
          Form(
            child: Row(
              children: [
                Expanded(
                  child: TextFormField(
                    decoration: InputDecoration(
                      labelText: 'Name',
                      isDense: true,
                      isCollapsed: true,
                      prefixIcon: Icon(LucideIcons.user,size: 16),
                      contentPadding: MySpacing.all(10),
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                MySpacing.width(12),
                Expanded(
                  child: TextFormField(
                    decoration: InputDecoration(
                      labelText: 'Username',
                      isDense: true,
                      isCollapsed: true,
                      prefixIcon: Icon(LucideIcons.users,size: 16),
                      contentPadding: MySpacing.all(10),
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),

              ],
            ),
          ),
          MySpacing.height(8),
          Row(
            children: [
              Checkbox(
                value: false,
                onChanged: (bool? value) {},
                fillColor: WidgetStateProperty.resolveWith((states) {
                  if (!states.contains(WidgetState.selected)) {
                    return Colors.white;
                  }
                  return null;
                }),
              ),
              MySpacing.width(8),
              MyText.bodyMedium('Remember me', fontWeight: 600),
              MySpacing.width(8),
              MyButton(
                onPressed: () {},
                elevation: 0,
                borderRadiusAll: 8,
                backgroundColor: contentTheme.primary,
                child: MyText.bodyMedium('Submit', fontWeight: 600, color: contentTheme.onPrimary),
              ),
            ],
          ),

        ],
      ),
    );
  }

  Widget horizontalFormLabelSizing() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Horizontal form label sizing", fontWeight: 600),
          MySpacing.height(20),
          MyText.labelSmall('Email', muted: true, fontWeight: 600),
          SizedBox(height: 8),
          TextFormField(
            style: MyTextStyle.bodySmall(),
            decoration: InputDecoration(
                hintText: 'col-form-label-sm', border: OutlineInputBorder(), contentPadding: MySpacing.all(8), isDense: true, isCollapsed: true),
            keyboardType: TextInputType.emailAddress,
          ),
          MySpacing.height(20),
          MyText.bodyMedium('Email', muted: true, fontWeight: 600),
          SizedBox(height: 8),
          TextFormField(
            style: MyTextStyle.bodyMedium(),
            decoration: InputDecoration(
                hintText: 'col-form-label', border: OutlineInputBorder(), contentPadding: MySpacing.all(12), isDense: true, isCollapsed: true),
            keyboardType: TextInputType.emailAddress,
          ),
          MySpacing.height(20),
          MyText.titleMedium('Email', muted: true, fontWeight: 600),
          SizedBox(height: 8),
          TextFormField(
            style: MyTextStyle.bodyLarge(),
            decoration: InputDecoration(
                hintText: 'col-form-label-lg', border: OutlineInputBorder(), contentPadding: MySpacing.all(16), isDense: true, isCollapsed: true),
            keyboardType: TextInputType.emailAddress,
          )
        ],
      ),
    );
  }

  Widget formRow() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Form Row", fontWeight: 600),
          MySpacing.height(20),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    MyText.bodyMedium("Email", muted: true, fontWeight: 600),
                    MySpacing.height(4),
                    TextFormField(
                      decoration: InputDecoration(
                          hintText: 'Email', border: OutlineInputBorder(), contentPadding: MySpacing.all(12), isDense: true, isCollapsed: true),
                      keyboardType: TextInputType.emailAddress,
                    ),
                  ],
                ),
              ),
              MySpacing.width(20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    MyText.bodyMedium("Password", muted: true, fontWeight: 600),
                    MySpacing.height(4),
                    TextFormField(
                      decoration: InputDecoration(
                          hintText: 'Password', border: OutlineInputBorder(), contentPadding: MySpacing.all(12), isDense: true, isCollapsed: true),
                      keyboardType: TextInputType.visiblePassword,
                    ),
                  ],
                ),
              )
            ],
          ),
          MySpacing.height(20),
          MyText.bodyMedium("Address", muted: true, fontWeight: 600),
          MySpacing.height(4),
          TextFormField(
            decoration: InputDecoration(
                hintText: 'Address',
                hintStyle: MyTextStyle.bodySmall(),
                border: OutlineInputBorder(),
                contentPadding: MySpacing.all(12),
                isDense: true,
                isCollapsed: true),
            keyboardType: TextInputType.streetAddress,
          ),
          MySpacing.height(20),
          MyText.bodyMedium("Address 2", muted: true, fontWeight: 600),
          MySpacing.height(4),
          TextFormField(
            decoration: InputDecoration(
                hintText: 'Address 2',
                hintStyle: MyTextStyle.bodySmall(),
                border: OutlineInputBorder(),
                contentPadding: MySpacing.all(12),
                isDense: true,
                isCollapsed: true),
            keyboardType: TextInputType.streetAddress,
          ),
          MySpacing.height(20),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    MyText.bodyMedium("City", muted: true, fontWeight: 600),
                    MySpacing.height(4),
                    TextFormField(
                      decoration: InputDecoration(
                          hintText: 'City',
                          hintStyle: MyTextStyle.bodySmall(),
                          border: OutlineInputBorder(),
                          contentPadding: MySpacing.all(12),
                          isDense: true,
                          isCollapsed: true),
                    ),
                  ],
                ),
              ),
              MySpacing.width(20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    MyText.bodyMedium("State", muted: true, fontWeight: 600),
                    MySpacing.height(4),
                    DropdownButtonFormField<StateName>(
                      value: controller.stateName,
                      dropdownColor: contentTheme.onPrimary,
                      hint: MyText.bodyMedium('States', fontWeight: 600),
                      isExpanded: true,
                      items: StateName.values
                          .map((value) => DropdownMenuItem<StateName>(
                                value: value,
                                child: MyText.bodyMedium(value.name.toUpperCase(), fontWeight: 600),
                              ))
                          .toList(),
                      onChanged: (newValue) => controller.onSelectValue(newValue),
                      borderRadius: BorderRadius.circular(12),
                      decoration: InputDecoration(isDense: true, isCollapsed: true, border: OutlineInputBorder(), contentPadding: MySpacing.all(12)),
                    ),
                  ],
                ),
              ),
              MySpacing.width(20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    MyText.bodyMedium("Zip", muted: true, fontWeight: 600),
                    MySpacing.height(4),
                    TextFormField(
                      decoration: InputDecoration(
                          hintText: 'ZIP',
                          hintStyle: MyTextStyle.bodySmall(),
                          border: OutlineInputBorder(),
                          contentPadding: MySpacing.all(12),
                          isDense: true,
                          isCollapsed: true),
                    ),
                  ],
                ),
              )
            ],
          )
        ],
      ),
    );
  }
}
