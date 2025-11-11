import 'dart:async';

import 'package:flutter/material.dart';
import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/utils/generator.dart';
import 'package:henox/model/chat_modal.dart';

class ChatController extends MyController {
  List<ChatModel> chat = [];
  List<ChatModel> searchChat = [];
  ChatModel? selectChat;
  ScrollController? scrollController;
  SearchController searchController = SearchController();
  TextEditingController messageController = TextEditingController();
  late Timer _timer;
  int _nowTime = 0;
  String timeText = "00 : 00";

  @override
  void onInit() {
    ChatModel.dummyList.then((value) {
      chat = value;
      searchChat = value;
      selectChat = chat[0];
      update();
    });
    startTimer();
    scrollController = ScrollController();
    super.onInit();
  }

  void onChangeChat(ChatModel selectSingleChat) {
    selectChat = selectSingleChat;
    update();
  }

  void onSearchChat(String query) {
    final input = query.toLowerCase();
    searchChat = chat
        .where((chat) =>
            chat.firstName.toLowerCase().contains(input) ||
            chat.messages.lastOrNull!.message.toLowerCase().contains(input))
        .toList();
    update();
  }

  void sendMessage() {
    if (messageController.value.text.isNotEmpty && selectChat != null) {
      selectChat!.messages.add(
          ChatMessageModel(-1, messageController.text, DateTime.now(), true));
      messageController.clear();
      scrollToBottom(isDelayed: true);
      update();
    }
  }

  scrollToBottom({bool isDelayed = false}) {
    final int delay = isDelayed ? 400 : 0;
    Future.delayed(Duration(milliseconds: delay), () {
      scrollController!.animateTo(scrollController!.position.maxScrollExtent,
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeInOutCubicEmphasized);
    });
  }

  void startTimer() {
    const oneSec = Duration(seconds: 1);
    _timer = Timer.periodic(oneSec, (Timer timer) {
      _nowTime = _nowTime + 1;
      timeText = Generator.getTextFromSeconds(time: _nowTime);
      update();
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }
}
