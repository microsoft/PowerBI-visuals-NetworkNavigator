module.exports = {
    "version": {
        "major": "0",
        "minor": "9",
        "patch": "5"
    },
    "output": {
        "PowerBI": {
            "visualName": "NetworkNavigator",
            "displayName": "Network Navigator",
            "projectId": "1550434005853",
            "icon": "icon.svg",
            "screenshot": "screenshot.png",
            "thumbnail": "thumbnail.png",
            "entry": "NetworkNavigatorVisual.ts",
            "description": "This visual is currently in beta testing and is undergoing active development. Network Navigator lets you explore node-link data by panning over and zooming into a force-directed node layout (which can be precomputed or animated live). From an initial overview of all nodes, you can use simple text search to enlarge matching nodes in ways that guide subsequent navigation. Network nodes can also be color-coded based on additional attributes of the dataset and filtered by linked visuals."
        },
        "component": {
            "entry": "NetworkNavigator.ts"
        },
        "react": {
            "entry": "NetworkNavigatorReact.tsx"
        }
    }
};