@echo off

echo check PowerShell execution policy:
powershell -Command "& {Get-ExecutionPolicy}"

REM get architecture x64, x32
set NODE_PROG=console.log( process.arch === "x64" ? "x64" : "ia32");
echo %NODE_PROG% | node > tmpFile
set /p VSCODE_ARCH= < tmpFile
del tmpFile

echo VSCODE_ARCH=%VSCODE_ARCH%
powershell -File build\build_windows_installer.ps1

