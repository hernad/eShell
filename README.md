# eShell

## Downloads

### Windows 64-bit

[ ![Download](https://api.bintray.com/packages/hernad/eShell/eShell-windows-x64/images/download.svg?version=1.31.306) ](https://dl.bintray.com/hernad/eShell/eShell-windows-x64_1.31.306.zip)


### Windows 32-bit

[ ![Download](https://api.bintray.com/packages/hernad/eShell/eShell-windows-x86/images/download.svg?version=1.31.306) ](https://dl.bintray.com/hernad/eShell/eShell-windows-x86_1.31.306.zip)



### Linux rpm x64 bazirane distribucije (RHEL, Centos, Fedora)

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

</pre>
