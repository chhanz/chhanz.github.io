---
layout: post
title: "[Linux] ReaR 를 이용하여 OS Backup 구성"
description: " "
author: chhanz
date: 2020-08-12
tags: [linux]
category: linux
---
   
# [Linux] ReaR 를 이용하여 OS Backup 구성
## ReaR 란?   
ReaR 또는 Relax & Recover는 마이그레이션 및 재해 복구 도구입니다.     
ReaR는 실행중인 Linux 시스템에 대한 부팅 가능한 이미지를 생성하며 필요한 경우에는 백업된 이미지를 사용하여 시스템을 복구 할 수 있습니다.    
백업된 이미지를 사용하여 OS를 다른 하드웨어로 복원 할 수도 있으므로 ReaR를 마이그레이션 도구로 사용할 수도 있습니다.   
   
## ReaR Backup 용 NFS 서버 구성
ReaR 로 Backup 되는 Boot ISO 및 Backup DATA 를 저장할 NFS 서버를 구성합니다.   
(NAS 등 기타 네트워크 저장 공간이 있다면 활용이 가능합니다.)   
   
```bash
$ yum install nfs-utils

$ mkdir /data
$ cat /etc/exports
/data         *(rw,sync,no_root_squash)

$ systemctl enable --now nfs-server
$ exports -v
```
   
NFS 서버 상세 구성은 아래 문서를 참고합니다.   
[https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/storage_administration_guide/nfs-serverconfig](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/storage_administration_guide/nfs-serverconfig)   
   
## ReaR 설치
아래와 같이 설치를 진행합니다.   
```bash
$ yum install rear
```
   
## ReaR 설정
아래와 같이 `/etc/rear/local.conf` 파일을 수정합니다.   
```bash
$ cat /etc/rear/local.conf 
# Default is to create Relax-and-Recover rescue media as ISO image
# set OUTPUT to change that
# set BACKUP to activate an automated (backup and) restore of your data
# Possible configuration values can be found in /usr/share/rear/conf/default.conf
#
# This file (local.conf) is intended for manual configuration. For configuration
# through packages and other automated means we recommend creating a new
# file named site.conf next to this file and to leave the local.conf as it is.
# Our packages will never ship with a site.conf.

OUTPUT=ISO
OUTPUT_URL=nfs://10.10.10.1/data
BACKUP=NETFS
BACKUP_URL=nfs://10.10.10.1/data
```
   
### 세부 내용 설명
* `OUTPUT` : BOOT 용 ISO 이미지 생성   
* `OUTPUT_URL` : 생성된 BOOT ISO 이미지 저장 위치   
* `BACKUP` : BACKUP DATA 를 저장 방식을 지정합니다. (`NETFS` 는 Network Filesystem 을 말합니다. 즉, `NFS`)   
* `BACKUP_URL` : BACKUP DATA 가 저장될 NFS 정보를 입력합니다.      
> 추가 OPTION 은 아래 문서 참고 합니다.   
> [https://github.com/rear/rear/blob/master/doc/user-guide/03-configuration.adoc](https://github.com/rear/rear/blob/master/doc/user-guide/03-configuration.adoc)   

## BACKUP 진행
아래와 같이 명령을 통해 BACKUP 을 수행합니다.   
```bash
$ rear -d -v mkbackup
```
   
## 복구 방법
<img src="/assets/images/post/2020-08-12-rear/1.png" style="max-width: 95%; height: auto;"><br>저장된 ISO 를 이용하여 CD BOOT 진행합니다.   
<br><img src="/assets/images/post/2020-08-12-rear/2.png" style="max-width: 95%; height: auto;"><br>CD BOOT 이 완료가 되면 위와 같이 복구를 위한 prompt 가 BOOT 됩니다.    
<br><img src="/assets/images/post/2020-08-12-rear/3.png" style="max-width: 95%; height: auto;"><br>(OPTION) 네트워크가 STATIC 환경이라면 위와 같이 IP 를 설정합니다.      
<br><img src="/assets/images/post/2020-08-12-rear/4.png" style="max-width: 95%; height: auto;"><br>`$ rear -v recover` 명령을 통해 위와 같이 복구를 수행합니다.      
<br><img src="/assets/images/post/2020-08-12-rear/5.png" style="max-width: 95%; height: auto;"><br>복구가 완료되고 재부팅을 하면 복구된 서버에 접근이 가능합니다.       
   
# 참고 문서
* [https://access.redhat.com/solutions/2115051](https://access.redhat.com/solutions/2115051)   