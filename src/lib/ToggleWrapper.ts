import UIkit from 'uikit';

class ToggleWrapper {
  private readonly uikitToggle: UIkit.UIkitToggleElement;
  private toggled: boolean;

  constructor(...toggleParams: Parameters<typeof UIkit.toggle>) {
    this.uikitToggle = UIkit.toggle(...toggleParams);

    this.toggled = this.uikitToggle.isToggled();
  }

  toggle(): void {
    this.uikitToggle.toggle();
    this.toggled = !this.toggled;
  }

  show(): void {
    if (!this.toggled) {
      this.toggle();
    }
  }

  hide(): void {
    if (this.toggled) {
      this.toggle();
    }
  }
}

export default ToggleWrapper;
