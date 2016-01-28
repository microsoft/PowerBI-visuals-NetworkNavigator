/// <reference path="../../base/references.d.ts"/>
declare var _;

import { FreeTextSearch, SlicerItemWithId } from "./FreeTextSearch";
import { ISearchProvider, ISearchProviderStatic, ISearchProviderParams } from "./providers/ISearchProvider";

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

    /**
     * The settings for the providers, flattens providers supported parameters into key value pairs
     */
    private providerSettings : { [providerKey: string] : any } = {};

    /**
     * The mapping of the keys in the capabilities object to a provider
     */
    private propKeyToProvider : { [name: string] : ISearchProviderStatic } = {};

    /**
     * The constructor for the visual
     */
    public constructor() {
        super();

        Object.keys(FreeTextSearch.DEFAULT_PROVIDERS).forEach((pName) => {
            let key = pName.replace(/ /g, "").toLowerCase();
            this.propKeyToProvider[key] = FreeTextSearch.DEFAULT_PROVIDERS[pName];
        });

        let props = FreeTextSearchVisual.buildProviderProps();
        let propKeys = Object.keys(props);
        propKeys.forEach((k) => {
            let settings = this.providerSettings[k] = {
                enabled: false
            };
            let providerKeys = Object.keys(props[k].properties);
            providerKeys.forEach((p) => {
                settings[p] = "";
            });

        });
    }

    /** This is called once when the visual is initialially created */
    public init(options: VisualInitOptions): void {
        super.init(options, this.template);
        this.textSearch = new FreeTextSearch(this.element);
        this.selectionManager = new SelectionManager({
            hostServices: options.host
        });
        this.host = options.host;
    }

    /** Update is called for data updates, resizes & formatting changes */
    public update(options: VisualUpdateOptions) {
        super.update(options);

        this.textSearch.dimensions = $.extend(true, {}, options.viewport);

        this.dataView = options.dataViews && options.dataViews[0];
        let objects = this.dataView && this.dataView.metadata && this.dataView.metadata.objects;
        if (objects) {
            Object.keys(objects).forEach((k) => {
                if (this.providerSettings[k]) {
                    $.extend(true, this.providerSettings[k], objects[k]);
                }
            });

            let ppKeys = Object.keys(this.providerSettings);
            let enabledPPKey = ppKeys.filter((k) => this.providerSettings[k].enabled)[0];

            // We have something enabled
            if (enabledPPKey) {
                let enabledProvider = this.propKeyToProvider[enabledPPKey];
                let newParams : ISearchProviderParams[]  = enabledProvider.supportedParameters.map((p) => {
                    return {
                        name: p.name,
                        value: this.providerSettings[enabledPPKey][p.name.replace(/ /g, "_")]
                    };
                });

                // Were changing providers
                if (!(this.textSearch.searchProvider instanceof enabledProvider)) {
                    this.textSearch.searchProvider = new enabledProvider(newParams);

                // Same provider, different params
                } else if (this.textSearch.searchProvider) {
                    this.textSearch.searchProvider.params = newParams;
                }
            } else {
                this.textSearch.searchProvider = undefined;
            }

        }
        this.textSearch.events.on("loadMoreData", (item) => {
            if (item.result && item.result.then) {
                item.result.then((newItems) => {
                    this.applySelectionToSlicerItems(newItems);
                });
            }
        });
        this.textSearch.events.on("selectionChanged", () => {
            this.selectionManager.clear();
            this.textSearch.selectedItems.map(n => this.getIdFromItem(<SlicerItemWithId>n)).forEach(i => this.selectionManager.select(i, true));
            this.updateSelectionFilter();
        });
        this.applySelectionToSlicerItems(<SlicerItemWithId[]>this.textSearch.data);
    }

    /**
     * Builds the provider properties
     */
    public static buildProviderProps() : { [name: string] : DataViewObjectDescriptor } {
        let allProviders = FreeTextSearch.DEFAULT_PROVIDERS;
        let providerNames = Object.keys(allProviders);
        let final : { [name: string] : DataViewObjectDescriptor } = { };
        providerNames.forEach((n) => {
            let providerKey = n.toLowerCase().replace(/ /g, "_");

            // Add an enabled flag
            let props = {
                enabled: {
                    displayName: "Enabled",
                    description: "Use the " + n + " to perform searches",
                    type: { bool: {} }
                }
            };

            // Go through all the properties of the providers, and add it as a PBI property
            let provider : ISearchProviderStatic = allProviders[n];
            provider.supportedParameters.forEach(p => {
                props[p.name.replace(/ /g, "_")] = {
                    displayName: p.name,
                    description: p.description,
                    type: { text: {} }
                };
            });

            // Add this providers props to the top level
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
        let result = <any>{};

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
    }

    /**
     * Gets an id from an item
     */
    private getIdFromItem(item: SlicerItemWithId) : SelectionId {
        return SelectionId.createWithMeasure(item.id);
    }

    /**
     * Applies the selection to the given items
     */
    private applySelectionToSlicerItems(items: SlicerItemWithId[]) {
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
                });;

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