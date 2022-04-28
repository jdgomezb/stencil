# stencil-bundler-tests

This directory contains tests that verify that Stencil libraries can be used in applications build using bundlers other
than rollup.
Specifically, this directory/suite of tests is intended to test that a Stencil component libraries that use the `dist`
output target can be loaded properly in an application using [Parcel](https://parceljs.org/), 
[Vite](https://vitejs.dev/), etc.

## sub-directories 

This directory is split into multiple subdirectories:

### component-library

This directory contains a component library that is built using the `dist` output target.
The artifacts of the build are used in every suite of tests that are found in directories adjacent to this one.

### parcel-bundle-test

This directory contains a test to validate a Stencil library that uses the `dist` output target can be used in an
application that is bundled with [Parcel](https://parceljs.org/).

### vite-bundle-test

This directory contains a test to validate a Stencil library that uses the `dist` output target can be used in an
application that is bundled with [Vite](https://vitejs.dev/).

## design & setup