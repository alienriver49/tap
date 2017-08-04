import { readFileSync, writeFileSync } from 'fs';
import { relative } from 'path';
import { src, dest } from 'gulp';
import * as gulpTypeScript from 'gulp-typescript';
import * as merge from 'merge2';
import * as ts from 'typescript';
import * as chalk from 'chalk';
import * as gulpSourcemaps from 'gulp-sourcemaps';
import * as gulpIf from 'gulp-if';
import * as gulpReplace from 'gulp-replace';

import { getPackageDirectories } from './directory-utils';
import { TAP_FX_ROOT, MODULE_PACKAGE_PREFIX, DEFAULT_COMPILER_OPTIONS, TAP_MODULES } from '../constants';

/** Checks and reports diagnostics if present. */
function reportDiagnostics(diagnostics: ts.Diagnostic[], baseDir?: string) {
  if (diagnostics && diagnostics.length && diagnostics[0]) {
    console.error(formatDiagnostics(diagnostics, baseDir));
    throw new Error('TypeScript compilation failed.');
  }
}

/** Formats the TypeScript diagnostics into a error string. */
function formatDiagnostics(diagnostics: ts.Diagnostic[], baseDir = ''): string {
  return diagnostics.map(diagnostic => {
    let res = `• ${chalk.red(`TS${diagnostic.code}`)} - `;

    if (diagnostic.file) {
      const {line, character} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start as number);
      const filePath = relative(baseDir, diagnostic.file.fileName);

      res += `${filePath}(${line + 1},${character + 1}): `;
    }
    res += `${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`;

    return res;
  }).join('\n');
}

/** Reads an input file and transpiles it into a new file. */
export function transpileFile(inputPath: string, outputPath: string, options: ts.CompilerOptions) {
  const inputFile = readFileSync(inputPath, 'utf-8');
  const transpiled = ts.transpileModule(inputFile, { compilerOptions: options });

  if (transpiled.diagnostics) {
    reportDiagnostics(transpiled.diagnostics as ts.Diagnostic[]);
  }

  writeFileSync(outputPath, transpiled.outputText);

  if (transpiled.sourceMapText) {
    writeFileSync(`${outputPath}.map`, transpiled.sourceMapText);
  }
}

/** 
 * Creates a TypeScript project from the provided tsconfig and emits the 
 * .js and .d.ts files in the provided output directory with sourcemaps.
 */
export function compileTypeScript(rootDir: string, outputDir: string, fixupRelativePaths: boolean = false): NodeJS.ReadWriteStream {
  let moduleNames: string = '';
  const tsResult = src([`${rootDir}/**/*!(.spec).ts`])
                  .pipe(gulpSourcemaps.init())
                  .pipe(gulpTypeScript(DEFAULT_COMPILER_OPTIONS));

  if (fixupRelativePaths) {
    moduleNames = moduleNames.concat(...TAP_MODULES);
    moduleNames = getPackageDirectories(TAP_FX_ROOT).join('|');
  }

  const importRegEx: RegExp = new RegExp(`^(import(?:["'\\s]*(?:[\\w*{}\\n, ]*)from)?\\s["'])(?:\\.{1,2}\\/)[./]*?(?:fx\/)?(${moduleNames})\\/?(?:.*)(["'];?)(.*)$`, 'gm');

  return merge([
    // Declaration files
    tsResult.dts
      .pipe(gulpIf(fixupRelativePaths, gulpReplace(importRegEx, `$1${MODULE_PACKAGE_PREFIX}$2$3$4`)))
      .pipe(dest(outputDir)),

    // JavaScript files
    tsResult.js
      .pipe(gulpIf(fixupRelativePaths, gulpReplace(importRegEx, `$1${MODULE_PACKAGE_PREFIX}$2$3$4`)))
      .pipe(gulpSourcemaps.write()).pipe(dest(outputDir))
  ]);
}
