import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/apps/calendar_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/helpers/widgets/my_text_style.dart';
import 'package:henox/view/layouts/layout.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart' as sf_calendar;

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen>
    with SingleTickerProviderStateMixin, UIMixin {
  late CalendarController controller = Get.put(CalendarController());

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'calendar_controller',
        builder: (_) {
          return Column(
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium(
                      "Calendar",
                      fontSize: 18,
                      fontWeight: 600,
                    ),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Apps'),
                        MyBreadcrumbItem(name: 'Calendar'),
                      ],
                    ),
                  ],
                ),
              ),
              MySpacing.height(flexSpacing),
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: MyCard(
                  shadow: MyShadow(
                      elevation: .7, position: MyShadowPosition.bottom),
                  height: 700,
                  child: sf_calendar.SfCalendar(
                    view: sf_calendar.CalendarView.week,
                    allowedViews: controller.allowedViews,
                    dataSource: controller.events,
                    allowDragAndDrop: true,
                    allowAppointmentResize: true,
                    onDragEnd: controller.dragEnd,
                    monthViewSettings: sf_calendar.MonthViewSettings(
                        showAgenda: true,
                        appointmentDisplayMode: sf_calendar
                            .MonthAppointmentDisplayMode.appointment),
                    controller: sf_calendar.CalendarController(),
                    allowViewNavigation: true,
                    showTodayButton: true,
                    showCurrentTimeIndicator: true,
                    showNavigationArrow: true,
                    onSelectionChanged: (calendarSelectionDetails) {
                      controller.onSelectDate(calendarSelectionDetails);
                      addDataModal(context);
                    },
                  ),
                ),
              )
            ],
          );
        },
      ),
    );
  }

  Future<void> addDataModal(BuildContext context) {
    return showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          clipBehavior: Clip.antiAliasWithSaveLayer,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          title: MyText.titleMedium("Add Event", fontWeight: 600),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              title(),
              MySpacing.height(12),
              description(),
              MySpacing.height(12),
              colorSelect(),
            ],
          ),
          actionsPadding: MySpacing.nTop(20),
          actions: <Widget>[
            TextButton(
                style: TextButton.styleFrom(
                    textStyle: Theme.of(context).textTheme.labelLarge),
                child: MyText.bodyMedium('Cancel'),
                onPressed: () => Navigator.of(context).pop()),
            TextButton(
              style: TextButton.styleFrom(
                  textStyle: Theme.of(context).textTheme.labelLarge),
              child: MyText.bodyMedium('Add'),
              onPressed: () => controller.addEvent(),
            ),
          ],
        );
      },
    );
  }

  Widget colorSelect() {
    return DropdownButtonFormField<Color>(
        dropdownColor: contentTheme.background,
        value: controller.selectedColor,
        items: controller.colorCollection.map((Color color) {
          return DropdownMenuItem<Color>(
            value: color,
            child: MyText.bodyMedium(colorToString(color),
                color: color, fontWeight: 600),
          );
        }).toList(),
        onChanged: (Color? value) => controller.onSelectedColor(value),
        decoration: InputDecoration(
            border: outlineInputBorder,
            enabledBorder: outlineInputBorder,
            disabledBorder: outlineInputBorder,
            focusedBorder: outlineInputBorder,
            contentPadding: MySpacing.all(12),
            hintText: "Select Color",
            hintStyle: MyTextStyle.bodyMedium(fontWeight: 600)));
  }

  String colorToString(Color color) {
    if (color == Colors.red) return 'Red';
    if (color == Colors.blue) return 'Blue';
    if (color == Colors.green) return 'Green';
    if (color == Colors.yellow) return 'Yellow';
    if (color == Colors.pink) return 'Pink';
    if (color == Colors.purple) return 'Purple';
    if (color == Colors.brown) return 'Brown';
    return '';
  }

  Widget title() {
    return SizedBox(
      width: MediaQuery.of(context).size.width / 7,
      child: TextFormField(
        controller: controller.titleTE,
        decoration: InputDecoration(
            border: outlineInputBorder,
            enabledBorder: outlineInputBorder,
            disabledBorder: outlineInputBorder,
            focusedBorder: outlineInputBorder,
            filled: true,
            hintText: "Add Title",
            hintStyle: MyTextStyle.bodyMedium(fontWeight: 600)),
      ),
    );
  }

  Widget description() {
    return SizedBox(
      width: MediaQuery.of(context).size.width / 7,
      child: TextFormField(
        controller: controller.descriptionTE,
        decoration: InputDecoration(
          border: outlineInputBorder,
          enabledBorder: outlineInputBorder,
          disabledBorder: outlineInputBorder,
          focusedBorder: outlineInputBorder,
          filled: true,
          hintText: "Add Description",
          hintStyle: MyTextStyle.bodyMedium(fontWeight: 600),
        ),
      ),
    );
  }
}
