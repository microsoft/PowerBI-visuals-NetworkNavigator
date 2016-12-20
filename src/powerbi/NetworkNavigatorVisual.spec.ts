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

// import "essex.powerbi.base/dist/spec/visualHelpers";
import { UpdateType } from "essex.powerbi.base";
import NetworkNavigatorVisual from "./NetworkNavigatorVisual";
import { expect } from "chai";
import * as $ from "jquery";

describe("NetworkNavigatorVisual", () => {
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
        const instance = new NetworkNavigatorVisual(true);
        const element = $("<div>");
        instance.init(<any>{
            element: element,
            host: {
                persistProperties: () => true
            },
            viewport: {
                width: 100,
                height: 100,
            },
        });
        return {
            instance,
            element,
        };
    };
    it("should load", () => {
        expect(createInstance().instance).to.not.be.undefined;
    });
    it("should load the nodes for a simple source/target dataset on update", () => {
        const { instance } = createInstance();

        instance.update(require("./test_cases/simpleSourceTarget.json"));

        const resultNodeNames = instance.myNetworkNavigator.data.nodes.map(n => n.name).sort();
        const expectedNames = [
            "*Staples* Highlighting Markers",
            "Aaron Bergman",
            "Aaron Hawkins",
            "Accessory34",
            "Acme® Preferred Stainless Steel Scissors",
            "Avery 49",
            "Canon S750 Color Inkjet Printer",
            "DAX Two-Tone Rosewood/Black Document Frame, Desktop, 5 x 7",
            "SANFORD Liquid Accent™ Tank-Style Highlighters",
            "V70",
            "Xerox 194",
            "Xerox 1968",
        ];
        expect(resultNodeNames).to.be.deep.equal(expectedNames);
    });

    it("should load the links for a simple source/target dataset on update", () => {
        const { instance } = createInstance();

        instance.onUpdate(require("./test_cases/simpleSourceTarget.json"), 7);

        const data = instance.myNetworkNavigator.data;
        expect(data).to.be.ok;
        expect(data.links).to.be.ok;

        const resultLinks = data.links.map(n => {
            return data.nodes[n.source].name + "->" + data.nodes[n.target].name;
        }).sort();
        const expectedLinks = [
            "Aaron Bergman->Acme® Preferred Stainless Steel Scissors",
            "Aaron Bergman->Avery 49",
            "Aaron Bergman->Canon S750 Color Inkjet Printer",
            "Aaron Bergman->SANFORD Liquid Accent™ Tank-Style Highlighters",
            "Aaron Bergman->V70",
            "Aaron Bergman->Xerox 194",
            "Aaron Bergman->Xerox 1968",
            "Aaron Hawkins->*Staples* Highlighting Markers",
            "Aaron Hawkins->Accessory34",
            "Aaron Hawkins->DAX Two-Tone Rosewood/Black Document Frame, Desktop, 5 x 7",
        ];
        expect(resultLinks).to.be.deep.equal(expectedLinks);
    });

    it("should load the node colors correctly", () => {
        const { instance } = createInstance();

        // instance.update(require("./test_cases/simpleSourceTarget.json"));
        instance.update(require("./test_cases/allFields.json"));

        const result = instance.myNetworkNavigator.data.nodes.map(n => n.color).sort();
        const expected = [
            "rgb(13,15,94)",
            "rgb(38,81,84)",
            "rgb(5,39,75)",
            "rgb(61,21,25)",
            "rgb(61,55,47)",
            "rgb(66,48,54)",
            "rgb(8,99,96)",
            "rgb(80,77,44)",
            "rgb(85,65,64)",
            "rgb(91,33,90)",
        ];
        expect(result).to.be.deep.equal(expected);
    });

    it("should load the node weights correctly", () => {
        const { instance } = createInstance();
        instance.onUpdate(require("./test_cases/allFields.json"), 7);

        const result = instance.myNetworkNavigator.data.nodes.map(n => n.value).sort();
        const expected = [
            1.5845627058297396,
            42.687111441046,
            46.30725539755076,
            57.73851005360484,
            64.91994569078088,
            65.97267149481922,
            66.24268551822752,
            68.77162831369787,
            72.27307700086385,
            8.245853101834655,
        ];
        expect(result).to.be.deep.equal(expected);
    });

    it("should load the node label colors correctly", () => {
        const { instance } = createInstance();
        instance.onUpdate(require("./test_cases/allFields.json"), 7);

        const result = instance.myNetworkNavigator.data.nodes.map(n => n.labelColor).sort();
        const expected = [
            "rgb(11,43,50)",
            "rgb(13,23,82)",
            "rgb(15,81,13)",
            "rgb(2,66,74)",
            "rgb(36,0,49)",
            "rgb(46,28,54)",
            "rgb(51,79,8)",
            "rgb(83,16,32)",
            "rgb(83,4,36)",
            "rgb(88,31,55)",
        ];
        expect(result).to.be.deep.equal(expected);
    });

    it("should load the edge weights correctly", () => {
        const { instance } = createInstance();
        instance.onUpdate(require("./test_cases/allFields.json"), 7);

        const result = instance.myNetworkNavigator.data.links.map(n => n.value).sort();
        const expected = [
            18.8387431204319,
            27.632435807026923,
            28.00233552698046,
            32.912370190024376,
            50.575088267214596,
            64.60952623747289,
            68.25033030472696,
            77.2871546447277,
            89.9409633828327,
            90.69174295291305,
        ];
        expect(result).to.be.deep.equal(expected);
    });

    /**
     * Sets up a settings test
     */
    const settingsTestSetup = () => {
        const { instance, element } = createInstance();
        // instance.update(require("./test_cases/simpleSourceTarget.json"));
        const update = require("./test_cases/complexDataWithSettingsChanged.json");
        instance.onUpdate(update, 4);
        return { instance, element };
    };

    it("should update the 'animate' property when it changes in power bi", () => {
        const { instance } = settingsTestSetup();

        expect(instance.myNetworkNavigator.configuration.animate).to.be.false;
    });

    it("should update the 'maxNodeCount' property when it changes in power bi", () => {
        const { instance } = settingsTestSetup();

        // Max node count in the settings is 1
        expect(instance.myNetworkNavigator.data.nodes.length).to.be.equal(1);
    });

    it("should update the 'linkDistance' property when it changes in power bi", () => {
        const { instance } = settingsTestSetup();

        expect(instance.myNetworkNavigator.configuration.linkDistance).to.be.equal(20);
    });

    it("should update the 'linkStrength' property when it changes in power bi", () => {
        const { instance } = settingsTestSetup();

        expect(instance.myNetworkNavigator.configuration.linkStrength).to.be.equal(1);
    });

    it("should update the 'gravity' property when it changes in power bi", () => {
        const { instance } = settingsTestSetup();

        expect(instance.myNetworkNavigator.configuration.gravity).to.be.equal(.5);
    });

    it("should update the 'charge' property when it changes in power bi", () => {
        const { instance } = settingsTestSetup();

        expect(instance.myNetworkNavigator.configuration.charge).to.be.equal(-10);
    });

    it("should update the 'labels' property when it changes in power bi", () => {
        const { instance } = settingsTestSetup();

        expect(instance.myNetworkNavigator.configuration.labels).to.be.equal(true);
    });

    it("should update the 'minZoom' property when it changes in power bi", () => {
        const { instance } = settingsTestSetup();

        expect(instance.myNetworkNavigator.configuration.minZoom).to.be.equal(.12);
    });

    it("should update the 'maxZoom' property when it changes in power bi", () => {
        const { instance } = settingsTestSetup();

        expect(instance.myNetworkNavigator.configuration.maxZoom).to.be.equal(1000);
    });

    it("should update the 'caseInsensitive' property when it changes in power bi", () => {
        const { instance } = settingsTestSetup();

        expect(instance.myNetworkNavigator.configuration.caseInsensitive).to.be.equal(false);
    });

    describe("defaultLabelColor", () => {
        it("should update the 'defaultLabelColor' property when it changes in power bi", () => {
            const { instance } = settingsTestSetup();
            const expectedColor = "#374649"; // #374649 is pulled from the test case

            expect(instance.myNetworkNavigator.configuration.defaultLabelColor).to.be.equal(expectedColor);
        });

        it("should rerender the graph when the 'defaultLabelColor' setting changes", () => {
            const { instance, element } = createInstance();
            let update = require("./test_cases/complexDataWithLabels.json"); // Basic data
            instance.onUpdate(update, UpdateType.DataAndSettings);

            update = require("./test_cases/complexDataWithLabelColor.json"); // Basic data
            instance.onUpdate(update, UpdateType.Settings);

            const expectedColor = "#374649"; // #374649 is pulled from the test case

            const labels = element.find(".node-label");
            expect(labels.length).to.be.greaterThan(0);

            labels.each((i, ele) => {
                expect($(ele).attr("fill")).to.equal(expectedColor);
            });
        });
    });
});
