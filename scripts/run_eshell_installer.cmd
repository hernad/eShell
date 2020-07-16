@echo off


REM get architecture x64, x32
set NODE_PROG=console.log( process.arch === "x64" ? "x64" : "ia32");
echo %NODE_PROG% | node > tmpFile
set /p VSCODE_ARCH= < tmpFile
del tmpFile

echo %VSCODE_ARCH%

dir .build\win32-%VSCODE_ARCH%\user-setup\eShellSetup.exe

.build\win32-%VSCODE_ARCH%\user-setup\eShellSetup.exe
