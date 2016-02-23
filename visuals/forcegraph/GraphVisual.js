var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/// <reference path="../../base/references.d.ts"/>
var ForceGraph_1 = require("./ForceGraph");
var VisualBase_1 = require("../../base/VisualBase");
var Utils_1 = require("../../base/Utils");
var InteractivityService = powerbi.visuals.InteractivityService;
var SelectionId = powerbi.visuals.SelectionId;
var utility = powerbi.visuals.utility;
var GraphVisual = (function (_super) {
    __extends(GraphVisual, _super);
    function GraphVisual() {
        _super.apply(this, arguments);
        /**
         * The font awesome resource
         */
        this.fontAwesome = {
            url: '//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css',
            integrity: 'sha256-3dkvEK0WLHRJ7/Csr0BZjAWxERc5WH7bdeUya2aXxdU= sha512-+L4yy6FRcDGbXJ9mPG8MT' +
                '/3UCDzwR9gPeyFNMCtInsol++5m3bk2bXWKdZjvybmohrAsn3Ua5x8gfLnbE1YkOg==',
            crossorigin: "anonymous"
        };
        this.settings = $.extend(true, {}, GraphVisual.DEFAULT_SETTINGS);
        // private template : string = `
        //     <div class="load-container load5">
        //         <div class="loader">Loading...</div>
        //     </div>`;
        this.template = "\n        <div id=\"node_graph\" style= \"height: 100%;\"> </div>\n    ";
    }
    /** This is called once when the visual is initialially created */
    GraphVisual.prototype.init = function (options) {
        _super.prototype.init.call(this, options, this.template);
        this.element.append(this.template);
        this.myGraph = new ForceGraph_1.ForceGraph(this.element.find("#node_graph"), 500, 500);
        this.host = options.host;
        this.interactivityService = new InteractivityService(this.host);
        this.attachEvents();
        this.selectionManager = new utility.SelectionManager({ hostServices: this.host });
    };
    /** Update is called for data updates, resizes & formatting changes */
    GraphVisual.prototype.update = function (options) {
        _super.prototype.update.call(this, options);
        var dataView = options.dataViews && options.dataViews.length && options.dataViews[0];
        var dataViewTable = dataView && dataView.table;
        var forceDataReload = this.updateSettings(options);
        if (dataViewTable) {
            if ((forceDataReload || this.hasDataChanged(this.dataViewTable, dataViewTable))) {
                var parsedData = GraphVisual.converter(dataView, this.settings);
                this.myGraph.setData(parsedData);
            }
            var selectedIds = this.selectionManager.getSelectionIds();
            var data = this.myGraph.getData();
            if (data && data.nodes && data.nodes.length) {
                var updated = false;
                data.nodes.forEach(function (n) {
                    var isSelected = !!_.find(selectedIds, function (id) { return id.equals(n.identity); });
                    if (isSelected !== n.selected) {
                        n.selected = isSelected;
                        updated = true;
                    }
                });
                if (updated) {
                    this.myGraph.redrawSelection();
                }
            }
        }
        this.dataViewTable = dataViewTable;
        var currentDimensions = this.myGraph.dimensions;
        if (currentDimensions.width !== options.viewport.width ||
            currentDimensions.height !== options.viewport.height) {
            this.myGraph.dimensions = { width: options.viewport.width, height: options.viewport.height };
            this.element.css({ width: options.viewport.width, height: options.viewport.height });
        }
    };
    /**
     * Enumerates the instances for the objects that appear in the power bi panel
     */
    GraphVisual.prototype.enumerateObjectInstances = function (options) {
        return [{
                selector: null,
                objectName: options.objectName,
                properties: $.extend(true, {}, this.settings[options.objectName])
            }];
    };
    /**
     * Converts the data view into an internal data structure
     */
    GraphVisual.converter = function (dataView, settings) {
        var nodeList = [];
        var nodeMap = {};
        var linkList = [];
        var table = dataView.table;
        var colMap = {};
        table.columns.forEach(function (n, i) {
            colMap[n.displayName.toLocaleLowerCase()] = i;
        });
        // group defines the bundle basically
        // name, user friendly name,
        // num, size of circle, probably meant to be the number of matches
        // source - array index into nodes
        // target - array index into node
        // value - The number of times that the link has been made, ie, I emailed bob@gmail.com 10 times, so value would be 10
        var sourceIdx = colMap[settings.columnMappings.source.toLocaleLowerCase()];
        var sourceColorIdx = colMap[settings.columnMappings.sourceColor.toLocaleLowerCase()];
        var sourceGroup = colMap[settings.columnMappings.sourceGroup.toLocaleLowerCase()];
        var targetGroupIdx = colMap[settings.columnMappings.targetGroup.toLocaleLowerCase()];
        var targetColorIdx = colMap[settings.columnMappings.targetColor.toLocaleLowerCase()];
        var targetIdx = colMap[settings.columnMappings.target.toLocaleLowerCase()];
        var edgeValueIdx = colMap[settings.columnMappings.edgeValue.toLocaleLowerCase()];
        var sourceField = dataView.categorical.categories[0].identityFields[sourceIdx];
        var targetField = dataView.categorical.categories[0].identityFields[targetIdx];
        function getNode(id, identity, isSource, color, group) {
            if (color === void 0) { color = "gray"; }
            if (group === void 0) { group = 0; }
            var node = nodeMap[id];
            // var expr = identity.expr;
            var expr = powerbi.data.SQExprBuilder.equal(isSource ? sourceField : targetField, powerbi.data.SQExprBuilder.text(id));
            if (!nodeMap[id]) {
                node = nodeMap[id] = {
                    name: id,
                    color: color || "gray",
                    index: nodeList.length,
                    filterExpr: expr,
                    num: 1,
                    selected: false,
                    identity: SelectionId.createWithId(powerbi.data.createDataViewScopeIdentity(expr))
                };
                nodeList.push(node);
            }
            return node;
        }
        table.rows.forEach(function (row, idx) {
            var identity = table.identity[idx];
            if (row[sourceIdx] && row[targetIdx]) {
                /** These need to be strings to work properly */
                var sourceId = row[sourceIdx] + "";
                var targetId = row[targetIdx] + "";
                var edge = {
                    source: getNode(sourceId, identity, true, row[sourceColorIdx], row[sourceGroup]).index,
                    target: getNode(targetId, identity, false, row[targetColorIdx], row[targetGroupIdx]).index,
                    value: row[edgeValueIdx]
                };
                nodeList[edge.source].num += 1;
                nodeList[edge.target].num += 1;
                linkList.push(edge);
            }
        });
        return {
            nodes: nodeList,
            links: linkList
        };
    };
    /**
    * Gets the external css paths used for this visualization
    */
    GraphVisual.prototype.getExternalCssResources = function () {
        return _super.prototype.getExternalCssResources.call(this).concat(this.fontAwesome);
    };
    /**
     * Gets the inline css used for this element
     */
    GraphVisual.prototype.getCss = function () {
        return _super.prototype.getCss.call(this).concat([require("!css!sass!./css/GraphVisual.scss")]);
    };
    /**
     * Handles updating of the settings
     */
    GraphVisual.prototype.updateSettings = function (options) {
        // There are some changes to the options
        var dataView = options.dataViews && options.dataViews.length && options.dataViews[0];
        if (dataView && dataView.metadata) {
            var oldSettings = $.extend(true, {}, this.settings);
            var newObjects = dataView.metadata.objects;
            // Merge in the settings
            $.extend(true, this.settings, newObjects ? newObjects : GraphVisual.DEFAULT_SETTINGS);
            // There were some changes to the layout
            if (!_.isEqual(oldSettings.layout, this.settings.layout)) {
                this.myGraph.configuration = $.extend(true, {}, this.settings.layout);
            }
            if (!_.isEqual(oldSettings.columnMappings, this.settings.columnMappings)) {
                // This is necessary because some of the settings affect how the data is loaded
                return true;
            }
        }
        return false;
    };
    /**
     * Returns if all the properties in the first object are present and equal to the ones in the super set
     */
    GraphVisual.prototype.objectIsSubset = function (set, superSet) {
        var _this = this;
        if (_.isObject(set)) {
            return _.any(_.keys(set), function (key) { return !_this.objectIsSubset(set[key], superSet[key]); });
        }
        return set === superSet;
    };
    /**
     * Determines if the old data is different from the new data.
     */
    GraphVisual.prototype.hasDataChanged = function (oldData, newData) {
        if (!oldData || !newData || oldData.rows.length !== newData.rows.length) {
            return true;
        }
        // If there are any elements in newdata that arent in the old data
        return _.any(newData.identity, function (n) { return !_.any(oldData.identity, function (m) { return m.key.indexOf(n.key) === 0; }); });
    };
    /**
     * Attaches the line up events to lineup
     */
    GraphVisual.prototype.attachEvents = function () {
        var _this = this;
        if (this.myGraph) {
            // Cleans up events
            if (this.listener) {
                this.listener.destroy();
            }
            this.listener = this.myGraph.events.on("selectionChanged", function (node) { return _this.onNodeSelected(node); });
        }
    };
    /**
     * Gets called when a node is selected
     */
    GraphVisual.prototype.onNodeSelected = function (node) {
        var filter;
        if (node) {
            filter = powerbi.data.SemanticFilter.fromSQExpr(node.filterExpr);
            this.selectionManager.select(node.identity, false);
        }
        else {
            this.selectionManager.clear();
        }
        var objects = {
            merge: [
                {
                    objectName: "general",
                    selector: undefined,
                    properties: {
                        "filter": filter
                    }
                }
            ]
        };
        this.host.persistProperties(objects);
    };
    GraphVisual.DEFAULT_SETTINGS = {
        columnMappings: {
            source: "source",
            target: "target",
            edgeValue: "value",
            sourceColor: "sourceColor",
            targetColor: "targetColor",
            sourceGroup: "sourceGroup",
            targetGroup: "targetGroup"
        },
        layout: {
            linkDistance: 10,
            linkStrength: 2,
            gravity: .1,
            charge: -120,
            labels: false,
            minZoom: .1,
            maxZoom: 100
        }
    };
    GraphVisual.capabilities = {
        dataRoles: [{
                name: "Edges",
                displayName: "Edges",
                kind: powerbi.VisualDataRoleKind.GroupingOrMeasure,
            }],
        dataViewMappings: [{
                table: {
                    rows: {
                        for: { in: "Edges" }
                    }
                }
            }],
        objects: {
            general: {
                displayName: powerbi.data.createDisplayNameGetter('Visual_General'),
                properties: {
                    filter: {
                        type: { filter: {} },
                        rule: {
                            output: {
                                property: 'selected',
                                selector: ['Values'],
                            }
                        }
                    },
                },
            },
            columnMappings: {
                displayName: "Column Bindings",
                properties: {
                    source: {
                        displayName: "Source Column",
                        type: { text: true }
                    },
                    target: {
                        displayName: "Target Column",
                        type: { text: true }
                    },
                    edgeValue: {
                        displayName: "Edge Weight Column",
                        type: { text: true }
                    },
                    sourceColor: {
                        displayName: "Source Node Color Column",
                        type: { text: true }
                    },
                    targetColor: {
                        displayName: "Target Node Color Column",
                        type: { text: true }
                    }
                },
            },
            layout: {
                displayName: "Layout",
                properties: {
                    linkDistance: {
                        displayName: "Link Distance",
                        type: { numeric: true }
                    },
                    linkStrength: {
                        displayName: "Link Strength",
                        type: { numeric: true }
                    },
                    gravity: {
                        displayName: "Gravity",
                        type: { numeric: true }
                    },
                    charge: {
                        displayName: "Charge",
                        type: { numeric: true }
                    },
                    labels: {
                        displayName: "Labels",
                        description: "If labels on the nodes should be shown",
                        type: { bool: true }
                    },
                    minZoom: {
                        displayName: "Min Zoom",
                        type: { numeric: true }
                    },
                    maxZoom: {
                        displayName: "Max Zoom",
                        type: { numeric: true }
                    }
                }
            }
        }
    };
    GraphVisual = __decorate([
        Utils_1.Visual(JSON.parse(require("./build.json")).output.PowerBI)
    ], GraphVisual);
    return GraphVisual;
})(VisualBase_1.VisualBase);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GraphVisual;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3JhcGhWaXN1YWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJHcmFwaFZpc3VhbC50cyJdLCJuYW1lcyI6WyJHcmFwaFZpc3VhbCIsIkdyYXBoVmlzdWFsLmNvbnN0cnVjdG9yIiwiR3JhcGhWaXN1YWwuaW5pdCIsIkdyYXBoVmlzdWFsLnVwZGF0ZSIsIkdyYXBoVmlzdWFsLmVudW1lcmF0ZU9iamVjdEluc3RhbmNlcyIsIkdyYXBoVmlzdWFsLmNvbnZlcnRlciIsIkdyYXBoVmlzdWFsLmNvbnZlcnRlci5nZXROb2RlIiwiR3JhcGhWaXN1YWwuZ2V0RXh0ZXJuYWxDc3NSZXNvdXJjZXMiLCJHcmFwaFZpc3VhbC5nZXRDc3MiLCJHcmFwaFZpc3VhbC51cGRhdGVTZXR0aW5ncyIsIkdyYXBoVmlzdWFsLm9iamVjdElzU3Vic2V0IiwiR3JhcGhWaXN1YWwuaGFzRGF0YUNoYW5nZWQiLCJHcmFwaFZpc3VhbC5hdHRhY2hFdmVudHMiLCJHcmFwaFZpc3VhbC5vbk5vZGVTZWxlY3RlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxrREFBa0Q7QUFDbEQsMkJBQThFLGNBQWMsQ0FBQyxDQUFBO0FBQzdGLDJCQUFnRCx1QkFBdUIsQ0FBQyxDQUFBO0FBQ3hFLHNCQUF5QyxrQkFBa0IsQ0FBQyxDQUFBO0FBUTVELElBQU8sb0JBQW9CLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQztBQUtuRSxJQUFPLFdBQVcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztBQUdqRCxJQUFPLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztBQUl6QztJQUN5Q0EsK0JBQVVBO0lBRG5EQTtRQUN5Q0MsOEJBQVVBO1FBNEgvQ0E7O1dBRUdBO1FBQ0tBLGdCQUFXQSxHQUF3QkE7WUFDdkNBLEdBQUdBLEVBQUVBLHVFQUF1RUE7WUFDNUVBLFNBQVNBLEVBQUVBLGtGQUFrRkE7Z0JBQ2pGQSxxRUFBcUVBO1lBQ2pG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QUNBLEVBQUVBLENBQUNBO1lBQ3ZCQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxpQkFBaUJBLEVBQUVBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ2xEQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUVIQSxxQ0FBcUNBO1FBQ3JDQSw0QkFBNEJBO1FBQzVCQSxrRUFBa0VBO1FBQ2xFQSxrQ0FBa0NBO1FBQ2xDQSxpQ0FBaUNBO1FBQ2pDQSxzSEFBc0hBO1FBRXRIQSxJQUFJQSxTQUFTQSxHQUFHQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxjQUFjQSxDQUFDQSxNQUFNQSxDQUFDQSxpQkFBaUJBLEVBQUVBLENBQUNBLENBQUNBO1FBQzNFQSxJQUFJQSxjQUFjQSxHQUFHQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxjQUFjQSxDQUFDQSxXQUFXQSxDQUFDQSxpQkFBaUJBLEVBQUVBLENBQUNBLENBQUNBO1FBQ3JGQSxJQUFJQSxXQUFXQSxHQUFHQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxjQUFjQSxDQUFDQSxXQUFXQSxDQUFDQSxpQkFBaUJBLEVBQUVBLENBQUNBLENBQUNBO1FBQ2xGQSxJQUFJQSxjQUFjQSxHQUFHQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxjQUFjQSxDQUFDQSxXQUFXQSxDQUFDQSxpQkFBaUJBLEVBQUVBLENBQUNBLENBQUNBO1FBQ3JGQSxJQUFJQSxjQUFjQSxHQUFHQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxjQUFjQSxDQUFDQSxXQUFXQSxDQUFDQSxpQkFBaUJBLEVBQUVBLENBQUNBLENBQUNBO1FBQ3JGQSxJQUFJQSxTQUFTQSxHQUFHQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxjQUFjQSxDQUFDQSxNQUFNQSxDQUFDQSxpQkFBaUJBLEVBQUVBLENBQUNBLENBQUNBO1FBQzNFQSxJQUFJQSxZQUFZQSxHQUFHQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxjQUFjQSxDQUFDQSxTQUFTQSxDQUFDQSxpQkFBaUJBLEVBQUVBLENBQUNBLENB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