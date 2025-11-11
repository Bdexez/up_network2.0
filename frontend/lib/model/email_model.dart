import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:henox/helpers/services/json_decoder.dart';
import 'package:henox/model/identifier_model.dart';

class EmailModel extends IdentifierModel {
  final String subject, details, date;
  bool isCheckMail,seen;

  EmailModel(super.id, this.subject, this.details, this.date, this.isCheckMail,this.seen);

  static EmailModel fromJSON(Map<String, dynamic> json) {
    JSONDecoder decoder = JSONDecoder(json);

    String subject = decoder.getString('subject');
    String details = decoder.getString('details');
    String date = decoder.getString('date');
    bool isCheckMail = decoder.getBool('isCheckMail');
    bool seen = decoder.getBool('seen');

    return EmailModel(decoder.getId, subject, details, date, isCheckMail,seen);
  }

  static List<EmailModel> listFromJSON(List<dynamic> list) {
    return list.map((e) => EmailModel.fromJSON(e)).toList();
  }

  static List<EmailModel>? _dummyList;

  static Future<List<EmailModel>> get dummyList async {
    if (_dummyList == null) {
      dynamic data = json.decode(await getData());
      _dummyList = listFromJSON(data);
    }

    return _dummyList!;
  }

  static Future<String> getData() async {
    return await rootBundle.loadString('assets/data/email_data.json');
  }
}
