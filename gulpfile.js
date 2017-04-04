'use strict';

// var gulp = require('gulp'),
//     tsc = require('gulp-typescript');

// gulp.task('compile-ts', function () {
//     var sourceTsFiles = [
//         './src/tap-fx/tap-ux/controls/view-models/*.ts'
//     ];

//     var tsResult = gulp
//         .src(sourceTsFiles)
//         .pipe(tsc(tsc.createProject('tsconfig.json')));

//     tsResult.dts.pipe(gulp.dest('././src/tap-fx/tap-ux/controls/view-models/js/'));

//     return tsResult.js.pipe(gulp.dest('././src/tap-fx/tap-ux/controls/view-models/js/'));
// });