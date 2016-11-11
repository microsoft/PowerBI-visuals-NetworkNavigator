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

import { NetworkNavigator as NetworkNavigatorImpl } from "../NetworkNavigator";
import { INetworkNavigatorNode } from "../models";
import * as CONSTANTS from "../constants";
import { INetworkNavigatorSelectableNode, INetworkNavigatorVisualSettings } from "./models";
import { VisualBase, Visual, updateTypeGetter, UpdateType } from "essex.powerbi.base";
import converter from "./dataConversion";
import IVisual = powerbi.IVisual;
import IVisualHostServices = powerbi.IVisualHostServices;
import VisualCapabilities = powerbi.VisualCapabilities;
import VisualInitOptions = powerbi.VisualInitOptions;
import VisualUpdateOptions = powerbi.VisualUpdateOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import SelectionId = powerbi.visuals.SelectionId;
import utility = powerbi.visuals.utility;

/* tslint:disable */
const MY_CSS_MODULE = require("!css!sass!./css/NetworkNavigatorVisual.scss");

// PBI Swallows these
const EVENTS_TO_IGNORE = "mousedown mouseup click focus blur input pointerdown pointerup touchstart touchmove touchdown";

import { DATA_ROLES } from "./constants";
import { DEFAULT_SETTINGS } from "./defaults";
import capabilities from "./capabilities";

/* tslint:enable */
declare var _: any;

@Visual(require("../build").output.PowerBI)
export default class NetworkNavigator extends VisualBase implements IVisual {

    /**
     * The capabilities of the Visual
     */
    public static capabilities: VisualCapabilities = capabilities;

    /**
     * My network navigator instance
     */
    public myNetworkNavigator: NetworkNavigatorImpl;

    /**
     * The visual's host
     */
    private host: IVisualHostServices;

    /**
     * The selection changed listener for NetworkNavigator
     */
    private selectionChangedListener: { destroy: Function; };

    /**
     * The selection manager, used to sync selection with PowerBI
     */
    private selectionManager: utility.SelectionManager;

    /**
     * The current set of settings synchronized with powerbi
     */
    private settings: INetworkNavigatorVisualSettings = $.extend(true, {}, DEFAULT_SETTINGS);

    /**
     * Getter for the update type
     */
    private updateType = updateTypeGetter(this);

    /**
     * A debounced event listener for when a node is selected through NetworkNavigator
     */
    private onNodeSelected = _.debounce((node: INetworkNavigatorSelectableNode) => {
        /* tslint:disable */
        let filter: any = null;
        /* tslint:enable */
        if (node) {
            filter = powerbi.data.SemanticFilter.fromSQExpr(node.filterExpr);
            this.selectionManager.select(node.identity, false);
        } else {
            this.selectionManager.clear();
        }

        let objects: powerbi.VisualObjectInstancesToPersist = { };
        if (filter) {
            $.extend(objects, {
                merge: [
                    <VisualObjectInstance>{
                        objectName: "general",
                        selector: undefined,
                        properties: {
                            "filter": filter
                        },
                    },
                ],
            });
        } else {
            $.extend(objects, {
                remove: [
                    <VisualObjectInstance>{
                        objectName: "general",
                        selector: undefined,
                        properties: {
                            "filter": filter
                        },
                    },
                ],
            });
        }

        this.host.persistProperties(objects);
    }, 100);

    /*
     * Constructor for the network navigator
     */
    constructor(noCss = false) {
        super("NetworkNavigator", noCss);

        // Some of the css is in a css module (:local() {....}), this adds the auto generated class to our element
        const className = MY_CSS_MODULE && MY_CSS_MODULE.locals && MY_CSS_MODULE.locals.className;
        if (className) {
            this.element.addClass(className);
        }
    }

    /**
     * Gets the template for this visual
     */
    public get template() {
        return `<div id="node_graph" style= "height: 100%;"> </div>`;
    }

    /** 
     * This is called once when the visual is initialially created 
     */
    public init(options: VisualInitOptions): void {
        super.init(options);

        this.myNetworkNavigator = new NetworkNavigatorImpl(this.element.find("#node_graph"), 500, 500);
        this.host = options.host;
        this.attachEvents();
        this.selectionManager = new utility.SelectionManager({ hostServices: this.host });
    }

    /** 
     * Update is called for data updates, resizes & formatting changes 
     */
    public update(options: VisualUpdateOptions) {
        super.update(options);

        let dataView = options.dataViews && options.dataViews.length && options.dataViews[0];
        let dataViewTable = dataView && dataView.table;
        let forceReloadData = false;

        // Some settings have been updated
        const type = this.updateType();
        if (type & UpdateType.Settings) {
            forceReloadData = this.loadSettingsFromPowerBI(dataView);
        }

        // The visual has been resized
        if (type & UpdateType.Resize) {
            this.myNetworkNavigator.dimensions = { width: options.viewport.width, height: options.viewport.height };
            this.element.css({ width: options.viewport.width, height: options.viewport.height });
        }

        // The dataset has been modified, or something has happened that requires us to force reload the data
        if (type & UpdateType.Data || forceReloadData) {
            if (dataViewTable) {
                const newData = converter(dataView, this.settings);
                this.myNetworkNavigator.setData(newData);
            } else {
                this.myNetworkNavigator.setData({
                    links: [],
                    nodes: [],
                });
            }
        }

        this.loadSelectionFromPowerBI();

        this.myNetworkNavigator.redrawLabels();
    }

    /**
     * Enumerates the instances for the objects (settings) that appear in the power bi panel
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
        let instances = super.enumerateObjectInstances(options) || [{
            /* tslint:disable */
            selector: null,
            /* tslint:enable */
            objectName: options.objectName,
            properties: {},
        }, ];

        // Layout needs to be handled specially, cause we need to clamp the values to our min/maxes
        if (options.objectName === "layout") {
            const { layout } = this.settings;
            // autoClamp
            Object.keys(layout).forEach((name: string) => {
                if (CONSTANTS[name]) {
                    const { min, max } = CONSTANTS[name];
                    const value = layout[name];
                    layout[name] = Math.min(max, Math.max(min, value));
                }
            });
        }

        // Since the structure for our settings reflects those in the capabilities, then just copy them into
        // the final object
        $.extend(true, instances[0].properties, this.settings[options.objectName]);

        if (options.objectName === "general") {
            instances[0].properties["textSize"] = this.myNetworkNavigator.configuration.fontSizePT;
        }
        return instances as VisualObjectInstance[];
    }

    /**
     * Gets the inline css used for this element
     */
    protected getCss(): string[] {
        return (super.getCss() || []).concat([MY_CSS_MODULE]);
    }

    /**
     * Loads the selection state from powerbi
     */
    private loadSelectionFromPowerBI() {
        const data = this.myNetworkNavigator.getData();
        const nodes = data && data.nodes;
        const selectedIds = this.selectionManager.getSelectionIds();

        // For each of the nodes, check to see if their ids are in the selection manager, and
        // mark them as selected
        if (nodes && nodes.length) {
            let updated = false;
            nodes.forEach((n) => {
                let isSelected =
                    !!_.find(selectedIds, (id: SelectionId) => id.equals((<INetworkNavigatorSelectableNode>n).identity));
                if (isSelected !== n.selected) {
                    n.selected = isSelected;
                    updated = true;
                }
            });

            if (updated) {
                this.myNetworkNavigator.redrawSelection();
            }
        }
    }

    /**
     * Handles updating of the settings
     * @returns True if there was some settings changed that requires a data reload
     */
    private loadSettingsFromPowerBI(dataView: powerbi.DataView): boolean {
        // There are some changes to the options
        if (dataView && dataView.metadata) {
            const oldSettings = $.extend(true, {}, this.settings);
            const newObjects = dataView.metadata.objects;
            const layoutObjs = newObjects && newObjects["layout"];
            const generalObjs = newObjects && newObjects["general"];

            // Merge in the new settings from PowerBI
            $.extend(true, this.settings, DEFAULT_SETTINGS, newObjects ? newObjects : {}, {
                layout: {
                    fontSizePT: generalObjs && generalObjs["textSize"],
                    defaultLabelColor: layoutObjs && layoutObjs["defaultLabelColor"] && layoutObjs["defaultLabelColor"].solid.color,
                },
            });

            // Remove the general section, added by the above statement
            delete this.settings["general"];

            // There were some changes to the layout
            if (!_.isEqual(oldSettings, this.settings)) {
                this.myNetworkNavigator.configuration = $.extend(true, {}, this.settings.search, this.settings.layout);
            }

            // If maxNodeCount has changed than we need to reload the data.
            if (oldSettings.layout.maxNodeCount !== this.settings.layout.maxNodeCount) {
                return true;
            }
        }
        return false;
    }

    /**
     * Attaches the line up events to lineup
     */
    private attachEvents() {
        if (this.myNetworkNavigator) {
            // Cleans up events
            if (this.selectionChangedListener) {
                this.selectionChangedListener.destroy();
            }
            this.selectionChangedListener =
                this.myNetworkNavigator.events.on("selectionChanged", (node: INetworkNavigatorNode) => this.onNodeSelected(node));

            // PowerBI will eat some events, so use this to prevent powerbi from eating them
            this.element.find(".filter-box input").on(EVENTS_TO_IGNORE, (e) => e.stopPropagation());
        }
    }
}
