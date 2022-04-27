process.env.CHROME_BIN = require('puppeteer').executablePath();

const localLaunchers = {
  ChromeHeadless: {
    base: 'ChromeHeadless',
    flags: [
      '--no-sandbox',
      // See https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md
      '--headless',
      '--disable-gpu',
      // Without a remote debugging port, Google Chrome exits immediately.
      '--remote-debugging-port=9333',
    ],
  },
};

module.exports = function (config) {
  config.set({
    plugins: ['karma-chrome-launcher', 'karma-jasmine', 'karma-polyfill', 'karma-typescript'],
    browsers: Object.keys(localLaunchers),

    singleRun: false, // set this to false to leave the browser open

    frameworks: ['jasmine', 'karma-typescript', 'polyfill'],

    polyfill: ['Promise'],
    preprocessors: {
      '**/*.ts': 'karma-typescript',
    },
    urlRoot: '/__karma__/',
    files: [
      // pattern: 'parcel-bundle-test/dist/*.{html,js}',
      //   'parcel-bundle-test/dist/index.html',
      // {
      //     pattern: 'parcel-bundle-test/dist/*.{html,js}',
      //     served: true,
      //     nocache: true,
      //     type:'module'
      //   },
      //   'parcel-bundle-test/parcel-bundle.spec.ts', // tells karma these are tests we need to serve & run
      { pattern: 'vite-bundle-test/dist/index.html', nocache: true, included: false },
      {
        pattern: 'vite-bundle-test/dist/**/*.js',
        included: false,

        nocache: true,
        type: 'module',
      },
      'vite-bundle-test/vite-bundle.spec.ts', // tells karma these are tests we need to serve & run
      'util.ts',

      // {
      //   pattern: path.join('test-output', 'vite', '/**/*'),
      //   watched: false,
      //   included: false,
      //   served: true,
      //   nocache: true,
      //   type: 'module',
      // },
    ],

    karmaTypescriptConfig: {
      exclude: ['./component-library'],
    },

    // http://localhost:9876/__karma__/base/vite-bundle-test/dist/assets/index.dbcbef01.js
    //TODO - this is for vite only, and still doesn't pass
    proxies: {
      '/assets/': `/base/vite-bundle-test/dist/assets/`,
      // "/assets/": "/base/vite-bundle-test/dist/assets/**"
    },

    colors: true,

    logLevel: config.LOG_DEBUG,

    reporters: ['progress'],
  });
};
