import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/ui/invoice_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_button.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_flex.dart';
import 'package:henox/helpers/widgets/my_flex_item.dart';
import 'package:henox/helpers/widgets/my_list_extension.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/images.dart';
import 'package:henox/view/layouts/layout.dart';
import 'package:remixicon/remixicon.dart';

class InvoiceScreen extends StatefulWidget {
  const InvoiceScreen({super.key});

  @override
  State<InvoiceScreen> createState() => _InvoiceScreenState();
}

class _InvoiceScreenState extends State<InvoiceScreen> with SingleTickerProviderStateMixin, UIMixin {
  late InvoiceController controller = Get.put(InvoiceController());

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'invoice_controller',
        builder: (controller) {
          return Column(
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Invoice", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Pages'),
                        MyBreadcrumbItem(name: 'Invoice'),
                      ],
                    ),
                  ],
                ),
              ),
              MySpacing.height(flexSpacing),
              Padding(
                padding: MySpacing.x(flexSpacing / 4),
                child: MyFlex(
                  wrapAlignment: WrapAlignment.start,
                  wrapCrossAlignment: WrapCrossAlignment.start,
                  children: [
                    MyFlexItem(
                      sizes: "md-12",
                      child: MyCard(
                        shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
                        paddingAll: 24,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            title(),
                            MySpacing.height(40),
                            MyFlexItem(
                              sizes: "lg-6 md-12",
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        MyText.bodyMedium("Hello, Tosha Minnar", fontWeight: 600, muted: true),
                                        MySpacing.height(20),
                                        MyText.bodySmall(
                                            "Please find below a cost-breakdown for the recent work completed. Please make payment at your earliest convenience, and do not hesitate to\ncontact me with any questions.",
                                            xMuted: true,
                                            overflow: TextOverflow.ellipsis),
                                      ],
                                    ),
                                  ),
                                  MySpacing.width(20),
                                  Wrap(
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              MyText.bodySmall("Order Date :", fontWeight: 700, muted: true),
                                              MySpacing.height(12),
                                              MyText.bodySmall("Order Status :", fontWeight: 700, muted: true),
                                              MySpacing.height(12),
                                              MyText.bodySmall("Order ID :", fontWeight: 700, muted: true),
                                            ],
                                          ),
                                          Column(
                                            crossAxisAlignment: CrossAxisAlignment.end,
                                            children: [
                                              MyText.bodySmall("Jan, 17 2023", muted: true),
                                              MySpacing.height(12),
                                              MyContainer(
                                                paddingAll: 4,
                                                color: contentTheme.success,
                                                child: MyText.bodySmall("Paid", fontSize: 8, color: contentTheme.onPrimary),
                                              ),
                                              MySpacing.height(12),
                                              MyText.bodySmall("#123456", fontWeight: 600, muted: true),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            MySpacing.height(30),
                            MyFlexItem(
                              sizes: "lg-6 md-12",
                              child: Wrap(
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          MyText.bodySmall("Billing Address", fontWeight: 600),
                                          MySpacing.height(12),
                                          MyText.bodyMedium("Lynne K. Higby", muted: true),
                                          MySpacing.height(4),
                                          MyText.bodyMedium("795 Folsom Ave, Suite 600", muted: true),
                                          MySpacing.height(4),
                                          MyText.bodyMedium("San Francisco, CA 94107", muted: true),
                                          MySpacing.height(4),
                                          MyText.bodyMedium("P: (123) 456-7890", muted: true),
                                        ],
                                      ),
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          MyText.bodySmall("Shipping Address", fontWeight: 600),
                                          MySpacing.height(12),
                                          MyText.bodyMedium("Tosha Minner", muted: true),
                                          MySpacing.height(4),
                                          MyText.bodyMedium("795 Folsom Ave, Suite 600", muted: true),
                                          MySpacing.height(4),
                                          MyText.bodyMedium("San Francisco, CA 94107", muted: true),
                                          MySpacing.height(4),
                                          MyText.bodyMedium("P: (123) 456-7890", muted: true),
                                        ],
                                      ),
                                      MyContainer(
                                        child: Image.asset(Images.barCode),
                                      )
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            MySpacing.height(40),
                            itemList(),
                            MySpacing.height(22),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    MyText.bodySmall("Notes:", xMuted: true),
                                    MySpacing.height(8),
                                    MyContainer.none(
                                      width: MediaQuery.of(context).size.width * .4,
                                      child: MyText.bodySmall(controller.dummyTexts[1], xMuted: true, maxLines: 2),
                                    ),
                                  ],
                                ),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.end,
                                  children: [
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        MyText.bodyMedium("Sub Total:", fontWeight: 700, xMuted: true),
                                        MySpacing.height(12),
                                        MyText.bodyMedium("VAT(12.5):", fontWeight: 700, xMuted: true),
                                      ],
                                    ),
                                    MySpacing.width(12),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        MyText.bodyMedium("\$4120.00", fontWeight: 600, muted: true),
                                        MySpacing.height(12),
                                        MyText.bodyMedium("\$515.00", fontWeight: 600, muted: true),
                                      ],
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            MySpacing.height(12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                MyText.titleLarge("\$4635.00 USD", fontWeight: 700, fontSize: 22, xMuted: true),
                              ],
                            ),
                            MySpacing.height(22),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                MyButton(
                                  onPressed: () {},
                                  elevation: 0,
                                  padding: MySpacing.xy(20, 16),
                                  backgroundColor: contentTheme.primary,
                                  borderRadiusAll: AppStyle.buttonRadius.medium,
                                  child: Row(
                                    children: [
                                      Icon(Remix.printer_line, size: 14),
                                      MySpacing.width(8),
                                      MyText.bodySmall('Print', color: contentTheme.onPrimary),
                                    ],
                                  ),
                                ),
                                MySpacing.width(8),
                                MyButton(
                                  onPressed: () {},
                                  elevation: 0,
                                  padding: MySpacing.xy(20, 16),
                                  backgroundColor: contentTheme.info,
                                  borderRadiusAll: AppStyle.buttonRadius.medium,
                                  child: MyText.bodySmall('Submit', color: contentTheme.onPrimary),
                                ),
                              ],
                            )
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget itemList() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: DataTable(
        clipBehavior: Clip.antiAliasWithSaveLayer,
        border: TableBorder.symmetric(),
        showBottomBorder: false,
        sortAscending: true,
        dataRowMaxHeight: 50,
        columns: [
          DataColumn(label: MyText.labelLarge("#", fontWeight: 600)),
          DataColumn(label: MyText.labelLarge("Item", fontWeight: 600)),
          DataColumn(label: MyText.labelLarge("Quantity", fontWeight: 600)),
          DataColumn(label: MyText.labelLarge("Unit Cost", fontWeight: 600)),
          DataColumn(label: MyText.labelLarge("Total", fontWeight: 600)),
        ],
        rows: controller.invoiceBillingInformation
            .mapIndexed((index, invoice) => DataRow(
                  cells: [
                    DataCell(
                      SizedBox(width: 50, child: MyText.bodyMedium(invoice['id'].toString(), fontWeight: 600)),
                    ),
                    DataCell(SizedBox(
                      width: MediaQuery.of(context).size.width * .34,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          MyText.bodyMedium(invoice['item'], fontWeight: 600),
                          MySpacing.height(4),
                          MyText.bodySmall(invoice['description'], xMuted: true)
                        ],
                      ),
                    )),
                    DataCell(SizedBox(
                      width: 200,
                      child: MyText.bodyMedium(invoice['quantity'], xMuted: true),
                    )),
                    DataCell(SizedBox(
                      width: 200,
                      child: MyText.bodyMedium(invoice['unit_cost'], xMuted: true),
                    )),
                    DataCell(SizedBox(
                      width: 200,
                      child: MyText.bodyMedium(invoice['total'], xMuted: true),
                    )),
                  ],
                ))
            .toList(),
      ),
    );
  }

  Widget title() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Image.asset(Images.logoDark, height: 20),
        MyText.titleMedium("Invoice", fontWeight: 600, muted: true),
      ],
    );
  }
}
