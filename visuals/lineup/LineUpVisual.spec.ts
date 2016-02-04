// import { Utils as SpecUtils } from "../../base/spec/visualHelpers";
// import { expect } from "chai";
// import { LineUp, ILineUpSettings, ILineUpRow, ILineUpColumn } from "./LineUp";
// import { default as LineUpVisual  } from "./LineUpVisual";
// import * as $ from "jquery";

// describe('LineUpVisual', () => {
//     var parentEle;
//     beforeEach(() => {
//         global['d3'] = require("d3");
//         global['_'] = require("underscore");
//         parentEle = $('<div></div>');
//     });

//     afterEach(() => {
//         if (parentEle) {
//             parentEle.remove();
//         }
//         parentEle = null;
//     });

//     let createVisual = () => {
//         let instance = new LineUpVisual(true);
//         let initOptions = SpecUtils.createFakeInitOptions();
//         parentEle.append(initOptions.element);
//         instance.init(initOptions);
//         return {
//             instance,
//             element: initOptions.element
//         };
//     };

//     it ('should load', () => {
//         expect(createVisual()).to.not.be.undefined;
//     });

//     it ('should remove columns from LineUp.configuration if columns are removed from PBI', () => {
//         let { instance } = createVisual();

//         // Load initial data
//         instance.update(SpecUtils.createUpdateOptionsWithData());
//         expect(instance.lineup.configuration.columns.length).to.be.equal(2);

//         // Pretend that we had an existing config
//         var config = instance.lineup.configuration;
//         var newOptions = SpecUtils.createUpdateOptionsWithSmallData();
//         newOptions.dataViews[0].metadata = <any>{
//             objects: {
//                 'layout': {
//                     'layout': JSON.stringify(config)
//                 }
//             }
//         };

//         // Run update again with new options
//         instance.update(newOptions);

//         // Make sure it removed the extra column
//         expect(instance.lineup.configuration.columns.length).to.be.equal(1);
//     });

//     it ('should remove sort from LineUp.configuration if columns are removed from PBI', () => {
//         let { instance } = createVisual();

//         // Load initial data
//         var data = SpecUtils.createUpdateOptionsWithData();
//         instance.update(data);
//         expect(instance.lineup.configuration.columns.length).to.be.equal(2);

//         // Pretend that we had an existing config
//         var newOptions = SpecUtils.createUpdateOptionsWithSmallData();
//         var config = instance.lineup.configuration;

//         // Add a sort to the missing data, which in this case is the second column in the original data
//         config.sort = {
//             // This column is removed in the "Small" dataset
//             column: data.dataViews[0].table.columns[1].displayName,
//             asc: true
//         };

//         newOptions.dataViews[0].metadata = <any>{
//             objects: {
//                 'layout': {
//                     'layout': JSON.stringify(config)
//                 }
//             }
//         };

//         // Run update again with new options
//         instance.update(newOptions);

//         // Make sure it removed the extra column
//         expect(instance.lineup.configuration.sort).to.be.undefined;
//     });
// });