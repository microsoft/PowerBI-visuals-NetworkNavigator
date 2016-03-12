require("ts-node/register");

const gulp = require('gulp');

require("./tasks/build")(gulp);
require("./tasks/compile")(gulp);
require("./tasks/clean")(gulp);
require("./tasks/test")(gulp);
require("./tasks/lint")(gulp);
require("./tasks/demo")(gulp);