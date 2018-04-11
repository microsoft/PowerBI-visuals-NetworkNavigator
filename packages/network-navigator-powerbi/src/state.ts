/*
 * Copyright (c) Microsoft
 * All rights reserved.
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {
    HasSettings,
    boolSetting,
    numberSetting,
    colorSetting,
    textSetting as text,
} from "@essex/visual-settings";
import colors from "@essex/visual-styling";
import { constants, INetworkNavigatorConfiguration } from "@essex/network-navigator";

// Webpack defines this
declare var BUILD_VERSION: string;

const CAT_SEARCH = "Search";
const CAT_LAYOUT = "Layout";

/**
 * Represents the state of the network navigator
 */
export default class NetworkNavigatorVisualState extends HasSettings implements INetworkNavigatorConfiguration {

    /**
     * Shows the version of Network Navigator
     */
    @text({
        persist: false,
        category: "General",
        displayName: "Version",
        description: "The version of Network Navigator",
        compose: () => BUILD_VERSION,
    })
    public version?: string;

    /**
     * If searches are case insensitive
     */
    @boolSetting({
        category: CAT_SEARCH,
        displayName: "Case Insensitive",
        description: "Case Insensitive Filtering",
        defaultValue: true,
    })
    public caseInsensitive: boolean = true;

    /**
     * Enable/disable animation of the graph
     */
    @boolSetting({
        category: CAT_LAYOUT,
        displayName: "Animate",
        description: "Should the graph be animated",
        defaultValue: true,
    })
    public animate: boolean = true;

    /**
     * The maximum number of nodes to render at one time
     */
    @numberSetting({
        category: CAT_LAYOUT,
        displayName: "Max nodes",
        description: "The maximum number of nodes to render",
        defaultValue: 0,
    })
    public maxNodeCount: number = 0;

    /**
     * The maximum size to render a vertex
     */
    @numberSetting({
        category: CAT_LAYOUT,
        displayName: "Max node size",
        description: "The maximum size to render a vertex",
        defaultValue: 500,
    })
    public maxNodeSize: number = 500;

    /**
     * The minimum size to render a vertex
     */
    @numberSetting({
        category: CAT_LAYOUT,
        displayName: "Min node size",
        description: "The minimum size to render a vertex",
        defaultValue: 1,
    })
    public minNodeSize: number = 1;

    /**
     * The link distance used in the force graph
     */
    @numberSetting({
        category: CAT_LAYOUT,
        displayName: "Link Distance",
        description: "Link Distance",
        min: constants.linkDistance.min,
        max: constants.linkDistance.max,
        defaultValue: constants.linkDistance.default,
    })
    public linkDistance: number = constants.linkDistance.default;

    /**
     * The link strength used in the force graph
     */
    @numberSetting({
        category: CAT_LAYOUT,
        displayName: "Link Strength",
        description: "Link Strength",
        min: constants.linkStrength.min,
        max: constants.linkStrength.max,
        defaultValue: constants.linkStrength.default,
    })
    public linkStrength: number = constants.linkStrength.default;

    /**
     * The gravity used in the force graph
     */
    @numberSetting({
        category: CAT_LAYOUT,
        displayName: "Gravity",
        description: "Gravity parameter used in force-directed layout",
        min: constants.gravity.min,
        max: constants.gravity.max,
        defaultValue: constants.gravity.default,
    })
    public gravity: number = constants.gravity.default;

    /**
     * The charge in the force graph
     */
    @numberSetting({
        category: CAT_LAYOUT,
        displayName: "Charge",
        description: "Charge parameter used in force-directed layout",
        min: constants.charge.min,
        max: constants.charge.max,
        defaultValue: constants.charge.default,
    })
    public charge: number = constants.charge.default;

    /**
     * Should labels be shown on the graph
     */
    @boolSetting({
        category: CAT_LAYOUT,
        displayName: "Labels",
        description: "If labels on the nodes should be shown",
        defaultValue: false,
    })
    public labels: boolean = false;

    /**
     * The minimum amount that a user can zoom into the graph
     */
    @numberSetting({
        category: CAT_LAYOUT,
        displayName: "Min Zoom",
        description: "Minimum zoom scale",
        min: constants.minZoom.min,
        max: constants.minZoom.max,
        defaultValue: constants.minZoom.default,
    })
    public minZoom: number = constants.minZoom.default;

    /**
     * The maximum amount that a user can zoom into the graph
     */
    @numberSetting({
        category: CAT_LAYOUT,
        displayName: "Max Zoom",
        description: "Maximum zoom scale",
        min: constants.maxZoom.min,
        max: constants.maxZoom.max,
        defaultValue: constants.maxZoom.default,
    })
    public maxZoom: number = constants.maxZoom.default;

    /**
     * The default color used for labels
     */
    @colorSetting({
        category: CAT_LAYOUT,
        displayName: "Default Label Color",
        description: "The default color to use for labels",
        defaultValue: colors[0],
    })
    public defaultLabelColor: string = colors[0];

    /**
     * The size of the font to use for the labels, in pt
     */
    @numberSetting({
        category: CAT_LAYOUT,
        displayName: "Font Size",
        description: "The font size (pts) to use for labels",
        name: "textSize",
        min: constants.fontSizePT.min,
        max: constants.fontSizePT.max,
        defaultValue: constants.fontSizePT.defaultValue,
    })
    public fontSizePT: number = constants.fontSizePT.defaultValue;

    /**
     * The minimum value for edge weights
     */
    @numberSetting({
        category: CAT_LAYOUT,
        displayName: "Min Edge Weight",
        description: "The minimum value of the edge weight data",
        defaultValue: undefined,
    })
    public minEdgeWeight: number = undefined;

    /**
     * The minimum value for edge weights
     */
    @numberSetting({
        category: CAT_LAYOUT,
        displayName: "Max Edge Weight",
        description: "The maximum value of the edge weight data",
        defaultValue: undefined,
    })
    public maxEdgeWeight: number = undefined;

    /**
     * The minimum value for edge color-weights
     */
    @numberSetting({
        category: CAT_LAYOUT,
        displayName: "Min Edge Color Weight",
        description: "The minimum value of the edge color weight data",
        defaultValue: undefined,
    })
    public minEdgeColorWeight: number = undefined;

    /**
     * The minimum value for edge weights
     */
    @numberSetting({
        category: CAT_LAYOUT,
        displayName: "Max Edge Color Weight",
        description: "The maximum value of the edge color weight data",
        defaultValue: undefined,
    })
    public maxEdgeColorWeight: number = undefined;

    /**
     * The minimum edge width
     */
    @numberSetting({
        category: CAT_LAYOUT,
        displayName: "Min Edge Width",
        description: "The minimum edge width to render",
        min: constants.edgeMinWidth.min,
        max: constants.edgeMinWidth.max,
        defaultValue: constants.edgeMinWidth.defaultValue,
    })
    public edgeMinWidth: number = constants.edgeMinWidth.defaultValue;

    /**
     * The maximum edge width
     */
    @numberSetting({
        category: CAT_LAYOUT,
        displayName: "Max Edge width",
        description: "The maximum edge width to render",
        min: constants.edgeMaxWidth.min,
        max: constants.edgeMaxWidth.max,
        defaultValue: constants.edgeMaxWidth.defaultValue,
    })
    public edgeMaxWidth: number = constants.edgeMaxWidth.defaultValue;

    /**
     * The starting color for gradient interpolation
     */
    @colorSetting({
        category: CAT_LAYOUT,
        displayName: "Edge Start Color",
        description: "Edge Start Color",
        defaultValue: constants.edgeStartColor.defaultValue,
    })
    public edgeStartColor: string = constants.edgeStartColor.defaultValue;

    /**
     * The ending color for gradient interpolation
     */
    @colorSetting({
        category: CAT_LAYOUT,
        displayName: "Edge End Color",
        description: "Edge End Color",
        defaultValue: constants.edgeEndColor.defaultValue,
    })
    public edgeEndColor: string = constants.edgeEndColor.defaultValue;

    /**
     * The current selected node index
     */
    public selectedNodeIndex: number;

    /**
     * The current zoom scale
     */
    public scale: number = 1;

    /**
     * The current pan translation
     */
    public translate: [number, number] = [0, 0];

    /**
     * The node text filter being applied
     */
    public textFilter: string = "";
}
