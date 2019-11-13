#!/bin/bash

yarn
yarn electron 64

yarn compile-build
yarn gulp minify-vscode
yarn gulp vscode-linux-x64-min-ci

yarn gulp vscode-linux-x64-build-rpm
