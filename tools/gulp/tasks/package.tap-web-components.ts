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
    RELEASE_TAP_WEB_COMPONENTS_TYPINGS_ROOT
 } from '../constants';
import { compileTypeScript, transpileFile } from '../utils/ts-helper';

task('build:tap-web-components', (done) => {    
    return runSequence(
        'clean:release:tap-web-components',
        'compile:tap-web-components',
        'bundle:tap-web-components',
        'clean:tap-web-components:javascript',
        'copy:package:tap-web-components',
        'copy:assets:tap-web-components',
        done
    );
});

task('compile:tap-web-components', () => {
    let tsconfigPath = join(TAP_WEB_COMPONENTS_ROOT, 'tsconfig.json');
    return compileTypeScript(tsconfigPath, RELEASE_TAP_WEB_COMPONENTS_TYPINGS_ROOT);
});

/** Creates the tap-web-components bundle */
task('bundle:tap-web-components', () => {
    return createModuleBundle({
        moduleName: 'tap-web-components',
        entry: join(RELEASE_TAP_WEB_COMPONENTS_TYPINGS_ROOT, 'index.js'),
        dest: join(RELEASE_TAP_WEB_COMPONENTS_ROOT, TAP_WEB_COMPONENTS_ES2015_BUNDLE_NAME),
        format: 'es',
        version: require(`${TAP_WEB_COMPONENTS_ROOT}/package.json`).version,
        tsconfigPath: join(TAP_WEB_COMPONENTS_ROOT, 'tsconfig.json')
    });
});

/** Copies the package.json for this package to the output directory */
task('copy:package:tap-web-components', () => {
    return copyFiles([TAP_WEB_COMPONENTS_PACKAGE_JSON_PATH], RELEASE_TAP_WEB_COMPONENTS_ROOT);
});

/** Cleans all javascript files from the built typings */
task('clean:tap-web-components:javascript', () => {
    return del([join(RELEASE_TAP_WEB_COMPONENTS_TYPINGS_ROOT, '**/*.js')]);
});

/** Copies all assets to the output package */
task('copy:assets:tap-web-components', () => {
    //return copyFiles([TAP_WEB_COMPONENTS_PACKAGE_JSON_PATH], RELEASE_TAP_WEB_COMPONENTS_ROOT);
});
