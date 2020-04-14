import UIkit from 'uikit';

export default (target, options) => {
  const _uikitToggle = UIkit.toggle(target, options);

  return {
    _uikitToggle,
    toggled: _uikitToggle.isToggled(),
    toggle() {
      this._uikitToggle.toggle();
      this.toggled = !this.toggled;
    },
    show() {
      if (!this.toggled) {
        this.toggle();
      }
    },
    hide() {
      if (this.toggled) {
        this.toggle();
      }
    },
  };
};
