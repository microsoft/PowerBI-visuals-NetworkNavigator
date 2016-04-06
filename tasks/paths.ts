import * as path from "path";
const rootDir = path.join(__dirname, "..");
const srcDir = path.join(rootDir, "src");
const distDir = path.join(rootDir, "dist");
const pbiDir = path.join(distDir, 'powerbi');

module.exports = function() {
    return  {
        projectDir: srcDir,
        scripts: [`${srcDir}/**/*\.{js,ts}`],
        styles: [`${srcDir}/**/*\.{scss,sass}`],
        test: [`${srcDir}/**/*\.spec\.{ts,js}`],
        buildDir:  distDir,
        buildArtifacts: `${distDir}/**/*.*`,
        getBuildDir: (type = '') => path.join(distDir, type),
        buildDirPowerBI: pbiDir,
        buildDirPowerBiResources: path.join(pbiDir, 'resources'),
        packageDir: [path.join(__dirname, 'build/package')]
    };
}
