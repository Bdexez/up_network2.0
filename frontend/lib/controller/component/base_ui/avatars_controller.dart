import 'package:henox/controller/my_controller.dart';
import 'package:henox/images.dart';

class AvatarsController extends MyController {
  List<String> images =[
    Images.avatars[0],
    Images.avatars[1],
    Images.avatars[2],
    Images.avatars[3],
  ];

  final List<AvatarData> avatars = [
    AvatarData(imageUrl: 'assets/images/users/avatar-1.jpg'),
    AvatarData(imageUrl: 'assets/images/users/avatar-3.jpg'),
    AvatarData(title: 'K'),
    AvatarData(title: '9+'),
  ];
}


class AvatarData {
  final String? imageUrl;
  final String? title;

  AvatarData({
    this.imageUrl,
    this.title
  });
}
