// BaseViewConfig polyfill for React Native Web
const BaseViewConfig = {
  uiViewClassName: 'RCTView',
  bubblingEventTypes: {},
  directEventTypes: {},
  validAttributes: {
    style: true,
    accessible: true,
    accessibilityLabel: true,
    accessibilityHint: true,
    accessibilityRole: true,
    accessibilityState: true,
    accessibilityValue: true,
    testID: true,
    nativeID: true,
    onLayout: true,
    onAccessibilityAction: true,
    onAccessibilityTap: true,
    onMagicTap: true,
    onAccessibilityEscape: true,
    importantForAccessibility: true,
    accessibilityLiveRegion: true,
    accessibilityElementsHidden: true,
    accessibilityViewIsModal: true,
    onAccessibilityFocus: true,
    onAccessibilityBlur: true,
    accessibilityIgnoresInvertColors: true,
  },
};

export default BaseViewConfig;