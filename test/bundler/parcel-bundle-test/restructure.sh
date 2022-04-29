#!/bin/bash

set -e

pushd dist

# move everything but the entrypoint, index.html, into a sub-directory
mkdir -p parcel-assets
# use '--' to mark the end of options for `mv`, so that a filename is not mistaken for an option to the command
# https://github.com/koalaman/shellcheck/wiki/SC2035
mv *.js parcel-assets

# rewrite index.html's src attributes to use the new sub-directory
awk '{gsub("src=\"/index", "src=\"/.parcel-assets/index", $0); print $0;}' index.html > new_index.html
mv new_index.html index.html

popd

exit 0
