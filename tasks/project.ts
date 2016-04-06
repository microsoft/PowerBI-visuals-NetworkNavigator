import * as fs from "fs";
import * as path from "path";

const baseDir = path.join(__dirname, '..');
const { name, version } = require(path.join(baseDir, "package.json"));
const paths = require("./paths")();
const buildConfig = require(path.join(baseDir, 'src/build'));
module.exports = { name, buildConfig, paths, version };
