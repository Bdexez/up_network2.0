import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:henox/helpers/services/json_decoder.dart';
import 'package:henox/model/identifier_model.dart';

class TimeLineModel extends IdentifierModel {
  final String date, title, description;
  final List<LikesModel> like;

  TimeLineModel(super.id, this.date, this.title, this.description, this.like);

  static TimeLineModel fromJSON(Map<String, dynamic> json) {
    JSONDecoder decoder = JSONDecoder(json);

    String date = decoder.getString('date');
    String title = decoder.getString('title');
    String description = decoder.getString('description');

    List<dynamic>? like = decoder.getObjectListOrNull('likes');
    List<LikesModel> likes = [];
    if (like != null) {
      likes = LikesModel.listFromJSON(like);
    }

    return TimeLineModel(decoder.getId, date, title, description, likes);
  }

  static List<TimeLineModel> listFromJSON(List<dynamic> list) {
    return list.map((e) => TimeLineModel.fromJSON(e)).toList();
  }

  static List<TimeLineModel>? _dummyList;

  static Future<List<TimeLineModel>> get dummyList async {
    if (_dummyList == null) {
      dynamic data = json.decode(await getData());
      _dummyList = listFromJSON(data);
    }

    return _dummyList!;
  }

  static Future<String> getData() async {
    return await rootBundle.loadString('assets/data/time_line.json');
  }
}

class LikesModel extends IdentifierModel {
  final String emoji, count;

  LikesModel(super.id, this.emoji, this.count);

  static LikesModel fromJSON(Map<String, dynamic> json) {
    JSONDecoder decoder = JSONDecoder(json);

    String emoji = decoder.getString('emoji');
    String count = decoder.getString('count');

    return LikesModel(decoder.getId, emoji, count);
  }

  static List<LikesModel> listFromJSON(List<dynamic> list) {
    return list.map((e) => LikesModel.fromJSON(e)).toList();
  }
}
