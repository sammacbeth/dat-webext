#!/bin/bash
mkdir -p addon/libdweb
cp -r node_modules/@sammacbeth/libdweb/src/* addon/libdweb/

mkdir -p addon/assets
cp node_modules/bulma/css/* addon/assets/
