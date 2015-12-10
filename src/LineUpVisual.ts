/// <reference path="../lib/powerbi-visuals.d.ts"/>
/// <reference path="../lib/powerbi-externals.d.ts"/>
/// <reference path="./lineup.ts"/>

declare var LineUp;

module powerbi.visuals {
    export class LineUpVisual implements IVisual {
        private dataViewTable: DataViewTable;
        private element: JQuery;
        private lineup: any;

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
              /*  appearance: {
                    displayName: "Appearance",
                    properties: {
                        histogram: {
                            displayName: "Histogram",
                            description: "Hide/Show the histogram below column headers",
                            type: { bool: true }
                        }
                    }
                }
            }*/

            general: {
                displayName: data.createDisplayNameGetter('Visual_General'),
                properties: {
                    formatString: {
                        type: { formatting: { formatString: true } },
                    },
                },
            },
            dataPoint: {
                displayName: data.createDisplayNameGetter('Visual_DataPoint'),
                description: data.createDisplayNameGetter('Visual_DataPointDescription'),
                properties: {
                    defaultColor: {
                        displayName: data.createDisplayNameGetter('Visual_DefaultColor'),
                        type: { fill: { solid: { color: true } } }
                    },
                    fill: {
                        displayName: data.createDisplayNameGetter('Visual_Fill'),
                        type: { fill: { solid: { color: true } } }
                    },
                    fillRule: {
                        displayName: data.createDisplayNameGetter('Visual_Gradient'),
                        type: { fillRule: {} },
                        rule: {
                            inputRole: 'Gradient',
                            output: {
                                property: 'fill',
                                selector: ['Category'],
                            },
                        },
                    }
                }
            },
            labels: {
                displayName: data.createDisplayNameGetter('Visual_DataPointsLabels'),
                description: data.createDisplayNameGetter('Visual_DataPointsLabelsDescription'),
                properties: {
                    show: {
                        displayName: data.createDisplayNameGetter('Visual_Show'),
                        type: { bool: true }
                    },
                    color: {
                        displayName: data.createDisplayNameGetter('Visual_LabelsFill'),
                        description: data.createDisplayNameGetter('Visual_LabelsFillDescription'),
                        type: { fill: { solid: { color: true } } }
                    },
                    labelPosition: {
                        displayName: data.createDisplayNameGetter('Visual_Position'),
                        type: { enumeration: labelPosition.type }
                    },
                    labelDisplayUnits: {
                        displayName: data.createDisplayNameGetter('Visual_DisplayUnits'),
                        description: data.createDisplayNameGetter('Visual_DisplayUnitsDescription'),
                        type: { formatting: { labelDisplayUnits: true } }
                    },
                    labelPrecision: {
                        displayName: data.createDisplayNameGetter('Visual_Precision'),
                        description: data.createDisplayNameGetter('Visual_PrecisionDescription'),
                        placeHolderText: data.createDisplayNameGetter('Visual_Precision_Auto'),
                        type: { numeric: true }
                    },
                    fontSize: {
                        displayName: data.createDisplayNameGetter('Visual_TextSize'),
                        type: { formatting: { fontSize: true } }
                    },
                }
            },
        };

        private menuActions = [
            {name: " new combined", icon: "fa-plus", action: () => {
            this.lineup.addNewStackedColumnDialog();
            }},
            {name: " add single columns", icon: "fa-plus", action: () => {
            this.lineup.addNewSingleColumnDialog();
            }}
        ];

        private static lineUpDemoConfig = {
            svgLayout: {
                mode: 'separate',
                plusSigns: {
                    addStackedColumn: {
                        title: "add stacked column",
                        action: "addNewEmptyStackedColumn",
                        x: 0, y: 2,
                        w: 21, h: 21 // LineUpGlobal.htmlLayout.headerHeight/2-4
                    }
                }
            },
            renderingOptions: {
                stacked: true
            }
        };

        // private template : string = `
        //     <div class="load-container load5">
        //         <div class="loader">Loading...</div>
        //     </div>`;
        private template: string = `
            <div>
                <li` + `nk href="//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha256-3dkvEK0WLHRJ7/Csr0BZjAWxERc5WH7bdeUya2aXxdU= sha512-+L4yy6FRcDGbXJ9mPG8MT/3UCDzwR9gPeyFNMCtInsol++5m3bk2bXWKdZjvybmohrAsn3Ua5x8gfLnbE1YkOg=="crossorigin="anonymous">
                    <div id="lugui-menu">
                        <div style="display: inline-block; float: left; padding-left:5px; padding-top:2px;">
                            <span id="lugui-menu-rendering"> </span>
                            <span id="lugui-menu-actions"> </span>
                        </div>
                    </div>
                <div class="grid"></div>
            </div>
        `;

        /** This is called once when the visual is initialially created */
        public init(options: VisualInitOptions): void {
            this.element = options.element;
            this.element.append(this.template);
        }

        /** Update is called for data updates, resizes & formatting changes */
        public update(options: VisualUpdateOptions) {
            this.dataViewTable = options.dataViews[0].table;
            var colArr = this.dataViewTable.columns.map((col) => col.displayName);
            var data = [];
            this.dataViewTable.rows.forEach((row) => {
                var result = {};
                row.forEach((colInRow, i) => {
                    result[colArr[i]] = colInRow;
                })
                data.push(result);
            });

            this.loadData(colArr, data);
            this.updateMenu();
        }

        private isNumeric = (obj) => (obj - parseFloat(obj) + 1) >= 0;

        private deriveDesc(columns: string[], data, separator?) {
            var cols = columns.map((col) => {
                var r: any = {
                    column: col,
                    type: 'string'
                };
                if (this.isNumeric(data[0][col])) {
                    r.type = 'number';
                    r.domain = d3.extent(data, (row) => row[col].length === 0 ? undefined : +(row[col]));
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

        public loadData(headers, rows) {
            //derive a description file
            var desc = this.deriveDesc(headers, rows);
            var name = 'data';
            this.loadDataImpl(name, desc, rows);
        }

        private loadDataImpl(name: string, desc, _data) {
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
                this.lineup = LineUp.create(spec, d3.select(this.element.find('.grid')[0]), LineUpVisual.lineUpDemoConfig);
            }
        }

        private updateMenu() {
            var config = this.lineup.config;
            var kv = d3.entries(this.lineup.config.renderingOptions);
            var kvNodes = d3.select("#lugui-menu-rendering").selectAll("span").data(kv, (d) => d.key);
            kvNodes.exit().remove();
            kvNodes.enter().append("span").on('click', (d) => {
                this.lineup.changeRenderingOption(d.key, !config.renderingOptions[d.key]);
                this.updateMenu();
            });
            kvNodes.html(function(d) {
                return '<i class="fa ' + (d.value ? 'fa-check-square-o' : 'fa-square-o') + '" ></i> ' + d.key + '&nbsp;&nbsp;'
            });

            d3.select("#lugui-menu-actions").selectAll("span").data(this.menuActions)
                .enter().append("span").html(
                function(d) {
                    return '<i class="fa ' + (d.icon) + '" ></i>' + d.name + '&nbsp;&nbsp;'
                }
                ).on("click", function(d) {
                    d.action.call(d);
                })
        }
    }
}