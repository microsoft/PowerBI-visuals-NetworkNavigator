[![Build Status](https://travis-ci.org/Microsoft/PowerBI-visuals-NetworkNavigator.svg?branch=develop)](https://travis-ci.org/Microsoft/PowerBI-visuals-NetworkNavigator)

# NetworkNavigator

Network Navigator lets you explore node-link data by panning over and zooming into a force-directed node layout (which can be precomputed or animated live). From an initial overview of all nodes, you can use simple text search to enlarge matching nodes in ways that guide subsequent navigation. Network nodes can also be color-coded based on additional attributes of the dataset and filtered by linked visuals.

![Network Navigator](/assets/screenshot.png?raw=true)

> This visual is experimental and not actively being developed, only major issues will be addressed.

## Usage
* Fork this repo
* Install [node.js 6+](https://nodejs.org)
* Install [yarn](https://yarnpkg.com/lang/en/docs/install)
* Run `yarn` on the project directory, which will install all the dependencies
* Run `yarn test` which will lint, test, and compile the `network-navigator`, and `network-navigator-powerbi` packages.
    * Compiling `network-navigator-powerbi` will also create a `.pbiviz` file in the `packages/network-navigator/powerbi/dist` directory, which can be imported directly in [Power BI](https://app.powerbi.com/)
