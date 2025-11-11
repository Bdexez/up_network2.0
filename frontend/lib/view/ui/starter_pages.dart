import 'package:flutter/material.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/view/layouts/layout.dart';

class StarterPages extends StatefulWidget {
  const StarterPages({super.key});

  @override
  State<StarterPages> createState() => _StarterPagesState();
}

class _StarterPagesState extends State<StarterPages> with SingleTickerProviderStateMixin, UIMixin {

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: Column(
        children: [
          Padding(
            padding: MySpacing.x(flexSpacing),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                MyText.titleMedium("Starter", fontSize: 18, fontWeight: 600),
                MyBreadcrumb(
                  children: [
                    MyBreadcrumbItem(name: 'Pages'),
                    MyBreadcrumbItem(name: 'Starter'),
                  ],
                ),
              ],
            ),
          ),
          MySpacing.height(flexSpacing),
        ],
      ),
    );
  }
}
