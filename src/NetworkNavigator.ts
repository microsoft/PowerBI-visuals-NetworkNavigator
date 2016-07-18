import EventEmitter from "../base/EventEmitter";
import * as $ from "jquery";

/**
 * The min value of charge
 */
const CHARGE_MIN = -100000;

/**
 * The max value of charge
 */
const CHARGE_MAX = 10;

/**
 * The default value of charge
 */
const DEFAULT_CHARGE = -120;

/**
 * The default node size in px
 */
const DEFAULT_NODE_SIZE = 10;

/**
 * The default size of edges in px
 */
const DEFAULT_EDGE_SIZE = 1;

/**
 * Class which represents the force graph
 */
/* @Mixin(EventEmitter) */
export class NetworkNavigator {

    /**
     * The event emitter for this graph
     */
    public events = new EventEmitter();

    private element: JQuery;
    private svg: any;
    private vis: any;
    private force: any;
    private zoom: any;
    private graph: INetworkNavigatorData<INetworkNavigatorNode>;
    private _dimensions: { width: number; height: number; };
    private _selectedNode: INetworkNavigatorNode;
    private _configuration: INetworkNavigatorConfiguration = {
        animate: true,
        linkDistance: 10,
        linkStrength: 2,
        charge: -120,
        gravity: .1,
        labels: false,
        minZoom: .1,
        maxZoom: 100,
        caseInsensitive: true,
        defaultLabelColor: "blue",
        fontSizePT: 8,
    };

    /**
     * My template string
     */
    private template = `
        <div class="graph-container">
            <div class="button-bar">
                <ul>
                    <li class="filter-box" title="Filter Nodes">
                        <input type="text" placeholder="Enter text filter" class="search-filter-box"/>
                    </li>
                    <li class="clear-selection" title="Clear filter and selection">
                        <a>
                            <span class="clear-selection-button"></span>
                        </a>
                    </li>
                </ul>
            </div>
            <div class="svg-container">
            </div>
        </div>
    `.trim().replace(/[\r\n]/g, "");

    /**
     * The svg container
     */
    private svgContainer: JQuery;

    /**
     * Constructor for the network navigator
     */
    constructor(element: JQuery, width = 500, height = 500) {
        this.element = $(this.template);
        element.append(this.element);
        this.svgContainer = this.element.find(".svg-container");
        const filterBox = this.element.find(".search-filter-box");
        this.element.find(".clear-selection").on("click", () => {
            filterBox.val("");
            this.filterNodes(filterBox.val());
            this.updateSelection(undefined);
        });
        filterBox.on("input", () => {
            this.filterNodes(filterBox.val());
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
        this.vis = this.svg.append("svg:g");
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
    public set configuration(newConfig) {
        newConfig = $.extend(true, {}, this._configuration, newConfig);
        if (this.force) {
            let runStart: boolean;

            /**
             * Updates the config value if necessary, and returns true if it was updated
             */
            let updateForceConfig = (name: string, defaultValue: any, maxValue?: any, minValue?: any) => {
                if (newConfig[name] !== this._configuration[name]) {
                    let newValue = maxValue ? Math.min(newConfig[name], maxValue) : newConfig[name];
                    newValue = minValue ? Math.max(newValue, minValue) : newValue;
                    this.force[name](newValue || defaultValue);
                    return true;
                }
            };

            runStart = runStart || updateForceConfig("linkDistance", 10, 1, 30);
            runStart = runStart || updateForceConfig("linkStrength", 2, 20, 1);
            runStart = runStart || updateForceConfig("charge", DEFAULT_CHARGE, CHARGE_MAX, CHARGE_MIN);
            runStart = runStart || updateForceConfig("gravity", .1, 10, .1);

            if (newConfig.minZoom !== this._configuration.minZoom ||
                newConfig.maxZoom !== this._configuration.maxZoom) {
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

            if (newConfig.labels !== this._configuration.labels) {
                this.vis.selectAll(".node text")
                    .style("display", newConfig.labels ? null : "none");
            }

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
    }

    /**
     * Alias for getData
     */
    public get data(): INetworkNavigatorData<INetworkNavigatorNode> {
        return this.getData();
    }

    /**
     * Alias for setData
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
        if (this.vis && d3.event) {
            let zoomEvt = <any>d3.event;
            this.vis.attr("transform", `translate(${zoomEvt.translate}) scale(${zoomEvt.scale})`);
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
        let me = this;
        this.graph = graph;

        this.zoom = d3.behavior.zoom()
            .scaleExtent([this._configuration.minZoom, this._configuration.maxZoom])
            .on("zoom", () => this.redraw());

        let drag = d3.behavior.drag()
            .origin(function(d: any) { return <any>d; })
        // Function is important here
            .on("dragstart", function(d: any) {
                (<any>d3.event).sourceEvent.stopPropagation();
                d3.select(this).classed("dragging", true);
                me.force.stop();
            })
            .on("drag", function(d: any) {
                let evt = <any>d3.event;
                d.px = d.x = evt.x;
                d.py = d.y = evt.y;
                tick();
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
        //  .attr("viewBox", "0 0 " + width + " " + height )
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("pointer-events", "all")
        // Function is important here
            .call(this.zoom);
        this.vis = this.svg.append("svg:g");

        let nodes = graph.nodes.slice();
        let links: { source: any; target: any; }[] = [];
        let bilinks: any[] = [];

        graph.links.forEach(function(link) {
            let s = nodes[link.source];
            let t = nodes[link.target];
            let w = link.value;
            let i = {}; // intermediate node
            nodes.push(<any>i);
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

        let link = this.vis.selectAll(".link")
            .data(bilinks)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke", "gray")
            .style("stroke-width", (d: any) => {
                const width = d[3];
                /* tslint:disable */
                if (typeof width === "undefined" || width === null) {
                /* tslint:enable */
                    return DEFAULT_EDGE_SIZE;
                }
                // Make sure > 0
                return width > 0 ? width : 0;
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
            d3.select(this.svgContainer.find("svg text")[0]).style("display", null);
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
            .style("display", this._configuration.labels ? null : "none");

        // If we are not animating, then play the force quickly
        if (!this.configuration.animate) {
            this.reflow(link, node);
        }

        const tick = () => {
            if (this.configuration.animate) {
                link.attr("x1", (d: any) => d[0].x)
                    .attr("y1", (d: any) => d[0].y)
                    .attr("x2", (d: any) => d[2].x)
                    .attr("y2", (d: any) => d[2].y);
                node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
            }
        };

        this.force.on("tick", tick);
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
        let temp = this.vis.selectAll(".node circle");
        if (animate) {
            temp = temp
                .transition()
                .duration(500)
                .delay(100);
        }
        const pretty = (val: string) => ((val || "") + "");
        temp.attr("transform", (d: any) => {
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
     * Reflows the given links and nodes
     */
    private reflow(link: d3.Selection<any>, node: d3.Selection<any>) {
        let k = 0;
        this.force.start();
        // Alpha measures the amount of movement
        while ((this.force.alpha() > 1e-2) && (k < 150)) {
            this.force.tick();
            k = k + 1;
        }
        this.force.stop();

        link.attr("x1", (d: any) => d[0].x)
            .attr("y1", (d: any) => d[0].y)
            .attr("x2", (d: any) => d[2].x)
            .attr("y2", (d: any) => d[2].y);
        node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    }

    /**
     * Updates the selection based on the given node
     */
    private updateSelection(n? : INetworkNavigatorNode) {
        if (n !== this._selectedNode) {
            if (this._selectedNode) {
                this._selectedNode.selected = false;
            }
            if (n) {
                n.selected = true;
            }
            this._selectedNode = n;
        } else {
            if (this._selectedNode) {
                this._selectedNode.selected = false;
            }
            this._selectedNode = undefined;
        }
        this.events.raiseEvent("selectionChanged", this._selectedNode);
        this.redrawSelection();
    }
}

/**
 * The node in a graph
 */
export interface INetworkNavigatorNode {
    /**
     * The name of the node
     */
    name?: string;

    /**
     * The color of the node
     */
    color?: string;

    /**
     * The color of the label of the node
     */
    labelColor?: string;

    /**
     * The size of the node
     */
    value?: number;

    /**
     * Whether or not the given node is selected
     */
    selected: boolean;
}

/**
 * Represents a link in the network navigator
 */
export interface INetworkNavigatorLink {
    /**
     * The source node, index into the nodes list
     */
    source?: number;

    /**
     * The target node, index into the nodes list
     */
    target?: number;

    /**
     * The value of the link, basically the weight of the edge
     */
    value?: number;
}

/**
 * The data for the network navigator
 */
export interface INetworkNavigatorData<NodeType> {

    /**
     * The list of the nodes in the network navigator
     */
    nodes?: NodeType[];

    /**
     * The links in the network navigator
     */
    links?: INetworkNavigatorLink[];
}

/**
 * Represents the configuration for the network navigator
 */
export interface INetworkNavigatorConfiguration {
    animate?: boolean;
    linkDistance?: number;
    linkStrength?: number;
    charge?: number;
    gravity?: number;
    labels?: boolean;
    minZoom?: number;
    maxZoom?: number;
    defaultLabelColor?: string;
    caseInsensitive?: boolean;

    /**
     * The font size to use in PT
     */
    fontSizePT?: number;
}
