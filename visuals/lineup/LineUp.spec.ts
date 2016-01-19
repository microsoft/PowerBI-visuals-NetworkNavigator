require("../../base/testSetup");

import { expect } from "chai";
import { LineUp, ILineUpSettings, ILineUpRow, ILineUpColumn } from "./LineUp";
import * as $ from "jquery";

describe('LineUp', () => {
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
        return {
            instance: new LineUp(ele),
            element: ele
        };
    };

    var createFakeData = () => {
        let rows : ILineUpRow[] = [];
        for (var i = 0; i < 100; i++) {
            (function(myId) {
                rows.push({
                    col1: myId,
                    selected: false,
                    equals: (other) => (myId) === other['col1']
                });
            })("FAKE_" + i);
        }
        return {
            data: rows,
            columns: [{
                /**
                 * The field name of the column
                 */
                column: "col1",

                /**
                 * The displayName for the column
                 */
                label: "Column",

                /**
                 * The type of column it is
                 * values: string|number
                 */
                type: "string"
            }]
        };
    };

    var loadInstanceWithSettings = (settings) => {
        let { instance } = createInstance();
        let { data } = createFakeData();
        instance.setData(data);

        // Set the settings
        instance.settings = settings;
        return {
            instance
        };
    }

    it('should load', function() {
        let { instance } = createInstance();
        expect(instance).to.not.be.undefined;
    });

    describe("settings", () => {
        it('should load some default settings on create', () => {
            let { instance } = createInstance();
            expect(instance.settings).to.not.be.undefined;
        });
        it('should load some merge new settings', () => {
            let { instance } = createInstance();
            let newSettings: ILineUpSettings = {
                presentation: {
                    histograms: false
                }
            };

            // Set the new settings
            instance.settings = newSettings;

            // Make sure that something that wasn't touched is still there
            expect(instance.settings.presentation.values).to.equal(false);

            // Make sure our new value is still there
            expect(instance.settings.presentation.histograms).to.eq(false);
        });
        it('should pass rendering settings to lineupimpl', () => {
            let { instance } = loadInstanceWithSettings({
                presentation: {
                    histograms: false
                }
            });
            expect(instance.lineupImpl.config.renderingOptions.histograms).to.be.false;
        });
        it('should pass sorting settings to lineupimpl', () => {
            let { instance } = loadInstanceWithSettings({
                sorting: {
                    external: true
                }
            });

            expect(instance.lineupImpl.config.sorting.external).to.be.true;
        });
    });

    describe("setData", () => {
        it("should set the data property when setData is called", () => {
            let { instance } = createInstance();
            let { data } = createFakeData();
            instance.setData(data);

            expect(instance.getData()).to.deep.equal(data);
        });
    });


    describe("events", () => {
       describe("canLoadMoreData", () => {
           it('should call the event after a scroll to implement virtual scrolling', () => {
                let { instance, element } = createInstance();
                let called = false;
                instance.events.on("canLoadMoreData", (item) => {
                    called = true;
                });

                let { data } = createFakeData();
                instance.setData(data);

                // Pretend we scrolled
                element.find(".lu-wrapper").trigger("scroll");
                expect(called).to.be.true;
           });

           it('if the listener returns false, the loadMoreData event should not be called', () => {
                let { instance, element } = createInstance();
                let called = false;
                instance.events.on("canLoadMoreData", (item) => item.result = false);
                instance.events.on("loadMoreData", () => called = true);

                let { data, columns } = createFakeData();
                instance.configuration = { primaryKey: columns[0].column, columns: columns };
                instance.setData(data);

                // Pretend we scrolled
                element.find(".lu-wrapper").trigger("scroll");
                expect(called).to.be.false;
           });

           xit('if the listener returns true, the loadMoreData event should be called', () => {
                let { instance, element } = createInstance();
                let called = false;
                instance.events.on("canLoadMoreData", (item) => item.result = true);
                instance.events.on("loadMoreData", () => called = true);

                let { data, columns } = createFakeData();
                instance.configuration = { primaryKey: columns[0].column, columns: columns };

                instance.setData(data);

                // Pretend we scrolled
                element.find(".lu-wrapper").trigger("scroll");
                expect(called).to.be.true;
           });
       });
    });
});