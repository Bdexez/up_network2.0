import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/controller/dashboard/dashboard_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_flex.dart';
import 'package:henox/helpers/widgets/my_flex_item.dart';
import 'package:henox/helpers/widgets/my_list_extension.dart';
import 'package:henox/helpers/widgets/my_progress_bar.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/view/layouts/layout.dart';
import 'package:remixicon/remixicon.dart';
import 'package:syncfusion_flutter_charts/charts.dart';
import 'package:syncfusion_flutter_maps/maps.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> with SingleTickerProviderStateMixin, UIMixin {
   DashboardController controller = Get.put(DashboardController());


  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'dashboard_controller',
        builder: (controller) {
          return Column(
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium(
                      "Dashboard",
                      fontSize: 18,
                      fontWeight: 600,
                    ),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Apps'),
                        MyBreadcrumbItem(name: 'Dashboard'),
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
                        sizes: 'xxl-2.4 xl-2.4 lg-2.4 md-4 sm-4 xs-12',
                        child: stats("CUSTOMER", numberFormatter('54214'), LucideIcons.arrow_up, "2541", LucideIcons.users, contentTheme.success)),
                    MyFlexItem(
                        sizes: 'xxl-2.4 xl-2.4 lg-2.4 md-4 sm-4 xs-12',
                        child: stats(
                            "ORDERS", numberFormatter('7543'), LucideIcons.arrow_down, " 1.08%", LucideIcons.shopping_basket, contentTheme.info)),
                    MyFlexItem(
                        sizes: 'xxl-2.4 xl-2.4 lg-2.4 md-4 sm-4 xs-12',
                        child: stats("GROWTH", '+ 20.6%', LucideIcons.arrow_up, "4.87%", Remix.donut_chart_line, contentTheme.primary)),
                    MyFlexItem(
                        sizes: 'xxl-2.4 xl-2.4 lg-2.4 md-6 sm-6 xs-12',
                        child: stats("CONVERSATION", '9.62%', LucideIcons.arrow_up, "3.07%", Remix.pulse_line, contentTheme.warning)),
                    MyFlexItem(
                        sizes: 'xxl-2.4 xl-2.4 lg-2.4 md-6 sm-6 xs-12',
                        child: stats("BALANCE", '\$168.5k', LucideIcons.arrow_up, "18.34%", Remix.wallet_3_line, contentTheme.secondary)),
                    MyFlexItem(sizes: 'lg-4 md-6 sm-12', child: revenueChart()),
                    MyFlexItem(sizes: 'lg-4 md-6 sm-12', child: totalSales()),
                    MyFlexItem(sizes: 'lg-4 md-12', child: secondRevenue()),
                    MyFlexItem(sizes: 'lg-5', child: MyCard(
                      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
                      paddingAll: 24,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          MyText.titleMedium("Revenue By Location", fontWeight: 600),
                          MySpacing.height(20),
                          revenueByLocations(),
                        ],
                      ),
                    )),
                    MyFlexItem(sizes: 'lg-7', child: toSellingProduct()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget toSellingProduct() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 0,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: MySpacing.nBottom(24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                MyText.bodyMedium("Top Selling Product", fontWeight: 600),
                MyContainer(
                  paddingAll: 8,
                  color: contentTheme.success,
                  onTap: () {},
                  child: Row(
                    children: [
                      MyText.bodySmall("Export", fontWeight: 600, color: contentTheme.onPrimary),
                      MySpacing.width(8),
                      Icon(Remix.download_line, size: 16, color: contentTheme.onPrimary)
                    ],
                  ),
                )
              ],
            ),
          ),
          MySpacing.height(16),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              border: TableBorder.all(color: Colors.transparent),
              showBottomBorder: false,
              columns: [
                DataColumn(label: MyText.labelLarge('Product')),
                DataColumn(label: MyText.labelLarge('Price')),
                DataColumn(label: MyText.labelLarge('Orders')),
                DataColumn(label: MyText.labelLarge('Avl. Quantity')),
                DataColumn(label: MyText.labelLarge('Seller')),
              ],
              rows: controller.sellingProduct
                  .mapIndexed(
                    (index, data) => DataRow(
                      cells: [
                        DataCell(SizedBox(
                          width: 250,
                          child: Row(
                            children: [
                              MyContainer(
                                height: 32,
                                width: 32,
                                paddingAll: 0,
                                borderRadiusAll: 4,
                                clipBehavior: Clip.antiAliasWithSaveLayer,
                                child: Image.asset(data['image'], fit: BoxFit.cover),
                              ),
                              MySpacing.width(12),
                              MyText.bodyMedium(data['name']),
                            ],
                          ),
                        )),
                        DataCell(SizedBox(width: 100, child: MyText.bodyMedium(data['price']))),
                        DataCell(SizedBox(width: 100, child: MyText.bodyMedium(data['orders']))),
                        DataCell(SizedBox(width: 100, child: MyText.bodyMedium(data['avl_quantity']))),
                        DataCell(SizedBox(width: 100, child: MyText.bodyMedium(data['seller'])))
                      ],
                    ),
                  )
                  .toList(),
            ),
          ),
          Center(
            child: MyContainer(
              onTap: () {},
              child: MyText.bodyMedium("ViewAll", color: contentTheme.primary, fontWeight: 600, decoration: TextDecoration.underline),
            ),
          )
        ],
      ),
    );
  }

  Widget revenueByLocations() {
    if (controller.dataSource == null) {
      return MyContainer();
    }

    return SizedBox(
      height: 428,
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

  Widget secondRevenue() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            MyText.bodyMedium("Revenue", fontWeight: 600),
            buildPopUpMenu(offset: Offset(0, 30)),
          ]),
          MySpacing.height(20),
          Wrap(
            spacing: 20,
            runSpacing: 20,
            clipBehavior: Clip.antiAliasWithSaveLayer,
            crossAxisAlignment: WrapCrossAlignment.center,
            alignment: WrapAlignment.center,
            runAlignment: WrapAlignment.center,
            children: [
              secondRevenueData(contentTheme.primary, "\$3245", "This Month"),
              secondRevenueData(contentTheme.info, "\$490", "Last Week"),
              secondRevenueData(contentTheme.danger, "\$200", "Last Month"),
            ],
          ),
          MySpacing.height(20),
          secondRevenueChart()
        ],
      ),
    );
  }

  SfCartesianChart secondRevenueChart() {
    return SfCartesianChart(
        plotAreaBorderWidth: 0,
        margin: MySpacing.zero,
        legend: Legend(overflowMode: LegendItemOverflowMode.wrap, position: LegendPosition.bottom),
        primaryXAxis: NumericAxis(edgeLabelPlacement: EdgeLabelPlacement.shift, interval: 2, majorGridLines: MajorGridLines(width: 0)),
        primaryYAxis: NumericAxis(labelFormat: '{value}%', axisLine: AxisLine(width: 0), majorTickLines: MajorTickLines()),
        series: controller.secondRevenueChart(),
        tooltipBehavior: TooltipBehavior(enable: true));
  }

  Widget secondRevenueData(Color color, String title, subtitle) {
    return MyContainer(
      color: color.withAlpha(44),
      height: 100,
      width: 140,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [MyText.titleLarge(title, fontWeight: 700, color: color), MyText.bodyMedium(subtitle, fontWeight: 600, color: color)],
      ),
    );
  }

  Widget totalSales() {
    return MyCard(
      paddingAll: 24,
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
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
          SizedBox(height: 262, child: totalSalesChart()),
          totalSalesProcess("Brooklyn, New York", .7, "72k"),
          MySpacing.height(12),
          totalSalesProcess("The Castro, San Francisco", .4, "39k"),
          MySpacing.height(12),
          totalSalesProcess("Kovan, Singapore", .6, "61k"),
        ],
      ),
    );
  }

  Widget totalSalesProcess(String name, double progress, String salesCount) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        MyText.bodyMedium(name, fontWeight: 600, xMuted: true),
        MySpacing.height(8),
        Row(
          children: [
            Expanded(
                child: MyProgressBar(
                    width: 400, progress: progress, height: 4, radius: 4, inactiveColor: theme.dividerColor, activeColor: contentTheme.primary)),
            MySpacing.width(16),
            MyText.bodySmall(
              salesCount,
              fontWeight: 600,
              muted: true,
            ),
          ],
        ),
      ],
    );
  }

  SfCircularChart totalSalesChart() {
    return SfCircularChart(
        legend: Legend(overflowMode: LegendItemOverflowMode.wrap), series: controller.salesChart(), tooltipBehavior: controller.tooltipBehavior);
  }

  Widget revenueChart() {
    return MyCard(
      paddingAll: 24,
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              MyText.bodyMedium("Revenue", fontWeight: 600),
              buildPopUpMenu(),
            ],
          ),
          MySpacing.height(20),
          Wrap(
            spacing: 20,
            runSpacing: 20,
            clipBehavior: Clip.antiAliasWithSaveLayer,
            crossAxisAlignment: WrapCrossAlignment.center,
            alignment: WrapAlignment.center,
            runAlignment: WrapAlignment.center,
            children: [
              revenueData(contentTheme.info, "Revenue", "\$175k", Remix.creative_commons_nd_line),
              revenueData(contentTheme.primary, "Expenses", "\$610k", Remix.box_3_line),
              revenueData(contentTheme.danger, "Ratio", "6.9%", Remix.calendar_2_line),
            ],
          ),
          MySpacing.height(20),
          buildDefaultColumnChart(),
        ],
      ),
    );
  }

  SfCartesianChart buildDefaultColumnChart() {
    return SfCartesianChart(
      margin: MySpacing.zero,
      plotAreaBorderWidth: 0,
      primaryXAxis: CategoryAxis(majorGridLines: MajorGridLines(width: 0)),
      primaryYAxis: NumericAxis(axisLine: AxisLine(width: 0), majorTickLines: MajorTickLines(size: 0)),
      series: controller.getDefaultColumnSeries(),
      tooltipBehavior: controller.tooltipBehavior,
    );
  }

  Widget revenueData(Color color, String title, subtitle, IconData icon) {
    return MyContainer(
      color: color.withAlpha(44),
      height: 100,
      width: 140,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 18, color: color),
              MySpacing.width(8),
              MyText.bodyMedium(title, fontWeight: 600, color: color),
            ],
          ),
          MyText.titleLarge(subtitle, fontWeight: 700, color: color)
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

  Widget stats(String title, count, IconData arrow, String monthlyCount, IconData icon, Color color) {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      height: 150,
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
                          MySpacing.width(4),
                          MyText.bodySmall(monthlyCount, fontWeight: 600, fontSize: 10, color: contentTheme.onSuccess),
                        ],
                      ),
                    ),
                    MySpacing.width(8),
                    Expanded(
                      child: MyText.bodySmall("Since last month", overflow: TextOverflow.ellipsis, muted: true),
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
            color: color.withOpacity(.1),
            child: Icon(icon, color: color),
          )
        ],
      ),
    );
  }
}
