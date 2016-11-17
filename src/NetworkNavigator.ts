/*
 * Copyright (c) Microsoft
 * All rights reserved.
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import EventEmitter from "../base/EventEmitter";
import * as $ from "jquery";
import * as d3 from "d3";
import * as CONSTANTS from "./constants";
import { DEFAULT_EDGE_SIZE, DEFAULT_NODE_SIZE, DEFAULT_CONFIGURATION } from "./defaults";
import { INetworkNavigatorData, INetworkNavigatorNode, INetworkNavigatorConfiguration } from "./models";
import template from "./templates/networkNavigator.tmpl";
import * as _ from "lodash";

/* tslint:disable */
const log = require("debug")("NetworkNavigator");
/* tslint:enable */

/**
 * The network navigator is an advanced force graph based component
 */
/* @Mixin(EventEmitter) */
export class NetworkNavigator {

    /**
     * The event emitter for this graph
     */
    public events = new EventEmitter();

    /**
     * The current translate
     */
    public translate: [number, number] = [0, 0];

    /**
     * The current scale
     */
    public scale: number = 1;

    /**
     * The element into which the network navigator is loaded
     */
    private element: JQuery;

    /**
     * The svg container
     */
    private svgContainer: JQuery;

    /**
     * The svg element of the visualization
     */
    private svg: d3.Selection<any>;

    /**
     * The main visual element
     */
    private vis: d3.Selection<any>;

    /**
     * The force graph reference
     */
    private force: d3.layout.Force<any, any>;

    /**
     * The d3 zoom behavior
     */
    private zoom: d3.behavior.Zoom<any>;

    /**
     * The raw graph data given to network navigator
     */
    private graph: INetworkNavigatorData<INetworkNavigatorNode>;

    /**
     * The dimensions of network navigator
     */
    private _dimensions: { width: number; height: number; };

    /**
     * The currently selected node
     */
    private _selectedNode: INetworkNavigatorNode;

    /**
     * The raw configuration for network navigator
     */
    private _configuration: INetworkNavigatorConfiguration = $.extend(true, {}, DEFAULT_CONFIGURATION);

    /**
     * Constructor for the network navigator
     */
    constructor(element: JQuery, width = 500, height = 500) {
        this.element = $(template());
        element.append(this.element);
        this.svgContainer = this.element.find(".svg-container");
        this.element.find(".clear-selection").on("click", () => {
            this.textFilter = "";
            this.updateSelection(undefined);
            this.events.raiseEvent("textFilter", "");
        });

        const handleTextInput = _.debounce(() => {
            this.filterNodes(this.textFilter);
            this.events.raiseEvent("textFilter", this.textFilter);
        }, 500);

        this.filterBox.on("input", handleTextInput);
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
        this.vis = this.svg.append("svg:g");
        this.redraw();
    }

    public get textFilter(): string {
        return this.filterBox.val();
    }

    public set textFilter(value: string) {
        if (value !== this.textFilter) {
            this.filterBox.val(value);
            this.filterNodes(value);
        }
    }

    private get filterBox() {
        return this.element.find(".search-filter-box");
    }

    /**
     * Returns the dimensions of this network navigator
     */
    public get dimensions() {
        return this._dimensions;
    }

    /**
     * Setter for the dimensions
     */
    public set dimensions(newDimensions) {
        this._dimensions = {
            width: newDimensions.width || this.dimensions.width,
            height: newDimensions.height || this.dimensions.height,
        };

        // If we have created the force graph, then size all of our elements
        if (this.force) {
            this.force.size([this.dimensions.width, this.dimensions.height]);
            this.force.resume();
            this.element.css({ width: this.dimensions.width, height: this.dimensions.height });
            this.svgContainer.css({ width: this.dimensions.width, height: this.dimensions.height });
            this.svg.attr({ width: this.dimensions.width, height: this.dimensions.height });
        }
    }

    /**
     * Returns the configuration of this network navigator
     */
    public get configuration() {
        return this._configuration;
    }

    /**
     * Setter for the configuration
     */
    public set configuration(newConfig: INetworkNavigatorConfiguration) {
        newConfig = $.extend(true, {}, this._configuration, newConfig);
        if (this.force) {
            let runStart: boolean;

            /**
             * Updates the config value if necessary, and returns true if it was updated
             */
            let updateForceConfig = (name: string, config: { default: number, min: number, max: number }) => {
                const { default: defaultValue, min, max } = config;
                if (newConfig[name] !== this._configuration[name]) {
                    let newValue = max ? Math.min(newConfig[name], max) : newConfig[name];
                    newValue = min ? Math.max(newValue, min) : newValue;
                    this.force[name](newValue || defaultValue);
                    return true;
                }
            };

            // Bound all of the settings to their appropriate min/maxes
            const { charge, linkDistance, linkStrength, gravity } = CONSTANTS;
            runStart = runStart || updateForceConfig("linkDistance", linkDistance);
            runStart = runStart || updateForceConfig("linkStrength", linkStrength);
            runStart = runStart || updateForceConfig("charge", charge);
            runStart = runStart || updateForceConfig("gravity", gravity);

            // If the zoom has changed at all, then let the zoom behavior know
            if ((newConfig.minZoom !== this._configuration.minZoom ||
                newConfig.maxZoom !== this._configuration.maxZoom) &&
                this.zoom) {
                this.zoom.scaleExtent([newConfig.minZoom, newConfig.maxZoom]);
            }

            if (newConfig.animate) {
                // If we are rerunning start or if we weren't animated, but now we are, then start the force
                if (runStart || !this.configuration.animate) {
                    this.force.start();
                }
            } else {
                this.force.stop();
                if (runStart) {
                    this.reflow(this.vis.selectAll(".link"), this.vis.selectAll(".node"));
                }
            }

            // Rerender the labels if necessary
            if (newConfig.labels !== this._configuration.labels) {
                this.vis.selectAll(".node text")
                    /* tslint:disable */
                    .style("display", newConfig.labels ? null : "none");
                    /* tslint:enable */
            }

            // 
            if (newConfig.caseInsensitive !== this._configuration.caseInsensitive) {
                this.filterNodes(this.element.find(".search-filter-box").val());
            }

            if (newConfig.fontSizePT !== this._configuration.fontSizePT) {
                newConfig.fontSizePT = newConfig.fontSizePT || 8;
                this.vis.selectAll(".node text")
                    .attr("font-size", () => `${newConfig.fontSizePT}pt`);
            }
        }

        this._configuration = newConfig;
        this.redraw();
    }

    /**
     * Getter for the underlying dataset
     */
    public get data(): INetworkNavigatorData<INetworkNavigatorNode> {
        return this.getData();
    }

    /**
     * Setter for the underlying dataset
     */
    public set data(graph: INetworkNavigatorData<INetworkNavigatorNode>) {
        this.setData(graph);
    }

    /**
     * Escapes RegExp
     */
    private static escapeRegExp(str: string) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    /**
     * Redraws the force network navigator
     */
    public redraw() {
        this.renderGraph();
        this.zoomToViewport();
    }

    public renderGraph() {
        if (this.graph) {
            const graph = this.graph;
            const me = this;

            this.zoom = d3.behavior.zoom()
            .scaleExtent([this._configuration.minZoom, this._configuration.maxZoom])
            .on("zoom", () => {
                const event = d3.event as d3.ZoomEvent;
                this.scale = event.scale;
                this.translate = event.translate;
                this.zoomToViewport();
                this.events.raiseEvent("zoomed", {
                    scale: this.scale,
                    translate: this.translate,
                });
            });

            let drag = d3.behavior.drag()
                .origin(function(d: any) { return <any>d; })
                // The use of "function" is important to preserve "this"
                .on("dragstart", function(d: any) {

                    // Stop the force graph animation while we are dragging, otherwise it causes the graph to 
                    // jitter while you drag it
                    (<any>d3.event).sourceEvent.stopPropagation();
                    d3.select(this).classed("dragging", true);
                    me.force.stop();
                })
                .on("drag", function(d: any) {
                    // While we drag, adjust the dragged node, and tell our node renderer to draw a frame
                    let evt = <any>d3.event;
                    d.px = d.x = evt.x;
                    d.py = d.y = evt.y;
                    /* tslint:disable */
                    tick();
                    /* tslint:enable */
                })
                .on("dragend", function(d: any) {
                    d3.select(this).classed("dragging", false);

                    // If we have animation on, then start that beast
                    if (me.configuration.animate) {
                        me.force.resume();
                    }
                });

            this.svg.remove();

            this.svg = d3.select(this.svgContainer[0]).append("svg")
                .attr("width", this.dimensions.width)
                .attr("height", this.dimensions.height)
                .attr("preserveAspectRatio", "xMidYMid meet")
                .attr("pointer-events", "all")
                .call(this.zoom);
            this.vis = this.svg.append("svg:g");

            let nodes = graph.nodes.slice();
            let links: { source: any; target: any; }[] = [];
            let bilinks: any[] = [];

            graph.links.forEach((link) => {
                let s = nodes[link.source];
                let t = nodes[link.target];
                let w = link.value;
                let cw = link.colorValue;
                let i = {}; // intermediate node
                nodes.push(<any>i);
                links.push({ source: s, target: i }, { source: i, target: t });
                bilinks.push([s, i, t, w, cw]);
            });

            this.force.nodes(nodes).links(links);

            // If we have animation on, then start that beast
            if (this.configuration.animate) {
                this.force.start();
            }

            const determineDomain: (
                configMin: number,
                configMax: number,
                fn: (i: any) => number
            ) => [number, number] = (
                configMin: number,
                configMax: number,
                fn: (i: any) => number
            ) => {
                if (configMin !== undefined && configMax !== undefined) {
                    return [configMin, configMax];
                } else {
                    let min: number = undefined;
                    let max: number = undefined;
                    const data = bilinks.map(fn);
                    data.forEach((d: number) => {
                        if (min === undefined || d < min) {
                            min = d;
                        }
                        if (max === undefined || d > max) {
                            max = d;
                        }
                    });
                    return [min, max];
                }
            };

            const edgeColorWeightDomain = determineDomain(
                this.configuration.minEdgeColorWeight,
                this.configuration.maxEdgeColorWeight,
                (b) => b[4]
            );

            const edgeWidthDomain = determineDomain(
                this.configuration.minEdgeWeight,
                this.configuration.maxEdgeWeight,
                (b) => b[3]
            );

            const edgeColorScale = d3.scale.linear()
                .domain(edgeColorWeightDomain)
                .interpolate(d3.interpolateRgb as any)
                .range([
                    this.configuration.edgeStartColor,
                    this.configuration.edgeEndColor,
                ] as any);

            const edgeWidthScale = d3.scale.linear()
                .domain(edgeWidthDomain)
                .interpolate(d3.interpolateNumber as any)
                .range([
                    this.configuration.edgeMinWidth,
                    this.configuration.edgeMaxWidth,
                ]);

            const domainBound = (v: number, domain: [number, number]) => (
                Math.min(domain[1], Math.max(domain[0], v))
            );

            const xform = (v: number, scale: Function, domain: [number, number], defaultValue: any) => {
                const isValuePresent = v !== undefined;
                const boundedValue = isValuePresent ? domainBound(v, domain) : v;
                const result = isValuePresent ?
                    scale(boundedValue) :
                    defaultValue;
                return result;
            };

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

            let link = this.vis.selectAll(".link")
                .data(bilinks)
                .enter().append("line")
                .attr("class", "link")
                .style("stroke", function(d: any) {
                    return xform(
                        d[4],
                        edgeColorScale,
                        edgeColorWeightDomain,
                        "gray"
                    );
                })
                .style("stroke-width", function(d: any) {
                    return xform(
                        d[3],
                        edgeWidthScale,
                        edgeWidthDomain,
                        DEFAULT_EDGE_SIZE
                    );
                })
                .attr("id", function(d: any) {
                    return d[0].name.replace(/\./g, "_").replace(/@/g, "_") + "_" +
                        d[2].name.replace(/\./g, "_").replace(/@/g, "_");
                });

            let node = this.vis.selectAll(".node")
                .data(graph.nodes)
                .enter().append("g")
                .call(drag)
                .attr("class", "node");

            node.append("svg:circle")
                .attr("r", (d: any) => {
                    const width = d.value;
                    /* tslint:disable */
                    if (typeof width === "undefined" || width === null) {
                    /* tslint:enable */
                        return DEFAULT_NODE_SIZE;
                    }
                    // Make sure > 0
                    return width > 0 ? width : 0;
                })
                .style("fill", (d: any) => d.color)
                .style("stroke", "red")
                .style("stroke-width", (d: any) => d.selected ? 1 : 0);

            node.on("click", (n: INetworkNavigatorNode) => this.onNodeClicked(n));

            node.on("mouseover", () => {
                /* tslint:disable */
                d3.select(this.svgContainer.find("svg text")[0]).style("display", null);
                /* tslint:enable */
            });
            node.on("mouseout", () => {
                if (!this._configuration.labels) {
                    d3.select(this.svgContainer.find("svg text")[0]).style("display", "none");
                }
            });

            link.append("svg:text")
                .text((d: any) => "yes")
                .attr("fill", "black")
                .attr("stroke", "black")
                .attr("font-size", () => `${this.configuration.fontSizePT}pt`)
                .attr("stroke-width", "0.5px")
                .attr("class", "linklabel")
                .attr("text-anchor", "middle");

            node.append("svg:text")
                .attr("class", "node-label")
                .text(function(d: any) { return d.name; })
                .attr("fill", (d: any) => d.labelColor || this.configuration.defaultLabelColor)
                .attr("stroke", (d: any) => d.labelColor || this.configuration.defaultLabelColor)
                .attr("font-size", () => `${this.configuration.fontSizePT}pt`)
                .attr("stroke-width", "0.5px")
                /* tslint:disable */
                .style("display", this._configuration.labels ? null : "none");
                /* tslint:enable */

            // If we are not animating, then play the force quickly
            if (!this.configuration.animate) {
                this.reflow(link, node);
            }

            // Our tick function, which actually moves the nodes on the svg based on their x/y positions
            const tick = () => {
                if (this.configuration.animate) {
                    link.attr("x1", (d) => d[0].x)
                        .attr("y1", (d) => d[0].y)
                        .attr("x2", (d) => d[2].x)
                        .attr("y2", (d) => d[2].y);
                    node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
                }
            };

            this.force.on("tick", tick);
        }
    }

    public zoomToViewport() {
        if (this.vis) {
            this.vis.attr("transform", `translate(${this.translate}) scale(${this.scale})`);
        }
    }

    /**
     * Gets the data associated with this graph
     */
    public getData(): INetworkNavigatorData<INetworkNavigatorNode> {
        return this.graph;
    }

    /**
     * Sets the data for this force graph
     */
    public setData(graph: INetworkNavigatorData<INetworkNavigatorNode>) {
        this.graph = graph;
        this.redraw();
    }

    /**
     * Redraws the selections on the nodes
     */
    public redrawSelection() {
        this.vis.selectAll(".node circle")
            .style("stroke-width", (d: any) => d.selected ? 1 : 0);
    }

    /**
     * Redraws the node labels
     */
    public redrawLabels() {
        this.vis.selectAll(".node .node-label")
            .attr("fill", (d: any) => d.labelColor || this.configuration.defaultLabelColor)
            .attr("stroke", (d: any) => d.labelColor || this.configuration.defaultLabelColor);
    }

    /**
     * Filters the nodes to the given string
     */
    public filterNodes(text: string, animate = true) {
        let temp: d3.Selection<any>|d3.Transition<any> = this.vis.selectAll(".node circle");
        if (animate) {
            temp = temp
                .transition()
                .duration(500)
                .delay(100);
        }
        const pretty = (val: string) => ((val || "") + "");
        temp.attr("transform", (d: any) => {
            // If the node matches the search string, then scale it
            let scale = 1;
            const searchStr = d.name || "";
            const flags = this.configuration.caseInsensitive ? "i" : "";
            let regex = new RegExp(NetworkNavigator.escapeRegExp(text), flags);
            if (text && regex.test(pretty(searchStr))) {
                scale = 3;
            }
            return `scale(${scale})`;
        });
    }

    /**
     * Listener for node clicked
     * public for testing, cause phantomjs is puking on triggering clicks
     */
    public onNodeClicked(n: INetworkNavigatorNode) {
        this.events.raiseEvent("nodeClicked", n);
        this.updateSelection(n);
    }

    /**
     * Updates the selection based on the given node
     */
    private updateSelection(n? : INetworkNavigatorNode) {
        let selectedNode = n;
        if (n !== this._selectedNode) {
            if (this._selectedNode) {
                this._selectedNode.selected = false;
            }
            if (n) {
                n.selected = true;
            }
        } else {
            // Toggle the selected node 
            if (this._selectedNode) {
                this._selectedNode.selected = false;
            }
            selectedNode = undefined;
        }
        log("raise selectionChanged", this._selectedNode);
        this.selectedNode = selectedNode;
        this.events.raiseEvent("selectionChanged", this._selectedNode);
    }

    public set selectedNode(n: INetworkNavigatorNode) {
        if (this._selectedNode !== n) {
            if (this._selectedNode) {
                this._selectedNode.selected = false;
            }
            this._selectedNode = n;
            if (n) {
                n.selected = true;
            }
            this.redrawSelection();
        }
    }

    public get selectedNode(): INetworkNavigatorNode {
        return this._selectedNode;
    }

    /**
     * Reflows the given links and nodes
     */
    private reflow(link: d3.Selection<any>, node: d3.Selection<any>) {
        let k = 0;
        this.force.start();
        // Alpha measures the amount of movement
        while ((this.force.alpha() > 1e-2) && (k < 150)) {
            this.force["tick"]();
            k = k + 1;
        }
        this.force.stop();

        link.attr("x1", (d: any) => d[0].x)
            .attr("y1", (d: any) => d[0].y)
            .attr("x2", (d: any) => d[2].x)
            .attr("y2", (d: any) => d[2].y);
        node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    }
}
