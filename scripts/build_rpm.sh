#!/bin/bash

yarn
yarn electron 64

yarn compile-build
yarn gulp minify-vscode
yarn gulp vscode-linux-x64-min-ci

yarn gulp vscode-linux-x64-build-rpm

ls -lh .build/linux/rpm/x86_64/eShell-.*el7.x86_64.rpm


echo 'sudo rpm -Uvh .build/linux/rpm/x86_64/eShell-*.el7.x86_64.rpm'
