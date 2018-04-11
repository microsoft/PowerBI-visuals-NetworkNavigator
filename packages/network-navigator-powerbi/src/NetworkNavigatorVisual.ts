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

import "powerbi-visuals-tools/templates/visuals/.api/v1.7.0/PowerBI-visuals";

import { default as NetworkNavigatorImpl, INetworkNavigatorData, INetworkNavigatorNode } from "@essex/network-navigator";
import { INetworkNavigatorSelectableNode } from "./models";
import { UpdateType, receiveDimensions, IDimensions, calcUpdateType } from "@essex/visual-utils";
import { filter, dataview } from "../powerbi-visuals-utils";
import converter from "./dataConversion";
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import SelectionId = powerbi.visuals.ISelectionId;
import NetworkNavigatorState from "./state";
import * as $ from "jquery";
import * as _ from "lodash";

/* tslint:disable */
const MY_CSS_MODULE = require("./css/NetworkNavigatorVisual.scss");

// PBI Swallows these
const EVENTS_TO_IGNORE = "mousedown mouseup click focus blur input pointerdown pointerup touchstart touchmove touchdown";

import { DATA_ROLES } from "./constants";

/* tslint:enable */

/**
 * A visual which supports the displaying of graph based datasets in power bi
 */
@receiveDimensions
export default class NetworkNavigator implements powerbi.extensibility.visual.IVisual {

    /**
     * My network navigator instance
     */
    public myNetworkNavigator: NetworkNavigatorImpl;

    /**
     * Whether or not css needs loaded
     */
    protected noCss: boolean;

    /**
     * The visual's host
     */
    private host: IVisualHost;

    /**
     * This visuals element
     */
    private element: JQuery;

    /**
     * The selection changed listener for NetworkNavigator
     */
    private selectionChangedListener: { destroy: Function; };

    /**
     * The selection manager, used to sync selection with PowerBI
     */
    private selectionManager: powerbi.extensibility.ISelectionManager;

    /**
     * The internal state of the network navigator
     */
    private _internalState: NetworkNavigatorState;

    /**
     * The list of nodes loaded into the network navigator
     */
    private _nodes: INetworkNavigatorNode[];

    /**
     * The currently loaded dataView
     */
    private _dataView: powerbi.DataView;

    /**
     * The previous update options
     */
    private prevUpdateOptions: powerbi.extensibility.visual.VisualUpdateOptions;

    /**
     * A debounced event listener for when a node is selected through NetworkNavigator
     */
    private onNodeSelected = _.debounce((node: INetworkNavigatorSelectableNode) => {
        this.persistNodeSelection(node as INetworkNavigatorSelectableNode);
    }, 100);

    /*
     * Constructor for the network navigator
     */
    constructor(options: VisualConstructorOptions, noCss = false) {
        this.noCss = noCss;
        this.host = options.host;
        this.element = $(`<div style="height: 100%;"></div>`);
        this.selectionManager = options.host.createSelectionManager();

        // Add to the container
        options.element.appendChild(this.element[0]);

        this.selectionManager = this.host.createSelectionManager();

        // Some of the css is in a css module (:local() {....}), this adds the auto generated class to our element
        const className = MY_CSS_MODULE && MY_CSS_MODULE.locals && MY_CSS_MODULE.locals.className;
        if (className) {
            $(options.element).append($("<st" + "yle>" + MY_CSS_MODULE + "</st" + "yle>"));
            this.element.addClass(className);
        }

        this._internalState = NetworkNavigatorState.create<NetworkNavigatorState>();

        this.myNetworkNavigator = new NetworkNavigatorImpl(this.element, 500, 500);
        this.attachEvents();
    }

    /**
     * Update is called for data updates, resizes & formatting changes
     * @param options The update options from PBI
     * @param vm The view model
     * @param type The update type that occurred
     */
    public update(options: VisualUpdateOptions, vm?: any, type?: UpdateType) {
        const updateType = type !== undefined ? type : calcUpdateType(this.prevUpdateOptions, options);
        this.prevUpdateOptions = options;
        const dataView = options.dataViews && options.dataViews.length && options.dataViews[0];
        this._dataView = dataView;
        const dataViewTable = dataView && dataView.table;
        let forceReloadData = false;

        // Some settings have been updated
        if ((updateType & UpdateType.Settings) === UpdateType.Settings) {
            forceReloadData = this.loadSettingsFromPowerBI(dataView);
        }

        // The dataset has been modified, or something has happened that requires us to force reload the data
        if (((updateType & UpdateType.Data) === UpdateType.Data) || forceReloadData) {
            if (dataViewTable) {
                const filterColumn = dataView.metadata.columns.filter(n => n.roles[DATA_ROLES.filterField.name])[0];
                const newData = converter(dataView, this._internalState, filterColumn, () => this.host.createSelectionIdBuilder());
                this.myNetworkNavigator.setData(newData);
            } else {
                this.myNetworkNavigator.setData({
                    links: [],
                    nodes: [],
                });
            }
        }

        // Load the settings after we have loaded the nodes, cause otherwise
        this.loadSelectionFromPowerBI();

        this.myNetworkNavigator.redrawLabels();
    }

    /**
     * Sets the dimensions of this visual
     * @param dim The new dimensions
     */
    public setDimensions(dim: IDimensions) {
        if (this.myNetworkNavigator) {
            this.myNetworkNavigator.dimensions = { width: dim.width, height: dim.height };
        }
        if (this.element) {
            this.element.css({ width: dim.width, height: dim.height });
        }
    }

    /**
     * Destroys the visual
     */
    public destroy() {
        this.element.empty();
    }

    /**
     * Enumerates the instances for the objects (settings) that appear in the power bi panel
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): powerbi.VisualObjectInstanceEnumeration {
        return this._internalState.buildEnumerationObjects(options.objectName, this._dataView, false);
    }

    /**
     * Persists the given node as the seelcted node
     */
    protected persistNodeSelection(node: INetworkNavigatorSelectableNode) {
        this.host.applyJsonFilter(node ? node.filter : null, "general", "filter");
    }

    /**
     * Loads the selection state from powerbi
     */
    private loadSelectionFromPowerBI() {
        const data = this.myNetworkNavigator.getData() as INetworkNavigatorData<INetworkNavigatorNode>;
        const nodes = data && data.nodes;

        // For each of the nodes, check to see if their ids are in the selection manager, and
        // mark them as selected
        if (nodes && nodes.length) {
            this._nodes = nodes;
            const filterValues = getFilterValues(this._dataView, "general.filter");
            const valueMap = (filterValues || []).reduce((acc, cur) => { acc[cur] = 1; return acc; }, {});
            let selectedNode: INetworkNavigatorSelectableNode;

            nodes.forEach((n: INetworkNavigatorSelectableNode) => {
                const isSelected = !!valueMap[pretty(n.name)];
                n.selected = isSelected;

                // Just select the last one for now
                if (isSelected) {
                    selectedNode = n;
                }
            });

            this.myNetworkNavigator.selectedNode = selectedNode;
        }
    }

    /**
     * Sets the selected ids on the selection manager
     * @param ids The ids to select
     * @param forceManual If true, selection will be performed through selectionManager.select method
     */
    private setSelectionOnSelectionManager(ids: powerbi.visuals.ISelectionId[], forceManual = false) {
        const selectIds = () => {
            if (ids.length > 0 && this.selectionManager.select) {
                this.selectionManager.select(ids);
            } else if (this.selectionManager.clear) {
                this.selectionManager.clear();
            }
        };

        // This avoids an extra host.onSelect call, which causes visuals to repaint
        if (!forceManual && this.selectionManager["setSelectionIds"]) {
            this.selectionManager["setSelectionIds"](ids);
        } else if (!forceManual && this.selectionManager["selectedIds"]) {
            this.selectionManager["selectedIds"] = ids;
        } else {
            selectIds();
        }
    }

    /**
     * Handles updating of the settings
     * @param dataView The dataView to load the settings from
     * @returns True if there was some settings changed that requires a data reload
     */
    private loadSettingsFromPowerBI(dataView: powerbi.DataView): boolean {
        const oldState = this._internalState;
        this._internalState = this._internalState.receiveFromPBI(dataView);
        this.myNetworkNavigator.configuration = this._internalState;
        return oldState.maxNodeCount !== this._internalState.maxNodeCount ||
            oldState.labels !== this._internalState.labels;
    }

    /**
     * Attaches the event listeners to the network navigator
     */
    private attachEvents() {
        if (this.myNetworkNavigator) {
            // Cleans up events
            if (this.selectionChangedListener) {
                this.selectionChangedListener.destroy();
            }
            const dispatcher = this.myNetworkNavigator.events;
            this.selectionChangedListener = dispatcher.on("selectionChanged", (node: INetworkNavigatorSelectableNode) => this.onNodeSelected(node));
            dispatcher.on("zoomed", ({ scale, translate }: { scale: number, translate: [number, number] }) => {
                this._internalState = this._internalState.receive({scale, translate});
            });

            dispatcher.on("textFilter", (textFilter: string) => {
                this._internalState = this._internalState.receive({ textFilter });
                const label = textFilter && textFilter !== "" ? `Filtered ${textFilter}` : `Cleared text filter`;
            });

            // PowerBI will eat some events, so use this to prevent powerbi from eating them
            this.element.find(".filter-box input").on(EVENTS_TO_IGNORE, (e) => e.stopPropagation());
        }
    }
}

/**
 * Gets the text values that form the current selection filter
 * @param dv The dataView
 * @param filterPath The path to the filter within the metadata objets
 */
function getFilterValues(dv: powerbi.DataView, filterPath: string): string[] {
    const savedFilter: any = _.get(
        dv,
        `metadata.objects.${filterPath}`,
    );
    if (savedFilter) {
        const appliedFilter = filter.FilterManager.restoreFilter(savedFilter);
        if (appliedFilter) {
            // The way we do this is a little funky
            // Cause it doesn't always produce what the interface says it should
            // sometimes it has 'values' property, other times it has conditions
            const conditions = _.get(appliedFilter, "conditions", _.get(appliedFilter, "values", []));
            return conditions.map((n: any) => {
                // This is also a little funky cause sometimes the actual value is nested under a 'value'
                // property, other times it is just the value
                let text = pretty(n);

                // Is an array
                if (n && n.splice) {
                    text = pretty(n[0].value);

                // If we have a non empty value property
                } else if (n && (n.value !== undefined && n.value !== null)) {
                    text = pretty(n.value);
                }
                return text;
            });
        }
    }
    return [];
}

/**
 * Pretty prints a string value
 * @param val The value to pretty print
 */
function pretty(val: string) {
    if (val === null || val === undefined) {
        return "";
    }
    return val + "";
}
