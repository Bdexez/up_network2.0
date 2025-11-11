import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:henox/helpers/services/json_decoder.dart';
import 'package:henox/model/identifier_model.dart';

class TotalTaskModel extends IdentifierModel {
  final String task, taskID,  status, priority;
  final DateTime assignedDate, dueDate;
  final List<String>? assignedTo;

  TotalTaskModel(super.id, this.task, this.taskID, this.assignedDate,
      this.dueDate, this.status, this.priority, this.assignedTo);

  static TotalTaskModel fromJSON(Map<String, dynamic> json) {
    JSONDecoder decoder = JSONDecoder(json);

    String task = decoder.getString('task');
    String taskID = decoder.getString('task_id');
    DateTime assignedDate = decoder.getDateTime('assigned_date');
    DateTime dueDate = decoder.getDateTime('due_date');
    String status = decoder.getString('status');
    String priority = decoder.getString('priority');

    List<String>? assignedTo = decoder.getObjectListOrNull('assigned_to');

    return TotalTaskModel(decoder.getId, task, taskID, assignedDate, dueDate,
        status, priority, assignedTo);
  }

  static List<TotalTaskModel> listFromJSON(List<dynamic> list) {
    return list.map((e) => TotalTaskModel.fromJSON(e)).toList();
  }

  static List<TotalTaskModel>? _dummyList;

  static Future<List<TotalTaskModel>> get dummyList async {
    if (_dummyList == null) {
      dynamic data = json.decode(await getData());
      _dummyList = listFromJSON(data);
    }

    return _dummyList!;
  }

  static Future<String> getData() async {
    return await rootBundle.loadString('assets/data/total_task_data.json');
  }
}
