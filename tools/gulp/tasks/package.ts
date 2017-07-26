import { task } from 'gulp';

import { getPackageDirectories } from '../utils/directory-utils';

const runSequence = require('run-sequence');

import './package.tap-fx';

/** Creates an npm module for each tap-fx-* module */
task('build:release', (done) => {
    // let modules = getPackageDirectories(TAP_FX_ROOT);
    // modules.forEach(moduleName => createModulePackage(moduleName));

    return runSequence(
        'clean:release',
        'build:tap',
        done
    );
});

/** Creates an npm package from  */
// function createModulePackage(moduleName: string): void {
    
// }
