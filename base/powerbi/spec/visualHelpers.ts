/// <reference path="../references.d.ts"/>
require("../../testSetup");
global['powerbi'] = {
    visuals: {
        utility: {
            SelectionManager: () => {
                return {
                    getSelectionIds: () => []
                };
            }
        },
        SelectionId: {
            createNull: () => ({
                equals: () => false
            })
        }
    },
    VisualDataRoleKind: {
    },
    data: {
        createDisplayNameGetter: () => {}
    }
};
global['$'] = require("jquery");
export var Utils = {

    FAKE_TABLE_DATA_ONE_COLUMN: <powerbi.DataView>{
        metadata: <powerbi.DataViewMetadata>{},
        table: {
            columns: <powerbi.DataViewMetadataColumn[]>[{
                displayName: "COLUMN_1",
                type: <any>{
                    text: true
                }
            }],
            rows: [
                ["COLUMN_1_ROW_1"],
                ["COLUMN_1_ROW_2"],
            ]
        }
    },

    FAKE_TABLE_DATA_TWO_COLUMN: <powerbi.DataView>{
        metadata: <powerbi.DataViewMetadata>{},
        table: {
            columns: <powerbi.DataViewMetadataColumn[]>[{
                displayName: "COLUMN_1",
                type: <any>{
                    text: true
                }
            }, {
                displayName: "COLUMN_2",
                type: <any>{
                    numeric: true
                }
            }],
            rows: [
                ["COLUMN_1_ROW_1", 1],
                ["COLUMN_1_ROW_2", 2],
            ]
        }
    },

    createElement: () => {
        return $('<div>');
    },

    createUpdateOptionsWithSmallData: () => {
        return <powerbi.VisualUpdateOptions>{
            viewport: {
                width: 100,
                height: 100
            },
            dataViews: [Utils.FAKE_TABLE_DATA_ONE_COLUMN]
        };
    },

    createUpdateOptionsWithData: () => {
        return <powerbi.VisualUpdateOptions>{
            viewport: {
                width: 100,
                height: 100
            },
            dataViews: [Utils.FAKE_TABLE_DATA_TWO_COLUMN]
        };
    },

    createFakeHost: () => {
        return <powerbi.IVisualHostServices>{
            persistProperties: <any>function() {}
        };
    },

    createFakeInitOptions: () => {
        var element = Utils.createElement();
        return <powerbi.VisualInitOptions>{
            element: element,
            host: Utils.createFakeHost(),
            viewport: {
                width: 100,
                height: 100
            }
        };
    }
};
