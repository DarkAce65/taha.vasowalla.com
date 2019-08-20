export default element => {
  if (!element) {
    return 0;
  }

  let { transitionDuration, transitionDelay } = window.getComputedStyle(element);

  if (!parseFloat(transitionDuration) && !parseFloat(transitionDelay)) {
    return 0;
  }

  transitionDuration = transitionDuration.split(',')[0];
  transitionDelay = transitionDelay.split(',')[0];

  return (parseFloat(transitionDuration) + parseFloat(transitionDelay)) * 1000;
};
