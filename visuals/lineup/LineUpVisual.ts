/// <reference path="../../base/references.d.ts"/>
/// <reference path="./lineup.ts"/>

declare var LineUp;

module powerbi.visuals {
    export class LineUpVisual extends VisualBase implements IVisual {
        private dataViewTable: DataViewTable;
        private dataView: DataView;
        private host : IVisualHostServices;
        private lineup: any;
        private loadingMoreData = false;

        private static DEFAULT_SETTINGS : LineUpVisualSettings = {
            selection: {
                singleSelect: true,
                multiSelect: false
            },
            presentation: {
                values: false,
                stacked: true,
                histograms: true,
                animation: true
            }
        };

        /**
         * The current set of settings
         */
        private settings : LineUpVisualSettings = $.extend(true, {}, LineUpVisual.DEFAULT_SETTINGS);

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
                },
            }],
            objects: {
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
                },
                selection: {
                    displayName: "Selection",
                    properties: {
                        singleSelect: {
                            displayName: "Single Select",
                            description: "If true, when a row is selected, other data is filtered",
                            type: { bool: true }
                        },
                        multiSelect: {
                            displayName: "Multi Select",
                            description: "If true, multiple rows can be selected",
                            type: { bool: true }
                        }
                    },
                },
                presentation: {
                    displayName: "Presentation",
                    properties: {
                        stacked: {
                            displayName: "Stacked",
                            description: "If true, when columns are combined, the all columns will be displayed stacked",
                            type: { bool: true }
                        },
                        values: {
                            displayName: "Values",
                            description: "If the actual values should be displayed under the bars",
                            type: { bool: true }
                        },
                        histograms: {
                            displayName: "Histograms",
                            description: "Show histograms in the column headers",
                            type: { bool: true }
                        },
                        animation: {
                            displayName: "Animation",
                            description: "Should the grid be animated when sorting",
                            type: { bool: true }
                        }
                    },
                }
            }
        };

        private interactivityService : IInteractivityService;

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
                multiselect: (evt) => this.settings.selection.multiSelect
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

        private behavior: LineUpBehavior;

        /**
         * The template for the grid
         */
        private template: string = `
            <div>
                <div class="grid"></div>
            </div>
        `;

        /** This is called once when the visual is initialially created */
        public init(options: VisualInitOptions): void {
            super.init(options);
            this.host = options.host;
            this.element.append(this.template);

            this.interactivityService = new InteractivityService(this.host);

            // Temporary, because the popups will load outside of the iframe for some reason
            this.container.append(this.buildExternalCssLink(this.fontAwesome));
            this.behavior = new LineUpBehavior();
        }

        /** Update is called for data updates, resizes & formatting changes */
        public update(options: VisualUpdateOptions) {
            super.update(options);

            this.dataView = options.dataViews[0];
            this.dataViewTable = this.dataView && this.dataView.table;
            if (this.dataViewTable) {
                // Copy over new presentation values
                if (this.dataView.metadata.objects) {
                    $.extend(true, this.settings, this.dataView.metadata.objects);
                } else {
                    $.extend(true, this.settings, LineUpVisual.DEFAULT_SETTINGS);
                }

                var colArr = this.dataViewTable.columns.map((col) => col.displayName);
                var data : LineUpRow[] = [];
                this.dataViewTable.rows.forEach((row, rowIndex) => {
                    var identity = this.dataView.categorical.categories[0].identity[rowIndex];
                    // The below is busted > 100
                    //var identity = SelectionId.createWithId(this.dataViewTable.identity[rowIndex]);
                    var result : LineUpRow = {
                        identity: SelectionId.createWithId(identity),
                        filterExpr: identity.expr,
                        selected: false
                    };
                    row.forEach((colInRow, i) => {
                        result[colArr[i]] = colInRow;
                    });
                    data.push(result);
                });

                this.interactivityService.applySelectionStateToData(data);

                this.loadData(colArr, data);
                this.loadingMoreData = false;
            }
        }

        /**
         * Enumerates the instances for the objects that appear in the power bi panel
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
            return [{
                selector: null,
                objectName: options.objectName,
                properties: $.extend({}, this.settings[options.objectName])
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
        private deriveDesc(columns: string[], data : LineUpRow[], separator? : string) {
            var cols = columns.map((col) => {
                var r: any = {
                    column: col,
                    type: 'string'
                };
                if (this.isNumeric(data[0][col])) {
                    r.type = 'number';
                    r.domain = d3.extent(data, (row) => row[col] && row[col].length === 0 ? undefined : +(row[col]));
                } else {
                    var sset = d3.set(data.map((row) => row[col]));
                    if (sset.size() <= Math.max(20, data.length * 0.2)) { //at most 20 percent unique values
                        r.type = 'categorical';
                        r.categories = sset.values().sort();
                    }
                }
                return r;
            });
            return {
                separator: separator,
                primaryKey: columns[0],
                columns: cols
            };
        }

        /**
         * Loads the data into the lineup view
         */
        private loadData(columns: string[], rows : LineUpRow[]) {
            //derive a description file
            var desc = this.deriveDesc(columns, rows);
            var name = 'data';
            this.loadDataImpl(name, desc, rows);
        }

        /**
         * Loads the data into the lineup view
         */
        private loadDataImpl(name: string, desc, _data : LineUpRow[]) {

            // Update the rendering options
            if (this.lineup) {
                for (var key in this.settings.presentation) {
                    if (this.settings.presentation.hasOwnProperty(key)) {
                        this.lineup.changeRenderingOption(key, this.settings.presentation[key]);
                    }
                }
            }

            if (!this.lineup || this.hasDataChanged(this.lineup.storage.getData(), _data)) {
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

                    if (this.interactivityService) {
                        this.interactivityService.bind(_data, this.behavior, {
                            lineup: this.lineup,
                            host: this.host
                        });
                    }
                }
            }

            this.lineup.select(_data.filter((n) => n.selected));

            var singleSelect = this.settings.selection.singleSelect;
            var multiSelect = this.settings.selection.multiSelect;
            this.behavior.toggleSelection(singleSelect || multiSelect, multiSelect);
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
         * Determins if the old data is different from the new data.
         */
        private hasDataChanged(oldData : LineUpRow[], newData: LineUpRow[]) : boolean {
            if (oldData.length !== newData.length) {
                return true;
            }
            var oldMapped = oldData.map((n) => n.identity);

            // If there are any elements in newdata that arent in the old data
            return _.any(newData, n => !_.any(oldMapped, m => m.equals(n.identity)));
        }
    }

    /**
     * Represents the settings for this visual
     */
    interface LineUpVisualSettings {
        selection: {
            singleSelect?: boolean;
            multiSelect?: boolean;
        };
        presentation: {
            values?: boolean;
            stacked?: boolean;
            histograms?: boolean;
            animation?: boolean;
        };
    }

    /**
     * The lineup data
     */
    interface LineUpRow extends SelectableDataPoint {
        /**
         * Data for each column in the row
         */
        [columnName: string] : any;

        /**
         * The expression that will exactly match this row
         */
        filterExpr : data.SQExpr;
    }

    class LineUpBehavior implements IInteractiveBehavior {
        private selectionEnabled : boolean;
        private isMultiSelection : boolean;
        private selectedRows : LineUpRow[] = [];
        private selectionHandler: ISelectionHandler;
        private lineup: any;
        private host : IVisualHostServices;

        /**
        * Turns on or off selection
        */
        public toggleSelection(enabled: boolean, multi : boolean = false) {
            this.selectionEnabled = enabled;
            this.isMultiSelection = multi;
            this.attachEvents();
        }

        public bindEvents(options: any, selectionHandler: ISelectionHandler) {
            this.selectionHandler = selectionHandler;

            if (options.lineup) {
                this.lineup = options.lineup;
                this.attachEvents();
            }

            this.host = options.host;
        }

        /**
         * Renders the actual selection visually
         */
        public renderSelection(hasSelection: boolean) {
            // TODO
            // if (hasSelection) {
            //     this.selectionHandler.
            // } else {
            //     this.lineup.storage.setSelected([]);
            // }
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
                    this.lineup.listeners.on("multiselected.lineup", (rows : LineUpRow[]) => this.onRowSelected(rows));
                } else {
                    this.lineup.listeners.on("selected.lineup", (row : LineUpRow) => this.onRowSelected(row ? [row] : []));
                }
            }
        }

        /**
         * Selects the given row
         */
        private onRowSelected(rows : LineUpRow[]) {
            var filter;
            if (this.selectionEnabled) {
                if (rows && rows.length) {
                    var expr = rows[0].filterExpr;

                    // If we are allowing multiSelect
                    if (rows.length > 0 && this.isMultiSelection) {
                        rows.slice(1).forEach((r) => {
                        expr = data.SQExprBuilder.or(expr, r.filterExpr);
                        });
                    }
                    filter = powerbi.data.SemanticFilter.fromSQExpr(expr);
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

                // rows are what are currently selected in lineup
                if (rows && rows.length) {
                    var unselectedRows = this.selectedRows.filter((n) => {
                        return rows.filter((m) => m.identity.equals(n.identity)).length === 0;
                    });
                    var newSelectedRows = rows.filter((n) => {
                        return this.selectedRows.filter((m) => m.identity.equals(n.identity)).length === 0;
                    });

                    newSelectedRows.concat(unselectedRows).forEach((r) => this.selectionHandler.handleSelection(r, true));

                    this.selectedRows = rows.slice(0);
                } else {
                    this.selectedRows = [];
                    this.selectionHandler.handleClearSelection();
                }

                this.host.persistProperties(objects);
            }
        }
    }
 }
