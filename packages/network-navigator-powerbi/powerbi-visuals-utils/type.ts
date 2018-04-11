// Wen't this route vs doing exports-loader in webpack config, to preserve typings
import "powerbi-visuals-utils-typeutils/lib/index.d";
import "script-loader!powerbi-visuals-utils-typeutils";
export = powerbi.extensibility.utils.type;