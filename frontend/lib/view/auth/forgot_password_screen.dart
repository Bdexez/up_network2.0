import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/auth/forgot_password_controller.dart';
import 'package:henox/helpers/theme/theme_customizer.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/widgets/my_button.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/helpers/widgets/my_text_style.dart';
import 'package:henox/images.dart';
import 'package:henox/view/layouts/auth_layout.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen>
    with SingleTickerProviderStateMixin, UIMixin {
  late ForgotPasswordController controller;
  @override
  late OutlineInputBorder outlineInputBorder;

  @override
  void initState() {
    controller = ForgotPasswordController();
    outlineInputBorder = OutlineInputBorder(
        borderSide: BorderSide(
      color: Color(0x3d6c757d),
    ));
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return AuthLayout(
      child: GetBuilder(
        init: controller,
        tag: 'forgot_password_controller',
        builder: (controller) {
          return Padding(
            padding: MySpacing.all(20),
            child: Form(
              key: controller.basicValidator.formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  MyContainer(
                    paddingAll: 0,
                    height: 28,
                    child: Image.asset(
                        ThemeCustomizer.instance.theme == ThemeMode.light
                            ? Images.logoDark
                            : Images.logo),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      MyText.titleMedium("Reset Password", fontWeight: 600),
                      MySpacing.height(8),
                      MyText.bodySmall(
                          "Enter your email address and we'll send you an email with instructions to reset your password.",
                          muted: true),
                      MySpacing.height(16),
                      email(),
                      MySpacing.height(16),
                      resetBtn(),
                    ],
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      MyText.bodyMedium("Back to",
                          fontWeight: 600, muted: true),
                      MySpacing.width(4),
                      InkWell(
                        onTap: () => controller.gotoLogIn(),
                        child: MyText.bodyMedium("Login",
                            fontWeight: 600,
                            decoration: TextDecoration.underline),
                      )
                    ],
                  )
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget resetBtn() {
    return MyButton.block(
        onPressed: controller.onLogin,
        backgroundColor: contentTheme.primary,
        elevation: 0,
        child:
            MyText.bodyMedium("Reset Password", color: contentTheme.onPrimary));
  }

  Widget email() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        MyText.bodyMedium("Email Address", fontWeight: 600),
        MySpacing.height(8),
        TextFormField(
          controller: controller.basicValidator.getController('email'),
          validator: controller.basicValidator.getValidation('email'),
          style: MyTextStyle.bodySmall(fontWeight: 600, muted: true),
          decoration: InputDecoration(
            hintText: "Enter your email",
            hintStyle: MyTextStyle.bodySmall(fontWeight: 600, muted: true),
            isDense: true,
            contentPadding: MySpacing.xy(12, 12),
            border: outlineInputBorder,
            disabledBorder: outlineInputBorder,
            errorBorder: outlineInputBorder,
            focusedBorder: outlineInputBorder,
            enabledBorder: outlineInputBorder,
          ),
        ),
      ],
    );
  }
}
