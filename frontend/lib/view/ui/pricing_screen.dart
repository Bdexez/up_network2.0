import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/controller/ui/pricing_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_flex.dart';
import 'package:henox/helpers/widgets/my_flex_item.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/view/layouts/layout.dart';
import 'package:remixicon/remixicon.dart';

class PricingScreen extends StatefulWidget {
  const PricingScreen({super.key});

  @override
  State<PricingScreen> createState() => _PricingScreenState();
}

class _PricingScreenState extends State<PricingScreen> with SingleTickerProviderStateMixin, UIMixin {
  late PricingController controller = Get.put(PricingController());

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
                    MyText.titleMedium("Pricing", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Pages'),
                        MyBreadcrumbItem(name: 'Pricing'),
                      ],
                    ),
                  ],
                ),
              ),
              MySpacing.height(flexSpacing),
              Padding(
                padding: MySpacing.x(flexSpacing / 2),
                child: Column(
                  children: [
                    MyText.titleLarge("Our Plan", fontWeight: 600, xMuted: true),
                    MySpacing.height(16),
                    SizedBox(
                      width: MediaQuery.of(context).size.width / 4,
                      child: MyText.bodySmall(
                          "We have plans and prices that fit your business perfectly. Make your client site a success with our products.",
                          muted: true,
                          textAlign: TextAlign.center),
                    ),
                    MySpacing.height(20),
                    MyFlex(
                      children: [
                        MyFlexItem(sizes: 'lg-3 xl-3 md-6 sm-12', child: basicPricingDetail()),
                        MyFlexItem(sizes: 'lg-3 xl-3 md-6 sm-12', child: premiumPricingDetail()),
                        MyFlexItem(sizes: 'lg-3 xl-3 md-6 sm-12', child: developerPricingDetail()),
                        MyFlexItem(sizes: 'lg-3 xl-3 md-6 sm-12', child: businessPricingDetail()),
                      ],
                    ),
                  ],
                ),
              )
            ],
          );
        },
      ),
    );
  }

  Widget basicPricingDetail() {
    return MyCard(
      paddingAll: 24,
      shadow: shadow(),
      height: 500,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          icon(LucideIcons.package),
          MySpacing.height(12),
          MyText.bodyMedium("BASIC", color: contentTheme.primary),
          MySpacing.height(12),
          MyText.displaySmall("\$19", fontWeight: 600, muted: true),
          MyText.bodyMedium("Per Month", muted: true),
          MySpacing.height(12),
          details()
        ],
      ),
    );
  }

  Widget premiumPricingDetail() {
    return Stack(
      children: [
        MyCard(
          paddingAll: 24,
          shadow: shadow(),
          height: 500,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              icon(Remix.edge_new_fill),
              MySpacing.height(12),
              MyText.bodyMedium("PREMIUM", color: contentTheme.primary),
              MySpacing.height(12),
              MyText.displaySmall("\$29", fontWeight: 600, muted: true),
              MyText.bodyMedium("Per Month", muted: true),
              MySpacing.height(12),
              details()
            ],
          ),
        ),
        Positioned(
          right: 20,
          top: 20,
          child: MyContainer(
            paddingAll: 8,
            color: contentTheme.primary,
            child: MyText.bodySmall("POPULAR", fontSize: 10, fontWeight: 600, color: contentTheme.onPrimary),
          ),
        ),
      ],
    );
  }

  Widget developerPricingDetail() {
    return MyCard(
      paddingAll: 24,
      shadow: shadow(),
      height: 500,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          icon(LucideIcons.disc_3),
          MySpacing.height(12),
          MyText.bodyMedium("DEVELOPER", color: contentTheme.primary),
          MySpacing.height(12),
          MyText.displaySmall("\$39", fontWeight: 600, muted: true),
          MyText.bodyMedium("Per Month", muted: true),
          MySpacing.height(12),
          details()
        ],
      ),
    );
  }

  Widget businessPricingDetail() {
    return MyCard(
      paddingAll: 24,
      shadow: shadow(),
      height: 500,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          icon(LucideIcons.cog),
          MySpacing.height(12),
          MyText.bodyMedium("BUSINESS", color: contentTheme.primary),
          MySpacing.height(12),
          MyText.displaySmall("\$49", fontWeight: 600, muted: true),
          MyText.bodyMedium("Per Month", muted: true),
          MySpacing.height(12),
          details()
        ],
      ),
    );
  }

  Widget details() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        detail("5 Projects"),
        MySpacing.height(20),
        detail("1 GB Storage"),
        MySpacing.height(20),
        detail("No Domain"),
        MySpacing.height(20),
        detail("1 User"),
        MySpacing.height(20),
        detail("24x7 Support"),
        MySpacing.height(20),
        MyContainer(
          onTap: () {},
          paddingAll: 12,
          color: contentTheme.primary.withAlpha(32),
          child: Center(child: MyText.bodyMedium("Signup Now", fontWeight: 600, color: contentTheme.primary)),
        )
      ],
    );
  }

  Widget icon(IconData icon) {
    return MyContainer(
      height: 70,
      width: 70,
      paddingAll: 0,
      borderRadiusAll: 8,
      color: contentTheme.primary.withAlpha(20),
      child: Icon(icon, size: 36, color: contentTheme.primary),
    );
  }

  Widget detail(String title) {
    return Row(
      children: [
        Icon(Remix.check_double_line, size: 16, color: contentTheme.primary),
        MySpacing.width(12),
        MyText.bodyMedium(title, fontWeight: 600, xMuted: true),
      ],
    );
  }

  MyShadow shadow() {
    return MyShadow(elevation: 1, position: MyShadowPosition.center);
  }
}
