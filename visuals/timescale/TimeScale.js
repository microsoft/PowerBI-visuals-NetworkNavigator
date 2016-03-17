"use strict";
var EventEmitter_1 = require('../../base/EventEmitter');
var $ = require("jquery");
var _ = require("lodash");
var d3 = require("d3");
var DEBOUNCE_TIME = 1000;
/**
* Represents a timescale
*/
/* @Mixin(EventEmitter)*/
var TimeScale = (function () {
    /**
     * Constructor for the timescale
     */
    function TimeScale(element, dimensions) {
        this._dimensions = { width: 500, height: 500 };
        this._eventEmitter = new EventEmitter_1.default();
        this.element = element;
        this.x = d3.time.scale();
        this.y = d3.scale.linear();
        this.buildTimeScale();
        if (!this.dimensions) {
            this.resizeElements();
        }
        else {
            this.dimensions = dimensions;
        }
    }
    Object.defineProperty(TimeScale.prototype, "data", {
        /**
         * Returns the data contained in this timescale
         */
        get: function () {
            return this._data;
        },
        /**
         * Setter for the data
         */
        set: function (data) {
            this._data = data || [];
            this.x.domain(d3.extent(this._data.map(function (d) { return d.date; })));
            this.y.domain([0, d3.max(this._data.map(function (d) { return +d.value; }))]);
            this.resizeElements();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeScale.prototype, "events", {
        /**
         * Gets an event emitter by which events can be listened to
         * Note: Would be nice if we could mixin EventEmitter
         */
        get: function () {
            return this._eventEmitter;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeScale.prototype, "dimensions", {
        /**
         * Gets the dimensions of this timescale
         */
        get: function () {
            return this._dimensions;
        },
        /**
         * Sets the dimensions of this timescale
         */
        set: function (value) {
            $.extend(this._dimensions, value);
            this.resizeElements();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeScale.prototype, "selectedRange", {
        /**
         * Sets the currently selected range of dates
         */
        set: function (range) {
            function selectedRangeChanged() {
                var _this = this;
                // One is set, other is unset
                if ((!range || !this._range) && (range || this._range)) {
                    return true;
                }
                if (range && this._range) {
                    // Length of Array Changed
                    if (range.length !== this._range.length) {
                        return true;
                    }
                    else {
                        // Check each date
                        range.forEach(function (v, i) {
                            if (v.getTime() !== _this._range[i].getTime()) {
                                return true;
                            }
                        });
                    }
                }
                return false;
            }
            function redrawRange() {
                this.brush.extent(range);
                this.brush(d3.select(this.element.find(".brush")[0]));
            }
            if (selectedRangeChanged.bind(this)()) {
                this._range = range;
                if (range && range.length) {
                    redrawRange.bind(this)();
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Builds the initial timescale
     */
    TimeScale.prototype.buildTimeScale = function () {
        var _this = this;
        this.svg = d3.select(this.element[0]).append("svg");
        this.clip = this.svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect");
        this.context = this.svg.append("g")
            .attr("class", "context");
        this.bars = this.context.append("g")
            .attr("class", "bars");
        this.xAxis = this.context.append("g")
            .attr("class", "x axis");
        var brushed = _.debounce(function () {
            _this.events.raiseEvent("rangeSelected", _this.brush.empty() ? [] : _this.brush.extent());
        }, DEBOUNCE_TIME);
        this.brush = d3.svg.brush().on("brush", brushed);
    };
    /**
     * Resizes all the elements in the graph
     */
    TimeScale.prototype.resizeElements = function () {
        var _this = this;
        var margin = { top: 0, right: 10, bottom: 20, left: 10 }, width = this._dimensions.width - margin.left - margin.right, height = this._dimensions.height - margin.top - margin.bottom;
        this.x.range([0, width]);
        this.y.range([height, 0]);
        if (this.bars && this._data) {
            var tmp = this.bars
                .selectAll("rect")
                .data(this._data);
            tmp
                .enter().append("rect");
            tmp
                .attr("transform", function (d, i) {
                var rectHeight = _this.y(0) - _this.y(d.value);
                var x = _this.x(d.date) || 0;
                return "translate(" + x + "," + (height - rectHeight) + ")";
            })
                .attr("width", 2)
                .attr("height", function (d) { return Math.max(0, _this.y(0) - _this.y(d.value)); });
            tmp.exit().remove();
        }
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
    };
    return TimeScale;
}());
exports.TimeScale = TimeScale;
