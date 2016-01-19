require("ts-node/register");

var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var fs = require("fs");
var tslint = require('gulp-tslint');
var typescript = require('gulp-typescript');
var sequence = require('gulp-sequence');
var zip = require('gulp-zip');
var modify = require('gulp-modify');
var sourcemaps = require('gulp-sourcemaps');
var webpack = require('gulp-webpack');
var path = require("path");
var replace = require("gulp-replace");
var gutil = require("gulp-util");
var sass = require("gulp-sass");
var webserver = require('gulp-webserver');
var mocha = require('gulp-mocha');

var args = require('yargs')
    .usage('Usage: $0 --project [name of the visual\'s folder]')
    .alias('p', 'project')
    .choices('project', fs.readdirSync('visuals'))
    .demand(['project'])
    .argv;

var project = args.project;

var paths = {
    projectDir: 'visuals/' + project,
    scripts: ['visuals/' + project + '/**/*\.ts'],
    styles: ['visuals/' + project + '/**/*\.{scss,sass}'],
    test: ['visuals/' + project + '/**/*\.spec\.{ts,js}'],
    buildDir:  'dist/' + project,
    buildDirComponentCSS:  'dist/' + project + "/component",
    buildDirComponentJS:  'dist/' + project + "/component",
    buildDirReactCSS:  'dist/' + project + "/react",
    buildDirReactJS:  'dist/' + project + "/react",
    buildDirPowerBI: 'dist/' + project + '/powerbi',
    buildDirPowerBiResources: 'dist/' + project + '/powerbi/resources',
    packageDir: ['package']
};

var projectConfig = JSON.parse(fs.readFileSync('visuals/' + project + '/build.json').toString());

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use any package available on npm
gulp.task('clean', function(cb) {
    // You can use multiple globbing patterns as you would with `gulp.src`
    del.sync([paths.buildDir]);
    cb();
});

/**
 * Runs the tests
 */
gulp.task('test', function() {
    return gulp.src(paths.test)
        .pipe(mocha({ reporter: 'nyan' }));
});

gulp.task('tslint', function() {
    var toLint = paths.scripts;
    if (projectConfig.lintFiles) {
        toLint = projectConfig.lintFiles.map(function(file) {
            return "visuals/" + project + "/" + file;
        });
    }
    return gulp.src(toLint)
        .pipe(tslint())
        .pipe(tslint.report('verbose'))
});

/**
 * Builds the css
 */
gulp.task('build:css', function() {
    return gulp.src(paths.styles)
        .pipe(sass())
        .pipe(gulp.dest(paths.buildDirComponentCSS));
});

/**
 * Builds the bare component
 */
gulp.task('build:component', ['build:css'], function() {
    var output = projectConfig.output.component;
    var config = require('./webpack.config.dev.js');
    config.output = {
        libraryTarget: "umd"
    };
    config.entry = path.join(__dirname, 'visuals', project, output.entry);
    return gulp.src(paths.scripts)
        // .pipe(sourcemaps.init())
        .pipe(webpack(config))
        // .pipe(sourcemaps.write())
        .pipe(concat(project + '.js'))
        .pipe(gulp.dest(paths.buildDirComponentJS));
});

/**
 * Builds the css
 */
gulp.task('build:react:css', function() {
    var output = projectConfig.output.react;
    if (output) {
        return gulp.src(paths.styles)
            .pipe(sass())
            .pipe(gulp.dest(paths.buildDirReactCSS));
    }
});

/**
 * Builds the react component
 */
gulp.task('build:react', ['build:react:css'], function() {
    var output = projectConfig.output.react;
    if (output) {
        var config = require('./webpack.config.dev.js');
        config.output = {
            libraryTarget: "umd"
        };
        config.entry = path.join(__dirname, 'visuals', project, output.entry);
        return gulp.src([config.entry])
            // .pipe(sourcemaps.init())
            .pipe(webpack(config))
            // .pipe(sourcemaps.write())
            .pipe(concat(project + '.js'))
            .pipe(gulp.dest(paths.buildDirReactJS));
    }
});

/**
 * Builds the css for the visual
 */
gulp.task('build:powerbi:css', ['build:css'], function() {
    var output = projectConfig.output.PowerBI;
    if (output && output.icon) {
        var base64Contents = new Buffer(fs.readFileSync(paths.projectDir + '/' + output.icon), 'binary').toString('base64');
        return string_src('project.css', `
        .visual-icon.${output.visualName + output.projectId}{
            background-image: url(data:image/png;base64,${base64Contents});
        }
        `.trim())
            .pipe(gulp.dest(paths.buildDirPowerBiResources));

    }
});

/**
 * Builds the scripts for use for with powerbi
 */
gulp.task('build:powerbi:scripts', ['build:powerbi:css'], function() {
    var output = projectConfig.output.PowerBI;
    var config = require('./webpack.config.dev.js');
    config.entry = path.join(__dirname, 'visuals', project, output.entry);
    return gulp.src(paths.scripts)
        // .pipe(sourcemaps.init())
        .pipe(webpack(config))
        // .pipe(sourcemaps.write())
        .pipe(concat('project.js'))
        .pipe(gulp.dest(paths.buildDirPowerBiResources));
});

/**
 * Creates the package.json
 */
gulp.task('build:powerbi:package_json', function() {
    var output = projectConfig.output.PowerBI;
    return gulp.src([paths.packageDir + "/package.json"])
        .pipe(replace("%PROJECT_NAME%", output.visualName))
        .pipe(replace("%PROJECT_ID%", output.projectId))
        .pipe(modify({
            fileModifier: function(file, contents) {
                if (output.icon) {
                    var package = JSON.parse(contents.toString());
                    package.images = {
                        icon: {
                            "resourceId": "rId3"
                        }
                    };
                    package.resources.push({
                        resourceId: "rId3",
                        sourceType: 3,
                        file: "resources/" + output.icon
                    });
                    var uniqueProjName = output.visualName + output.projectId;
                    /**
                     * What the below is doing is basically removing the define/require calls, to remove the AMD load logic from some libraries
                     * and then restoring it after the library is done loading
                     */
                    return JSON.stringify(package, null, 4);
                }
                return `${contents}`.trim().replace("\n", "");
            }
        }))
        .pipe(gulp.dest(paths.buildDirPowerBI));
});

/**
 * Packages the icon
 */
gulp.task('build:powerbi:package_icon', function() {
    var output = projectConfig.output.PowerBI;
    if (output.icon) {
        return gulp.src([paths.projectDir + '/' + output.icon])
            .pipe(gulp.dest(paths.buildDirPowerBiResources));
    }
});

/**
 * Zips up the visual
 */
gulp.task('build:powerbi:zip', function() {
    var output = projectConfig.output.PowerBI;
    return gulp.src([paths.buildDirPowerBI + "/**/*"])
        .pipe(zip(output.visualName + ".pbiviz"))
        .pipe(gulp.dest(paths.buildDirPowerBI));
});

/**
 * Task to create an empty ts file
 */
gulp.task('build:powerbi:create_empty_ts', function(cb) {
    fs.writeFileSync(paths.buildDirPowerBiResources + "/project.ts", "/** See project.js **/");
    cb();
});

/**
 * Task to create an empty ts file
 */
gulp.task('build:powerbi:pre_clean', function(cb) {
    // You can use multiple globbing patterns as you would with `gulp.src`
    del.sync([paths.buildDirPowerBI]);
    cb();
});


/**
 * Task to create an empty ts file
 */
gulp.task('build:powerbi:post_clean', function(cb) {
    // You can use multiple globbing patterns as you would with `gulp.src`
    del.sync([paths.buildDirPowerBI + "/package.json", paths.buildDirPowerBiResources]);
    cb();
});

/**
 * Packages the visualization in a pbiviz
 */
gulp.task('build:powerbi', function(cb) {
    sequence('build:powerbi:pre_clean', 'build:powerbi:scripts', 'build:powerbi:package_json', 'build:powerbi:package_icon', 'build:powerbi:create_empty_ts', 'build:powerbi:zip', 'build:powerbi:post_clean', cb);
});

/**
 * Builds everything
 */
gulp.task('build', function(cb) {
    sequence('clean', 'test', 'build:powerbi', 'build:component', 'build:react', cb);
});

/**
 * Starts the demo server
 */
gulp.task('demo-server', function() {
    gulp.src('./')
        .pipe(webserver({
            livereload: true,
            open: '/demo'
        }));
});

/**
 * Starts the demo
 */
gulp.task('demo', function(cb) {
    sequence('clean', 'build:component', 'demo-server', cb);
});

function string_src(filename, string) {
  var src = require('stream').Readable({ objectMode: true })
  src._read = function () {
    this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }))
    this.push(null)
  }
  return src;
}