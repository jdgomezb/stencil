import { setupDomTests } from '../util';

describe('parcel-bundle', () => {
  const { setupDom, tearDownDom } = setupDomTests(document);
  let app: HTMLElement;

  beforeEach(async () => {
    app = await setupDom('/parcel-bundle-test/dist/index.html');
  });
  afterEach(tearDownDom);

  it('should load content from dynamic import', async () => {
    const helloComponent = app.querySelector('my-component');
    console.log(app)
    console.log(helloComponent)
    expect(helloComponent.textContent.trim()).toBe("Hello, World! I'm Stencil 'Don't call me a framework' JS");
  });
});
