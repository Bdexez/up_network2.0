import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/base_ui/embed_video_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_flex.dart';
import 'package:henox/helpers/widgets/my_flex_item.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/view/layouts/layout.dart';
import 'package:video_player/video_player.dart';

class EmbedVideoScreen extends StatefulWidget {
  const EmbedVideoScreen({super.key});

  @override
  State<EmbedVideoScreen> createState() => _EmbedVideoScreenState();
}

class _EmbedVideoScreenState extends State<EmbedVideoScreen> with SingleTickerProviderStateMixin, UIMixin {
  EmbedVideoController controller = Get.put(EmbedVideoController());

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        builder: (controller) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Embed Video", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Base UI'),
                        MyBreadcrumbItem(name: 'Embed Video'),
                      ],
                    ),
                  ],
                ),
              ),
              MySpacing.height(flexSpacing),
              Padding(
                padding: MySpacing.x(flexSpacing / 2),
                child: MyFlex(
                  children: [
                    MyFlexItem(
                        sizes: 'lg-6',
                        child: MyContainer(
                          borderRadiusAll: 8,
                          clipBehavior: Clip.antiAliasWithSaveLayer,
                          paddingAll: 0,
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              controller.videoController.value.isInitialized
                                  ? AspectRatio(
                                      aspectRatio: controller.videoController.value.aspectRatio,
                                      child: VideoPlayer(controller.videoController),
                                    )
                                  : Container(),
                              Center(
                                child: MyContainer.rounded(
                                  child: IconButton(
                                    onPressed: () => controller.onVideoControl(),
                                    icon: Icon(
                                      controller.videoController.value.isPlaying ? Icons.pause : Icons.play_arrow,
                                    ),
                                  ),
                                ),
                              )
                            ],
                          ),
                        ))
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
