---
layout: post
title: "[Linux] How to reposync only latest package"
description: " "
author: chhanz
date: 2020-07-30
tags: [linux]
category: linux
---
#  [Linux] How to reposync only latest package 
`reposync` 를 받는데 모든 version 의 package 들이 있다보니 `reposync` 할 때, 시간도 오래 걸리고 용량도 큰 문제가 있었습니다.   
```bash
[root@fastvm-r76-34 ~]# yum repolist
Loaded plugins: product-id, search-disabled-repos, subscription-manager
repo id                             repo                                        namestatus
!rhel-7-server-rpms/7Server/x86_64  Red Hat Enterprise Linux 7 Server (RPMs)    29,237
...
```
위와 같이 29237 개의 package 를 가지고 있습니다.   
   
아래와 같이 하면 최신 버전의 package 만 sync 할 수 있습니다.
```bash
$ reposync -n -r rhel-7-server-rpms
(1/5475): 389-ds-base-1.3.10.1-14.el7_8.x86_64.rpm              | 1.7 MB  00:00:02 
(2/5475): 389-ds-base-libs-1.3.10.1-14.el7_8.x86_64.rpm         | 711 kB  00:00:02     
(3/5475): ElectricFence-2.2.2-39.el7.i686.rpm                   |  35 kB  00:00:00     
(4/5475): GConf2-3.2.6-8.el7.i686.rpm                           | 1.0 MB  00:00:00     
(5/5475): GConf2-3.2.6-8.el7.x86_64.rpm                         | 1.0 MB  00:00:00 
...
```
무려 24000여개의 package 가 제외 되었습니다.   
   
최신 버전의 package 만 필요하다면 위와 같은 방법으로 sync 받으면 됩니다.   
   
# 참고 자료
* [https://access.redhat.com/discussions/2906821](https://access.redhat.com/discussions/2906821)    