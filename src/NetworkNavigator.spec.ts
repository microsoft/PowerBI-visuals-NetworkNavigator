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

import "../base/testSetup";

import { expect } from "chai";
import { NetworkNavigator } from "./NetworkNavigator";
import { INetworkNavigatorData, INetworkNavigatorNode } from "./models";
import * as $ from "jquery";

describe("NetworkNavigator", () => {
    let parentEle: JQuery;
    beforeEach(() => {
        parentEle = $("<div></div>");
    });

    afterEach(() => {
        if (parentEle) {
            parentEle.remove();
        }
        parentEle = undefined;
    });

    const createInstance = () => {
        let ele = $("<div>");
        parentEle.append(ele);
        let result = {
            instance: new NetworkNavigator(ele),
            element: ele,
        };
        result.instance.configuration = {
            animate: false
        };
        return result;
    };

    const performClick = (node: Element) => {
        let me = document.createEvent("MouseEvent");
        me.initMouseEvent("click", true, true, window, 0,
        10,
        10,
        10,
        10,
        false, false, false, false, 1, node);
        node.dispatchEvent(me);
    };

    /**
     * Performs a drag operation on the given node
     */
    const performDrag = (node: Element, delta: number) => {
        let me = document.createEvent("MouseEvent");
        me.initMouseEvent("mousedown", true, true, window, 0,
        10,
        10,
        10,
        10,
        false, false, false, false, 1, node);
        node.dispatchEvent(me);

        me = document.createEvent("MouseEvent");
        me.initMouseEvent("mousemove", true, true, window, 0,
        10 + delta,
        10 + delta,
        10 + delta,
        10 + delta,
        false, false, false, false, 1, node);
        window.dispatchEvent(me);

        me = document.createEvent("MouseEvent");
        me.initMouseEvent("mouseup", true, true, window, 0,
        10 + delta,
        10 + delta,
        10 + delta,
        10 + delta,
        false, false, false, false, 1, node);
        window.dispatchEvent(me);
    };

    const performZoom = (node: Element, delta: number) => {
        const me = document.createEvent("MouseEvent");
        me.initEvent("mousewheel", true, false);
        me["delta"] = delta;
        me["wheelDelta"] = delta;
        node.dispatchEvent(me);
    };

    it("should load", () => {
        createInstance();
    });

    const oneSourceTwoTargets: INetworkNavigatorData<INetworkNavigatorNode> = {
        nodes: [
            {  selected: false, name: "SOURCE_NODE" },
            {  selected: false, name: "TARGET_NODE_1" },
            {  selected: false, name: "TARGET_NODE_2" },
        ],
        links: [{
            source: 0,
            target: 1,
        }, {
            source: 0,
            target: 2,
        }, ],
    };

    describe("redrawLabels", () => {

        it ("should default the label colors to the color in the configuration", () => {
            const { element, instance } = createInstance();
            const color = "#123456";
            instance.data = oneSourceTwoTargets;
            instance.configuration = {
                defaultLabelColor: color
            };
            instance.redrawLabels();

            const labels = element.find(".node .node-label");
            const colors = labels.map((i, ele) => $(ele).attr("fill")).toArray();
            const expected = oneSourceTwoTargets.nodes.map(n => color);
            expect(colors).to.be.deep.equal(expected);
        });

        it ("should correctly assign label colors to the correct nodes", () => {
            const { element, instance } = createInstance();
            const baseColor = "#12345";
            const myData = {
                links: oneSourceTwoTargets.links.slice(0),
                nodes: oneSourceTwoTargets.nodes.slice(0).map(n => {
                    return $.extend(true, {}, n);
                }),
            };
            instance.configuration = {
                defaultLabelColor: "purple"
            };
            instance.data = myData;

            // Tweak the node colors AFTER we set the data into NetworkNavigator
            myData.nodes.map((n, i) => {
                n.labelColor = baseColor + i;
            });

            // Tell it to rerender the labels
            instance.redrawLabels();

            const labels = element.find(".node .node-label");
            const colors = labels.map((i, ele) => $(ele).attr("fill")).toArray();

            // Basically the nodes have colors in the format: #12345<index>, so node at index 0
            // will have the color #123450
            const expected = myData.nodes.map((n, i) => n.labelColor);
            expect(colors).to.be.deep.equal(expected);
        });
    });

    describe("filterNodes", () => {
        const testFilters = (instance: NetworkNavigator, element: JQuery, text: string, matches: string[]) => {
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

            let texts: string[] = [];
            highlightedNodes.each((i, node) => {
                let textNode = $(node).find("text")[0];
                texts.push(textNode.innerText || textNode.textContent);
            });
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
       it("should raise a click event when a node is selected", (done: Function) => {
            let { instance } = createInstance();

            // Set that datas
            instance.setData(oneSourceTwoTargets);

            let clicked = false;
            instance.events.on("nodeClicked", (node: INetworkNavigatorNode) => {
                clicked = true;
                done();
            });

            instance.onNodeClicked(<any>{});
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

    it ("should default the label colors to the color in the configuration", () => {
        const { element, instance } = createInstance();
        const color = "#123456";
        instance.configuration = {
            defaultLabelColor: color
        };
        instance.data = oneSourceTwoTargets;

        const labels = element.find(".node .node-label");
        const colors = labels.map((i, ele) => $(ele).attr("fill")).toArray();
        const expected = oneSourceTwoTargets.nodes.map(n => color);
        expect(colors).to.be.deep.equal(expected);
    });

    it ("should correctly assign label colors to the correct nodes", () => {
        const { element, instance } = createInstance();
        const baseColor = "#12345";
        const myData = {
            links: oneSourceTwoTargets.links.slice(0),
            nodes: oneSourceTwoTargets.nodes.map((n, i) => {
                return $.extend(true, {}, n, {
                    labelColor: baseColor + i
                });
            }),
        };
        instance.data = myData;

        const labels = element.find(".node .node-label");
        const colors = labels.map((i, ele) => $(ele).attr("fill")).toArray();

        // Basically the nodes have colors in the format: #12345<index>, so node at index 0
        // will have the color #123450
        const expected = myData.nodes.map((n, i) => n.labelColor);
        expect(colors).to.be.deep.equal(expected);
    });

    it("should zoom in when mousewheeled in", () => {
        let { instance, element } = createInstance();

        // Set that datas
        instance.data = oneSourceTwoTargets;

        const svgEle = element.find("svg");
        performZoom(svgEle[0], 1000);

        const transform = svgEle.find("g").attr("transform");
        const regex = /scale\(([\d.]+)\)/;
        expect(regex.test(transform)).to.be.true;
        expect(parseFloat(regex.exec(transform)[1])).to.be.greaterThan(1);
    });

    it("should zoom in when mousewheeled out", () => {
        let { instance, element } = createInstance();

        // Set that datas
        instance.data = oneSourceTwoTargets;

        const svgEle = element.find("svg");
        performZoom(svgEle[0], -1000);

        const transform = svgEle.find("g").attr("transform");
        const regex = /scale\(([\d.]+)\)/;
        expect(regex.test(transform)).to.be.true;
        expect(parseFloat(regex.exec(transform)[1])).to.be.lessThan(1);
    });

    it("should pan when dragged on", () => {
        let { instance, element } = createInstance();

        // Set that datas
        instance.data = oneSourceTwoTargets;

        const svgEle = element.find("svg");
        performDrag(svgEle[0], -1000);

        const transform = svgEle.find("g").attr("transform");
        expect(transform.indexOf("translate(-1000,-1000)") >= 0).to.be.true;
    });

    it("should move the nodes when the nodes are dragged on", () => {
        let { instance, element } = createInstance();

        instance.configuration = {
            animate: true
        };

        // Set that datas
        instance.data = oneSourceTwoTargets;

        const nodeEle = element.find("svg .node");
        performDrag(nodeEle[0], 100000);

        const transform = nodeEle.attr("transform");
        const regex = /translate\(([\d\.]+),[\d\.]+\)/;

        // 2000 delta because force graph changes the precise location a bit
        expect(parseFloat(regex.exec(transform)[1])).to.be.closeTo(100000, 2000);
    });

    const selectTest = (callback?: Function) => {
        let { instance, element } = createInstance();

        // Set that datas
        instance.data = oneSourceTwoTargets;

        const singleNode = element.find("svg .node").first();

        instance.events.on("nodeClicked", (e: INetworkNavigatorNode) => {
            expect(singleNode.text()).to.equal(e.name);
            if (callback) {
                callback();
            }
        });

        performClick(singleNode[0]);

        return { instance, element, singleNode };
    };

    it("should fire the node selected event when a node is clicked on", (done: Function) => {
        selectTest(done);
    });

    it("should set the selected properly correctly", () => {
        const { instance, singleNode } = selectTest();
        const selectedNodeName = singleNode.text().trim();

        instance.data.nodes.forEach(n => {
            expect(n.selected).to.be.eq(n.name === selectedNodeName);
        });
    });

    it("should deselect the node if the same node is selected twice", () => {
        const { instance, singleNode } = selectTest();

        // Same node clicked twice
        performClick(singleNode[0]);

        // Everything should be deselected since we toggled the same node
        instance.data.nodes.forEach(n => {
            expect(n.selected).to.be.false;
        });
    });

    it("should deselect the first node if the a second node is selected", () => {
        const { instance, element } = createInstance();

        instance.data = oneSourceTwoTargets;

        const nodeOne = $(element.find("svg .node")[0]);
        const nodeTwo = $(element.find("svg .node")[1]);
        const selectedNodeName = nodeTwo.text().trim();

        // Click on the first, then the second node
        performClick(nodeOne[0]);
        performClick(nodeTwo[0]);

        // Everything should be deselected since we toggled the same node
        instance.data.nodes.forEach(n => {
            expect(n.selected).to.be.eq(n.name === selectedNodeName);
        });
    });

    it("should set the height of the svg when dimensions have been changed", () => {
        const { instance, element } = createInstance();

        instance.dimensions = { width: 260, height: 245 };

        instance.data = oneSourceTwoTargets;

        expect(element.find("svg").attr("height")).to.be.deep.equal("245");

        instance.dimensions = { width: 123, height: 643 };

        expect(element.find("svg").attr("height")).to.be.deep.equal("643");
    });

    it("should set the height of the svg when dimensions have been changed", () => {
        const { instance, element } = createInstance();

        instance.dimensions = { width: 260, height: 245 };

        instance.data = oneSourceTwoTargets;

        expect(element.find("svg").attr("width")).to.be.deep.equal("260");

        instance.dimensions = { width: 123, height: 245 };

        expect(element.find("svg").attr("width")).to.be.deep.equal("123");
    });
});
