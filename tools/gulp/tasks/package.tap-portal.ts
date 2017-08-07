import { join } from 'path';
import { task } from 'gulp';
import * as runSequence from 'run-sequence';
import * as del from 'del';
import { ScriptTarget, ModuleKind, NewLineKind } from 'typescript';

import { createModuleBundle } from '../utils/bundle-helper';
import { copyFiles } from '../utils/file-utils';
import { 
    TAP_PORTAL_ROOT,
    TAP_PORTAL_ES2015_BUNDLE_NAME,
    TAP_PORTAL_PACKAGE_JSON_PATH,
    RELEASE_TAP_PORTAL_ROOT,
    RELEASE_TAP_PORTAL_BUILD_ROOT
 } from '../constants';
import { compileTypeScript, transpileFile } from '../utils/ts-helper';
import { lintTs } from '../utils/lint-utils';

/** Builds the tap-portal npm package. */
task('build:tap-portal', (done) => {    
    return runSequence(
        'lint:ts:tap-portal',
        'clean:release:tap-portal',
        'compile:tap-portal',
        'bundle:tap-portal',
        'clean:tap-portal:javascript',
        'copy:package:tap-portal',
        done
    );
});

/** Lints the TypeScript for the tap-portal package */
task('lint:ts:tap-portal', () => {
    return lintTs([join(TAP_PORTAL_ROOT, '**/*!(.spec).ts')]);
});

/** Compiles the TypeScript and generates JavaScript and declaration files in the output directory. */
task('compile:tap-portal', () => {
    return compileTypeScript(TAP_PORTAL_ROOT, RELEASE_TAP_PORTAL_BUILD_ROOT, true, 'tap-fx');
});

/** Creates the tap-portal bundle */
task('bundle:tap-portal', () => {    
    return createModuleBundle({
        moduleName: 'tap-portal',
        entry: join(RELEASE_TAP_PORTAL_BUILD_ROOT, 'index.js'),
        dest: join(RELEASE_TAP_PORTAL_ROOT, TAP_PORTAL_ES2015_BUNDLE_NAME),
        format: 'es',
        version: require(`${TAP_PORTAL_ROOT}/package.json`).version
    });
});

/** Copies the package.json for this package to the output directory */
task('copy:package:tap-portal', () => {
    return copyFiles([TAP_PORTAL_PACKAGE_JSON_PATH], RELEASE_TAP_PORTAL_ROOT);
});

/** Cleans all javascript files from the built typings */
task('clean:tap-portal:javascript', () => {
    return del([join(RELEASE_TAP_PORTAL_BUILD_ROOT, '**/*.js')]);
});
