/// <reference path="../../base/references.d.ts"/>
/// <reference path="./lineup.ts"/>
/// <reference path="./ILineUpVisualRow.ts"/>

declare var LineUp;

module powerbi.visuals {
    export class LineUpVisual extends VisualBase implements IVisual {
        private dataViewTable: DataViewTable;
        private dataView: DataView;
        private host : IVisualHostServices;
        private lineup: any;
        private loadingMoreData = false;
        private selectionEnabled : boolean;
        private isMultiSelection : boolean;
        private selectionManager : utility.SelectionManager;

        /**
         * Represents the settings
         */
        private static DEFAULT_SETTINGS : ILineUpVisualSettings = {
            selection: {
                displayName: "Selection",
                properties: {
                    singleSelect: {
                        displayName: "Single Select",
                        description: "If true, when a row is selected, other data is filtered",
                        type: { bool: true },
                        value: true
                    },
                    multiSelect: {
                        displayName: "Multi Select",
                        description: "If true, multiple rows can be selected",
                        type: { bool: true },
                        value: true
                    }
                }
            },
            data: {
                displayName: "Data",
                properties: {
                    inferColumnTypes: {
                        displayName: "Infer Column Types",
                        description: "Infer the coulmn types from the data, vs using the PowerBI defined column types",
                        type: { bool: true },
                        value: false
                    }
                }
            },
            presentation: {
                displayName: "Presentation",
                properties: {
                    stacked: {
                        displayName: "Stacked",
                        description: "If true, when columns are combined, the all columns will be displayed stacked",
                        type: { bool: true },
                        value: true,
                    },
                    values: {
                        displayName: "Values",
                        description: "If the actual values should be displayed under the bars",
                        type: { bool: true },
                        value: false,
                    },
                    histograms: {
                        displayName: "Histograms",
                        description: "Show histograms in the column headers",
                        type: { bool: true },
                        value: true,
                    },
                    animation: {
                        displayName: "Animation",
                        description: "Should the grid be animated when sorting",
                        type: { bool: true },
                        value: true,
                    }
                },
            }
        };

        /**
         * The current set of settings
         */
        private settings : ILineUpVisualSettings = $.extend(true, {}, LineUpVisual.DEFAULT_SETTINGS);

        /**
         * The set of capabilities for the visual
         */
        public static capabilities: VisualCapabilities = {
            dataRoles: [{
                name: 'Values',
                kind: VisualDataRoleKind.Grouping
            }],
            dataViewMappings: [{
                table: {
                    rows: {
                        for: { in: 'Values' },
                        dataReductionAlgorithm: { window: { count: 100 } }
                    },
                    rowCount: { preferred: { min: 1 } }
                }
            }],
            objects: $.extend({
                general: {
                    displayName: data.createDisplayNameGetter('Visual_General'),
                    properties: {
                        // formatString: {
                        //     type: {
                        //         formatting: {
                        //             formatString: true
                        //         }
                        //     },
                        // },
                        // selected: {
                        //     type: { bool: true }
                        // },
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
            }, <any>LineUpVisual.DEFAULT_SETTINGS)
        };

        /**
         * The configuration for the lineup viewer
         */
        private lineUpConfig = {
            svgLayout: {
                mode: 'separate',
                addPlusSigns: true,
                plusSigns: {
                    addStackedColumn: {
                        name: "Add a new Stacked Column",
                        action: "addNewEmptyStackedColumn",
                        x: 0, y: 2,
                        w: 21, h: 21 // LineUpGlobal.htmlLayout.headerHeight/2-4
                    },

                    addColumn: {
                        title: "Add a Column",
                        action: () => this.lineup.addNewSingleColumnDialog(),
                        x: 0, y: 2,
                        w: 21, h: 21 // LineUpGlobal.htmlLayout.headerHeight/2-4
                    }
                }
            },
            interaction: {
                multiselect: (evt) => this.settings.selection.properties.multiSelect.value
            }
        };

        /**
         * The font awesome resource
         */
        private fontAwesome: ExternalCssResource = {
            url: '//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css',
            integrity: 'sha256-3dkvEK0WLHRJ7/Csr0BZjAWxERc5WH7bdeUya2aXxdU= sha512-+L4yy6FRcDGbXJ9mPG8MT' +
                       '/3UCDzwR9gPeyFNMCtInsol++5m3bk2bXWKdZjvybmohrAsn3Ua5x8gfLnbE1YkOg==',
            crossorigin: "anonymous"
        };

        /**
         * The template for the grid
         */
        private template: string = `
            <div>
                <div class="grid"></div>
            </div>
        `.trim();

        /** This is called once when the visual is initialially created */
        public init(options: VisualInitOptions): void {
            super.init(options, this.template, true);
            this.host = options.host;

            // Temporary, because the popups will load outside of the iframe for some reason
            this.buildExternalCssLink(this.fontAwesome).then((ele) => {
                this.container.append($(ele));
            });
            this.selectionManager = new utility.SelectionManager({
                hostServices: options.host
            });
        }

        /** Update is called for data updates, resizes & formatting changes */
        public update(options: VisualUpdateOptions) {
            super.update(options);

            var forceReloadLineup = false;
            this.dataView = options.dataViews[0];
            this.dataViewTable = this.dataView && this.dataView.table;
            if (this.dataViewTable) {

                // Store this to compare
                var oldSettings : ILineUpVisualSettings = $.extend(true, {}, this.settings);

                // Make sure we have the default values
                $.extend(true, this.settings, LineUpVisual.DEFAULT_SETTINGS);

                // Copy over new values
                var newObjs = this.dataView.metadata.objects;
                if (newObjs) {
                    for (var section in newObjs) {
                        var values = newObjs[section];
                        for (var prop in values) {
                            this.settings[section].properties[prop].value = values[prop];
                        }
                    }
                }

                // If the infer types setting has changed
                if (oldSettings.data.properties.inferColumnTypes.value !==
                    this.settings.data.properties.inferColumnTypes.value) {
                    forceReloadLineup = true;
                }

                var colArr = this.dataViewTable.columns.slice(0);
                var data : ILineUpVisualRow[] = [];
                var selectedIds = this.selectionManager.getSelectionIds();
                this.dataViewTable.rows.forEach((row, rowIndex) => {
                    var identity = this.dataView.categorical.categories[0].identity[rowIndex];
                    var newId = SelectionId.createWithId(identity);
                    // The below is busted > 100
                    //var identity = SelectionId.createWithId(this.dataViewTable.identity[rowIndex]);
                    var result : ILineUpVisualRow = {
                        identity: newId,
                        filterExpr: identity.expr,
                        selected: !!_.find(selectedIds, (id : SelectionId) => id.equals(newId))
                    };
                    row.forEach((colInRow, i) => {
                        result[colArr[i].displayName] = colInRow;
                    });
                    data.push(result);
                });

                this.loadData(colArr, data, forceReloadLineup);
                this.loadingMoreData = false;
            }
        }

        /**
         * Enumerates the instances for the objects that appear in the power bi panel
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
            var outProps : { [name: string] : boolean; } = {};
            var inProps = (this.settings[options.objectName] && this.settings[options.objectName].properties) || {};
            for (var key in inProps) {
                outProps[key] = inProps[key].value;
            }
            return [{
                selector: null,
                objectName: options.objectName,
                properties: outProps
            }];
        }

        /**
        * Gets the external css paths used for this visualization
        */
        protected getExternalCssResources() : ExternalCssResource[] {
            return super.getExternalCssResources().concat(this.fontAwesome);
        }

        /**
         * Returns true if the given object is numeric
         */
        private isNumeric = (obj) => (obj - parseFloat(obj) + 1) >= 0;

        /**
         * Derives the desciption for the given column
         */
        private deriveDesc(columns: DataViewMetadataColumn[], data : ILineUpVisualRow[], separator? : string) {
            var cols = columns.map((col) => {
                var r: any = {
                    column: col.displayName,
                    type: 'string'
                };
                if (this.settings.data.properties.inferColumnTypes.value) {
                    var allNumeric = true;
                    var minMax = { min: Number.MAX_VALUE, max: 0 };
                    for (var i = 0; i < data.length; i++) {
                        var value = data[i][r.column];
                        if (value !== 0 && !!value && !this.isNumeric(value)) {
                            allNumeric = false;
                            break;
                        } else {
                            if (+value > minMax.max) {
                                minMax.max = value;
                            } else if (+value < minMax.min) {
                                minMax.min = +value;
                            }
                        }
                    }
                    if (allNumeric) {
                        r.type = 'number';
                        r.domain = [minMax.min, minMax.max];
                    }
                } else {
                    if (col.type.numeric) {
                        r.type = 'number';
                        r.domain = d3.extent(data, (row) => row[col.displayName] && row[col.displayName].length === 0 ? undefined : +(row[col.displayName]));
                    }
                }

                // If is a string, try to see if it is a category
                if (r.type === 'string') {
                    var sset = d3.set(data.map((row) => row[col.displayName]));
                    if (sset.size() <= Math.max(20, data.length * 0.2)) { //at most 20 percent unique values
                        r.type = 'categorical';
                        r.categories = sset.values().sort();
                    }
                }
                return r;
            });
            return {
                separator: separator,
                primaryKey: columns[0].displayName,
                columns: cols
            };
        }

        /**
         * Loads the data into the lineup view
         */
        private loadData(columns: DataViewMetadataColumn[], rows : ILineUpVisualRow[], force : boolean = false) {
            //derive a description file
            var desc = this.deriveDesc(columns, rows);
            var name = 'data';
            this.loadDataImpl(name, desc, rows, force);
        }

        /**
         * Loads the data into the lineup view
         */
        private loadDataImpl(name: string, desc, _data : ILineUpVisualRow[], force : boolean = false) {

            // Update the rendering options
            if (this.lineup) {
                var presProps = this.settings.presentation.properties;
                for (var key in presProps) {
                    if (presProps.hasOwnProperty(key)) {
                        this.lineup.changeRenderingOption(key, presProps[key].value);
                    }
                }
            }

            /* Only reload lineup if we are forced to, if we haven't loaded lineup in the first place, or if the data has changed */
            if (force || !this.lineup || Utils.hasDataChanged(this.lineup.storage.getData(), _data)) {
                var spec: any = {};
                spec.name = name;
                spec.dataspec = desc;
                delete spec.dataspec.file;
                delete spec.dataspec.separator;
                spec.dataspec.data = _data;
                spec.storage = LineUp.createLocalStorage(_data, desc.columns, desc.layout, desc.primaryKey);

                if (this.lineup) {
                    this.lineup.changeDataStorage(spec);
                } else {
                    var finalOptions = $.extend(this.lineUpConfig, { renderingOptions: this.settings.presentation });
                    this.lineup = LineUp.create(spec, d3.select(this.element.find('.grid')[0]), finalOptions);
                    var scrolled = this.lineup.scrolled;
                    var me = this;

                    // The use of `function` is intentional here, we need to pass along the correct scope
                    this.lineup.scrolled = function(...args) {
                        me.onLineUpScrolled.apply(me, args);
                        return scrolled.apply(this, args);
                    };
                }
            }

            this.lineup.select(_data.filter((n) => n.selected));

            var singleSelect = this.settings.selection.properties.singleSelect.value;
            var multiSelect = this.settings.selection.properties.multiSelect.value;
            this.selectionEnabled = singleSelect || multiSelect;

            this.isMultiSelection = multiSelect;
            this.attachEvents();
        }

        /**
         * Listener for when the lineup viewer is scrolled
         */
        private onLineUpScrolled() {
            // truthy this.dataView.metadata.segment means there is more data to be loaded
            if (!this.loadingMoreData && this.dataView.metadata.segment) {
                var scrollElement = $(this.lineup.$container.node()).find('div.lu-wrapper')[0];
                var scrollHeight = scrollElement.scrollHeight;
                var top = scrollElement.scrollTop;
                if (scrollHeight - (top + scrollElement.clientHeight) < 200 && scrollHeight >= 200) {
                    this.loadingMoreData = true;
                    this.host.loadMoreData();
                }
            }
        }


        /**
         * Attaches the line up events to lineup
         */
        private attachEvents() {
            if (this.lineup) {
                // Cleans up events
                this.lineup.listeners.on("multiselected.lineup", null);
                this.lineup.listeners.on("selected.lineup", null);

                if (this.isMultiSelection) {
                    this.lineup.listeners.on("multiselected.lineup", (rows : ILineUpVisualRow[]) => this.onRowSelected(rows));
                } else {
                    this.lineup.listeners.on("selected.lineup", (row : ILineUpVisualRow) => this.onRowSelected(row ? [row] : []));
                }
            }
        }

        /**
         * Selects the given rows
         */
        private onRowSelected(rows : ILineUpVisualRow[]) {
            var filter;
            if (this.selectionEnabled) {
                if (rows && rows.length) {
                    var expr = rows[0].filterExpr;

                    // If we are allowing multiSelect
                    if (rows.length > 0 && this.isMultiSelection) {
                        rows.slice(1).forEach((r) => {
                        expr = powerbi.data.SQExprBuilder.or(expr, r.filterExpr);
                        });
                    }
                    filter = powerbi.data.SemanticFilter.fromSQExpr(expr);
                }

                var objects: powerbi.VisualObjectInstancesToPersist = {
                    merge: [
                        <powerbi.VisualObjectInstance>{
                            objectName: "general",
                            selector: undefined,
                            properties: {
                                "filter": filter
                            }
                        }
                    ]
                };

                // rows are what are currently selected in lineup
                if (rows && rows.length) {
                    var smSelectedIds = this.selectionManager.getSelectionIds();
                    var unselectedRows = smSelectedIds.filter((n) => {
                        return rows.filter((m) => m.identity.equals(n)).length === 0;
                    });
                    var newSelectedRows = rows.filter((n) => {
                        return smSelectedIds.filter((m) => m.equals(n.identity)).length === 0;
                    });

                    // This should work, but there is a bug with selectionManager
                    // newSelectedRows.concat(unselectedRows).forEach((r) => this.selectionManager.select(r.identity, true));

                    // HACK
                    this.selectionManager.clear();
                    rows.forEach((r) => this.selectionManager.select(r.identity, true));
                } else {
                    this.selectionManager.clear();
                }

                this.host.persistProperties(objects);
            }
        }
    }

    /**
     * Represents a setting with a value
     */
    interface IVisualBaseSettingWithValue<T> extends powerbi.data.DataViewObjectPropertyDescriptor {
        value?: T;
    }

    /**
     * Represents the settings for this visual
     */
    interface ILineUpVisualSettings /* extends powerbi.data.DataViewObjectDescriptor */ {
        selection?: {
            displayName?: string;
            properties?: {
                singleSelect?: IVisualBaseSettingWithValue<boolean>;
                multiSelect?: IVisualBaseSettingWithValue<boolean>;
                [propName2 : string] : IVisualBaseSettingWithValue<boolean>;
            }
        };
        data?: {
            displayName?: string;
            properties?: {
                inferColumnTypes?: IVisualBaseSettingWithValue<boolean>;
                [propName2 : string] : IVisualBaseSettingWithValue<boolean>;
            }
        };
        presentation?: {
            displayName?: string;
            properties?: {
                values?: IVisualBaseSettingWithValue<boolean>;
                stacked?: IVisualBaseSettingWithValue<boolean>;
                histograms?: IVisualBaseSettingWithValue<boolean>;
                animation?: IVisualBaseSettingWithValue<boolean>;
                [propName2 : string] : IVisualBaseSettingWithValue<boolean>;
            }
        };

        // For ease of lookup
        [propName : string ] : {
            displayName?: string;
            properties?: {
                [propName2 : string] : IVisualBaseSettingWithValue<any>;
            }
        };
    }
 }
