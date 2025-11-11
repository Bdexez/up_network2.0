import 'package:flutter/material.dart';
import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/widgets/my_text_utils.dart';
import 'package:henox/model/drag_n_drop_model.dart';
import 'package:henox/model/normal_drag_n_drop_model.dart';

class DragulaController extends MyController {
  List<DragNDropModel> dragNDrop = [];
  List<NormalDragNDrop> normalDragNDrop = [];
  final scrollController = ScrollController();
  final gridViewKey = GlobalKey();
  List<String> dummyTexts = List.generate(12, (index) => MyTextUtils.getDummyText(60));

  @override
  void onInit() {
    DragNDropModel.dummyList.then((value) {
      dragNDrop = value;
      update();
    });
    NormalDragNDrop.dummyList.then((value) {
      normalDragNDrop = value;
      update();
    });
    super.onInit();
  }

  void onNormalReorder(int oldIndex, int newIndex) {
    if (oldIndex < newIndex) {
      newIndex -= 1;
    }
    NormalDragNDrop customer = normalDragNDrop.removeAt(oldIndex);
    normalDragNDrop.insert(newIndex, customer);
    update();
  }

  void onReorder(int oldIndex, int newIndex) {
    if (oldIndex < newIndex) {
      newIndex -= 1;
    }
    DragNDropModel customer = dragNDrop.removeAt(oldIndex);
    dragNDrop.insert(newIndex, customer);
    update();
  }
}
