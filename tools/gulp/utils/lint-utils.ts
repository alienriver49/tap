import { join } from 'path';
import { task, src } from 'gulp';
import gulpTsLint from 'gulp-tslint';

import { TSLINT_PATH } from '../constants';

/** Lints TypeScript files in the provided file glob paths */
export function lintTs(paths: string[]): NodeJS.ReadWriteStream {
    return src(paths)
        .pipe(gulpTsLint({
            configuration: TSLINT_PATH,
            formatter: 'verbose'
        }))
        .pipe(gulpTsLint.report({
            reportLimit: 10
        }));
}
