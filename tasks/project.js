"use strict";
var path = require("path");
var baseDir = path.join(__dirname, '..');
var name = require(path.join(baseDir, "package.json")).name;
var paths = require("./paths")();
var buildConfig = require(path.join(baseDir, 'src/build'));
module.exports = { name: name, buildConfig: buildConfig, paths: paths };
