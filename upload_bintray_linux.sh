#!/bin/bash

# https://github.com/$BINTRAY_OWNER/greenbox/blob/apps_modular/upload_app.sh

if [[ ! `which curl` ]] ; then
    sudo apt-get install -y curl
fi

BINTRAY_API_KEY=${BINTRAY_API_KEY:-`cat bintray_api_key`}
BINTRAY_OWNER=bringout

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


# https://www.jfrog.com/confluence/display/BT/Bintray+REST+API

# POST /packages/:subject/:repo/:package/versions

# {
#  "name": "1.1.5",
#  "released": "ISO8601 (yyyy-MM-dd'T'HH:mm:ss.SSSZ)", (optional)
#  "desc": "This version...",
#  "github_release_notes_file": "RELEASE.txt", (optional)
#  "github_use_tag_release_notes": true, (optional)
#  "vcs_tag": "1.1.5" (optional)
# }

# https://gist.github.com/subfuzion/08c5d85437d5d4f00e58#curl-usage


JSON_CONTENT="{\"name\":\"${BINTRAY_PACKAGE_VER}\", \"desc\": \"verzija ${BINTRAY_PACKAGE_VER}\"}"
echo creating bintray RPM version ...
echo JSON_CONTENT="$JSON_CONTENT"

echo publish version ${BINTRAY_PACKAGE_VER}
curl -X POST \
      -u $BINTRAY_OWNER:$BINTRAY_API_KEY \
    --header "Content-Type: application/json" \
		--header "X-Bintray-Publish: 1" \
    -d "$JSON_CONTENT" \
     https://api.bintray.com/packages/$BINTRAY_OWNER/$BINTRAY_REPOS/$BINTRAY_PACKAGE/versions


echo uploading RPM $FILE to bintray ...
curl -s -T $FILE \
      -u $BINTRAY_OWNER:$BINTRAY_API_KEY \
      --header "X-Bintray-Override: 1" \
			--header "X-Bintray-Publish: 1" \
     https://api.bintray.com/content/$BINTRAY_OWNER/$BINTRAY_REPOS/$BINTRAY_PACKAGE/$BINTRAY_PACKAGE_VER/$FILE

#curl -s -u $BINTRAY_OWNER:$BINTRAY_API_KEY \
#   -X POST https://api.bintray.com/content/$BINTRAY_OWNER/$BINTRAY_REPOS/$BINTRAY_PACKAGE/$BINTRAY_PACKAGE_VER/publish

echo  "recalc rpm metadata"
curl -X POST -u ${BINTRAY_OWNER}:${BINTRAY_API_KEY} \
   https://api.bintray.com/calc_metadata/$BINTRAY_OWNER/$BINTRAY_REPOS


if [ "$VSCODE_ARCH" == "x64" ]; then
  BINTRAY_REPOS=deb-x64
  BINTRAY_PACKAGE=eshell
  DEB_ARCH=amd64
else
  BINTRAY_REPOS=deb-x86
  BINTRAY_PACKAGE=eshell
  DEB_ARCH=i386
fi
DEB_POOL=pool/main/e/eshell
#DEB_INFO=deb_distribution=mydist;deb_component=main;deb_architecture=i386,amd64
DEB_INFO="deb_distribution=bout;deb_component=main;deb_architecture=$DEB_ARCH"

# https://blog.bintray.com/2014/12/16/hosting-debian-packages-on-bintray-rocks/
# https://api.bintray.com/content/myorg/myrepo/mypack/0.0.1/pool/main/m/mypack/libmypack_0.0.1_i386.deb;deb_distribution=mydist;deb_component=main;deb_architecture=i386,amd64

mv .build/linux/deb/${DEB_ARCH}/deb/*.deb .
FILE=`ls *.deb`

echo -e
echo -e
echo "DEB_PATH: $BINTRAY_OWNER/$BINTRAY_REPOS/$BINTRAY_PACKAGE/$BINTRAY_PACKAGE_VER/$DEB_POOL/$FILE;$DEB_INFO"
echo "uploading DEB $FILE to bintray ..."
curl -s -T $FILE \
      -u $BINTRAY_OWNER:$BINTRAY_API_KEY \
      --header "X-Bintray-Override: 1" \
     "https://api.bintray.com/content/$BINTRAY_OWNER/$BINTRAY_REPOS/$BINTRAY_PACKAGE/$BINTRAY_PACKAGE_VER/$DEB_POOL/$FILE;$DEB_INFO"

curl -s -u $BINTRAY_OWNER:$BINTRAY_API_KEY \
   -X POST https://api.bintray.com/content/$BINTRAY_OWNER/$BINTRAY_REPOS/$BINTRAY_PACKAGE/$BINTRAY_PACKAGE_VER/publish

# recalc deb metadata
curl -X POST -u ${BINTRAY_OWNER}:${BINTRAY_API_KEY} \
   https://api.bintray.com/calc_metadata/$BINTRAY_OWNER/$BINTRAY_REPOS
