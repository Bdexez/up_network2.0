import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/widgets_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/utils/utils.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_button.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_flex.dart';
import 'package:henox/helpers/widgets/my_flex_item.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/helpers/widgets/my_text_style.dart';
import 'package:henox/images.dart';
import 'package:henox/model/chat_modal.dart';
import 'package:henox/view/layouts/layout.dart';
import 'package:remixicon/remixicon.dart';
import 'package:syncfusion_flutter_charts/charts.dart';

class WidgetsScreen extends StatefulWidget {
  const WidgetsScreen({super.key});

  @override
  State<WidgetsScreen> createState() => _WidgetsScreenState();
}

class _WidgetsScreenState extends State<WidgetsScreen> with UIMixin {
  WidgetsController controller = Get.put(WidgetsController());
  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'widgets_controller',
        builder: (controller) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Widgets", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Widgets'),
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
                        sizes: 'xxl-2 xl-2 lg-4 md-6 sm-6',
                        child:
                            firstStats("CUSTOMER", "54,214", Remix.arrow_up_line, '2,541', Remix.group_line, backgroundColor: contentTheme.purple)),
                    MyFlexItem(
                        sizes: 'xxl-2 xl-2 lg-4 md-6 sm-6',
                        child: firstStats("ORDERS", "7,543", Remix.arrow_down_line, '1.08%', Remix.shopping_basket_line,
                            backgroundColor: contentTheme.pink)),
                    MyFlexItem(
                        sizes: 'xxl-2 xl-2 lg-4 md-6 sm-6',
                        child: firstStats("REVENUE", "\$9,254", Remix.arrow_down_line, '7.00%', Remix.money_dollar_circle_line,
                            backgroundColor: contentTheme.success)),
                    MyFlexItem(
                        sizes: 'xxl-2 xl-2 lg-4 md-6 sm-6',
                        child:
                            firstStats("GROWTH", "+20.6%", Remix.arrow_up_line, '4.87%', Remix.donut_chart_line, iconBgColor: contentTheme.primary)),
                    MyFlexItem(
                        sizes: 'xxl-2 xl-2 lg-4 md-6 sm-6',
                        child:
                            firstStats("CONVERSATION", "9.62%", Remix.arrow_up_line, '3.07%', Remix.pulse_line, iconBgColor: contentTheme.warning)),
                    MyFlexItem(
                        sizes: 'xxl-2 xl-2 lg-4 md-6 sm-6',
                        child: firstStats("BALANCE", "18.34%", Remix.arrow_up_line, '\$168.5k', Remix.wallet_3_line,
                            iconBgColor: contentTheme.secondary)),
                    MyFlexItem(
                        sizes: 'xxl-3 xl-3 md-6 sm-6',
                        child: secondStats("Revenue", "\$6,254", '7.00%', Remix.bit_coin_line, iconBgColor: contentTheme.danger, border: 100)),
                    MyFlexItem(
                        sizes: 'xxl-3 xl-3 md-6 sm-6',
                        child: secondStats("Growth", "+30.56%", '4.87%', Remix.arrow_up_circle_line, iconBgColor: contentTheme.primary)),
                    MyFlexItem(
                        sizes: 'xxl-3 xl-3 md-6 sm-6',
                        child: secondStats("Customer", "36,254", '5.27%', Remix.user_voice_line,
                            backgroundColor: contentTheme.success, iconColor: contentTheme.success)),
                    MyFlexItem(
                        sizes: 'xxl-3 xl-3 md-6 sm-6',
                        child: secondStats("Orders", "\$10,245", '17.26%', Remix.shopping_basket_line,
                            backgroundColor: contentTheme.primary, iconColor: contentTheme.primary)),
                    MyFlexItem(
                        sizes: 'xxl-2.4 xl-2.4 lg-4 md-6 sm-6',
                        child: thirdStats("Customer", "54,214", Remix.arrow_up_line, '2,541', Remix.group_line, iconBgColor: contentTheme.info)),
                    MyFlexItem(
                        sizes: 'xxl-2.4 xl-2.4 lg-4 md-6 sm-6',
                        child: thirdStats("Order", "7,543", Remix.arrow_down_line, '5.38%', Remix.shopping_cart_2_line,
                            iconBgColor: contentTheme.warning)),
                    MyFlexItem(
                        sizes: 'xxl-2.4 xl-2.4 lg-4 md-6 sm-6',
                        child: thirdStats("Revenue", "\$9,254", Remix.arrow_down_line, '7.00%', Remix.exchange_dollar_line,
                            iconBgColor: contentTheme.primary)),
                    MyFlexItem(
                        sizes: 'xxl-2.4 xl-2.4 lg-6 md-6 sm-6',
                        child:
                            thirdStats("Growth", "20.06%", Remix.arrow_up_line, '4.87%', Remix.line_chart_line, iconBgColor: contentTheme.success)),
                    MyFlexItem(
                        sizes: 'xxl-2.4 xl-2.4 lg-6 md-12 sm-12',
                        child: thirdStats("Conversation", "9.62%", Remix.arrow_up_line, '5.27%', Remix.dashboard_2_line,
                            iconBgColor: contentTheme.danger)),
                    MyFlexItem(
                        sizes: 'xl-3 lg-6 md-6',
                        child: fourStats("Campaign Sent", "9,184", Remix.arrow_up_line, '3.27%', columnChart(contentTheme.primary))),
                    MyFlexItem(sizes: 'xl-3 lg-6 md-6', child: fourStats("New Leads", "3,254", Remix.arrow_up_line, '5.38%', lineChart())),
                    MyFlexItem(
                        sizes: 'xl-3 lg-6 md-6', child: fourStats("Deals", "861", Remix.arrow_up_line, '4.87%', columnChart(contentTheme.danger))),
                    MyFlexItem(sizes: 'xl-3 lg-6 md-6', child: fourStats("Booked Revenue", "\$253k", Remix.arrow_up_line, '11.7%', lineChart())),
                    MyFlexItem(sizes: 'lg-4 md-6', child: chat()),
                    MyFlexItem(sizes: 'lg-4 md-6', child: userDetails()),
                    MyFlexItem(sizes: 'lg-4', child: todo()),
                    MyFlexItem(sizes: 'lg-4 md-4', child: message()),
                    MyFlexItem(sizes: 'lg-4 md-4', child: recentActivity()),
                    MyFlexItem(sizes: 'lg-4 md-4', child: transactions()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget firstStats(String title, String subTitle, IconData trendingIcon, String monthGrowth, IconData icon,
      {Color? backgroundColor, Color? iconBgColor}) {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      height: 150,
      color: backgroundColor,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                MyText.bodyMedium(title, muted: true, fontWeight: 600, color: backgroundColor == null ? null : contentTheme.onPrimary),
                MyText.titleLarge(subTitle, fontWeight: 600, color: backgroundColor == null ? null : contentTheme.onPrimary),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    MyContainer(
                      paddingAll: 2,
                      color: backgroundColor != null ? contentTheme.onPrimary.withAlpha(36) : contentTheme.success,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(trendingIcon, size: 12, color: contentTheme.onPrimary),
                          MySpacing.width(4),
                          MyText.labelSmall(monthGrowth, fontWeight: 600, color: contentTheme.onPrimary),
                        ],
                      ),
                    ),
                    MySpacing.width(4),
                    Expanded(
                      child: MyText.labelSmall("Since last month",
                          muted: true, overflow: TextOverflow.ellipsis, color: backgroundColor == null ? null : contentTheme.onPrimary),
                    ),
                  ],
                )
              ],
            ),
          ),
          MyCard(
            borderRadiusAll: 8,
            paddingAll: 8,
            color: backgroundColor != null ? contentTheme.onPrimary.withAlpha(70) : iconBgColor,
            child: Icon(icon, size: 20, color: contentTheme.onPrimary),
          )
        ],
      ),
    );
  }

  Widget secondStats(String title, String subTitle, String monthGrowth, IconData icon,
      {Color? backgroundColor, Color? iconBgColor, double? border, Color? iconColor}) {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      height: 150,
      color: backgroundColor,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                MyText.bodyMedium(title, muted: true, color: backgroundColor == null ? null : Colors.white),
                MyText.titleLarge(subTitle, muted: true, fontWeight: 600, color: backgroundColor == null ? null : Colors.white),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    MyContainer(
                      padding: MySpacing.xy(4, 3),
                      color: backgroundColor != null ? contentTheme.onPrimary.withAlpha(36) : contentTheme.info,
                      child: MyText.labelSmall(monthGrowth, fontWeight: 600, color: Colors.white),
                    ),
                    MySpacing.width(4),
                    Expanded(
                      child: MyText.bodyMedium("Since last month",
                          xMuted: true, overflow: TextOverflow.ellipsis, color: backgroundColor == null ? null : Colors.white),
                    ),
                  ],
                )
              ],
            ),
          ),
          MyCard(
            borderRadiusAll: border ?? 4,
            paddingAll: 8,
            color: iconBgColor,
            child: Icon(icon, size: 20, color: iconColor ?? Colors.white),
          )
        ],
      ),
    );
  }

  Widget thirdStats(String title, String subTitle, IconData trendingIcon, String monthGrowth, IconData icon, {Color? iconBgColor}) {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      height: 150,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                MyText.bodyMedium(title, muted: true, fontWeight: 600),
                MyText.titleLarge(subTitle, fontWeight: 700, xMuted: true),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          trendingIcon,
                          size: 12,
                          color: trendingIcon == Remix.arrow_up_line ? contentTheme.success : contentTheme.danger,
                        ),
                        MySpacing.width(4),
                        MyText.bodyMedium(monthGrowth,
                            muted: true, color: trendingIcon == Remix.arrow_up_line ? contentTheme.success : contentTheme.danger),
                      ],
                    ),
                    MySpacing.width(4),
                    Expanded(
                      child: MyText.bodyMedium(
                        "Since last month",
                        muted: true,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                )
              ],
            ),
          ),
          MyContainer(
            borderRadiusAll: 2,
            paddingAll: 8,
            color: iconBgColor,
            child: Icon(icon, size: 20, color: contentTheme.onPrimary),
          )
        ],
      ),
    );
  }

  Widget fourStats(String title, String subTitle, IconData trendingIcon, String monthGrowth, Widget chart) {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      height: 150,
      child: Row(
        children: [
          Expanded(
            child: SizedBox(
              height: 140,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  MyText.titleMedium(title, fontWeight: 600, maxLines: 1),
                  MyText.bodyLarge(subTitle, fontWeight: 600, maxLines: 2),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        trendingIcon,
                        size: 12,
                        color: trendingIcon == Remix.arrow_up_line ? contentTheme.success : contentTheme.danger,
                      ),
                      MySpacing.width(4),
                      Expanded(
                        child: MyText.labelSmall(monthGrowth,
                            maxLines: 1, fontWeight: 600, color: trendingIcon == Remix.arrow_up_line ? contentTheme.success : contentTheme.danger),
                      ),
                    ],
                  )
                ],
              ),
            ),
          ),
          Expanded(child: chart)
        ],
      ),
    );
  }

  SfCartesianChart columnChart(Color color) {
    return SfCartesianChart(
      plotAreaBorderWidth: 0,
      primaryXAxis: CategoryAxis(
        isVisible: false,
        majorGridLines: const MajorGridLines(width: 0),
        labelStyle: const TextStyle(fontSize: 0),
      ),
      primaryYAxis: NumericAxis(isVisible: false, labelStyle: const TextStyle(fontSize: 0), majorGridLines: const MajorGridLines(width: 0)),
      series: [
        ColumnSeries<ChartSampleData, int>(
          width: 0.5,
          color: color,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(12),
            topRight: Radius.circular(12),
          ),
          dataSource: controller.columnChartData,
          xValueMapper: (ChartSampleData data, _) => data.x,
          yValueMapper: (ChartSampleData data, _) => data.y,
        ),
      ],
    );
  }

  SfCartesianChart lineChart() {
    return SfCartesianChart(
      plotAreaBorderWidth: 0,
      primaryXAxis: CategoryAxis(
        isVisible: false,
        majorGridLines: const MajorGridLines(width: 0),
        labelStyle: const TextStyle(fontSize: 0),
      ),
      primaryYAxis: NumericAxis(isVisible: false, labelStyle: const TextStyle(fontSize: 0), majorGridLines: const MajorGridLines(width: 0)),
      series: controller.lineChartData(),
    );
  }

  Widget chat() {
    Widget sendMessage() {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Expanded(
            child: TextFormField(
              maxLines: 1,
              minLines: 1,
              textInputAction: TextInputAction.send,
              controller: controller.messageController,
              clipBehavior: Clip.antiAliasWithSaveLayer,
              style: MyTextStyle.bodyMedium(fontWeight: 600),
              decoration: InputDecoration(
                isDense: true,
                contentPadding: MySpacing.xy(12, 16),
                hintText: "Send message...",
                hintStyle: MyTextStyle.bodyMedium(fontWeight: 600),
                border: outlineInputBorder,
                focusedBorder: outlineInputBorder,
                disabledBorder: outlineInputBorder,
                enabledBorder: outlineInputBorder,
              ),
            ),
          ),
          MySpacing.width(12),
          MyContainer.transparent(
            child: Icon(LucideIcons.paperclip, size: 20),
          ),
          MyContainer(
            paddingAll: 12,
            onTap: () => controller.sendMessage(),
            child: Icon(LucideIcons.send, size: 20),
          ),
        ],
      );
    }

    Widget buildPopUpMenu() {
      return PopupMenuButton(
        offset: Offset(-100, 30),
        clipBehavior: Clip.antiAliasWithSaveLayer,
        shape: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
        itemBuilder: (BuildContext context) => [
          PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Setting", fontWeight: 600)),
          PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Action", fontWeight: 600)),
        ],
        child: Icon(LucideIcons.ellipsis_vertical, size: 16),
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [MyText.bodyMedium("Chat", fontWeight: 600), buildPopUpMenu()],
          ),
          MySpacing.height(20),
          Column(
            children: [
              Padding(
                padding: MySpacing.bottom(12),
                child: SizedBox(
                  height: 300,
                  child: ListView.separated(
                      padding: MySpacing.x(16),
                      shrinkWrap: true,
                      controller: controller.scrollController,
                      itemCount: (controller.selectChat?.messages ?? []).length,
                      itemBuilder: (context, index) {
                        final message = (controller.selectChat?.messages ?? [])[index];
                        final isSent = message.fromMe == true;
                        final theme = isSent ? contentTheme.primary : contentTheme.secondary.withAlpha(32);
                        return Row(
                          mainAxisAlignment: isSent ? MainAxisAlignment.end : MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (!isSent)
                              Column(
                                children: [
                                  MyContainer.rounded(
                                    height: 32,
                                    width: 32,
                                    paddingAll: 0,
                                    child: Image.asset(controller.selectChat!.image, fit: BoxFit.cover),
                                  ),
                                  mediumHeight,
                                  MyText.bodySmall('${Utils.getTimeStringFromDateTime(message.sendAt, showSecond: false)}',
                                      fontSize: 8, muted: true, fontWeight: 600),
                                ],
                              ),
                            MySpacing.width(12),
                            Expanded(
                              child: Wrap(
                                alignment: isSent ? WrapAlignment.end : WrapAlignment.start,
                                children: [
                                  MyContainer(
                                      padding: EdgeInsets.all(8),
                                      margin: MySpacing.only(left: isSent ? Get.size.width / 16 : 0),
                                      color: theme,
                                      child: Column(
                                        crossAxisAlignment: isSent ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          !isSent
                                              ? MyText.bodyMedium(controller.selectChat!.firstName, color: contentTheme.secondary, fontWeight: 600)
                                              : MyText.bodyMedium("Tosha Minner", color: contentTheme.onPrimary),
                                          MySpacing.height(4),
                                          MyText.bodySmall(message.message,
                                              muted: true,
                                              fontWeight: 600,
                                              color: isSent ? contentTheme.onPrimary : contentTheme.secondary,
                                              overflow: TextOverflow.clip),
                                        ],
                                      )),
                                ],
                              ),
                            ),
                            MySpacing.width(12),
                            if (controller.selectChat != null && isSent)
                              Column(
                                children: [
                                  MyContainer.rounded(
                                    height: 32,
                                    width: 32,
                                    paddingAll: 0,
                                    child: Image.asset(Images.avatars[6], fit: BoxFit.cover),
                                  ),
                                  MySpacing.height(4),
                                  MyText.bodySmall('${Utils.getTimeStringFromDateTime(message.sendAt, showSecond: false)}',
                                      fontSize: 8, muted: true, fontWeight: 600),
                                ],
                              ),
                          ],
                        );
                      },
                      separatorBuilder: (context, index) => MySpacing.height(12)),
                ),
              ),
              sendMessage(),
            ],
          )
        ],
      ),
    );
  }

  Widget userDetails() {
    return Column(
      children: [
        MyCard(
          shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
          paddingAll: 24,
          child: Row(
            children: [
              MyContainer.roundBordered(
                paddingAll: 4,
                child: MyContainer.rounded(
                  paddingAll: 0,
                  height: 100,
                  width: 100,
                  child: Image.asset(Images.avatars[1]),
                ),
              ),
              MySpacing.width(20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    MyText.bodyMedium("Michael Franklin", fontWeight: 600, muted: true),
                    MyText.bodySmall("Authorised Brand Seller", fontWeight: 600, xMuted: true),
                    MySpacing.height(20),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              MyText.bodyMedium("\$25,184", fontWeight: 700, muted: true, overflow: TextOverflow.ellipsis),
                              MySpacing.height(4),
                              MyText.bodySmall("Total Revenue", xMuted: true, overflow: TextOverflow.ellipsis),
                            ],
                          ),
                        ),
                        MySpacing.width(20),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              MyText.bodyMedium("5482", fontWeight: 700, muted: true, overflow: TextOverflow.ellipsis),
                              MySpacing.height(4),
                              MyText.bodySmall("Number of Orders", xMuted: true, overflow: TextOverflow.ellipsis),
                            ],
                          ),
                        ),
                      ],
                    )
                  ],
                ),
              )
            ],
          ),
        ),
        MySpacing.height(20),
        MyCard(
          shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
          paddingAll: 24,
          color: contentTheme.info,
          width: double.infinity,
          child: Column(
            children: [
              MyText.bodyLarge("Enhance your Campaign for better outreach", muted: true, color: contentTheme.onInfo),
              MySpacing.height(20),
              SvgPicture.asset('assets/images/svg/startman.svg', fit: BoxFit.cover, height: 131, width: 131),
              MySpacing.height(20),
              MyContainer(
                  borderRadiusAll: 100,
                  color: Colors.white,
                  padding: MySpacing.xy(8, 6),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      MyText.labelMedium("Know more", fontWeight: 600, muted: true),
                      MySpacing.width(6),
                      Icon(LucideIcons.arrow_right, size: 16),
                    ],
                  ))
            ],
          ),
        ),
      ],
    );
  }

  Widget todo() {
    Widget buildPopUpMenu() {
      return PopupMenuButton(
        offset: Offset(-10, 30),
        clipBehavior: Clip.antiAliasWithSaveLayer,
        shape: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
        itemBuilder: (BuildContext context) => [
          PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Setting", fontWeight: 600)),
          PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Action", fontWeight: 600)),
        ],
        child: Icon(LucideIcons.ellipsis_vertical, size: 16),
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [MyText.bodyMedium("TODO", fontWeight: 600), buildPopUpMenu()],
          ),
          MySpacing.height(20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              MyText.bodyMedium('${controller.todos.length} remaining', fontWeight: 600, xMuted: true),
              MyButton(
                onPressed: controller.archiveTodos,
                elevation: 0,
                backgroundColor: contentTheme.primary,
                borderRadiusAll: 8,
                child: MyText.bodyMedium('Archive', fontWeight: 600, color: contentTheme.onPrimary),
              ),
            ],
          ),
          SizedBox(
              height: 276,
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: controller.todos.length,
                itemBuilder: (context, index) {
                  final todo = controller.todos[index];
                  return Row(
                    children: [
                      Theme(data: ThemeData(), child: Checkbox(value: todo.isDone, onChanged: (value) => controller.toggleTodoStatus(index))),
                      MySpacing.width(12),
                      MyText.bodyMedium(
                        todo.title,
                        style: TextStyle(
                          decoration: todo.isDone ? TextDecoration.lineThrough : null,
                        ),
                      )
                    ],
                  );
                },
              )),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: controller.todoTEController,
                  style: MyTextStyle.labelMedium(),
                  decoration: InputDecoration(
                      hintText: 'Add new todo',
                      hintStyle: MyTextStyle.labelMedium(),
                      border: OutlineInputBorder(),
                      isDense: true,
                      isCollapsed: true,
                      contentPadding: MySpacing.all(16)),
                ),
              ),
              MySpacing.width(12),
              MyButton(
                onPressed: () {
                  controller.addTodo(controller.todoTEController.text);
                  controller.todoTEController.clear();
                },
                backgroundColor: contentTheme.primary,
                elevation: 0,
                borderRadiusAll: 4,
                padding: MySpacing.all(19),
                child: MyText.bodyMedium('Add', fontWeight: 600, color: contentTheme.onPrimary),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget message() {
    Widget buildPopUpMenu() {
      return PopupMenuButton(
        offset: Offset(-10, 30),
        clipBehavior: Clip.antiAliasWithSaveLayer,
        shape: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
        itemBuilder: (BuildContext context) => [
          PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Setting", fontWeight: 600)),
          PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Action", fontWeight: 600)),
        ],
        child: Icon(LucideIcons.ellipsis_vertical, size: 16),
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [MyText.bodyMedium("Messages", fontWeight: 600), buildPopUpMenu()],
          ),
          MySpacing.height(20),
          SizedBox(
            height: 334,
            child: ListView.separated(
              shrinkWrap: true,
              clipBehavior: Clip.antiAliasWithSaveLayer,
              itemCount: controller.chat.length,
              padding: MySpacing.only(right: 8),
              itemBuilder: (context, index) {
                ChatModel chat = controller.chat[index];
                String name = chat.firstName;
                return Row(
                  children: [
                    MyContainer.rounded(
                      paddingAll: 0,
                      height: 44,
                      width: 44,
                      child: Image.asset(chat.image),
                    ),
                    MySpacing.width(12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          MyText.bodyMedium(name, fontWeight: 600, maxLines: 1, overflow: TextOverflow.ellipsis),
                          MySpacing.height(4),
                          MyText.bodySmall(chat.messages[0].message, overflow: TextOverflow.ellipsis, muted: true),
                        ],
                      ),
                    ),
                    MySpacing.width(20),
                    MyText.bodyMedium("Reply", muted: true, color: contentTheme.primary)
                  ],
                );
              },
              separatorBuilder: (context, index) => Divider(height: 28),
            ),
          ),
        ],
      ),
    );
  }

  Widget recentActivity() {
    Widget timelineItem(
        {required IconData icon,
        Color? titleColor,
        required String title,
        required String subtitle,
        required String time,
        required Color iconColor}) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            backgroundColor: iconColor.withOpacity(0.2),
            child: Icon(icon, color: iconColor),
          ),
          MySpacing.width(20),
          Expanded(
            child: SizedBox(
              height: 68,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  MyText.bodyMedium(title, fontWeight: 600, muted: true, color: titleColor, overflow: TextOverflow.ellipsis),
                  MyText.bodySmall(subtitle, muted: true, overflow: TextOverflow.ellipsis),
                  MyText.bodySmall(time, muted: true, overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
          ),
        ],
      );
    }

    Widget buildPopUpMenu() {
      return PopupMenuButton(
        offset: Offset(-10, 30),
        clipBehavior: Clip.antiAliasWithSaveLayer,
        shape: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
        itemBuilder: (BuildContext context) => [
          PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Setting", fontWeight: 600)),
          PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Action", fontWeight: 600)),
        ],
        child: Icon(LucideIcons.ellipsis_vertical, size: 16),
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [MyText.bodyMedium('Recent Activity', fontWeight: 600), buildPopUpMenu()],
          ),
          MySpacing.height(20),
          Column(
            children: [
              timelineItem(
                  icon: Icons.upload_file,
                  titleColor: contentTheme.info,
                  title: 'You sold an item',
                  subtitle: 'Paul Burgess just purchased “Henox - Admin Dashboard”!',
                  time: '5 minutes ago',
                  iconColor: Colors.blue),
              MySpacing.height(20),
              timelineItem(
                  icon: Icons.rocket_launch,
                  titleColor: contentTheme.primary,
                  title: 'Product on the Bootstrap Market',
                  subtitle: 'Dave Gamache added Admin Dashboard',
                  time: '30 minutes ago',
                  iconColor: Colors.deepPurple),
              MySpacing.height(20),
              timelineItem(
                  icon: Icons.chat,
                  titleColor: contentTheme.info,
                  title: 'Robert Delaney',
                  subtitle: 'Sent you message "Are you there?"',
                  time: '2 hours ago',
                  iconColor: Colors.green),
              MySpacing.height(20),
              timelineItem(
                  icon: Icons.upload_file,
                  titleColor: contentTheme.primary,
                  title: 'Audrey Tobey',
                  subtitle: 'Uploaded a photo "Error.jpg"',
                  time: '14 hours ago',
                  iconColor: Colors.orange),
            ],
          ),
        ],
      ),
    );
  }

  Widget transactions() {
    Widget buildPopUpMenu() {
      return PopupMenuButton(
        offset: Offset(-10, 30),
        clipBehavior: Clip.antiAliasWithSaveLayer,
        shape: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
        itemBuilder: (BuildContext context) => [
          PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Setting", fontWeight: 600)),
          PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Action", fontWeight: 600)),
        ],
        child: Icon(LucideIcons.ellipsis_vertical, size: 16),
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [MyText.bodyMedium("Transactions", fontWeight: 600), buildPopUpMenu()],
          ),
          MySpacing.height(20),
          ListView.separated(
            itemCount: controller.transactions.length,
            shrinkWrap: true,
            itemBuilder: (context, index) {
              final item = controller.transactions[index];
              return Row(
                children: [
                  Icon(item.icon, color: item.amount < 0 ? Colors.red : Colors.green, size: 20),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          MyText.bodyMedium(item.title, muted: true, fontWeight: 600, overflow: TextOverflow.ellipsis),
                          MyText.bodySmall(item.date, muted: true),
                        ],
                      ),
                    ),
                  ),
                  MyText.bodyMedium('${item.amount < 0 ? '-' : '+'}\$${item.amount.abs().toStringAsFixed(2)}',
                      muted: true, fontWeight: 600, color: item.amount < 0 ? Colors.red : Colors.green),
                ],
              );
            },
            separatorBuilder: (context, index) {
              return MySpacing.height(20);
            },
          )
        ],
      ),
    );
  }
}
