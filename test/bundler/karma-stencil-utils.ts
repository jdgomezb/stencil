import * as path from 'path';

/**
 *
 * @returns
 */
function waitFrame(): Promise<number> {
  return new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });
}

/**
 * Utilities for creating a test bed to execute HTML rendering tests against
 */
type DomTestUtilities = {
  /**
   * Create and render an element containing the HTML at the provided url.
   * @param url the location on disk containing the HTML to load
   * @param waitForStencilReadyMs the number of milliseconds to wait for the rendering pipeline to complete
   * @returns
   */
  setupDom: (url: string, waitForStencilReadyMs?: number) => Promise<HTMLElement>;
  /**
   * Clears the test bed of any existing HTML
   */
  tearDownDom: () => void;
};

/**
 * Create setup and teardown methods for DOM based tests. All DOM based tests are created within an application
 * 'test bed' that is managed by this function.
 * @param document a `Document` compliant entity where tests may be rendered
 * @returns utilities to set up the DOM and tear it down within the test bed
 */
export function setupDomTests(document: Document): DomTestUtilities {
  let testBed = document.getElementById('test-app');
  if (!testBed) {
    testBed = document.createElement('div');
    testBed.id = 'test-app';
    document.body.appendChild(testBed);
  }

  /**
   * @see {@link DomTestUtilities#setupDom}
   */
  function setupDom(url: string, waitForStencilReadyMs?: number): Promise<HTMLElement> {
    const app = document.createElement('div');
    app.className = 'test-spec';
    testBed.appendChild(app);

    app.setAttribute('data-url', url);
    return renderTest(url, app, waitForStencilReadyMs);
  }

  /**
   * Create web component for executing tests against
   * @param url the location on disk containing the HTML to load
   * @param app
   * @param waitForStencilReadyMs the number of milliseconds to wait for the rendering pipeline to complete
   * @returns
   */
  function renderTest(url: string, app: HTMLElement, waitForStencilReadyMs: number): Promise<HTMLElement> {
    // 'base' is the directory that karma will serve all assets from
    url = path.join('base', url);

    return new Promise<HTMLElement>((resolve, reject) => {
      try {
        /**
         *
         * @returns
         */
        const stencilReady = (): Promise<any> => {
          return allReady()
            .then(() => waitFrame())
            .then(() => allReady());
        };

        /**
         *
         * @returns
         */
        const allReady = (): Promise<any[] | void> => {
          const promises: Promise<any>[] = [];

          /**
           *
           * @param promises
           * @param elm
           * @returns
           */
          const waitForDidLoad = (promises: Promise<any>[], elm: Element): void => {
            if (elm != null && elm.nodeType === 1) {
              for (let i = 0; i < elm.children.length; i++) {
                const childElm = elm.children[i];
                if (childElm.tagName.includes('-') && typeof (childElm as any).componentOnReady === 'function') {
                  promises.push((childElm as any).componentOnReady());
                }
                waitForDidLoad(promises, childElm);
              }
            }
          };

          waitForDidLoad(promises, window.document.documentElement);

          return Promise.all(promises).catch((e) => console.error(e));
        };

        /**
         *
         * @param this
         * @returns
         */
        const indexLoaded = function (this: XMLHttpRequest): void {
          if (this.status !== 200) {
            reject(`404: ${url}`);
            return;
          }
          const frag = document.createDocumentFragment();
          const elm = document.createElement('div');
          elm.innerHTML = this.responseText;
          frag.appendChild(elm);
          app.innerHTML = elm.innerHTML;

          const tmpScripts = app.querySelectorAll('script') as NodeListOf<HTMLScriptElement>;
          for (let i = 0; i < tmpScripts.length; i++) {
            const script = document.createElement('script') as HTMLScriptElement;
            if (tmpScripts[i].src) {
              script.src = tmpScripts[i].src;
            }
            if (tmpScripts[i].hasAttribute('nomodule')) {
              script.setAttribute('nomodule', '');
            }
            if (tmpScripts[i].hasAttribute('type')) {
              script.setAttribute('type', tmpScripts[i].getAttribute('type')!);
            }
            script.innerHTML = tmpScripts[i].innerHTML;

            tmpScripts[i].parentNode!.insertBefore(script, tmpScripts[i]);
            tmpScripts[i].parentNode!.removeChild(tmpScripts[i]);
          }

          elm.innerHTML = '';

          if (typeof waitForStencilReadyMs === 'number') {
            setTimeout(() => {
              resolve(app);
            }, waitForStencilReadyMs);
          } else {
            const appLoad = () => {
              window.removeEventListener('appload', appLoad);
              stencilReady().then(() => {
                resolve(app);
              });
            };
            window.addEventListener('appload', appLoad);
          }
        };

        var oReq = new XMLHttpRequest();
        oReq.addEventListener('load', indexLoaded);
        oReq.addEventListener('error', (err) => {
          console.error('error oReq.addEventListener', err);
          reject(err);
        });
        oReq.open('GET', url);
        oReq.send();
      } catch (e) {
        console.error('catch error', e);
        reject(e);
      }
    });
  }

  /**
   * @see {@link DomTestUtilities#tearDownDom}
   */
  function tearDownDom(): void {
    testBed.innerHTML = '';
  }

  return { setupDom, tearDownDom };
}
