import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:henox/helpers/services/json_decoder.dart';
import 'package:henox/model/identifier_model.dart';

class ProjectModel extends IdentifierModel {
  final String name, avatar, projectName, startDate, dueDate, status;

  ProjectModel(super.id, this.name, this.avatar, this.projectName,
      this.startDate, this.dueDate, this.status);

  static ProjectModel fromJSON(Map<String, dynamic> json) {
    JSONDecoder decoder = JSONDecoder(json);

    String name = decoder.getString('name');
    String avatar = decoder.getString('avatar');
    String projectName = decoder.getString('project_name');
    String startDate = decoder.getString('start_date');
    String dueDate = decoder.getString('due_date');
    String status = decoder.getString('status');

    return ProjectModel(
        decoder.getId, name, avatar, projectName, startDate, dueDate, status);
  }

  static List<ProjectModel> listFromJSON(List<dynamic> list) {
    return list.map((e) => ProjectModel.fromJSON(e)).toList();
  }

  static List<ProjectModel>? _dummyList;

  static Future<List<ProjectModel>> get dummyList async {
    if (_dummyList == null) {
      dynamic data = json.decode(await getData());
      _dummyList = listFromJSON(data);
    }

    return _dummyList!;
  }

  static Future<String> getData() async {
    return await rootBundle.loadString('assets/data/project_data.json');
  }
}
