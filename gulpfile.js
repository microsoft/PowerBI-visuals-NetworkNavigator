const gulp = require('gulp');

require("ts-node/register");
require("./tasks/build")(gulp);
require("./tasks/compile")(gulp);
require("./tasks/clean")(gulp);
require("./tasks/test")(gulp);
require("./tasks/lint")(gulp);
require("./tasks/demo")(gulp);