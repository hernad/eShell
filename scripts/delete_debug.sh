#!/bin/bash

rm  src/vs/workbench/api/node/extHostDebugService.ts
rm  src/vs/workbench/parts/debug/browser/debugActions.ts
rm  src/vs/workbench/parts/debug/electron-browser/callStackView.ts
rm  src/vs/workbench/parts/debug/electron-browser/debug.contribution.ts
rm  src/vs/workbench/parts/debug/electron-browser/debugHover.ts
rm  src/vs/workbench/parts/debug/electron-browser/repl.ts
rm  src/vs/workbench/parts/debug/electron-browser/variablesView.ts
rm  src/vs/workbench/parts/debug/electron-browser/watchExpressionsView.ts

#rm -rf src/vs/workbench/contrib/debug/browser/
rm -rf src/vs/workbench/contrib/debug

rm src/vs/workbench/test/electron-browser/colorRegistry.releaseTest.ts
