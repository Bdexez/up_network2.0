import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:henox/controller/component/base_ui/typography_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_flex.dart';
import 'package:henox/helpers/widgets/my_flex_item.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/helpers/widgets/my_text_style.dart';
import 'package:henox/view/layouts/layout.dart';

class TypographyScreen extends StatefulWidget {
  const TypographyScreen({super.key});

  @override
  State<TypographyScreen> createState() => _TypographyScreenState();
}

class _TypographyScreenState extends State<TypographyScreen> with UIMixin {
  TypographyController controller = Get.put(TypographyController());

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        tag: 'typography_controller',
        builder: (controller) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Typography", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Base UI'),
                        MyBreadcrumbItem(name: 'Typography'),
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
                    MyFlexItem(child: displayHeadings()),
                    MyFlexItem(child: headings()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: inlineTextElements()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: contextualTextColors()),
                    MyFlexItem(sizes: 'lg-4', child: unordered()),
                    MyFlexItem(sizes: 'lg-4', child: ordered()),
                    MyFlexItem(sizes: 'lg-4', child: unStyled()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: blockQuotes()),
                    MyFlexItem(sizes: 'lg-6 md-6', child: descriptionListAlignment()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget displayHeadings() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Display headings", fontWeight: 600),
          MySpacing.height(20),
          MyText.displayLarge('Display 1', fontWeight: 600),
          MySpacing.height(20),
          MyText.bodySmall(
              'Suspendisse vel quam malesuada, aliquet sem sit amet, fringilla elit. Morbi tempor tincidunt tempor. Etiam id turpis viverra, vulputate sapien nec, varius sem. Curabitur ullamcorper fringilla eleifend. In ut eros hendrerit est consequat posuere et at velit.',

              muted: true),
          MySpacing.height(20),
          MyText.displayMedium('Display 2', fontWeight: 600),
          MySpacing.height(20),
          MyText.bodySmall(
              'In nec rhoncus eros. Vestibulum eu mattis nisl. Quisque viverra viverra magna nec pulvinar. Maecenas pellentesque porta augue, consectetur facilisis diam porttitor sed. Suspendisse tempor est sodales augue rutrum tincidunt. Quisque a malesuada purus.',

              muted: true),
          MySpacing.height(20),
          MyText.displaySmall(
            'Display 3',
            fontWeight: 600,
          ),
          MySpacing.height(20),
          MyText.bodySmall(
              'Vestibulum auctor tincidunt semper. Phasellus ut vulputate lacus. Suspendisse ultricies mi eros, sit amet tempor nulla varius sed. Proin nisl nisi, feugiat quis bibendum vitae, dapibus in tellus.',

              muted: true),
          MySpacing.height(20),
          MyText.headlineLarge('Display 4', fontWeight: 600),
          MySpacing.height(20),
          MyText.bodySmall(
              'Nulla et mattis nunc. Curabitur scelerisque commodo condimentum. Mauris blandit, velit a consectetur egestas, diam arcu fermentum justo, eget ultrices arcu eros vel erat.',

              muted: true),
          MySpacing.height(20),
          MyText.headlineMedium('Display 5', fontWeight: 600),
          MySpacing.height(20),
          MyText.bodySmall(
              'Nulla et mattis nunc. Curabitur scelerisque commodo condimentum. Mauris blandit, velit a consectetur egestas, diam arcu fermentum justo, eget.',

              muted: true),
          MySpacing.height(20),
          MyText.headlineSmall('Display 6', fontWeight: 600),
          MySpacing.height(20),
          MyText.bodySmall('Nulla et mattis nunc. Curabitur scelerisque commodo condimentum. Mauris blandit, velit a consectetur egestas.',
              muted: true),
        ],
      ),
    );
  }

  Widget headings() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Headings", fontWeight: 600),
          MySpacing.height(20),
          MyText.headlineLarge('This is a Heading 1', fontWeight: 600),
          MySpacing.height(20),
          MyText.bodySmall(
              'Suspendisse vel quam malesuada, aliquet sem sit amet, fringilla elit. Morbi tempor tincidunt tempor. Etiam id turpis viverra, vulputate sapien nec, varius sem. Curabitur ullamcorper fringilla eleifend. In ut eros hendrerit est consequat posuere et at velit.',
              muted: true),
          MySpacing.height(20),
          MyText.headlineMedium('This is a Heading 2', fontWeight: 600),
          MySpacing.height(20),
          MyText.bodySmall(
              'In nec rhoncus eros. Vestibulum eu mattis nisl. Quisque viverra viverra magna nec pulvinar. Maecenas pellentesque porta augue, consectetur facilisis diam porttitor sed. Suspendisse tempor est sodales augue rutrum tincidunt. Quisque a malesuada purus.',
              muted: true),
          MySpacing.height(20),
          MyText.headlineSmall('This is a Heading 3', fontWeight: 600),
          MySpacing.height(20),
          MyText.bodySmall(
              'Vestibulum auctor tincidunt semper. Phasellus ut vulputate lacus. Suspendisse ultricies mi eros, sit amet tempor nulla varius sed. Proin nisl nisi, feugiat quis bibendum vitae, dapibus in tellus.',
              muted: true),
          MySpacing.height(20),
          MyText.titleLarge('This is a Heading 4', fontWeight: 600),
          MySpacing.height(20),
          MyText.bodySmall(
              'Nulla et mattis nunc. Curabitur scelerisque commodo condimentum. Mauris blandit, velit a consectetur egestas, diam arcu fermentum justo, eget ultrices arcu eros vel erat.',
              muted: true),
          MySpacing.height(20),
          MyText.titleMedium('This is a Heading 5', fontWeight: 600),
          MySpacing.height(20),
          MyText.bodySmall(
              'Quisque nec turpis at urna dictum luctus. Suspendisse convallis dignissim eros at volutpat. In egestas mattis dui. Aliquam mattis dictum aliquet. Nulla sapien mauris, eleifend et sem ac, commodo dapibus odio. Vivamus pretium nec odio cursus elementum. Suspendisse molestie ullamcorper ornare.',
              muted: true),
          MySpacing.height(20),
          MyText.titleSmall('This is a Heading 6', fontWeight: 600),
          MySpacing.height(12),
          MyText.bodySmall(
              'Donec ultricies, lacus id tempor condimentum, orci leo faucibus sem, a molestie libero lectus ac justo. Ultricies mi eros, sit amet tempor nulla varius sed. Proin nisl nisi, feugiat quis bibendum vitae, dapibus in tellus.',
              muted: true),
        ],
      ),
    );
  }

  Widget inlineTextElements() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium('Inline text elements', fontWeight: 600),
          MySpacing.height(20),
          MyText.bodyMedium('Styling for common inline HTML5 elements.', fontWeight: 600, xMuted: true),
          MySpacing.height(20),
          MyText.bodyMedium('Your title goes here', fontWeight: 600),
          MySpacing.height(20),
          RichText(
            text: TextSpan(
              style: MyTextStyle.bodyMedium(),
              children: [
                TextSpan(text: 'You can use the mark tag to '),
                TextSpan(
                  text: 'highlight',
                  style: TextStyle(backgroundColor: Colors.yellow),
                ),
                TextSpan(text: ' text.'),
              ],
            ),
          ),
          MySpacing.height(20),
          MyText.bodyMedium('This line of text is meant to be treated as deleted text.',  decoration: TextDecoration.underline),
          MySpacing.height(20),
          MyText.bodyMedium('This line of text is meant to be treated as no longer accurate.',
               decoration: TextDecoration.lineThrough),
          MySpacing.height(20),
          MyText.bodyMedium('This line of text is meant to be treated as an addition to the document.',
               decoration: TextDecoration.underline, color: Colors.grey),
          MySpacing.height(20),
          MyText.bodyMedium('This line of text will render as underlined', decoration: TextDecoration.underline),
          MySpacing.height(20),
          MyText.bodyMedium('This line of text is meant to be treated as fine print.', color: contentTheme.secondary),
          MySpacing.height(20),
          MyText.bodyMedium('This line rendered as bold text.', fontWeight: 700),
          MySpacing.height(20),
          MyText.bodyMedium(
            'This line rendered as italicized text.',
            style: TextStyle(fontStyle: FontStyle.italic),
          ),
          MySpacing.height(20),
          RichText(
            text: TextSpan(
              style: MyTextStyle.bodyMedium(),
              children: [
                TextSpan(text: 'Nulla '),
                WidgetSpan(
                  child: Tooltip(
                    message: 'attribute',
                    textStyle: MyTextStyle.bodyMedium(),
                    child: MyText.bodyMedium('attr', decoration: TextDecoration.underline),
                  ),
                ),
                TextSpan(text: ' vitae elit libero, a pharetra augue.', style: TextStyle(fontSize: 16)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget contextualTextColors() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Contextual Text Colors", fontWeight: 600),
          MySpacing.height(20),
          MyText.bodyMedium("Available color variations", fontWeight: 600),
          MySpacing.height(20),
          MyText.bodyMedium("Fusce dapibus, tellus ac cursus commodo, tortor mauris nibh.",  color: contentTheme.secondary),
          MySpacing.height(20),
          MyText.bodyMedium("Nullam id dolor id nibh ultricies vehicula ut id elit.",  color: contentTheme.primary),
          MySpacing.height(20),
          MyText.bodyMedium("Duis mollis, est non commodo luctus, nisi erat porttitor ligula.",  color: Colors.green),
          MySpacing.height(20),
          MyText.bodyMedium("Maecenas sed diam eget risus varius blandit sit amet non magna.",  color: contentTheme.info),
          MySpacing.height(20),
          MyText.bodyMedium("Etiam porta sem malesuada magna mollis euismod.",  color: Colors.orange),
          MySpacing.height(20),
          MyText.bodyMedium("Donec ullamcorper nulla non metus auctor fringilla.",  color: contentTheme.purple),
          MySpacing.height(20),
          MyText.bodyMedium("Nullam id dolor id nibh ultricies vehicula ut id elit.",  color: contentTheme.danger),
          MySpacing.height(20),
          MyText.bodyMedium("Duis mollis, est non commodo luctus, nisi erat porttitor ligula.",  color: contentTheme.pink),
          MySpacing.height(14),
          MyText.bodyMedium("Fusce dapibus, tellus ac cursus commodo, tortor mauris nibh.",  color: contentTheme.title),
          MySpacing.height(14),
          MyContainer(
              padding:MySpacing.xy(8, 4),
              color: contentTheme.dark,
              child:
                  MyText.bodyMedium("Duis mollis, est non commodo luctus, nisi erat porttitor ligula.",  color: contentTheme.onDark)),
        ],
      ),
    );
  }

  Widget unordered() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Unordered", fontWeight: 600),
          MySpacing.height(20),
          UnorderedList(
            items: [
              'Lorem ipsum dolor sit amet',
              'Consectetur adipiscing elit',
              'Integer molestie lorem at massa',
              'Facilisis in pretium nisl aliquet',
              'Nulla volutpat aliquam velit',
              UnorderedList(
                items: [
                  'Phasellus iaculis neque',
                  'Vestibulum laoreet porttitor sem',
                  'Ac tristique libero volutpat at',
                ],
              ),
              'Faucibus porta lacus fringilla vel',


            ],
          ),
        ],
      ),
    );
  }

  Widget ordered() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Ordered", fontWeight: 600),
          MySpacing.height(20),
          OrderedList(
            items: [
              'Lorem ipsum dolor sit amet',
              'Consectetur adipiscing elit',
              'Integer molestie lorem at massa',
              'Facilisis in pretium nisl aliquet',
              OrderedList(
                items: [
                  'Phasellus iaculis neque',
                  'Purus sodales ultricies',
                  'Vestibulum laoreet porttitor sem',
                  'Ac tristique libero volutpat at',
                ],
              ),
              'Aenean sit amet erat nunc',
            ],
          ),
        ],
      ),
    );
  }

  Widget unStyled() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.bodyMedium("Unstyled", fontWeight: 600),
          MySpacing.height(20),
          MyText.bodySmall('This only applies to immediate children list items, meaning you will need to add the class for any nested lists as well.',
            muted: true,  ),
          MySpacing.height(20),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              MyText.bodyMedium('Lorem ipsum dolor sit amet',muted: true ),
                    MyText.bodyMedium('Integer molestie lorem at massa',muted: true ),
              Padding(
                padding: MySpacing.left(16),
                child: MyText.bodyMedium('• Phasellus iaculis neque',muted: true ),
              ),
              MyText.bodyMedium('Faucibus porta lacus fringilla vel',muted: true ),
              MyText.bodyMedium('Eget porttitor lorem',muted: true ),
            ],
          ),
          MySpacing.height(20),
          MyText.titleMedium('Inline',fontWeight: 600 ),
          MySpacing.height(16),
          MyText.bodyMedium('Place all list items on a single line with display: inline-block; and some light padding.', muted: true),
          MySpacing.height(16),
          Wrap(
            spacing: 20,
            runSpacing: 20,
            children: [
              MyText.bodyMedium('Lorem ipsum', muted: true),
              MyText.bodyMedium('Phasellus iaculis', muted: true),
              MyText.bodyMedium('Nulla volutpat', muted: true),
            ],
          ),
        ],
      ),
    );
  }

  Widget blockQuotes() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Blockquotes", fontWeight: 600),
          MySpacing.height(20),
          MyText.bodyMedium('For quoting blocks of content from another source within your document. Wrap blockquote around any HTML as the quote.',
              muted: true),
          MySpacing.height(20),
          Container(
            decoration: BoxDecoration(
              border: Border(
                left: BorderSide(color: Colors.grey, width: 4),
              ),
            ),
            padding: MySpacing.xy(16, 8),
            child: MyText.bodyMedium(
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.',muted: true
            ),
          ),
          Align(
            alignment: Alignment.centerLeft,
            child: Padding(
              padding: MySpacing.top(4),
              child: MyText.bodyMedium(
                'Someone famous in Source Title',
                style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic),
              ),
            ),
          ),
          MySpacing.height(20),
          Container(
            decoration: BoxDecoration(
              border: Border(
                left: BorderSide(color: Colors.grey, width: 4),
              ),
            ),
            padding: MySpacing.xy(16, 8),
            child: Center(
              child: MyText.bodyMedium(
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.',
                textAlign: TextAlign.center,
              ),
            ),
          ),
          Center(
            child: Padding(
              padding: MySpacing.top(4),
              child: MyText.bodyMedium(
                'Someone famous in Source Title',
                style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic),
              ),
            ),
          ),
          MySpacing.height(20),
          Container(
            decoration: BoxDecoration(
              border: Border(
                left: BorderSide(color: Colors.grey, width: 4),
              ),
            ),
            padding: MySpacing.xy(16, 8),
            child: Align(
              alignment: Alignment.centerRight,
              child: MyText.bodyMedium(
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.',
                textAlign: TextAlign.right,
              ),
            ),
          ),
          Align(
            alignment: Alignment.centerRight,
            child: Padding(
              padding: MySpacing.top(4),
              child: MyText.bodyMedium(
                'Someone famous in Source Title',
                style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget descriptionListAlignment() {
    return MyCard(
      shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
      paddingAll: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MyText.titleMedium("Description list alignment", fontWeight: 600),
          MySpacing.height(20),
          MyText.bodySmall(
              'Align terms and descriptions horizontally by using grid system classes or mixins. You can optionally truncate the text with an ellipsis.',
              fontWeight: 600,
              color: contentTheme.secondary),
          MySpacing.height(20),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 3,
                child: MyText.bodyMedium('Description lists', fontWeight: 600),
              ),
              Expanded(
                flex: 9,
                child: MyText(
                  'A description list is perfect for defining terms.',muted: true
                ),
              ),
            ],
          ),
          MySpacing.height(20),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 3,
                child: MyText.bodyMedium('Euismod', fontWeight: 600),
              ),
              Expanded(
                flex: 9,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    MyText.bodyMedium('Vestibulum id ligula porta felis euismod semper eget lacinia odio sem nec elit.',muted: true),
                    MyText.bodyMedium('Donec id elit non mi porta gravida at eget metus.',muted: true),
                  ],
                ),
              ),
            ],
          ),
          MySpacing.height(20),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 3,
                child: MyText.bodyMedium('Malesuada porta', fontWeight: 600),
              ),
              Expanded(
                flex: 9,
                child: MyText.bodyMedium(
                  'Etiam porta sem malesuada magna mollis euismod.',muted: true
                ),
              ),
            ],
          ),
          MySpacing.height(20),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 3,
                child: MyText.bodyMedium(
                  'Truncated term is truncated',
                  fontWeight: 600,
                  overflow: TextOverflow.ellipsis, // Adding ellipsis
                ),
              ),
              Expanded(
                flex: 9,
                child: MyText.bodyMedium(
                  'Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.',muted: true
                ),
              ),
            ],
          )
        ],
      ),
    );
  }
}

class UnorderedList extends StatelessWidget {
  final List<dynamic> items;

  UnorderedList({required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: items.map((item) {
        if (item is String) {
          return Padding(
            padding: MySpacing.bottom(12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                MyText.bodyMedium('•', fontWeight: 600),
                MySpacing.width(8),
                Expanded(
                  child: MyText.bodyMedium(item,muted: true),
                ),
              ],
            ),
          );
        } else if (item is UnorderedList) {
          return Padding(
            padding: MySpacing.left(16),
            child: item,
          );
        }
        return SizedBox.shrink();
      }).toList(),
    );
  }
}

class OrderedList extends StatelessWidget {
  final List<dynamic> items;
  final int startIndex;

  OrderedList({required this.items, this.startIndex = 1});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: items.asMap().entries.map((entry) {
        int index = entry.key + startIndex;
        var item = entry.value;

        if (item is String) {
          return Padding(
            padding: MySpacing.bottom(12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                MyText.bodyMedium('$index.', fontWeight: 600),
                MySpacing.width(8),
                Expanded(
                  child: MyText.bodyMedium(item),
                ),
              ],
            ),
          );
        } else if (item is OrderedList) {
          return Padding(
            padding: MySpacing.left(16),
            child: item,
          );
        }
        return SizedBox.shrink();
      }).toList(),
    );
  }
}
