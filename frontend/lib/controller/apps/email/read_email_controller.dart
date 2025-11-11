import 'package:google_fonts/google_fonts.dart';
import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/widgets/my_text_style.dart';
import 'package:quill_html_editor/quill_html_editor.dart';

class ReadEmailController extends MyController {
  final editorTextStyle =
      MyTextStyle.bodyMedium(fontWeight: 600, textStyle: GoogleFonts.poppins());
  late QuillEditorController quillHtmlEditor;

  @override
  void onInit() {
    quillHtmlEditor = QuillEditorController();
    super.onInit();
  }
}
