require("../../../base/testSetup");

import { expect, use } from "chai";
import { JSONDataProvider } from "./JSONDataProvider";
import * as $ from "jquery";

describe("JSONDataProvider", () => {
    beforeEach(() => {
        global['$'] = require("jquery");
        global['d3'] = require("d3");
        global['_'] = require("underscore");
    });

    const TEST_DATA_WITH_ALL_NULLS = [{
        id: 1,
        col1: 12,
        null_col: null
    }, {
        id: 2,
        col1: 45,
        null_col: null
    }, {
        id: 3,
        col1: 10,
        null_col: null
    }];

    var createInstance = (data) => {
        var result = {
            instance: new JSONDataProvider(data)
        };
        return result;
    };

    it("should load", () => {
        createInstance(TEST_DATA_WITH_ALL_NULLS);
    });

    describe("stacked sorting", () => {
        it("should sort correctly with a column with null values", (done) => {
            let { instance } = createInstance(TEST_DATA_WITH_ALL_NULLS);
            let result = instance.query({
                offset: 0,
                count: 100,
                sort: [{
                    asc: true,
                    stack: {
                        name: "someName",
                        columns: [{
                            column: "col1",
                            weight: .5
                        }, {
                            column: "null_col",
                            weight: .5
                        }]
                    }
                }]
            });
            
            result.then((sorted) => {
                expect(sorted.results.length).to.eq(3);
                expect(sorted.results[0]['col1']).to.equal(
                    TEST_DATA_WITH_ALL_NULLS[2].col1 // This has the lowest value
                );
                expect(sorted.results[1]['col1']).to.equal(
                    TEST_DATA_WITH_ALL_NULLS[0].col1 // This has the second lowest value
                );
                expect(sorted.results[2]['col1']).to.equal(
                    TEST_DATA_WITH_ALL_NULLS[1].col1 // This has the highest value
                );
                done();
            });
            
        });
    });
});