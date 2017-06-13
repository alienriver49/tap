const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { AureliaPlugin } = require('aurelia-webpack-plugin');
const { optimize: { CommonsChunkPlugin }, ProvidePlugin } = require('webpack')
const { TsConfigPathsPlugin, CheckerPlugin } = require('awesome-typescript-loader');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin')

const outDir = path.resolve(__dirname, 'dist');
const srcDir = path.resolve(__dirname, 'src');
const tapFxSrcDir = path.resolve(__dirname, 'src/tapFx');
const tapFxOutDir = path.resolve(__dirname, 'dist/tapFx');
//const tapShellSrcDir = path.resolve(__dirname, 'src/tapShell');
//const tapShellOutDir = path.resolve(__dirname, 'dist/tapShell');
const tapExt1SrcDir = path.resolve(__dirname, 'src/tapExt1');
const tapExt1OutDir = path.resolve(__dirname, 'dist/tapExt1');
const tapExt2SrcDir = path.resolve(__dirname, 'src/tapExt2');
const tapExt2OutDir = path.resolve(__dirname, 'dist/tapExt2');

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
            tapExt2SrcDir,
            nodeModulesDir
        ].map(dir => path.resolve(dir))
    },
    entry: {
        app: 'aurelia-bootstrapper',
        //tapShell: path.join(tapShellSrcDir, 'index.ts'),
        tapFx: ['aurelia-polyfills', 'aurelia-loader-webpack', path.join(tapFxSrcDir, 'index.ts')],
        tapExt1: path.join(tapExt1SrcDir, 'index.ts'),
        tapExt2: path.join(tapExt2SrcDir, 'index.ts')
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
        }),
        new CleanWebpackPlugin([outDir+"/**/*"]),
        // Use CopyWebpackPlugin to copy all html files (without bundling) from extensions to output directory
        // This will allow the shell to load them by name
        new CopyWebpackPlugin([
            { from: tapExt1SrcDir+"/*.html", to: outDir+"/ext1", flatten: "Y"},
            { from: tapExt2SrcDir+"/*.html", to: outDir+"/ext2", flatten: "Y"}
        ])
    ]
};
