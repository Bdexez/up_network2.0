import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/controller/apps/email/inbox_controller.dart';
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
import 'package:henox/helpers/widgets/my_progress_bar.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/helpers/widgets/my_text_style.dart';
import 'package:henox/model/email_model.dart';
import 'package:henox/view/layouts/layout.dart';
import 'package:quill_html_editor/quill_html_editor.dart';
import 'package:remixicon/remixicon.dart';

class InboxScreen extends StatefulWidget {
  const InboxScreen({super.key});

  @override
  State<InboxScreen> createState() => _InboxScreenState();
}

class _InboxScreenState extends State<InboxScreen> with SingleTickerProviderStateMixin, UIMixin {
  late InboxController controller = Get.put(InboxController());

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'inbox_controller',
        builder: (controller) {
          return Column(
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Inbox", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Email'),
                        MyBreadcrumbItem(name: 'Inbox'),
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
                    MyFlexItem(sizes: 'lg-2.5 md-5', child: emailCompose()),
                    MyFlexItem(sizes: 'lg-9.5 md-7', child: emailListing()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget emailCompose() {
    Widget emailLabelWidget(IconData icon, String title) {
      return InkWell(
        onTap: () {},
        child: Row(
          children: [
            Icon(icon, size: 16),
            MySpacing.width(12),
            MyText.bodySmall(title, fontWeight: 600, muted: true),
          ],
        ),
      );
    }

    Widget labelWidget(String text, Color color) {
      return InkWell(
        onTap: () {},
        child: Row(
          children: [
            MyContainer.rounded(paddingAll: 6, color: color),
            MySpacing.width(12),
            MyText.bodySmall(text, fontWeight: 600, muted: true),
          ],
        ),
      );
    }

    Widget composeBTN() {
      return MyButton.block(
          backgroundColor: contentTheme.danger,
          elevation: 0,
          padding: MySpacing.all(20),
          onPressed: () => showDialog(
                context: context,
                builder: (BuildContext context) => composeEmail(),
              ),
          child: MyText.bodyMedium("Compose", color: contentTheme.onDanger));
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      height: 800,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          composeBTN(),
          MySpacing.height(20),
          emailLabelWidget(Remix.inbox_line, "Inbox"),
          MySpacing.height(20),
          emailLabelWidget(Remix.star_line, "Starred"),
          MySpacing.height(20),
          emailLabelWidget(Remix.article_line, "Draft"),
          MySpacing.height(20),
          emailLabelWidget(Remix.mail_send_line, "Sent Mail"),
          MySpacing.height(20),
          emailLabelWidget(Remix.delete_bin_line, "Trash"),
          MySpacing.height(20),
          emailLabelWidget(Remix.price_tag_3_line, "Important"),
          MySpacing.height(20),
          emailLabelWidget(Remix.alert_line, "Spam"),
          MySpacing.height(20),
          MyText.bodyMedium("Labels", fontWeight: 600),
          MySpacing.height(20),
          labelWidget('Updates', Colors.blue),
          MySpacing.height(20),
          labelWidget('Friends', Colors.orange),
          MySpacing.height(20),
          labelWidget('Family', Colors.green),
          MySpacing.height(20),
          labelWidget('Social', Colors.blueAccent),
          MySpacing.height(20),
          labelWidget('Important', Colors.red),
          MySpacing.height(20),
          labelWidget('Promotions', Colors.grey),
          Spacer(),
          MyText.bodySmall("STORAGE", fontWeight: 600),
          MySpacing.height(12),
          MyProgressBar(width: 300, progress: 0.35, height: 5, radius: 4, inactiveColor: theme.dividerColor, activeColor: contentTheme.success),
          MySpacing.height(14),
          RichText(
            text: TextSpan(
              children: [
                TextSpan(
                  text: '7.02 GB ',
                  style: MyTextStyle.bodyMedium(fontWeight: 600),
                ),
                TextSpan(text: '(46%) of  ', style: MyTextStyle.bodyMedium()),
                TextSpan(
                  text: '15 GB',
                  style: MyTextStyle.bodyMedium(fontWeight: 600),
                ),
                TextSpan(text: ' used', style: MyTextStyle.bodyMedium()),
              ],
            ),
          ),
        ],
      ),
    );
  }

  composeEmail() {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: 450, minWidth: 250),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            MyContainer(
              color: contentTheme.primary,
              clipBehavior: Clip.antiAliasWithSaveLayer,
              borderRadius: BorderRadius.vertical(top: Radius.circular(8)),
              paddingAll: 12,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  MyText.titleMedium('New Message', color: contentTheme.onPrimary, fontWeight: 600),
                  IconButton(
                      onPressed: () => Get.back(),
                      visualDensity: VisualDensity.compact,
                      iconSize: 18,
                      icon: Icon(LucideIcons.x, color: contentTheme.onPrimary))
                ],
              ),
            ),
            Padding(
              padding: MySpacing.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  MyText.titleMedium("To", fontWeight: 600, muted: true),
                  MySpacing.height(8),
                  TextField(
                    style: MyTextStyle.bodyMedium(),
                    decoration: InputDecoration(
                        hintText: 'example@gmail.com',
                        hintStyle: MyTextStyle.bodyMedium(),
                        border: OutlineInputBorder(borderSide: BorderSide(width: 2))),
                  ),
                  MySpacing.height(20),
                  MyText.titleMedium("Subject", fontWeight: 600, muted: true),
                  MySpacing.height(8),
                  TextField(
                    style: MyTextStyle.bodyMedium(),
                    decoration: InputDecoration(
                        hintText: 'Your subject', hintStyle: MyTextStyle.bodyMedium(), border: OutlineInputBorder(borderSide: BorderSide(width: 2))),
                  ),
                  MySpacing.height(20),
                  MyContainer.bordered(
                    paddingAll: 0,
                    child: Column(
                      children: [
                        ToolBar(
                          toolBarColor: contentTheme.background,
                          iconColor: contentTheme.onBackground,
                          padding: EdgeInsets.all(8),
                          iconSize: 20,
                          controller: controller.quillHtmlEditor,
                        ),
                        SizedBox(
                          height: 150,
                          child: QuillHtmlEditor(
                            text: "<h1>Hello</h1>This is a quill html editor example 😊",
                            hintText: 'Hint text goes here',
                            controller: controller.quillHtmlEditor,
                            isEnabled: true,
                            minHeight: 300,
                            textStyle: controller.editorTextStyle,
                            hintTextStyle: MyTextStyle.bodyMedium(),
                            hintTextAlign: TextAlign.start,
                            padding: EdgeInsets.only(left: 10, top: 5),
                            hintTextPadding: EdgeInsets.zero,
                            backgroundColor: contentTheme.background,
                            inputAction: InputAction.newline,
                            loadingBuilder: (context) {
                              return const Center(child: CircularProgressIndicator(strokeWidth: 0.4));
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                  MySpacing.height(20),
                  Row(
                    children: [
                      MyContainer(
                        onTap: () => Navigator.pop(context),
                        color: contentTheme.primary,
                        paddingAll: 12,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Remix.send_plane_2_line, color: contentTheme.onPrimary, size: 18),
                            MySpacing.width(4),
                            MyText.bodyMedium("Send Message", color: contentTheme.onPrimary, fontWeight: 600)
                          ],
                        ),
                      ),
                      MySpacing.width(12),
                      MyContainer(
                        onTap: () => Navigator.pop(context),
                        paddingAll: 12,
                        color: contentTheme.secondary.withAlpha(36),
                        child: MyText.bodyMedium("Cancel", fontWeight: 600, color: contentTheme.secondary),
                      )
                    ],
                  )
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget emailListing() {
    Widget listingHeader() {
      return Wrap(
        spacing: 20,
        runSpacing: 20,
        children: [
          MyContainer(
            paddingAll: 12,
            color: contentTheme.secondary,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Remix.inbox_archive_line, size: 18, color: contentTheme.onSecondary),
                MySpacing.width(20),
                Icon(Remix.spam_2_line, size: 18, color: contentTheme.onSecondary),
                MySpacing.width(20),
                Icon(Remix.delete_bin_line, size: 18, color: contentTheme.onSecondary),
              ],
            ),
          ),
          PopupMenuButton(
            offset: Offset(0, 44),
            clipBehavior: Clip.antiAliasWithSaveLayer,
            shape: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
            itemBuilder: (BuildContext context) => [
              PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Social", fontWeight: 600)),
              PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Promotion", fontWeight: 600)),
              PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Updates", fontWeight: 600)),
              PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Forums", fontWeight: 600)),
            ],
            child: MyContainer(
              color: contentTheme.secondary,
              paddingAll: 12,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Remix.folder_2_line, size: 18, color: contentTheme.onSecondary),
                  MySpacing.width(4),
                  Icon(LucideIcons.chevron_down, size: 18, color: contentTheme.onSecondary),
                ],
              ),
            ),
          ),
          PopupMenuButton(
            offset: Offset(0, 44),
            clipBehavior: Clip.antiAliasWithSaveLayer,
            shape: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
            itemBuilder: (BuildContext context) => [
              PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Updates", fontWeight: 600)),
              PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Social", fontWeight: 600)),
              PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Promotion", fontWeight: 600)),
              PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Forums", fontWeight: 600)),
            ],
            child: MyContainer(
              color: contentTheme.secondary,
              paddingAll: 12,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Remix.price_tag_3_line, size: 18, color: contentTheme.onSecondary),
                  MySpacing.width(4),
                  Icon(LucideIcons.chevron_down, size: 18, color: contentTheme.onSecondary),
                ],
              ),
            ),
          ),
          PopupMenuButton(
            offset: Offset(0, 44),
            clipBehavior: Clip.antiAliasWithSaveLayer,
            shape: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
            itemBuilder: (BuildContext context) => [
              PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Mark as unread", fontWeight: 600)),
              PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Add to task", fontWeight: 600)),
              PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Add star", fontWeight: 600)),
              PopupMenuItem(padding: MySpacing.xy(16, 8), height: 10, child: MyText.bodyMedium("Mute", fontWeight: 600)),
            ],
            child: MyContainer(
              color: contentTheme.secondary,
              paddingAll: 12,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Remix.more_line, size: 18, color: contentTheme.onSecondary),
                  MySpacing.width(4),
                  MyText.bodyMedium("More", fontWeight: 600, color: contentTheme.onSecondary),
                  MySpacing.width(4),
                  Icon(LucideIcons.chevron_down, size: 18, color: contentTheme.onSecondary),
                ],
              ),
            ),
          ),
        ],
      );
    }

    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      height: 800,
      paddingAll: 0,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(padding: MySpacing.all(24), child: listingHeader()),
          Expanded(
            child: ListView.separated(
              padding: MySpacing.nTop(20),
              shrinkWrap: true,
              itemCount: controller.emails.length,
              itemBuilder: (context, index) {
                EmailModel mail = controller.emails[index];
                return InkWell(
                  onTap: controller.gotoDetailScreen,
                  child: Row(
                    children: [
                      Theme(
                        data: ThemeData(unselectedWidgetColor: Colors.white),
                        child: Checkbox(
                          value: mail.isCheckMail,
                          activeColor: contentTheme.primary,
                          onChanged: (value) => controller.onCheckMail(mail),
                        ),
                      ),
                      MySpacing.width(20),
                      SizedBox(
                        width: 200,
                        child: MyText.bodySmall(mail.subject, fontWeight: 600, maxLines: 1, xMuted: mail.seen),
                      ),
                      MySpacing.width(20),
                      Expanded(
                        child: MyText.bodySmall(mail.details, fontWeight: 600, maxLines: 1, xMuted: mail.seen),
                      ),
                      MySpacing.width(20),
                      MyText.bodyMedium(mail.date, fontWeight: 600, maxLines: 1, xMuted: mail.seen),
                    ],
                  ),
                );
              },
              separatorBuilder: (context, index) {
                return SizedBox(height: 20);
              },
            ),
          )
        ],
      ),
    );
  }
}
