---
layout: post
title: "[Linux] Package 에 포함된 file 목록 확인"
description: "Ubuntu/CentOS/Rocky/RHEL"
author: chhanz
date: 2022-07-04
tags: [linux]
category: linux
---
# Package 에 포함된 file 목록 확인
특정 Package 에 포함된 File 이 무엇인지 확인하기 위해선 아래와 같이 Linux 에 따라 확인이 가능합니다.   
   
# `CentOS` / `RHEL` / `Rocky` 계열
`rpm` 명령을 통해 확인합니다.   
```bash
 $ rpm -ql epel-release-7-11.noarch
/etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-7
/etc/yum.repos.d/epel-testing.repo
/etc/yum.repos.d/epel.repo
/usr/lib/systemd/system-preset/90-epel.preset
/usr/share/doc/epel-release-7
/usr/share/doc/epel-release-7/GPL
```
위와 같이 `epel-release` package 에 포함된 파일을 확인 할 수 있습니다.    
   
# `Ubuntu` 계열
`dpkg` 명령을 통해 확인합니다.    
```bash
$ dpkg -L tmux
/.
/usr
/usr/bin
/usr/bin/tmux
/usr/share
/usr/share/doc
/usr/share/doc/tmux
/usr/share/doc/tmux/NEWS.Debian.gz
/usr/share/doc/tmux/README
/usr/share/doc/tmux/changelog.Debian.gz
/usr/share/doc/tmux/copyright
/usr/share/doc/tmux/example_tmux.conf
/usr/share/man
/usr/share/man/man1
/usr/share/man/man1/tmux.1.gz
```
위와 같이 `tmux` package 에 포함된 파일을 확인 할 수 있습니다.    
   
# man page
## RHEL 계열
```console
$ rpm --help 
Usage: rpm [OPTION...]
...
  -l, --list                       list files in package
...
```
## Ubuntu 계열
```console
$ dpkg --help
Usage: dpkg [<option> ...] <command>
...
  -L|--listfiles <package>...      List files 'owned' by package(s).
...
```