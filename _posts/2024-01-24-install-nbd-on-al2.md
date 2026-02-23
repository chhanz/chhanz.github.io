---
layout: post
title: "[Linux] Install nbd on Amazon Linux 2"
description: "Network Block Device"
author: chhanz
date: 2024-01-24
tags: [linux]
category: linux
---
   
# `nbd` (Network Block Device) 
`nbd` 를 Amazon Linux 2 에 설치하고 테스트를 해보았습니다.   
   
## Install `Server Side`
서버쪽에 원본 데이터 디스크가 있을 것이고 해당 디스크를 `nbd` 를 이용하여 클라이언트에게 제공하는 환경입니다.   
   
```bash
$ sudo amazon-linux-extras install epel

$ sudo yum -y install nbd
```
위와 같이 `epel` repository 를 활성화 하고 `nbd` 패키지를 설치합니다.   
   
```bash
$ sudo mkdir /etc/nbd-server
$ sudo vi /etc/nbd-server/config
[generic]
    listenaddr = 0.0.0.0
    port = 9090
[export]
    exportname = /dev/nvme1n1
    readonly = false
    multifile = false
    copyonwrite = false
    flush = true
    fua = true
    sync = true

$ cat /etc/sysconfig/nbd-server
# Command line options for nbd-server
OPTIONS="-C /etc/nbd-server/config"
```
위와 같이 설정 파일 저장 경로인 `/etc/nbd-server` 를 생성하고 `/etc/nbd-server/config` 설정 파일을 생성하고 `nbd` 에서 사용 할 설정을 추가합니다.   
여기서 `exportname` 이 실제로 Network Block Device 로 사용할 device 입니다.   
   
이후 `/etc/sysconfig/nbd-server` 에 OPTIONS 에 `/etc/nbd-server/config` 설정 파일을 로드 할 수 있도록 설정합니다.   
   
```bash
$ sudo systemctl enable nbd-server
$ sudo systemctl start nbd-server

$ sudo systemctl status nbd-server
● nbd-server.service - Network Block Device server
   Loaded: loaded (/usr/lib/systemd/system/nbd-server.service; disabled; vendor preset: disabled)
   Active: active (running) since Tue 2024-01-23 12:19:46 UTC; 24s ago
     Docs: man:nbd-server(1)
           man:nbd-server(5)
  Process: 29071 ExecStart=/usr/bin/nbd-server $OPTIONS (code=exited, status=0/SUCCESS)
 Main PID: 29072 (nbd-server)
   CGroup: /system.slice/nbd-server.service
           └─29072 /usr/bin/nbd-server -C /etc/nbd-server/config

Jan 23 12:19:46 ip-172-31-45-58.ap-northeast-2.compute.internal systemd[1]: Starting Network Block Device server...
Jan 23 12:19:46 ip-172-31-45-58.ap-northeast-2.compute.internal systemd[1]: Started Network Block Device server.
```
위와 같이 `nbd-server` 서비스를 시작합니다.   
   
서비스가 정상적으로 동작하면 설정한 Port 로 아래와 같이 `nbd-server` 가 동작 되는 것을 확인 할 수 있습니다.   
```bash
[root@ip-172-31-45-58 ~]# netstat -anpt | grep 9090
tcp6       0      0 :::9090                 :::*                    LISTEN      2825/nbd-server
```
   
## Install `Client Side`
초기 구성은 서버측 설치 과정과 동일합니다.   
```bash
$ sudo amazon-linux-extras install epel

$ sudo yum -y install nbd
```
   
이후 `nbd` module 을 사용 가능하도록 활성화 합니다.   
   
```bash
$ sudo modprobe nbd

$ sudo modinfo nbd
filename:       /lib/modules/5.10.201-191.748.amzn2.x86_64/kernel/drivers/block/nbd.ko
license:        GPL
description:    Network Block Device
srcversion:     42BA6025D309669B59AC8EA
...
```
   
재부팅 이후에도 `nbd` module 이 Load 되도록 아래와 같이 `nbd.conf` 를 추가합니다.   
```bash
[root@ip-172-31-36-144 ~]# echo nbd > /etc/modules-load.d/nbd.conf
```
   
아래와 같이 `nbd-client` 명령어를 이용하여 nbd 서버측과 연결을 합니다.   
```bash
$ sudo nbd-client 172.31.45.58 9090 -N export /dev/nbd0
Negotiation: ..size = 3072MB
Connected /dev/nbd0
```
   
`/dev/nbd0` device 가 생성이 되었고 사전에 서버측에서 파일시스템으로 포맷을 수행하여 바로 파일시스템을 mount 할 수 있습니다.   
```bash
$ sudo lsblk
NAME          MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
nbd0           43:0    0   3G  0 disk          <<<----!!!
nvme0n1       259:0    0   8G  0 disk
├─nvme0n1p1   259:1    0   8G  0 part /
└─nvme0n1p128 259:2    0   1M  0 part

$ sudo mount /dev/nbd0 /mnt/data
```
   
# TEST
클라이언트 측에서 작성한 데이터가 서버측에도 동일하게 확인이 가능한지 테스트 합니다.   
   
```bash
"On Client"

[root@ip-172-31-36-144 ~]# cd /mnt/data
[root@ip-172-31-36-144 ~]# dd if=/dev/zero of=/mnt/data/client-write oflag=direct bs=1M count=100
100+0 records in
100+0 records out
104857600 bytes (105 MB) copied, 0.608561 s, 172 MB/s

[root@ip-172-31-36-144 ~]# ls -la /mnt/data/client-write
-rw-r--r-- 1 root root 104857600 Jan 23 13:40 /mnt/data/client-write

[root@ip-172-31-36-144 ~]# umount /mnt/data
```
   
위와 같이 클라이언트에서 `client-write` 테스트 파일을 생성하고 파일시스템을 umount 합니다.   
    
```bash
"On Server"

[root@ip-172-31-45-58 ~]# mount /dev/nvme1n1 /mnt/data
[root@ip-172-31-45-58 ~]# ls -la /mnt/data/client-write
-rw-r--r-- 1 root root 104857600 Jan 23 13:40 /mnt/data/client-write
```
위와 같이 서버측에 기존 볼륨을 mount 하면 클라이언트측에서 작업한 내용이 원본 디스크에 반영이 된 것을 확인 할 수 있습니다.   
   
참고로 `nbd` device 는 서버측 혹은 클라이언트측 어느 한쪽에서만 사용을 권장합니다.   
자세한 내용은 [문서](https://nbd.sourceforge.io/) 의 Introduction 을 참고 하시면 좋습니다.   
   
> **문서 발췌 ...**   
> What is it: With this compiled into your kernel, Linux can use a remote server as one of its block devices. Every time the client computer wants to read /dev/nbd0, it will send a request to the server via TCP, which will reply with the data requested. This can be used for stations with low disk space (or even diskless - if you use an initrd) to borrow disk space from other computers. Unlike NFS, it is possible to put any file system on it. But (also unlike NFS), if someone has mounted NBD read/write, you must assure that no one else will have it mounted.   
   
# 참고 문서
+ [https://nbd.sourceforge.io/](https://nbd.sourceforge.io/)   
+ [https://libguestfs.org/nbdkit-client.1.html](https://libguestfs.org/nbdkit-client.1.html)   