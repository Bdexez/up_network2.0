import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:henox/controller/ui/maintenance_controller.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_flex.dart';
import 'package:henox/helpers/widgets/my_flex_item.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:remixicon/remixicon.dart';

class MaintenanceScreen extends StatefulWidget {
  const MaintenanceScreen({super.key});

  @override
  State<MaintenanceScreen> createState() => _MaintenanceScreenState();
}

class _MaintenanceScreenState extends State<MaintenanceScreen> with SingleTickerProviderStateMixin, UIMixin {
  late MaintenanceController controller = Get.put(MaintenanceController());

  @override
  Widget build(BuildContext context) {
    return GetBuilder(
      init: controller,
      tag: 'maintenance_controller',
      builder: (controller) {
        return Scaffold(
          body: Stack(
            alignment: Alignment.center,
            children: [
              SvgPicture.asset('assets/images/svg/maintenance_bg.svg', fit: BoxFit.cover),
              MyFlex(
                children: [
                  MyFlexItem(
                    sizes: 'xl-6 lg-6 md-7.5 sm-10',
                    child: MyContainer(
                      paddingAll: 40,
                      child: Column(
                        children: [
                          SvgPicture.asset('assets/images/svg/maintenance.svg', height: 200, fit: BoxFit.cover),
                          MySpacing.height(40),
                          MyText.titleLarge("Site is Under Maintenance", fontWeight: 600, textAlign: TextAlign.center,muted: true),
                          MySpacing.height(20),
                          MyText.bodySmall("We're making the system more awesome. We'll be back shortly.",
                              fontWeight: 600, xMuted: true, textAlign: TextAlign.center),
                          MySpacing.height(32),
                          MyFlex(
                            children: [
                              MyFlexItem(
                                  sizes: 'lg-4 md-4 sm-4',
                                  child: Column(
                                    children: [
                                      MyContainer.rounded(
                                        height: 60,
                                        width: 60,
                                        paddingAll: 0,
                                        color: contentTheme.primary,
                                        child: Icon(Remix.vip_diamond_line, color: contentTheme.onPrimary),
                                      ),
                                      MySpacing.height(20),
                                      MyText.titleMedium("Why is the Site Down?", fontWeight: 600, textAlign: TextAlign.center),
                                      MySpacing.height(8),
                                      MyText.bodySmall(controller.dummyTexts[0], maxLines: 3,xMuted: true, textAlign: TextAlign.center),
                                    ],
                                  )),
                              MyFlexItem(
                                  sizes: 'lg-4 md-4 sm-4',
                                  child: Column(
                                    children: [
                                      MyContainer.rounded(
                                        height: 60,
                                        width: 60,
                                        paddingAll: 0,
                                        color: contentTheme.primary,
                                        child: Icon(Remix.time_line, color: contentTheme.onPrimary),
                                      ),
                                      MySpacing.height(20),
                                      MyText.titleMedium("What is the Downtime?", fontWeight: 600, textAlign: TextAlign.center),
                                      MySpacing.height(8),
                                      MyText.bodySmall(controller.dummyTexts[1], maxLines: 3,xMuted: true, textAlign: TextAlign.center),
                                    ],
                                  )),
                              MyFlexItem(
                                  sizes: 'lg-4 md-4 sm-4',
                                  child: Column(
                                    children: [
                                      MyContainer.rounded(
                                        height: 60,
                                        width: 60,
                                        paddingAll: 0,
                                        color: contentTheme.primary,
                                        child: Icon(Remix.question_mark, color: contentTheme.onPrimary),
                                      ),
                                      MySpacing.height(20),
                                      MyText.titleMedium("Do you need Support?", fontWeight: 600, textAlign: TextAlign.center),
                                      MySpacing.height(8),
                                      MyText.bodySmall(controller.dummyTexts[2], maxLines: 3,xMuted: true, textAlign: TextAlign.center),
                                    ],
                                  ))
                            ],
                          )
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}
