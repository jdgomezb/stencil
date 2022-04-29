import * as path from 'path';

/**
 * TODO
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
   * Create and render the HTML at the provided url
   * @param url a location on disk of a file containing the HTML to load
   * @returns TODO
   */
  setupDom: (url: string) => Promise<HTMLElement>;
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
  /**
   * All HTML will be rendered as a child of the test bed - get it (and create it if it doesn't exist) so that it is
   * available for all future tests.
   */
  let testBed = document.getElementById('test-app');
  if (!testBed) {
    testBed = document.createElement('div');
    testBed.id = 'test-app';
    document.body.appendChild(testBed);
  }

  /**
   * @see {@link DomTestUtilities#setupDom}
   */
  function setupDom(url: string): Promise<HTMLElement> {
    const app = document.createElement('div');
    app.className = 'test-spec';

    if (!testBed) {
      console.error('The Stencil/Karma test bed could not be found.');
      process.exit(1);
    }

    testBed.appendChild(app);

    return renderTest(url, app);
  }

  /**
   * Render HTML for executing tests against.
   * @param url the location on disk containing the HTML to load
   * @param app a parent HTML element to place test code in
   * @returns TODO
   */
  function renderTest(url: string, app: HTMLElement): Promise<HTMLElement> {
    // 'base' is the directory that karma will serve all assets from
    url = path.join('base', url);

    return new Promise<HTMLElement>((resolve, reject) => {
      /**
       * TODO
       * @param this TODO
       * @returns TODO
       */
      const indexHtmlLoaded = function (this: XMLHttpRequest): void {
        if (this.status !== 200) {
          reject(`404: ${url}`);
          return;
        }

        app.innerHTML = this.responseText;

        /**
         * TODO
         */
        const parseScriptTags = () => {
          const tmpScripts: NodeListOf<HTMLScriptElement> = app.querySelectorAll('script');
          for (let i = 0; i < tmpScripts.length; i++) {
            const script: HTMLScriptElement = document.createElement('script');
            if (tmpScripts[i].src) {
              script.src = tmpScripts[i].src;
            }
            if (tmpScripts[i].hasAttribute('nomodule')) {
              script.setAttribute('nomodule', '');
            }
            if (tmpScripts[i].hasAttribute('type')) {
              const typeAttribute = tmpScripts[i].getAttribute('type');
              if (typeof typeAttribute === 'string') { // TODO
                script.setAttribute('type', tmpScripts[i].getAttribute('type')!);
              }
            }
            script.innerHTML = tmpScripts[i].innerHTML;

            if (tmpScripts[i].parentNode) {
              // the scripts were found by querying a common parent node, which _should_ still exist
              tmpScripts[i].parentNode!.insertBefore(script, tmpScripts[i]);
              tmpScripts[i].parentNode!.removeChild(tmpScripts[i]);
            } else {
              // if for some reason the parent node no longer exists, something's manipulated it while we were parsing
              // the script tags. this can lead to undesirable & hard to debug behavior, fail.
              reject('the parent node for script tags no longer exists. exiting.')
            }
          }
        };

        parseScriptTags();

        const appLoad = () => {
          window.removeEventListener('appload', appLoad);
          stencilReady().then(() => {
            resolve(app);
          });
        };
        window.addEventListener('appload', appLoad);
      };

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

      try {
        const testHtmlRequest = new XMLHttpRequest();
        testHtmlRequest.addEventListener('load', indexHtmlLoaded);
        testHtmlRequest.addEventListener('error', (err) => {
          console.error('error testHtmlRequest.addEventListener', err);
          reject(err);
        });
        testHtmlRequest.open('GET', url);
        testHtmlRequest.send();
      } catch (e: unknown) {
        console.error('catch error', e);
        reject(e);
      }
    });
  }

  /**
   * @see {@link DomTestUtilities#tearDownDom}
   */
  function tearDownDom(): void {
    // TODO
    testBed!.innerHTML = '';
  }

  return { setupDom, tearDownDom };
}
