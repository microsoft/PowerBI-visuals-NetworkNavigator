module.exports = {
    "version": "0.90.0",
    "output": {
        "PowerBI": {
            "visualName": "TableSorter",
            "displayName": "Table Sorter",
            "projectId": "1450434005853",
            "icon": "icon.png",
            "screenshot": "screenshot.png",
            "thumbnail": "thumbnail.png",
            "entry": "TableSorterVisual",
            "description": "Table Sorter lets you create stacked table columns to explore how different combinations and weightings of numerical column values result in different rank orderings of table records. Column headings show the distribution of column values and support rapid re-sorting of table rows (which may also be filtered by linked visuals). Table Sorter is built on LineUp (http://caleydo.github.io/tools/lineup/)."
        },
        "component": {
            "entry": "TableSorter"
        },
        "react": {
            "entry": "TableSorterReact"
        }
    },
    "lintFiles": ["TableSorterVisual.ts", "TableSorter.ts"]
};