import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:henox/controller/auth/log_out_controller.dart';
import 'package:henox/helpers/theme/theme_customizer.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/images.dart';
import 'package:henox/view/layouts/auth_layout.dart';

class LogOutScreen extends StatefulWidget {
  const LogOutScreen({super.key});

  @override
  State<LogOutScreen> createState() => _LogOutScreenState();
}

class _LogOutScreenState extends State<LogOutScreen>with UIMixin {

  late LogOutController controller = Get.put(LogOutController());

  @override
  Widget build(BuildContext context) {
    return AuthLayout(
    child: GetBuilder(
      init: controller,
      tag: 'log_out_controller',
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
                children: [
                  MyText.titleMedium("See you again!", fontWeight: 600),
                  MySpacing.height(8),
                  MyText.bodySmall(
                      "You are now successfully sign out.",
                      muted: true),
                  MySpacing.height(16),
                  SvgPicture.asset('assets/images/svg/logout.svg',
                      fit: BoxFit.cover, height: 131, width: 131),
                ],
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                MyText.bodyMedium("Back to ",
                    fontWeight: 600, muted: true),
                InkWell(
                  onTap: () => controller.goToLogInScreen(),
                  child: MyText.bodyMedium("Log In",
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
