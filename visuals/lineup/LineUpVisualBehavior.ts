/// <reference path="../../base/references.d.ts"/>
/// <reference path="./ILineUpVisualRow.ts"/>

/**
 * Represents an interactive behavior used in power BI
 */
class LineUpVisualBehavior implements powerbi.visuals.IInteractiveBehavior {
    private selectionEnabled : boolean;
    private isMultiSelection : boolean;
    private selectedRows : ILineUpVisualRow[] = [];
    private selectionHandler: powerbi.visuals.ISelectionHandler;
    private lineup: any;
    private host : powerbi.IVisualHostServices;

    /**
    * Turns on or off selection
    */
    public toggleSelection(enabled: boolean, multi : boolean = false) {
        this.selectionEnabled = enabled;
        this.isMultiSelection = multi;
        this.attachEvents();
    }

    public bindEvents(options: any, selectionHandler: powerbi.visuals.ISelectionHandler) {
        this.selectionHandler = selectionHandler;

        if (options.lineup) {
            this.lineup = options.lineup;
            this.attachEvents();
        }

        this.host = options.host;
    }

    /**
        * Renders the actual selection visually
        */
    public renderSelection(hasSelection: boolean) {
        // TODO
        // if (hasSelection) {
        //     this.selectionHandler.
        // } else {
        //     this.lineup.storage.setSelected([]);
        // }
    }

    /**
        * Attaches the line up events to lineup
        */
    private attachEvents() {
        if (this.lineup) {
            // Cleans up events
            this.lineup.listeners.on("multiselected.lineup", null);
            this.lineup.listeners.on("selected.lineup", null);

            if (this.isMultiSelection) {
                this.lineup.listeners.on("multiselected.lineup", (rows : ILineUpVisualRow[]) => this.onRowSelected(rows));
            } else {
                this.lineup.listeners.on("selected.lineup", (row : ILineUpVisualRow) => this.onRowSelected(row ? [row] : []));
            }
        }
    }

    /**
        * Selects the given row
        */
    private onRowSelected(rows : ILineUpVisualRow[]) {
        var filter;
        if (this.selectionEnabled) {
            if (rows && rows.length) {
                var expr = rows[0].filterExpr;

                // If we are allowing multiSelect
                if (rows.length > 0 && this.isMultiSelection) {
                    rows.slice(1).forEach((r) => {
                    expr = powerbi.data.SQExprBuilder.or(expr, r.filterExpr);
                    });
                }
                filter = powerbi.data.SemanticFilter.fromSQExpr(expr);
            }

            var objects: powerbi.VisualObjectInstancesToPersist = {
                merge: [
                    <powerbi.VisualObjectInstance>{
                        objectName: "general",
                        selector: undefined,
                        properties: {
                            "filter": filter
                        }
                    }
                ]
            };

            // rows are what are currently selected in lineup
            if (rows && rows.length) {
                var unselectedRows = this.selectedRows.filter((n) => {
                    return rows.filter((m) => m.identity.equals(n.identity)).length === 0;
                });
                var newSelectedRows = rows.filter((n) => {
                    return this.selectedRows.filter((m) => m.identity.equals(n.identity)).length === 0;
                });

                newSelectedRows.concat(unselectedRows).forEach((r) => this.selectionHandler.handleSelection(r, true));

                this.selectedRows = rows.slice(0);
            } else {
                this.selectedRows = [];
                this.selectionHandler.handleClearSelection();
            }

            this.host.persistProperties(objects);
        }
    }
}