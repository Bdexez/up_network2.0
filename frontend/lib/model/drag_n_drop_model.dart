import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:henox/helpers/services/json_decoder.dart';
import 'package:henox/images.dart';
import 'package:henox/model/identifier_model.dart';

class DragNDropModel extends IdentifierModel {
  final String contactName, number, location, image;
  final int leadsScore;
  final DateTime createdAt;

  DragNDropModel(super.id, this.contactName, this.number, this.location,
      this.leadsScore, this.createdAt, this.image);

  static DragNDropModel fromJSON(Map<String, dynamic> json) {
    JSONDecoder decoder = JSONDecoder(json);

    String contactName = decoder.getString('contact_name');
    String number = decoder.getString('number');
    String location = decoder.getString('location');
    String image = Images.randomImage(Images.small);
    int leadsScore = decoder.getInt('leads_score');
    DateTime createdAt = decoder.getDateTime('created_at');
    return DragNDropModel(decoder.getId, contactName, number, location,
        leadsScore, createdAt, image);
  }

  static List<DragNDropModel> listFromJSON(List<dynamic> list) {
    return list.map((e) => DragNDropModel.fromJSON(e)).toList();
  }

  static List<DragNDropModel>? _dummyList;

  static Future<List<DragNDropModel>> get dummyList async {
    if (_dummyList == null) {
      dynamic data = json.decode(await getData());
      _dummyList = listFromJSON(data);
    }
    return _dummyList!.sublist(0,12);
  }

  static Future<String> getData() async {
    return await rootBundle.loadString('assets/data/drag_n_drop_data.json');
  }
}
