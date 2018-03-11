import * as ts from 'typescript';
import execa = require('execa');
import mkdirp = require('mkdirp');
import Project = require("ember-cli/lib/models/project");

export default function compile(options: { outDir: string, project: Project, flags: ts.CompilerOptions }) {
  // Ensure the output directory is created even if no files are generated
  mkdirp.sync(options.outDir);

  let flags: ts.CompilerOptions = {
    ...options.flags,
    outDir: options.outDir,
    rootDir: options.project.root,
    allowJs: false,
    noEmit: false
  };

  return execa('tsc', buildArgs(flags));
};

function buildArgs(flags: ts.CompilerOptions): string[] {
  let args: string[] = [];
  Object.keys(flags).forEach(key => {
    args.push(`--${key}`, `${flags[key]}`)
  });
  return args;
}
