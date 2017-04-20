'use strict';

const gulp = require('gulp');
const del = require('del');
const ts = require('gulp-typescript');
const rollup = require('rollup');

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
            allowJs: true,
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
            target: TS_TARGET,
            module: TS_MODULE,
            outDir: './dist-tap-extensions/extension-1',
        }))
        .pipe(gulp.dest('./dist-tap-extensions/extension-1'));
}

function bundleTapFx() {
    return rollup.rollup({
        entry: './dist-tap-fx/index.js'
    }).then(function (bundle) {
        return bundle.write({
            format: 'iife',
            moduleName: 'TapFx',
            dest: './dist-tap-fx/tap-fx-bundle.js'
        });
    });
}

function bundleTapShell() {
    return rollup.rollup({
        entry: './dist-tap-shell/index.js'
    }).then(function (bundle) {
        return bundle.write({
            format: 'iife',
            moduleName: 'TapShell',
            dest: './dist-tap-shell/tap-shell-bundle.js'
        });
    });
}

function bundleExtension1() {
    return rollup.rollup({
        entry: './dist-tap-extensions/extension-1/index.js'
    }).then(function (bundle) {
        return bundle.write({
            format: 'es',
            dest: './dist-tap-extensions/extension-1/extension-1-bundle.js'
        });
    });
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