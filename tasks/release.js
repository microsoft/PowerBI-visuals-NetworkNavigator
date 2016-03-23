"use strict";
 
// dependencies 
const gulp = require('gulp');
const git = require('gulp-git');
const bump = require('gulp-bump');
const filter = require('gulp-filter');
const tag_version = require('gulp-tag-version');
const sequence = require("gulp-sequence");
const projects = require("./projects");
const addsrc = require("gulp-add-src");
const fs = require("fs");

module.exports = function(gulp) {
    projects.forEach(projectConfig => {
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
                .pipe(gulp.dest('./'))
                
                // Add our build file to be commited
                .pipe(addsrc(paths.projectDir + "/build.js"))
                
                // commit the changed version number 
                .pipe(git.commit('Bump versions'))
        
                // read only one file to get the version number 
                .pipe(filter('package.json'))
                // **tag it in the repository** 
                .pipe(tag_version());
        }
        
        /**
         * Bumps the version of the project
         */
        gulp.task(`release:${project}:patch`, function() {
            return inc('patch');
        });
        
        /**
         * Bumps the version of the project
         */
        gulp.task(`release:${project}:minor`, function() {
            return inc('minor');
        });
        
        /**
         * Bumps the version of the project
         */
        gulp.task(`release:${project}:major`, function() {
            return inc('major');
        });
    });
};