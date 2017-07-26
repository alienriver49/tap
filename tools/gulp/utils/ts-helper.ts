import { readFileSync, writeFileSync } from 'fs';
import { relative } from 'path';
import { dest } from 'gulp';
import * as gulpTypeScript from 'gulp-typescript';
import * as merge from 'merge2';
import * as ts from 'typescript';
import * as chalk from 'chalk';
import * as gulpSourcemaps from 'gulp-sourcemaps';

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
  let inputFile = readFileSync(inputPath, 'utf-8');
  let transpiled = ts.transpileModule(inputFile, { compilerOptions: options });

  if (transpiled.diagnostics) {
    reportDiagnostics(transpiled.diagnostics as ts.Diagnostic[]);
  }

  writeFileSync(outputPath, transpiled.outputText);

  if (transpiled.sourceMapText) {
    writeFileSync(`${outputPath}.map`, transpiled.sourceMapText);
  }
}

/** Creates a TypeScript project from the provided tsconfig and emits the 
 * .js and .d.ts files in the provided output directory with sourcemaps.
 */
export function compileTypeScript(tsconfigPath: string, outputDir: string): NodeJS.ReadWriteStream {
  let tsProject = gulpTypeScript.createProject(tsconfigPath);
  let tsResult = tsProject.src()
                  .pipe(gulpSourcemaps.init())
                  .pipe(tsProject());

  return merge([
      tsResult.dts.pipe(dest(outputDir)),
      tsResult.js.pipe(gulpSourcemaps.write()).pipe(dest(outputDir))
  ]);
}
