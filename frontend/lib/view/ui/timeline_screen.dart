import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/ui/timeline_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/view/layouts/layout.dart';

class TimeLineScreen extends StatefulWidget {
  const TimeLineScreen({super.key});

  @override
  State<TimeLineScreen> createState() => _TimeLineScreenState();
}

class _TimeLineScreenState extends State<TimeLineScreen>
    with SingleTickerProviderStateMixin, UIMixin {
  late TimelineController controller = Get.put(TimelineController());

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        builder: (controller) {
          return Column(
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Timeline",
                        fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Pages'),
                        MyBreadcrumbItem(name: 'Timeline'),
                      ],
                    ),
                  ],
                ),
              ),
              MySpacing.height(flexSpacing),
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Column(
                  children: [
                    Column(
                      children: controller.timeLine.map((timeLine) {
                        return MyCard(
                          marginAll: 20,
                          borderRadiusAll: 8,
                          shadow: MyShadow(
                              position: MyShadowPosition.bottom, elevation: .5),
                          paddingAll: 24,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              MyText.bodyMedium(timeLine.title,
                                  fontWeight: 600,
                                  overflow: TextOverflow.ellipsis),
                              MySpacing.height(12),
                              MyText.bodySmall(timeLine.date,
                                  muted: true, overflow: TextOverflow.ellipsis),
                              MySpacing.height(12),
                              MyText.bodySmall(timeLine.description,
                                  fontWeight: 600, muted: true),
                            ],
                          ),
                        );
                      }).toList(),
                    )
                  ],
                ),
              )
            ],
          );
        },
      ),
    );
  }
}
