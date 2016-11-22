# NetworkNavigator

Network Navigator lets you explore node-link data by panning over and zooming into a force-directed node layout (which can be precomputed or animated live). From an initial overview of all nodes, you can use simple text search to enlarge matching nodes in ways that guide subsequent navigation. Network nodes can also be color-coded based on additional attributes of the dataset and filtered by linked visuals.

> This visual is currently in beta testing and is undergoing active development.

## Getting Started
* Fork this repo
* Install [node.js 6+](https://nodejs.org)
* Run `npm install` on the project directory
* The `src` directory contains all of the visual's code.

## Building
* Running `npm run build` will do the following:
  * Compiles the `src` directory.
  * Creates a `.pbiviz` file in the `dist\powerbi` directory.
    * Go to [Power BI](https://app.powerbi.com/), and to import your new visual.
