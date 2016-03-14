"use strict";
require("../../base/testSetup");
var chai_1 = require("chai");
var ForceGraph_1 = require("./ForceGraph");
var $ = require("jquery");
describe("ForceGraph", function () {
    var parentEle;
    beforeEach(function () {
        global['$'] = require("jquery");
        global['d3'] = require("d3");
        global['_'] = require("underscore");
        parentEle = $('<div></div>');
    });
    afterEach(function () {
        if (parentEle) {
            parentEle.remove();
        }
        parentEle = null;
    });
    var createInstance = function () {
        var ele = $('<div>');
        parentEle.append(ele);
        var result = {
            instance: new ForceGraph_1.ForceGraph(ele),
            element: ele
        };
        result.instance.configuration = {
            animate: false
        };
        return result;
    };
    it("should load", function () {
        createInstance();
    });
    var oneSourceTwoTargets = {
        nodes: [
            { selected: false, name: "SOURCE_NODE" },
            { selected: false, name: "TARGET_NODE_1" },
            { selected: false, name: "TARGET_NODE_2" },
        ],
        links: [{
                source: 0,
                target: 1
            }, {
                source: 0,
                target: 2
            }]
    };
    describe("filterNodes", function () {
        var testFilters = function (instance, element, text, matches) {
            // Set the filter to highlight nodes with "TARGET" in their name
            instance.filterNodes(text, false);
            // The 3 nodes
            var nodes = element.find(".node");
            chai_1.expect(nodes.length).to.eq(3);
            var highlightedNodes = nodes.filter(function (i, node) {
                var trans = $(node).find("circle").attr("transform");
                // TODO: Better check
                return trans && trans.indexOf("scale(3)") >= 0;
            });
            var texts = [];
            highlightedNodes.each(function (i, node) {
                return texts.push($(node).find("text").html());
            });
            chai_1.expect(texts).to.deep.equal(matches);
        };
        it("should visibly change nodes when they match a search string", function () {
            var _a = createInstance(), instance = _a.instance, element = _a.element;
            // Set that datas
            instance.setData(oneSourceTwoTargets);
            testFilters(instance, element, "TARGET", ["TARGET_NODE_1", "TARGET_NODE_2"]);
        });
        it("should visibly change nodes when the search string has changed", function () {
            var _a = createInstance(), instance = _a.instance, element = _a.element;
            // Set that datas
            instance.setData(oneSourceTwoTargets);
            // Set the first
            testFilters(instance, element, "TARGET", ["TARGET_NODE_1", "TARGET_NODE_2"]);
            // Set the second
            testFilters(instance, element, "SOURCE", ["SOURCE_NODE"]);
        });
        it("should visibly change nodes when the search string has changed back to nothing", function () {
            var _a = createInstance(), instance = _a.instance, element = _a.element;
            // Set that datas
            instance.setData(oneSourceTwoTargets);
            // Set the first
            testFilters(instance, element, "TARGET", ["TARGET_NODE_1", "TARGET_NODE_2"]);
            // Set the second
            testFilters(instance, element, "", []);
        });
    });
    describe("selection", function () {
        it("should raise a click event when a node is selected", function () {
            var _a = createInstance(), instance = _a.instance, element = _a.element;
            // Set that datas
            instance.setData(oneSourceTwoTargets);
            var clicked = false;
            instance.events.on("nodeClicked", function (node) {
                clicked = true;
            });
            // Click on a circle
            element.find("circle").first().click();
            // We were clicked on
            chai_1.expect(clicked).to.be.true;
        });
    });
    describe("graph", function () {
        it("should show 3 nodes, when there is a source and two targets", function () {
            var _a = createInstance(), instance = _a.instance, element = _a.element;
            // Set that datas
            instance.setData(oneSourceTwoTargets);
            // The 3 nodes
            chai_1.expect(element.find("circle").length).to.eq(3);
        });
        it("should show two connections, when there is a source and two targets", function () {
            var _a = createInstance(), instance = _a.instance, element = _a.element;
            // Set that datas
            instance.setData(oneSourceTwoTargets);
            // The 2 links
            chai_1.expect(element.find(".link").length).to.eq(2);
        });
    });
});
