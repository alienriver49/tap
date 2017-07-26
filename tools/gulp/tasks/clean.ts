import { task } from 'gulp';

import { cleanDirectory } from '../utils/directory-utils';
import { RELEASE_ROOT, RELEASE_TAP_FX_ROOT } from '../constants';

/** Removes the release directory */
task('clean:release', () => {
    return cleanDirectory([RELEASE_ROOT]);
});

/** Removes the tap package from the release directory */
task('clean:tap-fx', () => {
    return cleanDirectory([RELEASE_TAP_FX_ROOT]);
});

