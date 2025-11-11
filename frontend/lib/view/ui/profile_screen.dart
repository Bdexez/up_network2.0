import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/controller/ui/profile_controller.dart';
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
import 'package:henox/helpers/widgets/my_text_style.dart';
import 'package:henox/images.dart';
import 'package:henox/model/chat_modal.dart';
import 'package:henox/view/layouts/layout.dart';
import 'package:remixicon/remixicon.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> with SingleTickerProviderStateMixin, UIMixin {
  late ProfileController controller = Get.put(ProfileController());

  @override
  OutlineInputBorder outlineInputBorder =
      OutlineInputBorder(borderRadius: BorderRadius.circular(4), borderSide: BorderSide(width: 1.5, color: Colors.grey.withAlpha(50)));

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'profile_controller',
        builder: (controller) {
          return Column(
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Profile", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Pages'),
                        MyBreadcrumbItem(name: 'Profile'),
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
                        sizes: 'lg-3.5',
                        child: MyFlex(contentPadding: false, children: [
                          MyFlexItem(child: userDetail()),
                          MyFlexItem(child: messageList()),
                        ])),
                    MyFlexItem(
                        sizes: 'lg-8.5',
                        child: MyCard(
                            shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
                            paddingAll: 24,
                            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              tab(),
                              MySpacing.height(20),
                              if (controller.isSelectTab == 0) aboutDetails(),
                              if (controller.isSelectTab == 1) timeLineDetails(),
                              if (controller.isSelectTab == 2) settingsDetails(),
                            ]))),
                  ],
                ),
              )
            ],
          );
        },
      ),
    );
  }

  Widget aboutDetails() {
    return MyContainer(
      paddingAll: 0,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Remix.briefcase_line, size: 20),
              MySpacing.width(12),
              MyText.bodyMedium("PROJECTS", fontWeight: 600, muted: true),
            ],
          ),
          MySpacing.height(20),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
                sortAscending: true,
                columnSpacing: 60,
                onSelectAll: (_) => {},
                headingRowColor: WidgetStatePropertyAll(contentTheme.primary.withAlpha(40)),
                dataRowMaxHeight: 60,
                showBottomBorder: false,
                clipBehavior: Clip.antiAliasWithSaveLayer,
                border: TableBorder.all(borderRadius: BorderRadius.circular(8), style: BorderStyle.solid, width: .4, color: Colors.grey),
                columns: [
                  DataColumn(label: MyText.labelLarge('#', color: contentTheme.primary)),
                  DataColumn(label: MyText.labelLarge('Client', color: contentTheme.primary)),
                  DataColumn(label: MyText.labelLarge('Project Name', color: contentTheme.primary)),
                  DataColumn(label: MyText.labelLarge('Start Date', color: contentTheme.primary)),
                  DataColumn(label: MyText.labelLarge('Due Date', color: contentTheme.primary)),
                  DataColumn(label: MyText.labelLarge('Status', color: contentTheme.primary)),
                ],
                rows: controller.project
                    .mapIndexed((index, data) => DataRow(cells: [
                          DataCell(SizedBox(width: 10, child: MyText.bodyMedium(data.id.toString()))),
                          DataCell(SizedBox(
                            width: 200,
                            child: Row(
                              children: [
                                MyContainer.rounded(paddingAll: 0, height: 32, width: 32, child: Image.asset(data.avatar, fit: BoxFit.cover)),
                                MySpacing.width(12),
                                MyText.bodyMedium(data.name)
                              ],
                            ),
                          )),
                          DataCell(MyText.bodySmall(data.projectName, fontWeight: 600)),
                          DataCell(SizedBox(width: 100, child: MyText.bodySmall(data.startDate))),
                          DataCell(MyText.bodySmall(data.dueDate)),
                          DataCell(
                            MyContainer(
                              borderRadiusAll: 4,
                              clipBehavior: Clip.antiAliasWithSaveLayer,
                              padding: MySpacing.all(4),
                              color: data.status == 'Work in Progress'
                                  ? contentTheme.info.withAlpha(32)
                                  : data.status == 'Pending'
                                      ? contentTheme.danger.withAlpha(32)
                                      : data.status == 'Done'
                                          ? contentTheme.success.withAlpha(32)
                                          : data.status == 'Coming soon'
                                              ? contentTheme.warning.withAlpha(32)
                                              : contentTheme.primary.withAlpha(32),
                              child: MyText.bodySmall(data.status,
                                  color: data.status == 'Work in Progress'
                                      ? contentTheme.info
                                      : data.status == 'Pending'
                                          ? contentTheme.danger
                                          : data.status == 'Done'
                                              ? contentTheme.success
                                              : data.status == 'Coming soon'
                                                  ? contentTheme.warning
                                                  : contentTheme.primary),
                            ),
                          ),
                        ]))
                    .toList()),
          ),
          MySpacing.height(20),
          Row(
            children: [Icon(Remix.macbook_line, size: 20), MySpacing.width(8), MyText.bodyMedium("EXPERIENCE", fontWeight: 600, muted: true)],
          ),
          MySpacing.height(16),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(LucideIcons.circle_dot, color: contentTheme.primary, size: 20),
              MySpacing.width(8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  MyText.titleSmall("Lead designer / Developer", fontWeight: 600),
                  MySpacing.height(8),
                  MyText.bodyMedium("website.com Year: 2015 - 18", muted: true),
                ],
              ),
            ],
          ),
          MySpacing.height(16),
          Padding(
            padding: MySpacing.x(30),
            child: MyText.bodySmall(controller.dummyTexts[0], maxLines: 2, overflow: TextOverflow.ellipsis, muted: true),
          ),
          MySpacing.height(24),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(LucideIcons.circle_dot, color: contentTheme.primary, size: 20),
              MySpacing.width(8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  MyText.titleSmall("Senior Graphic Designer", fontWeight: 600),
                  MySpacing.height(8),
                  MyText.bodyMedium("Software Inc. Year: 2012 - 15", muted: true),
                ],
              ),
            ],
          ),
          MySpacing.height(16),
          Padding(
            padding: MySpacing.x(30),
            child: MyText.bodySmall(controller.dummyTexts[1], maxLines: 2, overflow: TextOverflow.ellipsis, muted: true),
          ),
          MySpacing.height(24),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(LucideIcons.circle_dot, color: contentTheme.primary, size: 20),
              MySpacing.width(8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  MyText.titleSmall("Graphic Designer", fontWeight: 600),
                  MySpacing.height(8),
                  MyText.bodyMedium("Coderthemes Design LLP Year: 2010 - 12", muted: true),
                ],
              ),
            ],
          ),
          MySpacing.height(16),
          Padding(
            padding: MySpacing.x(30),
            child: MyText.bodySmall(controller.dummyTexts[2], maxLines: 2, overflow: TextOverflow.ellipsis, muted: true),
          ),
        ],
      ),
    );
  }

  Widget timeLineDetails() {
    return MyContainer(
      paddingAll: 0,
      child: Column(
        children: [
          MyContainer.bordered(
            paddingAll: 0,
            child: Column(
              children: [
                TextFormField(
                  keyboardType: TextInputType.multiline,
                  maxLines: 3,
                  decoration: InputDecoration(
                      enabledBorder: OutlineInputBorder(borderSide: BorderSide.none),
                      border: OutlineInputBorder(borderSide: BorderSide.none),
                      hintText: "Write somethings...",
                      hintStyle: MyTextStyle.bodySmall(xMuted: true),
                      contentPadding: MySpacing.all(16),
                      isCollapsed: true,
                      floatingLabelBehavior: FloatingLabelBehavior.never),
                ),
                MyContainer.none(
                  color: colorScheme.primary.withOpacity(0.08),
                  padding: MySpacing.xy(16, 12),
                  child: Row(
                    children: [
                      Expanded(
                        child: Row(
                          children: [
                            IconButton(
                              onPressed: () {},
                              icon: Icon(Remix.contacts_book_2_line, color: contentTheme.secondary, size: 18),
                            ),
                            IconButton(onPressed: () {}, icon: Icon(Remix.map_pin_line, color: contentTheme.secondary, size: 18)),
                            IconButton(onPressed: () {}, icon: Icon(Remix.camera_3_line, color: contentTheme.secondary, size: 18)),
                            IconButton(onPressed: () {}, icon: Icon(Remix.emoji_sticker_line, color: contentTheme.secondary, size: 18)),
                          ],
                        ),
                      ),
                      MyButton(
                        onPressed: () {},
                        elevation: 0,
                        padding: MySpacing.xy(16, 12),
                        backgroundColor: contentTheme.secondary,
                        borderRadiusAll: AppStyle.buttonRadius.medium,
                        child: MyText.bodySmall('Post', color: contentTheme.onSecondary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          MySpacing.height(16),
          MyContainer.bordered(
            paddingAll: 0,
            child: Column(
              children: [
                MyContainer.none(
                  padding: MySpacing.xy(flexSpacing, 12),
                  child: Row(
                    children: [
                      MyContainer.rounded(
                        height: 36,
                        width: 36,
                        paddingAll: 0,
                        child: Image.asset("assets/images/users/avatar-4.jpg", fit: BoxFit.cover),
                      ),
                      MySpacing.width(12),
                      Column(
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          MyText.bodyMedium("Thelma Fridley", fontWeight: 600, muted: true),
                          MySpacing.height(4),
                          MyText.bodySmall("about 1 hour ago", muted: true),
                        ],
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: MySpacing.all(20),
                  child: MyText.bodySmall(
                    controller.dummyTexts[0],
                    maxLines: 2,
                    style: TextStyle(fontStyle: FontStyle.italic),
                    overflow: TextOverflow.ellipsis,
                    muted: true,
                  ),
                ),
                MyContainer(
                  color: contentTheme.secondary.withAlpha(32),
                  borderRadiusAll: 0,
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          MyContainer.rounded(
                            height: 36,
                            width: 36,
                            paddingAll: 0,
                            child: Image.asset('assets/images/users/avatar-3.jpg', fit: BoxFit.cover),
                          ),
                          MySpacing.width(16),
                          Expanded(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    MyText.bodyMedium("Jeremy Tomlinson", fontWeight: 600, overflow: TextOverflow.ellipsis),
                                    SizedBox(width: 8),
                                    Expanded(
                                      child: MyText.bodySmall("about 2 minutes ago", muted: true, overflow: TextOverflow.ellipsis),
                                    ),
                                  ],
                                ),
                                MySpacing.height(8),
                                MyText.bodySmall("Nice work, makes me think of The Money Pit.",
                                    muted: true, maxLines: 2, overflow: TextOverflow.ellipsis),
                                MySpacing.height(16),
                                Row(
                                  children: [
                                    Icon(Remix.reply_line, size: 18),
                                    MySpacing.width(8),
                                    MyText.bodySmall("Reply"),
                                  ],
                                ),
                                MySpacing.height(20),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    MyContainer.rounded(
                                      height: 36,
                                      width: 36,
                                      paddingAll: 0,
                                      child: Image.asset('assets/images/users/avatar-4.jpg', fit: BoxFit.cover),
                                    ),
                                    MySpacing.width(16),
                                    Expanded(
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              MyText.bodyMedium("Thelma Fridley", fontWeight: 600),
                                              SizedBox(width: 8),
                                              Expanded(
                                                child: MyText.bodySmall("5 hours ago", muted: true, overflow: TextOverflow.ellipsis),
                                              ),
                                            ],
                                          ),
                                          MySpacing.height(8),
                                          MyText.bodySmall(
                                              "i'm in the middle of a timelapse animation myself! (Very different though.) Awesome stuff.",
                                              muted: true,
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis),
                                        ],
                                      ),
                                    )
                                  ],
                                )
                              ],
                            ),
                          )
                        ],
                      ),
                      MySpacing.height(20),
                      Row(
                        children: [
                          MyContainer.rounded(
                            height: 36,
                            width: 36,
                            paddingAll: 0,
                            child: Image.asset('assets/images/users/avatar-1.jpg', fit: BoxFit.cover),
                          ),
                          MySpacing.width(12),
                          Expanded(
                            child: TextFormField(
                              keyboardType: TextInputType.multiline,
                              maxLines: 1,
                              decoration: InputDecoration(
                                  filled: true,
                                  fillColor: contentTheme.disabled,
                                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(4), borderSide: BorderSide.none),
                                  hintText: "Add Comment",
                                  hintStyle: MyTextStyle.bodySmall(xMuted: true),
                                  contentPadding: MySpacing.all(16),
                                  isCollapsed: true,
                                  floatingLabelBehavior: FloatingLabelBehavior.never),
                            ),
                          )
                        ],
                      )
                    ],
                  ),
                ),
                Padding(
                  padding: MySpacing.all(16),
                  child: Row(
                    children: [
                      Icon(Remix.heart_line, size: 18, color: contentTheme.danger),
                      MySpacing.width(8),
                      MyText.bodySmall("Like (28)", fontWeight: 600, muted: true, color: contentTheme.danger),
                      MySpacing.width(20),
                      Icon(Remix.share_line, size: 18, color: contentTheme.secondary),
                      MySpacing.width(8),
                      MyText.bodySmall("Share", fontWeight: 600, muted: true),
                    ],
                  ),
                )
              ],
            ),
          ),
          MySpacing.height(16),
          MyContainer.bordered(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    MyContainer.rounded(
                      height: 36,
                      width: 36,
                      paddingAll: 0,
                      child: Image.asset('assets/images/users/avatar-3.jpg', fit: BoxFit.cover),
                    ),
                    MySpacing.width(12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        MyText.bodyMedium("Jeremy Tomlinson", fontWeight: 600),
                        MySpacing.height(4),
                        MyText.bodySmall("3 hours ago", muted: true),
                      ],
                    )
                  ],
                ),
                MySpacing.height(20),
                MyText.bodyMedium('Story based around the idea of time lapse, animation to post soon!', muted: true),
                MySpacing.height(20),
                Wrap(
                  spacing: 16,
                  runSpacing: 16,
                  children: [
                    MyContainer(
                      height: 70,
                      width: 100,
                      paddingAll: 0,
                      borderRadiusAll: 4,
                      clipBehavior: Clip.antiAlias,
                      child: Image.asset('assets/images/small/small-1.jpg', fit: BoxFit.cover),
                    ),
                    MyContainer(
                      height: 70,
                      width: 100,
                      paddingAll: 0,
                      borderRadiusAll: 4,
                      clipBehavior: Clip.antiAlias,
                      child: Image.asset('assets/images/small/small-2.jpg', fit: BoxFit.cover),
                    ),
                    MyContainer(
                      height: 70,
                      width: 100,
                      paddingAll: 0,
                      borderRadiusAll: 4,
                      clipBehavior: Clip.antiAlias,
                      child: Image.asset('assets/images/small/small-3.jpg', fit: BoxFit.cover),
                    ),
                  ],
                ),
                MySpacing.height(20),
                Row(
                  children: [
                    Icon(Remix.reply_line, size: 18, color: contentTheme.secondary),
                    MySpacing.width(8),
                    MyText.bodySmall("Reply", muted: true),
                    MySpacing.width(20),
                    Icon(Remix.heart_line, size: 18, color: contentTheme.secondary),
                    MySpacing.width(8),
                    MyText.bodySmall("Like", muted: true),
                    MySpacing.width(20),
                    Icon(Remix.share_line, size: 18, color: contentTheme.secondary),
                    MySpacing.width(8),
                    MyText.bodySmall("Share", muted: true),
                  ],
                ),
              ],
            ),
          ),
          MySpacing.height(20),
          Center(
            child: MyButton.text(
                onPressed: () {},
                padding: MySpacing.xy(8, 4),
                splashColor: contentTheme.danger.withAlpha(40),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Remix.loader_2_line, color: contentTheme.danger, size: 16),
                    MySpacing.width(4),
                    MyText.labelMedium("Load More", fontWeight: 600, color: contentTheme.danger),
                  ],
                )),
          ),
        ],
      ),
    );
  }

  Widget settingsDetails() {
    buildSocialTextField(String fieldTitle, String hintText, IconData icon) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.labelMedium(fieldTitle, muted: true),
          MySpacing.height(8),
          TextFormField(
            keyboardType: TextInputType.multiline,
            decoration: InputDecoration(
              hintText: hintText,
              hintStyle: MyTextStyle.bodySmall(xMuted: true),
              border: outlineInputBorder,
              enabledBorder: outlineInputBorder,
              disabledBorder: outlineInputBorder,
              focusedBorder: outlineInputBorder,
              errorBorder: outlineInputBorder,
              focusedErrorBorder: outlineInputBorder,
              prefixIcon: MyContainer.bordered(
                color: contentTheme.secondary.withAlpha(10),
                border: Border(
                  right: BorderSide(width: 1.5, color: Colors.grey.withAlpha(40)),
                ),
                margin: MySpacing.right(12),
                paddingAll: 0,
                alignment: Alignment.center,
                child: Icon(icon, size: 18),
              ),
              prefixIconConstraints: BoxConstraints(maxHeight: 40, minWidth: 65, maxWidth: 65),
              contentPadding: MySpacing.all(12),
              isCollapsed: true,
              floatingLabelBehavior: FloatingLabelBehavior.never,
            ),
          ),
        ],
      );
    }

    buildTextField(String fieldTitle) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.labelMedium(fieldTitle, muted: true),
          MySpacing.height(8),
          TextFormField(
            decoration: InputDecoration(
              hintText: "Enter $fieldTitle",
              hintStyle: MyTextStyle.bodySmall(xMuted: true),
              border: outlineInputBorder,
              enabledBorder: outlineInputBorder,
              disabledBorder: outlineInputBorder,
              focusedBorder: outlineInputBorder,
              errorBorder: outlineInputBorder,
              focusedErrorBorder: outlineInputBorder,
              contentPadding: MySpacing.all(16),
              isCollapsed: true,
              floatingLabelBehavior: FloatingLabelBehavior.never,
            ),
          ),
        ],
      );
    }

    return MyContainer(
        paddingAll: 0,
        child: Column(
          children: [
            Row(
              children: [
                Icon(Remix.contacts_book_2_line, size: 18),
                MySpacing.width(12),
                MyText.bodyMedium("PERSONAL INFO", muted: true, fontWeight: 600),
              ],
            ),
            MySpacing.height(24),
            MyFlex(
              children: [
                MyFlexItem(sizes: "md-6 sm-12", child: buildTextField('First Name')),
                MyFlexItem(sizes: "md-6 sm-12", child: buildTextField("Last Name")),
              ],
            ),
            Padding(
              padding: MySpacing.xy(12, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  MyText.labelMedium("Bio", muted: true, fontWeight: 600),
                  MySpacing.height(8),
                  TextFormField(
                    keyboardType: TextInputType.multiline,
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText: "Write somethings...",
                      hintStyle: MyTextStyle.bodySmall(xMuted: true),
                      border: outlineInputBorder,
                      enabledBorder: outlineInputBorder,
                      disabledBorder: outlineInputBorder,
                      focusedBorder: outlineInputBorder,
                      errorBorder: outlineInputBorder,
                      focusedErrorBorder: outlineInputBorder,
                      contentPadding: MySpacing.all(16),
                      isCollapsed: true,
                      floatingLabelBehavior: FloatingLabelBehavior.never,
                    ),
                  ),
                ],
              ),
            ),
            MyFlex(
              children: [
                MyFlexItem(sizes: "md-6 sm-12", child: buildTextField("Email Address")),
                MyFlexItem(
                  sizes: "md-6 sm-12",
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      MyText.bodySmall('Password', fontWeight: 600),
                      MySpacing.height(8),
                      TextFormField(
                        decoration: InputDecoration(
                          hintText: "********",
                          hintStyle: MyTextStyle.bodySmall(xMuted: true),
                          border: outlineInputBorder,
                          enabledBorder: outlineInputBorder,
                          disabledBorder: outlineInputBorder,
                          focusedBorder: outlineInputBorder,
                          errorBorder: outlineInputBorder,
                          focusedErrorBorder: outlineInputBorder,
                          contentPadding: MySpacing.all(16),
                          isCollapsed: true,
                          floatingLabelBehavior: FloatingLabelBehavior.never,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            MySpacing.height(24),
            Row(
              children: [
                Icon(Remix.building_line, size: 18),
                MySpacing.width(12),
                MyText.bodySmall("COMPANY INFO", muted: true, fontWeight: 600),
              ],
            ),
            MySpacing.height(24),
            MyFlex(
              children: [
                MyFlexItem(sizes: "md-6 sm-12", child: buildTextField('Company Name')),
                MyFlexItem(sizes: "md-6 sm-12", child: buildTextField("Website")),
              ],
            ),
            MySpacing.height(24),
            Row(
              children: [
                Icon(Remix.globe_line, size: 18),
                MySpacing.width(12),
                MyText.bodySmall("SOCIAL", muted: true, fontWeight: 600),
              ],
            ),
            MySpacing.height(24),
            MyFlex(
              children: [
                MyFlexItem(
                  sizes: "md-6 sm-12",
                  child: buildSocialTextField("Facebook", 'Url', Remix.facebook_fill),
                ),
                MyFlexItem(
                  sizes: "md-6 sm-12",
                  child: buildSocialTextField("Twitter", 'Username', Remix.twitter_line),
                ),
              ],
            ),
            MySpacing.height(24),
            MyFlex(
              children: [
                MyFlexItem(
                  sizes: "md-6 sm-12",
                  child: buildSocialTextField("Instagram", 'Url', Remix.instagram_line),
                ),
                MyFlexItem(
                  sizes: "md-6 sm-12",
                  child: buildSocialTextField("LinkedIn", 'Url', Remix.linkedin_fill),
                ),
              ],
            ),
            MySpacing.height(24),
            MyFlex(
              children: [
                MyFlexItem(
                  sizes: "md-6 sm-12",
                  child: buildSocialTextField("Skype", '@username', Remix.skype_line),
                ),
                MyFlexItem(
                  sizes: "md-6 sm-12",
                  child: buildSocialTextField("GitHub", 'Username', Remix.github_line),
                ),
              ],
            ),
            MySpacing.height(24),
            Padding(
              padding: MySpacing.x(12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  MyButton(
                    onPressed: () {},
                    elevation: 0,
                    padding: MySpacing.xy(20, 16),
                    backgroundColor: contentTheme.success,
                    borderRadiusAll: AppStyle.buttonRadius.medium,
                    child: Row(
                      children: [
                        Icon(LucideIcons.save, size: 18),
                        MySpacing.width(8),
                        MyText.bodySmall('Save', color: contentTheme.onPrimary),
                      ],
                    ),
                  )
                ],
              ),
            ),
          ],
        ));
  }

  Widget tab() {
    Widget selectTab(int selectTab, String title) {
      bool isSelect = controller.isSelectTab == selectTab;
      return Expanded(
        child: MyContainer(
          paddingAll: 8,
          onTap: () => controller.onSelectTabToggle(selectTab),
          color: isSelect ? contentTheme.primary : contentTheme.cardShadow,
          child: Center(child: MyText.titleSmall(title, fontWeight: 600, color: contentTheme.onPrimary)),
        ),
      );
    }

    return Row(
      children: [
        selectTab(0, "About"),
        MySpacing.width(20),
        selectTab(1, "Timeline"),
        MySpacing.width(20),
        selectTab(2, "Settings"),
      ],
    );
  }

  Widget messageList() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              MyText.bodyMedium("Messages", fontWeight: 600),
              buildPopUpMenu(),
            ],
          ),
          MySpacing.height(20),
          contactsList(),
        ],
      ),
    );
  }

  Widget contactsList() {
    return ListView.separated(
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
                  MyText.bodyMedium(name, fontWeight: 600, maxLines: 1, overflow: TextOverflow.ellipsis, muted: true),
                  MySpacing.height(4),
                  MyText.bodySmall(chat.messages[0].message, overflow: TextOverflow.ellipsis, xMuted: true),
                ],
              ),
            ),
            MySpacing.width(24),
            MyText.bodySmall("Reply", fontWeight: 600, color: contentTheme.primary)
          ],
        );
      },
      separatorBuilder: (context, index) => Divider(height: 28),
    );
  }

  Widget buildPopUpMenu() {
    return PopupMenuButton(
      offset: Offset(-90, 26),
      clipBehavior: Clip.antiAliasWithSaveLayer,
      shape: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
      itemBuilder: (BuildContext context) => [
        PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Setting", fontWeight: 600)),
        PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Action", fontWeight: 600)),
      ],
      child: Icon(LucideIcons.ellipsis_vertical, size: 16),
    );
  }

  Widget userDetail() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: MyContainer.roundBordered(
                paddingAll: 4,
                clipBehavior: Clip.antiAliasWithSaveLayer,
                child: MyContainer.rounded(
                  paddingAll: 0,
                  height: 90,
                  width: 90,
                  clipBehavior: Clip.antiAliasWithSaveLayer,
                  child: Image.asset(Images.avatars[0], fit: BoxFit.cover),
                )),
          ),
          MySpacing.height(12),
          Center(child: MyText.titleMedium("Tosha Minner", fontWeight: 600)),
          MySpacing.height(4),
          Center(child: MyText.bodyMedium("Founder", fontWeight: 600, muted: true)),
          MySpacing.height(12),
          Center(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                MyContainer(
                  onTap: (){},
                    padding: MySpacing.xy(12, 8),
                    borderRadiusAll: 2,
                    clipBehavior: Clip.antiAliasWithSaveLayer,
                    color: contentTheme.success,
                    child: Center(child: MyText.bodyMedium("Follow", color: contentTheme.onSuccess))),
                MySpacing.width(4),
                MyContainer(
                    onTap: (){},
                    padding: MySpacing.xy(12, 8),
                    borderRadiusAll: 2,
                    clipBehavior: Clip.antiAliasWithSaveLayer,
                    color: contentTheme.danger,
                    child: Center(child: MyText.bodyMedium("Message", color: contentTheme.onDanger))),
              ],
            ),
          ),
          MySpacing.height(12),
          MyText.bodyMedium("ABOUT ME:", fontWeight: 600, muted: true),
          MySpacing.height(8),
          MyText.bodySmall(controller.dummyTexts[5], maxLines: 2, fontWeight: 600, xMuted: true),
          MySpacing.height(16),
          richText("Full Name", "Tosha k. Minnar"),
          MySpacing.height(8),
          richText("Mobile", "(123) 123 1234"),
          MySpacing.height(8),
          richText("Email", "user@email.domain"),
          MySpacing.height(8),
          richText("Location", "USA"),
          MySpacing.height(16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              MyContainer.roundBordered(
                onTap: () {},
                paddingAll: 4,
                borderColor: contentTheme.primary,
                child: Icon(Remix.facebook_circle_fill, size: 18, color: contentTheme.primary),
              ),
              MySpacing.width(12),
              MyContainer.roundBordered(
                onTap: () {},
                paddingAll: 4,
                borderColor: contentTheme.danger,
                child: Icon(Remix.google_fill, size: 18, color: contentTheme.danger),
              ),
              MySpacing.width(12),
              MyContainer.roundBordered(
                onTap: () {},
                paddingAll: 4,
                borderColor: contentTheme.info,
                child: Icon(Remix.twitter_fill, size: 18, color: contentTheme.info),
              ),
              MySpacing.width(12),
              MyContainer.roundBordered(
                onTap: () {},
                paddingAll: 4,
                borderColor: contentTheme.secondary,
                child: Icon(Remix.github_fill, size: 18, color: contentTheme.secondary),
              ),
            ],
          )
        ],
      ),
    );
  }

  RichText richText(String title, detail) => RichText(
          text: TextSpan(children: [
        TextSpan(text: '$title : ', style: MyTextStyle.bodyMedium(fontWeight: 700, xMuted: true)),
        TextSpan(text: ' $detail', style: MyTextStyle.bodySmall(fontWeight: 600, muted: true)),
      ]));
}
