import { dom, library } from '@fortawesome/fontawesome-svg-core';

export default (...icons) => {
  library.add(...icons);
  dom.i2svg();
};
