import 'package:dio/dio.dart';
import 'package:henox/model/product_model.dart';

class ProductService {
  final Dio _dio = Dio(BaseOptions(baseUrl: 'https://localhost:3000/api'));

  // Récupérer tous les produits
  Future<List<Product>> getProducts() async {
    final response = await _dio.get('/products');
    return (response.data as List).map((e) => Product.fromJson(e)).toList();
  }

  // Créer un produit
  Future<Product> createProduct(Product product) async {
    final response = await _dio.post('/products', data: product.toJson());
    return Product.fromJson(response.data);
  }

  // Mettre à jour un produit
  Future<Product> updateProduct(int id, Product product) async {
    final response = await _dio.patch('/products/$id', data: product.toJson());
    return Product.fromJson(response.data);
  }

  // Supprimer un produit
  Future<void> deleteProduct(int id) async {
    await _dio.delete('/products/$id');
  }
}
