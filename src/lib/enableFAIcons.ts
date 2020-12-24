import { IconDefinition, IconPack, dom, library } from '@fortawesome/fontawesome-svg-core';

type IconDefinitionOrPack = IconDefinition | IconPack;

export default (...icons: IconDefinitionOrPack[]): void => {
  library.add(...icons);
  dom.i2svg();
};
