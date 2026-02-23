---
layout: post
title: "[RHEL] Local Yum Repository 만들기"
description: " "
author: chhanz
date: 2018-02-02
tags: [linux]
category: linux
---

# [RHEL] Local Yum Repository 만들기
* * * 

Red Hat Enterprise Linux 설치 ISO 및 물리 DVD 가 있다면 외부 rhn 을 사용하지 않고,   
base yum Repository 를 만들 수 있습니다.   

구성 절차는 아래와 같습니다.   

1. DVD 혹은 ISO 파일 _mount_ 진행    
* ISO 파일의 경우, 시스템에 _Upload_ 진행합니다.   
~~~
// DVD
# mount /dev/sr0 /mnt
// ISO
# mount /root/rhel-server-7.5-x86_64-dvd.iso /mnt
~~~
2. Local Disk 로 DVD 혹은 ISO 파일 데이터 복사   
~~~
# cp -rpH /mnt /home/repo
# vi /etc/yum.repos.d/media.repo
~~~
* /etc/yum.repos.d/media.repo 내용
~~~
[media]
name=media
baseurl=file:///home/repo
enable=1
gpgcheck=0
~~~
3. yum Repository 인식
Repository 가 정상적으로 인식하는지 확인합니다.   
~~~
# yum repolist
Loaded plugins: product-id, search-disabled-repos, subscription-manager
This system is not registered with an entitlement server. You can use subscription-manager to register.
media                                                                                                      | 4.3 kB  00:00:00
(1/2): media/group_gz                                                                                      | 145 kB  00:00:00
(2/2): media/primary_db                                                                                    | 4.1 MB  00:00:00
repo id                                                        repo name                                                    status
media                                                          media                                                        5,099
repolist: 5,099
~~~
4. yum Test
yum 이 정상적으로 작동되는지 확인 합니다.   

~~~bash
# yum install gcc
Loaded plugins: product-id, search-disabled-repos, subscription-manager
This system is not registered with an entitlement server. You can use subscription-manager to register.
Resolving Dependencies
--> Running transaction check
---> Package gcc.x86_64 0:4.8.5-28.el7 will be installed
--> Processing Dependency: cpp = 4.8.5-28.el7 for package: gcc-4.8.5-28.el7.x86_64
--> Processing Dependency: glibc-devel >= 2.2.90-12 for package: gcc-4.8.5-28.el7.x86_64
--> Processing Dependency: libmpc.so.3()(64bit) for package: gcc-4.8.5-28.el7.x86_64
--> Processing Dependency: libmpfr.so.4()(64bit) for package: gcc-4.8.5-28.el7.x86_64
--> Running transaction check
---> Package cpp.x86_64 0:4.8.5-28.el7 will be installed
---> Package glibc-devel.x86_64 0:2.17-222.el7 will be installed
--> Processing Dependency: glibc-headers = 2.17-222.el7 for package: glibc-devel-2.17-222.el7.x86_64
--> Processing Dependency: glibc-headers for package: glibc-devel-2.17-222.el7.x86_64
---> Package libmpc.x86_64 0:1.0.1-3.el7 will be installed
---> Package mpfr.x86_64 0:3.1.1-4.el7 will be installed
--> Running transaction check
---> Package glibc-headers.x86_64 0:2.17-222.el7 will be installed
--> Processing Dependency: kernel-headers >= 2.2.1 for package: glibc-headers-2.17-222.el7.x86_64
--> Processing Dependency: kernel-headers for package: glibc-headers-2.17-222.el7.x86_64
--> Running transaction check
---> Package kernel-headers.x86_64 0:3.10.0-862.el7 will be installed
--> Finished Dependency Resolution

Dependencies Resolved

==================================================================================================================================
 Package                            Arch                       Version                            Repository                 Size
==================================================================================================================================
Installing:
 gcc                                x86_64                     4.8.5-28.el7                       media                      16 M
Installing for dependencies:
 cpp                                x86_64                     4.8.5-28.el7                       media                     5.9 M
 glibc-devel                        x86_64                     2.17-222.el7                       media                     1.1 M
 glibc-headers                      x86_64                     2.17-222.el7                       media                     678 k
 kernel-headers                     x86_64                     3.10.0-862.el7                     media                     7.1 M
 libmpc                             x86_64                     1.0.1-3.el7                        media                      51 k
 mpfr                               x86_64                     3.1.1-4.el7                        media                     203 k

Transaction Summary
==================================================================================================================================
Install  1 Package (+6 Dependent packages)

Total download size: 31 M
Installed size: 60 M
Is this ok [y/d/N]: y
Downloading packages:
----------------------------------------------------------------------------------------------------------------------------------
Total                                                                                              43 MB/s |  31 MB  00:00:00
Running transaction check
Running transaction test
Transaction test succeeded
Running transaction
  Installing : mpfr-3.1.1-4.el7.x86_64                                                                                        1/7
  Installing : libmpc-1.0.1-3.el7.x86_64                                                                                      2/7
  Installing : cpp-4.8.5-28.el7.x86_64                                                                                        3/7
  Installing : kernel-headers-3.10.0-862.el7.x86_64                                                                           4/7
  Installing : glibc-headers-2.17-222.el7.x86_64                                                                              5/7
  Installing : glibc-devel-2.17-222.el7.x86_64                                                                                6/7
  Installing : gcc-4.8.5-28.el7.x86_64                                                                                        7/7
  Verifying  : gcc-4.8.5-28.el7.x86_64                                                                                        1/7
  Verifying  : cpp-4.8.5-28.el7.x86_64                                                                                        2/7
  Verifying  : mpfr-3.1.1-4.el7.x86_64                                                                                        3/7
  Verifying  : glibc-devel-2.17-222.el7.x86_64                                                                                4/7
  Verifying  : kernel-headers-3.10.0-862.el7.x86_64                                                                           5/7
  Verifying  : glibc-headers-2.17-222.el7.x86_64                                                                              6/7
  Verifying  : libmpc-1.0.1-3.el7.x86_64                                                                                      7/7

Installed:
  gcc.x86_64 0:4.8.5-28.el7

Dependency Installed:
  cpp.x86_64 0:4.8.5-28.el7                    glibc-devel.x86_64 0:2.17-222.el7       glibc-headers.x86_64 0:2.17-222.el7
  kernel-headers.x86_64 0:3.10.0-862.el7       libmpc.x86_64 0:1.0.1-3.el7             mpfr.x86_64 0:3.1.1-4.el7

Complete!
~~~

정상적으로 작동하는 것을 확인 할 수 있습니다.   

# 참고자료
* * * 
Red Hat Document : [https://access.redhat.com/documentation/ko-kr/red_hat_enterprise_linux/6/html/installation_guide/sn-switching-to-gui-login](https://access.redhat.com/documentation/ko-kr/red_hat_enterprise_linux/6/html/installation_guide/sn-switching-to-gui-login)
