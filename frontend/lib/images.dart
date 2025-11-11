import 'dart:math';

class Images {
  static List<String> avatars = List.generate(
      10, (index) => 'assets/images/users/avatar-${index + 1}.jpg');

  static List<String> small =
      List.generate(7, (index) => 'assets/images/small/small-${index + 1}.jpg');

  static List<String> product = List.generate(
      7, (index) => 'assets/images/product/product-${index + 1}.jpg');

  //******************** Flags ********************//
  static String french = 'assets/images/flags/french.jpg';
  static String germany = 'assets/images/flags/germany.jpg';
  static String italy = 'assets/images/flags/italy.jpg';
  static String russia = 'assets/images/flags/russia.jpg';
  static String spain = 'assets/images/flags/spain.jpg';
  static String us = 'assets/images/flags/us.jpg';

  //******************** Brands ********************//
  static String behance = 'assets/images/brands/behance.png';
  static String bitbucket = 'assets/images/brands/bitbucket.png';
  static String dribbble = 'assets/images/brands/dribbble.png';
  static String dropbox = 'assets/images/brands/dropbox.png';
  static String github = 'assets/images/brands/github.png';
  static String instagram = 'assets/images/brands/instagram.png';
  static String messenger = 'assets/images/brands/messenger.png';
  static String slack = 'assets/images/brands/slack.png';

  //******************** Logo ********************//
  static String logo = 'assets/images/dummy/logo.png';
  static String logoDark = 'assets/images/dummy/logo-dark.png';
  static String logoSm = 'assets/images/dummy/logo-sm.png';

  static String bgAuth = 'assets/images/dummy/bg-auth.jpg';

  //******************** Dummy ********************//
  static String barCode = 'assets/images/dummy/barcode.png';

  static String randomImage(List<String> images) {
    return images[Random().nextInt(images.length)];
  }
}
