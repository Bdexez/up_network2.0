import 'package:henox/model/total_task_model.dart';

class TotalTaskCache {
  static List<TotalTaskModel> totalTask = [];

  static Future<void> initDummy() async {
    TotalTaskCache.totalTask = await TotalTaskModel.dummyList
        .then((value) => totalTask = value);
  }
}
