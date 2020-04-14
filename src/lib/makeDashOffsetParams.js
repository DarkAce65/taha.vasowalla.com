import gsap from 'gsap';

export default ({ progress = 0, onUpdate }) => ({
  strokeDashoffset: (_, element) => (1 - progress) * (element.getTotalLength() + 1),
  onUpdate() {
    if (this.ratio === 0 || this.ratio === 1) {
      gsap.set(this._targets, {
        strokeDasharray: (_, element) => {
          const offset = gsap.getProperty(element, 'strokeDashoffset');
          const pathLength = element.getTotalLength();
          return offset < 0.001
            ? 'none'
            : pathLength - offset <= 0
            ? '0px 99999px'
            : `${pathLength} ${pathLength + 5}`;
        },
      });
    } else {
      gsap.set(this._targets, {
        strokeDasharray: (_, element) => {
          const pathLength = element.getTotalLength();
          return `${pathLength} ${pathLength + 5}`;
        },
      });
    }

    onUpdate && onUpdate.call(this);
  },
});
