const gulp = require('gulp');
require("ts-node/register");
require("./tasks/build")(gulp);
require("./tasks/release")(gulp);
require("./tasks/sync")(gulp);
gulp.task('default', ['build']);
