class Language {
  final String code;
  Language(this.code);

  static late Language current;

  // Création d'une instance à partir du code
  static Language fromCode(String code) => Language(code);
}
