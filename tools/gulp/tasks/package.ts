import { join } from 'path';
import { task, TaskFunction } from 'gulp';
import * as del from 'del';

import { getPackageDirectories } from '../utils/directory-utils';
import { kebabCase } from '../utils/string-utils';
import { compileTypeScript } from '../utils/ts-helper';
import { createModuleBundle } from '../utils/bundle-helper';
import { copyFile, fixupRelativeImports } from '../utils/file-utils';
import { TAP_FX_ROOT, RELEASE_PACKAGES_ROOT, MODULE_PACKAGE_PREFIX } from '../constants';

import './package.tap-fx';
import './package.tap-web-components';

const runSequence = require('run-sequence');

/** Creates an npm module for each tap-fx-* module */
task('build:modules', (done: TaskFunction) => {
    let modules = getPackageDirectories(TAP_FX_ROOT);
    modules.forEach(moduleName => createSubModuleTasks(moduleName));
    modules = modules.map(moduleName => kebabCase(moduleName));

    return runSequence(
        //'lint:ts',
        'clean:release:modules',
        modules.map(moduleName => `compile:${MODULE_PACKAGE_PREFIX}${moduleName}`),
        modules.map(moduleName => `build:${MODULE_PACKAGE_PREFIX}${moduleName}`),
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
        const tsconfigPath = join(TAP_FX_ROOT, moduleName, 'tsconfig.json');
        return compileTypeScript(tsconfigPath, join(releasePackageRoot, 'typings'), true);
    });

    task(`build:${packageName}`, () => buildPackageBundles(moduleName, packageName));

    task(`clean:${packageName}:javascript`, () => {
        return del([join(releasePackageRoot, 'typings', '**/*.js')]);
    });

    task(`copy:package:${packageName}`, () => {
        return copyFile(join(TAP_FX_ROOT, moduleName, 'package.json'), releasePackageRoot);
    });
}

/** Creates all bundles for a specific package */
async function buildPackageBundles(moduleName: string, packageName: string) {
    await createModuleBundle({
        moduleName: packageName,
        entry: join(RELEASE_PACKAGES_ROOT, packageName, 'typings', 'index.js'),
        dest: join(RELEASE_PACKAGES_ROOT, packageName, `${packageName}.js`),
        format: 'es',
        version: require(join(TAP_FX_ROOT, moduleName, 'package.json')).version,
        tsconfigPath: join(TAP_FX_ROOT, 'tsconfig.json')
    });
}
