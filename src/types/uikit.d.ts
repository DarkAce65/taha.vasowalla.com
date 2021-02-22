import 'uikit';

declare module 'uikit' {
  namespace UIkit {
    interface UIkitToggleElement {
      isToggled(): boolean;
    }
  }
}
