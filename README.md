# eShell

### Linux Centos7

#### build

	cd $HOME
	source set_developer_toolset.sh
	cd eShell
	# PREREQUISITES:
	centos7_yum_install.sh
	yarn
	yarn compile
	scripts/code.sh

### build rpm

	scripts/centos7_build_rpm.sh

### upload rpm

	# time: cca 10min 65 MB
	scripts/upload_rpm.sh

### Download

[Centos7 RPM x64 1.47.101](https://bintray.com/bringout/rpm-x64/download_file?file_path=eShell-1.47.101-1594834543.el7.x86_64.rpm)

### rpm x64 repository setup

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


## Windows

Potrebno: Windows 7, Windows 10

### 64-bit

[ ![Download](https://api.bintray.com/packages/bringout/eShell/eShell-windows-x64/images/download.svg?version=1.41.303) ](https://dl.bintray.com/bringout/eShell/eShellSetup-x64-1.41.303.exe)


### 32-bit

[ ![Download](https://api.bintray.com/packages/bringout/eShell/eShell-windows-x86/images/download.svg?version=1.41.303) ](https://dl.bintray.com/bringout/eShell/eShellSetup-x86-1.41.303.exe)




