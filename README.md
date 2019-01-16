# eShell

## Downloads

### Windows

Potrebno: Windows 7, Windows 10

#### 64-bit

[ ![Download](https://api.bintray.com/packages/hernad/eShell/eShell-windows-x64/images/download.svg?version=1.31.323) ](https://dl.bintray.com/hernad/eShell/eShell-windows-x64_1.31.323.zip)

#### 32-bit

[ ![Download](https://api.bintray.com/packages/hernad/eShell/eShell-windows-x86/images/download.svg?version=1.31.323) ](https://dl.bintray.com/hernad/eShell/eShell-windows-x86_1.31.323.zip)


### Linux

#### rpm x64 bazirane distribucije

Testirano na Centos7 x64, Fedora28 x64

<pre>
REPO=bintray-hernad-rpm-x64.repo
echo '#bintraybintray-hernad-rpm-x64 - packages by hernad from Bintray' > /tmp/$REPO
echo '[bintraybintray-hernad-rpm-x64]' >> /tmp/$REPO
echo 'name=bintray-hernad-rpm-x64' >> /tmp/$REPO
echo 'baseurl=https://dl.bintray.com/hernad/rpm-x64' >> /tmp/$REPO
echo 'gpgcheck=0' >> /tmp/$REPO
echo 'repo_gpgcheck=0' >> /tmp/$REPO
echo 'enabled=1' >> /tmp/$REPO
sudo mv /tmp/$REPO /etc/yum.repos.d/
sudo dnf -y update --repo bintraybintray-hernad-rpm-x64 --refresh || sudo yum -y update --repo bintraybintray-hernad-rpm-x64x --refresh
echo "'bintraybintray-hernad-rpm-x64' repo setup finished :)"
sudo dnf -y install eShell || sudo yum -y install eShell

</pre>


### deb x86

Testirano na Ubuntu trusty 14.04, Ubuntu xenial 16.04

<pre>
echo "deb https://dl.bintray.com/hernad/deb-x86 bout main" | sudo tee -a /etc/apt/sources.list
sudo apt-get -y update
sudo apt-get install -y --allow-unauthenticated eshell
</pre>
