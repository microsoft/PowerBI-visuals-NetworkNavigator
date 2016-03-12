"use strict";
var baseDir = __dirname + "/../";
const fs = require("fs");
module.exports = function(project) {
    var projectConfig;
    if (fs.existsSync(baseDir + 'visuals/' + project + '/build.json')) {
        projectConfig = JSON.parse(fs.readFileSync(baseDir + 'visuals/' + project + '/build.json').toString());
    } else {
        projectConfig = require(baseDir + './visuals/' + project + '/build.js');
    }
    return projectConfig;
};