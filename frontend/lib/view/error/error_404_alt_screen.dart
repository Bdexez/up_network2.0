import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/controller/error/error_404_alt_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_button.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/view/layouts/layout.dart';

class Error404AltScreen extends StatefulWidget {
  const Error404AltScreen({super.key});

  @override
  State<Error404AltScreen> createState() => _Error404AltScreenState();
}

class _Error404AltScreenState extends State<Error404AltScreen> with UIMixin {
  Error404AltController controller = Get.put(Error404AltController());
  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'error_404_alt_controller',
        builder: (controller) {
          return Column(
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium(
                      "404 Error",
                      fontSize: 18,
                      fontWeight: 600,
                    ),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Pages'),
                        MyBreadcrumbItem(name: '404 Error'),
                      ],
                    ),
                  ],
                ),
              ),
              MySpacing.height(flexSpacing),
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: <Widget>[
                  MyText.displayLarge(
                    '404',
                    color: contentTheme.primary,
                    fontWeight: 800,
                    fontSize: 70,
                  ),
                  MySpacing.height(20),
                  MyText.bodyLarge("PAGE NOT FOUND", fontWeight: 600, color: contentTheme.danger),
                  MySpacing.height(20),
                  Padding(
                    padding: MySpacing.x(MediaQuery.of(context).size.width / 3.5),
                    child: MyText.bodyMedium(
                        "It's looking like you may have taken a wrong turn. Don't worry... it happens to the best of us. Here's a little tip that might help you get back on track.",
                        
                        textAlign: TextAlign.center,
                        muted: true),
                  ),
                  MySpacing.height(20),
                  MyButton(
                    onPressed: () {},
                    elevation: 0,
                    borderRadiusAll: 4,
                    backgroundColor: contentTheme.info,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(LucideIcons.house, size: 16),
                        SizedBox(width: 8),
                        MyText.labelMedium('Back to Home', color: contentTheme.onPrimary, muted: true),
                      ],
                    ),
                  )
                ],
              )
            ],
          );
        },
      ),
    );
  }
}
