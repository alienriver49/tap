'use strict';

const gulp = require('gulp');
const del = require('del');
const ts = require('gulp-typescript');
const rollup = require('gulp-rollup');
const rename = require('gulp-rename');

const TS_TARGET = 'es2015';
const TS_MODULE = 'es2015';

function cleanTapFxDist() {
    return del([
        './dist-tap-fx/**',
        '!./dist-tap-fx'
    ]);
}

function cleanTapShellDist() {
    return del([
        './dist-tap-shell/**',
        '!./dist-tap-shell'
    ]);
}

function cleanExtension1Dist() {
    return del([
        './dist-tap-extensions/extension-1/**',
        '!./dist-tap-extensions/extension-1'
    ]);
}

function compileTapFx() {
    return gulp
        .src('./src-tap-fx/**/*.ts')
        .pipe(ts({
            target: TS_TARGET,
            module: TS_MODULE,
            outDir: './dist-tap-fx',
        }))
        .pipe(gulp.dest('./dist-tap-fx'));
}

function compileTapShell() {
    return gulp
        .src('./src-tap-shell/**/*.ts')
        .pipe(ts({
            target: TS_TARGET,
            module: TS_MODULE,
            outDir: './dist-tap-shell',
        }))
        .pipe(gulp.dest('./dist-tap-shell'));
}

function compileExtension1() {
    return gulp
        .src('./src-tap-extensions/extension-1/**/*.ts')
        .pipe(ts({
            target: 'es5',
            module: "commonjs",
            outDir: './dist-tap-extensions/extension-1',
        }))
        .pipe(gulp.dest('./dist-tap-extensions/extension-1'));
}

function bundleTapFx() {
    return gulp
        .src('./dist-tap-fx/**/*.js')
        .pipe(rollup({
            entry: './dist-tap-fx/index.js',
            format: 'iife',
            moduleName: 'TapFx',
        }))
        .pipe(rename('tap-fx-bundle.js'))
        .pipe(gulp.dest('./dist-tap-fx/'));
}

function bundleTapShell() {
    return gulp
        .src('./dist-tap-shell/**/*.js')
        .pipe(rollup({
            entry: './dist-tap-shell/index.js',
            format: 'iife',
            moduleName: 'TapShell'
        }))
        .pipe(rename('tap-shell-bundle.js'))
        .pipe(gulp.dest('./dist-tap-shell'));
}

function bundleExtension1() {
    return gulp
        .src('./dist-tap-extensions/extension-1/**/*.js')
        .pipe(rollup({
            entry: './dist-tap-extensions/extension-1/index.js',
            format: 'es'
        }))
        .pipe(rename('extension-1-bundle.js'))
        .pipe(gulp.dest('./dist-tap-extensions/extension-1'));
}

gulp.task('build-tap-fx', gulp.series([
    cleanTapFxDist,
    compileTapFx,
    bundleTapFx
]));

gulp.task('build-tap-shell', gulp.series([
    cleanTapShellDist,
    compileTapShell,
    bundleTapShell
]));

gulp.task('build-extension-1', gulp.series([
    cleanExtension1Dist,
    compileExtension1,
    bundleExtension1
]));

gulp.task('build', gulp.series([
    'build-tap-fx',
    gulp.parallel([
        'build-tap-shell',
        'build-extension-1'
    ])
]))