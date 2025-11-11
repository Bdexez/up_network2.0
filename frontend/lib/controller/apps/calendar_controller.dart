import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/widgets/my_form_validator.dart';
import 'package:henox/helpers/widgets/my_text_utils.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';

class CalendarController extends MyController {
  late DataSource events;
  MyFormValidator basicValidator = MyFormValidator();
  late TextEditingController titleTE, descriptionTE, locationTE;
  late Color selectedColor = Colors.red;
  List<Appointment> appointmentCollection = <Appointment>[];
  List<String> dummyTexts =
      List.generate(12, (index) => MyTextUtils.getDummyText(60));
  DateTime? selectedDate;

  List<Color> colorCollection = [
    Colors.red,
    Colors.blue,
    Colors.green,
    Colors.yellow,
    Colors.pink,
    Colors.purple,
    Colors.brown,
  ];

  @override
  void onInit() {
    super.onInit();
    events = addAppointments();
    titleTE = TextEditingController(text: 'Title');
    descriptionTE = TextEditingController(text: 'Description');
    locationTE = TextEditingController(text: 'Location');
    selectedColor = colorCollection[0];
  }

  void onSelectedColor(value) {
    selectedColor = value;
    update();
  }

  final List<CalendarView> allowedViews = <CalendarView>[
    CalendarView.day,
    CalendarView.week,
    CalendarView.workWeek,
    CalendarView.schedule
  ];

  void dragEnd(AppointmentDragEndDetails appointmentDragEndDetails) {
    Appointment detail = appointmentDragEndDetails.appointment as Appointment;
    Duration duration = detail.endTime.difference(detail.startTime);

    DateTime start = DateTime(
        appointmentDragEndDetails.droppingTime!.year,
        appointmentDragEndDetails.droppingTime!.month,
        appointmentDragEndDetails.droppingTime!.day,
        appointmentDragEndDetails.droppingTime!.hour,
        0,
        0);

    final List<Appointment> appointment = <Appointment>[];
    events.appointments!.remove(appointmentDragEndDetails.appointment);

    events.notifyListeners(CalendarDataSourceAction.remove,
        <dynamic>[appointmentDragEndDetails.appointment]);

    Appointment app = Appointment(
        subject: detail.subject,
        color: detail.color,
        startTime: start,
        endTime: start.add(duration));

    appointment.add(app);

    events.appointments!.add(appointment[0]);

    events.notifyListeners(CalendarDataSourceAction.add, appointment);
  }

  void addEvent() {
    final DateTime today = selectedDate ?? DateTime.now();
    Appointment appointment = Appointment(
        startTime: today,
        endTime: today.add(Duration(hours: 1)),
        color: selectedColor,
        subject: descriptionTE.text);
    appointmentCollection.add(appointment);
    titleTE.clear();
    descriptionTE.clear();
    locationTE.clear();
    events = DataSource(appointmentCollection);
    Get.back();
    update();
  }

  DataSource addAppointments() {
    final DateTime today = DateTime(DateTime.now().year, DateTime.now().month,
        DateTime.now().day, DateTime.now().hour);
    appointmentCollection.add(Appointment(
        startTime: today,
        endTime: today.add(Duration(hours: 1)),
        subject: 'Planning',
        color: Colors.green));
    appointmentCollection.add(Appointment(
        startTime: today.add(Duration(days: 1, hours: 2)),
        endTime: today.add(Duration(days: 1, hours: 3)),
        subject: 'Meeting',
        color: Colors.red));
    appointmentCollection.add(Appointment(
        startTime: today.add(Duration(days: 1, hours: 1)),
        endTime: today.add(Duration(days: 1, hours: 2)),
        subject: 'Retrospective',
        color: Colors.pink));
    appointmentCollection.add(Appointment(
        startTime: today.add(Duration(days: 2, hours: 5)),
        endTime: today.add(Duration(days: 2, hours: 6)),
        subject: 'Birthday',
        color: Colors.pink));
    appointmentCollection.add(Appointment(
        startTime: today.add(Duration(days: 3, hours: 3)),
        endTime: today.add(Duration(days: 3, hours: 4)),
        subject: 'Consulting',
        color: Colors.deepPurple));

    return DataSource(appointmentCollection);
  }

  void onSelectDate(CalendarSelectionDetails calendarSelectionDetails) {
    selectedDate = calendarSelectionDetails.date;
  }
}

class DataSource extends CalendarDataSource {
  DataSource(List<Appointment> source) {
    appointments = source;
  }
}
