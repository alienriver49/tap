const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AureliaWebPackPlugin = require('aurelia-webpack-plugin');
const { TsConfigPathsPlugin, CheckerPlugin } = require('awesome-typescript-loader');

const outDir = path.resolve(__dirname, 'dist');
const srcDir = path.resolve(__dirname, 'src');
const tapFxSrcDir = path.resolve(__dirname, 'src/tapFx');
const tapFxOutDir = path.resolve(__dirname, 'dist/tapFx');
const tapShellSrcDir = path.resolve(__dirname, 'src/tapShell');
const tapShellOutDir = path.resolve(__dirname, 'dist/tapShell');
const tapExt1SrcDir = path.resolve(__dirname, 'src/tapExt1');
const tapExt1OutDir = path.resolve(__dirname, 'dist/tapExt1');

const nodeModulesDir = path.resolve(__dirname, 'node_modules');
const appUrlRoot = '';

module.exports = {
    entry: {
        vendor: [
            'aurelia-bootstrapper-webpack',
            'aurelia-event-aggregator',
            'aurelia-framework',
            'aurelia-history-browser',
            'aurelia-logging-console',
            'aurelia-templating-binding',
            'aurelia-templating-router',
            'aurelia-templating-resources'
        ],
        app: [path.join(srcDir, 'main.ts')],
        tapShell: [path.join(tapShellSrcDir, 'index.ts')],
        tapFx: [path.join(tapFxSrcDir, 'index.ts')],
        tapExt1: [path.join(tapExt1SrcDir, 'index.ts')]
    },

    output: {
        path: outDir,
        publicPath: appUrlRoot,
        filename: '[name]-bundle.js',
        chunkFilename: '[name]-bundle.[id].js',
        sourceMapFilename: '[name]-bundle.js.map'
    },

    resolve: {
        extensions: ['.ts', '.js'],
        modules: [srcDir, tapFxSrcDir, tapShellSrcDir, tapExt1SrcDir, nodeModulesDir].map(dir => path.resolve(dir))
    },

    devtool: 'source-map',

    module: {
        rules: [
            { test: /\.ts$/, loader: 'awesome-typescript-loader' },
            { test: /\.html$/, loader: 'html-loader' }
        ]
    },

    plugins: [
        new AureliaWebPackPlugin(),
        new TsConfigPathsPlugin(),
        new CheckerPlugin(),
        new webpack.optimize.CommonsChunkPlugin('vendor'),
        new HtmlWebpackPlugin({
            template: 'index.html',
            chunks: [
                'vendor',
                'app',
                'tapFx',
                'tapShell'
            ],
            chunksSortMode: 'dependency'
        })
    ]
};
