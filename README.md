# eShell

## Downloads
<!-- [![Build Status](https://dev.azure.com/vscode/VSCode/_apis/build/status/VS%20Code?branchName=master)](https://aka.ms/vscode-builds) -->
[![Build Status](https://dev.azure.com/vscode/VSCode/_apis/build/status/VS%20Code?branchName=master)](https://dev.azure.com/vscode/VSCode/_build/latest?definitionId=12)
[![Feature Requests](https://img.shields.io/github/issues/Microsoft/vscode/feature-request.svg)](https://github.com/Microsoft/vscode/issues?q=is%3Aopen+is%3Aissue+label%3Afeature-request+sort%3Areactions-%2B1-desc)
[![Bugs](https://img.shields.io/github/issues/Microsoft/vscode/bug.svg)](https://github.com/Microsoft/vscode/issues?utf8=✓&q=is%3Aissue+is%3Aopen+label%3Abug)
[![Gitter](https://img.shields.io/badge/chat-on%20gitter-yellow.svg)](https://gitter.im/Microsoft/vscode)


<<<<<<< HEAD
### Windows
=======
This repository ("`Code - OSS`") is where we (Microsoft) develop the [Visual Studio Code](https://code.visualstudio.com) product. Not only do we work on code and issues here, we also publish our [roadmap](https://github.com/microsoft/vscode/wiki/Roadmap), [monthly iteration plans](https://github.com/microsoft/vscode/wiki/Iteration-Plans), and our [endgame plans](https://github.com/microsoft/vscode/wiki/Running-the-Endgame). This source code is available to everyone under the standard [MIT license](https://github.com/microsoft/vscode/blob/master/LICENSE.txt).
>>>>>>> upstream/master

Potrebno: Windows 7, Windows 10

#### 64-bit

[ ![Download](https://api.bintray.com/packages/bringout/eShell/eShell-windows-x64/images/download.svg?version=1.33.103) ](https://dl.bintray.com/bringout/eShell/eShell-windows-x64_1.33.103.zip)

#### 32-bit

[ ![Download](https://api.bintray.com/packages/bringout/eShell/eShell-windows-x86/images/download.svg?version=1.33.103) ](https://dl.bintray.com/bringout/eShell/eShell-windows-x86_1.33.103.zip)


### Linux

#### rpm x64 bazirane distribucije

Testirano na Centos7 x64, Fedora28 x64

<pre>
REPO=bintray-bringout-rpm-x64.repo
echo '#bintraybintray-bringout-rpm-x64 - packages by bringout from Bintray' > /tmp/$REPO
echo '[bintraybintray-bringout-rpm-x64]' >> /tmp/$REPO
echo 'name=bintray-bringout-rpm-x64' >> /tmp/$REPO
echo 'baseurl=https://dl.bintray.com/bringout/rpm-x64' >> /tmp/$REPO
echo 'gpgcheck=0' >> /tmp/$REPO
echo 'repo_gpgcheck=0' >> /tmp/$REPO
echo 'enabled=1' >> /tmp/$REPO
sudo mv /tmp/$REPO /etc/yum.repos.d/
sudo dnf -y update --repo bintraybintray-bringout-rpm-x64 --refresh || sudo yum -y update --repo bintraybintray-bringout-rpm-x64x --refresh
echo "'bintraybintray-bringout-rpm-x64' repo setup finished :)"
sudo dnf -y install eShell || sudo yum -y install eShell
echo "ok"

</pre>


#### deb x86

Testirano na Ubuntu trusty 14.04 i386, Ubuntu xenial 16.04 i386

<pre>
echo "deb https://dl.bintray.com/bringout/deb-x86 bout main" | sudo tee -a /etc/apt/sources.list
sudo apt-get -y update
sudo apt-get install -y --allow-unauthenticated eshell
echo "ok"

</pre>
