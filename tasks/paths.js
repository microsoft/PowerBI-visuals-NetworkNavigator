"use strict";
const rootDir = __dirname + "/../";
module.exports = function(project) {
    return  {
        projectDir: rootDir + 'visuals/' + project,
        scripts: [rootDir + 'visuals/' + project + '/**/*\.{js,ts}'],
        styles: [rootDir + 'visuals/' + project + '/**/*\.{scss,sass}'],
        test: [rootDir + 'visuals/' + project + '/**/*\.spec\.{ts,js}'],
        buildDir:  rootDir + 'dist/' + project,
        buildDirComponentCSS:  rootDir + 'dist/' + project + "/component",
        buildDirComponentJS:  rootDir + 'dist/' + project + "/component",
        buildDirReactCSS:  rootDir + 'dist/' + project + "/react",
        buildDirReactJS:  rootDir + 'dist/' + project + "/react",
        buildDirPowerBI: rootDir + 'dist/' + project + '/powerbi',
        buildDirPowerBiResources: rootDir + 'dist/' + project + '/powerbi/resources',
        packageDir: [rootDir + 'package']
    };
}