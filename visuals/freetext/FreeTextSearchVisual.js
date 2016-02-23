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
var FreeTextSearch_1 = require("./FreeTextSearch");
var VisualBase_1 = require("../../base/VisualBase");
var Utils_1 = require("../../base/Utils");
var SelectionId = powerbi.visuals.SelectionId;
var SelectionManager = powerbi.visuals.utility.SelectionManager;
var VisualDataRoleKind = powerbi.VisualDataRoleKind;
var data = powerbi.data;
var FreeTextSearchVisual = (function (_super) {
    __extends(FreeTextSearchVisual, _super);
    /**
     * The constructor for the visual
     */
    function FreeTextSearchVisual() {
        var _this = this;
        _super.call(this);
        /**
         * The template for the grid
         */
        this.template = "\n        <div></div>\n    ";
        /**
         * The settings for the providers, flattens providers supported parameters into key value pairs
         */
        this.providerSettings = {};
        /**
         * The mapping of the keys in the capabilities object to a provider
         */
        this.propKeyToProvider = {};
        Object.keys(FreeTextSearch_1.FreeTextSearch.DEFAULT_PROVIDERS).forEach(function (pName) {
            var key = pName.replace(/ /g, "").toLowerCase();
            _this.propKeyToProvider[key] = FreeTextSearch_1.FreeTextSearch.DEFAULT_PROVIDERS[pName];
        });
        var props = FreeTextSearchVisual.buildProviderProps();
        var propKeys = Object.keys(props);
        propKeys.forEach(function (k) {
            var settings = _this.providerSettings[k] = {
                enabled: false
            };
            var providerKeys = Object.keys(props[k].properties);
            providerKeys.forEach(function (p) {
                settings[p] = "";
            });
        });
    }
    /** This is called once when the visual is initialially created */
    FreeTextSearchVisual.prototype.init = function (options) {
        _super.prototype.init.call(this, options, this.template);
        this.textSearch = new FreeTextSearch_1.FreeTextSearch(this.element);
        this.selectionManager = new SelectionManager({
            hostServices: options.host
        });
        this.host = options.host;
    };
    /** Update is called for data updates, resizes & formatting changes */
    FreeTextSearchVisual.prototype.update = function (options) {
        var _this = this;
        _super.prototype.update.call(this, options);
        this.textSearch.dimensions = $.extend(true, {}, options.viewport);
        this.dataView = options.dataViews && options.dataViews[0];
        var objects = this.dataView && this.dataView.metadata && this.dataView.metadata.objects;
        if (objects) {
            Object.keys(objects).forEach(function (k) {
                if (_this.providerSettings[k]) {
                    $.extend(true, _this.providerSettings[k], objects[k]);
                }
            });
            var ppKeys = Object.keys(this.providerSettings);
            var enabledPPKey = ppKeys.filter(function (k) { return _this.providerSettings[k].enabled; })[0];
            // We have something enabled
            if (enabledPPKey) {
                var enabledProvider = this.propKeyToProvider[enabledPPKey];
                var newParams = enabledProvider.supportedParameters.map(function (p) {
                    return {
                        name: p.name,
                        value: _this.providerSettings[enabledPPKey][p.name.replace(/ /g, "_")]
                    };
                });
                // Were changing providers
                if (!(this.textSearch.searchProvider instanceof enabledProvider)) {
                    this.textSearch.searchProvider = new enabledProvider(newParams);
                }
                else if (this.textSearch.searchProvider) {
                    this.textSearch.searchProvider.params = newParams;
                }
            }
            else {
                this.textSearch.searchProvider = undefined;
            }
        }
        this.textSearch.events.on("loadMoreData", function (item) {
            if (item.result && item.result.then) {
                item.result.then(function (newItems) {
                    _this.applySelectionToSlicerItems(newItems);
                });
            }
        });
        this.textSearch.events.on("selectionChanged", function () {
            _this.selectionManager.clear();
            _this.textSearch.selectedItems.map(function (n) { return _this.getIdFromItem(n); }).forEach(function (i) { return _this.selectionManager.select(i, true); });
            _this.updateSelectionFilter();
        });
        this.applySelectionToSlicerItems(this.textSearch.data);
    };
    /**
     * Builds the provider properties
     */
    FreeTextSearchVisual.buildProviderProps = function () {
        var allProviders = FreeTextSearch_1.FreeTextSearch.DEFAULT_PROVIDERS;
        var providerNames = Object.keys(allProviders);
        var final = {};
        providerNames.forEach(function (n) {
            var providerKey = n.toLowerCase().replace(/ /g, "_");
            // Add an enabled flag
            var props = {
                enabled: {
                    displayName: "Enabled",
                    description: "Use the " + n + " to perform searches",
                    type: { bool: {} }
                }
            };
            // Go through all the properties of the providers, and add it as a PBI property
            var provider = allProviders[n];
            provider.supportedParameters.forEach(function (p) {
                props[p.name.replace(/ /g, "_")] = {
                    displayName: p.name,
                    description: p.description,
                    type: { text: {} }
                };
            });
            // Add this providers props to the top level
            final[n.toLowerCase().replace(/ /g, "_")] = {
                displayName: allProviders[n].name,
                properties: props
            };
        });
        return final;
    };
    /**
     * Enumerates the instances for the objects that appear in the power bi panel
     */
    FreeTextSearchVisual.prototype.enumerateObjectInstances = function (options) {
        var result = {};
        // If the properties requested are one of the providers props
        if (this.providerSettings[options.objectName]) {
            return [{
                    selector: null,
                    objectName: options.objectName,
                    properties: $.extend(true, {}, this.providerSettings[options.objectName])
                }];
        }
        return [{
                selector: null,
                objectName: options.objectName,
                properties: result
            }];
    };
    /**
     * Gets an id from an item
     */
    FreeTextSearchVisual.prototype.getIdFromItem = function (item) {
        return SelectionId.createWithMeasure(item.id);
    };
    /**
     * Applies the selection to the given items
     */
    FreeTextSearchVisual.prototype.applySelectionToSlicerItems = function (items) {
        var _this = this;
        var selectedIds = this.selectionManager.getSelectionIds();
        items.forEach(function (d) {
            var id = _this.getIdFromItem(d);
            d.selected = !!_.find(selectedIds, function (oId) { return oId.equals(id); });
        });
    };
    /**
     * Updates the data filter based on the selection
     */
    FreeTextSearchVisual.prototype.updateSelectionFilter = function () {
        var filter;
        if (this.selectionManager.hasSelection()) {
            var fieldsToCheck = this.dataView.categorical.categories[0].identityFields;
            var expressions = [];
            this.selectionManager.getSelectionIds()
                .forEach(function (id) {
                fieldsToCheck.forEach(function (field) {
                    expressions.push(data.SQExprBuilder.contains(field, data.SQExprBuilder.text(id.getSelector().metadata)));
                });
            });
            ;
            var expression = expressions[0];
            // If we are allowing multiSelect
            if (expressions.length > 0) {
                expressions.slice(1).forEach(function (r) {
                    expression = powerbi.data.SQExprBuilder.or(expression, r);
                });
            }
            filter = powerbi.data.SemanticFilter.fromSQExpr(expression);
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
    /**
     * Gets the inline css used for this element
     */
    FreeTextSearchVisual.prototype.getCss = function () {
        return _super.prototype.getCss.call(this).concat([require("!css!sass!../advancedslicer/css/AdvancedSlicer.scss")]);
    };
    /**
     * The set of capabilities for the visual
     */
    FreeTextSearchVisual.capabilities = {
        dataRoles: [
            {
                name: 'Category',
                kind: VisualDataRoleKind.Grouping,
                displayName: "Fields to Filter"
            }
        ],
        dataViewMappings: [{
                categorical: {
                    categories: { for: { in: "Category" } }
                }
            }],
        // Sort this crap by default
        sorting: {
            default: {}
        },
        objects: $.extend({
            general: {
                displayName: data.createDisplayNameGetter('Visual_General'),
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
            }
        }, FreeTextSearchVisual.buildProviderProps())
    };
    FreeTextSearchVisual = __decorate([
        Utils_1.Visual(require("./build.js").output.PowerBI)
    ], FreeTextSearchVisual);
    return FreeTextSearchVisual;
})(VisualBase_1.VisualBase);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FreeTextSearchVisual;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnJlZVRleHRTZWFyY2hWaXN1YWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJGcmVlVGV4dFNlYXJjaFZpc3VhbC50cyJdLCJuYW1lcyI6WyJGcmVlVGV4dFNlYXJjaFZpc3VhbCIsIkZyZWVUZXh0U2VhcmNoVmlzdWFsLmNvbnN0cnVjdG9yIiwiRnJlZVRleHRTZWFyY2hWaXN1YWwuaW5pdCIsIkZyZWVUZXh0U2VhcmNoVmlzdWFsLnVwZGF0ZSIsIkZyZWVUZXh0U2VhcmNoVmlzdWFsLmJ1aWxkUHJvdmlkZXJQcm9wcyIsIkZyZWVUZXh0U2VhcmNoVmlzdWFsLmVudW1lcmF0ZU9iamVjdEluc3RhbmNlcyIsIkZyZWVUZXh0U2VhcmNoVmlzdWFsLmdldElkRnJvbUl0ZW0iLCJGcmVlVGV4dFNlYXJjaFZpc3VhbC5hcHBseVNlbGVjdGlvblRvU2xpY2VySXRlbXMiLCJGcmVlVGV4dFNlYXJjaFZpc3VhbC51cGRhdGVTZWxlY3Rpb25GaWx0ZXIiLCJGcmVlVGV4dFNlYXJjaFZpc3VhbC5nZXRDc3MiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsa0RBQWtEO0FBR2xELCtCQUFpRCxrQkFBa0IsQ0FBQyxDQUFBO0FBR3BFLDJCQUEyQix1QkFBdUIsQ0FBQyxDQUFBO0FBQ25ELHNCQUF5QyxrQkFBa0IsQ0FBQyxDQUFBO0FBVzVELElBQU8sV0FBVyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO0FBQ2pELElBQU8sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7QUFDbkUsSUFBTyxrQkFBa0IsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUM7QUFHdkQsSUFBTyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztBQU0zQjtJQUNrREEsd0NBQVVBO0lBNEV4REE7O09BRUdBO0lBQ0hBO1FBaEZKQyxpQkFrU0NBO1FBak5PQSxpQkFBT0EsQ0FBQ0E7UUEvQlpBOztXQUVHQTtRQUNL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