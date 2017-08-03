import { join } from 'path';
import { task } from 'gulp';
import * as runSequence from 'run-sequence';
import * as del from 'del';
import { ScriptTarget, ModuleKind, NewLineKind } from 'typescript';

import { createModuleBundle } from '../utils/bundle-helper';
import { copyFiles } from '../utils/file-utils';
import { 
    TAP_WEB_COMPONENTS_ROOT,
    TAP_WEB_COMPONENTS_ES2015_BUNDLE_NAME,
    TAP_WEB_COMPONENTS_PACKAGE_JSON_PATH,
    RELEASE_TAP_WEB_COMPONENTS_ROOT,
    RELEASE_TAP_WEB_COMPONENTS_BUILD_ROOT
 } from '../constants';
import { compileTypeScript, transpileFile } from '../utils/ts-helper';
import { lintTs } from '../utils/lint-utils';

/** The main build task for tap-web-components */
task('build:tap-web-components', (done) => {    
    return runSequence(
        'lint:ts:tap-web-components',
        'clean:release:tap-web-components',
        'compile:tap-web-components',
        'copy:assets:tap-web-components',
        'bundle:tap-web-components',
        'clean:tap-web-components:javascript',
        'copy:package:tap-web-components',
        done
    );
});

/** Lints the TypeScript for the tap-web-components package */
task('lint:ts:tap-web-components', () => {
    return lintTs([join(TAP_WEB_COMPONENTS_ROOT, '**/*!(.spec).ts')]);
});

/** Compiles the TypeScript and generates JavaScript and declaration files in the output directory. */
task('compile:tap-web-components', () => {
    return compileTypeScript(TAP_WEB_COMPONENTS_ROOT, RELEASE_TAP_WEB_COMPONENTS_BUILD_ROOT, true);
});

/** Creates the tap-web-components bundle */
task('bundle:tap-web-components', () => {
    return createModuleBundle({
        moduleName: 'tap-web-components',
        entry: join(RELEASE_TAP_WEB_COMPONENTS_BUILD_ROOT, 'index.js'),
        dest: join(RELEASE_TAP_WEB_COMPONENTS_ROOT, TAP_WEB_COMPONENTS_ES2015_BUNDLE_NAME),
        format: 'es',
        version: require(`${TAP_WEB_COMPONENTS_ROOT}/package.json`).version
    });
});

/** Copies the package.json for this package to the output directory */
task('copy:package:tap-web-components', () => {
    return copyFiles([TAP_WEB_COMPONENTS_PACKAGE_JSON_PATH], RELEASE_TAP_WEB_COMPONENTS_ROOT);
});

/** Cleans all javascript files from the built typings */
task('clean:tap-web-components:javascript', () => {
    return del([join(RELEASE_TAP_WEB_COMPONENTS_BUILD_ROOT, '**/*.js')]);
});

/** Copies all assets to the output package */
task('copy:assets:tap-web-components', () => {
    const assetPaths = [
        join(TAP_WEB_COMPONENTS_ROOT, '**/*.{css,html}')
    ];
    return copyFiles(assetPaths, RELEASE_TAP_WEB_COMPONENTS_BUILD_ROOT);
});
