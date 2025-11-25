import 'package:get/get.dart';
import 'package:henox/model/product_model.dart';
import 'package:henox/helpers/services/product_service.dart';

class ProductController extends GetxController {
  final ProductService _service = ProductService();
  var products = <Product>[].obs;
  var isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    fetchProducts();
  }

  void fetchProducts() async {
    isLoading.value = true;
    try {
      products.value = await _service.getProducts();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> addProduct(Product product) async {
    final newProduct = await _service.createProduct(product);
    products.add(newProduct);
  }

  Future<void> editProduct(int id, Product product) async {
    final updated = await _service.updateProduct(id, product);
    final index = products.indexWhere((p) => p.id == id);
    if (index != -1) products[index] = updated;
  }

  Future<void> removeProduct(int id) async {
    await _service.deleteProduct(id);
    products.removeWhere((p) => p.id == id);
  }
}
