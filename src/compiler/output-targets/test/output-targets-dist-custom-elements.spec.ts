import { path } from '@stencil/core/compiler';
import { mockConfig, mockStencilSystem, mockBuildCtx, mockCompilerCtx, mockModule } from '@stencil/core/testing';
import type * as d from '../../../declarations';
import { addCustomElementInputs, getBundleOptions, outputCustomElements } from '../dist-custom-elements';
import * as outputCustomElementsMod from '../dist-custom-elements';
import { OutputTargetDistCustomElements } from '../../../declarations';

const setup = () => {
  const sys = mockStencilSystem();
  const config: d.Config = mockConfig(sys);
  const compilerCtx = mockCompilerCtx(config);
  const buildCtx = mockBuildCtx(config, compilerCtx);
  const root = config.rootDir;
  config.configPath = '/testing-path';
  config.srcDir = '/src';
  config.buildAppCore = true;
  config.rootDir = path.join(root, 'User', 'testing', '/');
  config.namespace = 'TestApp';
  config.buildEs5 = true;
  config.globalScript = path.join(root, 'User', 'testing', 'src', 'global.ts');
  config.outputTargets = [{ type: 'dist-custom-elements' }];

  const bundleCustomElementsSpy = jest.spyOn(outputCustomElementsMod, 'bundleCustomElements');

  // console.log(compilerCtx.moduleMap);

  compilerCtx.moduleMap.set('test', mockModule());

  return { config, compilerCtx, buildCtx, bundleCustomElementsSpy };
};

describe('Custom Elements output target', () => {
  it('should return early if config.buildDist is false', async () => {
    const { config, compilerCtx, buildCtx, bundleCustomElementsSpy } = setup();
    config.buildDist = false;
    const retVal = await outputCustomElements(config, compilerCtx, buildCtx);
    expect(bundleCustomElementsSpy).not.toHaveBeenCalled();
  });

  it.each([[[]], [[{ type: 'dist' }]], [[{ type: 'dist' }, { type: 'dist-custom-elements-bundle' }]]])(
    'should return early if no appropriate output target (%j)',
    async (outputTargets) => {
      const { config, compilerCtx, buildCtx, bundleCustomElementsSpy } = setup();
      config.outputTargets = outputTargets as d.OutputTarget[];
      const retVal = await outputCustomElements(config, compilerCtx, buildCtx);
      expect(bundleCustomElementsSpy).not.toHaveBeenCalled();
    }
  );

  it('should exit without error', async () => {
    const { config, compilerCtx, buildCtx, bundleCustomElementsSpy } = setup();

    const retVal = await outputCustomElements(config, compilerCtx, buildCtx);
  });

  describe('generateEntryPoint', () => {});

  describe('addCustomElementInputs', () => {
    it('should add inputs, loader entries for components', () => {
      const { config, compilerCtx, buildCtx, bundleCustomElementsSpy } = setup();
      const bundleOptions = getBundleOptions(
        config,
        buildCtx,
        compilerCtx,
        config.outputTargets[0] as OutputTargetDistCustomElements
      );
      addCustomElementInputs(buildCtx, bundleOptions);
      // debugger;
      //
      console.log(bundleOptions.loader);

      console.log(bundleOptions);
    });
  });
});
