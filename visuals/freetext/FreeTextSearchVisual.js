"use strict";
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
            var enabledPPKey_1 = ppKeys.filter(function (k) { return _this.providerSettings[k].enabled; })[0];
            // We have something enabled
            if (enabledPPKey_1) {
                var enabledProvider = this.propKeyToProvider[enabledPPKey_1];
                var newParams = enabledProvider.supportedParameters.map(function (p) {
                    return {
                        name: p.name,
                        value: _this.providerSettings[enabledPPKey_1][p.name.replace(/ /g, "_")]
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
}(VisualBase_1.VisualBase));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FreeTextSearchVisual;
