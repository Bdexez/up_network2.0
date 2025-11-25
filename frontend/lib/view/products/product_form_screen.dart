import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/product_controller.dart';
import 'package:henox/model/product_model.dart';

class ProductFormScreen extends StatefulWidget {
  final Product? product;
  ProductFormScreen({this.product});

  @override
  State<ProductFormScreen> createState() => _ProductFormScreenState();
}

class _ProductFormScreenState extends State<ProductFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final ProductController controller = Get.find();

  late TextEditingController nameController;
  late TextEditingController descController;
  late TextEditingController priceController;
  late TextEditingController stockController;

  @override
  void initState() {
    super.initState();
    nameController = TextEditingController(text: widget.product?.name ?? '');
    descController =
        TextEditingController(text: widget.product?.description ?? '');
    priceController =
        TextEditingController(text: widget.product?.price.toString() ?? '');
    stockController =
        TextEditingController(text: widget.product?.stock.toString() ?? '');
  }

  void save() {
    if (_formKey.currentState!.validate()) {
      final product = Product(
        id: widget.product?.id,
        name: nameController.text,
        description: descController.text,
        price: double.parse(priceController.text),
        stock: int.parse(stockController.text),
      );
      if (widget.product == null) {
        controller.addProduct(product);
      } else {
        controller.editProduct(product.id!, product);
      }
      Get.back();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
          title: Text(
              widget.product == null ? 'Créer produit' : 'Modifier produit')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                  controller: nameController,
                  decoration: InputDecoration(labelText: 'Nom'),
                  validator: (v) => v!.isEmpty ? 'Obligatoire' : null),
              TextFormField(
                  controller: descController,
                  decoration: InputDecoration(labelText: 'Description'),
                  validator: (v) => v!.isEmpty ? 'Obligatoire' : null),
              TextFormField(
                  controller: priceController,
                  decoration: InputDecoration(labelText: 'Prix'),
                  keyboardType: TextInputType.number,
                  validator: (v) => v!.isEmpty ? 'Obligatoire' : null),
              TextFormField(
                  controller: stockController,
                  decoration: InputDecoration(labelText: 'Stock'),
                  keyboardType: TextInputType.number,
                  validator: (v) => v!.isEmpty ? 'Obligatoire' : null),
              SizedBox(height: 20),
              ElevatedButton(
                  onPressed: save,
                  child: Text(widget.product == null ? 'Créer' : 'Modifier')),
            ],
          ),
        ),
      ),
    );
  }
}
