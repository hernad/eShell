#!/bin/bash

# https://github.com/$BINTRAY_OWNER/greenbox/blob/apps_modular/upload_app.sh

BINTRAY_API_KEY=${BINTRAY_API_KEY:-`cat bintray_api_key`}
BINTRAY_OWNER=hernad
BINTRAY_REPOS=eShell
BINTRAY_PACKAGE=eShell-windows-${BINTRAY_ARCH}
#BINTRAY_PACKAGE_VER=$BUILD_BUILDNUMBER

#ls -lh $FILE

pacman --noconfirm -S --needed zip

echo ================= .build ==============================
find .build
echo =======================================================

if [ "$BINTRAY_ARCH" == "x64" ] ; then
   MINGW_BASE='mingw64'
   MINGW_ARCH='x86_64'

   mv .build/win32-x64/*/eShell*.exe .
else
   MINGW_BASE='mingw32'
   MINGW_ARCH='i686'
   mv .build/win32-ia32/*/eShell*.exe .
fi
pacman --noconfirm -S --needed mingw-w64-${MINGW_ARCH}-curl mingw-w64-${MINGW_ARCH}-nodejs
CURL=/$MINGW_BASE/bin/curl
NODE=/$MINGW_BASE/bin/node

$NODE --version
BINTRAY_PACKAGE_VER=`echo "const json=require('./package.json') ; console.log(json.version)" | $NODE`
FILE=${BINTRAY_PACKAGE}_${BINTRAY_PACKAGE_VER}.zip

echo "======================== package: $BINTRAY_PACKAGE ========== package_ver: $BINTRAY_PACKAGE_VER =================="

EXE=`ls eShell*.exe`
zip -r -v $FILE $EXE
echo uploading $FILE to bintray ...

$CURL -s -T $FILE \
      -u $BINTRAY_OWNER:$BINTRAY_API_KEY \
      --header "X-Bintray-Override: 1" \
     https://api.bintray.com/content/$BINTRAY_OWNER/$BINTRAY_REPOS/$BINTRAY_PACKAGE/$BINTRAY_PACKAGE_VER/$FILE

$CURL -s -u $BINTRAY_OWNER:$BINTRAY_API_KEY \
   -X POST https://api.bintray.com/content/$BINTRAY_OWNER/$BINTRAY_REPOS/$BINTRAY_PACKAGE/$BINTRAY_PACKAGE_VER/publish
