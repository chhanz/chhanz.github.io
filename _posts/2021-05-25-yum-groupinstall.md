---
layout: post
title: "[Linux] Yum Group 상세 활용"
description: ""
author: chhanz
date: 2021-05-25
tags: [linux]
category: linux
---

# `yum group` 관련 명령어
Group Package 를 설치 할 때, 주로 이용하는 명령어 입니다.   
`yum groupinstall` , `yum groupinfo` , `yum grouplist` 등이 있습니다.   
   
# 기본 사용법
주로 사용 하는 명령어 몇가지에 대해 알아보자.    
    
## `yum grouplist`
해당 명령은 Group Package 목록 및 설치 가능, 설치됨 여부를 확인 할 수 있습니다.    
```console
[root@fastvm-centos-7-6-30 ~]# yum group list hidden ids 
...
Available Environment Groups: 
   최소 설치 (minimal)
   계산 노드 (compute-node-environment)
   인프라 서버 (infrastructure-server-environment)
   파일 및 프린트 서버 (file-print-server-environment)
   기본 웹 서버 (web-server-environment)
   가상화 호스트 (virtualization-host-environment)
   서버 - GUI 사용 (graphical-server-environment) 
   GNOME 데스크탑 (gnome-desktop-environment)
   KDE Plasma Workspaces (kde-desktop-environment)
   개발 및 창조를 위한 워크스테이션 (developer-workstation-environment)
Available Groups:
   Anaconda 도구 (anaconda-tools)
   CentOS Linux Client product core (client-product)
   CentOS Linux ComputeNode product core (computenode-product)
   CentOS Linux Server product core (server-product)
   CentOS Linux Workstation product core (workstation-product)
   Common NetworkManager submodules (networkmanager-submodules)
   DNS 네임 서버 (dns-server)
   FTP 서버 (ftp-server)
   GNOME (gnome-desktop)
   GNOME 응용 프로그램 (gnome-apps)
   Hyper-v platform specific packages (platform-microsoft)
   ID 관리 서버 (identity-management-server)
   Infiniband 지원 (infiniband)
...
Done
```
   
## `yum groupinfo`
Package Group의 정보 및 Package sub-group 목록을 확인 할 수 있습니다.   
```console
[opc@instance-20201011-1438 ~]$ sudo yum groupinfo "Server with GUI"
Loaded plugins: langpacks, ulninfo
There is no installed groups file.
Maybe run: yum groups mark convert (see man yum)

Environment Group: Server with GUI
 Environment-Id: graphical-server-environment
 Description: Server for operating network infrastructure services, with a GUI.
 Mandatory Groups:
   +base
   +core
   +desktop-debugging
   +dial-up
   +fonts
   +gnome-desktop
   +guest-agents
   +guest-desktop-agents
   +hardware-monitoring
   +input-methods
   +internet-browser
   +multimedia
   +print-client
   +x11
 Optional Groups:
   +backup-server
   +directory-server
   +dns-server
   +file-server
   +ftp-server
   +ha
   +hardware-monitoring
   +identity-management-server
   +infiniband
   +java-platform
   +kde-desktop
   +large-systems
   +load-balancer
   +mail-server
   +mainframe-access
   +mariadb
   +network-file-system-client
   +performance
   +postgresql
   +print-server
   +remote-desktop-clients
   +remote-system-management
   +resilient-storage
   +virtualization-client
   +virtualization-hypervisor
   +virtualization-tools
```
   
## `yum groupinstall`
해당 명령은 Group Package 를 설치 할 때 사용합니다.   
(명령어에 `@` 를 Package name 에 추가하여 group package 로 명시 합니다.)   
```console
[opc@instance-20201011-1438 ~]$ sudo yum groupinstall @gnome-desktop
...
================================================================================================================================ 
Package                                           Arch         Version                          Repository                Size 
================================================================================================================================
Installing for group install "GNOME":
 NetworkManager-libreswan-gnome                    x86_64       1.2.4-2.el7                      ol7_latest                35 k 
 PackageKit-command-not-found                      x86_64       1.1.10-2.0.1.el7                 ol7_latest                20 k 
 PackageKit-gtk3-module                            x86_64       1.1.10-2.0.1.el7                 ol7_latest                12 k 
...
```
 
## `yum grouplist hidden ids`
해당 명령은 `yum grouplist` 의 추가 옵션을 포함하고 있습니다.   
해당 옵션은 Group Package Name 의 ID 값을 같이 보여주도록 하는 명령어입니다.   
   
ID 값을 이용하면 Ansible 및 Shell script 와 같은 자동화 및 Group 내의 sub-group 의 package 를 설치하는 세부적인 조절이 가능합니다.   
```console
[opc@instance-20201011-1438 ~]$ sudo yum grouplist hidden ids
Loaded plugins: langpacks, ulninfo
There is no installed groups file.
Maybe run: yum groups mark convert (see man yum)
Available Environment Groups:
   Minimal Install (minimal)
   Infrastructure Server (infrastructure-server-environment)
   File and Print Server (file-print-server-environment)
   Cinnamon Desktop (cinnamon-desktop-environment)
   MATE Desktop (mate-desktop-environment)
   Basic Web Server (web-server-environment)
   Virtualization Host (virtualization-host-environment)
   Server with GUI (graphical-server-environment)  <<
...
```
위와 같이 기존에는 `Server with GUI` 로 입력하던 Group Name 을 `graphical-server-environment` 로 변경하여 사용 할 수 있습니다.   
   
```yml
---
- name: install the 'Gnome desktop' environment group (if CentOS)
  yum:
    name: "@^gnome-desktop-environment"   <<
    state: present
  when: ansible_distribution != 'RedHat'

- name: install the 'Gnome desktop' environment group (if RedHat)
  yum:
    name: "@gnome-desktop"                <<
    state: present
  when: ansible_distribution == 'RedHat'
...
```
위 내용은 Ansible Playbook 에서 사용된 예제 입니다. (참고 : [install_gnome.yml](https://raw.githubusercontent.com/chhanz/ansible.rhel-serverbuild/master/roles/ansible.rhel-preinstall/tasks/install_gnome.yaml))   
   

