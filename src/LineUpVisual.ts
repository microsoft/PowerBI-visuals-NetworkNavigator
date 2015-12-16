/// <reference path="./references.d.ts"/>
/// <reference path="./lineup.ts"/>
/// <reference path="./VisualBase.ts"/>

declare var LineUp;

module powerbi.visuals {
    export class LineUpVisual extends VisualBase implements IVisual {
        private dataViewTable: DataViewTable;
        private dataView: DataView;
        private host : IVisualHostServices;
        private lineup: any;
        private loadingMoreData = false;

        private static DEFAULT_SETTINGS : LineUpVisualSettings = {
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
            }
        };

        /**
         * The font awesome resource
         */
        private fontAwesome: ExternalCssResource = {
            url: '//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css',
            integrity: 'sha256-3dkvEK0WLHRJ7/Csr0BZjAWxERc5WH7bdeUya2aXxdU= sha512-+L4yy6FRcDGbXJ9mPG8MT/3UCDzwR9gPeyFNMCtInsol++5m3bk2bXWKdZjvybmohrAsn3Ua5x8gfLnbE1YkOg==',
            crossorigin: "anonymous"
        };

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

            // Temporary, because the popups will load outside of the iframe for some reason
            this.container.append(this.buildExternalCssLink(this.fontAwesome));
        }

        /** Update is called for data updates, resizes & formatting changes */
        public update(options: VisualUpdateOptions) {
            super.update(options);
            this.dataView = options.dataViews[0];
            this.dataViewTable = this.dataView.table;

            // Copy over new presentation values
            if (this.dataView.metadata.objects) {
                $.extend(true, this.settings, this.dataView.metadata.objects);
            } else {
                $.extend(true, this.settings, LineUpVisual.DEFAULT_SETTINGS);
            }

            var colArr = this.dataViewTable.columns.map((col) => col.displayName);
            var data : LineUpRow[] = [];
            this.dataViewTable.rows.forEach((row) => {
                var result : LineUpRow = {};
                row.forEach((colInRow, i) => {
                    result[colArr[i]] = colInRow;
                });
                data.push(result);
            });
            this.loadData(colArr, data);
            this.loadingMoreData = false;
        }

        /**
         * Enumerates the instances for the objects that appear in the power bi panel
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
            return [{
                selector: null,
                objectName: 'presentation',
                properties: $.extend({}, this.settings.presentation)
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
        private deriveDesc(columns: string[], data : LineUpRow[], separator?) {
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
        private loadDataImpl(name: string, desc, _data) {
            var spec: any = {};
            spec.name = name;
            spec.dataspec = desc;
            delete spec.dataspec.file;
            delete spec.dataspec.separator;
            spec.dataspec.data = _data;
            spec.storage = LineUp.createLocalStorage(_data, desc.columns, desc.layout, desc.primaryKey);

            if (this.lineup) {
                for (var key in this.settings.presentation) {
                    if (this.settings.presentation.hasOwnProperty(key)) {
                        this.lineup.changeRenderingOption(key, this.settings.presentation[key]);
                    }
                }
                this.lineup.changeDataStorage(spec);
            } else {
                var finalOptions = $.extend(this.lineUpConfig, { renderingOptions: this.settings.presentation });
                this.lineup = LineUp.create(spec, d3.select(this.element.find('.grid')[0]), finalOptions);
                var scrolled = this.lineup.scrolled;
                var me = this;
                this.lineup.scrolled = function(...args) {
                    me.onLineUpScrolled.apply(me, args);
                    return scrolled.apply(this, args);
                };
            }
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
    }

    /**
     * Represents the settings for this visual
     */
    interface LineUpVisualSettings {
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
    interface LineUpRow {
        /**
         * Data for each column in the row
         */
        [columnName: string] : any;
    }
}