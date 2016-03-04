var EventEmitter_1 = require('../../base/EventEmitter');
var $ = require("jquery");
/**
 * Class which represents the force graph
 */
/* @Mixin(EventEmitter) */
var ForceGraph = (function () {
    /**
     * Constructor for the force graph
     */
    function ForceGraph(element, width, height) {
        var _this = this;
        if (width === void 0) { width = 500; }
        if (height === void 0) { height = 500; }
        this._configuration = {
            linkDistance: 10,
            linkStrength: 2,
            charge: -120,
            gravity: .1,
            labels: false,
            minZoom: .1,
            maxZoom: 100
        };
        /**
         * The event emitter for this graph
         */
        this.events = new EventEmitter_1.default();
        /**
         * My template string
         */
        this.template = "\n        <div class=\"graph-container\">\n            <div class=\"button-bar\">\n                <ul>\n                    <li class=\"clear-selection\" title=\"Clear Selection\">\n                        <a>\n                            <span class=\"fa-stack\">\n                                <i class=\"fa fa-check fa-stack-1x\"></i>\n                                <i class=\"fa fa-ban fa-stack-2x\"></i>\n                            </span>\n                        </a>\n                    </li>\n                </ul>\n            </div>\n            <div class=\"svg-container\">\n            </div>\n        </div>\n    ".trim().replace(/\n/g, "");
        this.element = $(this.template);
        element.append(this.element);
        this.svgContainer = this.element.find(".svg-container");
        this.element.find(".clear-selection").on("click", function () {
            _this.updateSelection(undefined);
        });
        this.dimensions = { width: width, height: height };
        this.svg = d3.select(this.svgContainer[0]).append("svg")
            .attr("width", width)
            .attr("height", height);
        this.force = d3.layout.force()
            .linkDistance(10)
            .linkStrength(2)
            .gravity(.1)
            .charge(-120)
            .size([width, height]);
        this.vis = this.svg.append('svg:g');
    }
    Object.defineProperty(ForceGraph.prototype, "dimensions", {
        /**
         * Returns the dimensions of this graph
         */
        get: function () {
            return this._dimensions;
        },
        /**
         * Setter for the dimensions
         */
        set: function (newDimensions) {
            this._dimensions = {
                width: newDimensions.width || this.dimensions.width,
                height: newDimensions.height || this.dimensions.height
            };
            if (this.force) {
                this.force.size([this.dimensions.width, this.dimensions.height]);
                this.force.resume();
                this.element.css({ width: this.dimensions.width, height: this.dimensions.height });
                this.svgContainer.css({ width: this.dimensions.width, height: this.dimensions.height });
                this.svg.attr({ width: this.dimensions.width, height: this.dimensions.height });
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ForceGraph.prototype, "configuration", {
        /**
         * Returns the configuration of this graph
         */
        get: function () {
            return this._configuration;
        },
        /**
         * Setter for the configuration
         */
        set: function (newConfig) {
            var _this = this;
            newConfig = $.extend(true, {}, this._configuration, newConfig);
            if (this.force) {
                var runStart;
                /**
                 * Updates the config value if necessary, and returns true if it was updated
                 */
                var updateForceConfig = function (name, defaultValue) {
                    if (newConfig[name] !== _this._configuration[name]) {
                        _this.force[name](newConfig[name] || defaultValue);
                        return true;
                    }
                };
                runStart = runStart || updateForceConfig("linkDistance", 10);
                runStart = runStart || updateForceConfig("linkStrength", 2);
                runStart = runStart || updateForceConfig("charge", -120);
                runStart = runStart || updateForceConfig("gravity", .1);
                if (newConfig.minZoom !== this._configuration.minZoom ||
                    newConfig.maxZoom !== this._configuration.maxZoom) {
                    this.zoom.scaleExtent([newConfig.minZoom, newConfig.maxZoom]);
                }
                if (runStart) {
                    this.force.start();
                }
                if (newConfig.labels !== this._configuration.labels) {
                    this.vis.selectAll(".node text")
                        .style("opacity", newConfig.labels ? 100 : 0);
                }
            }
            this._configuration = newConfig;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ForceGraph.prototype, "data", {
        /**
         * Alias for getData
         */
        get: function () {
            return this.getData();
        },
        /**
         * Alias for setData
         */
        set: function (graph) {
            this.setData(graph);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Redraws the force graph
     */
    ForceGraph.prototype.redraw = function () {
        if (this.vis && d3.event) {
            var zoomEvt = d3.event;
            this.vis.attr("transform", "translate(" + zoomEvt.translate + ") scale(" + zoomEvt.scale + ")");
        }
    };
    /**
     * Gets the data associated with this graph
     */
    ForceGraph.prototype.getData = function () {
        return this.graph;
    };
    /**
     * Sets the data for this force graph
     */
    ForceGraph.prototype.setData = function (graph) {
        var _this = this;
        var me = this;
        this.graph = graph;
        this.zoom = d3.behavior.zoom()
            .scaleExtent([this._configuration.minZoom, this._configuration.maxZoom])
            .on("zoom", function () { return _this.redraw(); });
        var drag = d3.behavior.drag()
            .origin(function (d) { return d; })
            .on("dragstart", function (d) {
            d3.event.sourceEvent.stopPropagation();
            d3.select(this).classed("dragging", true);
            me.force.start();
        })
            .on("drag", function (d) {
            var evt = d3.event;
            d3.select(this).attr("cx", d.x = evt.x).attr("cy", d.y = evt.y);
        })
            .on("dragend", function (d) {
            d3.select(this).classed("dragging", false);
        });
        this.svg.remove();
        this.svg = d3.select(this.svgContainer[0]).append("svg")
            .attr("width", this.dimensions.width)
            .attr("height", this.dimensions.height)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("pointer-events", "all")
            .call(this.zoom);
        this.vis = this.svg.append('svg:g');
        var nodes = graph.nodes.slice();
        var links = [];
        var bilinks = [];
        graph.links.forEach(function (link) {
            var s = nodes[link.source];
            var t = nodes[link.target];
            var w = link.value;
            var i = {}; // intermediate node
            nodes.push(i);
            links.push({ source: s, target: i }, { source: i, target: t });
            bilinks.push([s, i, t, w]);
        });
        this.force.nodes(nodes).links(links).start();
        this.vis.append("svg:defs").selectAll("marker")
            .data(["end"])
            .enter()
            .append("svg:marker")
            .attr("id", String)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 15)
            .attr("refY", 0)
            .attr("markerWidth", 7)
            .attr("markerHeight", 7)
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");
        var link = this.vis.selectAll(".link")
            .data(bilinks)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke", "gray")
            .style("stroke-width", function (d) {
            var w = 0.15 + (d[3] / 500);
            return (w > 3) ? 3 : w;
        })
            .attr("id", function (d) {
            return d[0].name.replace(/\./g, '_').replace(/@/g, '_') + '_' +
                d[2].name.replace(/\./g, '_').replace(/@/g, '_');
        });
        var node = this.vis.selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .call(drag)
            .attr("class", "node");
        node.append("svg:circle")
            .attr("r", function (d) { return Math.log(((d.num || 1) * 100)); })
            .style("fill", function (d) { return d.color; })
            .style("stroke", "red")
            .style("stroke-width", function (d) { return d.selected ? 1 : 0; })
            .style("opacity", 1);
        node.on("click", function (n) {
            _this.events.raiseEvent("nodeClicked", n);
            _this.updateSelection(n);
        });
        node.on("mouseover", function () {
            console.log("mouseover");
            d3.select(_this.svgContainer.find("svg text")[0]).style("opacity", "100");
        });
        node.on("mouseout", function () {
            if (!_this._configuration.labels) {
                d3.select(_this.svgContainer.find("svg text")[0]).style("opacity", "0");
            }
        });
        link.append("svg:text")
            .text(function (d) { return 'yes'; })
            .attr("fill", "black")
            .attr("stroke", "black")
            .attr("font-size", "5pt")
            .attr("stroke-width", "0.5px")
            .attr("class", "linklabel")
            .attr("text-anchor", "middle")
            .style("opacity", function () {
            return 100;
        });
        link.on("click", function (n) { console.log(n); });
        node.append("svg:text")
            .text(function (d) { return d.name; })
            .attr("fill", "blue")
            .attr("stroke", "blue")
            .attr("font-size", "5pt")
            .attr("stroke-width", "0.5px")
            .style("opacity", this._configuration.labels ? 100 : 0);
        this.force.on("tick", function () {
            link.attr("x1", function (d) { return d[0].x; })
                .attr("y1", function (d) { return d[0].y; })
                .attr("x2", function (d) { return d[2].x; })
                .attr("y2", function (d) { return d[2].y; });
            node.attr("transform", function (d) { return ("translate(" + d.x + "," + d.y + ")"); });
        });
    };
    /**
     * Redraws the selections on the nodes
     */
    ForceGraph.prototype.redrawSelection = function () {
        this.vis.selectAll(".node circle")
            .style("stroke-width", function (d) { return d.selected ? 1 : 0; });
    };
    /**
     * Updates the selection based on the given node
     */
    ForceGraph.prototype.updateSelection = function (n) {
        if (n !== this._selectedNode) {
            if (this._selectedNode) {
                this._selectedNode.selected = false;
            }
            if (n) {
                n.selected = true;
            }
            this._selectedNode = n;
        }
        else {
            if (this._selectedNode) {
                this._selectedNode.selected = false;
            }
            this._selectedNode = undefined;
        }
        this.events.raiseEvent('selectionChanged', this._selectedNode);
        this.redrawSelection();
    };
    return ForceGraph;
})();
exports.ForceGraph = ForceGraph;
