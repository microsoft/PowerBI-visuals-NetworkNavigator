var rootDir = __dirname + "/../";
module.exports = function () {
    var srcDir = rootDir + 'src/';
    return {
        projectDir: srcDir,
        scripts: [srcDir + '/**/*\.{js,ts}'],
        styles: [srcDir + '/**/*\.{scss,sass}'],
        test: [srcDir + '/**/*\.spec\.{ts,js}'],
        buildDir: rootDir + 'dist/',
        buildArtifacts: rootDir + 'dist/' + '/**/*.*',
        getBuildDir: function (type) {
            return rootDir + 'dist/' + type;
        },
        buildDirComponentCSS: rootDir + 'dist/' + "/component",
        buildDirComponentJS: rootDir + 'dist/' + "/component",
        buildDirReactCSS: rootDir + 'dist/' + "/react",
        buildDirReactJS: rootDir + 'dist/' + "/react",
        buildDirPowerBI: rootDir + 'dist/' + '/powerbi',
        buildDirPowerBiResources: rootDir + 'dist/' + '/powerbi/resources',
        packageDir: [__dirname + '/build/package']
    };
};
