'use strict';
/* eslint-env node */

var gulp = require('gulp');
var sass = require('gulp-sass');
var eslint = require('gulp-eslint');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var streamify = require('gulp-streamify');
var runSequence = require('run-sequence');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var browserifyHandlebars = require('browserify-handlebars');
var karma = require('karma');
var path = require('path');
var fs = require('fs');

var config = {
    distFolder: 'dist/',
    exampleFolder: 'example/',
    testFolder: 'tests/',
    sassFiles: ['sass/**/*.scss'],
    srcFiles: 'src/**/*.js',
    testFiles: 'tests/**/*.js',
};

gulp.task('lint', function () {
    return gulp.src([config.srcFiles, config.testFiles])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('test', function(done) {
    if (!fs.existsSync('bamboo')) fs.mkdirSync('bamboo');
    new karma.Server({
        configFile: path.join(__dirname, '/karma.conf.js'),
        singleRun: true,
        browsers: [ process.env.PHANTOMJS_BIN ? 'PhantomJS' : 'Chrome' ], // eslint-disable-line
    }, done).start();
});

gulp.task('sass_dependencies', function () {
    return gulp.src('node_modules/strippets/sass/**/*')
        .pipe(gulp.dest('sass'));
});

gulp.task('sass', ['sass_dependencies'], function () {
    return gulp.src(config.sassFiles)
        .pipe(sass())
        .pipe(gulp.dest(config.distFolder))
        .pipe(gulp.dest(config.exampleFolder));
});

gulp.task('scripts_thumbnails', function () {
    return browserify('src/thumbnails.js', {
        standalone: 'Uncharted.Thumbnails',
    })
        .transform(browserifyHandlebars)
        .bundle()
        .pipe(source('uncharted.thumbnails.js'))
        .pipe(gulp.dest(config.distFolder))
        .pipe(gulp.dest(config.exampleFolder))
        .pipe(streamify(uglify()))
        .pipe(rename(function (file) {
            file.basename = 'uncharted.thumbnails.min';
            file.dirname = '';
        }))
        .pipe(gulp.dest(config.distFolder));
});

gulp.task('font-awesome', function () {
    return gulp.src(['css/font-awesome.min.css', 'fonts/**'], {cwd: 'node_modules/font-awesome'})
        .pipe(rename(function (file) {
            if (file.extname !== '.css') file.dirname = './fonts';
        }))
        .pipe(gulp.dest(config.exampleFolder));
});

gulp.task('scripts_dependencies', ['font-awesome'], function () {
    return gulp.src(['node_modules/jquery/dist/jquery.min.js',
            'node_modules/underscore/underscore-min.js',
            'node_modules/velocity-animate/velocity.min.js',
            'node_modules/bluebird/js/browser/bluebird.min.js'])
        .pipe(concat('uncharted.thumbnails.dependencies.js'))
        .pipe(gulp.dest(config.exampleFolder))
        .pipe(gulp.dest(config.distFolder));
});

gulp.task('scripts', ['scripts_thumbnails', 'scripts_dependencies']);


gulp.task('watch', function () {
    gulp.watch(config.sassFiles, ['sass']);
    gulp.watch(config.srcFiles, ['scripts_thumbnails']);
});

gulp.task('ci', ['sass', 'scripts'], function () {
    runSequence('lint', 'test');
});

gulp.task('default', ['ci']);
