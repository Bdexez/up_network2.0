import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/controller/ui/with_preloader_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_flex.dart';
import 'package:henox/helpers/widgets/my_flex_item.dart';
import 'package:henox/helpers/widgets/my_progress_bar.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/view/layouts/layout.dart';
import 'package:remixicon/remixicon.dart';
import 'package:syncfusion_flutter_charts/charts.dart';
import 'package:syncfusion_flutter_maps/maps.dart';

class WithPreloaderScreen extends StatefulWidget {
  const WithPreloaderScreen({super.key});

  @override
  State<WithPreloaderScreen> createState() => _WithPreloaderScreenState();
}

class _WithPreloaderScreenState extends State<WithPreloaderScreen> with SingleTickerProviderStateMixin, UIMixin {
  late WithPreloaderController controller = Get.put(WithPreloaderController());

  @override
  Widget build(BuildContext context) {
    return GetBuilder(
      init: controller,
      tag: 'with_preloader_controller',
      builder: (controller) {
        if (controller.showLoading) {
          return Center(child: CircularProgressIndicator());
        }
        return Layout(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Preloader", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Pages'),
                        MyBreadcrumbItem(name: 'Preloader'),
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
                        sizes: 'xxl-2 xl-2 lg-4 md-6 xs-12',
                        child: preloaderStates(
                            "CUSTOMERS", numberFormatter('54214'), LucideIcons.arrow_up, "2541", LucideIcons.users, contentTheme.success)),
                    MyFlexItem(
                        sizes: 'xxl-2 xl-2 lg-4 md-6 xs-12',
                        child: preloaderStates(
                            "ORDERS", numberFormatter('7543'), LucideIcons.arrow_down, " 1.08%", LucideIcons.shopping_basket, contentTheme.info)),
                    MyFlexItem(
                        sizes: 'xxl-2 xl-2 lg-4 md-6 xs-12',
                        child: preloaderStates("REVENUE", "\$${numberFormatter('9254')}", LucideIcons.arrow_down, " 7.00%",
                            Remix.money_dollar_circle_line, contentTheme.danger)),
                    MyFlexItem(
                        sizes: 'xxl-2 xl-2 lg-4 md-6 xs-12',
                        child: preloaderStates("GROWTH", '+ 20.6%', LucideIcons.arrow_up, "4.87%", Remix.donut_chart_line, contentTheme.primary)),
                    MyFlexItem(
                        sizes: 'xxl-2 xl-2 lg-4 md-6 xs-12',
                        child: preloaderStates("CONVERSATION", '9.62%', LucideIcons.arrow_up, "3.07%", LucideIcons.users, contentTheme.warning)),
                    MyFlexItem(
                        sizes: 'xxl-2 xl-2 lg-4 md-6 xs-12',
                        child: preloaderStates("BALANCE", '\$168.5k', LucideIcons.arrow_up, "18.34%", Remix.wallet_3_line, contentTheme.secondary)),
                    MyFlexItem(sizes: 'lg-4 md-6 sm-12', child: totalSales()),
                    MyFlexItem(sizes: 'lg-8 md-6 sm-12', child: revenueChart()),
                    MyFlexItem(
                        sizes: 'lg-6',
                        child: MyCard(
                          shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
                          paddingAll: 24,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              MyText.titleMedium("Revenue By Location", fontWeight: 600),
                              MySpacing.height(20),
                              revenueByLocation(),
                            ],
                          ),
                        )),
                    MyFlexItem(sizes: 'lg-6', child: topSellingProducts()),
                    MyFlexItem(sizes: 'lg-4', child: channels()),
                    MyFlexItem(sizes: 'lg-4', child: socialMediaTraffic()),
                    MyFlexItem(sizes: 'lg-4', child: engagementOverview()),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget totalSales() {
    Widget totalSalesProcess(String name, double progress, String salesCount) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium(name, muted: true),
          MySpacing.height(8),
          Row(
            children: [
              Expanded(
                  child: MyProgressBar(
                      width: 400, progress: progress, height: 4, radius: 4, inactiveColor: theme.dividerColor, activeColor: contentTheme.primary)),
              MySpacing.width(16),
              MyText.bodyMedium(salesCount, fontWeight: 600),
            ],
          ),
        ],
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              MyText.bodyMedium("Total Sales", fontWeight: 600),
              buildPopUpMenu(offset: Offset(-5, 30)),
            ],
          ),
          MySpacing.height(12),
          SizedBox(height: 274, child: totalSalesChart()),
          totalSalesProcess("Brooklyn, New York", .7, "72k"),
          MySpacing.height(12),
          totalSalesProcess("The Castro, San Francisco", .4, "39k"),
          MySpacing.height(12),
          totalSalesProcess("Kovan, Singapore", .6, "61k"),
        ],
      ),
    );
  }

  Widget buildPopUpMenu({Offset? offset}) {
    return PopupMenuButton(
      offset: offset ?? Offset(-140, 30),
      clipBehavior: Clip.antiAliasWithSaveLayer,
      shape: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
      itemBuilder: (BuildContext context) => [
        PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Sales Report", fontWeight: 600)),
        PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Export Report", fontWeight: 600)),
        PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Profit", fontWeight: 600)),
        PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Action", fontWeight: 600)),
      ],
      child: Icon(LucideIcons.ellipsis_vertical, size: 16),
    );
  }

  SfCircularChart totalSalesChart() {
    return SfCircularChart(
        legend: Legend(overflowMode: LegendItemOverflowMode.wrap), series: controller.salesChart(), tooltipBehavior: controller.tooltipBehavior);
  }

  Widget revenueChart() {
    SfCartesianChart buildDefaultColumnChart() {
      return SfCartesianChart(
        plotAreaBorderWidth: 0,
        primaryXAxis: CategoryAxis(majorGridLines: MajorGridLines(width: 0)),
        primaryYAxis: NumericAxis(axisLine: AxisLine(width: 0), majorTickLines: MajorTickLines(size: 0)),
        series: controller.getDefaultColumnSeries(),
        tooltipBehavior: controller.tooltipBehavior,
      );
    }

    Widget revenueData(String title, subTitle, {IconData? icon}) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Remix.donut_chart_line, size: 14, color: contentTheme.secondary),
              MySpacing.width(8),
              MyText.bodyMedium(title, muted: true, color: contentTheme.secondary),
            ],
          ),
          MySpacing.height(8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              MyText.titleLarge(subTitle, color: contentTheme.secondary),
              MySpacing.width(icon != null ? 4 : 0),
              icon != null ? Icon(icon, color: icon == Remix.corner_right_up_line ? contentTheme.success : contentTheme.danger) : SizedBox(),
            ],
          ),
        ],
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 0,
      child: Column(
        children: [
          Padding(
            padding: MySpacing.nBottom(20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                MyText.bodyMedium("Revenue", fontWeight: 600),
                buildPopUpMenu(),
              ],
            ),
          ),
          MySpacing.height(12),
          Divider(),
          MySpacing.height(20),
          MyFlex(children: [
            MyFlexItem(sizes: 'lg-3', child: revenueData("Current Week", "\$1705.54")),
            MyFlexItem(sizes: 'lg-3', child: revenueData("Previous Week", "\$6,523.25", icon: Remix.corner_right_up_line)),
            MyFlexItem(sizes: 'lg-3', child: revenueData("Conversation", "8.27%")),
            MyFlexItem(sizes: 'lg-3', child: revenueData("Customers", "69k", icon: Remix.corner_right_down_line)),
          ]),
          MySpacing.height(20),
          Divider(),
          MySpacing.height(20),
          buildDefaultColumnChart(),
        ],
      ),
    );
  }

  Widget preloaderStates(String title, count, IconData arrow, String monthlyCount, IconData icon, Color color) {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      height: 140,
      paddingAll: 24,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                MyText.bodySmall(title, fontWeight: 600, maxLines: 1, muted: true),
                MyText.titleLarge(count, fontWeight: 700, xMuted: true, maxLines: 1),
                Row(
                  children: [
                    MyContainer(
                      color: arrow == LucideIcons.arrow_up ? contentTheme.success : contentTheme.danger,
                      padding: MySpacing.all(3),
                      child: Row(
                        children: [
                          Icon(arrow, size: 12, color: contentTheme.onSuccess),
                          MySpacing.width(3),
                          MyText.bodySmall(monthlyCount, fontWeight: 600, fontSize: 10, color: contentTheme.onSuccess)
                        ],
                      ),
                    ),
                    MySpacing.width(8),
                    Flexible(
                      child: MyText.bodySmall("Since last month", muted: true, overflow: TextOverflow.ellipsis),
                    )
                  ],
                )
              ],
            ),
          ),
          MyContainer(
              height: 40,
              width: 40,
              clipBehavior: Clip.antiAliasWithSaveLayer,
              paddingAll: 0,
              borderRadiusAll: 8,
              color: color,
              child: Icon(icon, color: contentTheme.onPrimary))
        ],
      ),
    );
  }

  Widget revenueByLocation() {
    if (controller.dataSource == null) {
      return MyContainer();
    }

    return SizedBox(
      height: 420,
      child: SfMaps(
        layers: [
          MapShapeLayer(
              source: controller.dataSource!,
              sublayers: [
                MapPolylineLayer(
                  polylines: List<MapPolyline>.generate(
                    controller.polylines.length,
                    (int index) {
                      return MapPolyline(points: controller.polylines[index].points, color: Colors.transparent, onTap: () {});
                    },
                  ).toSet(),
                ),
              ],
              zoomPanBehavior: controller.zoomPanBehavior),
        ],
      ),
    );
  }

  Widget topSellingProducts() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              MyText.titleMedium("Top Selling Product", fontWeight: 600),
              MyContainer(
                onTap: () {},
                paddingAll: 8,
                color: contentTheme.info,
                child: Row(
                  children: [
                    MyText.labelMedium("Export", fontWeight: 600, color: contentTheme.onInfo),
                    MySpacing.width(4),
                    Icon(LucideIcons.arrow_down_to_line, color: contentTheme.onInfo, size: 12)
                  ],
                ),
              )
            ],
          ),
          MySpacing.height(20),
          SingleChildScrollView(
            child: Column(
              children: [
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: DataTable(
                    headingRowColor: WidgetStateProperty.all(contentTheme.secondary.withAlpha(36)), // Header color
                    columns: <DataColumn>[
                      DataColumn(
                        label: MyText.bodyMedium('Product', fontWeight: 600),
                      ),
                      DataColumn(
                        label: SizedBox(
                          width: 100,
                          child: MyText.bodyMedium('Price', fontWeight: 600),
                        ),
                      ),
                      DataColumn(
                        label: SizedBox(
                          width: 70,
                          child: MyText.bodyMedium('Orders', fontWeight: 600),
                        ),
                      ),
                      DataColumn(
                        label: SizedBox(
                          width: 70,
                          child: MyText.bodyMedium('Avl. Quantity', fontWeight: 600),
                        ),
                      ),
                      DataColumn(
                        label: SizedBox(
                          width: 70,
                          child: MyText.bodyMedium('Seller', fontWeight: 600),
                        ),
                      ),
                    ],
                    rows: <DataRow>[
                      DataRow(
                        cells: <DataCell>[
                          DataCell(MyText.bodySmall('ASOS Ridley High Waist')),
                          DataCell(MyText.bodySmall('\$79.49')),
                          DataCell(MyText.bodySmall('82')),
                          DataCell(MyText.bodySmall('8,540')),
                          DataCell(MyText.bodySmall('Adidas')),
                        ],
                      ),
                      DataRow(
                        cells: <DataCell>[
                          DataCell(MyText.bodySmall('Marco Lightweight Shirt')),
                          DataCell(MyText.bodySmall('\$12.50')),
                          DataCell(MyText.bodySmall('58')),
                          DataCell(MyText.bodySmall('6,320')),
                          DataCell(MyText.bodySmall('Puma')),
                        ],
                      ),
                      DataRow(
                        cells: <DataCell>[
                          DataCell(MyText.bodySmall('Half Sleeve Shirt')),
                          DataCell(MyText.bodySmall('\$9.99')),
                          DataCell(MyText.bodySmall('254')),
                          DataCell(MyText.bodySmall('10,258')),
                          DataCell(MyText.bodySmall('Nike')),
                        ],
                      ),
                      DataRow(
                        cells: <DataCell>[
                          DataCell(MyText.bodySmall('Lightweight Jacket')),
                          DataCell(MyText.bodySmall('\$69.99')),
                          DataCell(MyText.bodySmall('560')),
                          DataCell(MyText.bodySmall('1,020')),
                          DataCell(MyText.bodySmall('Puma')),
                        ],
                      ),
                      DataRow(
                        cells: <DataCell>[
                          DataCell(MyText.bodySmall('Marco Sport Shoes')),
                          DataCell(MyText.bodySmall('\$119.99')),
                          DataCell(MyText.bodySmall('75')),
                          DataCell(MyText.bodySmall('357')),
                          DataCell(MyText.bodySmall('Adidas')),
                        ],
                      ),
                      DataRow(
                        cells: <DataCell>[
                          DataCell(MyText.bodySmall("Custom Women's T-shirts")),
                          DataCell(MyText.bodySmall('\$45.00')),
                          DataCell(MyText.bodySmall('85')),
                          DataCell(MyText.bodySmall('135')),
                          DataCell(MyText.bodySmall('Branded')),
                        ],
                      ),
                      DataRow(
                        cells: <DataCell>[
                          DataCell(MyText.bodySmall('Marco Sport Shoes')),
                          DataCell(MyText.bodySmall('\$119.99')),
                          DataCell(MyText.bodySmall('75')),
                          DataCell(MyText.bodySmall('357')),
                          DataCell(MyText.bodySmall('Adidas')),
                        ],
                      ),
                    ],
                  ),
                ),
                InkWell(onTap: () {}, child: MyText.bodySmall("View All",color: contentTheme.primary, fontWeight: 600, decoration: TextDecoration.underline)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget channels() {
    TableRow buildTableRow(String channel, int visits, double progress, Color progressColor) {
      return TableRow(
        children: [
          Padding(padding: MySpacing.xy(20, 12), child: MyText.bodySmall(channel)),
          Padding(
            padding: MySpacing.xy(20, 12),
            child: MyText.bodySmall(visits.toString()),
          ),
          Padding(
            padding: MySpacing.xy(20, 12),
            child: LinearProgressIndicator(value: progress, backgroundColor: contentTheme.secondary.withAlpha(36), color: progressColor, minHeight: 4),
          ),
        ],
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              MyText.titleMedium("Channels", fontWeight: 600),
              MyContainer(
                onTap: () {},
                paddingAll: 8,
                color: contentTheme.success,
                child: Row(
                  children: [
                    MyText.labelMedium("Export", fontWeight: 600, color: contentTheme.onInfo),
                    MySpacing.width(4),
                    Icon(LucideIcons.arrow_down_to_line, color: contentTheme.onInfo, size: 12),
                  ],
                ),
              )
            ],
          ),
          MySpacing.height(20),
          SingleChildScrollView(
            child: Column(
              children: [
                Table(
                  columnWidths: {
                    0: FlexColumnWidth(2),
                    1: FlexColumnWidth(1),
                    2: FlexColumnWidth(2),
                  },
                  children: [
                    TableRow(
                      decoration: BoxDecoration(
                        color: contentTheme.secondary.withAlpha(36),
                      ),
                      children: [
                        Padding(padding: MySpacing.xy(20, 8), child: MyText.bodyMedium('Channel', fontWeight: 600)),
                        Padding(padding: MySpacing.xy(20, 8), child: MyText.bodyMedium('Visits', fontWeight: 600)),
                        Padding(padding: MySpacing.xy(20, 8), child: MyText.bodyMedium('Progress', fontWeight: 600)),
                      ],
                    ),
                    buildTableRow("Direct", 2050, 0.65, Colors.blue),
                    buildTableRow("Organic Search", 1405, 0.45, Colors.lightBlue),
                    buildTableRow("Referral", 750, 0.30, Colors.orange),
                    buildTableRow("Social", 540, 0.25, Colors.red),
                    buildTableRow("Other", 8965, 0.30, Colors.green),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget socialMediaTraffic() {
    TableRow buildTableRow(String channel, int visits, double progress) {
      return TableRow(
        children: [
          Padding(padding: MySpacing.xy(20, 12), child: MyText.bodySmall(channel)),
          Padding(padding: MySpacing.xy(20, 12), child: MyText.bodySmall(visits.toString())),
          Padding(padding: MySpacing.xy(20, 12), child: LinearProgressIndicator(value: progress, backgroundColor: contentTheme.secondary.withAlpha(36), color: contentTheme.primary, minHeight: 4)),
        ],
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              MyText.titleMedium("Social Medai Traffic", fontWeight: 600),
              MyContainer(
                onTap: () {},
                paddingAll: 8,
                color: contentTheme.success,
                child: Row(
                  children: [MyText.labelMedium("Export", fontWeight: 600, color: contentTheme.onInfo), MySpacing.width(4), Icon(LucideIcons.arrow_down_to_line, color: contentTheme.onInfo, size: 12)],
                ),
              )
            ],
          ),
          MySpacing.height(20),
          SingleChildScrollView(
            child: Column(
              children: [
                Table(
                  columnWidths: {
                    0: FlexColumnWidth(2),
                    1: FlexColumnWidth(1),
                    2: FlexColumnWidth(2)
                  },
                  children: [
                    TableRow(
                      decoration: BoxDecoration(color: contentTheme.secondary.withAlpha(36)),
                      children: [
                        Padding(padding: MySpacing.xy(20, 8), child: MyText.bodyMedium('Network', fontWeight: 600)),
                        Padding(padding: MySpacing.xy(20, 8), child: MyText.bodyMedium('Visits', fontWeight: 600)),
                        Padding(padding: MySpacing.xy(20, 8), child: MyText.bodyMedium('Progress', fontWeight: 600)),
                      ],
                    ),
                    buildTableRow("Facebook", 2250, 0.65),
                    buildTableRow("Instagram", 1501, 0.45),
                    buildTableRow("Twitter", 750, 0.30),
                    buildTableRow("LinkedIn", 540, 0.25),
                    buildTableRow("Other", 13851, 0.60)
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget engagementOverview() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              MyText.titleMedium("Engagement Overview", fontWeight: 600),
              MyContainer(
                onTap: () {},
                paddingAll: 8,
                color: contentTheme.success,
                child: Row(
                  children: [
                    MyText.labelMedium("Export", fontWeight: 600, color: contentTheme.onInfo),
                    MySpacing.width(4),
                    Icon(LucideIcons.arrow_down_to_line, color: contentTheme.onInfo, size: 12),
                  ],
                ),
              )
            ],
          ),
          MySpacing.height(20),
          SingleChildScrollView(
            child: DataTable(
              headingRowColor: WidgetStateColor.resolveWith((states) => contentTheme.secondary.withAlpha(36)),
              dividerThickness: .4,
              headingRowHeight: 36,
              columns: [
                DataColumn(label: SizedBox(width: 130, child: MyText.bodyMedium('Duration (Secs)', fontWeight: 600))),
                DataColumn(label: SizedBox(width: 100, child: MyText.bodyMedium('Sessions', fontWeight: 600))),
                DataColumn(label: SizedBox(width: 100, child: MyText.bodyMedium('Views', fontWeight: 600))),
              ],
              rows: [
                DataRow(cells: [
                  DataCell(MyText.bodySmall('0-30')),
                  DataCell(MyText.bodySmall('2,250')),
                  DataCell(MyText.bodySmall('4,250'))
                ]),
                DataRow(cells: [
                  DataCell(MyText.bodySmall('31-60')),
                  DataCell(MyText.bodySmall('1,501')),
                  DataCell(MyText.bodySmall('2,050'))
                ]),
                DataRow(cells: [
                  DataCell(MyText.bodySmall('61-120')),
                  DataCell(MyText.bodySmall('750')),
                  DataCell(MyText.bodySmall('1,600'))
                ]),
                DataRow(cells: [
                  DataCell(MyText.bodySmall('121-240')),
                  DataCell(MyText.bodySmall('540')),
                  DataCell(MyText.bodySmall('1,040'))
                ]),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
