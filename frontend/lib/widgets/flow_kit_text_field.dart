import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text_style.dart';
import 'package:flutter/material.dart';

class FlowKitTextField extends StatelessWidget {
  final String? hintText;
  final TextEditingController? controller;
  final FormFieldValidator<String>? validator;
  final ValueChanged<String>? onChanged;
  final Widget? prefixIcon;

  const FlowKitTextField(
      {super.key,
      this.hintText,
      this.controller,
      this.validator,
      this.onChanged,
      this.prefixIcon});

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      onChanged: onChanged,
      style: MyTextStyle.bodyMedium(fontWeight: 600),
      clipBehavior: Clip.antiAliasWithSaveLayer,
      controller: controller,
      validator: validator,
      decoration: InputDecoration(
        prefixIcon: prefixIcon,
        filled: true,
        hintText: hintText,
        contentPadding: MySpacing.all(12),
        hintStyle: MyTextStyle.bodyMedium(fontWeight: 600, muted: true),
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide.none),
        disabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide.none),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide.none),
        errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide.none),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide.none),
        focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide.none),
      ),
    );
  }
}
