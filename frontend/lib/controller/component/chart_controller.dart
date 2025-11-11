import 'package:flutter/material.dart';
import 'package:henox/controller/my_controller.dart';
import 'package:syncfusion_flutter_charts/charts.dart';
import 'dart:ui' as ui;


class ChartController extends MyController {
  List<ChartData>? chartData;
  List<ChartSampleData>? gdpChartData;
  TooltipBehavior? tooltipBehavior;
  TooltipBehavior? areaTooltipBehavior;
  List<ChartSampleData>? barChartData;
  TooltipBehavior? bubbleTooltipBehavior;
  List<ChartSampleData>? scatterChartData;
  TooltipBehavior? scatterTooltipBehavior;
  List<ChartSampleData>? stepLineChartData;

  @override
  void onInit() {
    stepLineChartData = <ChartSampleData>[
      ChartSampleData(
          x: 2006,
          y: 378,
          yValue: 463,
          secondSeriesYValue: 519,
          thirdSeriesYValue: 570),
      ChartSampleData(
          x: 2007,
          y: 416,
          yValue: 449,
          secondSeriesYValue: 508,
          thirdSeriesYValue: 579),
      ChartSampleData(
          x: 2008,
          y: 404,
          yValue: 458,
          secondSeriesYValue: 502,
          thirdSeriesYValue: 563),
      ChartSampleData(
          x: 2009,
          y: 390,
          yValue: 450,
          secondSeriesYValue: 495,
          thirdSeriesYValue: 550),
      ChartSampleData(
          x: 2010,
          y: 376,
          yValue: 425,
          secondSeriesYValue: 485,
          thirdSeriesYValue: 545),
      ChartSampleData(
          x: 2011,
          y: 365,
          yValue: 430,
          secondSeriesYValue: 470,
          thirdSeriesYValue: 525)
    ];
    scatterTooltipBehavior =
        TooltipBehavior(enable: true, header: '', canShowMarker: false);
    scatterChartData = <ChartSampleData>[
      ChartSampleData(
          x: 1950, y: 0.8, secondSeriesYValue: 1.4, thirdSeriesYValue: 2),
      ChartSampleData(
          x: 1955, y: 1.2, secondSeriesYValue: 1.7, thirdSeriesYValue: 2.4),
      ChartSampleData(
          x: 1960, y: 0.9, secondSeriesYValue: 1.5, thirdSeriesYValue: 2.2),
      ChartSampleData(
          x: 1965, y: 1, secondSeriesYValue: 1.6, thirdSeriesYValue: 2.5),
      ChartSampleData(
          x: 1970, y: 0.8, secondSeriesYValue: 1.4, thirdSeriesYValue: 2.2),
      ChartSampleData(
          x: 1975, y: 1, secondSeriesYValue: 1.8, thirdSeriesYValue: 2.4),
      ChartSampleData(
          x: 1980, y: 1, secondSeriesYValue: 1.7, thirdSeriesYValue: 2),
      ChartSampleData(
          x: 1985, y: 1.2, secondSeriesYValue: 1.9, thirdSeriesYValue: 2.3),
      ChartSampleData(
          x: 1990, y: 1.1, secondSeriesYValue: 1.4, thirdSeriesYValue: 2),
      ChartSampleData(
          x: 1995, y: 1.2, secondSeriesYValue: 1.8, thirdSeriesYValue: 2.2),
      ChartSampleData(
          x: 2000, y: 1.4, secondSeriesYValue: 2, thirdSeriesYValue: 2.4),
    ];

    bubbleTooltipBehavior = TooltipBehavior(
        enable: true,
        header: '',
        canShowMarker: false,
        format:
        'Literacy rate : point.x%\nGDP growth rate : point.y\nPopulation : point.sizeB');

    areaTooltipBehavior = TooltipBehavior(
        enable: true,
        canShowMarker: false,
        tooltipPosition: TooltipPosition.pointer);
    chartData = <ChartData>[
      ChartData(2005, 21, 28),
      ChartData(2006, 24, 44),
      ChartData(2007, 36, 48),
      ChartData(2008, 38, 50),
      ChartData(2009, 54, 66),
      ChartData(2010, 57, 78),
      ChartData(2011, 70, 84)
    ];
    barChartData = <ChartSampleData>[
      ChartSampleData(
          x: 'France',
          y: 84452000,
          secondSeriesYValue: 82682000,
          thirdSeriesYValue: 86861000),
      ChartSampleData(
          x: 'Spain',
          y: 68175000,
          secondSeriesYValue: 75315000,
          thirdSeriesYValue: 81786000),
      ChartSampleData(
          x: 'US',
          y: 77774000,
          secondSeriesYValue: 76407000,
          thirdSeriesYValue: 76941000),
      ChartSampleData(
          x: 'Italy',
          y: 50732000,
          secondSeriesYValue: 52372000,
          thirdSeriesYValue: 58253000),
      ChartSampleData(
          x: 'Mexico',
          y: 32093000,
          secondSeriesYValue: 35079000,
          thirdSeriesYValue: 39291000),
      ChartSampleData(
          x: 'UK',
          y: 34436000,
          secondSeriesYValue: 35814000,
          thirdSeriesYValue: 37651000),
    ];
    gdpChartData = <ChartSampleData>[
      ChartSampleData(
          x: 1997,
          y: 17.79,
          secondSeriesYValue: 20.32,
          thirdSeriesYValue: 22.44),
      ChartSampleData(
          x: 1998,
          y: 18.20,
          secondSeriesYValue: 21.46,
          thirdSeriesYValue: 25.18),
      ChartSampleData(
          x: 1999,
          y: 17.44,
          secondSeriesYValue: 21.72,
          thirdSeriesYValue: 24.15),
      ChartSampleData(
          x: 2000, y: 19, secondSeriesYValue: 22.86, thirdSeriesYValue: 25.83),
      ChartSampleData(
          x: 2001,
          y: 18.93,
          secondSeriesYValue: 22.87,
          thirdSeriesYValue: 25.69),
      ChartSampleData(
          x: 2002,
          y: 17.58,
          secondSeriesYValue: 21.87,
          thirdSeriesYValue: 24.75),
      ChartSampleData(
          x: 2003,
          y: 16.83,
          secondSeriesYValue: 21.67,
          thirdSeriesYValue: 27.38),
      ChartSampleData(
          x: 2004,
          y: 17.93,
          secondSeriesYValue: 21.65,
          thirdSeriesYValue: 25.31)
    ];
    tooltipBehavior =
        TooltipBehavior(enable: true, canShowMarker: false, header: '');
    super.onInit();
  }

  List<StepLineSeries<ChartSampleData, num>> getDashedStepLineSeries() {
    return <StepLineSeries<ChartSampleData, num>>[
      StepLineSeries<ChartSampleData, num>(
          dataSource: stepLineChartData,
          xValueMapper: (ChartSampleData data, _) => data.x as num,
          yValueMapper: (ChartSampleData data, _) => data.y,
          name: 'USA',
          dashArray: const <double>[10, 5]),
      StepLineSeries<ChartSampleData, num>(
          dataSource: stepLineChartData,
          xValueMapper: (ChartSampleData data, _) => data.x as num,
          yValueMapper: (ChartSampleData data, _) => data.yValue,
          name: 'UK',
          dashArray: const <double>[10, 5]),
      StepLineSeries<ChartSampleData, num>(
          dataSource: stepLineChartData,
          xValueMapper: (ChartSampleData data, _) => data.x as num,
          yValueMapper: (ChartSampleData data, _) => data.secondSeriesYValue,
          name: 'Korea',
          dashArray: const <double>[10, 5]),
      StepLineSeries<ChartSampleData, num>(
          dataSource: stepLineChartData,
          xValueMapper: (ChartSampleData data, _) => data.x as num,
          yValueMapper: (ChartSampleData data, _) => data.thirdSeriesYValue,
          name: 'Japan',
          dashArray: const <double>[10, 5])
    ];
  }

  List<ScatterSeries<ChartSampleData, num>> getScatterShapesSeries() {
    return <ScatterSeries<ChartSampleData, num>>[
      ScatterSeries<ChartSampleData, num>(
          dataSource: scatterChartData,
          xValueMapper: (ChartSampleData sales, _) => sales.x as num,
          yValueMapper: (ChartSampleData sales, _) => sales.y,
          markerSettings: const MarkerSettings(
              width: 15, height: 15, shape: DataMarkerType.diamond),
          name: 'India'),
      ScatterSeries<ChartSampleData, num>(
          dataSource: scatterChartData,
          xValueMapper: (ChartSampleData sales, _) => sales.x as num,
          yValueMapper: (ChartSampleData sales, _) => sales.secondSeriesYValue,
          markerSettings: const MarkerSettings(
              width: 15, height: 15, shape: DataMarkerType.triangle),
          name: 'China'),
      ScatterSeries<ChartSampleData, num>(
          dataSource: scatterChartData,
          xValueMapper: (ChartSampleData sales, _) => sales.x as num,
          yValueMapper: (ChartSampleData sales, _) => sales.thirdSeriesYValue,
          markerSettings: const MarkerSettings(
              width: 15, height: 15, shape: DataMarkerType.pentagon),
          name: 'Japan')
    ];
  }

  List<BubbleSeries<ChartSampleData, num>> getMultipleBubbleSeries() {
    return <BubbleSeries<ChartSampleData, num>>[
      BubbleSeries<ChartSampleData, num>(
          opacity: 0.7,
          name: 'North America',
          dataSource: <ChartSampleData>[
            ChartSampleData(x: 'US', xValue: 99.4, y: 2.2, size: 0.312),
            ChartSampleData(x: 'Mexico', xValue: 86.1, y: 4.0, size: 0.115)
          ],
          xValueMapper: (ChartSampleData sales, _) => sales.xValue as num,
          yValueMapper: (ChartSampleData sales, _) => sales.y,
          sizeValueMapper: (ChartSampleData sales, _) => sales.size),
      BubbleSeries<ChartSampleData, num>(
          opacity: 0.7,
          name: 'Europe',
          dataSource: <ChartSampleData>[
            ChartSampleData(x: 'Germany', xValue: 99, y: 0.7, size: 0.0818),
            ChartSampleData(x: 'Russia', xValue: 99.6, y: 3.4, size: 0.143),
            ChartSampleData(x: 'Netherland', xValue: 79.2, y: 3.9, size: 0.162)
          ],
          xValueMapper: (ChartSampleData sales, _) => sales.xValue as num,
          yValueMapper: (ChartSampleData sales, _) => sales.y,
          sizeValueMapper: (ChartSampleData sales, _) => sales.size),
      BubbleSeries<ChartSampleData, num>(
          opacity: 0.7,
          dataSource: <ChartSampleData>[
            ChartSampleData(x: 'China', xValue: 92.2, y: 7.8, size: 1.347),
            ChartSampleData(x: 'India', xValue: 74, y: 6.5, size: 1.241),
            ChartSampleData(x: 'Indonesia', xValue: 90.4, y: 6.0, size: 0.238),
            ChartSampleData(x: 'Japan', xValue: 99, y: 0.2, size: 0.128),
            ChartSampleData(
                x: 'Philippines', xValue: 92.6, y: 6.6, size: 0.096),
            ChartSampleData(x: 'Hong Kong', xValue: 82.2, y: 3.97, size: 0.7),
            ChartSampleData(x: 'Jordan', xValue: 72.5, y: 4.5, size: 0.7),
            ChartSampleData(x: 'Australia', xValue: 81, y: 3.5, size: 0.21),
            ChartSampleData(x: 'Mongolia', xValue: 66.8, y: 3.9, size: 0.028),
            ChartSampleData(x: 'Taiwan', xValue: 78.4, y: 2.9, size: 0.231),
          ],
          name: 'Asia',
          xValueMapper: (ChartSampleData sales, _) => sales.xValue as num,
          yValueMapper: (ChartSampleData sales, _) => sales.y,
          sizeValueMapper: (ChartSampleData sales, _) => sales.size),
      BubbleSeries<ChartSampleData, num>(
          opacity: 0.7,
          name: 'Africa',
          dataSource: <ChartSampleData>[
            ChartSampleData(x: 'Egypt', xValue: 72, y: 2.0, size: 0.0826),
            ChartSampleData(x: 'Nigeria', xValue: 61.3, y: 1.45, size: 0.162),
          ],
          xValueMapper: (ChartSampleData sales, _) => sales.xValue as num,
          yValueMapper: (ChartSampleData sales, _) => sales.y,
          sizeValueMapper: (ChartSampleData sales, _) => sales.size),
    ];
  }

  List<BarSeries<ChartSampleData, String>> getDefaultBarSeries() {
    return <BarSeries<ChartSampleData, String>>[
      BarSeries<ChartSampleData, String>(
          dataSource: barChartData,
          xValueMapper: (ChartSampleData sales, _) => sales.x as String,
          yValueMapper: (ChartSampleData sales, _) => sales.y,
          name: '2015'),
      BarSeries<ChartSampleData, String>(
          dataSource: barChartData,
          xValueMapper: (ChartSampleData sales, _) => sales.x as String,
          yValueMapper: (ChartSampleData sales, _) => sales.secondSeriesYValue,
          name: '2016'),
      BarSeries<ChartSampleData, String>(
          dataSource: barChartData,
          xValueMapper: (ChartSampleData sales, _) => sales.x as String,
          yValueMapper: (ChartSampleData sales, _) => sales.thirdSeriesYValue,
          name: '2017')
    ];
  }

  List<CartesianSeries<ChartSampleData, String>> getAreaZoneSeries() {
    return <CartesianSeries<ChartSampleData, String>>[
      AreaSeries<ChartSampleData, String>(
        dataSource: <ChartSampleData>[
          ChartSampleData(x: 'Jan', y: 35.53),
          ChartSampleData(
            x: 'Feb',
            y: 46.06,
          ),
          ChartSampleData(
            x: 'Mar',
            y: 46.06,
          ),
          ChartSampleData(
            x: 'Apr',
            y: 50.86,
          ),
          ChartSampleData(
            x: 'May',
            y: 60.89,
          ),
          ChartSampleData(
            x: 'Jun',
            y: 70.27,
          ),
          ChartSampleData(
            x: 'Jul',
            y: 75.65,
          ),
          ChartSampleData(x: 'Aug', y: 74.7),
          ChartSampleData(
            x: 'Sep',
            y: 65.91,
          ),
          ChartSampleData(x: 'Oct', y: 54.28),
          ChartSampleData(x: 'Nov', y: 46.33),
          ChartSampleData(x: 'Dec', y: 35.71),
        ],
        name: 'US',
        onCreateShader: (ShaderDetails details) {
          return ui.Gradient.linear(
              details.rect.bottomLeft, details.rect.bottomRight, const <Color>[
            Color.fromRGBO(116, 182, 194, 1),
            Color.fromRGBO(75, 189, 138, 1),
            Color.fromRGBO(75, 189, 138, 1),
            Color.fromRGBO(255, 186, 83, 1),
            Color.fromRGBO(255, 186, 83, 1),
            Color.fromRGBO(194, 110, 21, 1),
            Color.fromRGBO(194, 110, 21, 1),
            Color.fromRGBO(116, 182, 194, 1),
          ], <double>[
            0.165,
            0.165,
            0.416,
            0.416,
            0.666,
            0.666,
            0.918,
            0.918
          ]);
        },
        xValueMapper: (ChartSampleData sales, _) => sales.x as String,
        yValueMapper: (ChartSampleData sales, _) => sales.y,
      ),
    ];
  }

  List<LineSeries<ChartData, num>> getDefaultLineSeries() {
    return <LineSeries<ChartData, num>>[
      LineSeries<ChartData, num>(
          dataSource: chartData,
          xValueMapper: (ChartData sales, _) => sales.x,
          yValueMapper: (ChartData sales, _) => sales.y,
          name: 'Germany',
          markerSettings: MarkerSettings(isVisible: true)),
      LineSeries<ChartData, num>(
          dataSource: chartData,
          name: 'England',
          xValueMapper: (ChartData sales, _) => sales.x,
          yValueMapper: (ChartData sales, _) => sales.y2,
          markerSettings: MarkerSettings(isVisible: true))
    ];
  }

  List<SplineSeries<ChartSampleData, num>> getDashedSplineSeries() {
    return <SplineSeries<ChartSampleData, num>>[
      SplineSeries<ChartSampleData, num>(
          dataSource: gdpChartData,
          xValueMapper: (ChartSampleData sales, _) => sales.x as num,
          yValueMapper: (ChartSampleData sales, _) => sales.y,
          name: 'Brazil',
          dashArray: <double>[12, 3, 3, 3],
          markerSettings: MarkerSettings(isVisible: true)),
      SplineSeries<ChartSampleData, num>(
          dataSource: gdpChartData,
          name: 'Sweden',
          dashArray: <double>[12, 3, 3, 3],
          xValueMapper: (ChartSampleData sales, _) => sales.x as num,
          yValueMapper: (ChartSampleData sales, _) => sales.secondSeriesYValue,
          markerSettings: MarkerSettings(isVisible: true)),
      SplineSeries<ChartSampleData, num>(
          dataSource: gdpChartData,
          dashArray: <double>[12, 3, 3, 3],
          name: 'Greece',
          xValueMapper: (ChartSampleData sales, _) => sales.x as num,
          yValueMapper: (ChartSampleData sales, _) => sales.thirdSeriesYValue,
          markerSettings: MarkerSettings(isVisible: true))
    ];
  }
}


class ChartSampleData {
  ChartSampleData(
      {this.x,
        this.y,
        this.xValue,
        this.yValue,
        this.secondSeriesYValue,
        this.thirdSeriesYValue,
        this.pointColor,
        this.size,
        this.text,
        this.open,
        this.close,
        this.low,
        this.high,
        this.volume});

  final dynamic x;
  final num? y;
  final dynamic xValue;
  final num? yValue;
  final num? secondSeriesYValue;
  final num? thirdSeriesYValue;
  final Color? pointColor;
  final num? size;
  final String? text;
  final num? open;
  final num? close;
  final num? low;
  final num? high;
  final num? volume;
}

class ChartData {
  ChartData(this.x, this.y, this.y2);

  final double x;
  final double y;
  final double y2;
}
