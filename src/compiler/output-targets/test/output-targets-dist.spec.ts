import { doNotExpectFiles, expectFiles } from '../../../testing/testing-utils';
import type * as d from '../../../declarations';
import { createCompiler, path } from '@stencil/core/compiler';
import { mockConfig, mockStencilSystem } from '@stencil/core/testing';

xdescribe('outputTarget, dist', () => {
  jest.setTimeout(20000);
  let compiler: d.Compiler;
  let config: d.Config;
  const root = path.resolve('/');

  const setup = async () => {
    const sys = mockStencilSystem();
    const config: d.Config = mockConfig(sys);
    config.configPath = '/testing-path';
    config.srcDir = '/src';
    config.buildAppCore = true;
    config.rootDir = path.join(root, 'User', 'testing', '/');
    config.namespace = 'TestApp';
    config.buildEs5 = true;
    config.globalScript = path.join(root, 'User', 'testing', 'src', 'global.ts');
    config.outputTargets = [{ type: 'dist' }];

    const compiler = await createCompiler(config);

    return { config, compiler };
  };

  it.only('default dist files', async () => {
    const { compiler, config } = await setup();

    let files = {
      [path.join(config.rootDir, 'polyfills/index.js')]: `/* polyfills */`,
      [path.join(root, 'User', 'testing', 'package.json')]: `{
        "module": "dist/index.mjs",
        "main": "dist/index.js",
        "collection": "dist/collection/collection-manifest.json",
        "types": "dist/types/components.d.ts"
      }`,
      [path.join(root, 'User', 'testing', 'src', 'index.html')]: `<cmp-a></cmp-a>`,
      [path.join(root, 'User', 'testing', 'src', 'components', 'cmp-a.tsx')]: `
        @Component({
          tag: 'cmp-a',
          styleUrls: {
            ios: 'cmp-a.ios.css',
            md: 'cmp-a.md.css'
          }
        }) export class CmpA {}`,
      [path.join(root, 'User', 'testing', 'src', 'components', 'cmp-a.ios.css')]: `cmp-a { color: blue; }`,
      [path.join(root, 'User', 'testing', 'src', 'components', 'cmp-a.md.css')]: `cmp-a { color: green; }`,
      [path.join(
        root,
        'User',
        'testing',
        'src',
        'global.ts'
      )]: `export default function() { console.log('my global'); }`,
    };
    Object.entries(files).forEach(([path, contents]) => {
      compiler.sys.writeFileSync(path, contents);
    });

    console.log('1');
    const r = await compiler.build();
    console.log('get here');
    // expect(r.diagnostics).toHaveLength(0);

    expectFiles(compiler.sys, [
      path.join(root, 'User', 'testing', 'dist', 'index.js'),
      path.join(root, 'User', 'testing', 'dist', 'index.mjs'),
      path.join(root, 'User', 'testing', 'dist', 'index.js.map'),

      path.join(root, 'User', 'testing', 'dist', 'collection', 'collection-manifest.json'),
      path.join(root, 'User', 'testing', 'dist', 'collection', 'components', 'cmp-a.js'),
      path.join(root, 'User', 'testing', 'dist', 'collection', 'components', 'cmp-a.js.map'),
      path.join(root, 'User', 'testing', 'dist', 'collection', 'components', 'cmp-a.ios.css'),
      path.join(root, 'User', 'testing', 'dist', 'collection', 'components', 'cmp-a.md.css'),
      path.join(root, 'User', 'testing', 'dist', 'collection', 'global.js'),
      path.join(root, 'User', 'testing', 'dist', 'collection', 'global.js.map'),

      path.join(root, 'User', 'testing', 'dist', 'esm', 'index.mjs'),
      path.join(root, 'User', 'testing', 'dist', 'esm', 'index.js.map'),
      path.join(root, 'User', 'testing', 'dist', 'esm', 'loader.mjs'),
      path.join(root, 'User', 'testing', 'dist', 'esm-es5', 'index.mjs'),
      path.join(root, 'User', 'testing', 'dist', 'esm-es5', 'index.js.map'),
      path.join(root, 'User', 'testing', 'dist', 'esm-es5', 'loader.mjs'),
      path.join(root, 'User', 'testing', 'dist', 'esm', 'polyfills', 'index.js'),
      path.join(root, 'User', 'testing', 'dist', 'esm', 'polyfills', 'index.js.map'),

      path.join(root, 'User', 'testing', 'dist', 'loader'),

      path.join(root, 'User', 'testing', 'dist', 'types'),

      path.join(root, 'User', 'testing', 'src', 'components.d.ts'),
    ]);

    doNotExpectFiles(compiler.fs, [
      path.join(root, 'User', 'testing', 'build'),
      path.join(root, 'User', 'testing', 'esm'),
      path.join(root, 'User', 'testing', 'es5'),
      path.join(root, 'User', 'testing', 'www'),
      path.join(root, 'User', 'testing', 'index.html'),
    ]);
  });
});
