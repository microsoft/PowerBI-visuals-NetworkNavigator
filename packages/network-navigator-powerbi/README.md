[![Build Status](https://travis-ci.org/Microsoft/PowerBI-visuals-NetworkNavigator.svg?branch=develop)](https://travis-ci.org/Microsoft/PowerBI-visuals-NetworkNavigator)

# Network Navigator -- PowerBI

This is the PowerBI visual version of the Network Navigator.

> This visual is currently in beta testing and is undergoing active development.

## Usage
* Fork this repo
* Install [node.js 6+](https://nodejs.org)
* Install [yarn](https://yarnpkg.com/)
* Run `yarn && yarn test` in the `../network-navigator` directory.
* Run `yarn && yarn test` in this directory.
    * This will generate a `pbiviz` file in the `dist\` directory, which can then be imported into PowerBI.
* Run `yarn start` in this directory.
    * This will start a local dev server that enables live debugging and reload