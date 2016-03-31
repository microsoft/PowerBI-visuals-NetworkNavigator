(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("jQuery"), require("React"), require("ReactDOM"));
	else if(typeof define === 'function' && define.amd)
		define(["jQuery", "React", "ReactDOM"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("jQuery"), require("React"), require("ReactDOM")) : factory(root["jQuery"], root["React"], root["ReactDOM"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_5__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var React = __webpack_require__(4);
	var ReactDOM = __webpack_require__(5);
	var $ = __webpack_require__(1);
	var NetworkNavigator_1 = __webpack_require__(3);
	;
	/**
	 * Thin wrapper around LineUp
	 */
	var NetworkNavigator = (function (_super) {
	    __extends(NetworkNavigator, _super);
	    function NetworkNavigator() {
	        _super.apply(this, arguments);
	    }
	    NetworkNavigator.prototype.componentDidMount = function () {
	        var _this = this;
	        this.node = ReactDOM.findDOMNode(this);
	        this.networkNavigator = new NetworkNavigator_1.NetworkNavigator($(this.node));
	        this.networkNavigator.events.on("selectionChanged", function (node) {
	            if (_this.props.onSelectionChanged) {
	                _this.props.onSelectionChanged(node);
	            }
	        });
	        this.networkNavigator.dimensions = { width: $(this.node).width(), height: $(this.node).height() };
	        this.renderContent();
	    };
	    NetworkNavigator.prototype.componentWillReceiveProps = function (newProps) {
	        this.renderContent(newProps);
	    };
	    /**
	     * Renders this component
	     */
	    NetworkNavigator.prototype.render = function () {
	        return React.createElement("div", {style: { width: "100%", height: "100%" }});
	    };
	    NetworkNavigator.prototype.renderContent = function (props) {
	        // if called from `componentWillReceiveProps`, then we use the new
	        // props, otherwise use what we already have.
	        props = props || this.props;
	        if (this.selectionListener) {
	            this.selectionListener.destroy();
	        }
	        this.networkNavigator.data = props.graph;
	        if (props.config) {
	            this.networkNavigator.configuration = props.config;
	        }
	        if (props.onSelectionChanged) {
	            this.selectionListener = this.networkNavigator.events.on("selectionChanged", function (rows) { return props.onSelectionChanged(rows); });
	        }
	        else if (this.selectionListener) {
	            this.selectionListener.destroy();
	        }
	    };
	    return NetworkNavigator;
	}(React.Component));
	exports.NetworkNavigator = NetworkNavigator;


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	/**
	 * A mixin that adds support for event emitting
	 */
	var EventEmitter = (function () {
	    function EventEmitter() {
	        this.listeners = {};
	    }
	    /**
	     * Adds an event listener for the given event
	     */
	    EventEmitter.prototype.on = function (name, handler) {
	        var _this = this;
	        var listeners = this.listeners[name] = this.listeners[name] || [];
	        listeners.push(handler);
	        return {
	            destroy: function () {
	                _this.off(name, handler);
	            }
	        };
	    };
	    /**
	     * Removes an event listener for the given event
	     */
	    EventEmitter.prototype.off = function (name, handler) {
	        var listeners = this.listeners[name];
	        if (listeners) {
	            var idx = listeners.indexOf(handler);
	            if (idx >= 0) {
	                listeners.splice(idx, 1);
	            }
	        }
	    };
	    /**
	     * Raises the given event
	     */
	    /*protected*/ EventEmitter.prototype.raiseEvent = function (name) {
	        var _this = this;
	        var args = [];
	        for (var _i = 1; _i < arguments.length; _i++) {
	            args[_i - 1] = arguments[_i];
	        }
	        var listeners = this.listeners[name];
	        if (listeners) {
	            listeners.forEach(function (l) {
	                l.apply(_this, args);
	            });
	        }
	    };
	    return EventEmitter;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = EventEmitter;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var EventEmitter_1 = __webpack_require__(2);
	var $ = __webpack_require__(1);
	/**
	 * Class which represents the force graph
	 */
	/* @Mixin(EventEmitter) */
	var NetworkNavigator = (function () {
	    /**
	     * Constructor for the network navigator
	     */
	    function NetworkNavigator(element, width, height) {
	        var _this = this;
	        if (width === void 0) { width = 500; }
	        if (height === void 0) { height = 500; }
	        this._configuration = {
	            animate: true,
	            linkDistance: 10,
	            linkStrength: 2,
	            charge: -120,
	            gravity: .1,
	            labels: false,
	            minZoom: .1,
	            maxZoom: 100,
	            caseInsensitive: true,
	            defaultLabelColor: "blue"
	        };
	        /**
	         * The event emitter for this graph
	         */
	        this.events = new EventEmitter_1.default();
	        /**
	         * My template string
	         */
	        this.template = "\n        <div class=\"graph-container\">\n            <div class=\"button-bar\">\n                <ul>\n                    <li class=\"filter-box\" title=\"Filter Nodes\">\n                        <input type=\"text\" placeholder=\"Enter text filter\" class=\"search-filter-box\"/>\n                    </li>\n                    <li class=\"clear-selection\" title=\"Clear filter and selection\">\n                        <a>\n                            <span class=\"fa-stack\">\n                                <i class=\"fa fa-check fa-stack-1x\"></i>\n                                <i class=\"fa fa-ban fa-stack-2x\"></i>\n                            </span>\n                        </a>\n                    </li>\n                </ul>\n            </div>\n            <div class=\"svg-container\">\n            </div>\n        </div>\n    ".trim().replace(/[\r\n]/g, "");
	        this.element = $(this.template);
	        element.append(this.element);
	        this.svgContainer = this.element.find(".svg-container");
	        var filterBox = this.element.find(".search-filter-box");
	        this.element.find(".clear-selection").on("click", function () {
	            filterBox.val('');
	            _this.filterNodes(filterBox.val());
	            _this.updateSelection(undefined);
	        });
	        filterBox.on('input', function () {
	            _this.filterNodes(filterBox.val());
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
	    Object.defineProperty(NetworkNavigator.prototype, "dimensions", {
	        /**
	         * Returns the dimensions of this network navigator
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
	    Object.defineProperty(NetworkNavigator.prototype, "configuration", {
	        /**
	         * Returns the configuration of this network navigator
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
	                var updateForceConfig = function (name, defaultValue, maxValue, minValue) {
	                    if (newConfig[name] !== _this._configuration[name]) {
	                        var newValue = maxValue ? Math.min(newConfig[name], maxValue) : newConfig[name];
	                        newValue = minValue ? Math.max(newValue, minValue) : newValue;
	                        _this.force[name](newValue || defaultValue);
	                        return true;
	                    }
	                };
	                runStart = runStart || updateForceConfig("linkDistance", 10, 1, 30);
	                runStart = runStart || updateForceConfig("linkStrength", 2, 20, 1);
	                runStart = runStart || updateForceConfig("charge", -120, -10, -200);
	                runStart = runStart || updateForceConfig("gravity", .1, 10, .1);
	                if (newConfig.minZoom !== this._configuration.minZoom ||
	                    newConfig.maxZoom !== this._configuration.maxZoom) {
	                    this.zoom.scaleExtent([newConfig.minZoom, newConfig.maxZoom]);
	                }
	                if (runStart && this.configuration.animate) {
	                    this.force.start();
	                }
	                else if (!this.configuration.animate) {
	                    this.force.stop();
	                }
	                if (newConfig.labels !== this._configuration.labels) {
	                    this.vis.selectAll(".node text")
	                        .style("opacity", newConfig.labels ? 100 : 0);
	                }
	                if (newConfig.caseInsensitive !== this._configuration.caseInsensitive) {
	                    this.filterNodes(this.element.find(".search-filter-box").val());
	                }
	            }
	            this._configuration = newConfig;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(NetworkNavigator.prototype, "data", {
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
	     * Redraws the force network navigator
	     */
	    NetworkNavigator.prototype.redraw = function () {
	        if (this.vis && d3.event) {
	            var zoomEvt = d3.event;
	            this.vis.attr("transform", "translate(" + zoomEvt.translate + ") scale(" + zoomEvt.scale + ")");
	        }
	    };
	    /**
	     * Gets the data associated with this graph
	     */
	    NetworkNavigator.prototype.getData = function () {
	        return this.graph;
	    };
	    /**
	     * Sets the data for this force graph
	     */
	    NetworkNavigator.prototype.setData = function (graph) {
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
	        this.force.nodes(nodes).links(links);
	        // If we have animation on, then start that beast
	        if (this.configuration.animate) {
	            this.force.start();
	        }
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
	            .attr("class", "node-label")
	            .text(function (d) { return d.name; })
	            .attr("fill", function (d) { return d.labelColor || _this.configuration.defaultLabelColor; })
	            .attr("stroke", function (d) { return d.labelColor || _this.configuration.defaultLabelColor; })
	            .attr("font-size", "5pt")
	            .attr("stroke-width", "0.5px")
	            .style("opacity", this._configuration.labels ? 100 : 0);
	        // If we are not animating, then play the force quickly
	        if (!this.configuration.animate) {
	            var k = 0;
	            this.force.start();
	            // Alpha measures the amount of movement
	            while ((this.force.alpha() > 1e-2) && (k < 150)) {
	                this.force.tick();
	                k = k + 1;
	            }
	            this.force.stop();
	            link.attr("x1", function (d) { return d[0].x; })
	                .attr("y1", function (d) { return d[0].y; })
	                .attr("x2", function (d) { return d[2].x; })
	                .attr("y2", function (d) { return d[2].y; });
	            node.attr("transform", function (d) { return ("translate(" + d.x + "," + d.y + ")"); });
	        }
	        this.force.on("tick", function () {
	            if (_this.configuration.animate) {
	                link.attr("x1", function (d) { return d[0].x; })
	                    .attr("y1", function (d) { return d[0].y; })
	                    .attr("x2", function (d) { return d[2].x; })
	                    .attr("y2", function (d) { return d[2].y; });
	                node.attr("transform", function (d) { return ("translate(" + d.x + "," + d.y + ")"); });
	            }
	        });
	    };
	    /**
	     * Redraws the selections on the nodes
	     */
	    NetworkNavigator.prototype.redrawSelection = function () {
	        this.vis.selectAll(".node circle")
	            .style("stroke-width", function (d) { return d.selected ? 1 : 0; });
	    };
	    /**
	     * Redraws the node labels
	     */
	    NetworkNavigator.prototype.redrawLabels = function () {
	        var _this = this;
	        this.vis.selectAll(".node .node-label")
	            .attr("fill", function (d) { return d.labelColor || _this.configuration.defaultLabelColor; })
	            .attr("stroke", function (d) { return d.labelColor || _this.configuration.defaultLabelColor; });
	    };
	    /**
	     * Filters the nodes to the given string
	     */
	    NetworkNavigator.prototype.filterNodes = function (text, animate) {
	        var _this = this;
	        if (animate === void 0) { animate = true; }
	        var test = "";
	        var temp = this.vis.selectAll(".node circle");
	        if (animate) {
	            temp = temp
	                .transition()
	                .duration(500)
	                .delay(100);
	        }
	        var pretty = function (val) { return ((val || "") + ""); };
	        temp.attr("transform", function (d) {
	            var scale = 1;
	            var searchStr = d.name || "";
	            var flags = _this.configuration.caseInsensitive ? "i" : "";
	            var regex = new RegExp(NetworkNavigator.escapeRegExp(text), flags);
	            if (text && regex.test(pretty(searchStr))) {
	                scale = 3;
	            }
	            return "scale(" + scale + ")";
	        });
	    };
	    /**
	     * Escapes RegExp
	     */
	    NetworkNavigator.escapeRegExp = function (str) {
	        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	    };
	    /**
	     * Updates the selection based on the given node
	     */
	    NetworkNavigator.prototype.updateSelection = function (n) {
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
	    return NetworkNavigator;
	}());
	exports.NetworkNavigator = NetworkNavigator;


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ }
/******/ ])
});
;