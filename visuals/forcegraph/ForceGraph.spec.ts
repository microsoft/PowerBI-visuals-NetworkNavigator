require("../../base/testSetup");

import { expect } from "chai";
import { ForceGraph, IForceGraphData, IForceGraphNode, IForceGraphLink } from "./ForceGraph";
import * as $ from "jquery";

describe("ForceGraph", () => {
    var parentEle;
    beforeEach(() => {
        global['$'] = require("jquery");
        global['d3'] = require("d3");
        global['_'] = require("underscore");
        parentEle = $('<div></div>');
    });

    afterEach(() => {
        if (parentEle) {
            parentEle.remove();
        }
        parentEle = null;
    });

    var createInstance = () => {
        let ele = $('<div>');
        parentEle.append(ele);
        var result = {
            instance: new ForceGraph(ele),
            element: ele
        };
        result.instance.configuration = {
            animate: false
        };
        return result;
    };

    it("should load", () => {
        createInstance();
    });

    const oneSourceTwoTargets : IForceGraphData<IForceGraphNode> = {
        nodes: [
            {  selected: false, name: "SOURCE_NODE" },
            {  selected: false, name: "TARGET_NODE_1" },
            {  selected: false, name: "TARGET_NODE_2" },
        ],
        links: [{
            source: 0,
            target: 1
        }, {
            source: 0,
            target: 2
        }]
    };

    describe("filterNodes", () => {
        const testFilters = (instance, element, text: string, matches: string[]) => {
            // Set the filter to highlight nodes with "TARGET" in their name
            instance.filterNodes(text, false);

            // The 3 nodes
            let nodes = element.find(".node");
            expect(nodes.length).to.eq(3);

            let highlightedNodes = nodes.filter((i, node) => {
                let trans = $(node).find("circle").attr("transform");

                // TODO: Better check
                return trans && trans.indexOf("scale(3)") >= 0;
            });

            let texts = [];
            highlightedNodes.each((i, node) =>
                texts.push($(node).find("text").html())
            );
            expect(texts).to.deep.equal(matches);
        };

        it("should visibly change nodes when they match a search string", () => {
            let { instance, element } = createInstance();

            // Set that datas
            instance.setData(oneSourceTwoTargets);

            testFilters(instance, element, "TARGET", ["TARGET_NODE_1", "TARGET_NODE_2"]);
        });

        it("should visibly change nodes when the search string has changed", () => {
            let { instance, element } = createInstance();

            // Set that datas
            instance.setData(oneSourceTwoTargets);

            // Set the first
            testFilters(instance, element, "TARGET", ["TARGET_NODE_1", "TARGET_NODE_2"]);

            // Set the second
            testFilters(instance, element, "SOURCE", ["SOURCE_NODE"]);
        });

        it("should visibly change nodes when the search string has changed back to nothing", () => {
            let { instance, element } = createInstance();

            // Set that datas
            instance.setData(oneSourceTwoTargets);

            // Set the first
            testFilters(instance, element, "TARGET", ["TARGET_NODE_1", "TARGET_NODE_2"]);

            // Set the second
            testFilters(instance, element, "", []);
        });
    });

    describe("selection", () => {
       it("should raise a click event when a node is selected", () => {
            let { instance, element } = createInstance();

            // Set that datas
            instance.setData(oneSourceTwoTargets);

            let clicked = false;
            instance.events.on("nodeClicked", (node) => {
                clicked = true;
            });

            // Click on a circle
            element.find("circle").first().click();

            // We were clicked on
            expect(clicked).to.be.true;
       });
    });

    describe("graph", () => {
        it("should show 3 nodes, when there is a source and two targets", () => {
            let { instance, element } = createInstance();

            // Set that datas
            instance.setData(oneSourceTwoTargets);

            // The 3 nodes
            expect(element.find("circle").length).to.eq(3);
        });

        it("should show two connections, when there is a source and two targets", () => {
            let { instance, element } = createInstance();

            // Set that datas
            instance.setData(oneSourceTwoTargets);

            // The 2 links
            expect(element.find(".link").length).to.eq(2);
        });
    });
});