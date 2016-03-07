require("../../base/testSetup");

import { expect } from "chai";
import { AdvancedSlicer } from "./AdvancedSlicer";
import * as $ from "jquery";

describe("AdvancedSlicer", () => {
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
            instance: new AdvancedSlicer(ele),
            element: ele
        };
        return result;
    };

    it("should load", () => {
        createInstance();
    });

    describe("serverSideSearch", () => {
        it("should return the property when set", () => {
            let { instance } = createInstance();
            instance.serverSideSearch = true;
            expect(instance.serverSideSearch).to.eq(true);
        });
    });
});