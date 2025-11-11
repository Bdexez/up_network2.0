import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/widgets/my_text_utils.dart';

class InvoiceController extends MyController {
  List<String> dummyTexts =
      List.generate(12, (index) => MyTextUtils.getDummyText(60));
  List invoiceBillingInformation = [
    {
      "id": 1,
      "item": "Laptop",
      "description": "Brand Model VGN-TXN27N/B 11.1' Notebook PC",
      "quantity": "1",
      "unit_cost": "\$1799.00",
      "total": "\$1799.00"
    },
    {
      "id": 2,
      "item": "Warranty",
      "description": "Two Year Extended Warranty - Parts and Labor",
      "quantity": "3",
      "unit_cost": "\$499.00",
      "total": "\$1497.00"
    },
    {
      "id": 3,
      "item": "LED",
      "description": "80cm (32) HD Ready LED TV",
      "quantity": "2",
      "unit_cost": "\$412.00",
      "total": "\$824.00"
    }
  ];
}
