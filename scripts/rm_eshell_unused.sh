rm -rf extensions/javascript
rm -rf extensions/java
rm -rf extensions/vb
rm -rf extensions/vscode-web-playground
rm -rf extensions/html-language-features
rm -rf extensions/json-language-features/package.json

rm src/ws/workbench/contrib/debug
rm src/vs/workbench/api/common/extHostDebugService.ts
rm src/vs/workbench/api/common/extHostSCM.ts

rm src/vs/workbench/contrib/debug/browser/debugConfigurationManager.ts
rm -rf src/vs/workbench/contrib/debug

rm src/vs/workbench/api/browser/mainThreadDebugService.ts
rm src/vs/workbench/api/browser/mainThreadSCM.ts
rm src/vs/workbench/api/node/extHostDebugService.ts

rm -rf .github

rm -rf src/vs/platform/telemetry/common

rm -rf src/vs/workbench/api/common/extHostComments.ts
rm -rf src/vs/workbench/api/browser/mainThreadLanguageFeatures.ts
rm -rf src/vs/workbench/api/common/extHostLanguageFeatures.ts

rm     src/vs/workbench/api/browser/mainThreadComments.ts
rm  -rf src/vs/platform/telemetry/test

rm -rf src/vs/workbench/contrib/experiments/test

rm -rf src/vs/workbench/test
rm -rf src/vs/editor/contrib/documentSymbols/test
rm -rf src/vs/editor/contrib/find/test
rm -rf src/vs/editor/contrib/linesOperations/test
rm -rf src/vs/editor/contrib/rename/test

rm -rf src/vs/editor/test
rm -rf src/vs/editor/contrib/wordPartOperations/test
rm -rf src/vs/workbench/contrib/extensions/test
rm -rf src/vs/workbench/contrib/terminal/test

rm -rf src/vs/workbench/services/keybinding/test

rm -rf  src/vs/editor/contrib/smartSelect/test

rm -rf src/vs/workbench/contrib/comments

rm -rf src/vs/workbench/contrib/scm

rm src/vs/workbench/services/telemetry/browser/telemetryService.ts

rm -rf src/vs/workbench/contrib/telemetry

rm -rf src/vs/workbench/contrib/search/test

rm -rf src/vs/workbench/services/editor/test
rm -rf src/vs/workbench/services/label/test
rm -rf src/vs/workbench/services/workingCopy/test

rm -rf src/vs/workbench/services/configurationResolver/test

rm -rf src/vs/platform/userDataSync/test

find src -name test -type d -exec rm -rf \{\} +
