import { Utils as SpecUtils } from "../../base/spec/visualHelpers";
import { expect } from "chai";
import TimeBrushVisual from "./TimeBrushVisual";
import * as $ from "jquery";

describe('TimeBrushVisual', () => {
    var parentEle;
    beforeEach(() => {
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

    let createVisual = () => {
        let instance = new TimeBrushVisual(true);
        let initOptions = SpecUtils.createFakeInitOptions();
        parentEle.append(initOptions.element);

        instance.init(initOptions);
        return {
            instance,
            element: initOptions.element
        };
    };

    it('should load', () => {
        expect(createVisual()).to.not.be.undefined;
    });
    
    describe("coerceDate", () => {
        it("should coerce 2014 as a date object", () => {
            expect(TimeBrushVisual.coerceDate(2014).getFullYear()).to.eq(2014); 
        });
        it("should coerce '2014' as a date object", () => {
            expect(TimeBrushVisual.coerceDate('2014').getFullYear()).to.eq(2014); 
        });
        it("should coerce iso date '1999-03-16T22:29:03.221Z' as the correct date object", () => {
            let result = TimeBrushVisual.coerceDate('1999-03-16T22:29:03.221Z');
            expect(result.getFullYear()).to.eq(1999);
            expect(result.getDate()).to.eq(16);
            expect(result.getMonth()).to.eq(2); // Months start at 0
            
            // TODO: Time??
        });
        it("should coerce day 22", () => {
            let result = TimeBrushVisual.coerceDate(22);
            expect(result.getDate()).to.eq(22);
        });
        it("should coerce a javascript date into itself", () => {
            let myDate = new Date();
            let result = TimeBrushVisual.coerceDate(myDate);
            expect(result).to.eq(myDate);
        });
        it("should coerce epoch dates", () => {
            let myDate = new Date();
            let result = TimeBrushVisual.coerceDate(myDate.getTime());
            expect(result.getTime()).to.eq(myDate.getTime());
        });
        it("should coerce null/undefined as todays date", () => {
            let result = TimeBrushVisual.coerceDate("");
            let today = new Date();
            expect(result.getFullYear()).to.eq(today.getFullYear());
            expect(result.getDate()).to.eq(today.getDate());
            expect(result.getMonth()).to.eq(today.getMonth()); // Months start at 0
        });
    });
});