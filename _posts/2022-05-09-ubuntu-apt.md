---
layout: post
title: "[Ubuntu] APT Repository 사용법"
description: "Ubuntu 22.04"
author: chhanz
date: 2022-05-09
tags: [linux]
category: linux
---
   
# Ubuntu 22.04 - APT Repository 사용법
## Repository Component 종류
Ubuntu 에서 사용되는 Repository Component 는 아래와 같습니다.   
> 1. `Main` : Ubuntu 무료 및 오픈소스 소프트웨어   
> 2. `Universe` : Linux 커뮤니티의 무료 및 오픈소스 소프트웨어   
> 3. `Restricted` : Vender 장치 드라이버 및 소프트웨어   
> 4. `Multiverse` : 법적 제한(저작권 등)이 있는 소프트웨어   
   
## Default Repository 
Ubuntu 가 설치되면 기본적으로 아래와 같이 `/etc/apt/sources.list` 파일로 Repository 가 관리됩니다.   
```bash
root@u-node-1:/etc/apt/sources.list.d# cat /etc/apt/sources.list | egrep -v "#|^$"
deb http://archive.ubuntu.com/ubuntu jammy main restricted
deb http://archive.ubuntu.com/ubuntu jammy-updates main restricted
deb http://archive.ubuntu.com/ubuntu jammy universe
deb http://archive.ubuntu.com/ubuntu jammy-updates universe
deb http://archive.ubuntu.com/ubuntu jammy multiverse
deb http://archive.ubuntu.com/ubuntu jammy-updates multiverse
deb http://archive.ubuntu.com/ubuntu jammy-backports main restricted universe multiverse
deb http://security.ubuntu.com/ubuntu jammy-security main restricted
deb http://security.ubuntu.com/ubuntu jammy-security universe
deb http://security.ubuntu.com/ubuntu jammy-security multiverse
```
   
## sources.list 의 구조
sources.list 는 아래와 같은 구조로 작성됩니다.   
```console
<package version> <mirror site url> <release code> <repository component, component, component..........>
```
Package Version 은 `deb` , `deb-i386` , `deb-amd64` 3가지 Version 이 있습니다.   
`deb` 는 현재 OS Bit (ex. 64bit) 와 일치하는 Package version 을 뜻하며,   
`deb-i386`, `deb-amd64` 는 각각 32bit, 64bit 를 뜻합니다.   
   
## sources.list manual configuration
`/etc/apt/sources.list` 혹은 `/etc/apt/sources.list.d/` 에 위 구조를 참고하여 수동으로 Repository 를 추가하면 됩니다.   
아래는 수동으로 카카오 Repository 를 추가한 상태입니다.   
```bash
root@u-node-1:/etc/apt/sources.list.d# cat /etc/apt/sources.list.d/kr.list
deb https://mirror.kakao.com/ubuntu/ jammy main restricted
```
   
## `apt-add-repository` command 를 이용한 설정
아래 내용은 Command 를 이용하여 Repository 를 관리하는 방법에 대하여 설명하고 있습니다.   
   
### 현재 Repository 목록
`apt-add-repository` or `add-apt-repository` 명령어를 이용하여 확인이 가능합니다.   
목록을 확인하는 옵션은 `-L` 입니다. (Ubuntu 22.04)   
```bash
root@u-node-1:~# apt-add-repository -L
deb http://archive.ubuntu.com/ubuntu jammy universe main restricted multiverse
deb http://archive.ubuntu.com/ubuntu jammy-updates universe main restricted multiverse
deb http://archive.ubuntu.com/ubuntu jammy-backports universe main restricted multiverse
deb http://security.ubuntu.com/ubuntu jammy-security universe main restricted multiverse
deb https://mirror.kakao.com/ubuntu/ jammy main restricted
```
   
### Repository 추가
`-U` 옵션을 통해 Repositoty 를 추가 및 업데이트가 가능합니다. (Ubuntu 22.04)   
```bash
root@u-node-1:~# apt-add-repository -U https://ftp.lanet.kr/ubuntu/
Repository: 'deb https://ftp.lanet.kr/ubuntu/ jammy main'
Description:
Archive for codename: jammy components: main
More info: https://ftp.lanet.kr/ubuntu/
Adding repository.
Press [ENTER] to continue or Ctrl-c to cancel.
Adding deb entry to /etc/apt/sources.list.d/archive_uri-https_ftp_lanet_kr_ubuntu_-jammy.list
Adding disabled deb-src entry to /etc/apt/sources.list.d/archive_uri-https_ftp_lanet_kr_ubuntu_-jammy.list
Hit:1 https://mirror.kakao.com/ubuntu jammy InRelease
Get:2 https://ftp.lanet.kr/ubuntu jammy InRelease [270 kB]
Get:3 https://ftp.lanet.kr/ubuntu jammy/main amd64 Packages [1395 kB]
Hit:4 http://archive.ubuntu.com/ubuntu jammy InRelease
Get:5 https://ftp.lanet.kr/ubuntu jammy/main Translation-en [510 kB]
Hit:6 http://security.ubuntu.com/ubuntu jammy-security InRelease
Get:7 https://ftp.lanet.kr/ubuntu jammy/main amd64 DEP-11 Metadata [423 kB]
Get:8 https://ftp.lanet.kr/ubuntu jammy/main DEP-11 48x48 Icons [100.0 kB]
Hit:9 http://archive.ubuntu.com/ubuntu jammy-updates InRelease
Get:10 https://ftp.lanet.kr/ubuntu jammy/main DEP-11 64x64 Icons [148 kB]
Get:11 https://ftp.lanet.kr/ubuntu jammy/main amd64 c-n-f Metadata [30.3 kB]
Hit:12 http://archive.ubuntu.com/ubuntu jammy-backports InRelease
Fetched 2876 kB in 1s (2090 kB/s)
Reading package lists... Done
 
root@u-node-1:~# apt-add-repository -L
deb http://archive.ubuntu.com/ubuntu jammy universe restricted multiverse main
deb http://archive.ubuntu.com/ubuntu jammy-updates universe restricted multiverse main
deb http://archive.ubuntu.com/ubuntu jammy-backports universe restricted multiverse main
deb http://security.ubuntu.com/ubuntu jammy-security universe restricted multiverse main
deb https://mirror.kakao.com/ubuntu/ jammy restricted main
deb https://ftp.lanet.kr/ubuntu/ jammy main             << "추가된 Repository"
```
   
### 특정 Component 추가
`-U` 옵션과 `-c` 옵션을 추가하여 Component 를 추가 할 수 있습니다.   
```bash
root@u-node-1:~# apt-add-repository -U https://ftp.lanet.kr/ubuntu/ -c multiverse
Repository: 'deb https://ftp.lanet.kr/ubuntu/ jammy multiverse'
Description:
Archive for codename: jammy components: multiverse
More info: https://ftp.lanet.kr/ubuntu/
Adding repository.
Press [ENTER] to continue or Ctrl-c to cancel.
Archive has template, updating /etc/apt/sources.list
Updating existing entry instead of using /etc/apt/sources.list
Hit:1 https://mirror.kakao.com/ubuntu jammy InRelease
Hit:2 https://ftp.lanet.kr/ubuntu jammy InRelease
Get:3 https://ftp.lanet.kr/ubuntu jammy/multiverse amd64 Packages [217 kB]
Get:4 https://ftp.lanet.kr/ubuntu jammy/multiverse Translation-en [112 kB]
Get:5 https://ftp.lanet.kr/ubuntu jammy/multiverse amd64 DEP-11 Metadata [42.1 kB]
Get:6 https://ftp.lanet.kr/ubuntu jammy/multiverse DEP-11 48x48 Icons [42.7 kB]
Get:7 https://ftp.lanet.kr/ubuntu jammy/multiverse DEP-11 64x64 Icons [193 kB]
Get:8 https://ftp.lanet.kr/ubuntu jammy/multiverse amd64 c-n-f Metadata [8372 B]
Hit:9 http://security.ubuntu.com/ubuntu jammy-security InRelease
Hit:10 http://archive.ubuntu.com/ubuntu jammy InRelease
Hit:11 http://archive.ubuntu.com/ubuntu jammy-updates InRelease
Hit:12 http://archive.ubuntu.com/ubuntu jammy-backports InRelease
Fetched 615 kB in 2s (395 kB/s)
Reading package lists... Done
```
   
이후 아래와 같이 Component 가 추가 된 것을 확인 할 수 있습니다.   
```bash
root@u-node-1:~# cat /etc/apt/sources.list | tail -n1
deb https://ftp.lanet.kr/ubuntu/ jammy main multiverse
```
   
### Repository 제거 (특정 component 제거)
아래와 같이 `-r` 옵션을 이용하여 Repository 를 제거 할 수 있습니다.   
```bash
root@u-node-1:~# apt-add-repository -r https://mirror.kakao.com/ubuntu -c restricted
Repository: 'deb https://mirror.kakao.com/ubuntu jammy restricted'
Description:
Archive for codename: jammy components: restricted
More info: https://mirror.kakao.com/ubuntu
Removing repository.
Press [ENTER] to continue or Ctrl-c to cancel.
Disabling deb entry in /etc/apt/sources.list.d/archive_uri-https_mirror_kakao_com_ubuntu-jammy.list
Hit:1 https://mirror.kakao.com/ubuntu jammy InRelease
Hit:2 https://ftp.lanet.kr/ubuntu jammy InRelease
Hit:3 http://security.ubuntu.com/ubuntu jammy-security InRelease
Hit:4 http://archive.ubuntu.com/ubuntu jammy InRelease
Hit:5 http://archive.ubuntu.com/ubuntu jammy-updates InRelease
Hit:6 http://archive.ubuntu.com/ubuntu jammy-backports InRelease
Reading package lists... Done
```
`-c` 옵션을 추가하면 특정 component 만 제거가 가능합니다.   
   
