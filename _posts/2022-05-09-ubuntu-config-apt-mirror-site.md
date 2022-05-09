---
layout: post
title: "[Ubuntu] Local mirror site 구성(DVD/Repository sync)"
description: "Ubuntu 22.04"
author: chhanz
date: 2022-05-09
tags: [linux]
category: linux
---

# 목차
+ [overview](#overview)    
+ [DVD 사용](#dvd)    
    + [Mount DVD](#dvd1)    
    + [sources.list 추가](#dvd2)    
    + [Repository 추가](#dvd3)    
+ [Sync Repository](#sync)    
    + [apt-mirror 설치](#sync1)    
    + [mirror.list 수정](#sync2)    
    + [Sync Repository](#sync3)    
    + [Check Sync mirror data location](#sync4)    
+ [Mirror site 운영](#site)
    + [Mirror site 추가](#site1)    
    + [APT update](#site2)


# overview {#overview}
이번 포스팅은 DVD 를 활용하여 인터넷이 안되는 환경에서 Ubuntu package 를 다루는 방법과   
외부 환경이 아닌 내부에 Repository mirror site 를 구성하는 방법에 대해 알아보도록 하겠습니다.   

# DVD 사용 {#dvd}
주로 인터넷이 안되는 망분리 된 곳에서 많이 활용될 방식입니다.   
   
## Mount DVD {#dvd1}
아래 명령어를 통해 DVD 를 Mount 합니다.   
```bash
$ sudo mount /dev/sr0 /mnt
mount: /mnt: WARNING: source write-protected, mounted read-only.
```
   
## sources.list 추가 {#dvd2}
아래와 같이 `/etc/apt/sources.list.d/` 경로에 list 파일을 추가합니다.   
```bash
$ cat /etc/apt/sources.list.d/dvd.list
deb file:/mnt/ubuntu jammy main
```
외부와 통신이 안되는 상황이라면 외부로 설정 되어 있는 Repository 설정을 주석으로 막거나 제거합니다.   
```bash
$ vi /etc/apt/sources.list
# deb ...... .......   << 주석 처리
...
```
   
## Repository 추가 {#dvd3}
아래와 같이 Repository 목록을 update 합니다.    
```bash
root@u-node-1:/etc/apt/sources.list.d# apt-get update
Get:1 file:/mnt/ubuntu jammy InRelease
Ign:1 file:/mnt/ubuntu jammy InRelease
Get:2 file:/mnt/ubuntu jammy Release [1486 B]
Get:2 file:/mnt/ubuntu jammy Release [1486 B]
Get:3 file:/mnt/ubuntu jammy Release.gpg [833 B]
Get:3 file:/mnt/ubuntu jammy Release.gpg [833 B]
Get:4 file:/mnt/ubuntu jammy/main amd64 Packages [32.3 kB]
Ign:4 file:/mnt/ubuntu jammy/main amd64 Packages
Get:4 file:/mnt/ubuntu jammy/main amd64 Packages [32.3 kB]
Hit:5 https://ftp.lanet.kr/ubuntu jammy InRelease
Hit:6 http://security.ubuntu.com/ubuntu jammy-security InRelease
Hit:7 http://archive.ubuntu.com/ubuntu jammy InRelease
Hit:8 http://archive.ubuntu.com/ubuntu jammy-updates InRelease
Hit:9 http://archive.ubuntu.com/ubuntu jammy-backports InRelease
Reading package lists... Done
 
root@u-node-1:/etc/apt/sources.list.d# apt-add-repository -L
deb http://archive.ubuntu.com/ubuntu jammy multiverse main universe restricted
deb http://archive.ubuntu.com/ubuntu jammy-updates multiverse main universe restricted
deb http://archive.ubuntu.com/ubuntu jammy-backports multiverse main universe restricted
deb http://security.ubuntu.com/ubuntu jammy-security multiverse main universe restricted
deb https://ftp.lanet.kr/ubuntu/ jammy multiverse main universe
deb file:/mnt/ubuntu jammy main          <<< "추가된 local DVD repository"
```
   
# Sync Repository  {#sync}
내부 망 분리된 환경에 한대의 시스템에 Repository 를 Sync 하고 Sync 된 시스템에서 HTTP 서비스를 하여 Repository mirror site 를 구성하고 이용하는 방법에 대해 알아보도록 하겠습니다.   
   
## apt-mirror 설치 {#sync1}
아래와 같이 `apt-mirror` 를 설치합니다.   
**주의** : 공식 `apt-mirror` 는 최신 버전의 Ubuntu Release 를 정상적으로 Sync 하지 못하고 있습니다.   
(사유: 해당 명령어가 유지보수가 안되고 있음)   
   
관련하여 issue 및 workaround 는 아래 문서를 참고합니다.   
[https://chhanz.github.io/linux/2022/05/09/ubuntu-apt-mirror-issue/](https://chhanz.github.io/linux/2022/05/09/ubuntu-apt-mirror-issue/)   
   
## mirror.list 수정 {#sync2}
`/etc/apt/mirror.list` 를 수정하여 mirror 할 내용을 점검합니다.   
```bash
$ cat /etc/apt/mirror.list
############# config ##################
#
# set base_path    /var/spool/apt-mirror
#
# set mirror_path  $base_path/mirror
# set skel_path    $base_path/skel
# set var_path     $base_path/var
# set cleanscript $var_path/clean.sh
# set defaultarch  <running host architecture>
# set postmirror_script $var_path/postmirror.sh
# set run_postmirror 0
set nthreads     5
set _tilde 0
#
############# end config ##############
 
deb http://archive.ubuntu.com/ubuntu jammy main restricted universe multiverse
deb-amd64 http://archive.ubuntu.com/ubuntu jammy main restricted universe multiverse
deb-i386 http://archive.ubuntu.com/ubuntu jammy main restricted universe multiverse
#deb http://archive.ubuntu.com/ubuntu jammy-security main restricted universe multiverse
#deb http://archive.ubuntu.com/ubuntu jammy-updates main restricted universe multiverse
#deb http://archive.ubuntu.com/ubuntu artful-proposed main restricted universe multiverse
#deb http://archive.ubuntu.com/ubuntu artful-backports main restricted universe multiverse
 
#deb-src http://archive.ubuntu.com/ubuntu artful main restricted universe multiverse
#deb-src http://archive.ubuntu.com/ubuntu artful-security main restricted universe multiverse
#deb-src http://archive.ubuntu.com/ubuntu artful-updates main restricted universe multiverse
#deb-src http://archive.ubuntu.com/ubuntu artful-proposed main restricted universe multiverse
#deb-src http://archive.ubuntu.com/ubuntu artful-backports main restricted universe multiverse
 
clean http://archive.ubuntu.com/ubuntu
```
간단하게 주요 옵션들에 대해 정리하면,   
> `base_path` : mirror site data 저장 경로   
> `nthreads` : sync 간 사용될 wget thread 수    
> `deb` , `deb-amd64` , `deb-i386` : 현재 사용하는 OS 의 Bit, 64 Bit, 32 Bit       
   
## Sync Repository {#sync3}
아래와 같이 Repository 를 Sync 합니다.   
```bash
$ sudo apt-mirror
Downloading 114 index files using 5 threads...
Begin time: Mon May  9 10:54:15 2022
[5]... [4]... [3]... [2]... [1]... [0]...
End time: Mon May  9 10:54:21 2022
 
Processing translation indexes: [TTT]
 
Downloading 558 translation files using 5 threads...
Begin time: Mon May  9 10:54:21 2022
[5]... [4]... [3]... [2]... [1]... [0]...
End time: Mon May  9 10:54:51 2022
 
Processing DEP-11 indexes: [DDD]
 
Downloading 56 dep11 files using 5 threads...
Begin time: Mon May  9 10:54:51 2022
[5]... [4]... [3]... [2]... [1]... [0]...
End time: Mon May  9 10:54:55 2022
 
Processing indexes: [PPP]
 
3.5 GiB will be downloaded into archive.
Downloading 422 archive files using 5 threads...
Begin time: Mon May  9 10:54:58 2022
[5]... [4]... [3]... [2]... [1]... [0]...
End time: Mon May  9 10:57:47 2022
 
16.0 KiB in 1 files and 0 directories can be freed.
Run /var/spool/apt-mirror/var/clean.sh for this purpose.
 
Running the Post Mirror script ...
(/var/spool/apt-mirror/var/postmirror.sh)
 
 
Post Mirror script has completed. See above output for any possible errors.
```
      
## Check Sync mirror data location {#sync4}
기본적으로 base_path 를 설정 안했다면 아래와 같은 경로로 mirror site sync 가 완료 되어있습니다.   
```bash
root@u-node-1:/var/spool/apt-mirror/mirror/archive.ubuntu.com# ls
ubuntu
root@u-node-1:/var/spool/apt-mirror/mirror/archive.ubuntu.com# pwd
/var/spool/apt-mirror/mirror/archive.ubuntu.com
```
   
# Mirror site 운영 {#site}
`apache` 혹은 `nginx` 를 사용하는 것이 제일 좋은 방법이고 아래와 같이 간단하게 명령어 한줄로도 Mirror site 를 구동 할 수 있습니다.   
   
Python Simple HTTP Server 모듈을 이용합니다.   
```bash
root@u-node-1:/var/spool/apt-mirror/mirror/archive.ubuntu.com# python3 -m http.server
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```
   
## Mirror site 추가 {#site1}
아래와 같이 내부 Mirror site 정보를 추가합니다.   
```bash
root@u-node-1:/etc/apt# cat sources.list
deb http://localhost:8000/ubuntu jammy main restricted universe multiverse
```
   
## APT update {#site2}
아래와 같이 정상적으로 내부 Repository 에서 정보를 가져오는 것을 확인 할 수 있습니다.   
```bash
root@u-node-1:~# apt-get update
Get:1 http://localhost:8000/ubuntu jammy InRelease [270 kB]
Get:2 http://localhost:8000/ubuntu jammy/main amd64 Packages [1395 kB]
Get:3 http://localhost:8000/ubuntu jammy/main Translation-en [510 kB]
Get:4 http://localhost:8000/ubuntu jammy/main amd64 DEP-11 Metadata [423 kB]
Get:5 http://localhost:8000/ubuntu jammy/main DEP-11 48x48 Icons [100.0 kB]
Get:6 http://localhost:8000/ubuntu jammy/main DEP-11 64x64 Icons [148 kB]
Ign:7 http://localhost:8000/ubuntu jammy/main amd64 c-n-f Metadata
Get:8 http://localhost:8000/ubuntu jammy/restricted amd64 Packages [129 kB]
Get:9 http://localhost:8000/ubuntu jammy/restricted Translation-en [18.6 kB]
Ign:10 http://localhost:8000/ubuntu jammy/restricted amd64 c-n-f Metadata
Get:11 http://localhost:8000/ubuntu jammy/universe amd64 Packages [14.1 MB]
Get:12 http://localhost:8000/ubuntu jammy/universe Translation-en [5652 kB]
Get:13 http://localhost:8000/ubuntu jammy/universe amd64 DEP-11 Metadata [3559 kB]
Get:14 http://localhost:8000/ubuntu jammy/universe DEP-11 48x48 Icons [3447 kB]
Get:15 http://localhost:8000/ubuntu jammy/universe DEP-11 64x64 Icons [7609 kB]
Ign:16 http://localhost:8000/ubuntu jammy/universe amd64 c-n-f Metadata
Get:17 http://localhost:8000/ubuntu jammy/multiverse amd64 Packages [217 kB]
Get:18 http://localhost:8000/ubuntu jammy/multiverse Translation-en [112 kB]
Get:19 http://localhost:8000/ubuntu jammy/multiverse amd64 DEP-11 Metadata [42.1 kB]
Get:20 http://localhost:8000/ubuntu jammy/multiverse DEP-11 48x48 Icons [42.7 kB]
Get:21 http://localhost:8000/ubuntu jammy/multiverse DEP-11 64x64 Icons [193 kB]
Ign:22 http://localhost:8000/ubuntu jammy/multiverse amd64 c-n-f Metadata
Get:7 http://localhost:8000/ubuntu jammy/main amd64 c-n-f Metadata [30.3 kB]
Get:10 http://localhost:8000/ubuntu jammy/restricted amd64 c-n-f Metadata [488 B]
Get:16 http://localhost:8000/ubuntu jammy/universe amd64 c-n-f Metadata [286 kB]
Get:22 http://localhost:8000/ubuntu jammy/multiverse amd64 c-n-f Metadata [8372 B]
Fetched 595 kB in 3s (199 kB/s)
Reading package lists... Done
```
   
