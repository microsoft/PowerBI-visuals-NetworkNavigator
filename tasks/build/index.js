"use strict";
const fs = require("fs");
const baseDir = __dirname + "/../../";
const sequence = require("gulp-sequence");
const sass = require("gulp-sass");
const projects = require("../projects");

module.exports = function(gulp) {
    require("./powerbi")(gulp);
    require("./component")(gulp);
    require("./react")(gulp);
    
    projects.forEach(projectConfig => {
        const project = projectConfig.name;
        const config = projectConfig.buildConfig; 
        const paths = projectConfig.paths;
        
        /**
         * Builds the css
         */
        gulp.task(`build:${project}:css`, function() {
            return gulp.src(paths.styles)
                .pipe(sass())
                .pipe(gulp.dest(paths.buildDirComponentCSS));
        });
        
        /**
         * Bumps the version of the project
         */
        gulp.task(`build:${project}:bump`, function() {
            // increment version 
            let newVer = config.version;
            newVer.patch = (parseInt(newVer.patch, 10) + 1) + "";
            let prettyPrinted =  JSON.stringify(config, null, 4);//.split("\n").map(n =>"\n");
            fs.writeFileSync(paths.projectDir + "/build.js", "module.exports = " + prettyPrinted + ";");
        });
        
        /**
         * Build task for a given component
         */
        gulp.task(`build:${project}`, function(callback) {
            var toBuild = [];
            
            toBuild.push(`clean:${project}`);
            
            if (config.output.PowerBI) {
                toBuild.push(`build:${project}:powerbi`);
            }
            if (config.output.component) {
                toBuild.push(`build:${project}:component`);
            }
            if (config.output.react) {
                toBuild.push(`build:${project}:react`);
            }
            toBuild.push(`test:${project}`);
            
            return sequence.apply(this, toBuild.concat(callback));
        });
    });
    
    gulp.task("build", function(callback) {
        return sequence.apply(this, projects.map(p => `build:${p.name}`).concat(callback));
    });
};