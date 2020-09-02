import UIkit from 'uikit';

import { UIkitElement } from '~/types/uikit';

class ToggleWrapper {
  private readonly uikitToggle: UIkit.UIkitToggleElement;
  private toggled: boolean;

  constructor(target: UIkitElement, options?: UIkit.UIkitToggleOptions) {
    this.uikitToggle = UIkit.toggle(target, options);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.toggled = (this.uikitToggle as any).isToggled();
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
