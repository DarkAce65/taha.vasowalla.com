import gsap from 'gsap';

interface DashOffsetAnimationParams {
  progress: number;
  onUpdate?: () => void;
}

export default ({ progress = 0, onUpdate }: DashOffsetAnimationParams): gsap.AnimationVars => ({
  strokeDashoffset(_: number, element: SVGPathElement): number {
    return (1 - progress) * (element.getTotalLength() + 1);
  },
  onUpdate() {
    if (this.ratio === 0 || this.ratio === 1) {
      gsap.set(this._targets, {
        strokeDasharray: (_: number, element: SVGPathElement): string => {
          const offset = gsap.getProperty(element, 'strokeDashoffset') as number;
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
        strokeDasharray: (_: number, element: SVGPathElement): string => {
          const pathLength = element.getTotalLength();
          return `${pathLength} ${pathLength + 5}`;
        },
      });
    }

    onUpdate?.call(this);
  },
});
