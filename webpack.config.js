/**
 * Created by yang on 2016/7/6.
 */
'use strict';

const webpack = require('webpack');

let externals = _externals();

module.exports = {
    entry: {
        app: './app.js',
    },
    target: 'node',
    output: {
        path: './build',
        filename: '[name].js'
    },
    resolve: {
        extensions: ['', '.js']
    },
    externals: externals,
    node: {
        console: true,
        global: true,
        process: true,
        Buffer: true,
        __filename: true,
        __dirname: true,
        setImmediate: true
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                query: {
                    presets: ['es2015','stage-0']
                },
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin()
    ]
};

function _externals() {
    let manifest = require('./package.json');
    let dependencies = manifest.dependencies;
    let externals = {};
    for (let p in dependencies) {
        externals[p] = 'commonjs ' + p;
    }
    return externals;
}