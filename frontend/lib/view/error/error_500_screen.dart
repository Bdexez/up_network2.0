import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:henox/controller/error/error_500_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/theme/theme_customizer.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/widgets/my_button.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/helpers/widgets/my_text_style.dart';
import 'package:henox/images.dart';
import 'package:henox/view/layouts/auth_layout.dart';

class Error500Screen extends StatefulWidget {
  const Error500Screen({super.key});

  @override
  State<Error500Screen> createState() => _Error500ScreenState();
}

class _Error500ScreenState extends State<Error500Screen> with UIMixin{
  Error500Controller controller = Get.put(Error500Controller());

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
                      SvgPicture.asset('assets/images/svg/startman.svg',height: 120, fit: BoxFit.cover),
                      MySpacing.height(20),
                      MyText.displayLarge(
                        '500',color: contentTheme.primary,
                        fontWeight: 800,fontSize: 70
                      ),
                      MySpacing.height(20),
                      MyText.bodyLarge("INTERNAL SERVER ERROR",fontWeight: 600,color: contentTheme.danger),
                      MySpacing.height(20),
                      Padding(
                        padding: MySpacing.x(flexSpacing),
                        child: RichText(
                            textAlign: TextAlign.center,
                            text: TextSpan(
                          children: [
                            TextSpan(text: "Why not try refreshing your page? or you can contact",style: MyTextStyle.bodyMedium(muted: true,height: 1.5)),
                            TextSpan(text: " Support",style: MyTextStyle.bodyMedium(fontWeight: 600)),
                          ]
                        )),
                      ),
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
