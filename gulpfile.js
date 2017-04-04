'use strict';

const gulp = require('gulp');
const ts = require('gulp-typescript');
const del = require('del');

function cleanTapFxDist() {
    return del([
        './src/tap-fx-dist/**',
        '!./src/tap-fx-dist'
    ]);
}

function cleanExtension1Dist() {
    return del([
        './src-extensions/extension-1-dist/**',
        '!./src-extensions/extension-1-dist'
    ]);
}

function compileTapFx() {
    return gulp
        .src('./src/tap-fx/**/*.ts')
        .pipe(ts({
            outDir: './src/tap-fx-dist',
        }))
        .pipe(gulp.dest('./src/tap-fx-dist'));
}

function compileExtension1() {
    return gulp
        .src('./src-extensions/extension-1/**/*.ts')
        .pipe(ts({
            outDir: './src-extensions/extension-1-dist',
        }))
        .pipe(gulp.dest('./src-extensions/extension-1-dist'));
}

gulp.task('build-tap-fx', gulp.series([
    cleanTapFxDist,
    compileTapFx
]));

gulp.task('build-extension-1', gulp.series([
    cleanExtension1Dist,
    compileExtension1
]));