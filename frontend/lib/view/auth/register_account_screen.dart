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
  late final RegisterAccountController controller;
  late final OutlineInputBorder outlineInputBorder;

  @override
  void initState() {
    super.initState();

    controller = Get.put(RegisterAccountController(),
        tag: 'register_controller', permanent: true);

    outlineInputBorder = OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: const BorderSide(color: Color(0x3d6c757d)),
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
                  _buildLogo(),
                  Expanded(
                    child: SingleChildScrollView(
                      physics: const BouncingScrollPhysics(),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          MyText.titleMedium("Free Sign Up", fontWeight: 600),
                          MySpacing.height(8),
                          MyText.bodySmall(
                            "Don't have an account? Create one, it takes less than a minute.",
                            muted: true,
                          ),
                          MySpacing.height(16),
                          _buildEmailField(),
                          MySpacing.height(12),
                          _buildUsernameField(),
                          MySpacing.height(12),
                          _buildPasswordField(),
                          MySpacing.height(12),
                          _buildTermsCheckbox(),
                          MySpacing.height(12),
                          _buildSignUpBtn(),
                          MySpacing.height(20),
                          _buildSocialButtons(),
                        ],
                      ),
                    ),
                  ),
                  _buildLoginRedirect(),
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

  // ✅ ICI LES TROIS CHANGEMENTS :
  Widget _buildEmailField() {
    final validator = controller.basicValidator.getValidation<String>('email');
    final textController = controller.basicValidator.getController('email');
    return _buildTextField(
      "Email",
      "Enter your email",
      textController,
      validator,
      TextInputType.emailAddress,
      onChangeField: 'email',
    );
  }

  Widget _buildUsernameField() {
    final validator =
        controller.basicValidator.getValidation<String>('username');
    final textController = controller.basicValidator.getController('username');
    return _buildTextField(
      "Username",
      "Enter your username",
      textController,
      validator,
      TextInputType.text,
      onChangeField: 'username',
    );
  }

  Widget _buildPasswordField() {
    final validator =
        controller.basicValidator.getValidation<String>('password');
    final textController = controller.basicValidator.getController('password');
    return _buildTextField(
      "Password",
      "Enter your password",
      textController,
      validator,
      TextInputType.text,
      obscure: true,
      onChangeField: 'password',
    );
  }

  Widget _buildTextField(
    String label,
    String hint,
    TextEditingController textController,
    String? Function(String?)? validator,
    TextInputType inputType, {
    bool obscure = false,
    required String onChangeField,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        MyText.bodyMedium(label, fontWeight: 600),
        MySpacing.height(8),
        TextFormField(
          controller: textController,
          validator: validator,
          keyboardType: inputType,
          obscureText: obscure,
          textInputAction: TextInputAction.next,
          style: MyTextStyle.bodySmall(fontWeight: 600, muted: true),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: MyTextStyle.bodySmall(fontWeight: 600, muted: true),
            isDense: true,
            contentPadding: MySpacing.xy(12, 12),
            border: outlineInputBorder,
            focusedBorder: outlineInputBorder.copyWith(
              borderSide: BorderSide(color: contentTheme.primary, width: 1.5),
            ),
            enabledBorder: outlineInputBorder,
            errorBorder: outlineInputBorder.copyWith(
              borderSide: const BorderSide(color: Colors.red, width: 1.5),
            ),
            focusedErrorBorder: outlineInputBorder.copyWith(
              borderSide: const BorderSide(color: Colors.red, width: 1.5),
            ),
          ),
          onChanged: (_) => controller.clearFieldError(onChangeField),
          onFieldSubmitted: (_) => FocusScope.of(context).nextFocus(),
        ),
      ],
    );
  }

  Widget _buildTermsCheckbox() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Theme(
          data: ThemeData(unselectedWidgetColor: contentTheme.primary),
          child: Checkbox(
            value: controller.termAndConditions,
            onChanged: (_) => controller.termAndConditionsToggle(),
            activeColor: contentTheme.primary,
          ),
        ),
        Expanded(
          child: GestureDetector(
            onTap: controller.termAndConditionsToggle,
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

  Widget _buildSignUpBtn() {
    return MyButton.block(
      onPressed: controller.isLoading ? null : controller.onRegister,
      backgroundColor: contentTheme.primary,
      elevation: 0,
      borderRadius: BorderRadius.circular(8),
      child: controller.isLoading
          ? const SizedBox(
              height: 20,
              width: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
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
          child: MyText.titleMedium("Create account using",
              fontWeight: 600, muted: true),
        ),
        MySpacing.height(20),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _socialButton(Remix.facebook_circle_fill, contentTheme.primary),
            MySpacing.width(12),
            _socialButton(Remix.google_fill, contentTheme.danger),
            MySpacing.width(12),
            _socialButton(Remix.twitter_fill, contentTheme.info),
            MySpacing.width(12),
            _socialButton(Remix.github_fill, contentTheme.secondary),
          ],
        ),
      ],
    );
  }

  Widget _socialButton(IconData icon, Color color) {
    return MyContainer.roundBordered(
      onTap: () {},
      paddingAll: 4,
      borderColor: color,
      child: Icon(icon, size: 18, color: color),
    );
  }

  Widget _buildLoginRedirect() {
    return Container(
      padding: MySpacing.top(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          MyText.bodyMedium("Already have an account?",
              fontWeight: 600, muted: true),
          MySpacing.width(8),
          GestureDetector(
            onTap: controller.isLoading ? null : controller.gotoLogin,
            child: MouseRegion(
              cursor: controller.isLoading
                  ? SystemMouseCursors.forbidden
                  : SystemMouseCursors.click,
              child: MyText.bodyMedium(
                "Log in",
                fontWeight: 600,
                color:
                    controller.isLoading ? Colors.grey : contentTheme.primary,
                decoration: TextDecoration.underline,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
