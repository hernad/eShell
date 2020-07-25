#!/bin/bash

sudo dnf -y groupinstall "Development Tools"

curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | sudo tee /etc/yum.repos.d/yarn.repo
sudo dnf -y install yarn