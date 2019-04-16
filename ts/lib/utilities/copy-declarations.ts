import fs from 'fs-extra';
import path from 'path';
import walkSync from 'walk-sync';

export default function copyDeclarations(
  pathRoots: string[],
  paths: Record<string, string[]>,
  packageName: string,
  destDir: string
) {
  let output: string[] = [];
  for (let logicalPath of Object.keys(paths)) {
    let physicalPaths = paths[logicalPath];
    if (
      logicalPath.startsWith(`${packageName}/`) &&
      logicalPath.indexOf('/*') === logicalPath.length - 2
    ) {
      let subdirectory = logicalPath
        .replace(packageName, '')
        .replace('/*', '')
        .replace(/^\//, '');

      copySubpathDeclarations(
        output,
        pathRoots,
        path.join(destDir, subdirectory),
        physicalPaths
      );
    }
  }
  return output;
}

function copySubpathDeclarations(
  output: string[],
  pathRoots: string[],
  destDir: string,
  physicalPaths: string[]
) {
  for (let pathRoot of pathRoots) {
    for (let physicalPath of physicalPaths) {
      if (!physicalPath.endsWith('/*')) {
        throw new Error(
          `Missing trailing '*' in path mapping: ${physicalPath}`
        );
      }

      let fullRoot = path.resolve(pathRoot, physicalPath.replace(/\/\*$/, ''));
      if (!fs.existsSync(fullRoot)) {
        continue;
      }

      for (let file of walkSync(fullRoot, { globs: ['**/*.d.ts'] })) {
        let destinationPath = path.join(destDir, file);
        if (!fs.existsSync(destinationPath)) {
          copyFile(output, path.join(fullRoot, file), destinationPath);
        }
      }
    }
  }
}

function copyFile(output: string[], source: string, dest: string) {
  let segments = dest.split(/\/|\\/);

  // Make (and record the making of) any missing directories
  for (let i = 1; i < segments.length; i++) {
    let dir = segments.slice(0, i).join('/');
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir);
      output.push(`${dir}/`);
    }
  }

  fs.writeFileSync(dest, fs.readFileSync(source));
  output.push(dest);
}
