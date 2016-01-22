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
        var result = {
            instance: new LineUp(ele),
            element: ele
        };
        result.instance.settings = {
            sorting: {
                external: true
            }
        };
        return result;
    };

    var createFakeData = () => {
        let rows: ILineUpRow[] = [];
        for (var i = 0; i < 100; i++) {
            (function(myId) {
                rows.push({
                    col1: myId,
                    col2: i * (Math.random() * 100),
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

    var loadInstanceWithStackedColumns = () => {
        let { instance, element } = createInstance();
        let data = createFakeData();

        instance.setData(data.data);

        var desc = {
            label: "STACKED_COLUMN",
            width: 10,
            children: [
                { column: 'col2', type: 'number', weight: 100 }
            ]
        };
        var inst = instance.lineupImpl;
        inst.storage.addStackedColumn(desc);
        inst.headerUpdateRequired = true;
        inst.updateAll();
        return {
            instance,
            element,
            data
        };
    };

    var loadInstanceWithStackedColumnsAndClick = () => {
        let { instance, element, data } = loadInstanceWithStackedColumns();

        let headerEle = element.find(".header:contains('STACKED_COLUMN')").find(".labelBG");
        headerEle.click();

        return {
            instance,
            element,
            data
        };
    };

    var loadInstanceWithSettings = (settings: ILineUpSettings) => {
        let { instance, element } = createInstance();
        let { data } = createFakeData();
        instance.setData(data);

        // Set the settings
        instance.settings = settings;
        return {
            instance,
            element
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
                    external: false
                }
            });

            expect(instance.lineupImpl.config.sorting.external).to.be.false;
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

    describe("selectionEnabled", () => {
        it("should be true by default", () => {
            let { instance } = createInstance();
            expect(instance.selectionEnabled).to.be.true;
        });
    });

    describe("isMultiSelect", () => {
        it("should be true by default", () => {
            let { instance } = createInstance();
            expect(instance.isMultiSelect).to.be.true;
        });
    });

    describe("events", () => {
        describe("canLoadMoreData", () => {
            it('should call the event after a scroll to implement virtual scrolling', () => {
                let { instance, element } = createInstance();
                let called = false;
                instance.events.on(LineUp.EVENTS.CAN_LOAD_MORE_DATA, (item) => {
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
                instance.events.on(LineUp.EVENTS.CAN_LOAD_MORE_DATA, (item) => item.result = false);
                instance.events.on(LineUp.EVENTS.LOAD_MORE_DATA, () => called = true);

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
                instance.events.on(LineUp.EVENTS.CAN_LOAD_MORE_DATA, (item) => item.result = true);
                instance.events.on(LineUp.EVENTS.LOAD_MORE_DATA, () => called = true);

                let { data, columns } = createFakeData();
                instance.configuration = { primaryKey: columns[0].column, columns: columns };

                instance.setData(data);

                // Pretend we scrolled
                element.find(".lu-wrapper").trigger("scroll");
                expect(called).to.be.true;
            });
        });

        describe("sortChanged", () => {
            it("should call the event when a column header is clicked", () => {
                let { instance, element } = createInstance();
                let called = false;
                instance.events.on(LineUp.EVENTS.SORT_CHANGED, (item) => {
                    called = true;
                });

                instance.setData(createFakeData().data);

                // Click on de header
                let headerEle = element.find(".header:contains('col1')").find(".labelBG");
                headerEle.click();

                expect(called).to.be.true;
            });

            it("should call the event with the correct params", () => {
                let { instance, element } = createInstance();
                instance.events.on(LineUp.EVENTS.SORT_CHANGED, (colName) => {
                    expect(colName).to.equal("col1");
                });

                instance.setData(createFakeData().data);

                // Click on de header
                let headerEle = element.find(".header:contains('col1')").find(".labelBG");
                headerEle.click();
            });
        });

        describe("selectionChanged", () => {
            it("should call the event when a row is clicked", () => {
                let { instance, element } = createInstance();
                let called = false;
                instance.events.on(LineUp.EVENTS.SELECTION_CHANGED, (selection) => {
                    called = true;
                    expect(selection.length).to.be.equal(1);
                    expect(selection.col1).to.be.equal("FAKE_0"); // Very first row
                });

                instance.setData(createFakeData().data);

                let row = element.find(".row").first();
                row.click();
                expect(called).to.be.true;
            });
            it("should call the event when a row is clicked twice", () => {
                let { instance, element } = createInstance();

                instance.setData(createFakeData().data);

                let row = element.find(".row").first();
                row.click();

                let called = false;
                instance.events.on(LineUp.EVENTS.SELECTION_CHANGED, (selection) => {
                    called = true;
                    expect(selection.length).to.be.equal(0);
                });

                row.click();

                expect(called).to.be.true;
            });
        });

        describe("selection", () => {
            describe("multi", () => {
                it("should update when a row is clicked on", () => {
                    let { instance, element } = createInstance();
                    let { data } = createFakeData();

                    instance.setData(data);

                    let row = element.find(".row").first();
                    row.click();

                    expect(instance.selection[0]['col1']).to.be.equal(data[0]['col1']);
                });

                it("should deselect a row that was selected twice", () => {
                    let { instance, element } = createInstance();
                    instance.setData(createFakeData().data);

                    let row = element.find(".row").first();
                    row.click();
                    row.click();

                    expect(instance.selection.length).to.be.equal(0);
                });

                it("should select multiple rows", () => {
                    let { instance, element } = createInstance();
                    let { data } = createFakeData();

                    instance.setData(data);

                    let rows = element.find(".row");
                    $(rows[0]).click();
                    $(rows[1]).click();

                    expect(instance.selection.length).to.be.equal(2);
                    expect(instance.selection.map((row) => row['col1'])).to.be.deep.equal(data.slice(0, 2).map((r) => r['col1']));
                });

                it('should retain selection when set', () => {
                    let { instance, element } = createInstance();
                    let { data } = createFakeData();
                    instance.setData(data);
                    instance.selection = [data[0]];
                    expect(instance.selection[0]['col1']).to.be.equal(data[0]['col1']);
                });
            });

            describe("single", () => {
                var createInstanceWithSingleSelect = () => {
                    return loadInstanceWithSettings({
                        selection: {
                            singleSelect: true,
                            multiSelect: false
                        }
                    });
                };
                it("should update when a row is clicked on", () => {
                    let { instance, element } = createInstanceWithSingleSelect();
                    let { data } = createFakeData();

                    instance.setData(data);

                    let row = element.find(".row").first();
                    row.click();

                    expect(instance.selection[0]['col1']).to.be.equal(data[0]['col1']);
                });

                it("should deselect a row that was selected twice", () => {
                    let { instance, element } = createInstanceWithSingleSelect();
                    instance.setData(createFakeData().data);

                    let row = element.find(".row").first();
                    row.click();
                    row.click();

                    expect(instance.selection.length).to.be.equal(0);
                });

                it("should select the last row when multiple rows are clicked", () => {
                    let { instance, element } = createInstanceWithSingleSelect();
                    let { data } = createFakeData();

                    instance.setData(data);

                    let rows = element.find(".row");
                    $(rows[0]).click();
                    $(rows[1]).click();

                    expect(instance.selection.length).to.be.equal(1);
                    expect(instance.selection[0]['col1']).to.be.deep.equal(data[1]['col1']);
                });

                it('should retain selection when set', () => {
                    let { instance, element } = createInstanceWithSingleSelect();
                    let { data } = createFakeData();
                    instance.setData(data);
                    instance.selection = [data[0]];
                    expect(instance.selection[0]['col1']).to.be.equal(data[0]['col1']);
                });
            });
        });

        describe("getSortFromLineUp", () => {
            it("does not crash when sorting a stacked column", () => {
                let {instance} = loadInstanceWithStackedColumnsAndClick();
                expect(instance.getSortFromLineUp()).not.to.throw;
            });

            it("returns a 'stack' property when a stack is cliked on", () => {
                let {instance} = loadInstanceWithStackedColumnsAndClick();
                let result = instance.getSortFromLineUp();
                expect(result.stack).to.equal("STACKED_COLUMN");
                expect(result.column).to.be.undefined;
            });
        });

        describe("integration", () => {
            it("saves the configuration when a stacked column is sorted", () => {
                let {instance} = loadInstanceWithStackedColumnsAndClick();
                expect(instance.configuration.sort).to.not.be.undefined;
                expect(instance.configuration.sort.stack).to.be.equal("STACKED_COLUMN");
                expect(instance.configuration.sort.column).to.be.undefined;
            });
            it("saves the configuration when the column layout has been changed", () => {
                let {instance, data } = loadInstanceWithStackedColumns();
                let called = false;
                instance.events.on(LineUp.EVENTS.CONFIG_CHANGED, () => {
                    called = true;
                });

                // Ghetto: Manually say that the columns have changed, usually happens if you drag/drop add columns
                instance.lineupImpl.listeners['columns-changed']();

                expect(called).to.be.true;
            });
            it("loads lineup with a sorted stacked column", () => {
                let {instance, data } = loadInstanceWithStackedColumns();
                instance.configuration = {
                    primaryKey: "col1",
                    columns: data.columns,
                    sort: {
                        stack: "STACKED_COLUMN",
                        asc: true
                    }
                };
                let result = instance.getSortFromLineUp();
                expect(result.stack).to.equal("STACKED_COLUMN");
                expect(result.column).to.be.undefined;
            });
        });
    });
});