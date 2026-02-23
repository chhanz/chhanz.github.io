---
layout: post
title: "[Ubuntu] apt-mirror 를 이용하여 sync 후, apt-get error 발생"
description: "Ubuntu 22.04"
author: chhanz
date: 2022-05-09
tags: [linux]
category: linux
---
   
# apt-mirror 를 이용하여 sync 후, apt-get error 발생
`apt-mirror` 를 이용하여 Repository 를 sync 하고 아래와 같은 에러가 발생했습니다.   
   
```console
... 생략
Ign:22 http://localhost:8000/ubuntu jammy/multiverse amd64 c-n-f Metadata
Err:7 http://localhost:8000/ubuntu jammy/main amd64 c-n-f Metadata
  404  File not found [IP: 127.0.0.1 8000]                                                  <<<
Ign:10 http://localhost:8000/ubuntu jammy/restricted amd64 c-n-f Metadata
Ign:16 http://localhost:8000/ubuntu jammy/universe amd64 c-n-f Metadata
Ign:22 http://localhost:8000/ubuntu jammy/multiverse amd64 c-n-f Metadata
Fetched 38.0 MB in 0s (128 MB/s)
Reading package lists... Done
E: Failed to fetch http://localhost:8000/ubuntu/dists/jammy/main/cnf/Commands-amd64  404  File not found [IP: 127.0.0.1 8000]       <<<
E: Some index files failed to download. They have been ignored, or old ones used instead.
... 생략
```
위와 같이 file not found 가 발생되는데 이런 원인은 `i386` 및 `amd64` 패키지가 sync 안되는 경우에도 발생 할 수 있습니다.   
    
하지만 `i386` 및 `amd64` 모든 Version 을 sync 해도 위와 같이 File not found 가 발생되는 경우는 아래와 같습니다.   
   
# 발생 원인
우리가 Repository 를 sync 할 때, 사용하는 apt-mirror 의 명령어([https://github.com/apt-mirror/apt-mirror](https://github.com/apt-mirror/apt-mirror))는 Last commit 이 3 year 전 입니다.   
새로운 maintainer 를 구한다고 readme 에 작성이 되어 있습니다.   
이런 이유로 신규 Ubuntu Release 에 해당 명령어가 정상적으로 작동을 안하는 이슈가 있습니다.    
   
# 해결 방안
공식 `apt-mirror` 를 fork 하여 수정한 [https://github.com/Stifler6996/apt-mirror](https://github.com/Stifler6996/apt-mirror) 를 이용하면 이러한 이슈들이 해결됩니다.   
   
# fork apt-mirror 사용법
아래와 같이 진행하여 명령어를 수정합니다.   
```bash
"official apt-mirror 설치"
$ sudo apt install apt-mirror

"git clone"
$ git clone https://github.com/Stifler6996/apt-mirror

"backup original command"
$ sudo mv /usr/bin/apt-mirror /usr/bin/apt-mirror.backup

"install fork apt-mirror"
$ sudo cp apt-mirror/apt-mirror /usr/bin/apt-mirror
$ sudo chmod 755 /usr/bin/apt-mirror ; sudo chown root:root /usr/bin/apt-mirror
```
   
# 이슈 해결 확인
fork apt-mirror 를 사용하여 추가로 repository 를 sync 받고 확인하면 신규 Ubuntu Release 도 정상적으로 repository 가 sync 된 것을 확인 할 수 있습니다.   
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
   
# 참고 자료
* [https://askubuntu.com/questions/1252828/apt-mirror-for-amd64-did-not-include-focal-main-dep11-and-focal-main-cnf-command](https://askubuntu.com/questions/1252828/apt-mirror-for-amd64-did-not-include-focal-main-dep11-and-focal-main-cnf-command)     
