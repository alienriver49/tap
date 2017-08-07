import { readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import * as del from 'del';

/**
 * Gets the names of all directories in that are direct children within the provided path.
 * Only if those directories have a package.json within them.
 */
export function getPackageDirectories(directoryPath: string): string[] {
    return readdirSync(directoryPath).filter(file => {
        const checkPath = join(directoryPath, file);
        return statSync(checkPath).isDirectory() && existsSync(join(checkPath, 'package.json'));
    });
}

/** Removes directories in the specified paths */
export function cleanDirectories(paths: string[]): Promise<string[]> {
    return del(paths);
}
