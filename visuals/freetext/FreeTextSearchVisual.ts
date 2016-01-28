/// <reference path="../../base/references.d.ts"/>
declare var _;

import { FreeTextSearch } from "./FreeTextSearch";
import { ISearchProvider, ISearchProviderStatic } from "./providers/ISearchProvider";
import { SlicerItem } from "../advancedslicer/AdvancedSlicer";

import { VisualBase } from "../../base/VisualBase";
import { default as Utils, Visual } from "../../base/Utils";
import IVisual = powerbi.IVisual;
import DataViewTable = powerbi.DataViewTable;
import IVisualHostServices = powerbi.IVisualHostServices;
import VisualCapabilities = powerbi.VisualCapabilities;
import VisualInitOptions = powerbi.VisualInitOptions;
import VisualUpdateOptions = powerbi.VisualUpdateOptions;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import DataView = powerbi.DataView;
import SelectionId = powerbi.visuals.SelectionId;
import SelectionManager = powerbi.visuals.utility.SelectionManager;
import VisualDataRoleKind = powerbi.VisualDataRoleKind;
import SQExpr = powerbi.data.SQExpr;
import utility = powerbi.visuals.utility;
import data = powerbi.data;
import VisualObjectInstancesToPersist = powerbi.VisualObjectInstancesToPersist;
import DataViewObjectPropertyDescriptors = powerbi.data.DataViewObjectPropertyDescriptors;
import DataViewObjectPropertyDescriptor = powerbi.data.DataViewObjectPropertyDescriptor;
import DataViewObjectDescriptor = powerbi.data.DataViewObjectDescriptor;

@Visual(require("./build.js").output.PowerBI)
export default class FreeTextSearchVisual extends VisualBase implements IVisual {

    private host : IVisualHostServices;

    /**
     * The selection manager
     */
    private selectionManager: utility.SelectionManager;

    /**
     * The set of capabilities for the visual
     */
    public static capabilities: VisualCapabilities = {
        dataRoles: [
            {
                name: 'Category',
                kind: VisualDataRoleKind.Grouping,
                displayName: "Fields to Filter"
            }
        ],
        dataViewMappings: [{
            categorical: {
                categories: { for: { in: "Category" }}
            }
        }],
        // Sort this crap by default
        sorting: {
            default:{}
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

    /**
     * The template for the grid
     */
    private template: string = `
        <div></div>
    `;

    /**
     * Gets the current data view
     */
    private dataView: DataView;

    /**
     * My Text Search Widget
     */
    private textSearch : FreeTextSearch;

    /** This is called once when the visual is initialially created */
    public init(options: VisualInitOptions): void {
        super.init(options, this.template);
        this.textSearch = new FreeTextSearch(this.element);
        this.selectionManager = new SelectionManager({
            hostServices: options.host
        });
    }

    /** Update is called for data updates, resizes & formatting changes */
    public update(options: VisualUpdateOptions) {
        super.update(options);

        this.dataView = options.dataViews && options.dataViews[0];

        this.textSearch.events.on("loadMoreData", (item) => {
            if (item.result && item.result.then) {
                item.result.then((newItems) => {
                    this.applySelectionToSlicerItems(newItems);
                });
            }
        });
        this.applySelectionToSlicerItems(this.textSearch.data);
    }

    /**
     * Builds the provider properties
     */
    public static buildProviderProps() : { [name: string] : DataViewObjectDescriptor } {
        let allProviders = FreeTextSearch.DEFAULT_PROVIDERS;
        let providerNames = Object.keys(allProviders);
        let final : { [name: string] : DataViewObjectDescriptor } = { };
        providerNames.forEach((n) => {
            let props = {
                enabled: {
                    displayName: "Enabled",
                    description: "Use the " + n + " to perform searches",
                    type: { bool: {} }
                }
            };

            let provider = allProviders[n];
            provider.requiredParameters.forEach(p => {
                props[p.name.toLowerCase().replace(/ /g, "_")] = {
                    displayName: p.name,
                    description: p.description,
                    type: { text: {} }
                };
            });
            final[n.toLowerCase().replace(/ /g, "_")] = {
                displayName: n,
                properties: <any>props
            };
        });
        return final;
    }

    /**
     * Enumerates the instances for the objects that appear in the power bi panel
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
        let allProviders = FreeTextSearch.DEFAULT_PROVIDERS;

        let providerMap : { [name: string] : ISearchProviderStatic } = {};
        let providerPropKeys = [];
        Object.keys(allProviders).forEach((pName) => {
            let key = pName.replace(/ /g, "").toLowerCase();
            providerPropKeys.push(key);
            providerMap[key] = allProviders[pName];
        });
        let result = <any>{};
        if (providerPropKeys.indexOf(options.objectName) >= 0) {
            let provider = providerMap[options.objectName];
            let paramsToAdd = provider.requiredParameters;

            result.enabled = this.textSearch.searchProvider instanceof provider;
            if(result.enabled) {
                paramsToAdd = paramsToAdd.map((p) => {
                    let matching = this.textSearch.searchProvider.params.filter(m => m.name === p.name)[0];
                    let mapped = {
                        name: p.name,
                        value: undefined
                    };
                    if (matching) {
                        mapped.value = p.value;
                    }
                    return mapped;
                });
            } else {
                result.enabled = false;
                provider.requiredParameters.forEach(p => {
                    result[p.name.toLowerCase().replace(/ /g, "_")] = p.value || "";
                });
            }
        }
        return [{
            selector: null,
            objectName: options.objectName,
            properties: result
        }];
    }

    /**
     * Gets an id from an item
     */
    private getIdFromItem(item: SlicerItem) {
        return SelectionId.createWithMeasure(item.match);
    }

    /**
     * Applies the selection to the given items
     */
    private applySelectionToSlicerItems(items: SlicerItem[]) {
        var selectedIds = this.selectionManager.getSelectionIds();
        items.forEach((d) => {
            var id = this.getIdFromItem(d);
            d.selected = !!_.find(selectedIds, (oId) => oId.equals(id));
        });
    }

    /**
     * Updates the data filter based on the selection
     */
    private updateSelectionFilter() {
        var filter;
        if (this.selectionManager.hasSelection()) {
            var fieldsToCheck = this.dataView.categorical.categories[0].identityFields;
            var expressions : data.SQExpr[] = [];
            this.selectionManager.getSelectionIds()
                .forEach((id) => {
                    fieldsToCheck.forEach((field) => {
                        expressions.push(data.SQExprBuilder.contains(field, data.SQExprBuilder.text(<any>id.getSelector().metadata)));
                    })
                });

            var expression = expressions[0];

            // If we are allowing multiSelect
            if (expressions.length > 0) {
                expressions.slice(1).forEach((r) => {
                    expression = powerbi.data.SQExprBuilder.or(expression, r);
                });
            }
            filter = powerbi.data.SemanticFilter.fromSQExpr(expression);
        }
        var objects: VisualObjectInstancesToPersist = {
            merge: [
                <VisualObjectInstance>{
                    objectName: "general",
                    selector: undefined,
                    properties: {
                        "filter": filter
                    }
                }
            ]
        };
        this.host.persistProperties(objects);
    }

    /**
     * Gets the inline css used for this element
     */
    protected getCss() : string[] {
        return super.getCss().concat([require("!css!sass!../advancedslicer/css/AdvancedSlicer.scss")]);
    }
}