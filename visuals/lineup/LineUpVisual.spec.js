var visualHelpers_1 = require("../../base/spec/visualHelpers");
var chai_1 = require("chai");
var LineUpVisual_1 = require("./LineUpVisual");
var $ = require("jquery");
describe('LineUpVisual', function () {
    var parentEle;
    beforeEach(function () {
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
    var createVisual = function () {
        var instance = new LineUpVisual_1.default(true);
        var initOptions = visualHelpers_1.Utils.createFakeInitOptions();
        parentEle.append(initOptions.element);
        instance.init(initOptions);
        return {
            instance: instance,
            element: initOptions.element
        };
    };
    it('should load', function () {
        chai_1.expect(createVisual()).to.not.be.undefined;
    });
    it('should remove columns from LineUp.configuration if columns are removed from PBI', function () {
        var instance = createVisual().instance;
        // Load initial data
        instance.update(visualHelpers_1.Utils.createUpdateOptionsWithData());
        chai_1.expect(instance.lineup.configuration.columns.length).to.be.equal(2);
        // Pretend that we had an existing config
        var config = instance.lineup.configuration;
        var newOptions = visualHelpers_1.Utils.createUpdateOptionsWithSmallData();
        newOptions.dataViews[0].metadata = {
            objects: {
                'layout': {
                    'layout': JSON.stringify(config)
                }
            }
        };
        // Run update again with new options
        instance.update(newOptions);
        // Make sure it removed the extra column
        chai_1.expect(instance.lineup.configuration.columns.length).to.be.equal(1);
    });
    it('should remove sort from LineUp.configuration if columns are removed from PBI', function () {
        var instance = createVisual().instance;
        // Load initial data
        var data = visualHelpers_1.Utils.createUpdateOptionsWithData();
        instance.update(data);
        chai_1.expect(instance.lineup.configuration.columns.length).to.be.equal(2);
        // Pretend that we had an existing config
        var newOptions = visualHelpers_1.Utils.createUpdateOptionsWithSmallData();
        var config = instance.lineup.configuration;
        // Add a sort to the missing data, which in this case is the second column in the original data
        config.sort = {
            // This column is removed in the "Small" dataset
            column: data.dataViews[0].table.columns[1].displayName,
            asc: true
        };
        newOptions.dataViews[0].metadata = {
            objects: {
                'layout': {
                    'layout': JSON.stringify(config)
                }
            }
        };
        // Run update again with new options
        instance.update(newOptions);
        // Make sure it removed the extra column
        chai_1.expect(instance.lineup.configuration.sort).to.be.undefined;
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGluZVVwVmlzdWFsLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJMaW5lVXBWaXN1YWwuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSw4QkFBbUMsK0JBQStCLENBQUMsQ0FBQTtBQUNuRSxxQkFBdUIsTUFBTSxDQUFDLENBQUE7QUFHOUIsNkJBQXlDLGdCQUFnQixDQUFDLENBQUE7QUFDMUQsSUFBWSxDQUFDLFdBQU0sUUFBUSxDQUFDLENBQUE7QUFFNUIsUUFBUSxDQUFDLGNBQWMsRUFBRTtJQUNyQixJQUFJLFNBQVMsQ0FBQztJQUNkLFVBQVUsQ0FBQztRQUNQLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNwQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ2pDLENBQUMsQ0FBQyxDQUFDO0lBRUgsU0FBUyxDQUFDO1FBQ04sRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNaLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN2QixDQUFDO1FBQ0QsU0FBUyxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDLENBQUMsQ0FBQztJQUVILElBQUksWUFBWSxHQUFHO1FBQ2YsSUFBSSxRQUFRLEdBQUcsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RDLElBQUksV0FBVyxHQUFHLHFCQUFTLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUNwRCxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN0QyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzNCLE1BQU0sQ0FBQztZQUNILFVBQUEsUUFBUTtZQUNSLE9BQU8sRUFBRSxXQUFXLENBQUMsT0FBTztTQUMvQixDQUFD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