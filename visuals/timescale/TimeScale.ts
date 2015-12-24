/// <reference path="../../base/references.d.ts"/>

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
            this.timeScale = new TimeScale(this.element.find(".timescale"));
            this.timeScale.events.on("rangeSelected", (range) => this.onTimeRangeSelected(range));
        }

        /** Update is called for data updates, resizes & formatting changes */
        public update(options: VisualUpdateOptions) {
            super.update(options);

            var startDate;
            var endDate;
            var dataView = options.dataViews && options.dataViews[0];
            if (dataView) {
                var dataViewCategorical = options.dataViews[0].categorical;
                var data =
                    dataViewCategorical.categories[0].values.map((val, i) => ({ date: val, value: dataViewCategorical.categories[1].values[i] }));
                var item: any = dataView.metadata.objects;
                if (dataView.metadata.objects && item.general && item.general.filter
                    && item.general.filter.whereItems && item.general.filter.whereItems[0]
                    && item.general.filter.whereItems && item.general.filter.whereItems[0].condition) {
                    var filterStartDate = item.general.filter.whereItems[0].condition.lower.value;
                    var filterEndDate = item.general.filter.whereItems[0].condition.upper.value;
                    startDate = new Date(filterStartDate.getTime());
                    endDate = new Date(filterEndDate.getTime());
                }
                this.timeColumnIdentity = dataViewCategorical.categories[0].identityFields[0];
                this.timeScale.data = data;
            }
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
     * Represents a timescale
     */
    /* @Mixin(EventEmitter)*/
    class TimeScale {
        private element : JQuery;
        private svg : D3.Selection;
        private x : D3.Scale.TimeScale;
        private y : D3.Scale.LinearScale;
        private area : D3.Svg.Area;
        private brush : D3.Svg.Brush;
        private _dimensions : { width: number; height: number; } = { width: 500, height: 500 };
        private _eventEmitter = new EventEmitter();

        constructor(element: JQuery) {
            this.element = element;
            this.x = d3.time.scale();
            this.y = d3.scale.linear();
        }

        public set data(data: any[]) {
            this.buildTimeScale(data);
        }

        /**
         * Gets an event emitter by which events can be listened to
         * Note: Would be nice if we could mixin EventEmitter
         */
        public get events () {
            return this._eventEmitter;
        }

        /**
         * Gets the dimensions of this timescale
         */
        public get dimensions() {
            return this._dimensions;
        }

        /**
         * Sets the dimensions of this timescale
         */
        public set dimensions(value: any) {
            $.extend(this._dimensions, value);
            this.resizeElements();
        }

        public set selectedRange(dates : Date[]) {
            if (dates && dates.length) {
                this.brush.extent(dates);

                this.brush(d3.select(this.element.find(".brush")[0]));

                // now fire the brushstart, brushmove, and brushend events
                // remove transition so just d3.select(".brush") to just draw
                this.brush["event"](d3.select(this.element.find(".brush")[0]).transition().delay(1000))
            }
        }

        /**
         * Builds the initial timescale
         */
        private buildTimeScale(timeScaleData: any[]) {
            var margin = { top: 0, right: 10, bottom: 20, left: 10 },
                width = this._dimensions.width - margin.left - margin.right,
                height = this._dimensions.height - margin.top - margin.bottom;
            this.x.range([0, this.dimensions.width])
            this.y.range([this.dimensions.height, 0]);

            var parseDate = d3.time.format("%b %Y").parse;

            var xAxis = d3.svg.axis().scale(this.x).orient("bottom"),
                yAxis = d3.svg.axis().scale(this.y).orient("left");

            var brushed = _.debounce(() => {
                this.events.raiseEvent("rangeSelected", this.brush.empty() ? [] : this.brush.extent());
            }, 200);

            this.brush = d3.svg.brush()
                .x(this.x)
                .on("brush", brushed);

            this.area = d3.svg.area()
                .interpolate("monotone")
                .x((d) => this.x(d.date))
                .y0(this._dimensions.height)
                .y1((d) => this.y(d.value));

            if (this.svg) {
                this.svg.remove();
            }

            this.svg = d3.select(this.element.find(".timescale")[0]).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

            this.svg.append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", width)
                .attr("height", height);

            var context = this.svg.append("g")
                .attr("class", "context")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            this.x.domain(d3.extent(timeScaleData.map((d) => d.date)));
            this.y.domain([0, d3.max(timeScaleData.map((d) => d.value))]);

            context.append("path")
                .datum(timeScaleData)
                .attr("class", "area")
                .attr("d", this.area);

            context.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            context.append("g")
                .attr("class", "x brush")
                .call(this.brush)
                .selectAll("rect")
                .attr("y", -6)
                .attr("height", height + 7);

            // this.selectedRange =

            d3.select(this.element.find(".timescale .x.brush")[0])
                .selectAll(".resize").append("rect")
                .attr('x', -3)
                .attr("y", (height / 2) - 15)
                .attr('rx', 2)
                .attr('ry', 2)
                .attr("width", 6)
                .attr("fill", "lightgray")
                .attr("height", 30);
        }

        /**
         * Resizes all the elements in the graph
         */
        private resizeElements() {
            var margin = { top: 0, right: 10, bottom: 20, left: 10 },
                width = this._dimensions.width - margin.left - margin.right,
                height = this._dimensions.height - margin.top - margin.bottom;

            this.x.range([0, this.dimensions.width])
            this.y.range([this.dimensions.height, 0]);

            this.area = d3.svg.area()
                .x((d) => this.x(d.date))
                .y0(this._dimensions.height)
                .y1((d) => this.y(d.value));

            this.svg
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
        }
    }
}
