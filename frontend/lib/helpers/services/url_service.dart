import 'package:url_launcher/url_launcher.dart';

class UrlService {
  static goToUrl(String url) async {
    await launchUrl(Uri.parse(url));
  }

  static goToPurchase() {
    goToUrl('https://codecanyon.net/item/flatten-flutter-admin-panel/45285824');
  }

  static goToLucideIcon() {
    goToUrl('https://lucide.dev/');
  }

  static goToRemixIcon() {
    goToUrl('https://remixicon.com');
  }

  static goGitHub(){
    goToUrl('https://github.com');
  }

  static goBitBucket(){
    goToUrl('https://bitbucket.org');
  }

  static goDropBox(){
    goToUrl('https://www.dropbox.com');
  }

  static goSlack(){
    goToUrl('https://slack.com');
  }

  static goDribbble(){
    goToUrl('https://dribbble.com');
  }

  static goBehance(){
    goToUrl('https://www.behance.net');
  }

  static getCurrentUrl() {
    var path = Uri.base.path;
    return path.replaceAll('henox/web/', '');
  }
}
