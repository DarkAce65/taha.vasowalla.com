import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

import { IconDefinition, IconPack, dom, library } from '@fortawesome/fontawesome-svg-core';

type IconDefinitionOrPack = IconDefinition | IconPack;
interface Params {
  uikit?: boolean;
  faIcons?: IconDefinitionOrPack[];
}

export default ({ uikit, faIcons }: Params = { uikit: true }): void => {
  if (uikit) {
    UIkit.use(Icons);
  }

  if (faIcons && faIcons.length > 0) {
    library.add(...faIcons);
    dom.i2svg();
  }
};
