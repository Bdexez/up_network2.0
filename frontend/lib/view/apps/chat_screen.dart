import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/controller/apps/chat_controller.dart';
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

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> with SingleTickerProviderStateMixin, UIMixin {
  late ChatController controller = Get.put(ChatController());
  @override
  OutlineInputBorder outlineInputBorder = OutlineInputBorder(borderSide: BorderSide.none);

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'chat_controller',
        builder: (controller) {
          return Column(
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Chat", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Apps'),
                        MyBreadcrumbItem(name: 'Chat'),
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
                    MyFlexItem(sizes: 'xxl-3 xl-3 lg-3 md-5 sm-12', child: chatIndex()),
                    MyFlexItem(sizes: 'xxl-9 xl-9 lg-9 md-7 sm-12', child: chat()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget chat() {
    return MyCard(
      shadow: MyShadow(elevation: 1, position: MyShadowPosition.bottom),
      paddingAll: 0,
      child: Column(
        children: [
          Padding(
            padding: MySpacing.nBottom(24),
            child: userDetail(),
          ),
          Divider(height: 36),
          Padding(
            padding: MySpacing.bottom(16),
            child: SizedBox(
              height: 510,
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
                                  margin: EdgeInsets.only(
                                      left: isSent ? MediaQuery.of(context).size.width * 0.20 : 0,
                                      right: isSent ? 0 : MediaQuery.of(context).size.width * 0.20),
                                  color: theme,
                                  child: Column(
                                    crossAxisAlignment: isSent ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      !isSent
                                          ? MyText.bodySmall(controller.selectChat!.firstName, color: contentTheme.secondary, fontWeight: 600)
                                          : MyText.bodySmall("Tosha Minner", color: contentTheme.onPrimary),
                                      MySpacing.height(4),
                                      MyText.bodyMedium(message.message,
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
                                child: Image.asset(Images.avatars[0], fit: BoxFit.cover),
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
          MyContainer(color: contentTheme.dark.withAlpha(32), child: sendMessage()),
        ],
      ),
    );
  }

  Widget sendMessage() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Expanded(
          child: MyContainer(
            paddingAll: 0,
            child: TextFormField(
              maxLines: 1,
              minLines: 1,
              textInputAction: TextInputAction.go,
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
        ),
        MySpacing.width(12),
        MyContainer.transparent(
          onTap: () {},
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

  Widget userDetail() {
    return Row(
      children: [
        if (controller.selectChat != null)
          MyContainer.rounded(
            height: 44,
            width: 44,
            paddingAll: 0,
            clipBehavior: Clip.antiAliasWithSaveLayer,
            child: Image.asset(
              controller.selectChat!.image,
              fit: BoxFit.cover,
            ),
          ),
        MySpacing.width(12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (controller.selectChat != null) MyText.bodyMedium(controller.selectChat!.firstName, fontWeight: 600),
            Row(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                MyContainer.rounded(paddingAll: 4, color: Colors.green),
                MySpacing.width(4),
                MyText.bodySmall("Active Now", fontWeight: 600, muted: true),
              ],
            )
          ],
        ),
        Spacer(),
        InkWell(onTap: () {}, child: Icon(LucideIcons.phone_call, size: 20)),
        MySpacing.width(12),
        InkWell(onTap: () {}, child: Icon(LucideIcons.video, size: 20)),
        MySpacing.width(12),
        InkWell(onTap: () {}, child: Icon(LucideIcons.users, size: 20)),
        MySpacing.width(12),
        InkWell(onTap: () {}, child: Icon(LucideIcons.trash_2, size: 20)),
      ],
    );
  }

  Widget chatIndex() {
    return MyCard(
      shadow: MyShadow(elevation: 1, position: MyShadowPosition.bottom),
      height: 715,
      paddingAll: 0,
      child: Column(
        children: [
          Padding(
            padding: MySpacing.nBottom(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    MyContainer.rounded(
                      paddingAll: 0,
                      height: 44,
                      width: 44,
                      clipBehavior: Clip.antiAliasWithSaveLayer,
                      child: Image.asset(Images.avatars[0], fit: BoxFit.cover),
                    ),
                    MySpacing.width(20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          MyText.titleMedium("Tosha Minner", fontWeight: 600, muted: true, maxLines: 1),
                          MySpacing.height(4),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.start,
                            children: [
                              MyContainer.rounded(
                                height: 8,
                                width: 8,
                                paddingAll: 0,
                                color: contentTheme.success,
                              ),
                              MySpacing.width(4),
                              MyText.titleSmall("Online", xMuted: true)
                            ],
                          )
                        ],
                      ),
                    ),
                    InkWell(onTap: () {}, child: Icon(Remix.settings_5_line, size: 22))
                  ],
                ),
                MySpacing.height(20),
                indexField(),
                MySpacing.height(20),
                MyText.titleSmall("GROUP CHAT", fontWeight: 600, xMuted: true),
                MySpacing.height(20),
                chatGroup(contentTheme.success, "App Development"),
                MySpacing.height(16),
                chatGroup(contentTheme.warning, "Office Work"),
                MySpacing.height(20),
                MyText.titleSmall("CONTACTS", fontWeight: 600, xMuted: true),
                MySpacing.height(20),
              ],
            ),
          ),
          contactsList(),
          MySpacing.height(20),
        ],
      ),
    );
  }

  Widget contactsList() {
    return Expanded(
      child: controller.searchChat.isEmpty
          ? Center(child: MyText.bodyMedium("Not User Found", fontWeight: 600))
          : ListView.separated(
              shrinkWrap: true,
              clipBehavior: Clip.antiAliasWithSaveLayer,
              itemCount: controller.searchChat.length,
              padding: MySpacing.x(16),
              itemBuilder: (context, index) {
                ChatModel chat = controller.chat[index];
                String name = chat.firstName;
                return MyButton(
                  onPressed: () => controller.onChangeChat(chat),
                  elevation: 0,
                  borderRadiusAll: 8,
                  padding: MySpacing.all(12),
                  backgroundColor: theme.colorScheme.surface.withAlpha(5),
                  splashColor: theme.colorScheme.onSurface.withAlpha(10),
                  child: Row(
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
                            MySpacing.height(6),
                            MyText.bodySmall(chat.messages.lastOrNull!.message, overflow: TextOverflow.ellipsis, muted: true),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
              separatorBuilder: (context, index) => SizedBox(height: 20),
            ),
    );
  }

  Widget chatGroup(Color borderColor, String title) {
    return Row(
      children: [MyContainer.roundBordered(paddingAll: 4, borderColor: borderColor), MySpacing.width(12), MyText.bodyMedium(title, xMuted: true)],
    );
  }

  Widget indexField() {
    return TextFormField(
      onChanged: controller.onSearchChat,
      controller: controller.searchController,
      decoration: InputDecoration(
        filled: true,
        hintText: 'People groups & messages',
        hintStyle: MyTextStyle.bodyMedium(muted: true),
        border: outlineInputBorder,
        enabledBorder: outlineInputBorder,
        focusedBorder: outlineInputBorder,
        errorBorder: outlineInputBorder,
        disabledBorder: outlineInputBorder,
        focusedErrorBorder: outlineInputBorder,
        isDense: true,
        prefixIcon: Icon(LucideIcons.search),
        contentPadding: MySpacing.all(14),
      ),
    );
  }
}
