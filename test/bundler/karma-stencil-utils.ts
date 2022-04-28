import * as path from 'path';

function waitFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });
}

/**
 *
 */
type DomTestUtilities = {
  setupDom: (url: string, waitForStencilReady?: number) => Promise<HTMLElement>,
  tearDownDom: () => void,
}

/**
 * Create setup methods for dom based tests.
 * @param document
 * @returns
 */
export function setupDomTests(document: Document): DomTestUtilities {
  let testBed = document.getElementById('test-app');
  if (!testBed) {
    testBed = document.createElement('div');
    testBed.id = 'test-app';
    document.body.appendChild(testBed);
  }

  /**
   *
   * @param url
   * @param waitForStencilReady
   * @returns
   */
  function setupDom(url: string, waitForStencilReady?: number): Promise<HTMLElement> {
    const app = document.createElement('div');
    app.className = 'test-spec';
    testBed.appendChild(app);

    app.setAttribute('data-url', url);
    return renderTest(url, app, waitForStencilReady);
  }


  /**
   * Create web component for executing tests against
   * @param url
   * @param app
   * @param waitForStencilReady
   * @returns
   */
  function renderTest(url: string, app: HTMLElement, waitForStencilReady: number): Promise<HTMLElement> {
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

          if (typeof waitForStencilReady === 'number') {
            setTimeout(() => {
              resolve(app);
            }, waitForStencilReady);
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
   * Run this after each test
   */
  function tearDownDom(): void {
    testBed.innerHTML = '';
  }

  return { setupDom, tearDownDom };
}
