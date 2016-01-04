/// <reference path="../../base/references.d.ts"/>
/// <reference path="TimeScale.ts"/>

declare var _;
module powerbi.visuals {
    export class TimeScaleVisual extends VisualBase implements IVisual {

        private host : IVisualHostServices;
        private timeColumnIdentity: data.SQExpr;
        private timeScale: TimeScale;

        /**
         * The set of capabilities for the visual
         */
        public static capabilities: VisualCapabilities = {
            dataRoles: [{
                name: 'Times',
                kind: VisualDataRoleKind.Grouping,
                displayName: "Time"
            }, {
                name: 'Values',
                kind: VisualDataRoleKind.Measure,
                displayName: "Values"
            }],
            dataViewMappings: [{
                // conditions: [
                //     { 'Times': { max: 1, min: 1 }, 'Values': { max: 1, min: 1 } },
                // ],
                categorical: {
                    categories: {
                        for: { in: 'Times' },
                        dataReductionAlgorithm: { top: {} }
                    },
                    values: {
                        select: [{ bind: { to: 'Values' } }]
                    }
                },
            }],
            objects: {
                general: {
                    displayName: data.createDisplayNameGetter('Visual_General'),
                    properties: {
                        filter: {
                            type: { filter: {} },
                            rule: {
                                output: {
                                    property: 'selected',
                                    selector: ['Time'],
                                }
                            }
                        },
                    },
                },
            }
        };

        /**
         * The template for the grid
         */
        private template: string = `
            <div>
                <div class="timescale"></div>
            </div>
        `;

        /** This is called once when the visual is initialially created */
        public init(options: VisualInitOptions): void {
            super.init(options);
            this.element.append($(this.template));
            this.host = options.host;
            this.timeScale = new TimeScale(this.element.find(".timescale"), { width: options.viewport.width, height: options.viewport.height });
            this.timeScale.events.on("rangeSelected", (range) => this.onTimeRangeSelected(range));
        }

        /** Update is called for data updates, resizes & formatting changes */
        public update(options: VisualUpdateOptions) {
            super.update(options);

            var startDate;
            var endDate;
            var dataView = options.dataViews && options.dataViews[0];
            if (dataView) {
                var dataViewCategorical = dataView.categorical;
                var data = TimeScaleVisual.converter(dataView);

                // Stash this bad boy for later, so we can filter the time column
                this.timeColumnIdentity = dataViewCategorical.categories[0].identityFields[0];

                var item: any = dataView.metadata.objects;
                if (dataView.metadata.objects && item.general && item.general.filter
                    && item.general.filter.whereItems && item.general.filter.whereItems[0]
                    && item.general.filter.whereItems && item.general.filter.whereItems[0].condition) {
                    var filterStartDate = item.general.filter.whereItems[0].condition.lower.value;
                    var filterEndDate = item.general.filter.whereItems[0].condition.upper.value;
                    startDate = new Date(filterStartDate.getTime());
                    endDate = new Date(filterEndDate.getTime());

                    // If the selection has changed at all, then set it
                    var currentSelection = this.timeScale.selectedRange;
                    if (!currentSelection ||
                       currentSelection.length !== 2 ||
                       startDate !== currentSelection[0] ||
                       endDate !== currentSelection[1]) {
                        this.timeScale.selectedRange = [startDate, endDate];
                    }
                }

                // If the data has changed at all, then update the timeScale
                if (Utils.hasDataChanged(data, <TimeScaleVisualDataItem[]>this.timeScale.data)) {
                    this.timeScale.data = data;
                }

                // If the dimensions changed
                if (!_.isEqual(this.timeScale.dimensions, options.viewport)) {
                    this.timeScale.dimensions = { width: options.viewport.width, height: options.viewport.height };
                }
            }
        }

        /**
         * Converts the data view into a time scale
         */
        public static converter(dataView : DataView) : TimeScaleVisualDataItem[] {
            var items : TimeScaleVisualDataItem[];
            var dataViewCategorical = dataView && dataView.categorical;

            // Must be two columns: times and values
            if (dataViewCategorical &&
                dataViewCategorical.categories.length === 1 &&
                dataViewCategorical.values && dataViewCategorical.values.length) {
                items = dataViewCategorical.categories[0].values.map((val, i) => ({
                    date: val,
                    value: dataViewCategorical.values[0].values[i],
                    identity: SelectionId.createWithId(dataViewCategorical.categories[0].identity[i])
                }))
            }

            return items;
        }

        /**
         * Raised when the time range is selected
         * @param range undefined means no range, otherwise should be [startDate, endDate]
         */
        private onTimeRangeSelected(range: Date[]) {
            var filter;
            if (range && range.length === 2) {
                var filterExpr = powerbi.data.SQExprBuilder.between(
                    this.timeColumnIdentity,
                    powerbi.data.SQExprBuilder.dateTime(range[0]),
                    powerbi.data.SQExprBuilder.dateTime(range[1]));
                filter = powerbi.data.SemanticFilter.fromSQExpr(filterExpr);
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

            // Hack from timeline.ts
            this.host.onSelect({ data: [] });
        }
    }

    /**
     * The data item used by the TimeScaleVisual
     */
    interface TimeScaleVisualDataItem extends TimeScaleDataItem {

        /**
         * The identity for this individual selection item
         */
        identity: SelectionId;
    }
}
