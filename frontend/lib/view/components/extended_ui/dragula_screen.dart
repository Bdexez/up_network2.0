import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/extended_ui/dragula_controller.dart';
import 'package:flutter_reorderable_grid_view/widgets/reorderable_builder.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_list_extension.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/model/drag_n_drop_model.dart';
import 'package:henox/view/layouts/layout.dart';

class DragulaScreen extends StatefulWidget {
  const DragulaScreen({super.key});

  @override
  State<DragulaScreen> createState() => _DragulaScreenState();
}

class _DragulaScreenState extends State<DragulaScreen> with UIMixin {
  DragulaController controller = Get.put(DragulaController());

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'dragula_controller',
        builder: (controller) {
          final generatedChildren = List.generate(
              controller.dragNDrop.length,
              (index) => MyCard(
                    shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
                    paddingAll: 24,
                    key: Key('${index}'),
                    borderRadiusAll: 8,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        MyContainer(
                          width: double.infinity,
                          height: 100,
                          paddingAll: 0,
                          clipBehavior: Clip.antiAliasWithSaveLayer,
                          borderRadiusAll: 8,
                          child: Image.asset(controller.dragNDrop[index].image, fit: BoxFit.cover),
                        ),
                        MySpacing.height(12),
                        MyText.bodyMedium(controller.dummyTexts[index], maxLines: 3,muted: true)
                      ],
                    ),
                  ));
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Dragula", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Extended UI'),
                        MyBreadcrumbItem(name: 'Dragula'),
                      ],
                    ),
                  ],
                ),
              ),
              MySpacing.height(flexSpacing),
              Padding(
                  padding: MySpacing.x(flexSpacing),
                  child: MyCard(
                    shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
                    paddingAll: 24,
                    width: MediaQuery.of(context).size.width,
                    padding: MySpacing.xy(20, 20),
                    child: ReorderableListView(
                      proxyDecorator: (child, index, animation) {
                        return Material(
                          child: MyCard(
                            shadow: MyShadow(elevation: 0.5),
                            paddingAll: 0,
                            child: child,
                          ),
                        );
                      },
                      buildDefaultDragHandles: false,
                      shrinkWrap: true,
                      onReorder: controller.onNormalReorder,
                      children: controller.normalDragNDrop
                          .mapIndexed((index, element) => ListTile(
                                key: Key('$index'),
                                leading: ReorderableDragStartListener(
                                    index: index,
                                    child: MouseRegion(
                                        cursor: SystemMouseCursors.grabbing,
                                        child: Icon(
                                          LucideIcons.grip_vertical,
                                          size: 20,
                                        ))),
                                title: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: MyText.labelMedium(
                                        ' ${element.fullName}',
                                      ),
                                    ),
                                    Expanded(
                                      child: MyText.labelMedium(' ${element.phoneNumber}', textAlign: TextAlign.start),
                                    ),
                                    Expanded(
                                      child: MyText.labelMedium(' ${element.balance}'),
                                    ),
                                    Container(
                                      constraints: BoxConstraints(maxWidth: 100),
                                      child: Icon(
                                        LucideIcons.trash_2,
                                        size: 20,
                                      ),
                                    ),
                                  ],
                                ),
                              ))
                          .toList(),
                    ),
                  )),
              MySpacing.height(20),
              if (controller.dragNDrop.isNotEmpty)
                Padding(
                  padding: MySpacing.x(flexSpacing),
                  child: ReorderableBuilder(
                      scrollController: controller.scrollController,
                      enableLongPress: false,
                      onReorder: (ReorderedListFunction reorderedListFunction) {
                        setState(() {
                          controller.dragNDrop = reorderedListFunction(controller.dragNDrop) as List<DragNDropModel>;
                        });
                      },
                      longPressDelay: Duration(milliseconds: 300),
                      builder: (children) {
                        return GridView(
                          shrinkWrap: true,
                          key: controller.gridViewKey,
                          controller: controller.scrollController,
                          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 4,
                            mainAxisExtent: 230,
                            mainAxisSpacing: 24,
                            crossAxisSpacing: 24,
                          ),
                          children: children,
                        );
                      },
                      children: generatedChildren),
                ),
            ],
          );
        },
      ),
    );
  }
}
