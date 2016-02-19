import { IDataProvider, IQueryOptions, IQueryResult, ILineUpColumn, ILineUpSort } from "../models";

/**
 * A Data provider for a simple json array
 */
export class JSONDataProvider implements IDataProvider {
    protected data : any[];

    constructor(data: any[], private handleSort = true, private handleFilter= true) {
        this.data = data;
    }

    /**
     * Determines if the dataset can be queried again
     */
    public canQuery(options: IQueryOptions) : Promise<boolean>{
        return new Promise<boolean>((resolve) => resolve(options.offset < this.data.length));
    }

    /**
     * Runs a query against the server
     */
    public query(options: IQueryOptions) : Promise<IQueryResult> {
        return new Promise<IQueryResult>((resolve, reject) => {
            var final = this.getFilteredData(options);
            var newData = final.slice(options.offset, options.offset + options.count);
            setTimeout(() => {
                resolve({
                    results: newData,
                    count: newData.length
                });
            }, 0);
        });
    };

    /**
     * Generates a histogram for this data set
     */
    public generateHistogram(column: ILineUpColumn, options: IQueryOptions) : Promise<number[]> {
        return new Promise<number[]>((resolve) => {
            let final = this.getFilteredData(options);
            let values : number[] = final.map(n => n[column.column]);
            let max = d3.max(values);
            let min = d3.min(values);

            var histgenerator = d3.layout.histogram();
            (<any>histgenerator).range([min, max]);

            let histValues = histgenerator(values).map((bin) => bin.y);
            let maxHist = d3.max(histValues);

            // Make the values a percentage
            resolve(histValues.map(n => maxHist === 0 || n === 0 || _.isNaN(n) || _.isNaN(maxHist) ? 0 : n / maxHist));
        });
    }

    /**
     * Gets the data filtered
     */
    private getFilteredData(options: IQueryOptions) {
        var final = this.data.slice(0);

        if (this.handleFilter && options.query && options.query.length) {
            options.query.forEach((filter) => {
                let filterMethod : any = typeof filter.value === "string" ? JSONDataProvider.checkStringFilter : JSONDataProvider.checkNumberFilter;
                final = final.filter((item) => filterMethod(item, filter));
            });
        }

        if (this.handleSort && options.sort && options.sort.length) {
            var sortItem = options.sort[0];
            const basicSort = (aValue, bValue, asc) => {
                var dir = asc ? 1 : -1;
                if(aValue == bValue){
                    return 0;
                }
                return (aValue > bValue ? 1 : -1) * dir;
            };

            let minMax = {};
            const calcStackedValue = (item, sortToCheck : ILineUpSort, minMax: { [col: string] : { min:number, max: number}}) => {
                let columns = sortToCheck.stack.columns;
                if (columns) {
                    return columns.reduce((a, v) => {
                        /**
                         * This calculates the percent that this guy is of the max value
                         */
                        let value = item[v.column];
                        value -= minMax[v.column].min;
                        value /= (minMax[v.column].max - minMax[v.column].min);
                        return a + (value * v.weight);
                    }, 0);
                }
                return 0;
            };

            final.sort((a, b) => {
                if (sortItem.stack) {
                    let maxValues = sortItem.stack.columns.reduce((a, b) => {
                        a[b.column] = {
                            max: d3.max(final, (i) => i[b.column]),
                            min: d3.min(final, (i) => i[b.column])
                        };
                        return a;
                    }, <any>{});
                    return basicSort(calcStackedValue(a, sortItem, maxValues), calcStackedValue(b, sortItem, maxValues), sortItem.asc);
                }
                return basicSort(a[sortItem.column], b[sortItem.column], sortItem.asc);
            });
        }
        return final;
    }

    /**
     * A filter for string values
     */
    private static checkStringFilter(data: { [key: string] : string }, filter: { column: string; value: string }) {
        return data[filter.column].match(new RegExp(filter.value));
    }

    /**
     * A filter for numeric values
     */
    private static checkNumberFilter(data: { [key: string] : number }, filter: { column: string; value: { domain: [number, number]; } }) {
        let value = data[filter.column] || 0;
        return value >= filter.value.domain[0] && value <= filter.value.domain[1];
    }
}