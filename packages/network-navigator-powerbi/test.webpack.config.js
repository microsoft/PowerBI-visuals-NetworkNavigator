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

const path = require('path')
const webpack = require('webpack')

module.exports = {
	devtool: 'source-map',
	mode: 'development',
	optimization: {
		concatenateModules: false,
		minimize: false,
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.tsx?$/i,
				enforce: 'post',
				include: /(src)/,
				exclude: /(node_modules|resources\/js\/vendor)/,
				loader: 'istanbul-instrumenter-loader',
				options: { esModules: true },
			},
			{
				test: /\.json$/,
				use: [{ loader: 'json-loader' }],
				type: 'javascript/auto',
			},
			{
				test: /\.less$/,
				use: [
					{
						loader: 'style-loader',
					},
					{
						loader: 'css-loader',
					},
					{
						loader: 'less-loader',
						options: {
							lessOptions: {
								paths: [
									path.resolve(__dirname, 'node_modules'),
								],
							},
						},
					},
				],
			},
		],
	},
	externals: {
		'powerbi-visuals-api': '{}',
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js', '.css'],
	},
	output: {
		path: path.resolve(__dirname, '.tmp/test'),
	},
	plugins: [
		new webpack.ProvidePlugin({
			'powerbi-visuals-api': null,
		}),
		new webpack.ProvidePlugin({
			process: 'process/browser',
		}),
	],
}
