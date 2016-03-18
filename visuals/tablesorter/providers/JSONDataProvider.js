"use strict";
/**
 * A Data provider for a simple json array
 */
var JSONDataProvider = (function () {
    function JSONDataProvider(data, handleSort, handleFilter) {
        if (handleSort === void 0) { handleSort = true; }
        if (handleFilter === void 0) { handleFilter = true; }
        this.handleSort = handleSort;
        this.handleFilter = handleFilter;
        this.data = data;
    }
    /**
     * Determines if the dataset can be queried again
     */
    JSONDataProvider.prototype.canQuery = function (options) {
        var _this = this;
        return new Promise(function (resolve) { return resolve(options.offset < _this.data.length); });
    };
    /**
     * Runs a query against the server
     */
    JSONDataProvider.prototype.query = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var final = _this.getFilteredData(options);
            var newData = final.slice(options.offset, options.offset + options.count);
            setTimeout(function () {
                resolve({
                    results: newData,
                    count: newData.length
                });
            }, 0);
        });
    };
    ;
    /**
     * Generates a histogram for this data set
     */
    JSONDataProvider.prototype.generateHistogram = function (column, options) {
        var _this = this;
        return new Promise(function (resolve) {
            var final = _this.getFilteredData(options);
            var values = final.map(function (n) { return n[column.column]; });
            var max = d3.max(values);
            var min = d3.min(values);
            var histgenerator = d3.layout.histogram();
            histgenerator.range([min, max]);
            var histValues = histgenerator(values).map(function (bin) { return bin.y; });
            var maxHist = d3.max(histValues);
            // Make the values a percentage
            resolve(histValues.map(function (n) { return maxHist === 0 || n === 0 || _.isNaN(n) || _.isNaN(maxHist) ? 0 : n / maxHist; }));
        });
    };
    /**
     * Gets the data filtered
     */
    JSONDataProvider.prototype.getFilteredData = function (options) {
        var final = this.data.slice(0);
        if (this.handleFilter && options.query && options.query.length) {
            options.query.forEach(function (filter) {
                var filterMethod = typeof filter.value === "string" ? JSONDataProvider.checkStringFilter : JSONDataProvider.checkNumberFilter;
                final = final.filter(function (item) { return filterMethod(item, filter); });
            });
        }
        if (this.handleSort && options.sort && options.sort.length) {
            var sortItem = options.sort[0];
            var basicSort_1 = function (aValue, bValue, asc) {
                var dir = asc ? 1 : -1;
                if (aValue == bValue) {
                    return 0;
                }
                return (aValue > bValue ? 1 : -1) * dir;
            };
            var minMax = {};
            var calcStackedValue_1 = function (item, sortToCheck, minMax) {
                var columns = sortToCheck.stack.columns;
                if (columns) {
                    return columns.reduce(function (a, v) {
                        /**
                         * This calculates the percent that this guy is of the max value
                         */
                        var value = item[v.column];
                        if (value) {
                            value -= minMax[v.column].min;
                            value /= (minMax[v.column].max - minMax[v.column].min);
                        }
                        else {
                            value = 0;
                        }
                        return a + (value * v.weight);
                    }, 0);
                }
                return 0;
            };
            var maxValues_1;
            if (sortItem.stack) {
                maxValues_1 = sortItem.stack.columns.reduce(function (a, b) {
                    a[b.column] = {
                        max: d3.max(final, function (i) { return i[b.column]; }),
                        min: d3.min(final, function (i) { return i[b.column]; })
                    };
                    return a;
                }, {});
            }
            final.sort(function (a, b) {
                if (sortItem.stack) {
                    return basicSort_1(calcStackedValue_1(a, sortItem, maxValues_1), calcStackedValue_1(b, sortItem, maxValues_1), sortItem.asc);
                }
                return basicSort_1(a[sortItem.column], b[sortItem.column], sortItem.asc);
            });
        }
        return final;
    };
    /**
     * A filter for string values
     */
    JSONDataProvider.checkStringFilter = function (data, filter) {
        return data[filter.column].match(new RegExp(filter.value));
    };
    /**
     * A filter for numeric values
     */
    JSONDataProvider.checkNumberFilter = function (data, filter) {
        var value = data[filter.column] || 0;
        return value >= filter.value.domain[0] && value <= filter.value.domain[1];
    };
    return JSONDataProvider;
}());
exports.JSONDataProvider = JSONDataProvider;
