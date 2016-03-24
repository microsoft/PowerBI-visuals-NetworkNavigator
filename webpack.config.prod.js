const path = require('path');
const webpack = require('webpack');

module.exports = {
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.json']
    },
    module: {
        loaders: [
            {
                test: /.js$/,
                loaders: ['babel']
            },
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loader: 'ts-loader', exclude: '.d.ts' },
            {
                test: /\.scss$/,
                loaders: ["style", "css", "sass"]
            },
            {
                test: /\.json$/,
                loader: 'raw-loader'
            }
        ],
    },
    externals: {
        jquery: "jQuery",
        d3: "d3",
        underscore: "_",
        react: 'React',
        "lodash": "_",
        "react-dom": 'ReactDOM'
    },
    plugins: [
/*        new webpack.optimize.UglifyJsPlugin({
            compress: {
                sequences     : true,  // join consecutive statemets with the “comma operator”
                properties    : true,  // optimize property access: a["foo"] → a.foo
                dead_code     : true,  // discard unreachable code
                drop_debugger : true,  // discard “debugger” statements
                unsafe        : false, // some unsafe optimizations (see below)
                conditionals  : true,  // optimize if-s and conditional expressions
                comparisons   : true,  // optimize comparisons
                evaluate      : false,  // evaluate constant expressions -- THIS IS SET TO FALSE, BECAUSE IT SCREWS UP PBI
                booleans      : true,  // optimize boolean expressions
                loops         : true,  // optimize loops
                unused        : true,  // drop unused variables/functions
                hoist_funs    : true,  // hoist function declarations
                hoist_vars    : false, // hoist variable declarations
                if_return     : true,  // optimize if-s followed by return/continue
                join_vars     : true,  // join var declarations
                cascade       : true,  // try to cascade `right` into `left` in sequences
                side_effects  : true,  // drop side-effect-free statements
                warnings      : true,  // warn about potentially dangerous optimizations/code
            }
        }),*/
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.ProvidePlugin({
            'Promise': 'exports?global.Promise!es6-promise'
        })
    ],
};
