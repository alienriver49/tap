import { join } from 'path';
import { task } from 'gulp';

import { cleanDirectories, getPackageDirectories } from '../utils/directory-utils';
import { kebabCase } from '../utils/string-utils';
import { 
    RELEASE_ROOT, 
    TAP_FX_ROOT, 
    RELEASE_TAP_FX_ROOT, 
    MODULE_PACKAGE_PREFIX,
    RELEASE_PACKAGES_ROOT,
    RELEASE_TAP_WEB_COMPONENTS_ROOT,
    RELEASE_TAP_PORTAL_ROOT
} from '../constants';

/** Removes the release directory */
task('clean:release', () => {
    return cleanDirectories([RELEASE_ROOT]);
});


/** Removes the tap-fx package from the release directory */
task('clean:release:tap-fx', () => {
    return cleanDirectories([RELEASE_TAP_FX_ROOT]);
});

/** Removes the release directory */
task('clean:release:tap-fx-modules', () => {
    const modules = getPackageDirectories(TAP_FX_ROOT);
    const modulePaths = modules.map(moduleName => join(RELEASE_PACKAGES_ROOT, MODULE_PACKAGE_PREFIX + kebabCase(moduleName)));
    return cleanDirectories(modulePaths);
});

/** Removes the tap-portal package from the release directory */
task('clean:release:tap-portal', () => {
    return cleanDirectories([RELEASE_TAP_PORTAL_ROOT]);
});

/** Removes the tap-web-components package from the release directory */
task('clean:release:tap-web-components', () => {
    return cleanDirectories([RELEASE_TAP_WEB_COMPONENTS_ROOT]);
});
