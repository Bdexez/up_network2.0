import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/route_manager.dart';
import 'package:henox/helpers/extensions/string.dart';
import 'package:henox/helpers/services/url_service.dart';
import 'package:henox/helpers/theme/theme_customizer.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/route/route_method.dart';
import 'package:henox/widgets/custom_pop_menu.dart';

typedef LeftbarMenuFunction = void Function(String key);

class LeftbarObserver {
  static Map<String, LeftbarMenuFunction> observers = {};

  static attachListener(String key, LeftbarMenuFunction fn) {
    observers[key] = fn;
  }

  static detachListener(String key) {
    observers.remove(key);
  }

  static notifyAll(String key) {
    for (var fn in observers.values) {
      fn(key);
    }
  }
}

class LeftBar extends StatefulWidget {
  final bool isCondensed;

  const LeftBar({super.key, this.isCondensed = false});

  @override
  _LeftBarState createState() => _LeftBarState();
}

class _LeftBarState extends State<LeftBar> with SingleTickerProviderStateMixin, UIMixin {
  final ThemeCustomizer customizer = ThemeCustomizer.instance;

  bool isCondensed = false;
  String path = UrlService.getCurrentUrl();

  @override
  Widget build(BuildContext context) {
    isCondensed = widget.isCondensed;
    return MyCard(
      paddingAll: 0,
      shadow: MyShadow(position: MyShadowPosition.centerRight, elevation: 0.2),
      child: AnimatedContainer(
        color: leftBarTheme.background,
        width: isCondensed ? 60 : 240,
        curve: Curves.easeIn,
        duration: Duration(milliseconds: 400),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
                child: ScrollConfiguration(
              behavior: ScrollConfiguration.of(context).copyWith(scrollbars: false),
              child: SingleChildScrollView(
                clipBehavior: Clip.antiAliasWithSaveLayer,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    MySpacing.height(20),
                    labelWidget("main".tr()),
                    NavigationItem(iconData: LucideIcons.layout_dashboard, title: "Dashboard", isCondensed: isCondensed, route: route.dashboard),
                    NavigationItem(iconData: LucideIcons.gauge, title: "Dashboard 2", isCondensed: isCondensed, route: route.dashboard2),
                    NavigationItem(iconData: LucideIcons.calendar_days, title: "Calendar", isCondensed: isCondensed, route: route.calendar),
                    NavigationItem(iconData: LucideIcons.message_square, title: "Chat", isCondensed: isCondensed, route: route.chat),
                    MenuWidget(
                      iconData: LucideIcons.mails,
                      isCondensed: isCondensed,
                      title: "Email",
                      children: [
                        MenuItem(title: 'Inbox', route: route.emailInbox, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Read Email', route: route.readEmail, isCondensed: widget.isCondensed),
                      ],
                    ),
                    MenuWidget(
                      iconData: LucideIcons.circle_check,
                      isCondensed: isCondensed,
                      title: "Tasks",
                      children: [
                        MenuItem(title: 'List', route: route.taskList, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Detail', route: route.taskDetail, isCondensed: widget.isCondensed),
                      ],
                    ),
                    NavigationItem(iconData: LucideIcons.square_kanban, title: "Kanban Board", isCondensed: isCondensed, route: route.kanbanBoard),
                    NavigationItem(iconData: LucideIcons.folder_open, title: "File Manager", isCondensed: isCondensed, route: route.fileManager),
                    MenuWidget(
                      iconData: LucideIcons.square_asterisk,
                      isCondensed: isCondensed,
                      title: "Pages",
                      children: [
                        MenuItem(title: 'Profile', route: route.profile, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Invoice', route: route.invoice, isCondensed: widget.isCondensed),
                        MenuItem(title: 'FAQs', route: route.faqs, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Pricing', route: route.pricing, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Maintenance', route: route.maintenance, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Starter Page', route: route.starterPage, isCondensed: widget.isCondensed),
                        MenuItem(title: 'With Preloader', route: route.withPreloader, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Timeline', route: route.timeLine, isCondensed: widget.isCondensed),
                      ],
                    ),
                    MenuWidget(
                      iconData: LucideIcons.users_round,
                      isCondensed: isCondensed,
                      title: "Auth Pages",
                      children: [
                        MenuItem(title: 'Login', route: route.login, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Register', route: route.createAccount, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Logout', route: route.logOut, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Recover Password', route: route.forgotPassword, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Lock Screen', route: route.lock, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Confirm Mail', route: route.confirmMail, isCondensed: widget.isCondensed),
                      ],
                    ),
                    MenuWidget(
                      iconData: LucideIcons.info,
                      isCondensed: isCondensed,
                      title: "Error Pages",
                      children: [
                        MenuItem(title: 'Error 404', route: route.error404, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Error 404-alt', route: route.error404Alt, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Error 500', route: route.error500, isCondensed: widget.isCondensed),
                      ],
                    ),
                    labelWidget("components".tr()),
                    MenuWidget(
                      iconData: LucideIcons.briefcase,
                      isCondensed: isCondensed,
                      title: "Base UI",
                      children: [
                        MenuItem(title: 'Accordion', route: route.accordion, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Alert', route: route.alert, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Avatars', route: route.avatars, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Badges', route: route.badges, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Breadcrumb', route: route.breadcrumb, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Buttons', route: route.buttons, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Cards', route: route.card, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Carousel', route: route.carousel, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Collapse', route: route.collapse, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Dropdowns', route: route.dropdowns, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Embed Video', route: route.embedVideo, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Links', route: route.links, isCondensed: widget.isCondensed),
                        MenuItem(title: 'List Group', route: route.listGroup, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Model', route: route.models, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Notifications', route: route.notification, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Placeholders', route: route.placeholder, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Pagination', route: route.pagination, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Progress', route: route.progress, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Spinners', route: route.spinners, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Tabs', route: route.tabBar, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Tooltip', route: route.tooltip, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Typography', route: route.typography, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Utilities', route: route.utilities, isCondensed: widget.isCondensed),
                      ],
                    ),
                    MenuWidget(
                      iconData: LucideIcons.box,
                      isCondensed: isCondensed,
                      title: "Extended UI",
                      children: [
                        MenuItem(title: 'Dragula', route: route.dragula, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Range Slider', route: route.rangeSlider, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Ratings', route: route.ratings, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Scrollbar', route: route.scrollbar, isCondensed: widget.isCondensed),
                      ],
                    ),
                    NavigationItem(iconData: LucideIcons.component, title: "Widgets", isCondensed: isCondensed, route: route.widgets),
                    NavigationItem(iconData: LucideIcons.lightbulb, title: "Icons", isCondensed: isCondensed, route: route.icon),
                    NavigationItem(iconData: LucideIcons.chart_area, title: "Charts", isCondensed: isCondensed, route: route.charts),
                    MenuWidget(
                      iconData: LucideIcons.box,
                      isCondensed: isCondensed,
                      title: "Forms",
                      children: [
                        MenuItem(title: 'Basic Elements', route: route.basicElement, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Validation', route: route.validation, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Wizard', route: route.wizard, isCondensed: widget.isCondensed),
                        MenuItem(title: 'File Uploads', route: route.fileUpload, isCondensed: widget.isCondensed),
                        MenuItem(title: 'Editors', route: route.editor, isCondensed: widget.isCondensed),
                      ],
                    ),
                    MenuWidget(
                      iconData: LucideIcons.table,
                      isCondensed: isCondensed,
                      title: "Tables",
                      children: [
                        MenuItem(title: 'Basic Tables', route: route.basicTable, isCondensed: widget.isCondensed),
                      ],
                    ),
                    MenuWidget(
                      iconData: LucideIcons.map,
                      isCondensed: isCondensed,
                      title: "Maps",
                      children: [
                        MenuItem(title: 'Syncfusion', route: route.map, isCondensed: widget.isCondensed),
                      ],
                    ),
                    MySpacing.height(32),
                  ],
                ),
              ),
            ))
          ],
        ),
      ),
    );
  }

  Widget labelWidget(String label) {
    return isCondensed
        ? MySpacing.empty()
        : Container(
            padding: MySpacing.xy(24, 8),
            child: MyText.labelSmall(
              label.toUpperCase(),
              color: leftBarTheme.labelColor,
              muted: true,
              maxLines: 1,
              overflow: TextOverflow.clip,
              fontWeight: 700,
            ),
          );
  }
}

class MenuWidget extends StatefulWidget {
  final IconData iconData;
  final String title;
  final bool isCondensed;
  final bool active;
  final List<MenuItem> children;

  const MenuWidget({super.key, required this.iconData, required this.title, this.isCondensed = false, this.active = false, this.children = const []});

  @override
  _MenuWidgetState createState() => _MenuWidgetState();
}

class _MenuWidgetState extends State<MenuWidget> with UIMixin, SingleTickerProviderStateMixin {
  bool isHover = false;
  bool isActive = false;
  late Animation<double> _iconTurns;
  late AnimationController _controller;
  bool popupShowing = true;
  Function? hideFn;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(duration: Duration(milliseconds: 200), vsync: this);
    _iconTurns = _controller.drive(Tween<double>(begin: 0.0, end: 0.5).chain(CurveTween(curve: Curves.easeIn)));
    LeftbarObserver.attachListener(widget.title, onChangeMenuActive);
  }

  void onChangeMenuActive(String key) {
    if (key != widget.title) {
      // onChangeExpansion(false);
    }
  }

  void onChangeExpansion(value) {
    isActive = value;
    if (isActive) {
      _controller.forward();
    } else {
      _controller.reverse();
    }
    if (mounted) {
      setState(() {});
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    var route = UrlService.getCurrentUrl();
    isActive = widget.children.any((element) => element.route == route);
    onChangeExpansion(isActive);
    if (hideFn != null) {
      hideFn!();
    }
    popupShowing = false;
  }

  @override
  Widget build(BuildContext context) {
    if (widget.isCondensed) {
      return CustomPopupMenu(
        backdrop: true,
        show: popupShowing,
        hideFn: (hide) {
          hide;
          hideFn?.call();
        },
        onChange: (value) {
          popupShowing = value;
          hideFn?.call();
        },
        placement: CustomPopupMenuPlacement.right,
        menu: MouseRegion(
          cursor: SystemMouseCursors.click,
          onHover: (event) => setState(() => isHover = true),
          onExit: (event) => setState(() => isHover = false),
          child: MyContainer.transparent(
            margin: MySpacing.fromLTRB(0, 0, 0, 8),
            color: isActive || isHover ? leftBarTheme.activeItemBackground.withAlpha(36) : Colors.transparent,
            padding: MySpacing.xy(8, 8),
            child: Center(
              child: Icon(
                widget.iconData,
                color: (isHover || isActive) ? leftBarTheme.activeItemColor : leftBarTheme.onBackground,
                size: 20,
              ),
            ),
          ),
        ),
        menuBuilder: (_) => MyContainer.bordered(
          paddingAll: 8,
          width: 190,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: widget.children,
          ),
        ),
      );
    } else {
      return MouseRegion(
        cursor: SystemMouseCursors.click,
        onHover: (event) => setState(() => isHover = true),
        onExit: (event) => setState(() => isHover = false),
        child: MyContainer.transparent(
          margin: MySpacing.fromLTRB(0, 0, 0, 8),
          padding: MySpacing.x(20),
          child: ListTileTheme(
            contentPadding: EdgeInsets.all(0),
            dense: true,
            horizontalTitleGap: 0.0,
            minLeadingWidth: 0,
            child: ExpansionTile(
                tilePadding: MySpacing.zero,
                initiallyExpanded: isActive,
                maintainState: true,
                onExpansionChanged: (value) {
                  LeftbarObserver.notifyAll(widget.title);
                  onChangeExpansion(value);
                },
                trailing: RotationTransition(
                  turns: _iconTurns,
                  child: Icon(
                    LucideIcons.chevron_down,
                    size: 18,
                    color: leftBarTheme.onBackground,
                  ),
                ),
                iconColor: leftBarTheme.activeItemColor,
                childrenPadding: MySpacing.x(12),
                title: Row(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Icon(
                      widget.iconData,
                      size: 20,
                      color: isHover || isActive ? leftBarTheme.activeItemColor : leftBarTheme.onBackground,
                    ),
                    MySpacing.width(18),
                    Expanded(
                      child: MyText.titleSmall(
                        fontWeight: 600,
                        widget.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.start,
                        color: isHover || isActive ? leftBarTheme.activeItemColor : leftBarTheme.onBackground,
                      ),
                    ),
                  ],
                ),
                collapsedBackgroundColor: Colors.transparent,
                shape: RoundedRectangleBorder(
                  side: BorderSide(color: Colors.transparent),
                ),
                backgroundColor: Colors.transparent,
                children: widget.children),
          ),
        ),
      );
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
    // LeftbarObserver.detachListener(widget.title);
  }
}

class MenuItem extends StatefulWidget {
  final IconData? iconData;
  final String title;
  final bool isCondensed;
  final String? route;

  const MenuItem({
    super.key,
    this.iconData,
    required this.title,
    this.isCondensed = false,
    this.route,
  });

  @override
  _MenuItemState createState() => _MenuItemState();
}

class _MenuItemState extends State<MenuItem> with UIMixin {
  bool isHover = false;

  @override
  Widget build(BuildContext context) {
    bool isActive = UrlService.getCurrentUrl() == widget.route;
    return GestureDetector(
      onTap: () {
        if (widget.route != null) {
          Get.toNamed(widget.route!);
        }
      },
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        onHover: (event) => setState(() => isHover = true),
        onExit: (event) => setState(() => isHover = false),
        child: MyContainer.transparent(
          margin: MySpacing.fromLTRB(4, 0, 8, 4),
          color: isActive || isHover ? leftBarTheme.activeItemBackground.withAlpha(36) : Colors.transparent,
          width: MediaQuery.of(context).size.width,
          padding: MySpacing.xy(18, 7),
          child: MyText.bodySmall(
            "${widget.isCondensed ? "" : "- "}  ${widget.title}",
            overflow: TextOverflow.clip,
            maxLines: 1,
            textAlign: TextAlign.left,
            fontSize: 12.5,
            color: isActive || isHover ? leftBarTheme.activeItemColor : leftBarTheme.onBackground,
            fontWeight: 600,
          ),
        ),
      ),
    );
  }
}

class NavigationItem extends StatefulWidget {
  final IconData? iconData;
  final String title;
  final bool isCondensed;
  final String? route;

  const NavigationItem({super.key, this.iconData, required this.title, this.isCondensed = false, this.route});

  @override
  _NavigationItemState createState() => _NavigationItemState();
}

class _NavigationItemState extends State<NavigationItem> with UIMixin {
  bool isHover = false;

  @override
  Widget build(BuildContext context) {
    bool isActive = UrlService.getCurrentUrl() == widget.route;
    return GestureDetector(
      onTap: () {
        if (widget.route != null) {
          Get.toNamed(widget.route!);
        }
      },
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        onHover: (event) => setState(() => isHover = true),
        onExit: (event) => setState(() => isHover = false),
        child: MyContainer.transparent(
          margin: MySpacing.fromLTRB(0, 0, 0, 8),
          color: isActive || isHover ? leftBarTheme.activeItemBackground.withAlpha(36) : Colors.transparent,
          padding: MySpacing.xy(20, 8),
          borderRadiusAll: 0,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              if (widget.iconData != null)
                Center(
                  child: Icon(widget.iconData, color: (isHover || isActive) ? leftBarTheme.activeItemColor : leftBarTheme.onBackground, size: 20),
                ),
              if (!widget.isCondensed)
                Flexible(
                  fit: FlexFit.loose,
                  child: MySpacing.width(16),
                ),
              if (!widget.isCondensed)
                Expanded(
                  flex: 3,
                  child: MyText.titleSmall(
                    widget.title,
                    fontWeight: 600,
                    overflow: TextOverflow.clip,
                    maxLines: 1,
                    color: isActive || isHover ? leftBarTheme.activeItemColor : leftBarTheme.onBackground,
                  ),
                )
            ],
          ),
        ),
      ),
    );
  }
}
