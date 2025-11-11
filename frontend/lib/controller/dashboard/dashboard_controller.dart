import 'package:flutter/material.dart';
import 'package:henox/controller/my_controller.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:syncfusion_flutter_charts/charts.dart';
import 'package:syncfusion_flutter_maps/maps.dart';

class PolylineModel {
  PolylineModel(this.points);

  final List<MapLatLng> points;
}

class DashboardController extends MyController with UIMixin {
  TooltipBehavior? tooltipBehavior;
  List<ChartData>? chartData;
  MapShapeSource? dataSource;
  late List<PolylineModel> polylines;
  late List<MapLatLng> polyline;
  late MapZoomPanBehavior zoomPanBehavior;

  @override
  void onInit() {
    tooltipBehavior = TooltipBehavior(enable: true);
    tooltipBehavior = TooltipBehavior(enable: true, format: 'point.x : point.y%');

    chartData = <ChartData>[
      ChartData(2005, 21, 28),
      ChartData(2006, 24, 44),
      ChartData(2007, 36, 48),
      ChartData(2008, 38, 50),
      ChartData(2009, 54, 66),
      ChartData(2010, 57, 78),
      ChartData(2011, 70, 84)
    ];

    polyline = <MapLatLng>[
      MapLatLng(13.0827, 80.2707),
      MapLatLng(13.1746, 79.6117),
      MapLatLng(13.6373, 79.5037),
      MapLatLng(14.4673, 78.8242),
      MapLatLng(14.9091, 78.0092),
      MapLatLng(16.2160, 77.3566),
      MapLatLng(17.1557, 76.8697),
      MapLatLng(18.0975, 75.4249),
      MapLatLng(18.5204, 73.8567),
      MapLatLng(19.0760, 72.8777),
    ];

    polylines = <PolylineModel>[
      PolylineModel(polyline),
    ];
    dataSource = MapShapeSource.asset('assets/data/world_map.json', shapeDataField: 'name');
    zoomPanBehavior = MapZoomPanBehavior(
      zoomLevel: 2,
      focalLatLng: MapLatLng(19.3173, 76.7139),
    );

    super.onInit();
  }

  List<ColumnSeries<ChartSampleData, String>> getDefaultColumnSeries() {
    return <ColumnSeries<ChartSampleData, String>>[
      ColumnSeries<ChartSampleData, String>(
        dataSource: <ChartSampleData>[
          ChartSampleData(x: 'Jan', y: 80),
          ChartSampleData(x: 'Fab', y: 85),
          ChartSampleData(x: 'Mar', y: 65),
          ChartSampleData(x: 'Apr', y: 70),
          ChartSampleData(x: 'May', y: 60),
          ChartSampleData(x: 'Jun', y: 55),
          ChartSampleData(x: 'Jul', y: 90),
          ChartSampleData(x: 'Aug', y: 80),
        ],
        width: 0.35,
        borderRadius: BorderRadius.all(Radius.circular(4)),
        color: contentTheme.success,
        xValueMapper: (ChartSampleData sales, _) => sales.x as String,
        yValueMapper: (ChartSampleData sales, _) => sales.y,
      )
    ];
  }

  List<DoughnutSeries<ChartSampleData, String>> salesChart() {
    return <DoughnutSeries<ChartSampleData, String>>[
      DoughnutSeries<ChartSampleData, String>(
          explode: true,
          dataSource: <ChartSampleData>[
            ChartSampleData(x: 'Brooklyn, New York', y: 55, text: '55%'),
            ChartSampleData(x: 'The Castro, San Francisco', y: 31, text: '31%'),
            ChartSampleData(x: 'Kovan, Singapore', y: 7.7, text: '7.7%')
          ],
          xValueMapper: (ChartSampleData data, _) => data.x as String,
          yValueMapper: (ChartSampleData data, _) => data.y,
          dataLabelMapper: (ChartSampleData data, _) => data.text,
          dataLabelSettings: DataLabelSettings(isVisible: true))
    ];
  }

  List<LineSeries<ChartData, num>> secondRevenueChart() {
    return <LineSeries<ChartData, num>>[
      LineSeries<ChartData, num>(
          dataSource: chartData,
          xValueMapper: (ChartData sales, _) => sales.x,
          yValueMapper: (ChartData sales, _) => sales.y,
          name: 'Team A',
          color: contentTheme.danger,
          markerSettings: MarkerSettings(isVisible: true)),
      LineSeries<ChartData, num>(
          dataSource: chartData,
          name: 'Team B',
          xValueMapper: (ChartData sales, _) => sales.x,
          yValueMapper: (ChartData sales, _) => sales.y2,
          color: contentTheme.info,
          markerSettings: MarkerSettings(isVisible: true))
    ];
  }

  List sellingProduct = [
    {
      "image": "assets/images/product/product-1.jpg",
      "name": "ASOS Ridley High Waist",
      "price": "79.49",
      "orders": "82",
      "avl_quantity": "8,540",
      "seller": "Adidas"
    },
    {
      "image": "assets/images/product/product-2.jpg",
      "name": "Marco Lightweight Shirt",
      "price": "12.5",
      "orders": "58",
      "avl_quantity": "6,320",
      "seller": "Adidas"
    },
    {
      "image": "assets/images/product/product-3.jpg",
      "name": "Half Sleeve Shirt",
      "price": "9.99",
      "orders": "254",
      "avl_quantity": "10,258",
      "seller": "Nike"
    },
    {
      "image": "assets/images/product/product-4.jpg",
      "name": "Lightweight Jacket",
      "price": "69.99",
      "orders": "560",
      "avl_quantity": "1,020",
      "seller": "Puma"
    },
    {
      "image": "assets/images/product/product-5.jpg",
      "name": "Marco Sport Shoes",
      "price": "119.99",
      "orders": "75",
      "avl_quantity": "357",
      "seller": "Adidas"
    },
    {
      "image": "assets/images/product/product-6.jpg",
      "name": "Custom Women's T-shirts",
      "price": "45.00",
      "orders": "85",
      "avl_quantity": "135",
      "seller": "Branded"
    },
    {
      "image": "assets/images/product/product-7.jpg",
      "name": "Marco Sport Shoes",
      "price": "119.99",
      "orders": "75",
      "avl_quantity": "357",
      "seller": "Adidas"
    },
  ];
}

class ChartData {
  ChartData(this.x, this.y, this.y2);

  final double x;
  final double y;
  final double y2;
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
