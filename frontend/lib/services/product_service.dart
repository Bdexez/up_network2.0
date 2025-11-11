import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';

class ProductService {
  Future<List<dynamic>> fetchProducts() async {
    final response = await http.get(Uri.parse('$baseUrl/products'));

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erreur lors de la récupération des produits');
    }
  }
}
