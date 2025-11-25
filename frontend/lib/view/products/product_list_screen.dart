import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/product_controller.dart';
import 'product_form_screen.dart';

class ProductListScreen extends StatelessWidget {
  final ProductController controller = Get.find();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Produits'),
        actions: [
          IconButton(
            icon: Icon(Icons.add),
            onPressed: () => Get.to(() => ProductFormScreen()),
          ),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return Center(child: CircularProgressIndicator());
        }
        return ListView.builder(
          itemCount: controller.products.length,
          itemBuilder: (_, index) {
            final product = controller.products[index];
            return ListTile(
              title: Text(product.name),
              subtitle: Text('${product.description} - \$${product.price}'),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: Icon(Icons.edit),
                    onPressed: () =>
                        Get.to(() => ProductFormScreen(product: product)),
                  ),
                  IconButton(
                    icon: Icon(Icons.delete),
                    onPressed: () => controller.removeProduct(product.id!),
                  ),
                ],
              ),
            );
          },
        );
      }),
    );
  }
}
