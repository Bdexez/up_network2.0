import 'package:flutter/material.dart';
import 'package:henox/helpers/theme/admin_theme.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/widgets/my_dashed_divider.dart';
import 'package:henox/helpers/widgets/my_navigation_mixin.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';

mixin UIMixin {
  LeftBarTheme get leftBarTheme => AdminTheme.theme.leftBarTheme;

  TopBarTheme get topBarTheme => AdminTheme.theme.topBarTheme;

  RightBarTheme get rightBarTheme => AdminTheme.theme.rightBarTheme;

  ContentTheme get contentTheme => AdminTheme.theme.contentTheme;

  ColorScheme get colorScheme => theme.colorScheme;

  VisualDensity get getCompactDensity =>
      VisualDensity(horizontal: -4, vertical: -4);

  OutlineInputBorder get outlineInputBorder => OutlineInputBorder(
        borderRadius: BorderRadius.all(Radius.circular(12)),
        borderSide: BorderSide(
            width: 1,
            strokeAlign: 0,
            color: colorScheme.onSurface.withAlpha(80)),
      );

  OutlineInputBorder get focusedInputBorder => OutlineInputBorder(
        borderRadius: BorderRadius.all(Radius.circular(12)),
        borderSide: BorderSide(width: 1, color: contentTheme.primary),
      );

  OutlineInputBorder generateOutlineInputBorder({double radius = 8}) =>
      OutlineInputBorder(
        borderRadius: BorderRadius.all(Radius.circular(radius)),
        borderSide: BorderSide(
          color: Colors.transparent,
        ),
      );

  OutlineInputBorder generateFocusedInputBorder({double radius = 8}) =>
      OutlineInputBorder(
        borderRadius: BorderRadius.all(Radius.circular(radius)),
        borderSide: BorderSide(width: 1, color: colorScheme.primary),
      );

  SizedBox get height => MySpacing.height(16);

  SizedBox get largeHeight => MySpacing.height(20);

  SizedBox get mediumHeight => MySpacing.height(8);

  SizedBox get width => MySpacing.width(16);

  SizedBox get largeWidth => MySpacing.width(20);

  SizedBox get mediumWidth => MySpacing.width(8);

  EdgeInsets get contentSpacing => MySpacing.all(16);

  EdgeInsets get mediumSpacing => MySpacing.all(8);

  EdgeInsets get containerSpacing => MySpacing.xy(16, 14);

  double get borderRadius => 8;

  Widget getBackButton(MyNavigationMixin navigationMixin) {
    return InkWell(
      onTap: navigationMixin.goBack,
      child: Center(
        child: Icon(Icons.chevron_left_rounded,
            size: 26, color: colorScheme.onSurface),
      ),
    );
  }

  Widget getDashedDivider() {
    return MyDashedDivider(
        dashWidth: 6,
        dashSpace: 4,
        color: colorScheme.onSurface.withAlpha(64),
        height: 0.5);
  }

  String numberFormatter(String n) {
    var numArr = n.split('');
    String revStr = "";
    int thousands = 0;
    for (var i = numArr.length - 1; i >= 0; i--) {
      if (numArr[i].toString() == ".") {
        thousands = 0;
      } else {
        thousands++;
      }
      revStr = revStr + numArr[i].toString();
      if (thousands == 3 && i > 0) {
        thousands = 0;
        revStr = '$revStr,';
      }
    }
    return revStr.split('').reversed.join('');
  }

  double findAspectRatio(double width) {
    //Logic for aspect ratio of grid view
    return (width / 2 - 24) / ((width / 2 - 24) + 92);
  }
}
