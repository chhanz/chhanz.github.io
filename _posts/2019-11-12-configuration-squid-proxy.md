---
layout: post
title: "[Linux] Squid 를 이용한 Proxy 서버 구성"
description: " "
author: chhanz
date: 2019-11-13
tags: [linux]
category: linux
---

# [Linux] Squid 를 이용한 Proxy 서버 구성
* * *
주로 `on-premise` 환경에서 운영되는 시스템은 인터넷이 안되는 시스템이 많습니다.   
이런 상황이다 보니, `Yum` 을 통한 `Package` 관리가 쉽게 되지 않습니다.   
***그렇다고 모든 시스템은 인터넷이 가능하게 만들어 보안에 취약해지는 환경을 만들수는 없습니다.***   
   
아래와 같이 Proxy 서버를 이용하여 하나의 시스템을 통해 모든 시스템이 인터넷이 가능하도록 구성 할 수 있습니다.   
주 된 목적은 `Yum` 을 통해 `Package` 관리가 가능하도록 구성하는 것이 목적입니다.   

* * *
## 목표 구성도
<img src="/assets/images/post/2019-11-13-squid/image1.png" style="max-width: 70%; height: auto;">   
       
위와 같이 `Server Farm` 의 시스템은 인터넷이 안되는 환경입니다.   
그 시스템이 `Internet Zone` 의 Internet 사용이 가능한 시스템을 통해 외부 `Yum Package` 를 가져오는 환경입니다.   
   
## Install `Squid`
다음 명령을 통해 `Squid` Package 를 설치합니다.   
```bash
$ yum -y install squid
```
   
## Configuration `Squid` Config file
아래와 같이 Proxy 정책을 설정합니다.   
(아래 샘플은 모든 정책을 활성화 하였습니다.)   
```console
$ vi /etc/squid/squid.conf

... 생략 ...

# Only allow cachemgr access from localhost
#http_access allow localhost manager
#http_access deny manager

http_access allow all                      # 모든 IP 에 대해 Allow 정책 추가

# And finally deny all other access to this proxy
#http_access deny all                      # deny 정책 해제

... 생략 ...

# Squid normally listens to port 3128      
http_port 8080                             # Proxy 로 사용하길 원하는 Port 지정
#http_port 3128
```
   
## `Squid` 서비스 시작
`Squid` 서비스를 시작합니다.   
```bash
$ systemctl start squid
$ systemctl status squid
```
정상적으로 Proxy 서비스가 안된다고 판단되는 경우, 아래와 같이 커널 파라미터를 추가합니다.   
```console
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv4.ip_forward = 1
```
   
# Proxy 서비스 테스트
* `Server Farm`  내부 시스템 : `fastvm-centos-7-5-150`   
```bash
[root@fastvm-centos-7-5-150 ~]# yum repolist
Loaded plugins: fastestmirror
Determining fastest mirrors
Could not retrieve mirrorlist http://mirrorlist.centos.org/?release=7&arch=x86_64&repo=os&infra=stock error was
14: curl#6 - "Could not resolve host: mirrorlist.centos.org; Unknown error"
Loading mirror speeds from cached hostfile
Loading mirror speeds from cached hostfile
Loading mirror speeds from cached hostfile
repo id                         repo name                        status
base/7/x86_64                   CentOS-7 - Base                    0     
extras/7/x86_64                 CentOS-7 - Extras                  0     
updates/7/x86_64                CentOS-7 - Updates                 0     
repolist: 0
[root@fastvm-centos-7-5-150 ~]#
```
위와 같이 `Yum` 을 사용 할 수 없습니다.   

## `yum.conf` 수정
`/etc/yum.conf` 파일에 아래와 같이 `proxy` 옵션을 추가합니다.   
```console
[root@fastvm-centos-7-5-150 ~]# cat /etc/yum.conf 
[main]
cachedir=/var/cache/yum/$basearch/$releasever
keepcache=0
debuglevel=2
logfile=/var/log/yum.log
exactarch=1
obsoletes=1
gpgcheck=1
plugins=1
installonly_limit=5
bugtracker_url=http://bugs.centos.org/set_project.php?project_id=23&ref=http://bugs.centos.org/bug_report_page.php?category=yum
distroverpkg=centos-release

proxy=http://192.168.200.151:8080      # Proxy 서버 정보 추가
```
`proxy` 옵션 추가 후, `Yum` 사용이 가능한지 확인합니다.   
```bash
[root@fastvm-centos-7-5-150 ~]# yum repolist
Loaded plugins: fastestmirror
Loading mirror speeds from cached hostfile
 * base: data.aonenetworks.kr
 * extras: data.aonenetworks.kr
 * updates: data.aonenetworks.kr
base                                                    | 3.6 kB  00:00:00     
extras                                                  | 2.9 kB  00:00:00     
updates                                                 | 2.9 kB  00:00:00     
(1/4): base/7/x86_64/group_gz                           | 165 kB  00:00:00     
(2/4): extras/7/x86_64/primary_db                       | 153 kB  00:00:00     
(3/4): updates/7/x86_64/primary_db                      | 2.8 MB  00:00:00     
(4/4): base/7/x86_64/primary_db                         | 6.0 MB  00:00:00     
repo id                     repo name                   status
base/7/x86_64               CentOS-7 - Base             10,097
extras/7/x86_64             CentOS-7 - Extras           305
updates/7/x86_64            CentOS-7 - Updates          711
repolist: 11,113
[root@fastvm-centos-7-5-150 ~]# 
```
위와 같이 ***Proxy 서버*** 를 통해 인터넷을 활용하는 것을 확인 할 수 있습니다.   
추가로 위와 같이 구성 할 경우, `Yum` 만 인터넷이 사용이 가능하며 그 외 부분은 인터넷 사용이 불가능합니다.   
```bash
[root@fastvm-centos-7-5-150 ~]# ping 1.1.1.1
connect: Network is unreachable
[root@fastvm-centos-7-5-150 ~]#
```
 