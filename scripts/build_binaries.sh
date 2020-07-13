#!/bin/bash

# https://github.com/Microsoft/vscode/wiki/How-to-Contribute#build-and-run


# build/node_modules/vsce/out/npm.js
# maxBuffer: 1024 * 500
# 174:                case 0: return [4 /*yield*/, new Promise(function (c, e) { return cp.exec('yarn list --prod --json', { maxBuffer: 1024 * 500, cwd: cwd, encoding: 'utf8', env: __assign({}, process.env) }, function (err, stdout) { return err ? e(err) : c(stdout); }); })];
#

#PLATFORM=linux-x64
#gulp vscode-${PLATFORM}

#PLATFORM=win32-ia32
#gulp vscode-${PLATFORM}

#PLATFORM=win32-x64
#gulp vscode-${PLATFORM}

#gulp vscode-linux-x64-build-rpm


PLATFORM=linux-x64
gulp vscode-${PLATFORM}-rpm
