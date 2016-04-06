const gulp = require('gulp');
require("ts-node/register");
require("./tasks/build")(gulp);
require("./tasks/release")(gulp);
gulp.task('default', ['build']);
