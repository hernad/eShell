# eShell

## == Linux Centos7 ==

### build

	cd $HOME
	source set_developer_toolset.sh
	cd eShell
	# PREREQUISITES:
	centos7_yum_install.sh
	yarn
	yarn compile # or yarn watch-client
	scripts/code.sh

### build rpm

	scripts/centos7_build_rpm.sh

### upload rpm

	# time: cca 10min 65 MB
	scripts/upload_rpm.sh

### Centos7 direct download

- [Centos7 RPM x64 1.47.101](https://bintray.com/bringout/rpm-x64/download_file?file_path=eShell-1.47.101-1594834543.el7.x86_64.rpm)

### Centos7 repository setup

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


## == Windows ==

### set developer environment x64

   	cd c:\dev
   	set_developer_toolset.cmd
   	cd c:\dev\eShell

### set developer environment x86

   	cd c:\dev
   	set_developer_toolset_x86.cmd
   	cd c:\dev\eShell

### build debug

	yarn
	yarn compile REM ili yarn watch-client

### build release

   	yarn
   	scripts\build_windows_installer.cmd

### start windows installer

   	scripts\run_eshell_installer.cmd

### push to bintray

   	scripts/upload_windows.cmd



### Windows setup download


- [Visual C++ Redistributable for Visual Studio 2015](https://www.microsoft.com/en-us/download/details.aspx?id=48145)

- [Windows setup 64-bit 1.47.101](https://bintray.com/bringout/eShell/download_file?file_path=eShellSetup-x64-1.47.101.exe)

- [Windows setup 32-bit 1.47.101](https://bintray.com/bringout/eShell/download_file?file_path=eShellSetup-x86-1.47.101.exe)





