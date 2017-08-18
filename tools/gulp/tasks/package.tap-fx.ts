import { join } from 'path';
import { task } from 'gulp';
import * as runSequence from 'run-sequence';
import * as del from 'del';
import { ScriptTarget, ModuleKind, NewLineKind } from 'typescript';

import { createModuleBundle } from '../utils/bundle-helper';
import { copyFiles } from '../utils/file-utils';
import { 
    TAP_FX_ROOT, 
    TAP_FX_ES2015_BUNDLE_NAME,
    TAP_FX_COMMONJS_BUNDLE_NAME,
    TAP_FX_PACKAGE_JSON_PATH,
    RELEASE_TAP_FX_ROOT,
    RELEASE_TAP_FX_DIST_ROOT,
    RELEASE_TAP_FX_BUILD_ROOT
 } from '../constants';
import { compileTypeScript, transpileFile } from '../utils/ts-helper';
import { lintTs } from '../utils/lint-utils';

task('build:tap-fx', (done) => {    
    return runSequence(
        'lint:ts:tap-fx',
        'clean:release:tap-fx',
        'compile:tap-fx',
        'bundle:tap-fx:es',
        'bundle:tap-fx:cjs',
        'clean:tap-fx:javascript',
        'copy:package:tap-fx',
        done
    );
});

/** Lints the TypeScript for the tap-fx package */
task('lint:ts:tap-fx', () => {
    return lintTs([join(TAP_FX_ROOT, '**/*!(.spec).ts')]);
});

task('compile:tap-fx', () => {
    return compileTypeScript(TAP_FX_ROOT, RELEASE_TAP_FX_BUILD_ROOT);
});

/** Creates the tap-fx bundle */
task('bundle:tap-fx:es', () => {
    return createModuleBundle({
        moduleName: 'tap-fx',
        entry: join(RELEASE_TAP_FX_BUILD_ROOT, 'index.js'),
        dest: join(RELEASE_TAP_FX_DIST_ROOT, TAP_FX_ES2015_BUNDLE_NAME),
        format: 'es',
        version: require(`${TAP_FX_ROOT}/package.json`).version
    });
});

/** Creates the tap-fx CommonJS bundle */
task('bundle:tap-fx:cjs', () => {
    return createModuleBundle({
        moduleName: 'tap-fx',
        entry: join(RELEASE_TAP_FX_BUILD_ROOT, 'index.js'),
        dest: join(RELEASE_TAP_FX_DIST_ROOT, TAP_FX_COMMONJS_BUNDLE_NAME),
        format: 'cjs',
        version: require(`${TAP_FX_ROOT}/package.json`).version
    });
});

/** Copies the package.json for this package to the output directory */
task('copy:package:tap-fx', () => {
    return copyFiles([TAP_FX_PACKAGE_JSON_PATH], RELEASE_TAP_FX_ROOT);
});

/** Cleans all javascript files from the built typings */
task('clean:tap-fx:javascript', () => {
    return del([join(RELEASE_TAP_FX_BUILD_ROOT, '**/*.js')]);
});
