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
    
    const TEST_CASE_ONE = [
        {
            "id": 1,
            "num_hashtags": 3,
            "num_mentions": 2,
            "num_tweets": 1
        },
        {
            "id": 2,
            "num_hashtags": 10,
            "num_mentions": 0,
            "num_tweets": 1
        },
        {
            "id": 3,
            "num_hashtags": 4,
            "num_mentions": 1,
            "num_tweets": 4
        },
        {
            "id": 4,
            "num_hashtags": 0,
            "num_mentions": 0,
            "num_tweets": 9
        }
    ];

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
        
        it ("should sort TEST_CASE_1 correctly", () => {
            let { instance } = createInstance(TEST_CASE_ONE);
            let result = instance.query({
                offset: 0,
                count: 100,
                sort: [{
                    "stack": {
                    "name": "Stacked",
                    "columns": [
                        {
                        "column": "num_hashtags",
                        "weight": 1
                        },
                        {
                        "column": "num_mentions",
                        "weight": 1
                        },
                        {
                        "column": "num_tweets",
                        "weight": 1
                        }
                    ]
                    },
                    "asc": true
                }]
            });
            return result.then((resp) => {
                let ids = resp.results.map(n => n.id); 
                expect(ids).to.deep.equal([ 2, 4, 3, 1 ]);
            });
        });
    });
});