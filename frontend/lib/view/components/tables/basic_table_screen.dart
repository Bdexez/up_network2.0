import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/tables/basic_table_controller.dart';
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

class BasicTableScreen extends StatefulWidget {
  const BasicTableScreen({super.key});

  @override
  State<BasicTableScreen> createState() => _BasicTableScreenState();
}

class _BasicTableScreenState extends State<BasicTableScreen> with UIMixin {
  BasicTableController controller = Get.put(BasicTableController());

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'basic_table_controller',
        builder: (controller) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Basic Tables", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Tables'),
                        MyBreadcrumbItem(name: 'Basic Table'),
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
                    MyFlexItem(sizes: 'lg-6', child: basicExample()),
                    MyFlexItem(sizes: 'lg-6', child: inverseTable()),
                    MyFlexItem(sizes: 'lg-6', child: stripedRows()),
                    MyFlexItem(sizes: 'lg-6', child: tableHeadOptions()),
                    MyFlexItem(sizes: 'lg-6', child: hoverableRows()),
                    MyFlexItem(sizes: 'lg-6', child: smallTable()),
                    MyFlexItem(sizes: 'lg-6', child: borderedTable()),
                    MyFlexItem(sizes: 'lg-6', child: borderedColorTable()),
                    MyFlexItem(child: alwaysResponsive()),
                    MyFlexItem(sizes: 'lg-6', child: basicBorderlessExample()),
                    MyFlexItem(sizes: 'lg-6', child: inverseBorderlessTable()),
                    MyFlexItem(sizes: 'lg-6', child: activeTables()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget basicExample() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 20,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Basic Example", fontWeight: 600),
          MySpacing.height(20),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              columns: [
                DataColumn(label: SizedBox(width: 150, child: MyText.titleMedium('Name'))),
                DataColumn(label: SizedBox(width: 150, child: MyText.titleMedium('Phone Number'))),
                DataColumn(label: SizedBox(width: 100, child: MyText.titleMedium('Date of Birth'))),
                DataColumn(label: SizedBox(width: 120, child: MyText.titleMedium('Country'))),
              ],
              rows: [
                DataRow(cells: [
                  DataCell(MyText.bodySmall('Risa D. Pearson')),
                  DataCell(MyText.bodySmall('336-508-2157')),
                  DataCell(MyText.bodySmall('July 24, 1950')),
                  DataCell(MyText.bodySmall('India')),
                ]),
                DataRow(cells: [
                  DataCell(MyText.bodySmall('Ann C. Thompson')),
                  DataCell(MyText.bodySmall('646-473-2057')),
                  DataCell(MyText.bodySmall('January 25, 1959')),
                  DataCell(MyText.bodySmall('USA')),
                ]),
                DataRow(cells: [
                  DataCell(MyText.bodySmall('Paul J. Friend')),
                  DataCell(MyText.bodySmall('281-308-0793')),
                  DataCell(MyText.bodySmall('September 1, 1939')),
                  DataCell(MyText.bodySmall('Canada')),
                ]),
                DataRow(cells: [
                  DataCell(MyText.bodySmall('Linda G. Smith')),
                  DataCell(MyText.bodySmall('606-253-1207')),
                  DataCell(MyText.bodySmall('May 3, 1962')),
                  DataCell(MyText.bodySmall('Brazil')),
                ]),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget inverseTable() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 20,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Inverse Table", fontWeight: 600),
          MySpacing.height(20),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Container(
              decoration: BoxDecoration(
                color: contentTheme.dark,
              ),
              child: DataTable(
                headingRowColor: WidgetStateProperty.all(contentTheme.dark), // Darker color for the header
                columns: [
                  DataColumn(label: SizedBox(width: 140, child: MyText.titleMedium('Name', color: contentTheme.onPrimary))),
                  DataColumn(label: SizedBox(width: 130, child: MyText.titleMedium('Phone Number', color: contentTheme.onPrimary))),
                  DataColumn(label: SizedBox(width: 130, child: MyText.titleMedium('Date of Birth', color: contentTheme.onPrimary))),
                  DataColumn(label: SizedBox(width: 140, child: MyText.titleMedium('Country', color: contentTheme.onPrimary))),
                ],
                rows: [
                  DataRow(cells: [
                    DataCell(MyText.bodySmall('Risa D. Pearson', color: contentTheme.onPrimary)),
                    DataCell(MyText.bodySmall('336-508-2157', color: contentTheme.onPrimary)),
                    DataCell(MyText.bodySmall('July 24, 1950', color: contentTheme.onPrimary)),
                    DataCell(MyText.bodySmall('Malaysia', color: contentTheme.onPrimary)),
                  ]),
                  DataRow(cells: [
                    DataCell(MyText.bodySmall('Ann C. Thompson', color: contentTheme.onPrimary)),
                    DataCell(MyText.bodySmall('646-473-2057', color: contentTheme.onPrimary)),
                    DataCell(MyText.bodySmall('January 25, 1959', color: contentTheme.onPrimary)),
                    DataCell(MyText.bodySmall('Belgium', color: contentTheme.onPrimary)),
                  ]),
                  DataRow(cells: [
                    DataCell(MyText.bodySmall('Paul J. Friend', color: contentTheme.onPrimary)),
                    DataCell(MyText.bodySmall('281-308-0793', color: contentTheme.onPrimary)),
                    DataCell(MyText.bodySmall('September 1, 1939', color: contentTheme.onPrimary)),
                    DataCell(MyText.bodySmall('Australia', color: contentTheme.onPrimary)),
                  ]),
                  DataRow(cells: [
                    DataCell(MyText.bodySmall('Sean C. Nguyen', color: contentTheme.onPrimary)),
                    DataCell(MyText.bodySmall('269-714-6825', color: contentTheme.onPrimary)),
                    DataCell(MyText.bodySmall('February 5, 1994', color: contentTheme.onPrimary)),
                    DataCell(MyText.bodySmall('Algeria', color: contentTheme.onPrimary)),
                  ]),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget stripedRows() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 20,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Striped Rows", fontWeight: 600),
          MySpacing.height(20),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              columns: [
                DataColumn(label: SizedBox(width: 160, child: MyText.titleMedium('User'))),
                DataColumn(label: SizedBox(width: 150, child: MyText.titleMedium('Account No.'))),
                DataColumn(label: SizedBox(width: 110, child: MyText.titleMedium('Balance'))),
                DataColumn(label: SizedBox(width: 100, child: MyText.titleMedium('Action'))),
              ],
              rows: List.generate(controller.striped.length, (index) {
                final data = controller.striped[index];
                return DataRow(
                  color: WidgetStateProperty.all(index.isEven ? contentTheme.secondary.withAlpha(36) : null),
                  cells: [
                    DataCell(
                      Row(
                        children: [
                          ClipOval(
                            child: Image.asset(data.imagePath, height: 32, width: 32),
                          ),
                          MySpacing.width(12),
                          MyText.bodySmall(data.name),
                        ],
                      ),
                    ),
                    DataCell(MyText.bodySmall(data.accountNo)),
                    DataCell(MyText.bodySmall(data.balance)),
                    DataCell(
                      Row(
                        children: [
                          Icon(Icons.settings, size: 16),
                          MySpacing.width(12),
                          Icon(Icons.delete, size: 16),
                        ],
                      ),
                    ),
                  ],
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  Widget tableHeadOptions() {
    Color getProgressColor(double progress) {
      if (progress >= 100) return Colors.green;
      if (progress >= 50) return Colors.orange;
      if (progress >= 25) return Colors.blue;
      return Colors.red;
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 20,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Table head options", fontWeight: 600),
          MySpacing.height(20),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              columnSpacing: 16,
              headingRowColor: WidgetStateProperty.all(contentTheme.secondary),
              headingTextStyle: TextStyle(color: Colors.white),
              columns: [
                DataColumn(label: SizedBox(width: 250, child: MyText.titleMedium('Product',color: contentTheme.onPrimary))),
                DataColumn(label: SizedBox(width: 100, child: MyText.titleMedium('Courier',color: contentTheme.onPrimary))),
                DataColumn(label: SizedBox(width: 200, child: MyText.titleMedium('Process',color: contentTheme.onPrimary))),
                DataColumn(label: SizedBox(width: 50, child: MyText.titleMedium('Status',color: contentTheme.onPrimary))),
              ],
              rows: List.generate(controller.tableHead.length, (index) {
                final data = controller.tableHead[index];
                return DataRow(
                  cells: [
                    DataCell(MyText.bodySmall(data.product)),
                    DataCell(MyText.bodySmall(data.courier)),
                    DataCell(
                      SizedBox(
                        width: 100,
                        child: LinearProgressIndicator(
                          value: data.progress / 100,
                          backgroundColor: contentTheme.dark.withAlpha(36),
                          valueColor: AlwaysStoppedAnimation<Color>(getProgressColor(data.progress)),
                        ),
                      ),
                    ),
                    DataCell(MyText.bodySmall(data.status)),
                  ],
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  Widget hoverableRows() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 20,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Hoverable rows", fontWeight: 600),
          MySpacing.height(20),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              showCheckboxColumn: false,
              columnSpacing: 20,
              columns: [
                DataColumn(label: SizedBox(width: 300, child: MyText.titleMedium('Product'))),
                DataColumn(label: SizedBox(width: 100, child: MyText.titleMedium('Price'))),
                DataColumn(label: SizedBox(width: 100, child: MyText.titleMedium('Quantity'))),
                DataColumn(label: SizedBox(width: 100, child: MyText.titleMedium('Amount'))),
              ],
              rows: List.generate(controller.hoverable.length, (index) {
                final data = controller.hoverable[index];
                return DataRow(
                  cells: [
                    DataCell(MyText.bodySmall(data.product)),
                    DataCell(MyText.bodySmall('\$${data.price.toStringAsFixed(2)}')),
                    DataCell(
                      MyContainer(
                        padding: MySpacing.xy(8, 4),
                        color: contentTheme.primary,
                        borderRadiusAll: 4,
                        child: MyText.bodySmall('${data.quantity} Pcs', color: contentTheme.onPrimary),
                      ),
                    ),
                    DataCell(MyText.bodySmall('\$${data.amount.toStringAsFixed(2)}')),
                  ],
                  onSelectChanged: (selected) {},
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  Widget smallTable() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 20,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Small table", fontWeight: 600),
          MySpacing.height(20),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              columnSpacing: 16,
              headingRowHeight: 36,
              columns: [
                DataColumn(label: SizedBox(width: 200, child: MyText.titleMedium('Product'))),
                DataColumn(label: SizedBox(width: 150, child: MyText.titleMedium('Price'))),
                DataColumn(label: SizedBox(width: 150, child: MyText.titleMedium('Quantity'))),
                DataColumn(label: SizedBox(width: 150, child: MyText.titleMedium('Amount'))),
              ],
              rows: List.generate(controller.smallTableData.length, (index) {
                final data = controller.smallTableData[index];
                return DataRow(
                  cells: [
                    DataCell(
                      MyText.bodySmall(data.product),
                    ),
                    DataCell(
                      MyText.titleSmall('\$${data.price.toStringAsFixed(2)}'),
                    ),
                    DataCell(
                      MyContainer(
                        paddingAll: 4,
                        color: contentTheme.primary,
                        child: MyText.bodySmall('${data.quantity} Pcs', color: contentTheme.onPrimary),
                      ),
                    ),
                    DataCell(
                      MyText.bodySmall('\$${data.amount.toStringAsFixed(2)}'),
                    ),
                  ],
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  Widget borderedTable() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 20,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Bordered table", fontWeight: 600),
          MySpacing.height(20),
          MyContainer.bordered(
            paddingAll: 0,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                columnSpacing: 16,
                horizontalMargin: 20,
                columns: [
                  DataColumn(label: SizedBox(width: 200, child: MyText.titleMedium('User'))),
                  DataColumn(label: SizedBox(width: 200, child: MyText.titleMedium('Account No.'))),
                  DataColumn(label: SizedBox(width: 150, child: MyText.titleMedium('Balance'))),
                  DataColumn(label: SizedBox(width: 100, child: MyText.titleMedium('Action'))),
                ],
                rows: [
                  DataRow(
                    cells: [
                      DataCell(Row(
                        children: [
                          CircleAvatar(
                            backgroundImage: AssetImage('assets/images/users/avatar-6.jpg'),
                            radius: 16,
                          ),
                          MySpacing.width(12),
                          MyText.bodySmall(
                            'Risa D. Pearson',
                          ),
                        ],
                      )),
                      DataCell(MyText.bodySmall(
                        'AC336 508 2157',
                      )),
                      DataCell(MyText.bodySmall(
                        'July 24, 1950',
                      )),
                      DataCell(
                        IconButton(icon: Icon(Icons.delete), onPressed: () {}),
                      ),
                    ],
                  ),
                  DataRow(
                    cells: [
                      DataCell(Row(
                        children: [
                          CircleAvatar(
                            backgroundImage: AssetImage('assets/images/users/avatar-7.jpg'),
                            radius: 16,
                          ),
                          SizedBox(width: 8),
                          MyText.bodySmall(
                            'Ann C. Thompson',
                          ),
                        ],
                      )),
                      DataCell(MyText.bodySmall(
                        'SB646 473 2057',
                      )),
                      DataCell(MyText.bodySmall(
                        'January 25, 1959',
                      )),
                      DataCell(
                        IconButton(icon: Icon(Icons.delete), onPressed: () {}),
                      ),
                    ],
                  ),
                  DataRow(
                    cells: [
                      DataCell(Row(
                        children: [
                          CircleAvatar(
                            backgroundImage: AssetImage('assets/images/users/avatar-8.jpg'),
                            radius: 16,
                          ),
                          SizedBox(width: 8),
                          MyText.bodySmall(
                            'Paul J. Friend',
                          ),
                        ],
                      )),
                      DataCell(MyText.bodySmall(
                        'DL281 308 0793',
                      )),
                      DataCell(MyText.bodySmall(
                        'September 1, 1939',
                      )),
                      DataCell(
                        IconButton(icon: Icon(Icons.delete), onPressed: () {}),
                      ),
                    ],
                  ),
                  DataRow(
                    cells: [
                      DataCell(Row(
                        children: [
                          CircleAvatar(
                            backgroundImage: AssetImage('assets/images/users/avatar-9.jpg'),
                            radius: 16,
                          ),
                          SizedBox(width: 8),
                          MyText.bodySmall('Sean C. Nguyen'),
                        ],
                      )),
                      DataCell(MyText.bodySmall('CA269 714 6825')),
                      DataCell(MyText.bodySmall('February 5, 1994')),
                      DataCell(
                        IconButton(icon: Icon(Icons.delete), onPressed: () {}),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget borderedColorTable() {
    DataRow buildDataRow(String avatarPath, String userName, String accountNo, String balance) {
      return DataRow(
        cells: [
          DataCell(Row(
            children: [
              CircleAvatar(backgroundImage: AssetImage(avatarPath), radius: 16),
              MySpacing.width(8),
              MyText.bodySmall(userName),
            ],
          )),
          DataCell(MyText.bodySmall(accountNo)),
          DataCell(MyText.bodySmall(balance)),
          DataCell(
            Center(
              child: IconButton(icon: Icon(Icons.delete), onPressed: () {}),
            ),
          ),
        ],
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 20,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Bordered color table", fontWeight: 600),
          MySpacing.height(20),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              columnSpacing: 16,
              border: TableBorder.all(color: contentTheme.primary),
              columns: [
                DataColumn(label: SizedBox(width: 200, child: MyText.titleMedium('User', fontWeight: 600))),
                DataColumn(label: SizedBox(width: 200, child: MyText.titleMedium('Account No.', fontWeight: 600))),
                DataColumn(label: SizedBox(width: 150, child: MyText.titleMedium('Balance', fontWeight: 600))),
                DataColumn(label: MyText.titleMedium('Action', fontWeight: 600)),
              ],
              rows: [
                buildDataRow('assets/images/users/avatar-6.jpg', 'Risa D. Pearson', 'AC336 508 2157', 'July 24, 1950'),
                buildDataRow('assets/images/users/avatar-7.jpg', 'Ann C. Thompson', 'SB646 473 2057', 'January 25, 1959'),
                buildDataRow('assets/images/users/avatar-8.jpg', 'Paul J. Friend', 'DL281 308 0793', 'September 1, 1939'),
                buildDataRow('assets/images/users/avatar-9.jpg', 'Sean C. Nguyen', 'CA269 714 6825', 'February 5, 1994'),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget alwaysResponsive() {
    DataRow buildDataRow(int rowNumber) {
      return DataRow(
        cells: [
          DataCell(MyText.bodySmall(rowNumber.toString(), fontWeight: 600)),
          ...List.generate(9, (index) => DataCell(MyText.bodySmall('Cell'))),
        ],
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 20,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Always Responsive", fontWeight: 600),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              columns: List.generate(10, (index) => DataColumn(label: SizedBox(width: 100, child: MyText.bodyMedium('Heading', fontWeight: 600)))),
              rows: List.generate(3, (index) => buildDataRow(index + 1)),
            ),
          )
        ],
      ),
    );
  }

  Widget basicBorderlessExample() {
    DataRow buildDataRow(String name, String phoneNumber, String dob, String country) {
      return DataRow(
        cells: [
          DataCell(MyText.bodySmall(name, muted: true)),
          DataCell(MyText.bodySmall(phoneNumber, muted: true)),
          DataCell(MyText.bodySmall(dob, muted: true)),
          DataCell(MyText.bodySmall(country, muted: true)),
        ],
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 20,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Basic Borderless Example", fontWeight: 600),
          MySpacing.height(20),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              columns: [
                DataColumn(label: SizedBox(width: 200, child: MyText.bodyMedium('Name'))),
                DataColumn(label: SizedBox(width: 100, child: MyText.bodyMedium('Phone Number'))),
                DataColumn(label: SizedBox(width: 100, child: MyText.bodyMedium('Date of Birth'))),
                DataColumn(label: SizedBox(width: 100, child: MyText.bodyMedium('Country'))),
              ],
              rows: [
                buildDataRow('Risa D. Pearson', '336-508-2157', 'July 24, 1950', 'India'),
                buildDataRow('Ann C. Thompson', '646-473-2057', 'January 25, 1959', 'USA'),
                buildDataRow('Paul J. Friend', '281-308-0793', 'September 1, 1939', 'Canada'),
                buildDataRow('Linda G. Smith', '606-253-1207', 'May 3, 1962', 'Brazil'),
              ],
              decoration: BoxDecoration(border: Border.all(color: Colors.transparent)),
            ),
          )
        ],
      ),
    );
  }

  Widget inverseBorderlessTable() {
    DataRow buildDataRow(String name, String phoneNumber, String dob, String country) {
      return DataRow(
        cells: [
          DataCell(MyText.bodySmall(name, muted: true, color: contentTheme.onPrimary)),
          DataCell(MyText.bodySmall(phoneNumber, muted: true, color: contentTheme.onPrimary)),
          DataCell(MyText.bodySmall(dob, muted: true, color: contentTheme.onPrimary)),
          DataCell(MyText.bodySmall(country, muted: true, color: contentTheme.onPrimary)),
        ],
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 20,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Inverse Borderless table", fontWeight: 600),
          MySpacing.height(20),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
                columns: [
                  DataColumn(label: SizedBox(width: 200, child: MyText.titleMedium('Name', fontWeight: 600, color: contentTheme.onPrimary))),
                  DataColumn(label: SizedBox(width: 150, child: MyText.titleMedium('Phone Number', fontWeight: 600, color: contentTheme.onPrimary))),
                  DataColumn(label: SizedBox(width: 150, child: MyText.titleMedium('Date of Birth', fontWeight: 600, color: contentTheme.onPrimary))),
                  DataColumn(label: SizedBox(width: 150, child: MyText.titleMedium('Country', fontWeight: 600, color: contentTheme.onPrimary))),
                ],
                rows: [
                  buildDataRow('Risa D. Pearson', '336-508-2157', 'July 24, 1950', 'Malaysia'),
                  buildDataRow('Ann C. Thompson', '646-473-2057', 'January 25, 1959', 'Belgium'),
                  buildDataRow('Paul J. Friend', '281-308-0793', 'September 1, 1939', 'Australia'),
                  buildDataRow('Sean C. Nguyen', '269-714-6825', 'February 5, 1994', 'Algeria'),
                ],
                decoration: BoxDecoration(color: contentTheme.dark),
                headingTextStyle: TextStyle(color: Colors.white),
                dataTextStyle: TextStyle(color: Colors.white),
                columnSpacing: 20),
          )
        ],
      ),
    );
  }

  Widget activeTables() {
    DataRow buildDataRow(bool isActive, String name, String phoneNumber, String dob, String country, {int colspan = 1}) {
      return DataRow(
        cells: [
          DataCell(MyText.bodySmall(name, fontWeight: 600), placeholder: colspan == 2 && !isActive, onTap: () {}),
          if (colspan == 2)
            DataCell(
                Container(
                  color: isActive ? contentTheme.secondary.withAlpha(36) : Colors.transparent,
                  child: Center(child: MyText.bodySmall(phoneNumber, muted: true, fontWeight: 600)),
                ),
                showEditIcon: isActive)
          else
            DataCell(MyText.bodySmall(phoneNumber, fontWeight: 600, muted: true), placeholder: isActive),
          DataCell(MyText.bodySmall(dob, fontWeight: 600, muted: true)),
          DataCell(MyText.bodySmall(country, fontWeight: 600, muted: true)),
        ],
        color: isActive ? WidgetStateProperty.all(contentTheme.secondary.withAlpha(36)) : null,
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 20,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Active tables", fontWeight: 600),
          MySpacing.height(20),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(columns: [
              DataColumn(label: SizedBox(width: 200, child: MyText.titleMedium('Name', fontWeight: 600))),
              DataColumn(label: SizedBox(width: 150, child: MyText.titleMedium('Phone Number', fontWeight: 600))),
              DataColumn(label: SizedBox(width: 150, child: MyText.titleMedium('Date of Birth', fontWeight: 600))),
              DataColumn(label: SizedBox(width: 100, child: MyText.titleMedium('Country', fontWeight: 600))),
            ], rows: [
              buildDataRow(true, 'Risa D. Pearson', '336-508-2157', 'July 24, 1950', 'Belgium'),
              buildDataRow(false, 'Ann C. Thompson', '646-473-2057', 'January 25, 1959', 'Malaysia'),
              buildDataRow(false, 'Paul J. Friend', '281-308-0793', 'September 1, 1939', 'Algeria'),
              buildDataRow(false, 'Linda G. Smith', '606-253-1207', 'May 3, 1962', 'Australia'),
              buildDataRow(false, 'Paul J. Friend', '281-308-0793', 'September 1, 1939', 'India'),
            ], columnSpacing: 20),
          )
        ],
      ),
    );
  }
}
