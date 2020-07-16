@echo off

set VSCODE_ARCH=x64
set BINTRAY_OWNER=bringout


REM get architecture x64, x32
set NODE_PROG=console.log( process.arch === "x64" ? "x64" : "x86");
echo %NODE_PROG% | node > tmpFile
set /p BUILD_ARCH= < tmpFile
del tmpFile

echo BUILD_ARCH=%BUILD_ARCH%

set BINTRAY_ARCH=%BUILD_ARCH%


if NOT EXIST %USERPROFILE%\.bintray_owner (
   echo potreban fajl %USERPROFILE%\.bintray_owner
   goto end
)

if NOT EXIST %USERPROFILE%\.bintray_api_key (
   echo potreban fajl %USERPROFILE%\.bintray_api_key
   goto end
)

set /p BINTRAY_OWNER= < %USERPROFILE%\.bintray_owner
set /p BINTRAY_API_KEY= < %USERPROFILE%\.bintray_api_key

call upload_bintray_win32.bat

