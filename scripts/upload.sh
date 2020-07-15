#!/bin/bash

export VSCODE_ARCH=x64
export BINTRAY_OWNER=bringout
export BINTRAY_API_KEY=`cat ~/.bintray_api_key`
export BUILD_DEB="0"
export BUILD_RPM="1"

. ./upload_bintray_linux.sh
