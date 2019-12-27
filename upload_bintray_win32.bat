REM BINTRAY_API_KEY=${BINTRAY_API_KEY:-`cat bintray_api_key`}

set BINTRAY_OWNER=bringout
set BINTRAY_REPOS=eShell
set BINTRAY_PACKAGE=eShell-windows-%BINTRAY_ARCH%
set CURL=curl.exe


set NODE_PROG=const json=require('./package.json') ; console.log(json.version)
echo %NODE_PROG% | node > tmpFile
set /p BINTRAY_PACKAGE_VER= < tmpFile
del tmpFile

IF [%BINTRAY_ARCH%] EQU  [x64] move .build/win32-x64/user-setup/eShellSetup.exe eShellSetup-x64-%BINTRAY_PACKAGE_VER%.exe
IF [%BINTRAY_ARCH%] EQU  [x64] set FILE=eShellSetup-x64-%BINTRAY_PACKAGE_VER%.exe


IF [%BINTRAY_ARCH%] NEQ  [x64] move .build/win32-ia32/user-setup/eShellSetup.exe eShellSetup-x86-%BINTRAY_PACKAGE_VER%.exe
IF [%BINTRAY_ARCH%] NEQ  [x64] set FILE=eShellSetup-x86-%BINTRAY_PACKAGE_VER%.exe


echo "======================== package: %BINTRAY_PACKAGE% ========== package_ver: %BINTRAY_PACKAGE_VER% =================="

REM EXE=`ls eShellSetup.exe`
REM zip -r -v $FILE $EXE
dir  %FILE%
echo uploading %FILE% to bintray ...

%CURL% -s -T %FILE% ^
      -u %BINTRAY_OWNER%:%BINTRAY_API_KEY% ^
      --header "X-Bintray-Override: 1"  ^
	  	--header "X-Bintray-Publish: 1"  ^
     https://api.bintray.com/content/%BINTRAY_OWNER%/%BINTRAY_REPOS%/%BINTRAY_PACKAGE%/%BINTRAY_PACKAGE_VER%/%FILE%

%CURL% -s -u %BINTRAY_OWNER%:%BINTRAY_API_KEY% ^
   -X POST https://api.bintray.com/content/%BINTRAY_OWNER%/%BINTRAY_REPOS%/%BINTRAY_PACKAGE%/%BINTRAY_PACKAGE_VER%/publish
