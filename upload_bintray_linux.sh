#!/bin/bash

# https://github.com/$BINTRAY_OWNER/greenbox/blob/apps_modular/upload_app.sh

if [[ ! `which curl` ]] ; then
    sudo apt-get install -y curl
fi

BINTRAY_API_KEY=${BINTRAY_API_KEY:-`cat bintray_api_key`}
BINTRAY_OWNER=hernad

if [ "$VSCODE_ARCH" == "x64" ]; then
  BINTRAY_REPOS=rpm-x64
else
  BINTRAY_REPOS=rpm-x86
fi

#BINTRAY_PACKAGE=eShell-windows-$BINTRAY_ARCH
#BINTRAY_PACKAGE_VER=$BUILD_BUILDNUMBER
#FILE=${BINTRAY_PACKAGE}_${BINTRAY_PACKAGE_VER}.zip
#zip -r -v $FILE F18

FILE=`ls .build/linux/rpm/${VSCODE_ARCH}/*.rpm`

#ls -lh $FILE
echo "================ .build ======== arch: ${VSCODE_ARCH} ===== rpm: ${BINTRAY_REPOS} ==========="
find .build
echo "================================================="

set
echo uploading $FILE to bintray ...

curl -s -T $FILE \
      -u $BINTRAY_OWNER:$BINTRAY_API_KEY \
      --header "X-Bintray-Override: 1" \
     https://api.bintray.com/content/$BINTRAY_OWNER/$BINTRAY_REPOS/$BINTRAY_PACKAGE/$BINTRAY_PACKAGE_VER/$FILE

curl -s -u $BINTRAY_OWNER:$BINTRAY_API_KEY \
   -X POST https://api.bintray.com/content/$BINTRAY_OWNER/$BINTRAY_REPOS/$BINTRAY_PACKAGE/$BINTRAY_PACKAGE_VER/publish

# recalc rpm metadata
curl -X POST -u ${BINTRAY_OWNER}:${BINTRAY_API_KEY} \
   https://api.bintray.com/calc_metadata/$BINTRAY_OWNER/$BINTRAY_REPOS
