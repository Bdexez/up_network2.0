import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/controller/error/error_404_controller.dart';
import 'package:henox/helpers/theme/theme_customizer.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/widgets/my_button.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/images.dart';
import 'package:henox/view/layouts/auth_layout.dart';

class Error404Screen extends StatefulWidget {
  const Error404Screen({super.key});

  @override
  State<Error404Screen> createState() => _Error404ScreenState();
}

class _Error404ScreenState extends State<Error404Screen>with UIMixin {
  Error404Controller controller = Get.put(Error404Controller());

  @override
  Widget build(BuildContext context) {
    return AuthLayout(
      child: GetBuilder(
        init: controller,
        builder: (controller) {
        return Padding(
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
              Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: <Widget>[
                    MyText.displayLarge(
                      '4😢4',color: contentTheme.primary,
                      fontWeight: 800,fontSize: 70,
                    ),
                    MySpacing.height(20),
                    MyText.bodyLarge("PAGE NOT FOUND",fontWeight: 600,color: contentTheme.danger),
                    MySpacing.height(20),
                    MyButton(
                      onPressed: controller.backToHome,
                      elevation: 0,
                      borderRadiusAll: 4,
                      backgroundColor: contentTheme.info,
                      child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(LucideIcons.house,size: 16),
                        SizedBox(width: 8),
                        MyText.labelMedium('Back to Home',color: contentTheme.onPrimary,muted: true),
                      ],
                    ),
                    )
                  ],
                ),
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
        );
      },),
    );
  }
}
