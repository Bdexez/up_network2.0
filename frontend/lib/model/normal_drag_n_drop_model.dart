import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:henox/helpers/services/json_decoder.dart';
import 'package:henox/model/identifier_model.dart';

class NormalDragNDrop extends IdentifierModel {
  final String firstName, lastName, phoneNumber, projectName, balance;
  final double ordersCount;
  final DateTime lastOrder;

  String get fullName => '$firstName $lastName $projectName';

  NormalDragNDrop(
      super.id,
      this.firstName,
      this.lastName,
      this.phoneNumber,
      this.balance,
      this.ordersCount,
      this.lastOrder,
      this.projectName,
      );

  static NormalDragNDrop fromJSON(Map<String, dynamic> json) {
    JSONDecoder decoder = JSONDecoder(json);

    String firstName = decoder.getString('first_name');
    String lastName = decoder.getString('last_name');
    String phoneNumber = decoder.getString('phone_number');
    String balance = decoder.getString('balance');
    double ordersCount = decoder.getDouble('order_count');
    DateTime lastOrder = decoder.getDateTime('last_order');
    String projectName = decoder.getString('project_name');

    return NormalDragNDrop(
      decoder.getId,
      firstName,
      lastName,
      phoneNumber,
      balance,
      ordersCount,
      lastOrder,
      projectName,
    );
  }

  static List<NormalDragNDrop> listFromJSON(List<dynamic> list) {
    return list.map((e) => NormalDragNDrop.fromJSON(e)).toList();
  }

  static List<NormalDragNDrop>? _dummyList;

  static Future<List<NormalDragNDrop>> get dummyList async {
    if (_dummyList == null) {
      dynamic data = json.decode(await getData());
      _dummyList = listFromJSON(data);
    }

    return _dummyList!.sublist(0,9);
  }

  static Future<String> getData() async {
    return await rootBundle.loadString('assets/data/normal_drag_n_drop_data.json');
  }
}
