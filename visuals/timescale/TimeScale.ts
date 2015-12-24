/// <reference path="../../base/references.d.ts"/>

interface TimeScaleDataItem {
    /**
     * The date of the time scale item
     */
    date: Date;

    /**
     * The value on the given date
     */
    value: number;
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
    private timeScalePath : D3.Selection;
    private area : D3.Svg.Area;
    private brush : D3.Svg.Brush;
    private clip : D3.Selection;
    private brushGrip : D3.Selection;
    private context : D3.Selection;
    private brushEle : D3.Selection;
    private xAxis : D3.Selection;
    private _dimensions : { width: number; height: number; } = { width: 500, height: 500 };
    private _eventEmitter = new EventEmitter();
    private _data : TimeScaleDataItem[];

    /**
     * Constructor for the timescale
     */
    constructor(element: JQuery, dimensions?: any) {
        this.element = element;
        this.x = d3.time.scale();
        this.y = d3.scale.linear();
        this.buildTimeScale();
        if (!this.dimensions) {
            this.resizeElements();
        } else {
            this.dimensions = dimensions;
        }
    }

    /**
     * Returns the data contained in this timescale
     */
    public get data() {
        return this._data;
    }

    /**
     * Setter for the data
     */
    public set data(data: TimeScaleDataItem[]) {
        this.x.domain(d3.extent(data.map((d) => d.date)));
        this.y.domain([0, d3.max(data.map((d) => d.value))]);
        this.timeScalePath
            .datum(data)
            .attr("d", this.area);
        this.resizeElements();
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

    /**
     * Sets the currently selected range of dates
     */
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
    private buildTimeScale() {
        this.area = d3.svg.area()
            .interpolate("monotone")
            .x((d) => this.x(d.date))
            .y0(this._dimensions.height)
            .y1((d) => this.y(d.value));

        this.svg = d3.select(this.element[0]).append("svg");

        this.clip = this.svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect");

        this.context = this.svg.append("g")
            .attr("class", "context");

        this.timeScalePath =
            this.context.append("path")
            .attr("class", "area");

        this.xAxis = this.context.append("g")
            .attr("class", "x axis");

        var brushed = _.debounce(() => {
            this.events.raiseEvent("rangeSelected", this.brush.empty() ? [] : this.brush.extent());
        }, 200);

        this.brush = d3.svg.brush()
            .on("brush", brushed);
    }

    /**
     * Resizes all the elements in the graph
     */
    private resizeElements() {
        var margin = { top: 0, right: 10, bottom: 20, left: 10 },
            width = this._dimensions.width - margin.left - margin.right,
            height = this._dimensions.height - margin.top - margin.bottom;

        this.x.range([0, width])
        this.y.range([height, 0]);

        this.area = d3.svg.area()
            .x((d) => this.x(d.date))
            .y0(height)
            .y1((d) => this.y(d.value));

        this.svg
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        this.clip
            .attr("width", width)
            .attr("height", height);

        this.xAxis
            .attr("transform", "translate(0," + height + ")")
            .call(d3.svg.axis().scale(this.x).orient("bottom"));

        this.context
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        this.brush.x(this.x);

        // Need to recreate the brush element for some reason
        d3.selectAll(this.element.find(".x.brush").toArray()).remove();
        this.brushEle = this.context.append("g")
            .attr("class", "x brush")
            .call(this.brush)
            .selectAll("rect")
            .attr("height", height + 7)
            .attr("y", -6);

        this.brushGrip = d3.select(this.element.find(".x.brush")[0])
            .selectAll(".resize").append("rect")
            .attr('x', -3)
            .attr('rx', 2)
            .attr('ry', 2)
            .attr("y", (height / 2) - 15)
            .attr("width", 6)
            .attr("fill", "lightgray")
            .attr("height", 30);
    }
}