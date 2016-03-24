"use strict";
 
// dependencies 
const gulp = require('gulp');
const git = require('gulp-git');
const bump = require('gulp-bump');
const filter = require('gulp-filter');
const tag_version = require('gulp-tag-version');
const sequence = require("gulp-sequence");
const projectConfig = require("./project");
const addsrc = require("gulp-add-src");
const fs = require("fs");

module.exports = function(gulp) {
    const project = projectConfig.name;
    const config = projectConfig.buildConfig; 
    const paths = projectConfig.paths;
    
    function inc(importance) {
        // increment version 
        let newVer = config.version;
        newVer[importance] = (parseInt(newVer[importance], 10) + 1) + "";
        let prettyPrinted =  JSON.stringify(config, null, 4);//.split("\n").map(n =>"\n");
        fs.writeFileSync(paths.projectDir + "/build.js", "module.exports = " + prettyPrinted + ";");
        
        // get all the files to bump version in 
        return gulp.src(['./package.json'])
            // bump the version number in those files 
            .pipe(bump({type: importance}))
            // save it back to filesystem 
            .pipe(gulp.dest('./'));
    }
    
    function release(importance, cb) {
        process.env.BUILD_TARGET = "release";
        return sequence(`bump:${importance}`, `build`, `commit_artifacts`, `tag`, cb);
    }
    
    /**
     * Bumps the version of the project
     */
    gulp.task(`bump:patch`, function() {
        return inc('patch');
    });
    
    /**
     * Bumps the version of the project
     */
    gulp.task(`bump:minor`, function() {
        return inc('minor');
    });
    
    /**
     * Bumps the version of the project
     */
    gulp.task(`bump:major`, function() {
        return inc('major');
    });
    
    /**
     * Commits the dist of the given project
     */
    gulp.task(`commit_artifacts`, function() {
        return gulp.src([paths.buildArtifacts, paths.projectDir + "/build.js", "package.json"])
            .pipe(git.add())
            
            // Add the build artifacts
            .pipe(git.commit('Updating Artifacts'));
    });
    
    /**
     * Tags the dist of the given project
     */
    gulp.task(`tag`, function() {
        return gulp.src(['./package.json'])
            // **tag it in the repository** 
            .pipe(tag_version());;
    });
    
    /**
     * Releases the version of the project
     */
    gulp.task(`release_build`, function(cb) {
        process.env.BUILD_TARGET = "release";
        return sequence(`build`, cb);
    });
    
    /**
     * Releases the version of the project
     */
    gulp.task(`release:patch`, function(cb) {
        return release("patch", cb);
    });
    
    /**
     * Releases the version of the project
     */
    gulp.task(`release:minor`, function(cb) {
        return release("minor", cb);
    });
    
    /**
     * Releases the version of the project
     */
    gulp.task(`release:major`, function(cb) {
        return release("major", cb);
    });
};