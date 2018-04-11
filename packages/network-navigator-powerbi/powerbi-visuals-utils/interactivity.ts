import './type';
import './svg';
import 'powerbi-visuals-utils-interactivityutils/lib/index.d';

// This is necessary for the interactivity tools to load correctly
import 'script-loader!powerbi-models';

import 'script-loader!powerbi-visuals-utils-interactivityutils';
const { interactivity, filter } = powerbi.extensibility.utils; 
export {
    interactivity,
    filter,
};
