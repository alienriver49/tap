import { join } from 'path';
import { task, TaskFunction } from 'gulp';
import * as del from 'del';

import { getPackageDirectories } from '../utils/directory-utils';
import { dashCase } from '../utils/string-utils';
import { compileTypeScript } from '../utils/ts-helper';
import { createModuleBundle } from '../utils/bundle-helper';
import { copyFiles, fixupRelativeImports } from '../utils/file-utils';
import { TAP_FX_ROOT, RELEASE_PACKAGES_ROOT, MODULE_PACKAGE_PREFIX } from '../constants';

import './package.tap-fx';
import './package.tap-portal';

const runSequence = require('run-sequence');

/** Creates an npm module for each tap-fx-* module */
task('build:tap-fx-modules', (done: TaskFunction) => {
    let modules = getPackageDirectories(TAP_FX_ROOT);
    modules.forEach(moduleName => createSubModuleTasks(moduleName));
    modules = modules.map(moduleName => dashCase(moduleName));

    return runSequence(
        'lint:ts:tap-fx',
        'clean:release:tap-fx-modules',
        modules.map(moduleName => `compile:${MODULE_PACKAGE_PREFIX}${moduleName}`),
        modules.map(moduleName => `build:${MODULE_PACKAGE_PREFIX}${moduleName}:es`),
        modules.map(moduleName => `build:${MODULE_PACKAGE_PREFIX}${moduleName}:cjs`),
        modules.map(moduleName => `clean:${MODULE_PACKAGE_PREFIX}${moduleName}:javascript`),
        modules.map(moduleName => `copy:package:${MODULE_PACKAGE_PREFIX}${moduleName}`),
        done
    );
});

/** Creates an npm package from  */
function createSubModuleTasks(moduleName: string): void {    
    const packageName = `${MODULE_PACKAGE_PREFIX}${moduleName}`;
    const releasePackageRoot = join(RELEASE_PACKAGES_ROOT, packageName);

    task(`compile:${packageName}`, () => {
        //const tsconfigPath = join(TAP_FX_ROOT, moduleName, 'tsconfig.json');
        const packageRoot = join(TAP_FX_ROOT, moduleName);
        return compileTypeScript(packageRoot, join(releasePackageRoot, 'typings'), true);
    });

    task(`build:${packageName}:es`, () => buildPackageBundles('es', moduleName, packageName));
    task(`build:${packageName}:cjs`, () => buildPackageBundles('cjs', moduleName, packageName));

    task(`clean:${packageName}:javascript`, () => {
        return del([join(releasePackageRoot, 'typings', '**/*.js')]);
    });

    task(`copy:package:${packageName}`, () => {
        return copyFiles([join(TAP_FX_ROOT, moduleName, 'package.json')], releasePackageRoot);
    });
}

/** Creates all bundles for a specific package */
async function buildPackageBundles(moduleFormat: 'es' | 'cjs', moduleName: string, packageName: string) {
    const outputFile = join(RELEASE_PACKAGES_ROOT, packageName, 'dist', `${packageName}${moduleFormat === 'cjs' ? '.cjs' : ''}.js`);

    await createModuleBundle({
        moduleName: packageName,
        entry: join(RELEASE_PACKAGES_ROOT, packageName, 'typings', 'index.js'),
        dest: outputFile,
        format: moduleFormat,
        version: require(join(TAP_FX_ROOT, moduleName, 'package.json')).version
    });
}
