import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/auth/lock_controller.dart';
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

class LockScreen extends StatefulWidget {
  const LockScreen({super.key});

  @override
  State<LockScreen> createState() => _LockScreenState();
}

class _LockScreenState extends State<LockScreen> with UIMixin {
  late LockController controller;

  @override
  late OutlineInputBorder outlineInputBorder;
  @override
  void initState() {
    controller = Get.put(LockController());
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
        tag: 'lock_controller',
        builder: (controller) {
          return Form(
            key: controller.basicValidator.formKey,
            child: Padding(
              padding: MySpacing.all(20),
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
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Center(
                        child: MyContainer.rounded(
                          height: 52,
                          width: 52,
                          paddingAll: 0,
                          child: Image.asset(Images.avatars[0]),
                        ),
                      ),
                      MySpacing.height(8),
                      Center(
                          child:
                              MyText.titleMedium("Hi ! Tosha", fontWeight: 600)),
                      MySpacing.height(8),
                      Center(
                        child: MyText.bodySmall(
                            "Enter your password to access the admin.",
                            muted: true),
                      ),
                      MySpacing.height(16),
                      MyText.bodyMedium("Password", fontWeight: 600),
                      MySpacing.height(8),
                      TextFormField(
                        controller:
                            controller.basicValidator.getController('password'),
                        validator:
                            controller.basicValidator.getValidation('password'),
                        style:
                            MyTextStyle.bodySmall(fontWeight: 600, muted: true),
                        decoration: InputDecoration(
                          hintText: "Enter your password",
                          hintStyle:
                              MyTextStyle.bodySmall(fontWeight: 600, muted: true),
                          isDense: true,
                          contentPadding: MySpacing.xy(12, 12),
                          border: outlineInputBorder,
                          disabledBorder: outlineInputBorder,
                          errorBorder: outlineInputBorder,
                          focusedBorder: outlineInputBorder,
                          enabledBorder: outlineInputBorder,
                        ),
                      ),
                      MySpacing.height(20),
                      MyButton.block(
                          onPressed: () => controller.onLogin(),
                          backgroundColor: contentTheme.primary,
                          elevation: 0,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Remix.login_box_line,
                                  color: contentTheme.onPrimary, size: 16),
                              MySpacing.width(8),
                              MyText.bodyMedium("Log In",
                                  color: contentTheme.onPrimary),
                            ],
                          )),
                      MySpacing.height(20),
                      Center(
                          child: MyText.bodyMedium("Authentication in with",
                              fontWeight: 600)),
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
                            child: Icon(Remix.google_fill,
                                size: 18, color: contentTheme.danger),
                          ),
                          MySpacing.width(12),
                          MyContainer.roundBordered(
                            onTap: () {},
                            paddingAll: 4,
                            borderColor: contentTheme.info,
                            child: Icon(Remix.twitter_fill,
                                size: 18, color: contentTheme.info),
                          ),
                          MySpacing.width(12),
                          MyContainer.roundBordered(
                            onTap: () {},
                            paddingAll: 4,
                            borderColor: contentTheme.secondary,
                            child: Icon(Remix.github_fill,
                                size: 18, color: contentTheme.secondary),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      MyText.bodyMedium("Don't have an account? ",
                          fontWeight: 600, muted: true),
                      InkWell(
                        onTap: () => controller.goToRegisterScreen(),
                        child: MyText.bodyMedium("Sign Up",
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
}
