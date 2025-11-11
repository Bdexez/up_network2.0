import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/map_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_flex.dart';
import 'package:henox/helpers/widgets/my_flex_item.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/view/layouts/layout.dart';
import 'package:syncfusion_flutter_maps/maps.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> with UIMixin {
  MapController controller = Get.put(MapController());
  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'map_controller',
        builder: (controller) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Syncfusion Maps", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Maps'),
                        MyBreadcrumbItem(name: 'Syncfusion Maps'),
                      ],
                    ),
                  ],
                ),
              ),
              MySpacing.height(flexSpacing),
              Padding(
                padding: MySpacing.x(flexSpacing / 2),
                child: MyFlex(
                  children: [
                    MyFlexItem(sizes: "lg-6", child: dataLabel()),
                    MyFlexItem(sizes: "lg-6", child: europeanTimeZone()),
                    MyFlexItem(sizes: "lg-6", child: worldPopulationDensity()),
                    MyFlexItem(sizes: "lg-6", child: worldClock())
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget worldPopulationDensity() {
    return MyCard(
      shadow: MyShadow(elevation: 1, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        children: [
          MyText.titleMedium(
            "World Population Density (per sq. km.)",
            fontWeight: 600,
          ),
          MySpacing.height(flexSpacing),
          SfMaps(
            layers: <MapLayer>[
              MapShapeLayer(
                loadingBuilder: (BuildContext context) {
                  return const SizedBox(
                    height: 25,
                    width: 25,
                    child: CircularProgressIndicator(
                      strokeWidth: 3,
                    ),
                  );
                },
                source: controller.mapSource1,
                shapeTooltipBuilder: (BuildContext context, int index) {
                  return Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: MyText.bodySmall(
                      '${controller.worldPopulationDensity[index].countryName} : ${controller.numberFormat.format(controller.worldPopulationDensity[index].density)} per sq. km.',
                    ),
                  );
                },
                strokeColor: Colors.white30,
                legend: const MapLegend.bar(MapElement.shape,
                    position: MapLegendPosition.bottom,
                    overflowMode: MapLegendOverflowMode.wrap,
                    labelsPlacement: MapLegendLabelsPlacement.betweenItems,
                    padding: EdgeInsets.only(top: 15),
                    spacing: 1.0,
                    segmentSize: Size(55.0, 9.0)),
                tooltipSettings: MapTooltipSettings(
                    color: theme.colorScheme.brightness == Brightness.light
                        ? const Color.fromRGBO(0, 32, 128, 1)
                        : const Color.fromRGBO(226, 233, 255, 1),
                    strokeColor: theme.colorScheme.brightness == Brightness.light ? Colors.white : Colors.black),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget worldClock() {
    return MyCard(
      shadow: MyShadow(elevation: 1, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        children: [
          MyText.titleMedium(
            'World Clock',
            fontWeight: 600,
          ),
          MySpacing.height(flexSpacing),
          SizedBox(
              height: 500,
              child: SfMaps(
                layers: <MapLayer>[
                  MapShapeLayer(
                    loadingBuilder: (BuildContext context) {
                      return const SizedBox(
                        height: 25,
                        width: 25,
                        child: CircularProgressIndicator(
                          strokeWidth: 3,
                        ),
                      );
                    },
                    source: controller.mapSource2,
                    initialMarkersCount: 7,
                    markerBuilder: (_, int index) {
                      return MapMarker(
                        longitude: controller.worldClockData[index].longitude,
                        latitude: controller.worldClockData[index].latitude,
                        alignment: Alignment.topCenter,
                        offset: Offset(0, -4),
                        size: Size(150, 150),
                        child: ClockWidget(countryName: controller.worldClockData[index].countryName, date: controller.worldClockData[index].date),
                      );
                    },
                    strokeWidth: 0,
                    color: theme.colorScheme.brightness == Brightness.light ? Color.fromRGBO(71, 70, 75, 0.2) : Color.fromRGBO(71, 70, 75, 1),
                  ),
                ],
              )),
        ],
      ),
    );
  }

  Widget europeanTimeZone() {
    return MyCard(
      shadow: MyShadow(elevation: 1, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        children: [
          MyText.titleMedium(
            "European Time Zones",
            fontWeight: 600,
          ),
          MySpacing.height(flexSpacing),
          SfMaps(
            layers: <MapLayer>[
              MapShapeLayer(
                loadingBuilder: (BuildContext context) {
                  return const SizedBox(
                    height: 25,
                    width: 25,
                    child: CircularProgressIndicator(
                      strokeWidth: 3,
                    ),
                  );
                },
                source: controller.mapSource,
                shapeTooltipBuilder: (BuildContext context, int index) {
                  return Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: MyText.bodyMedium(
                      '${controller.timeZones[index].countryName} : ${controller.timeZones[index].gmtTime}',
                      color: contentTheme.light,
                    ),
                  );
                },
                legend: const MapLegend.bar(
                  MapElement.shape,
                  position: MapLegendPosition.bottom,
                  padding: EdgeInsets.only(top: 15),
                  segmentSize: Size(60.0, 10.0),
                ),
                tooltipSettings: const MapTooltipSettings(color: Color.fromRGBO(45, 45, 45, 1)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget dataLabel() {
    return MyCard(
      shadow: MyShadow(elevation: 1, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        children: [
          MyText.titleMedium(
            'Data Labels',
            fontWeight: 600,
          ),
          MySpacing.height(flexSpacing),
          SfMaps(
            layers: [
              MapShapeLayer(
                source: controller.dataSource,
                showDataLabels: true,
                dataLabelSettings: const MapDataLabelSettings(
                  overflowMode: MapLabelOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
