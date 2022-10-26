import { describe, it } from 'mocha';
import { expect } from 'chai';
import os from 'os';
import fs from 'fs-extra';
import path from 'path';
import copyDeclarations from '../../lib/utilities/copy-declarations';
import fixturify from 'fixturify';

describe('Unit: copyDeclarations', function () {
  it('copies generated declarations for the correct package', function () {
    let { createdNodes, outputTree } = runCopy({
      packageName: 'my-package',
      paths: {
        'dummy/*': ['app/*', 'tests/dummy/app/*'],
        'my-package/*': ['addon/*'],
      },
      input: {
        addon: {
          'index.d.ts': 'export declare const foo: string',
        },
        app: {
          'app.d.ts': 'ignore me please',
        },
      },
    });

    expect(createdNodes).to.deep.equal(['index.d.ts']);
    expect(outputTree).to.deep.equal({
      'index.d.ts': 'export declare const foo: string',
    });
  });

  it('copies and merges generated declarations from subdirectories', function () {
    let { createdNodes, outputTree } = runCopy({
      packageName: 'my-package',
      paths: {
        'my-package/*': ['addon/*'],
        'my-package/src/*': ['src/*'],
      },
      input: {
        addon: {
          'index.d.ts': 'export declare const foo: string',
        },
        src: {
          'file.d.ts': 'µ',
        },
      },
    });

    expect(createdNodes).to.deep.equal(['index.d.ts', 'src', 'src/file.d.ts']);

    expect(outputTree).to.deep.equal({
      'index.d.ts': 'export declare const foo: string',
      src: {
        'file.d.ts': 'µ',
      },
    });
  });

  it('merges declarations from source with generated ones', function () {
    let { createdNodes, outputTree } = runCopy({
      packageName: 'my-package',
      pathRoots: ['addon-files', 'generated-declarations'],
      paths: {
        'my-package/*': ['addon/*'],
      },
      input: {
        'addon-files': {
          addon: {
            'file.d.ts': 'declaration for file in addon',
            'file.js': 'js source for file',
            'addon-file.d.ts': 'declaration for addon-file',
          },
        },
        'generated-declarations': {
          addon: {
            'file.d.ts': 'declaration for file in generated declarations',
            'generated-file.d.ts': 'declaration for generated-file',
          },
        },
      },
    });

    expect(createdNodes).to.deep.equal(['addon-file.d.ts', 'file.d.ts', 'generated-file.d.ts']);

    expect(outputTree).to.deep.equal({
      'addon-file.d.ts': 'declaration for addon-file',
      'file.d.ts': 'declaration for file in addon',
      'generated-file.d.ts': 'declaration for generated-file',
    });
  });

  it('ignores non-declaration files', function () {
    let { createdNodes, outputTree } = runCopy({
      packageName: 'my-package',
      paths: {
        'my-package/*': ['addon/*'],
      },
      input: {
        addon: {
          'file.d.ts': 'hello',
          'style.css': 'ignore me please',
        },
      },
    });

    expect(createdNodes).to.deep.equal(['file.d.ts']);
    expect(outputTree).to.deep.equal({
      'file.d.ts': 'hello',
    });
  });

  it('rejects invalid path mappings', function () {
    expect(() =>
      runCopy({
        packageName: 'my-package',
        input: {},
        paths: {
          'my-package/*': ['addon'],
        },
      })
    ).to.throw("Missing trailing '*' in path mapping: addon");
  });
});

function runCopy(options: {
  packageName: string;
  pathRoots?: string[];
  paths: Record<string, string[]>;
  input: fixturify.DirJSON;
}) {
  let tmpdir = `${os.tmpdir()}/e-c-tests`;
  let inputBaseDir = `${tmpdir}/compiled`;
  let outputBaseDir = `${tmpdir}/output`;
  let pathRoots = (options.pathRoots || ['.']).map((dir) => path.resolve(inputBaseDir, dir));

  fs.ensureDirSync(inputBaseDir);
  fs.ensureDirSync(outputBaseDir);

  fixturify.writeSync(inputBaseDir, options.input);

  let absoluteCopiedFiles = copyDeclarations(
    pathRoots,
    options.paths,
    options.packageName,
    outputBaseDir
  );
  let createdNodes = absoluteCopiedFiles.map((copiedFile) =>
    path.relative(outputBaseDir, copiedFile).replace(/\\/g, '/')
  );
  let outputTree = fixturify.readSync(outputBaseDir);

  fs.removeSync(tmpdir);

  return { createdNodes, outputTree };
}
