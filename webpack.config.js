const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { AureliaPlugin } = require('aurelia-webpack-plugin');
const { optimize: { CommonsChunkPlugin }, ProvidePlugin } = require('webpack')
const { TsConfigPathsPlugin, CheckerPlugin } = require('awesome-typescript-loader');

const outDir = path.resolve(__dirname, 'dist');
const srcDir = path.resolve(__dirname, 'src');
const tapFxSrcDir = path.resolve(__dirname, 'src/tapFx');
const tapFxOutDir = path.resolve(__dirname, 'dist/tapFx');
//const tapShellSrcDir = path.resolve(__dirname, 'src/tapShell');
//const tapShellOutDir = path.resolve(__dirname, 'dist/tapShell');
const tapExt1SrcDir = path.resolve(__dirname, 'src/tapExt1');
const tapExt1OutDir = path.resolve(__dirname, 'dist/tapExt1');

const nodeModulesDir = path.resolve(__dirname, 'node_modules');
const appUrlRoot = '';

module.exports = {
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.js'],
        modules: [
            srcDir,
            tapFxSrcDir,
            //tapShellSrcDir,
            tapExt1SrcDir,
            nodeModulesDir
        ].map(dir => path.resolve(dir))
    },
    entry: {
        app: 'aurelia-bootstrapper',
        //tapShell: path.join(tapShellSrcDir, 'index.ts'),
        tapFx: ['aurelia-polyfills', 'aurelia-loader-webpack', path.join(tapFxSrcDir, 'index.ts')],
        tapExt1: path.join(tapExt1SrcDir, 'index.ts')
    },
    output: {
        path: outDir,
        publicPath: appUrlRoot,
        filename: '[name]-bundle.js',
        sourceMapFilename: '[name]-bundle.map',
        chunkFilename: '[hash].chunk.js',
    },
    module: {
        rules: [
            { test: /\.ts$/i, loader: 'awesome-typescript-loader', exclude: nodeModulesDir },
            { test: /\.html$/, loader: 'html-loader' }
        ]
    },
    plugins: [
        new AureliaPlugin({
            nameExternalModules: false, 
            nameLocalModules: false, 
            aureliaApp: undefined,
            includeAll: 'src/app'
        }),
        new TsConfigPathsPlugin(),
        new CheckerPlugin(),
        new CommonsChunkPlugin({ name: ['common'] }),
        new HtmlWebpackPlugin({
            template: 'index.html',
            chunks: [
                'common',
                'app',
                'tapFx',
                //'tapShell'
            ],
            chunksSortMode: 'dependency'
        })
    ]
};
