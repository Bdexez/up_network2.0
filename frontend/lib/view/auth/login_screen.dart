import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/auth/login_controller.dart';
import 'package:henox/helpers/theme/theme_customizer.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/widgets/my_button.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/helpers/widgets/my_text_style.dart';
import 'package:henox/images.dart';
import 'package:henox/view/layouts/auth_layout.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin, UIMixin {
  late OutlineInputBorder outlineInputBorder;
  late LoginController controller;

  @override
  void initState() {
    super.initState();
    controller = Get.put(LoginController(), tag: 'login_controller');
    outlineInputBorder = OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: BorderSide(color: Color(0x3d6c757d)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AuthLayout(
      child: GetBuilder<LoginController>(
        tag: 'login_controller',
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
                          MyText.titleMedium("Welcome Back", fontWeight: 600),
                          MySpacing.height(8),
                          MyText.bodySmall(
                            "Login to your account",
                            muted: true,
                          ),
                          MySpacing.height(16),
                          _buildEmailField(controller),
                          MySpacing.height(12),
                          _buildPasswordField(controller),
                          MySpacing.height(12),
                          _buildSignInBtn(controller),
                          MySpacing.height(12),
                          _buildForgotPasswordBtn(),
                        ],
                      ),
                    ),
                  ),

                  // Sign up redirect
                  _buildSignUpRedirect(controller),
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

  Widget _buildEmailField(LoginController controller) {
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
            // Optionnel: focus sur le champ password
            FocusScope.of(context).nextFocus();
          },
        ),
      ],
    );
  }

  Widget _buildPasswordField(LoginController controller) {
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
              controller.onLogin();
            }
          },
        ),
      ],
    );
  }

  Widget _buildSignInBtn(LoginController controller) {
    return MyButton.block(
      onPressed: controller.isLoading ? null : () => controller.onLogin(),
      backgroundColor: contentTheme.primary,
      elevation: 0,
      borderRadius: BorderRadius.circular(8), // CORRIGÉ : BorderRadius.circular(8) au lieu de 8
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
              "Login",
              color: contentTheme.onPrimary,
              fontWeight: 600,
            ),
    );
  }

  Widget _buildForgotPasswordBtn() {
    return Align(
      alignment: Alignment.centerRight,
      child: TextButton(
        onPressed: () => Get.toNamed('/auth/forgot_password'),
        style: TextButton.styleFrom(
          padding: MySpacing.zero,
          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
        ),
        child: MyText.bodySmall(
          "Forgot Password?",
          fontWeight: 600,
          muted: true,
        ),
      ),
    );
  }

  Widget _buildSignUpRedirect(LoginController controller) {
    return Container(
      padding: MySpacing.top(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          MyText.bodyMedium(
            "Don't have an account?",
            fontWeight: 600,
            muted: true,
          ),
          MySpacing.width(8),
          GestureDetector(
            onTap: () {
              if (!controller.isLoading) {
                controller.gotoRegister();
              }
            },
            child: MouseRegion(
              cursor: controller.isLoading ? SystemMouseCursors.forbidden : SystemMouseCursors.click,
              child: AnimatedContainer(
                duration: Duration(milliseconds: 200),
                child: MyText.bodyMedium(
                  "Sign Up",
                  fontWeight: 600,
                  color: controller.isLoading ? Colors.grey : contentTheme.primary,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  @override
  void dispose() {
    // Ne pas disposer le controller ici, GetX s'en occupe
    super.dispose();
  }
}
