import { join } from 'path';
import { task, TaskFunction } from 'gulp';
import * as runSequence from 'run-sequence';

import './tasks/clean';
import './tasks/package';

import { lintTs } from './utils/lint-utils';
import { SRC_ROOT } from './constants';

/** Runs the build tasks for all packages. */
task('build:all', (done: TaskFunction) => {
    return runSequence(
        'clean:release',
        'build:tap-fx',
        'build:tap-fx-modules',
        'build:tap-portal',
        done
    );
});

/** Lints the TypeScript code for all packages. */
task('lint:ts:all', () => {
    return runSequence(
        'lint:ts:tap-fx',
        'lint:ts:tap-portal',
        'lint:ts:tap-web-components'
    );
});
