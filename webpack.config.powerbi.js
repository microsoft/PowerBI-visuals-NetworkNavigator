const path = require('path');
const webpack = require('webpack');

module.exports = {
    devtool: 'eval',
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.json']
    },
    module: {
        loaders: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.(tsx|ts)?$/, loader: 'ts-loader?configFileName=tsconfig.web.json', exclude: '.d.ts' },
            {
                test: /\.scss$/,
                loaders: ["style", "css", "sass"]
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            }
        ],
    },
    externals: {
        jquery: "jQuery",
        d3: "d3",
        underscore: "_",
        "lodash": "_"
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.ProvidePlugin({
            'Promise': 'exports?global.Promise!es6-promise'
        })
    ],
};
