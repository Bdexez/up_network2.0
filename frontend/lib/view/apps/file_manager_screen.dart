import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/controller/apps/file_manager_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/utils/utils.dart';
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
import 'package:henox/helpers/widgets/my_text_style.dart';
import 'package:henox/images.dart';
import 'package:henox/view/layouts/layout.dart';
import 'package:remixicon/remixicon.dart';

class FileManagerScreen extends StatefulWidget {
  const FileManagerScreen({super.key});

  @override
  State<FileManagerScreen> createState() => _FileManagerScreenState();
}

class _FileManagerScreenState extends State<FileManagerScreen> with SingleTickerProviderStateMixin, UIMixin {
  late FileManagerController controller = Get.put(FileManagerController());
  @override
  OutlineInputBorder outlineInputBorder = OutlineInputBorder(borderSide: BorderSide.none);

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'file_manager_controller',
        builder: (controller) {
          return Column(
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("File Manager", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Apps'),
                        MyBreadcrumbItem(name: 'File Manager'),
                      ],
                    ),
                  ],
                ),
              ),
              MySpacing.height(flexSpacing),
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: MyFlex(
                  contentPadding: false,
                  children: [
                    MyFlexItem(sizes: 'lg-2.5', child: createFile()),
                    MyFlexItem(sizes: 'lg-9.5', child: fileData()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget fileData() {
    return MyCard(
        paddingAll: 24,
        shadow: MyShadow(position: MyShadowPosition.center, elevation: .5),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            fileDataTitle(),
            MySpacing.height(20),
            MyText.bodyMedium("Quick Access", fontWeight: 600, muted: true),
            MySpacing.height(20),
            Wrap(
              runSpacing: 16,
              spacing: 16,
              children: [
                buildFileData(Remix.file_zip_line, "Admin-sketch.zip", 2411724),
                buildFileData(Remix.folder_5_line, "Compile Version", 91435827),
                buildFileData(Remix.folder_5_line, "admin.zip", 47290777),
                buildFileData(Remix.file_pdf_line, "Docs.pdf", 7864320),
                buildFileData(Remix.file_pdf_line, "License-details.pdf", 802816),
                buildFileData(Remix.folder_5_line, "Purchase Verification", 2306867),
                buildFileData(Remix.folder_5_line, "Admin Integrations", 916455424),
              ],
            ),
            MySpacing.height(20),
            MyText.bodyMedium("Recent", fontWeight: 600, muted: true),
            MySpacing.height(20),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: MyContainer.bordered(
                paddingAll: 0,
                borderRadiusAll: 4,
                clipBehavior: Clip.antiAliasWithSaveLayer,
                child: DataTable(
                  sortAscending: true,
                  onSelectAll: (_) => {},
                  headingRowColor: WidgetStatePropertyAll(contentTheme.secondary.withAlpha(30)),
                  dataRowMaxHeight: 60,
                  showBottomBorder: false,
                  columns: [
                    DataColumn(label: MyText.labelLarge("Name", color: contentTheme.secondary)),
                    DataColumn(label: MyText.labelLarge("Last Modified", color: contentTheme.secondary)),
                    DataColumn(label: MyText.labelLarge("Size", color: contentTheme.secondary)),
                    DataColumn(label: MyText.labelLarge("Owner", color: contentTheme.secondary)),
                    DataColumn(label: MyText.labelLarge("Members", color: contentTheme.secondary)),
                    DataColumn(label: MyText.labelLarge("Action", color: contentTheme.secondary)),
                  ],
                  rows: [
                    buildDataRows(
                      "App Design & Development",
                      DateTime.utc(2023, 1, 25),
                      "Andrew",
                      134217728,
                      "Danielle Thompson",
                      [Images.avatars[0], Images.avatars[1], Images.avatars[2], Images.avatars[3]],
                    ),
                    buildDataRows(
                      "Admin-sketch-design.zip",
                      DateTime.utc(2020, 2, 13),
                      "Coderthemes",
                      546308096,
                      "Coder Themes",
                      [Images.avatars[0], Images.avatars[2], Images.avatars[3]],
                    ),
                    buildDataRows(
                      "Annualreport.pdf",
                      DateTime.utc(2020, 2, 13),
                      "Alejandro",
                      7549747,
                      "Gary Coley",
                      [Images.avatars[5], Images.avatars[4], Images.avatars[1]],
                    ),
                    buildDataRows(
                      "Wireframes",
                      DateTime.utc(2023, 1, 25),
                      "Dunkle",
                      56832819,
                      "Jasper Rigg",
                      [Images.avatars[0], Images.avatars[1], Images.avatars[2], Images.avatars[3]],
                    ),
                    buildDataRows(
                      "Documentation.docs",
                      DateTime.utc(2020, 2, 13),
                      "Justin",
                      8703180,
                      "Cooper Sharwood",
                      [Images.avatars[4], Images.avatars[1]],
                    ),
                  ],
                ),
              ),
            )
          ],
        ));
  }

  buildDataRows(String name, DateTime modifyAt, String author, int bytes, String owner, List<String> images) {
    return DataRow(
      cells: [
        DataCell(
          SizedBox(width: 250, child: MyText.bodyMedium(name)),
        ),
        DataCell(
          SizedBox(
            width: 150,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                MyText.bodyMedium('${Utils.getDateStringFromDateTime(modifyAt, showMonthShort: true)}'),
                MyText.bodySmall("by $author", muted: true),
              ],
            ),
          ),
        ),
        DataCell(
          MyText.bodyMedium(Utils.getStorageStringFromByte(bytes)),
        ),
        DataCell(MyText.bodyMedium(owner)),
        DataCell(
          SizedBox(
            width: 200,
            child: Stack(
                alignment: Alignment.centerRight,
                children: images
                    .mapIndexed((index, image) => Positioned(
                          left: (18 + (20 * index)).toDouble(),
                          child: MyContainer.rounded(
                            paddingAll: 2,
                            child: MyContainer.rounded(
                              bordered: true,
                              paddingAll: 0,
                              child: Image.asset(image, height: 28, width: 28, fit: BoxFit.cover),
                            ),
                          ),
                        ))
                    .toList()),
          ),
        ),
        DataCell(MyContainer.none(
          paddingAll: 8,
          borderRadiusAll: 5,
          color: contentTheme.primary.withOpacity(0.05),
          child: PopupMenuButton(
            itemBuilder: (BuildContext context) => [
              PopupMenuItem(
                  padding: MySpacing.xy(16, 8),
                  height: 10,
                  child: Row(
                    children: [Icon(Remix.share_line, size: 16), MySpacing.width(8), MyText.bodySmall("Share")],
                  )),
              PopupMenuItem(
                  padding: MySpacing.xy(16, 8),
                  height: 10,
                  child: Row(
                    children: [Icon(Remix.link_m, size: 16), MySpacing.width(8), MyText.bodySmall("Get Sharable Link")],
                  )),
              PopupMenuItem(
                  padding: MySpacing.xy(16, 8),
                  height: 10,
                  child: Row(
                    children: [Icon(Remix.pencil_line, size: 16), MySpacing.width(8), MyText.bodySmall("Rename")],
                  )),
              PopupMenuItem(
                  padding: MySpacing.xy(16, 8),
                  height: 10,
                  child: Row(
                    children: [Icon(Remix.download_line, size: 16), MySpacing.width(8), MyText.bodySmall("Download")],
                  )),
              PopupMenuItem(
                  padding: MySpacing.xy(16, 8),
                  height: 10,
                  child: Row(
                    children: [Icon(Remix.delete_bin_5_line, size: 16), MySpacing.width(8), MyText.bodySmall("Remove")],
                  ))
            ],
            child: Icon(LucideIcons.ellipsis, size: 18),
          ),
        )),
      ],
    );
  }

  Widget buildFileData(icons, String fileName, dynamic bytes, {Color? color}) {
    return MyContainer.bordered(
      padding: MySpacing.x(12),
      width: 290,
      height: 70,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          MyContainer(
              paddingAll: 8, color: color ?? contentTheme.secondary.withAlpha(32), child: Icon(icons, color: color ?? contentTheme.secondary)),
          MySpacing.width(12),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              MyText.bodyMedium(fileName, fontWeight: 700, xMuted: true),
              MySpacing.height(4),
              MyText.bodySmall(Utils.getStorageStringFromByte(bytes), xMuted: true),
            ],
          ),
        ],
      ),
    );
  }

  Widget fileDataTitle() {
    return Row(
      children: [
        SizedBox(
          width: 250,
          child: TextFormField(
            maxLines: 1,
            style: MyTextStyle.bodyMedium(fontWeight: 600),
            decoration: InputDecoration(
                hintText: "Search File...",
                hintStyle: MyTextStyle.bodyMedium(fontWeight: 600, muted: true),
                border: outlineInputBorder,
                enabledBorder: outlineInputBorder,
                disabledBorder: outlineInputBorder,
                errorBorder: outlineInputBorder,
                focusedBorder: outlineInputBorder,
                focusedErrorBorder: outlineInputBorder,
                isDense: true,
                filled: true,
                prefixIcon: Icon(LucideIcons.search, size: 20),
                contentPadding: MySpacing.all(16)),
          ),
        ),
        Spacer(),
        selectGrid(Remix.list_unordered, 0),
        selectGrid(Remix.grid_fill, 1)
      ],
    );
  }

  Widget selectGrid(IconData icon, int id) {
    bool isSelect = controller.selectGrid == id;
    return MyContainer(
      color: isSelect ? contentTheme.secondary.withAlpha(60) : null,
      paddingAll: 12,
      onTap: () => controller.onSelectGridToggle(id),
      child: Icon(icon, size: 16),
    );
  }

  Widget createFile() {
    return MyCard(
      paddingAll: 24,
      shadow: MyShadow(elevation: .5, position: MyShadowPosition.center),
      height: 730,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          createBTN(),
          MySpacing.height(32),
          fileTypes(),
          MySpacing.height(100),
          MyContainer(
              borderRadiusAll: 40,
              padding: MySpacing.xy(12, 4),
              clipBehavior: Clip.antiAliasWithSaveLayer,
              color: contentTheme.secondary.withAlpha(60),
              child: MyText.bodyMedium("FREE", fontWeight: 700, color: contentTheme.secondary)),
          MySpacing.height(12),
          MyText.bodyMedium(
            "Storage",
            fontWeight: 600,
            muted: true,
          ),
          MySpacing.height(12),
          MyProgressBar(width: 300, progress: .4, height: 5, radius: 4, inactiveColor: theme.dividerColor, activeColor: contentTheme.success),
          MySpacing.height(12),
          MyText.bodyMedium("7.02 GB (46%) of 15 GB used", muted: true),
        ],
      ),
    );
  }

  Widget fileTypes() {
    Widget type(IconData icon, String title) {
      return InkWell(
        onTap: () {},
        child: Row(
          children: [Icon(icon, size: 18, color: contentTheme.secondary), MySpacing.width(12), MyText.bodyMedium(title, xMuted: true)],
        ),
      );
    }

    return Column(
      children: [
        type(Remix.folders_line, 'MyFiles'),
        MySpacing.height(24),
        type(Remix.drive_line, 'Google Drive'),
        MySpacing.height(24),
        type(Remix.dropbox_line, 'Dropbox'),
        MySpacing.height(24),
        type(Remix.user_voice_line, 'Share With Me'),
        MySpacing.height(24),
        type(Remix.time_line, 'Recent'),
        MySpacing.height(24),
        type(Remix.star_line, 'Starred'),
        MySpacing.height(24),
        type(Remix.delete_bin_5_line, 'Deleted File'),
      ],
    );
  }

  Widget createBTN() {
    PopupMenuItem popupMenuItem(IconData icon, String title) {
      return PopupMenuItem(
          padding: MySpacing.xy(16, 8),
          height: 10,
          child: Row(
            children: [
              Icon(icon, size: 16),
              MySpacing.width(8),
              MyText.bodyMedium(title, fontWeight: 600),
            ],
          ));
    }

    return PopupMenuButton(
        clipBehavior: Clip.antiAliasWithSaveLayer,
        offset: Offset(44, 44),
        shape: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
        itemBuilder: (BuildContext context) => [
              popupMenuItem(Remix.folder_5_line, "Folder"),
              popupMenuItem(Remix.file_2_line, "File"),
              popupMenuItem(Remix.file_list_3_line, "Document"),
              popupMenuItem(Remix.upload_line, "Choose File"),
            ],
        child: MyContainer(
          paddingAll: 12,
          color: contentTheme.success,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Remix.file_add_line, size: 16, color: contentTheme.onSuccess),
              MySpacing.width(8),
              Flexible(child: MyText.bodyMedium("Create Now", fontWeight: 600, color: contentTheme.onSuccess, overflow: TextOverflow.ellipsis)),
              MySpacing.width(8),
              Icon(Remix.arrow_down_s_fill, size: 16, color: contentTheme.onSuccess),
            ],
          ),
        ));
  }
}
