REM BINTRAY_API_KEY=${BINTRAY_API_KEY:-`cat bintray_api_key`}

set BINTRAY_OWNER=bringout
set BINTRAY_REPOS=eShell
set BINTRAY_PACKAGE=eShell-windows-%BINTRAY_ARCH%
set CURL=curl.exe

#BINTRAY_PACKAGE_VER=$BUILD_BUILDNUMBER


REM #find .build
REM #echo =======================================================
REM #.build/win32-ia32/user-setup/eShellSetup.exe

set NODE_PROG=const json=require('./package.json') ; console.log(json.version)
echo %NODE_PROG% | node > tmpFile
set /p BINTRAY_PACKAGE_VER= < tmpFile
del tmpFile

IF [%BINTRAY_ARCH%] EQU  [x64] copy package.json package-%BINTRAY_PACKAGE_VER%.txt
IF [%BINTRAY_ARCH%] EQU  [x64] set FILE=package-%BINTRAY_PACKAGE_VER%.txt


IF [%BINTRAY_ARCH%] NEQ  [x64] move package.json package-%BINTRAY_PACKAGE_VER%.txt
IF [%BINTRAY_ARCH%] NEQ  [x64] set FILE=package-%BINTRAY_PACKAGE_VER%.txt


echo "======================== package: %BINTRAY_PACKAGE% ========== package_ver: %BINTRAY_PACKAGE_VER% =================="

REM EXE=`ls eShellSetup.exe`
REM zip -r -v $FILE $EXE
dir  %FILE%
echo uploading %FILE% to bintray ...

%CURL% -s -T %FILE% ^
      -u %BINTRAY_OWNER%:%BINTRAY_API_KEY% ^
      --header "X-Bintray-Override: 1"  ^
     https://api.bintray.com/content/%BINTRAY_OWNER%/%BINTRAY_REPO%/%BINTRAY_PACKAGE%/%BINTRAY_PACKAGE_VER%/%FILE%

%CURL% -s -u %BINTRAY_OWNER%:%BINTRAY_API_KEY% ^
   -X POST https://api.bintray.com/content/%BINTRAY_OWNER%/%BINTRAY_REPOS%/%BINTRAY_PACKAGE%/%BINTRAY_PACKAGE_VER%/publish
