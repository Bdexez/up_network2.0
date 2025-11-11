import 'package:henox/controller/my_controller.dart';
import 'package:video_player/video_player.dart';

class EmbedVideoController extends MyController {
  late VideoPlayerController videoController;

  @override
  void onInit() {
    videoController = VideoPlayerController.networkUrl(Uri.parse('https://flutter.github.io/assets-for-api-docs/assets/videos/bee.mp4'))
      ..initialize().then((_) {
        update();
      });
    super.onInit();
  }

  void onVideoControl() {
    videoController.value.isPlaying ? videoController.pause() : videoController.play();
    update();
  }

  @override
  void dispose() {
    videoController.dispose();
    super.dispose();
  }
}
