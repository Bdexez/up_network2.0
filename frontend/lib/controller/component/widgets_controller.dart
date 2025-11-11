import 'dart:async';

import 'package:flutter/material.dart';
import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/utils/generator.dart';
import 'package:henox/model/chat_modal.dart';
import 'package:syncfusion_flutter_charts/charts.dart';

class ChartSampleData {
  ChartSampleData(
      {this.x,
      this.y,
      this.xValue,
      this.yValue,
      this.secondSeriesYValue,
      this.thirdSeriesYValue,
      this.pointColor,
      this.size,
      this.text,
      this.open,
      this.close,
      this.low,
      this.high,
      this.volume});

  final dynamic x;
  final num? y;
  final dynamic xValue;
  final num? yValue;
  final num? secondSeriesYValue;
  final num? thirdSeriesYValue;
  final Color? pointColor;
  final num? size;
  final String? text;
  final num? open;
  final num? close;
  final num? low;
  final num? high;
  final num? volume;
}

class _ChartData {
  _ChartData(this.x, this.y);
  final double x;
  final double y;
}

class Todo {
  String title;
  bool isDone;

  Todo({
    required this.title,
    this.isDone = false,
  });
}

class TransactionItem {
  final IconData icon;
  final String title;
  final String date;
  final double amount;

  TransactionItem({
    required this.icon,
    required this.title,
    required this.date,
    required this.amount,
  });
}

class WidgetsController extends MyController {
  List<ChatModel> chat = [];
  List<ChatModel> searchChat = [];
  ChatModel? selectChat;
  ScrollController? scrollController;
  SearchController searchController = SearchController();
  TextEditingController messageController = TextEditingController();
  late Timer _timer;
  int _nowTime = 0;
  String timeText = "00 : 00";
  final TextEditingController todoTEController = TextEditingController();

  var todos = <Todo>[
    Todo(title: "Build an angular app"),
    Todo(title: "Create new version 3.0"),
    Todo(title: "Hehe!! This looks cool!"),
    Todo(title: "Testing??"),
    Todo(title: "Creating component page"),
  ];

  void addTodo(String title) {
    if (title.isNotEmpty) {
      todos.add(Todo(title: title));
    }
    update();
  }

  void toggleTodoStatus(int index) {
    todos[index].isDone = !todos[index].isDone;
    update();
  }

  void archiveTodos() {
    todos.clear();
    update();
  }

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
        .where((chat) => chat.firstName.toLowerCase().contains(input) || chat.messages.lastOrNull!.message.toLowerCase().contains(input))
        .toList();
    update();
  }

  void sendMessage() {
    if (messageController.value.text.isNotEmpty && selectChat != null) {
      selectChat!.messages.add(ChatMessageModel(-1, messageController.text, DateTime.now(), true));
      messageController.clear();
      scrollToBottom(isDelayed: true);
      update();
    }
  }

  scrollToBottom({bool isDelayed = false}) {
    final int delay = isDelayed ? 400 : 0;
    Future.delayed(Duration(milliseconds: delay), () {
      scrollController!
          .animateTo(scrollController!.position.maxScrollExtent, duration: const Duration(milliseconds: 500), curve: Curves.easeInOutCubicEmphasized);
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

  List<ChartSampleData> columnChartData = [
    ChartSampleData(x: 1, y: 35),
    ChartSampleData(x: 2, y: 23),
    ChartSampleData(x: 3, y: 34),
    ChartSampleData(x: 4, y: 25),
    ChartSampleData(x: 5, y: 40),
    ChartSampleData(x: 6, y: 35),
    ChartSampleData(x: 7, y: 30),
    ChartSampleData(x: 8, y: 25),
    ChartSampleData(x: 9, y: 30),
  ];

  List<SplineSeries<_ChartData, num>> lineChartData() {
    return <SplineSeries<_ChartData, num>>[
      SplineSeries<_ChartData, num>(
          splineType: SplineType.natural,
          dataSource: <_ChartData>[
            _ChartData(2011, 0.05),
            _ChartData(2011.25, 0),
            _ChartData(2011.50, 0.03),
            _ChartData(2011.75, 0),
            _ChartData(2012, 0.04),
            _ChartData(2012.25, 0.02),
            _ChartData(2012.50, -0.01),
            _ChartData(2012.75, 0.01),
            _ChartData(2013, -0.08),
            _ChartData(2013.25, -0.02),
            _ChartData(2013.50, 0.03),
            _ChartData(2013.75, 0.05),
            _ChartData(2014, 0.04),
            _ChartData(2014.25, 0.02),
            _ChartData(2014.50, 0.04),
            _ChartData(2014.75, 0),
            _ChartData(2015, 0.02),
            _ChartData(2015.25, 0.10),
            _ChartData(2015.50, 0.09),
            _ChartData(2015.75, 0.11),
            _ChartData(2016, 0.12),
          ],
          xValueMapper: (_ChartData sales, _) => sales.x,
          yValueMapper: (_ChartData sales, _) => sales.y)
    ];
  }

  final List<TransactionItem> transactions = [
    TransactionItem(
      icon: Icons.arrow_upward,
      title: 'Purchased Henox Admin Template',
      date: 'Today',
      amount: -489.30,
    ),
    TransactionItem(
      icon: Icons.arrow_downward,
      title: 'Payment received Bootstrap Marketplace',
      date: 'Yesterday',
      amount: 1578.54,
    ),
    TransactionItem(
      icon: Icons.arrow_downward,
      title: 'Freelance work - Shane',
      date: '16 Sep 2018',
      amount: 247.5,
    ),
    TransactionItem(
      icon: Icons.arrow_upward,
      title: 'Hire new developer for work',
      date: '09 Sep 2018',
      amount: -185.14,
    ),
    TransactionItem(
      icon: Icons.arrow_downward,
      title: 'Money received from Paypal',
      date: '28 Aug 2018',
      amount: 684.45,
    ),
    TransactionItem(
      icon: Icons.arrow_upward,
      title: 'Zairo landing purchased',
      date: '17 Aug 2018',
      amount: -21.00,
    ),
  ];
  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }
}
