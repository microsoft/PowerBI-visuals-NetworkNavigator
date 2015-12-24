/// <reference path="../../base/references.d.ts"/>

/**
 * The lineup data
 */
interface ILineUpVisualRow extends powerbi.visuals.SelectableDataPoint {
    /**
     * Data for each column in the row
     */
    [columnName: string]: any;

    /**
     * The expression that will exactly match this row
     */
    filterExpr: powerbi.data.SQExpr;
}