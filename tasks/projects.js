"use strict";
var baseDir = __dirname + "/../";
const fs = require("fs");
const paths = require("./paths");

let configs = [];
let projects = fs.readdirSync('visuals').filter(n => /^[\w|_]+$/.test(n));
projects.forEach(project => {
    var buildConfig;
    if (fs.existsSync(baseDir + 'visuals/' + project + '/build.json')) {
        buildConfig = JSON.parse(fs.readFileSync(baseDir + 'visuals/' + project + '/build.json').toString());
    } else {
        buildConfig = require(baseDir + './visuals/' + project + '/build.js');
    }
    configs.push({
        name: project,
        buildConfig: buildConfig,
        paths: paths(project)
    });
});

module.exports = configs;