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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzdWFsSGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInZpc3VhbEhlbHBlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsa0RBQWtEO0FBQ2xELE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN4QixNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUc7SUFDaEIsT0FBTyxFQUFFO1FBQ0wsT0FBTyxFQUFFO1lBQ0wsZ0JBQWdCLEVBQUU7Z0JBQ2QsTUFBTSxDQUFDO29CQUNILGVBQWUsRUFBRSxjQUFNLE9BQUEsRUFBRSxFQUFGLENBQUU7aUJBQzVCLENBQUM7WUFDTixDQUFDO1NBQ0o7UUFDRCxXQUFXLEVBQUU7WUFDVCxVQUFVLEVBQUUsY0FBTSxPQUFBLENBQUM7Z0JBQ2YsTUFBTSxFQUFFLGNBQU0sT0FBQSxLQUFLLEVBQUwsQ0FBSzthQUN0QixDQUFDLEVBRmdCLENBRWhCO1NBQ0w7S0FDSjtJQUNELGtCQUFrQixFQUFFLEVBQ25CO0lBQ0QsSUFBSSxFQUFFO1FBQ0YsdUJBQXVCLEVBQUUsY0FBTyxDQUFDO0tBQ3BDO0NBQ0osQ0FBQztBQUNGLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckIsYUFBSyxHQUFHO0lBRWYsMEJBQTBCLEVBQW9CO1FBQzFDLFFBQVEsRUFBNEIsRUFBRTtRQUN0QyxLQUFLLEVBQUU7WUFDSCxPQUFPLEVBQW9DLENBQUM7b0JBQ3hDLFdBQVcsRUFBRSxVQUFVO29CQUN2QixJQUFJLEVBQU87d0JBQ1AsSUFBSSxFQUFFLElBQUk7cUJBQ2I7aUJBQ0osQ0FBQztZQUNGLElBQUksRUFBRTtnQkFDRixDQUFDLGdCQUFnQixDQUFDO2dCQUNsQixDQUFDLGdCQUFnQixDQUFDO2FBQ3JCO1NBQ0o7S0FDSjtJQUVELDBCQUEwQixFQUFvQjtRQUMxQyxRQUFRLEVBQTRCLEVBQUU7UUFDdEMsS0FBSyxFQUFFO1lBQ0gsT0FBTyxFQUFvQyxDQUFDO29CQUN4QyxXQUFXLEVBQUUsVUFBVTtvQkFDdkIsSUFBSSxFQUFPO3dCQUNQLElBQUksRUFBRSxJQUFJO3FCQUNiO2lCQUNKLEVBQUU7b0JBQ0MsV0FBVyxFQUFFLFVBQVU7b0JBQ3ZCLElBQUksRUFBTzt3QkFDUCxPQUFPLEVBQUUsSUFBSTtxQkFDaEI7aUJBQ0osQ0FBQztZQUNGLElBQUksRUFBRTtnQkFDRixDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztnQkFDckIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7YUFDeEI7U0FDSjtLQUNKO0lBRUQsYUFBYSxFQUFFO1FBQ1gsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN0QixDQUFDO0lBRUQsZ0NBQWdDLEVBQUU7UUFDOUIsTUFBTSxDQUE4QjtZQUNoQyxRQUFRLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLEdBQUc7Z0JBQ1YsTUFBTSxFQUFFLEdBQUc7YUFDZDtZQUNELFNBQVMsRUFBRSxDQUFDLGFBQUssQ0FBQywwQkFBMEIsQ0FBQztTQUNoRCxDQUFDO0lBQ04sQ0FBQztJQUVELDJCQUEyQixFQUFFO1FBQ3pCLE1BQU0sQ0FBOEI7WUFDaEMsUUFBUSxFQUFFO2dCQUNOLEtBQUssRUFBRSxHQUFHO2dCQUNWLE1BQU0sRUFBRSxHQUFHO2FBQ2Q7WUFDRCxTQUFTLEVBQUUsQ0FBQyxhQUFLLENBQUMsMEJBQTBCLENBQUM7U0FDaEQsQ0FBQztJQUNOLENBQUM7SUFFRCxjQUFjLEVBQUU7UUFDWixNQUFNLENBQThCLEVBQUUsQ0FBQztJQUMzQyxDQUFDO0lBRUQscUJBQXFCLEVBQUU7UUFDbkIsSUFBSSxPQUFPLEdBQUcsYUFBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3BDLE1BQU0sQ0FBNEI7WUFDOUIsT0FBTyxFQUFFLE9BQU87WUFDaEIsSUFBSSxFQUFFLGFBQUssQ0FBQyxjQUFjLEVBQUU7WUFDNUIsUUFBUSxFQUFFO2dCQUNOLEtBQUssRUFBRSxHQUFHO2dCQUNWLE1BQU0sRUFBRSxHQUFHO2FBQ2Q7U0FDSixDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUMifQ==