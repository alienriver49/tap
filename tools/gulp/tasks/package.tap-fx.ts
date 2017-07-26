import { join, relative } from 'path';
import { task } from 'gulp';
import * as runSequence from 'run-sequence';
import * as del from 'del';
import { ScriptTarget, ModuleKind, NewLineKind } from 'typescript';

import { createModuleBundle } from '../utils/bundle-helper';
import { copyFile } from '../utils/file-utils';
import { 
    TAP_FX_ROOT, 
    RELEASE_TAP_FX_BUNDLE_ROOT, 
    TAP_FX_ES2015_BUNDLE_NAME,
    TAP_FX_ES5_BUNDLE_NAME, 
    TAP_FX_UMD_BUNDLE_NAME,
    TAP_FX_PACKAGE_JSON_PATH,
    RELEASE_TAP_FX_ROOT,
    RELEASE_TAP_FX_TYPINGS_ROOT
 } from '../constants';
import { compileTypeScript, transpileFile } from '../utils/ts-helper';

task('build:tap-fx', (done) => {    
    return runSequence(
        'clean:tap-fx',
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
task('bundle:tap-fx', () => buildPackageBundles());

/** Copies the package.json for this package to the output directory */
task('copy:package:tap-fx', () => {
    return copyFile(TAP_FX_PACKAGE_JSON_PATH, RELEASE_TAP_FX_ROOT);
});

/** Cleans all javascript files from the built typings */
task('clean:tap-fx:javascript', () => {
    return del([join(RELEASE_TAP_FX_TYPINGS_ROOT, '**/*.js')]);
});

/** Builds module bundles of various types for a package */
async function buildPackageBundles() {
    //const packageJson = require(relative(process.cwd(), join(TAP_FX_ROOT, 'package.json')));
    const es2015BundlePath = join(RELEASE_TAP_FX_BUNDLE_ROOT, TAP_FX_ES2015_BUNDLE_NAME);
    const es5BundlePath = join(RELEASE_TAP_FX_BUNDLE_ROOT, TAP_FX_ES5_BUNDLE_NAME);

    await createModuleBundle({
        moduleName: 'tap-fx',
        entry: join(RELEASE_TAP_FX_TYPINGS_ROOT, 'public_api.js'),
        dest: es2015BundlePath,
        format: 'es',
        version: '1.0', //packageJson.version,
        tsconfigPath: join(TAP_FX_ROOT, 'tsconfig.json')
    });

    transpileFile(es2015BundlePath, es5BundlePath, {
        target: ScriptTarget.ES5,
        module: ModuleKind.ES2015,
        allowJs: true,
        newLine: NewLineKind.LineFeed,
        sourceMap: true
    });

    // await createModuleBundle({
    //     moduleName: 'tap-fx',
    //     entry: es5BundlePath,
    //     dest: join(RELEASE_TAP_FX_BUNDLE_ROOT, TAP_FX_UMD_BUNDLE_NAME),
    //     format: 'umd',
    //     version: packageJson.version,
    //     tsconfigPath: join(TAP_FX_ROOT, 'tsconfig.json')
    // });
}
