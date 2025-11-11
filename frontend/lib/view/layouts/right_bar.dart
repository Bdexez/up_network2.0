import 'package:henox/helpers/theme/theme_customizer.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/widgets/custom_switch.dart';
import 'package:flutter/material.dart';

class RightBar extends StatefulWidget {
  const RightBar({
    super.key,
  });

  @override
  _RightBarState createState() => _RightBarState();
}

class _RightBarState extends State<RightBar> with SingleTickerProviderStateMixin, UIMixin {
  ThemeCustomizer customizer = ThemeCustomizer.instance;

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    customizer = ThemeCustomizer.instance;
    return Container(
      width: 280,
      color: colorScheme.surface,
      child: Column(
        children: [
          Container(
            height: 60,
            alignment: Alignment.centerLeft,
            padding: MySpacing.x(24),
            color: colorScheme.primaryContainer,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: MyText.labelLarge(
                    "Settings",
                    color: colorScheme.onPrimaryContainer,
                  ),
                ),
                InkWell(
                  onTap: () {
                    Navigator.of(context).pop();
                  },
                  child: Icon(
                    Icons.close,
                    size: 18,
                    color: colorScheme.onPrimaryContainer,
                  ),
                )
              ],
            ),
          ),
          Expanded(
              child: Container(
            padding: MySpacing.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                MyText.labelMedium("Color Scheme"),
                MySpacing.height(12),
                Row(
                  children: [
                    CustomSwitch.small(
                      value: customizer.theme == ThemeMode.light,
                      onChanged: (value) {
                        ThemeCustomizer.setTheme(ThemeMode.light);
                      },
                    ),
                    MySpacing.width(12),
                    MyText.bodySmall(
                      "Light",
                      fontWeight: 600,
                    )
                  ],
                ),
                MySpacing.height(8),
                Row(
                  children: [
                    CustomSwitch.small(
                      value: customizer.theme == ThemeMode.dark,
                      onChanged: (value) {
                        ThemeCustomizer.setTheme(ThemeMode.dark);
                      },
                    ),
                    MySpacing.width(12),
                    MyText.bodySmall("Dark", fontWeight: 600)
                  ],
                ),
              ],
            ),
          ))
        ],
      ),
    );
  }
}
