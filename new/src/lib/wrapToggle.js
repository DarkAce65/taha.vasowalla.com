export default uikitToggle => ({
  _uikitToggle: uikitToggle,
  toggled: uikitToggle.isToggled(),
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
});
