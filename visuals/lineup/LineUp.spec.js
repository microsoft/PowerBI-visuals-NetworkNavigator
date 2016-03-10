"use strict";
require("../../base/testSetup");
var chai_1 = require("chai");
var LineUp_1 = require("./LineUp");
var $ = require("jquery");
describe('LineUp', function () {
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
            instance: new LineUp_1.LineUp(ele),
            element: ele
        };
        result.instance.settings = {
            presentation: {
                animation: false
            }
        };
        return result;
    };
    var createFakeData = function () {
        var rows = [];
        for (var i = 0; i < 100; i++) {
            (function (myId) {
                rows.push({
                    id: myId,
                    col1: myId,
                    col2: i * (Math.random() * 100),
                    selected: false,
                    equals: function (other) { return (myId) === other['col1']; }
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
    var createProvider = function (data) {
        var firstCall = true;
        var resolver;
        var fakeProvider = {
            canQuery: function (options) {
                return Promise.resolve(true);
            },
            generateHistogram: function () {
                return Promise.resolve([]);
            },
            query: function (options) {
                return new Promise(function (resolve2) {
                    resolve2({
                        total: data.length,
                        results: data
                    });
                    setTimeout(function () {
                        resolver();
                    }, 0);
                });
            }
        };
        return {
            dataLoaded: new Promise(function (resolve) {
                resolver = resolve;
            }),
            provider: fakeProvider
        };
    };
    var loadInstanceWithStackedColumns = function () {
        var _a = createInstance(), instance = _a.instance, element = _a.element;
        var data = createFakeData();
        var providerInfo = createProvider(data.data);
        instance.dataProvider = providerInfo.provider;
        providerInfo.dataLoaded.then(function () {
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
        });
        return {
            instance: instance,
            element: element,
            data: data,
            dataLoaded: providerInfo.dataLoaded
        };
    };
    var loadInstanceWithStackedColumnsAndClick = function () {
        var _a = loadInstanceWithStackedColumns(), instance = _a.instance, element = _a.element, data = _a.data, dataLoaded = _a.dataLoaded;
        dataLoaded.then(function () {
            var headerEle = element.find(".header:contains('STACKED_COLUMN')").find(".labelBG");
            headerEle.click();
        });
        return {
            instance: instance,
            element: element,
            data: data,
            dataLoaded: dataLoaded
        };
    };
    var loadInstanceWithSettings = function (settings) {
        var _a = createInstance(), instance = _a.instance, element = _a.element;
        var data = createFakeData().data;
        var _b = createProvider(data), provider = _b.provider, dataLoaded = _b.dataLoaded;
        instance.dataProvider = provider;
        // Set the settings
        instance.settings = settings;
        return {
            instance: instance,
            element: element,
            dataLoaded: dataLoaded
        };
    };
    it('should load', function () {
        var instance = createInstance().instance;
        chai_1.expect(instance).to.not.be.undefined;
    });
    describe("settings", function () {
        it('should load some default settings on create', function () {
            var instance = createInstance().instance;
            chai_1.expect(instance.settings).to.not.be.undefined;
        });
        it('should load some merge new settings', function () {
            var instance = createInstance().instance;
            var newSettings = {
                presentation: {
                    histograms: false
                }
            };
            // Set the new settings
            instance.settings = newSettings;
            // Make sure that something that wasn't touched is still there
            chai_1.expect(instance.settings.presentation.values).to.equal(false);
            // Make sure our new value is still there
            chai_1.expect(instance.settings.presentation.histograms).to.eq(false);
        });
        it('should pass rendering settings to lineupimpl', function () {
            var _a = loadInstanceWithSettings({
                presentation: {
                    histograms: false
                }
            }), instance = _a.instance, dataLoaded = _a.dataLoaded;
            return dataLoaded.then(function () {
                chai_1.expect(instance.lineupImpl.config.renderingOptions.histograms).to.be.false;
            });
        });
    });
    describe("settings", function () {
        it("should be true by default", function () {
            var instance = createInstance().instance;
            chai_1.expect(instance.settings.selection.multiSelect).to.be.true;
        });
    });
    describe("events", function () {
        describe("sortChanged", function () {
            it("should call the event when a column header is clicked", function () {
                var _a = createInstance(), instance = _a.instance, element = _a.element;
                var called = false;
                instance.events.on(LineUp_1.LineUp.EVENTS.SORT_CHANGED, function (item) {
                    called = true;
                });
                var providerInfo = createProvider(createFakeData().data);
                instance.dataProvider = providerInfo.provider;
                return providerInfo.dataLoaded.then(function () {
                    // Click on de header
                    var headerEle = element.find(".header:contains('col1')").find(".labelBG");
                    headerEle.click();
                    chai_1.expect(called).to.be.true;
                });
            });
            it("should call the event with the correct params", function () {
                var _a = createInstance(), instance = _a.instance, element = _a.element;
                instance.events.on(LineUp_1.LineUp.EVENTS.SORT_CHANGED, function (colName) {
                    chai_1.expect(colName).to.equal("col1");
                });
                var providerInfo = createProvider(createFakeData().data);
                instance.dataProvider = providerInfo.provider;
                return providerInfo.dataLoaded.then(function () {
                    // Click on de header
                    var headerEle = element.find(".header:contains('col1')").find(".labelBG");
                    headerEle.click();
                });
            });
        });
        describe("selectionChanged", function () {
            it("should call the event when a row is clicked", function () {
                var _a = createInstance(), instance = _a.instance, element = _a.element;
                var called = false;
                instance.events.on(LineUp_1.LineUp.EVENTS.SELECTION_CHANGED, function (selection) {
                    called = true;
                    chai_1.expect(selection.length).to.be.equal(1);
                    chai_1.expect(selection.col1).to.be.equal("FAKE_0"); // Very first row
                });
                var providerInfo = createProvider(createFakeData().data);
                instance.dataProvider = providerInfo.provider;
                return providerInfo.dataLoaded.then(function () {
                    var row = element.find(".row").first();
                    row.click();
                    chai_1.expect(called).to.be.true;
                });
            });
            it("should call the event when a row is clicked twice", function () {
                var _a = createInstance(), instance = _a.instance, element = _a.element;
                var providerInfo = createProvider(createFakeData().data);
                instance.dataProvider = providerInfo.provider;
                return providerInfo.dataLoaded.then(function () {
                    var row = element.find(".row").first();
                    row.click();
                    var called = false;
                    instance.events.on(LineUp_1.LineUp.EVENTS.SELECTION_CHANGED, function (selection) {
                        called = true;
                        chai_1.expect(selection.length).to.be.equal(0);
                    });
                    row.click();
                    chai_1.expect(called).to.be.true;
                });
            });
        });
        describe("selection", function () {
            describe("multi", function () {
                it("should update when a row is clicked on", function () {
                    var _a = createInstance(), instance = _a.instance, element = _a.element;
                    var data = createFakeData().data;
                    var providerInfo = createProvider(createFakeData().data);
                    instance.dataProvider = providerInfo.provider;
                    return providerInfo.dataLoaded.then(function () {
                        var row = element.find(".row").first();
                        row.click();
                        chai_1.expect(instance.selection[0]['col1']).to.be.equal(data[0]['col1']);
                    });
                });
                it("should deselect a row that was selected twice", function () {
                    var _a = createInstance(), instance = _a.instance, element = _a.element;
                    var providerInfo = createProvider(createFakeData().data);
                    instance.dataProvider = providerInfo.provider;
                    return providerInfo.dataLoaded.then(function () {
                        var row = element.find(".row").first();
                        row.click();
                        row.click();
                        chai_1.expect(instance.selection.length).to.be.equal(0);
                    });
                });
                it("should select multiple rows", function () {
                    var _a = createInstance(), instance = _a.instance, element = _a.element;
                    var data = createFakeData().data;
                    var providerInfo = createProvider(createFakeData().data);
                    instance.dataProvider = providerInfo.provider;
                    return providerInfo.dataLoaded.then(function () {
                        var rows = element.find(".row");
                        $(rows[0]).click();
                        $(rows[1]).click();
                        chai_1.expect(instance.selection.length).to.be.equal(2);
                        chai_1.expect(instance.selection.map(function (row) { return row['col1']; })).to.be.deep.equal(data.slice(0, 2).map(function (r) { return r['col1']; }));
                    });
                });
                it('should retain selection when set', function () {
                    var _a = createInstance(), instance = _a.instance, element = _a.element;
                    var data = createFakeData().data;
                    var providerInfo = createProvider(createFakeData().data);
                    instance.dataProvider = providerInfo.provider;
                    return providerInfo.dataLoaded.then(function () {
                        instance.selection = [data[0]];
                        chai_1.expect(instance.selection[0]['col1']).to.be.equal(data[0]['col1']);
                    });
                });
            });
            describe("single", function () {
                var createInstanceWithSingleSelect = function () {
                    return loadInstanceWithSettings({
                        selection: {
                            singleSelect: true,
                            multiSelect: false
                        }
                    });
                };
                it("should update when a row is clicked on", function () {
                    var _a = createInstanceWithSingleSelect(), instance = _a.instance, element = _a.element;
                    var data = createFakeData().data;
                    var providerInfo = createProvider(createFakeData().data);
                    instance.dataProvider = providerInfo.provider;
                    return providerInfo.dataLoaded.then(function () {
                        var row = element.find(".row").first();
                        row.click();
                        chai_1.expect(instance.selection[0]['col1']).to.be.equal(data[0]['col1']);
                    });
                });
                it("should deselect a row that was selected twice", function () {
                    var _a = createInstanceWithSingleSelect(), instance = _a.instance, element = _a.element;
                    var providerInfo = createProvider(createFakeData().data);
                    instance.dataProvider = providerInfo.provider;
                    return providerInfo.dataLoaded.then(function () {
                        var row = element.find(".row").first();
                        row.click();
                        row.click();
                        chai_1.expect(instance.selection.length).to.be.equal(0);
                    });
                });
                it("should select the last row when multiple rows are clicked", function () {
                    var _a = createInstanceWithSingleSelect(), instance = _a.instance, element = _a.element;
                    var data = createFakeData().data;
                    var providerInfo = createProvider(data);
                    instance.dataProvider = providerInfo.provider;
                    return providerInfo.dataLoaded.then(function () {
                        var rows = element.find(".row");
                        $(rows[0]).click();
                        $(rows[1]).click();
                        chai_1.expect(instance.selection.length).to.be.equal(1);
                        chai_1.expect(instance.selection[0]['col1']).to.be.deep.equal(data[1]['col1']);
                    });
                });
                it('should retain selection when set', function () {
                    var _a = createInstanceWithSingleSelect(), instance = _a.instance, element = _a.element;
                    var data = createFakeData().data;
                    var providerInfo = createProvider(data);
                    instance.dataProvider = providerInfo.provider;
                    return providerInfo.dataLoaded.then(function () {
                        instance.selection = [data[0]];
                        chai_1.expect(instance.selection[0]['col1']).to.be.equal(data[0]['col1']);
                    });
                });
            });
        });
        describe("getSortFromLineUp", function () {
            it("does not crash when sorting a stacked column", function () {
                var _a = loadInstanceWithStackedColumnsAndClick(), instance = _a.instance, dataLoaded = _a.dataLoaded;
                return dataLoaded.then(function () {
                    chai_1.expect(instance.getSortFromLineUp()).not.to.throw;
                });
            });
            it("returns a 'stack' property when a stack is cliked on", function () {
                var _a = loadInstanceWithStackedColumnsAndClick(), instance = _a.instance, dataLoaded = _a.dataLoaded;
                return dataLoaded.then(function () {
                    var result = instance.getSortFromLineUp();
                    chai_1.expect(result.stack.name).to.equal("STACKED_COLUMN");
                    chai_1.expect(result.column).to.be.undefined;
                });
            });
        });
        describe("integration", function () {
            it("saves the configuration when a stacked column is sorted", function () {
                var _a = loadInstanceWithStackedColumnsAndClick(), instance = _a.instance, dataLoaded = _a.dataLoaded;
                return dataLoaded.then(function () {
                    chai_1.expect(instance.configuration.sort).to.not.be.undefined;
                    chai_1.expect(instance.configuration.sort.stack.name).to.be.equal("STACKED_COLUMN");
                    chai_1.expect(instance.configuration.sort.column).to.be.undefined;
                });
            });
            it("saves the configuration when the column layout has been changed", function () {
                var _a = loadInstanceWithStackedColumns(), instance = _a.instance, data = _a.data, dataLoaded = _a.dataLoaded;
                return dataLoaded.then(function () {
                    var called = false;
                    instance.events.on(LineUp_1.LineUp.EVENTS.CONFIG_CHANGED, function () {
                        called = true;
                    });
                    // Ghetto: Manually say that the columns have changed, usually happens if you drag/drop add columns
                    instance.lineupImpl.listeners['columns-changed']();
                    chai_1.expect(called).to.be.true;
                });
            });
            it("loads lineup with a sorted stacked column", function () {
                var _a = loadInstanceWithStackedColumns(), instance = _a.instance, data = _a.data, dataLoaded = _a.dataLoaded;
                return dataLoaded.then(function () {
                    instance.configuration = {
                        primaryKey: "col1",
                        columns: data.columns,
                        sort: {
                            stack: {
                                name: "STACKED_COLUMN"
                            },
                            asc: true
                        }
                    };
                    var result = instance.getSortFromLineUp();
                    chai_1.expect(result.stack.name).to.equal("STACKED_COLUMN");
                    chai_1.expect(result.column).to.be.undefined;
                });
            });
        });
    });
});
