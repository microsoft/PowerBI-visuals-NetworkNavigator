import { Utils as SpecUtils } from "../../base/spec/visualHelpers";
import { expect } from "chai";
import { TableSorter } from "./TableSorter";
import { ITableSorterSettings, ITableSorterRow, ITableSorterColumn } from "./models";
import { default as TableSorterVisual  } from "./TableSorterVisual";
import * as $ from "jquery";

describe('TableSorterVisual', () => {
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
        let instance = new TableSorterVisual(true, {
            presentation: {
                animation: false
            }
        });
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

    it('should remove columns from TableSorter.configuration if columns are removed from PBI', () => {
        let { instance } = createVisual();

        // Load initial data
        instance.update(SpecUtils.createUpdateOptionsWithData());
        expect(instance.tableSorter.configuration.columns.length).to.be.equal(2);

        // Pretend that we had an existing config
        var config = instance.tableSorter.configuration;
        var newOptions = SpecUtils.createUpdateOptionsWithSmallData();
        newOptions.dataViews[0].metadata = <any>{
            objects: {
                'layout': {
                    'layout': JSON.stringify(config)
                }
            }
        };

        // Run update again with new options
        instance.update(newOptions);

        // Make sure it removed the extra column
        expect(instance.tableSorter.configuration.columns.length).to.be.equal(1);
    });

    it('should remove sort from TableSorter.configuration if columns are removed from PBI', () => {
        let { instance } = createVisual();

        // Load initial data
        var data = SpecUtils.createUpdateOptionsWithData();
        instance.update(data);
        expect(instance.tableSorter.configuration.columns.length).to.be.equal(2);

        // Pretend that we had an existing config
        var newOptions = SpecUtils.createUpdateOptionsWithSmallData();
        var config = instance.tableSorter.configuration;

        // Add a sort to the missing data, which in this case is the second column in the original data
        config.sort = {
            // This column is removed in the "Small" dataset
            column: data.dataViews[0].table.columns[1].displayName,
            asc: true
        };

        newOptions.dataViews[0].metadata = <any>{
            objects: {
                'layout': {
                    'layout': JSON.stringify(config)
                }
            }
        };

        // Run update again with new options
        instance.update(newOptions);

        // Make sure it removed the extra column
        expect(instance.tableSorter.configuration.sort).to.be.undefined;
    });
});