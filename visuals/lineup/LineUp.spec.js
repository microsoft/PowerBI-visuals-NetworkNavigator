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
        return result;
    };
    var createFakeData = function () {
        var rows = [];
        for (var i = 0; i < 100; i++) {
            (function (myId) {
                rows.push({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGluZVVwLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJMaW5lVXAuc3BlYy50cyJdLCJuYW1lcyI6WyJjYW5RdWVyeSIsImdlbmVyYXRlSGlzdG9ncmFtIiwicXVlcnkiXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBRWhDLHFCQUF1QixNQUFNLENBQUMsQ0FBQTtBQUM5Qix1QkFBdUIsVUFBVSxDQUFDLENBQUE7QUFFbEMsSUFBWSxDQUFDLFdBQU0sUUFBUSxDQUFDLENBQUE7QUFFNUIsUUFBUSxDQUFDLFFBQVEsRUFBRTtJQUNmLElBQUksU0FBUyxDQUFDO0lBQ2QsVUFBVSxDQUFDO1FBQ1AsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdCLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDcEMsU0FBUyxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNqQyxDQUFDLENBQUMsQ0FBQztJQUVILFNBQVMsQ0FBQztRQUNOLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDWixTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdkIsQ0FBQztRQUNELFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFJLGNBQWMsR0FBRztRQUNqQixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckIsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0QixJQUFJLE1BQU0sR0FBRztZQUNULFFBQVEsRUFBRSxJQUFJLGVBQU0sQ0FBQyxHQUFHLENBQUM7WUFDekIsT0FBTyxFQUFFLEdBQUc7U0FDZixDQUFDO1FB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