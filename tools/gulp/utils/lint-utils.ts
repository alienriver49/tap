import { join } from 'path';
import { task, src } from 'gulp';
import tslint from 'gulp-tslint';

import { TSLINT_PATH } from '../constants';

export function lintTs(paths: string[]): NodeJS.ReadWriteStream {
    return src(paths)
        .pipe(tslint({
            configuration: TSLINT_PATH,
            formatter: 'verbose'
        }))
        .pipe(tslint.report({
            reportLimit: 10
        }));
}