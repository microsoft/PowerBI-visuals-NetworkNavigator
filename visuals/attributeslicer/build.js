module.exports = {
    "version": {
        "major": "0",
        "minor": "9",
        "patch": "4"
    },
    "output": {
        "PowerBI": {
            "visualName": "AttributeSlicer",
            "displayName": "Attribute Slicer",
            "projectId": "1652434005853",
            "icon": "icon.svg",
            "screenshot": "screenshot.png",
            "thumbnail": "thumbnail.png",
            "entry": "AttributeSlicerVisual.ts",
            "description": "This visual is currently in beta testing and is undergoing active development. Attribute Slicer lets you filter a dataset on a given column by selecting attribute values of interest. The initial display is a helpful overview that lists the most common values first and shows the overall distribution of values as a horizontal bar chart. Whenever you select an attribute value, it is moved to the list of applied filters and all records containing that value are added to the result set for further analysis."
        },
        "component": {
            "entry": "AttributeSlicer.ts"
        },
        "react": {
            "entry": "AttributeSlicerReact.tsx"
        }
    },
    "lintFiles": [
        "AttributeSlicer.ts",
        "AttributeSlicerReact.tsx",
        "AttributeSlicerVisual.ts"
    ]
};