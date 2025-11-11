import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/layout/auth_layout_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_flex.dart';
import 'package:henox/helpers/widgets/my_flex_item.dart';
import 'package:henox/helpers/widgets/my_responsive.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/images.dart';

class AuthLayout extends StatefulWidget {
  final Widget? child;

  AuthLayout({super.key, this.child});

  @override
  State<AuthLayout> createState() => _AuthLayoutState();
}

class _AuthLayoutState extends State<AuthLayout> with UIMixin {
  final AuthLayoutController controller = AuthLayoutController();
  int currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return MyResponsive(builder: (BuildContext context, _, screenMT) {
      return GetBuilder(
          init: controller,
          builder: (controller) {
            return screenMT.isMobile
                ? mobileScreen(context)
                : largeScreen(context);
          });
    });
  }

  Widget mobileScreen(BuildContext context) {
    return Scaffold(
      key: controller.scaffoldKey,
      body: Container(
        padding: MySpacing.top(MySpacing.safeAreaTop(context) + 20),
        height: MediaQuery.of(context).size.height,
        color: theme.cardTheme.color,
        child: SingleChildScrollView(
          key: controller.scrollKey,
          child: widget.child,
        ),
      ),
    );
  }

  Widget largeScreen(BuildContext context) {
    return Scaffold(
      key: controller.scaffoldKey,
      body: Stack(
        alignment: Alignment.centerRight,
        clipBehavior: Clip.antiAliasWithSaveLayer,
        children: [
          SizedBox(
              width: double.infinity,
              height: double.infinity,
              child: Image.asset(Images.bgAuth, fit: BoxFit.cover)),
          MyFlex(
            runAlignment: WrapAlignment.end,
            wrapAlignment: WrapAlignment.end,
            wrapCrossAlignment: WrapCrossAlignment.end,
            children: [
              MyFlexItem(sizes: "lg-9 md-6 sm-6 xs-6", child: text()),
              MyFlexItem(
                sizes: "lg-3 md-6 sm-6 xs-6",
                child: MyContainer.transparent(
                  paddingAll: 0,
                  height: MediaQuery.of(context).size.height * .93,
                  child: Stack(
                    children: [
                      Positioned(
                        top: -0,
                        right: 2,
                        left: 2,
                        child: MyContainer(
                          color: contentTheme.primary,
                          borderRadius:
                              BorderRadius.vertical(top: Radius.circular(20)),
                        ),
                      ),
                      Padding(
                        padding: MySpacing.top(4),
                        child: MyContainer(
                          width: double.infinity,
                          borderRadiusAll: 20,
                          child: widget.child,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget text() {
    return SizedBox(
      height: 120,
      width: MediaQuery.of(context).size.width * .25,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          MyText.displaySmall("I Love the color!",
              fontWeight: 600, color: contentTheme.onPrimary),
          MyText.bodyMedium(
              "Everything need is in the template. Love the overall look feel. Not too flashy,and still very professional and smart.",
              fontWeight: 600,
              textAlign: TextAlign.center,
              color: contentTheme.onPrimary),
          MyText.bodyMedium("-Admin user",
              fontWeight: 600, color: contentTheme.onPrimary),
        ],
      ),
    );
  }
}
