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
    TAP_FX_PACKAGE_JSON_PATH,
    RELEASE_TAP_FX_ROOT,
    RELEASE_TAP_FX_TYPINGS_ROOT
 } from '../constants';
import { compileTypeScript, transpileFile } from '../utils/ts-helper';

task('build:tap-fx', (done) => {    
    return runSequence(
        'clean:release:tap-fx',
        'compile:tap-fx',
        'bundle:tap-fx',
        'clean:tap-fx:javascript',
        'copy:package:tap-fx',
        done
    );
});

task('compile:tap-fx', () => {
    let tsconfigPath = join(TAP_FX_ROOT, 'tsconfig.json');
    return compileTypeScript(tsconfigPath, RELEASE_TAP_FX_TYPINGS_ROOT);
});

/** Creates the ta-fx bundle */
task('bundle:tap-fx', () => {    
    return createModuleBundle({
        moduleName: 'tap-fx',
        entry: join(RELEASE_TAP_FX_TYPINGS_ROOT, 'index.js'),
        dest: join(RELEASE_TAP_FX_ROOT, TAP_FX_ES2015_BUNDLE_NAME),
        format: 'es',
        version: require(`${TAP_FX_ROOT}package.json`).version,
        tsconfigPath: join(TAP_FX_ROOT, 'tsconfig.json')
    });
});

/** Copies the package.json for this package to the output directory */
task('copy:package:tap-fx', () => {
    return copyFiles([TAP_FX_PACKAGE_JSON_PATH], RELEASE_TAP_FX_ROOT);
});

/** Cleans all javascript files from the built typings */
task('clean:tap-fx:javascript', () => {
    return del([join(RELEASE_TAP_FX_TYPINGS_ROOT, '**/*.js')]);
});
