import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:henox/controller/auth/confirm_mail_controller.dart';
import 'package:henox/helpers/theme/theme_customizer.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/widgets/my_button.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/images.dart';
import 'package:henox/view/layouts/auth_layout.dart';
import 'package:remixicon/remixicon.dart';

class ConfirmMailScreen extends StatefulWidget {
  const ConfirmMailScreen({super.key});

  @override
  State<ConfirmMailScreen> createState() => _ConfirmMailScreenState();
}

class _ConfirmMailScreenState extends State<ConfirmMailScreen> with UIMixin{
  late ConfirmMailController controller;
  @override
  void initState() {
    controller = Get.put(ConfirmMailController());
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return AuthLayout(
      child: GetBuilder(
        init: controller,
        tag: 'confirm_mail_controller',
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
              Column(
                children: [
                  SvgPicture.asset('assets/images/svg/mail_sent.svg',
                      fit: BoxFit.cover, height: 60, width: 60),

                  MySpacing.height(16),
                  MyText.titleMedium("Please check your email", fontWeight: 600),
                  MySpacing.height(8),
                  MyText.bodySmall(
                      "A email has been send to youremail@domain.com. Please check for an email from company and click on the included link to reset your password.",
                      muted: true,textAlign: TextAlign.center),
                  MySpacing.height(20),
                  MyButton.block(
                      onPressed: () => controller.onLogin(),

                      backgroundColor: contentTheme.primary,
                      elevation: 0,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Remix.home_4_line,
                              color: contentTheme.onPrimary, size: 16),
                          MySpacing.width(8),
                          MyText.bodyMedium("Back to Home",
                              color: contentTheme.onPrimary),
                        ],
                      ))
                ],
              ),
              Center(
                child: MyText.bodySmall("2024 © Henox - Coderthemes.com",
                    fontWeight: 600, muted: true),
              ),

            ],
          ),
        );
      },),
    );
  }
}
