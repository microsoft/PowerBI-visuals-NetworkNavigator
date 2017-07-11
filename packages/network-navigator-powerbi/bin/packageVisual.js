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

"use strict";

const fs = require('fs');
const zip = require('node-zip')();
const path = require('path');
const sass = require('node-sass');
const CleanCSS = require('clean-css');
const mkdirp = require('mkdirp');
const webpack = require("webpack");
const MemoryFS = require("memory-fs");
const pbivizJson = require('../pbiviz.json');
const packageJson = require('../package.json');
const capabilities = require(path.join('..', pbivizJson.capabilities));
const webpackConfig = require('../webpack.config');
const buildOSSReport = require('./buildOSSReport.js');

const packagingWebpackConfig = {
    tslint: {
        emitErrors: true,
        failOnHint: true
    },
    output: {
        filename: 'visual.js', path: '/'
    }
};

const _buildLegacyPackageJson = () => {
    const pack = {
        version: packageJson.version,
        author: pbivizJson.author,
        licenseTerms: packageJson.license,
        privacyTerms: packageJson.privacyTerms,
        resources: [
            {
                "resourceId": "rId0",
                "sourceType": 5,
                "file": `resources/${ pbivizJson.visual.guid }.ts`
            },
            {
                "resourceId": "rId1",
                "sourceType": 0,
                "file": `resources/${ pbivizJson.visual.guid }.js`
            },
            {
                "resourceId": "rId2",
                "sourceType": 1,
                "file": `resources/${ pbivizJson.visual.guid }.css`
            },
            {
                "resourceId": "rId3",
                "sourceType": 3,
                "file": `resources/${path.basename(pbivizJson.assets.icon)}`
            },
            {
                "resourceId": "rId4",
                "sourceType": 6,
                "file": `resources/${path.basename(pbivizJson.assets.thumbnail)}`
            },
            {
                "resourceId": "rId5",
                "sourceType": 2,
                "file": `resources/${path.basename(pbivizJson.assets.screenshot)}`
            }
        ],
        visual: Object.assign({ version: packageJson.version }, pbivizJson.visual),
        "code": {
            "typeScript": {
                "resourceId": "rId0"
            },
            "javaScript": {
                "resourceId": "rId1"
            },
            "css": {
                "resourceId": "rId2"
            }
        },
        "images": {
            "icon": {
                "resourceId": "rId3"
            },
            "thumbnail": {
                "resourceId": "rId4"
            },
            "screenshots": [
                {
                    "resourceId": "rId5"
                }
            ]
        }
    };

    delete pack.visual.visualClassName;

    const date = new Date();
    pack.build = date.getUTCFullYear().toString().substring(2) + '.' + (date.getUTCMonth() + 1) + '.' + date.getUTCDate() + '.' + ((date.getUTCHours() * 3600) + (date.getUTCMinutes() * 60) + date.getUTCSeconds());

    return pack;
};

const _buildPackageJson = () => {
    return {
        version: packageJson.version,
        author: pbivizJson.author,
        licenseTerms: packageJson.license,
        privacyTerms: packageJson.privacyTerms,
        resources: [
            {
                resourceId: 'rId0',
                sourceType: 5,
                file: `resources/${ pbivizJson.visual.guid }.pbiviz.json`,
            }
        ],
        visual: Object.assign({ version: packageJson.version }, pbivizJson.visual),
        metadata: {
            pbivizjson: {
                resourceId: 'rId0'
            }
        }
    };
};

const buildPackageJson = pbivizJson.apiVersion ? _buildPackageJson() : _buildLegacyPackageJson();

const compileSass = () => {
    if (pbivizJson.style) {
        const sassOutput = sass.renderSync({ file: pbivizJson.style }).css.toString();
        const options = { 
            level: { 
                2: {
                    all: true,
                    mergeNonAdjacentRules: false,
                },
            },
        };
        const cssContent = new CleanCSS(options).minify(sassOutput).styles;
        return cssContent;
    }
    return '';
};

const compileScripts = (callback) => {
    const regex = /\bnode_modules\b/;
    const fs = new MemoryFS();
    const compiler = webpack(Object.assign(webpackConfig, packagingWebpackConfig));
    compiler.outputFileSystem = fs;
    compiler.run((err, stats) => {
        if (err) throw err;
        const jsonStats = stats.toJson(true);
        const errors = jsonStats.errors.filter(error => !regex.test(error));
        console.info('Time:', jsonStats.time);
        console.info('Hash:', jsonStats.hash);
        jsonStats.warnings.forEach(warning => console.warn('WARNING:', warning));
        errors.forEach(error => !regex.test(error) && console.error('ERROR:', error));
        if (errors.length > 0) {
            return process.exit(1);
        }
        buildOSSReport(jsonStats.modules, ossReport => {
            const fileContent = fs.readFileSync("/visual.js").toString();
            callback(err, fileContent, ossReport);
        });
    });
};

const _buildLegacyPackage = (fileContent) => {
    const icon = fs.readFileSync(pbivizJson.assets.icon);
    const thumbnail = fs.readFileSync(pbivizJson.assets.thumbnail);
    const screenshot = fs.readFileSync(pbivizJson.assets.screenshot);
    const iconType = pbivizJson.assets.icon.indexOf('.svg') >= 0 ? 'svg+xml' : 'png';
    const iconBase64 = `data:image/${iconType};base64,` + icon.toString('base64');
    const cssContent = compileSass() + `\n.visual-icon.${pbivizJson.visual.guid} {background-image: url(${iconBase64});}`;
    zip.file('package.json', JSON.stringify(buildPackageJson, null, 2));
    zip.file(`resources/${pbivizJson.visual.guid}.js`, fileContent);
    zip.file(`resources/${pbivizJson.visual.guid}.ts`, `/** See ${pbivizJson.visual.guid}.js **/`);
    zip.file(`resources/${pbivizJson.visual.guid}.css`, cssContent + `\n`);
    zip.file(`resources/${path.basename(pbivizJson.assets.icon)}`, icon);
    zip.file(`resources/${path.basename(pbivizJson.assets.thumbnail)}`, thumbnail);
    zip.file(`resources/${path.basename(pbivizJson.assets.screenshot)}`, screenshot);
    fs.writeFileSync(pbivizJson.output, zip.generate({ base64:false,compression:'DEFLATE' }), 'binary');
};

const _buildPackage = (fileContent) => {
    const jsContent = fileContent;
    const cssContent = compileSass();
    const icon = fs.readFileSync(pbivizJson.assets.icon);
    const iconType = pbivizJson.assets.icon.indexOf('.svg') >= 0 ? 'svg+xml' : 'png';
    const iconBase64 = `data:image/${iconType};base64,` + icon.toString('base64');

    pbivizJson.capabilities = capabilities;
    pbivizJson.content = {
        js: jsContent,
        css: cssContent,
        iconBase64: iconBase64
    };
    zip.file('package.json', JSON.stringify(buildPackageJson, null, 2));
    zip.file(`resources/${pbivizJson.visual.guid}.pbiviz.json`, JSON.stringify(pbivizJson, null, 2));
    fs.writeFileSync(pbivizJson.output, zip.generate({ base64:false,compression:'DEFLATE' }), 'binary');
};

const buildPackage = () => {
    mkdirp.sync(path.parse(pbivizJson.output).dir);
    compileScripts((err, result, ossReport) => {
        if (err) throw err;

        if (!pbivizJson.apiVersion) {
            _buildLegacyPackage(result);
        } else {
            _buildPackage(result);
        }

        const ossReportFile = path.join(path.dirname(pbivizJson.output), pbivizJson.visual.name + '_' + packageJson.version + '_OSS_Report.csv');
        fs.writeFileSync(ossReportFile, ossReport);
    });
};

buildPackage();
