import { INetworkNavigatorConfiguration } from "./models";

/**
 * The default node size in px
 */
export const DEFAULT_NODE_SIZE = 10;

/**
 * The default size of edges in px
 */
export const DEFAULT_EDGE_SIZE = 1;

/**
 * The default configuration used with network navigator
 */
export const DEFAULT_CONFIGURATION: INetworkNavigatorConfiguration = {
    animate: true,
    linkDistance: 10,
    linkStrength: 2,
    charge: -120,
    gravity: .1,
    labels: false,
    minZoom: .1,
    maxZoom: 100,
    caseInsensitive: true,
    defaultLabelColor: "blue",
    fontSizePT: 8,
};
