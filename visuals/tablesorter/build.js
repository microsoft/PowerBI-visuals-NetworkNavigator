module.exports = {
    "version": {
        "major": "0",
        "minor": "9",
        "patch": "3"
    },
    "output": {
        "PowerBI": {
            "visualName": "TableSorter",
            "displayName": "Table Sorter",
            "projectId": "1450434005853",
            "icon": "icon.svg",
            "screenshot": "screenshot.png",
            "thumbnail": "thumbnail.png",
            "entry": "TableSorterVisual",
            "description": "This visual is currently in beta testing and is undergoing active development. Table Sorter lets you create stacked table columns to explore how different combinations and weightings of numerical column values result in different rank orderings of table records. Column headings show the distribution of column values and support rapid re-sorting of table rows (which may also be filtered by linked visuals). Table Sorter is built on LineUp (http://caleydo.github.io/tools/lineup/)."
        },
        "component": {
            "entry": "TableSorter"
        },
        "react": {
            "entry": "TableSorterReact"
        }
    },
    "lintFiles": [
        "TableSorterVisual.ts",
        "TableSorter.ts"
    ]
};