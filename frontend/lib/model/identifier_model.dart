import 'package:henox/model/model.dart';

abstract class IdentifierModel<T> extends Model {
  final int id;

  IdentifierModel(this.id);
}