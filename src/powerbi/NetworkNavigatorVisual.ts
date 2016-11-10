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
import { INetworkNavigatorData, INetworkNavigatorLink, INetworkNavigatorNode } from "../models";
import * as CONSTANTS from "../constants";
import { INetworkNavigatorSelectableNode, INetworkNavigatorVisualSettings } from "./models";
import { VisualBase, Visual, updateTypeGetter, UpdateType } from "essex.powerbi.base";
import IVisual = powerbi.IVisual;
import IVisualHostServices = powerbi.IVisualHostServices;
import VisualCapabilities = powerbi.VisualCapabilities;
import VisualInitOptions = powerbi.VisualInitOptions;
import VisualUpdateOptions = powerbi.VisualUpdateOptions;
import IInteractivityService = powerbi.visuals.IInteractivityService;
import InteractivityService = powerbi.visuals.InteractivityService;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import DataView = powerbi.DataView;
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

    public static capabilities: VisualCapabilities = capabilities;

    private myNetworkNavigator: NetworkNavigatorImpl;
    private host: IVisualHostServices;
    private interactivityService: IInteractivityService;
    private listener: { destroy: Function; };

    /**
     * The selection manager
     */
    private selectionManager: utility.SelectionManager;

    private settings: INetworkNavigatorVisualSettings = $.extend(true, {}, DEFAULT_SETTINGS);

    /**
     * Getter for the update type
     */
    private updateType = updateTypeGetter(this);

    /**
     * Gets called when a node is selected
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

    /**
     * Converts the data view into an internal data structure
     */
    public static converter(
        dataView: DataView,
        settings: INetworkNavigatorVisualSettings): INetworkNavigatorData<INetworkNavigatorSelectableNode> {
        let nodeList: INetworkNavigatorSelectableNode[] = [];
        let nodeMap: { [name: string] : INetworkNavigatorSelectableNode } = {};
        let linkList: INetworkNavigatorLink[] = [];
        let table = dataView.table;

        let colMap = {};
        table.columns.forEach((c, i) => {
            Object.keys(c.roles).forEach(role => {
                colMap[role] = i;
            });
        });

        // group defines the bundle basically
        // name, user friendly name,
        // num, size of circle, probably meant to be the number of matches
        // source - array index into nodes
        // target - array index into node
        // value - The number of times that the link has been made, ie, I emailed bob@gmail.com 10 times, so value would be 10

        let roles = DATA_ROLES;
        let sourceIdx = colMap[roles.source.name];
        let sourceColorIdx = colMap[roles.sourceColor.name];
        let sourceLabelColorIdx = colMap[roles.sourceLabelColor.name];
        // let sourceGroup = colMap[roles.sourceGroup.name];
        // let targetGroupIdx = colMap[roles.targetGroup.name];
        let targetColorIdx = colMap[roles.targetColor.name];
        let targetLabelColorIdx = colMap[roles.targetLabelColor.name];
        let targetIdx = colMap[roles.target.name];
        const edgeValueIdx = colMap[roles.edgeValue.name];
        const sourceNodeWeightIdx = colMap[roles.sourceNodeWeight.name];
        const targetNodeWeightIdx = colMap[roles.targetNodeWeight.name];

        let sourceField = table.identityFields[sourceIdx];
        let targetField = table.identityFields[targetIdx];

        // Can't do nuffin' without source an target fields
        if (sourceField && targetField) {
            const getNode = (
                id: string,
                identity: powerbi.DataViewScopeIdentity,
                isSource: boolean,
                nodeWeight: number,
                color: string = "gray",
                labelColor: string,
                group: number = 0) => {
                const field = (isSource ? sourceField : targetField);
                let node = nodeMap[id];
                let expr = powerbi.data.SQExprBuilder.equal(field as powerbi.data.SQExpr, powerbi.data.SQExprBuilder.text(id));

                if (!nodeMap[id]) {
                    node = nodeMap[id] = {
                        name: id,
                        color: color || "gray",
                        labelColor: labelColor,
                        index: nodeList.length,
                        filterExpr: expr,
                        value: nodeWeight,
                        neighbors: 1,
                        selected: false,
                        identity: SelectionId.createWithId(powerbi.data.createDataViewScopeIdentity(expr)),
                    };
                    nodeList.push(node);
                }
                return node as INetworkNavigatorSelectableNode;
            };

            table.rows.forEach((row, idx) => {
                let identity = table.identity[idx];
                if (row[sourceIdx] && row[targetIdx]) {
                    /** These need to be strings to work properly */
                    let sourceId = row[sourceIdx] + "";
                    let targetId = row[targetIdx] + "";
                    let edge = {
                        source:
                            getNode(sourceId,
                                    identity,
                                    true,
                                    row[sourceNodeWeightIdx],
                                    row[sourceColorIdx],
                                    row[sourceLabelColorIdx]/*,
                                    row[sourceGroup]*/).index,
                        target:
                            getNode(targetId,
                                    identity,
                                    false,
                                    row[targetNodeWeightIdx],
                                    row[targetColorIdx],
                                    row[targetLabelColorIdx]/*, 
                                    row[targetGroupIdx]*/).index,
                        value: row[edgeValueIdx],
                    };
                    nodeList[edge.source].neighbors += 1;
                    nodeList[edge.target].neighbors += 1;
                    linkList.push(edge);
                }
            });

            const maxNodes = settings.layout.maxNodeCount;
            if (typeof maxNodes === "number" && maxNodes > 0) {
                nodeList = nodeList.slice(0, maxNodes);
                linkList = linkList.filter(n => n.source < maxNodes && n.target < maxNodes);
            }
        }

        return {
            nodes: nodeList,
            links: linkList,
        };
    }

    /**
     * Constructor for the network navigator
     */
    constructor(noCss = false) {
        super("NetworkNavigator", noCss);

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

    /** This is called once when the visual is initialially created */
    public init(options: VisualInitOptions): void {
        super.init(options);

        this.myNetworkNavigator = new NetworkNavigatorImpl(this.element.find("#node_graph"), 500, 500);
        this.host = options.host;
        this.interactivityService = new InteractivityService(this.host);
        this.attachEvents();
        this.selectionManager = new utility.SelectionManager({ hostServices: this.host });
    }

    /** Update is called for data updates, resizes & formatting changes */
    public update(options: VisualUpdateOptions) {
        super.update(options);

        let dataView = options.dataViews && options.dataViews.length && options.dataViews[0];
        let dataViewTable = dataView && dataView.table;
        let forceReloadData = false;

        const type = this.updateType();
        if (type & UpdateType.Settings) {
            forceReloadData = this.updateSettings(options);
        }
        if (type & UpdateType.Resize) {
            this.myNetworkNavigator.dimensions = { width: options.viewport.width, height: options.viewport.height };
            this.element.css({ width: options.viewport.width, height: options.viewport.height });
        }
        if (type & UpdateType.Data || forceReloadData) {
            if (dataViewTable) {
                const newData = NetworkNavigator.converter(dataView, this.settings);
                this.myNetworkNavigator.setData(newData);
            } else {
                this.myNetworkNavigator.setData({
                    links: [],
                    nodes: [],
                });
            }
        }

        const data = this.myNetworkNavigator.getData();
        const nodes = data && data.nodes;
        const selectedIds = this.selectionManager.getSelectionIds();
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

        this.myNetworkNavigator.redrawLabels();
    }

    /**
     * Enumerates the instances for the objects that appear in the power bi panel
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
        let instances = super.enumerateObjectInstances(options) || [{
            /* tslint:disable */
            selector: null,
            /* tslint:enable */
            objectName: options.objectName,
            properties: {},
        }, ];

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
     * Handles updating of the settings
     */
    private updateSettings(options: VisualUpdateOptions): boolean {
        // There are some changes to the options
        let dataView = options.dataViews && options.dataViews.length && options.dataViews[0];
        if (dataView && dataView.metadata) {
            const oldSettings = $.extend(true, {}, this.settings);
            const newObjects = dataView.metadata.objects;
            const layoutObjs = newObjects && newObjects["layout"];
            const generalObjs = newObjects && newObjects["general"];

            // Merge in the settings
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

            if (oldSettings.layout.maxNodeCount !== this.settings.layout.maxNodeCount) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns if all the properties in the first object are present and equal to the ones in the super set
     */
    private objectIsSubset(set: Object, superSet: Object) {
        if (_.isObject(set)) {
            return _.any(_.keys(set), (key: string) => !this.objectIsSubset(set[key], superSet[key]));
        }
        return set === superSet;
    }

    /**
     * Attaches the line up events to lineup
     */
    private attachEvents() {
        if (this.myNetworkNavigator) {
            // Cleans up events
            if (this.listener) {
                this.listener.destroy();
            }
            this.listener =
                this.myNetworkNavigator.events.on("selectionChanged", (node: INetworkNavigatorNode) => this.onNodeSelected(node));

            // HAX: I am a strong, independent element and I don't need no framework tellin me how much focus I can have
            this.element.find(".filter-box input").on(EVENTS_TO_IGNORE, (e) => e.stopPropagation());
        }
    }
}
