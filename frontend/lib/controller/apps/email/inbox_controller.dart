import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/widgets/my_text_style.dart';
import 'package:henox/model/email_model.dart';
import 'package:henox/route/route_method.dart';
import 'package:quill_html_editor/quill_html_editor.dart';

class InboxController extends MyController {
  List<EmailModel> emails = [];

  final editorTextStyle =
      MyTextStyle.bodyMedium(fontWeight: 600, textStyle: GoogleFonts.poppins());
  late QuillEditorController quillHtmlEditor;

  @override
  void onInit() {
    EmailModel.dummyList.then((value) {
      emails = value;
      update();
    });
    quillHtmlEditor = QuillEditorController();
    super.onInit();
  }

  void onCheckMail(EmailModel mail) {
    mail.isCheckMail = !mail.isCheckMail;
    update();
  }

  void gotoDetailScreen() {
    Get.toNamed(route.readEmail);
  }
}
