import * as fs from "fs";
import * as path from "path";

const baseDir = __dirname + "/../../";
const sequence = require("gulp-sequence");

module.exports = function(gulp: any) {
    require("./powerbi")(gulp);

    /**
     * Build task for a given component
     */
    gulp.task(`build`, function(callback: Function) {
        return sequence('build:powerbi', callback);
    });
};
