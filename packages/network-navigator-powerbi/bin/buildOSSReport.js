/**
 * Copyright (c) 2016 Uncharted Software Inc.
 * http://www.uncharted.software/
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const path = require('path');
const cp = require('child_process');
const fs = require('fs');

/**
 * Object containing the modules that should always be considered as runtime modules.
 *
 * @type {Object}
 */
const alwaysRuntimeDependencies = {
    'font-awesome': true
};

/**
 * Parses the output of `npm ll` making sure that the private sub-modules are included in the report.
 *
 * @method parseNPMLL
 * @param {Function} cb - Callback to be invoked when the operation is complete.
 */
function parseNPMLL(cb) {
    /* read the original package.json file and parse it */
    const packagePath = path.resolve('./package.json');
    const packageJsonContent = fs.readFileSync(packagePath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);

    /* save a version of package.json with the privateSubmodules added to the dependencies object */
    const privateSubmodules = packageJson.privateSubmodules;
    const dependencies = packageJson.dependencies;
    Object.keys(privateSubmodules || {}).forEach(key => {
        if (!dependencies.hasOwnProperty(key)) {
            dependencies[key] = privateSubmodules[key];
        }
    });
    fs.writeFile(packagePath, JSON.stringify(packageJson), err => {
        if (err) throw(err);

        /* process the output of `npm ll` */
        let output;
        try {
            output = cp.execSync('npm ll --json', {env: process.env});
        } catch (e) {
            output = e.stdout;
        }

        /* restore the previous package.json */
        fs.writeFile(packagePath, packageJsonContent, err => {
            if (err) throw(err);

            /* parse the output and call the callback */
            let parsed;
            try {
                parsed = JSON.parse(output);
            } catch (e) {
                console.warn('Cannot parse `npm ll` output:', e);
                parsed = null;
            }
            cb(parsed);
        });
    });
}

/**
 * Converts an object representing a JSON property to a CSV compatible string.
 *
 * @method readObjectValue
 * @param {Object} object - The object to read as a string.
 * @returns {String}
 */
function readObjectValue(object) {
    let result = '';

    if (typeof object === 'string' || object instanceof String) {
        result = object;
    } else if (typeof object === 'number' || object instanceof Number) {
        result = object.toString();
    } else if (object) {
        Object.keys(object).forEach(key => {
            result += key + ': ' + object[key] + '\t';
        });
    }

    if (!result.length) {
        result = 'Not Specified';
    }

    return result.replace(new RegExp('"', 'g'), '""');
}

/**
 * Recursively parses the dependencies object withing the given info object and returns them as a CSV string.
 *
 * @method parseDependencies
 * @param {Object} info - An info object containing the `dependencies` property to parse.
 * @param {Object} runtimeDependencies - An Object containing the runtime dependencies of this project.
 * @param {Boolean} isParentRoot - Flag defining if the parent object of this dependencies is the root of the project.
 * @returns {String}
 */
function parseDependencies(info, runtimeDependencies, isParentRoot) {
    const dependencies = info.dependencies;
    const devDependencies = info.devDependencies;
    const nodeModulesPath = path.join(path.resolve('./'), 'node_modules/');
    let csv = '';

    /* dependency */ /* version */ /* type */ /* usage */ /* included in product */ /* in git repository */ /* licence */ /* URL */ /* description */
    Object.keys(dependencies).forEach(key => {
        const dependency = dependencies[key];
        const name = readObjectValue(dependency.name);
        const version = readObjectValue(dependency.version);

        if (dependency.name && dependency.version) {
            const type = isParentRoot ? 'dependency' : 'sub-dependency';
            const usage = devDependencies.hasOwnProperty(key) ? 'development' : 'runtime';
            const included = (!runtimeDependencies.hasOwnProperty(key) || !runtimeDependencies[key]) ? 'No' : 'Yes';
            /* TODO: This could be done using `git check-ignore` for better results */
            const inRepo = (dependency.link && !dependency.link.startsWith(nodeModulesPath)) ? 'Yes' : 'No';
            const license = readObjectValue(dependency.license);
            const url = readObjectValue(dependency.homepage || dependency.repository || null);
            const description = readObjectValue(dependency.description);
            csv += '"' + name + '","' + version + '","' + type + '","' + usage + '","' + included + '","' + inRepo + '","' + license + '","' + url + '","' + description + '"\n';
        }

        if (dependency.dependencies) {
            csv += parseDependencies(dependency, runtimeDependencies, false);
        }
    });

    return csv;
}

/**
 * Finds the runtime dependencies in the given webpack modules and adds the dependencies defined in the
 * `alwaysRuntimeDependencies` object.
 *
 * @method findRuntimeDependencies
 * @param {Object} webpackModules - An object containing the dependencies as obtaining from compiling the project using webpack.
 * @returns {Object}
 */
function findRuntimeDependencies(webpackModules) {
    const runtimeDependencies = {};
    webpackModules.forEach(module => {
        const name = module.name;
        if (name.startsWith('./~/') || name.startsWith('./node_modules/') || name.startsWith('./lib/')) {
            const components = name.split('/');
            let i = 2;
            let moduleName = '';
            let moduleComponent = components[i++];
            while (moduleComponent.startsWith('@')) {
                moduleName += moduleComponent + '/';
                moduleComponent = components[i++];
            }
            moduleName += moduleComponent;
            runtimeDependencies[moduleName] = module.built && module.cacheable;
        }
    });
    return Object.assign({}, runtimeDependencies, alwaysRuntimeDependencies);
}

/**
 * Builds an OSS report for this project taking into account the specified webpack dependencies.
 *
 * @method buildOSSReport
 * @param {Object} webpackModules - An object containing the dependencies as obtaining from compiling the project using webpack.
 * @param {Function} cb - A callback function to be invoked qhen the process is complete.
 */
function buildOSSReport(webpackModules, cb) {
    parseNPMLL(dependencies => {
        const runtimeDependencies = findRuntimeDependencies(webpackModules);
        const dependenciesCSV = parseDependencies(dependencies, runtimeDependencies, true);
        cb('"Dependency","Version","Type","Usage","Included In Product","In Git Repository","License","URL","Description"\n' + dependenciesCSV);
    });
}

module.exports = buildOSSReport;
