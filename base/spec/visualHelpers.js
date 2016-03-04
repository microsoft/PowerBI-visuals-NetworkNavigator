/// <reference path="../../base/references.d.ts"/>
require("../testSetup");
global['powerbi'] = {
    visuals: {
        utility: {
            SelectionManager: function () {
                return {
                    getSelectionIds: function () { return []; }
                };
            }
        },
        SelectionId: {
            createNull: function () { return ({
                equals: function () { return false; }
            }); }
        }
    },
    VisualDataRoleKind: {},
    data: {
        createDisplayNameGetter: function () { }
    }
};
global['$'] = require("jquery");
exports.Utils = {
    FAKE_TABLE_DATA_ONE_COLUMN: {
        metadata: {},
        table: {
            columns: [{
                    displayName: "COLUMN_1",
                    type: {
                        text: true
                    }
                }],
            rows: [
                ["COLUMN_1_ROW_1"],
                ["COLUMN_1_ROW_2"],
            ]
        }
    },
    FAKE_TABLE_DATA_TWO_COLUMN: {
        metadata: {},
        table: {
            columns: [{
                    displayName: "COLUMN_1",
                    type: {
                        text: true
                    }
                }, {
                    displayName: "COLUMN_2",
                    type: {
                        numeric: true
                    }
                }],
            rows: [
                ["COLUMN_1_ROW_1", 1],
                ["COLUMN_1_ROW_2", 2],
            ]
        }
    },
    createElement: function () {
        return $('<div>');
    },
    createUpdateOptionsWithSmallData: function () {
        return {
            viewport: {
                width: 100,
                height: 100
            },
            dataViews: [exports.Utils.FAKE_TABLE_DATA_ONE_COLUMN]
        };
    },
    createUpdateOptionsWithData: function () {
        return {
            viewport: {
                width: 100,
                height: 100
            },
            dataViews: [exports.Utils.FAKE_TABLE_DATA_TWO_COLUMN]
        };
    },
    createFakeHost: function () {
        return {};
    },
    createFakeInitOptions: function () {
        var element = exports.Utils.createElement();
        return {
            element: element,
            host: exports.Utils.createFakeHost(),
            viewport: {
                width: 100,
                height: 100
            }
        };
    }
};
