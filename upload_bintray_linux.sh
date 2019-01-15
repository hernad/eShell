#!/bin/bash

# https://github.com/$BINTRAY_OWNER/greenbox/blob/apps_modular/upload_app.sh

if [[ ! `which curl` ]] ; then
    sudo apt-get install -y curl
fi

BINTRAY_API_KEY=${BINTRAY_API_KEY:-`cat bintray_api_key`}
BINTRAY_OWNER=hernad

if [ "$VSCODE_ARCH" == "x64" ]; then
  BINTRAY_REPOS=rpm-x64
  RPM_LOC=x86_64
else
  BINTRAY_REPOS=rpm-x86
  RPM_LOC=i386
fi

BINTRAY_PACKAGE=eShell
#BINTRAY_PACKAGE_VER=$BUILD_BUILDNUMBER
#FILE=${BINTRAY_PACKAGE}_${BINTRAY_PACKAGE_VER}.zip
#zip -r -v $FILE F18

#.build/linux/rpm/x86_64/eShell-1.31.305-1547472541.el7.x86_64.rpm

BINTRAY_PACKAGE_VER=`echo "const json=require('./package.json') ; console.log(json.version)" | node`

mv .build/linux/rpm/${RPM_LOC}/*.rpm .
FILE=`ls *.rpm`

#ls -lh $FILE
echo "================ arch: ${VSCODE_ARCH} ===== rpm: ${BINTRAY_REPOS} ===== package ver: ${BINTRAY_PACKAGE_VER} ======"

ls -lh $FILE

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
