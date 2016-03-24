"use strict";
var baseDir = __dirname + "/../";
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json"));
const paths = require("./paths");

var buildConfig;
if (fs.existsSync(baseDir + 'src/build.json')) {
    buildConfig = JSON.parse(fs.readFileSync(baseDir + 'src/build.json').toString());
} else {
    buildConfig = require(baseDir + './src/build.js');
}
module.exports = {
    name: pkg.name,
    buildConfig: buildConfig,
    paths: paths()
};