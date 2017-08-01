import { task, TaskFunction } from 'gulp';
import * as runSequence from 'run-sequence';

import './tasks/clean';
import './tasks/lint';
import './tasks/package';

task('build:all', (done: TaskFunction) => {
    return runSequence(
        'clean:release',
        'build:tap-fx',
        'build:modules',
        'build:tap-web-components',
        done
    );
});
