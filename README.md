# eShell

## Downloads

### Windows

Potrebno: Windows 7, Windows 10

#### 64-bit

[ ![Download](https://api.bintray.com/packages/bringout/eShell/eShell-windows-x64/images/download.svg?version=1.31.403) ](https://dl.bintray.com/bringout/eShell/eShell-windows-x64_1.31.403.zip)

#### 32-bit

[ ![Download](https://api.bintray.com/packages/bringout/eShell/eShell-windows-x86/images/download.svg?version=1.31.403) ](https://dl.bintray.com/bringout/eShell/eShell-windows-x86_1.31.403.zip)


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
