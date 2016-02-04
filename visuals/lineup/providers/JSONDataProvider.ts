import { IDataProvider, IQueryOptions, IQueryResult, ILineUpColumn } from "../models";

/**
 * A Data provider for a simple json array
 */
export class JSONDataProvider implements IDataProvider {
    private data : any[];
    constructor(data: any[]) {
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
                    total: final.length,
                    results: newData,
                    count: newData.length
                });
            }, 10);
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
        if (options.sort && options.sort.length) {
            var sortItem = options.sort[0];
            final.sort((a, b) => {
                var aValue = a[sortItem.column];
                var bValue = b[sortItem.column];
                var dir = sortItem.asc ? 1 : -1;
                if(aValue == bValue){
                    return 0;
                }
                return (aValue > bValue ? 1 : -1) * dir;
            });
        }
        if (options.query && options.query.length) {
            options.query.forEach((filter) => {
                let filterMethod : any = typeof filter.value === "string" ? JSONDataProvider.checkStringFilter : JSONDataProvider.checkNumberFilter;
                final = final.filter((item) => filterMethod(item, filter));
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