#!/bin/bash

export VSCODE_ARCH=x64

npx gulp vscode-linux-${VSCODE_ARCH}-min
npx gulp vscode-linux-${VSCODE_ARCH}-build-rpm
