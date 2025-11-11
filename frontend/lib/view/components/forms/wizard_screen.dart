import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:get/get.dart';
import 'package:henox/app_constant.dart';
import 'package:henox/controller/component/forms/wizard_controller.dart';
import 'package:henox/helpers/theme/app_theme.dart';
import 'package:henox/helpers/utils/mixins/ui_mixin.dart';
import 'package:henox/helpers/utils/my_shadow.dart';
import 'package:henox/helpers/widgets/my_breadcrumb.dart';
import 'package:henox/helpers/widgets/my_breadcrumb_item.dart';
import 'package:henox/helpers/widgets/my_button.dart';
import 'package:henox/helpers/widgets/my_card.dart';
import 'package:henox/helpers/widgets/my_container.dart';
import 'package:henox/helpers/widgets/my_flex.dart';
import 'package:henox/helpers/widgets/my_flex_item.dart';
import 'package:henox/helpers/widgets/my_spacing.dart';
import 'package:henox/helpers/widgets/my_text.dart';
import 'package:henox/helpers/widgets/my_text_style.dart';
import 'package:henox/view/layouts/layout.dart';

class WizardScreen extends StatefulWidget {
  const WizardScreen({super.key});

  @override
  State<WizardScreen> createState() => _WizardScreenState();
}

class _WizardScreenState extends State<WizardScreen> with UIMixin {
  WizardController controller = Get.put(WizardController());
  @override
  Widget build(BuildContext context) {
    return Layout(
      child: GetBuilder(
        init: controller,
        builder: (controller) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: MySpacing.x(flexSpacing),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MyText.titleMedium("Form Wizard", fontSize: 18, fontWeight: 600),
                    MyBreadcrumb(
                      children: [
                        MyBreadcrumbItem(name: 'Forms'),
                        MyBreadcrumbItem(name: 'Form Wizard'),
                      ],
                    ),
                  ],
                ),
              ),
              MySpacing.height(flexSpacing),
              Padding(
                padding: MySpacing.x(flexSpacing /2 ),
                child: MyFlex(children: [
                  MyFlexItem(
                      sizes: 'lg-6',
                      child: MyCard(
                        shadow: MyShadow(elevation: .7, position: MyShadowPosition.bottom),
                        paddingAll: 24,
                        child: Column(
                          children: [
                            GestureDetector(
                              onTap: () => {controller.onChangedValidation(!controller.enableValidation)},
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Checkbox(
                                    onChanged: controller.onChangedValidation,
                                    value: controller.enableValidation,
                                    activeColor: theme.colorScheme.primary,
                                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                    visualDensity: getCompactDensity,
                                  ),
                                  MySpacing.width(16),
                                  MyText.labelMedium("Enable Validation")
                                ],
                              ),
                            ),
                            MySpacing.height(20),
                            MyContainer.bordered(
                              paddingAll: 20,
                              child: Column(
                                children: [
                                  Row(
                                    children: getTabs(),
                                  ),
                                  MySpacing.height(32),
                                  SizedBox(
                                    height: 376,
                                    child: PageView(
                                      pageSnapping: true,
                                      controller: controller.pageController,
                                      onPageChanged: controller.onChangePage,
                                      children: getContents(),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ))
                ]),
              ),
            ],
          );
        },
      ),
    );
  }

  List<Widget> getContents() {
    step1() {
      return Form(
        key: controller.step1Validator.formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            MyText.labelMedium(
              "Username",
            ),
            MySpacing.height(8),
            TextFormField(
              validator: controller.step1Validator.getValidation('username'),
              controller: controller.step1Validator.getController('username'),
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(
                  hintText: "Username",
                  hintStyle: MyTextStyle.bodySmall(xMuted: true),
                  border: outlineInputBorder,
                  enabledBorder: outlineInputBorder,
                  focusedBorder: focusedInputBorder,
                  prefixIcon: Icon(
                    LucideIcons.user,
                    size: 16,
                  ),
                  contentPadding: MySpacing.all(16),
                  isCollapsed: true,
                  floatingLabelBehavior: FloatingLabelBehavior.never),
            ),
            MySpacing.height(16),
            MyText.labelMedium(
              "Email Address",
            ),
            MySpacing.height(8),
            TextFormField(
              validator: controller.step1Validator.getValidation('email'),
              controller: controller.step1Validator.getController('email'),
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(
                  hintText: "Email Address",
                  hintStyle: MyTextStyle.bodySmall(xMuted: true),
                  border: outlineInputBorder,
                  enabledBorder: outlineInputBorder,
                  focusedBorder: focusedInputBorder,
                  prefixIcon: Icon(
                    LucideIcons.mail,
                    size: 16,
                  ),
                  contentPadding: MySpacing.all(16),
                  isCollapsed: true,
                  floatingLabelBehavior: FloatingLabelBehavior.never),
            ),
            MySpacing.height(16),
            MyText.labelMedium(
              "Password",
            ),
            MySpacing.height(8),
            TextFormField(
              validator: controller.step1Validator.getValidation('password'),
              controller: controller.step1Validator.getController('password'),
              keyboardType: TextInputType.visiblePassword,
              obscureText: !controller.showPassword,
              decoration: InputDecoration(
                  hintText: "Password",
                  hintStyle: MyTextStyle.bodySmall(xMuted: true),
                  border: outlineInputBorder,
                  enabledBorder: outlineInputBorder,
                  focusedBorder: focusedInputBorder,
                  prefixIcon: Icon(
                    LucideIcons.lock,
                    size: 16,
                  ),
                  suffixIcon: InkWell(
                    onTap: controller.onChangeShowPassword,
                    child: Icon(
                      controller.showPassword ? LucideIcons.eye : LucideIcons.eye_off,
                      size: 18,
                    ),
                  ),
                  contentPadding: MySpacing.all(16),
                  isCollapsed: true,
                  floatingLabelBehavior: FloatingLabelBehavior.never),
            ),
            MySpacing.height(28),
            Align(
              alignment: Alignment.centerRight,
              child: MyButton.rounded(
                onPressed: () {
                  controller.onNext();
                },
                elevation: 0,
                padding: MySpacing.xy(20, 16),
                backgroundColor: contentTheme.primary,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    controller.loading
                        ? SizedBox(
                            height: 14,
                            width: 14,
                            child: CircularProgressIndicator(
                              color: theme.colorScheme.onPrimary,
                              strokeWidth: 1.2,
                            ),
                          )
                        : Container(),
                    if (controller.loading) MySpacing.width(16),
                    MyText.bodySmall(
                      'Next',
                      color: contentTheme.onPrimary,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    }

    step2() {
      return Form(
        key: controller.step2Validator.formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      MyText.labelMedium(
                        "First Name",
                      ),
                      MySpacing.height(4),
                      TextFormField(
                        validator: controller.step2Validator.getValidation('first_name'),
                        controller: controller.step2Validator.getController('first_name'),
                        keyboardType: TextInputType.emailAddress,
                        decoration: InputDecoration(
                          labelText: "First Name",
                          labelStyle: MyTextStyle.bodySmall(xMuted: true),
                          border: outlineInputBorder,
                          enabledBorder: outlineInputBorder,
                          focusedBorder: focusedInputBorder,
                          prefixIcon: Icon(
                            LucideIcons.user,
                            size: 20,
                          ),
                          contentPadding: MySpacing.all(16),
                          isCollapsed: true,
                          floatingLabelBehavior: FloatingLabelBehavior.never,
                        ),
                      ),
                    ],
                  ),
                ),
                MySpacing.width(20),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      MyText.labelMedium(
                        "Last Name",
                      ),
                      MySpacing.height(4),
                      TextFormField(
                        validator: controller.step2Validator.getValidation('last_name'),
                        controller: controller.step2Validator.getController('last_name'),
                        keyboardType: TextInputType.emailAddress,
                        decoration: InputDecoration(
                          labelText: "Last Name",
                          labelStyle: MyTextStyle.bodySmall(xMuted: true),
                          border: outlineInputBorder,
                          enabledBorder: outlineInputBorder,
                          focusedBorder: focusedInputBorder,
                          prefixIcon: Icon(
                            LucideIcons.user,
                            size: 20,
                          ),
                          contentPadding: MySpacing.all(16),
                          isCollapsed: true,
                          floatingLabelBehavior: FloatingLabelBehavior.never,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            MySpacing.height(20),
            MyText.labelMedium(
              "Phone Number",
            ),
            MySpacing.height(4),
            TextFormField(
              validator: controller.step2Validator.getValidation('phone_number'),
              controller: controller.step2Validator.getController('phone_number'),
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(
                labelText: "Phone Number",
                labelStyle: MyTextStyle.bodySmall(xMuted: true),
                border: outlineInputBorder,
                enabledBorder: outlineInputBorder,
                focusedBorder: focusedInputBorder,
                prefixIcon: Icon(
                  LucideIcons.mail,
                  size: 20,
                ),
                contentPadding: MySpacing.all(16),
                isCollapsed: true,
                floatingLabelBehavior: FloatingLabelBehavior.never,
              ),
            ),
            MySpacing.height(20),
            MyText.labelMedium(
              "Date Of Birth",
            ),
            MySpacing.height(4),
            MyButton.outlined(
              onPressed: () {
                controller.pickDateTime();
              },
              borderColor: theme.colorScheme.primary,
              padding: MySpacing.xy(16, 16),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Icon(
                    LucideIcons.calendar_check,
                    color: theme.colorScheme.primary,
                    size: 16,
                  ),
                  MySpacing.width(10),
                  MyText.labelMedium(
                      controller.selectedDateTime != null
                          ? "${dateFormatter.format(controller.selectedDateTime!)} ${timeFormatter.format(controller.selectedDateTime!)}"
                          : "Select Date & Time",
                      fontWeight: 600,
                      color: theme.colorScheme.primary),
                ],
              ),
            ),
            MySpacing.height(30),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                MyButton.text(
                  onPressed: () {
                    controller.onPrev();
                  },
                  elevation: 0,
                  padding: MySpacing.xy(16, 12),
                  splashColor: contentTheme.secondary.withAlpha(40),
                  child: MyText.bodySmall(
                    'Prev',
                    color: contentTheme.secondary,
                  ),
                ),
                MySpacing.width(8),
                MyButton.rounded(
                  onPressed: () {
                    controller.onNext();
                  },
                  elevation: 0,
                  padding: MySpacing.xy(20, 16),
                  backgroundColor: contentTheme.primary,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      controller.loading
                          ? SizedBox(
                              height: 14,
                              width: 14,
                              child: CircularProgressIndicator(
                                color: theme.colorScheme.onPrimary,
                                strokeWidth: 1.2,
                              ),
                            )
                          : Container(),
                      if (controller.loading) MySpacing.width(16),
                      MyText.bodySmall(
                        'Next',
                        color: contentTheme.onPrimary,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    }

    step3() {
      return Column(
        children: [
          Icon(
            LucideIcons.circle_check,
            size: 44,
            color: contentTheme.primary,
          ),
          MySpacing.height(32),
          MyText("Your Registration Process Is Finished"),
          MySpacing.height(32),
          Row(
            children: [
              Checkbox(
                onChanged: controller.onChangedChecked,
                value: controller.checked,
                activeColor: theme.colorScheme.primary,
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                visualDensity: getCompactDensity,
              ),
              MySpacing.width(16),
              RichText(
                text: TextSpan(children: [
                  TextSpan(
                    text: "I Agree With ",
                  ),
                  TextSpan(text: "Terms & Conditions", style: MyTextStyle.bodyMedium(color: contentTheme.success, fontWeight: 600)),
                ], style: MyTextStyle.bodyMedium(fontWeight: 600)),
              )
            ],
          ),
          MySpacing.height(32),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              MyButton.text(
                onPressed: () {
                  controller.onPrev();
                },
                elevation: 0,
                padding: MySpacing.xy(16, 12),
                splashColor: contentTheme.secondary.withAlpha(40),
                child: MyText.bodySmall(
                  'Prev',
                  color: contentTheme.secondary,
                ),
              ),
              MySpacing.width(8),
              MyButton.rounded(
                onPressed: () {
                  controller.onFinish();
                },
                elevation: 0,
                padding: MySpacing.xy(20, 16),
                backgroundColor: contentTheme.primary,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    controller.loading
                        ? SizedBox(
                            height: 14,
                            width: 14,
                            child: CircularProgressIndicator(
                              color: theme.colorScheme.onPrimary,
                              strokeWidth: 1.2,
                            ),
                          )
                        : Container(),
                    if (controller.loading) MySpacing.width(16),
                    MyText.bodySmall(
                      'Finish',
                      color: contentTheme.onPrimary,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      );
    }

    return [step1(), step2(), step3()];
  }

  List<Widget> getTabs() {
    return [
      Expanded(
          child: MyContainer(
        padding: MySpacing.y(12),
        onTap: () => controller.changePage(0),
        color: controller.selectedTab == 0 ? contentTheme.primary.withAlpha(40) : null,
        child: MyText.labelMedium("Account",
            textAlign: TextAlign.center,
            fontWeight: controller.selectedTab == 0 ? 700 : 600,
            color: controller.selectedTab == 0 ? contentTheme.primary : null),
      )),
      MySpacing.width(20),
      Expanded(
          child: MyContainer(
        padding: MySpacing.y(12),
        onTap: () => controller.changePage(1),
        color: controller.selectedTab == 1 ? contentTheme.primary.withAlpha(40) : null,
        child: MyText.labelMedium("Profile",
            textAlign: TextAlign.center,
            fontWeight: controller.selectedTab == 1 ? 700 : 600,
            color: controller.selectedTab == 1 ? contentTheme.primary : null),
      )),
      MySpacing.width(20),
      Expanded(
          child: MyContainer(
        padding: MySpacing.y(12),
        onTap: () => controller.changePage(2),
        color: controller.selectedTab == 2 ? contentTheme.primary.withAlpha(40) : null,
        child: MyText.labelMedium("Complete",
            textAlign: TextAlign.center,
            fontWeight: controller.selectedTab == 2 ? 700 : 600,
            color: controller.selectedTab == 2 ? contentTheme.primary : null),
      )),
    ];
  }
}
