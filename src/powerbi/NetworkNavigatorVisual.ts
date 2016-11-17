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
import { INetworkNavigatorSelectableNode } from "./models";
import { Visual, UpdateType, capabilities, receiveDimensions, IDimensions } from "essex.powerbi.base";
import converter from "./dataConversion";
import IVisualHostServices = powerbi.IVisualHostServices;
import VisualInitOptions = powerbi.VisualInitOptions;
import VisualUpdateOptions = powerbi.VisualUpdateOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import SelectionId = powerbi.visuals.SelectionId;
import utility = powerbi.visuals.utility;
import { StatefulVisual, publishChange } from "pbi-stateful";
import NetworkNavigatorState from "./state";

/* tslint:disable */
const MY_CSS_MODULE = require("!css!sass!./css/NetworkNavigatorVisual.scss");

// PBI Swallows these
const EVENTS_TO_IGNORE = "mousedown mouseup click focus blur input pointerdown pointerup touchstart touchmove touchdown";

import { DATA_ROLES } from "./constants";
import capabilitiesData from "./capabilities";

/* tslint:enable */
declare var _: any;

@Visual(require("../build").output.PowerBI)
@receiveDimensions
@capabilities(capabilitiesData)
export default class NetworkNavigator extends StatefulVisual<NetworkNavigatorState> {

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
     * The internal state of the network navigator
     */
    private _internalState: NetworkNavigatorState;

    private _nodes: INetworkNavigatorNode[];

    private _dataView: powerbi.DataView;

    /**
     * A debounced event listener for when a node is selected through NetworkNavigator
     */
    private onNodeSelected = _.debounce((node: INetworkNavigatorSelectableNode) => {
        const isInternalStateNodeUnset = this._internalState.selectedNodeIndex === undefined;
        const areBothUndefined = !node && isInternalStateNodeUnset;
        const areIndexesEqual = node && this._internalState.selectedNodeIndex === node.index;

        if (areBothUndefined || areIndexesEqual) {
            return;
        }

        this._internalState = this._internalState.receive({ selectedNodeIndex: node ? node.index : undefined });
        this.persistNodeSelection(node as INetworkNavigatorSelectableNode);
        const label = node ? `Select ${node.name}` : "Clear selection";
        publishChange(this, label, this._internalState.toJSONObject());
    }, 100);

    protected persistNodeSelection(node: INetworkNavigatorSelectableNode) {
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
    }

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

        this._internalState = NetworkNavigatorState.create() as NetworkNavigatorState;
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
    public onInit(options: VisualInitOptions): void {
        this.myNetworkNavigator = new NetworkNavigatorImpl(this.element.find("#node_graph"), 500, 500);
        this.host = options.host;
        this.attachEvents();
        this.selectionManager = new utility.SelectionManager({ hostServices: this.host });
    }

    public generateState() {
        return this._internalState.toJSONObject();
    }

    public onSetState(state: NetworkNavigatorState) {
        this._internalState = this._internalState.receive(state);

        // Set the Selected Node
        if (this._internalState.selectedNodeIndex) {
            const nodeIndex = this._internalState.selectedNodeIndex;
            const node = this._nodes && this._nodes.length >= nodeIndex ? this._nodes[nodeIndex] : undefined;
            this.persistNodeSelection(node as INetworkNavigatorSelectableNode);
            this.myNetworkNavigator.selectedNode = node;
        } else {
            this.persistNodeSelection(undefined);
            this.myNetworkNavigator.selectedNode = undefined;
        }

        // Set Text Filter
        this.myNetworkNavigator.textFilter = this._internalState.textFilter;

        // Set pan & zoom
        const doesStateHaveScaleAndTranslate = this._internalState.scale &&
            this._internalState.translate &&
            this._internalState.translate.length === 2;

        let doesScaleAndTranslateDiffer = false;
        if (doesStateHaveScaleAndTranslate) {
            doesScaleAndTranslateDiffer = this._internalState.scale !== this.myNetworkNavigator.scale ||
                !_.isEqual(this._internalState.translate, this.myNetworkNavigator.translate);
        }

        if (doesStateHaveScaleAndTranslate && doesScaleAndTranslateDiffer) {
            this.myNetworkNavigator.scale = this._internalState.scale;
            this.myNetworkNavigator.translate = this._internalState.translate;
            this.myNetworkNavigator.redraw();
        }

        // Set configuration
        this.myNetworkNavigator.configuration = this._internalState;
    }

    /** 
     * Update is called for data updates, resizes & formatting changes 
     */
    public onUpdate(options: VisualUpdateOptions, type: UpdateType) {
        let dataView = options.dataViews && options.dataViews.length && options.dataViews[0];
        this._dataView = dataView;
        let dataViewTable = dataView && dataView.table;
        let forceReloadData = false;

        // Some settings have been updated
        if (type & UpdateType.Settings) {
            forceReloadData = this.loadSettingsFromPowerBI(dataView);
        }

        // The dataset has been modified, or something has happened that requires us to force reload the data
        if (type & UpdateType.Data || forceReloadData) {
            if (dataViewTable) {
                const newData = converter(dataView, this._internalState);
                this.myNetworkNavigator.setData(newData);
            } else {
                this.myNetworkNavigator.setData({
                    links: [],
                    nodes: [],
                });
            }
            this.loadSelectionFromPowerBI();
        }
        this.myNetworkNavigator.redrawLabels();
    }


    public setDimensions(dim: IDimensions) {
        if (this.myNetworkNavigator) {
            this.myNetworkNavigator.dimensions = { width: dim.width, height: dim.height };
        }
        if (this.element) {
            this.element.css({ width: dim.width, height: dim.height });
        }
    }

    /**
     * Enumerates the instances for the objects (settings) that appear in the power bi panel
     */
    protected handleEnumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): powerbi.VisualObjectInstanceEnumeration {
        return this._internalState.buildEnumerationObjects(options.objectName, this._dataView, false);
    }

    public destroy() {
        super.destroy();
        this.container.empty();
    }

    /**
     * Gets the inline css used for this element
     */
    protected getCss(): string[] {
        return (super.getCss() || []).concat([MY_CSS_MODULE]);
    }

    protected getCustomCssModules() {
        return [MY_CSS_MODULE];
    }

    /**
     * Loads the selection state from powerbi
     */
    private loadSelectionFromPowerBI() {
        const data = this.myNetworkNavigator.getData();
        const nodes = data && data.nodes;
        const selectedIds = this._internalState.selectedNodeIndex; this.selectionManager.getSelectionIds();

        // For each of the nodes, check to see if their ids are in the selection manager, and
        // mark them as selected
        if (nodes && nodes.length) {
            this._nodes = nodes;
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
        const oldState = this._internalState;
        this._internalState = this._internalState.receiveFromPBI(dataView);
        this.myNetworkNavigator.configuration = this._internalState;
        return oldState.maxNodeCount !== this._internalState.maxNodeCount;
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
            const dispatcher = this.myNetworkNavigator.events;
            this.selectionChangedListener = dispatcher.on("selectionChanged", (node: INetworkNavigatorNode) => this.onNodeSelected(node));
            dispatcher.on("zoomed", ({ scale, translate }: { scale: number, translate: [number, number] }) => {
                this._internalState = this._internalState.receive({scale, translate});
            });

            dispatcher.on("textFilter", (textFilter: string) => {
                this._internalState = this._internalState.receive({ textFilter });
                const label = textFilter && textFilter !== "" ? `Filtered ${textFilter}` : `Cleared text filter`;
                publishChange(this, label, this._internalState.toJSONObject());
            });

            // PowerBI will eat some events, so use this to prevent powerbi from eating them
            this.element.find(".filter-box input").on(EVENTS_TO_IGNORE, (e) => e.stopPropagation());
        }
    }
}
