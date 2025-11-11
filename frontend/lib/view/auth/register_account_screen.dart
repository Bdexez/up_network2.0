import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/auth/register_account_controller.dart';
import 'package:henox/helpers/theme/theme_customizer.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/widgets/my_button.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/helpers/widgets/my_text_style.dart';
import 'package:henox/images.dart';
import 'package:henox/view/layouts/auth_layout.dart';
import 'package:remixicon/remixicon.dart';

class RegisterAccountScreen extends StatefulWidget {
  const RegisterAccountScreen({super.key});

  @override
  State<RegisterAccountScreen> createState() => _RegisterAccountScreenState();
}

class _RegisterAccountScreenState extends State<RegisterAccountScreen>
    with SingleTickerProviderStateMixin, UIMixin {
  late RegisterAccountController controller;
  late OutlineInputBorder outlineInputBorder;

  @override
  void initState() {
    super.initState();
    controller = Get.put(RegisterAccountController(), tag: 'register_controller'); // Corrigé avec Get.put
    outlineInputBorder = OutlineInputBorder(
      borderRadius: BorderRadius.circular(8), // Ajouté borderRadius
      borderSide: BorderSide(color: Color(0x3d6c757d)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AuthLayout(
      child: GetBuilder<RegisterAccountController>(
        tag: 'register_controller',
        builder: (controller) {
          return Padding(
            padding: MySpacing.all(20),
            child: Form(
              key: controller.basicValidator.formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Logo
                  _buildLogo(),

                  // Form fields
                  Expanded(
                    child: SingleChildScrollView(
                      physics: BouncingScrollPhysics(),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          MyText.titleMedium("Free Sign Up", fontWeight: 600),
                          MySpacing.height(8),
                          MyText.bodySmall(
                            "Don't have an account? Create your account, it takes less than a minute",
                            muted: true,
                          ),
                          MySpacing.height(16),
                          _buildEmailField(controller),
                          MySpacing.height(12),
                          _buildUsernameField(controller),
                          MySpacing.height(12),
                          _buildPasswordField(controller),
                          MySpacing.height(12),
                          _buildTermsCheckbox(controller),
                          MySpacing.height(12),
                          _buildSignUpBtn(controller),
                          MySpacing.height(20),
                          _buildSocialButtons(),
                        ],
                      ),
                    ),
                  ),

                  // Already have account
                  _buildLoginRedirect(controller),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildLogo() {
    return MyContainer(
      paddingAll: 0,
      height: 28,
      child: Image.asset(
        ThemeCustomizer.instance.theme == ThemeMode.light
            ? Images.logoDark
            : Images.logo,
        fit: BoxFit.contain,
      ),
    );
  }

  Widget _buildEmailField(RegisterAccountController controller) {
    final emailValidator = controller.basicValidator.getValidation<String>('email');
    final emailController = controller.basicValidator.getController('email');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        MyText.bodyMedium("Email", fontWeight: 600),
        MySpacing.height(8),
        TextFormField(
          controller: emailController,
          validator: emailValidator,
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.next,
          style: MyTextStyle.bodySmall(fontWeight: 600, muted: true),
          decoration: InputDecoration(
            hintText: "Enter your email",
            hintStyle: MyTextStyle.bodySmall(fontWeight: 600, muted: true),
            isDense: true,
            contentPadding: MySpacing.xy(12, 12),
            border: outlineInputBorder,
            focusedBorder: outlineInputBorder.copyWith(
              borderSide: BorderSide(color: contentTheme.primary, width: 1.5),
            ),
            enabledBorder: outlineInputBorder,
            errorBorder: outlineInputBorder.copyWith(
              borderSide: BorderSide(color: Colors.red, width: 1.5),
            ),
            focusedErrorBorder: outlineInputBorder.copyWith(
              borderSide: BorderSide(color: Colors.red, width: 1.5),
            ),
          ),
          onChanged: (value) {
            controller.clearFieldError('email');
          },
          onFieldSubmitted: (_) {
            FocusScope.of(context).nextFocus();
          },
        ),
      ],
    );
  }

  Widget _buildUsernameField(RegisterAccountController controller) {
    final usernameValidator = controller.basicValidator.getValidation<String>('username');
    final usernameController = controller.basicValidator.getController('username');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        MyText.bodyMedium("Username", fontWeight: 600),
        MySpacing.height(8),
        TextFormField(
          controller: usernameController,
          validator: usernameValidator,
          textInputAction: TextInputAction.next,
          style: MyTextStyle.bodySmall(fontWeight: 600, muted: true),
          decoration: InputDecoration(
            hintText: "Enter your username",
            hintStyle: MyTextStyle.bodySmall(fontWeight: 600, muted: true),
            isDense: true,
            contentPadding: MySpacing.xy(12, 12),
            border: outlineInputBorder,
            focusedBorder: outlineInputBorder.copyWith(
              borderSide: BorderSide(color: contentTheme.primary, width: 1.5),
            ),
            enabledBorder: outlineInputBorder,
            errorBorder: outlineInputBorder.copyWith(
              borderSide: BorderSide(color: Colors.red, width: 1.5),
            ),
            focusedErrorBorder: outlineInputBorder.copyWith(
              borderSide: BorderSide(color: Colors.red, width: 1.5),
            ),
          ),
          onChanged: (value) {
            controller.clearFieldError('username');
          },
          onFieldSubmitted: (_) {
            FocusScope.of(context).nextFocus();
          },
        ),
      ],
    );
  }

  Widget _buildPasswordField(RegisterAccountController controller) {
    final passwordValidator = controller.basicValidator.getValidation<String>('password');
    final passwordController = controller.basicValidator.getController('password');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        MyText.bodyMedium("Password", fontWeight: 600),
        MySpacing.height(8),
        TextFormField(
          controller: passwordController,
          validator: passwordValidator,
          obscureText: true,
          textInputAction: TextInputAction.done,
          style: MyTextStyle.bodySmall(fontWeight: 600, muted: true),
          decoration: InputDecoration(
            hintText: "Enter your password",
            hintStyle: MyTextStyle.bodySmall(fontWeight: 600, muted: true),
            isDense: true,
            contentPadding: MySpacing.xy(12, 12),
            border: outlineInputBorder,
            focusedBorder: outlineInputBorder.copyWith(
              borderSide: BorderSide(color: contentTheme.primary, width: 1.5),
            ),
            enabledBorder: outlineInputBorder,
            errorBorder: outlineInputBorder.copyWith(
              borderSide: BorderSide(color: Colors.red, width: 1.5),
            ),
            focusedErrorBorder: outlineInputBorder.copyWith(
              borderSide: BorderSide(color: Colors.red, width: 1.5),
            ),
          ),
          onChanged: (value) {
            controller.clearFieldError('password');
          },
          onFieldSubmitted: (_) {
            if (!controller.isLoading) {
              controller.onRegister();
            }
          },
        ),
      ],
    );
  }

  Widget _buildTermsCheckbox(RegisterAccountController controller) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Theme(
          data: ThemeData(unselectedWidgetColor: contentTheme.primary),
          child: Checkbox(
            value: controller.termAndConditions,
            onChanged: (value) => controller.termAndConditionsToggle(),
            activeColor: contentTheme.primary,
          ),
        ),
        Expanded(
          child: GestureDetector(
            onTap: () => controller.termAndConditionsToggle(),
            child: MyText.bodyMedium(
              "I accept Terms and Conditions",
              fontWeight: 600,
              muted: !controller.termAndConditions,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSignUpBtn(RegisterAccountController controller) {
    return MyButton.block(
      onPressed: controller.isLoading ? null : () => controller.onRegister(),
      backgroundColor: contentTheme.primary,
      elevation: 0,
      borderRadius: BorderRadius.circular(8),
      child: controller.isLoading
          ? SizedBox(
              height: 20,
              width: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(contentTheme.onPrimary),
              ),
            )
          : MyText.bodyMedium(
              "Sign Up",
              color: contentTheme.onPrimary,
              fontWeight: 600,
            ),
    );
  }

  Widget _buildSocialButtons() {
    return Column(
      children: [
        Center(
          child: MyText.titleMedium(
            "Create account using",
            fontWeight: 600,
            muted: true,
          ),
        ),
        MySpacing.height(20),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            MyContainer.roundBordered(
              onTap: () {},
              paddingAll: 4,
              borderColor: contentTheme.primary,
              child: Icon(Remix.facebook_circle_fill,
                  size: 18, color: contentTheme.primary),
            ),
            MySpacing.width(12),
            MyContainer.roundBordered(
              onTap: () {},
              paddingAll: 4,
              borderColor: contentTheme.danger,
              child: Icon(Remix.google_fill, size: 18, color: contentTheme.danger),
            ),
            MySpacing.width(12),
            MyContainer.roundBordered(
              onTap: () {},
              paddingAll: 4,
              borderColor: contentTheme.info,
              child: Icon(Remix.twitter_fill, size: 18, color: contentTheme.info),
            ),
            MySpacing.width(12),
            MyContainer.roundBordered(
              onTap: () {},
              paddingAll: 4,
              borderColor: contentTheme.secondary,
              child: Icon(Remix.github_fill, size: 18, color: contentTheme.secondary),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildLoginRedirect(RegisterAccountController controller) {
    return Container(
      padding: MySpacing.top(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          MyText.bodyMedium(
            "Already have account?",
            fontWeight: 600,
            muted: true,
          ),
          MySpacing.width(8),
          GestureDetector(
            onTap: controller.isLoading ? null : () => controller.gotoLogin(),
            child: MouseRegion(
              cursor: controller.isLoading ? SystemMouseCursors.forbidden : SystemMouseCursors.click,
              child: MyText.bodyMedium(
                "Log in",
                fontWeight: 600,
                color: controller.isLoading ? Colors.grey : contentTheme.primary,
                decoration: TextDecoration.underline,
              ),
            ),
          )
        ],
      ),
    );
  }
}
