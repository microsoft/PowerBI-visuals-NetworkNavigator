/*
 * Copyright (c) Microsoft
 * All rights reserved.
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
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
const webpack = require('webpack');
const fs = require("fs");
const ENTRY = './src/NetworkNavigatorVisual.ts';
const regex = path.normalize(ENTRY).replace(/\\/g, '\\\\').replace(/\./g, '\\.');

const config = module.exports = {
    entry: ENTRY,
    resolve: {
        extensions: ['', '.ts', '.js','.json'],
        fallback: path.join(__dirname, "node_modules"),
    },
    resolveLoader: {
        fallback: path.join(__dirname, "node_modules"),
    },
    module: {
        loaders: [
            {
                test: new RegExp(regex),
                loader: path.join(__dirname, 'bin', 'pbiPluginLoader'),
            },
            {
                test: /\.scss$/,
                loaders: ["css", "sass"]
            },
            {
                test: /\.json$/,
                loader: 'json-loader',
            },
            {
                test: /\.ts$/,
                loader: 'ts-loader',
            },
            {
                test: /lodash\.js/,
                loader: 'imports-loader?define=>false'
            }
        ],
    },
    externals: {
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.NormalModuleReplacementPlugin(/powerbi-visuals-tools/, 'node-noop'),
        new webpack.NormalModuleReplacementPlugin(/powerbi-visuals-utils-.*index\.d/, 'node-noop'),
        new webpack.NormalModuleReplacementPlugin(/jsdom/, 'node-noop'),
        new webpack.ProvidePlugin({
            'Promise': 'exports?global.Promise!es6-promise',
        }),
        new webpack.DefinePlugin({
            'process.env.DEBUG': "\"" + (process.env.DEBUG || "") + "\"",
        }),
    ],
};

if (process.env.NODE_ENV !== "production") {
    config.devtool = "eval";
} else {
    var banner = new webpack.BannerPlugin(fs.readFileSync("LICENSE").toString());
    var uglify = new webpack.optimize.UglifyJsPlugin({
        mangle: true,
        minimize: true,
        compress: false,
        beautify: false,
        output: {
            ascii_only: true, // Necessary, otherwise it messes up the unicode characters that lineup is using for font-awesome
            comments: false,
        },
    });
    config.plugins.push(uglify);
    config.plugins.push(banner);
}
