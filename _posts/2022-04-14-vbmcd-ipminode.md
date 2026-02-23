---
layout: post
title: "[Linux] VirtualBMC 를 이용한 IPMI node 생성"
description: "use kvm"
author: chhanz
date: 2022-04-14
tags: [linux]
category: linux
---
   
# VirtualBMC 를 이용한 IPMI node 생성
   <center><img src="/assets/images/post/2022-04-14-vbmc/1.png" style="max-width: 95%; height: auto;"></center>   
해당 문서는 Libvirt(KVM) 환경에서 각 VM 을 관리하는 IPMI Node 를 생성하는 방법에 대해 설명하고 있습니다.   
   
# IPMI Node 설정
## SSH Key 배포
SSH 를 이용하여 KVM 에 접근 및 통제를 하기 위해 SSH KEY Password 배포를 진행합니다.   
```bash
[root@ipmi-node ~]# ssh-copy-id root@kvm
```
   
## Python-pip 설치
아래와 같은 방법으로 `pip` 을 설치합니다.   
```bash
[root@ipmi-node ~]# yum -y install python3 python3-pip
 
[root@ipmi-node ~]# pip3 install -U pip
```
   
## VirtualBMC 설치
아래와 같은 방법으로 `vBMC` 를 설치합니다.   
```bash
[root@ipmi-node ~]# pip3 install virtualbmc
```
설치 과정 중, 아래와 같은 Error 가 발생되면 추가 Package 를 설치합니다.   
```bash
[root@ipmi-node ~]# yum install -y libvirt-devel gcc python3-devel ipmitool
```

### Error Case 
```console
"case 1"
...
    Complete output (16 lines):
    Package libvirt was not found in the pkg-config search path.
    Perhaps you should add the directory containing `libvirt.pc'
    to the PKG_CONFIG_PATH environment variable
    No package 'libvirt' found
    Package libvirt was not found in the pkg-config search path.
    Perhaps you should add the directory containing `libvirt.pc'
    to the PKG_CONFIG_PATH environment variable
    No package 'libvirt' found
    running install
    running build
    /usr/bin/pkg-config --print-errors --atleast-version=0.9.11 libvirt
    Package libvirt was not found in the pkg-config search path.
    Perhaps you should add the directory containing `libvirt.pc'
    to the PKG_CONFIG_PATH environment variable
    No package 'libvirt' found
    error: command '/usr/bin/pkg-config' failed with exit status
...
```
   
```console 
"case 2"
...
    creating build/temp.linux-x86_64-3.6
    creating build/temp.linux-x86_64-3.6/build
    gcc -pthread -Wno-unused-result -Wsign-compare -DNDEBUG -O2 -g -pipe -Wall -Wp,-D_FORTIFY_SOURCE=2 -fexceptions -fstack-protector-strong --param=ssp-buffer-size=4 -grecord-gcc-switches -m64 -mtune=generic -D_GNU_SOURCE -fPIC -fwrapv -fPIC -I. -I/usr/include/python3.6m -c libvirt-override.c -o build/temp.linux-x86_64-3.6/libvirt-override.o
    unable to execute 'gcc': No such file or directory
    error: command 'gcc' failed with exit status 1
...
```
   
```console
"case 3"
...
    gcc -pthread -Wno-unused-result -Wsign-compare -DNDEBUG -O2 -g -pipe -Wall -Wp,-D_FORTIFY_SOURCE=2 -fexceptions -fstack-protector-strong --param=ssp-buffer-size=4 -grecord-gcc-switches -m64 -mtune=generic -D_GNU_SOURCE -fPIC -fwrapv -fPIC -I. -I/usr/include/python3.6m -c libvirt-override.c -o build/temp.linux-x86_64-3.6/libvirt-override.o
    libvirt-override.c:21:20: fatal error: Python.h: No such file or directory
     #include <Python.h>
...
```
   
## vBMC 서비스 시작
아래 명령을 통해 서비스를 시작합니다.   
```bash
[root@ipmi-node ~]# vbmcd
```
   
## vBMC 포트 추가
아래 명령과 같이 vBMC IPMI Port 를 생성합니다.   
```console
$ vbmc --username <vBMC IPMI 계정 이름> --password <vBMC IPMI 계정의 패스워드> --port <vBMC IPMI PORT> --libvirt-uri qemu+ssh://root@<KVM HOSTNAME>/system <VM NAME>
```
   
실제 추가 명령 예제는 아래와 같습니다.   
```bash
[root@ipmi-node ~]# vbmc add --username admin --password testtest --port 6250 --libvirt-uri qemu+ssh://root@kvm/system u20
```
   
## vBMC 포트 확인
아래 명령을 통해 생성된 포트를 확인합니다.   
```bash
[root@ipmi-node ~]# vbmc list
+-------------+--------+---------+------+
| Domain name | Status | Address | Port |
+-------------+--------+---------+------+
| u20         | down   | ::      | 6250 |
+-------------+--------+---------+------+
```
   
## vBMC 포트 서비스 시작
아래 명령을 통해 vBMC 포트 서비스를 시작합니다.   
```bash
[root@ipmi-node ~]# vbmc start u20
...
[root@ipmi-node ~]# vbmc list
+-------------+---------+---------+------+
| Domain name | Status  | Address | Port |
+-------------+---------+---------+------+
| ipmi-node   | down    | ::      | 6252 |
| maas-node   | down    | ::      | 6251 |
| u20         | running | ::      | 6250 |      <<
+-------------+---------+---------+------+
```
   
## vBMC 포트 상세 정보 확인
아래 명령을 통해 vBMC 포트 상세 정보를 확인 할 수 있습니다.   
```bash
[root@ipmi-node ~]# vbmc show u20
+-----------------------+----------------------------+
| Property              | Value                      |
+-----------------------+----------------------------+
| active                | True                       |
| address               | ::                         |
| domain_name           | u20                        |
| libvirt_sasl_password | ***                        |
| libvirt_sasl_username | None                       |
| libvirt_uri           | qemu+ssh://root@kvm/system |
| password              | ***                        |
| port                  | 6250                       |
| status                | running                    |
| username              | admin                      |
+-----------------------+----------------------------+
```
   
## vBMC 포트 서비스 확인 (netstat)
`netstat` 를 통해 IPMI Node 에 각각의 포트로 vBMC port 가 활성화 됩니다.   
```bash
[root@ipmi-node ~]# netstat -anup
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
udp        0      0 0.0.0.0:68              0.0.0.0:*                           831/dhclient
udp        0      0 0.0.0.0:111             0.0.0.0:*                           550/rpcbind
udp        0      0 127.0.0.1:323           0.0.0.0:*                           554/chronyd
udp        0      0 0.0.0.0:722             0.0.0.0:*                           550/rpcbind
udp6       0      0 :::6250                 :::*                                1934/python3                <<<
udp6       0      0 :::6251                 :::*                                1983/python3                <<<
udp6       0      0 :::6252                 :::*                                2000/python3                <<<
udp6       0      0 :::111                  :::*                                550/rpcbind
udp6       0      0 ::1:323                 :::*                                554/chronyd
udp6       0      0 :::722                  :::*                                550/rpcbind
```
   
## `IPMITOOL` 을 통해 전원 제어
아래와 같은 방법을 통해서 VM 의 전원을 통제 할 수 있습니다.   
```bash
[root@c-node-0 ~]# ipmitool -I lanplus -p 6250 -Uadmin -Ptesttest -H ipmi-node chassis power status
Chassis Power is off

[root@c-node-0 ~]# ipmitool -I lanplus -p 6251 -Uadmin -Ptesttest -H ipmi-node chassis power status
Chassis Power is on
```
   
전원 on/off 예제는 아래와 같습니다.      
```bash
$ ipmitool -I lanplus -p 6251 -Uadmin -Ptesttest -H ipmi-node chassis power <on | off>
```
   
# 참고 자료
* IPMITOOL 사용 가이드 : [https://chhanz.github.io/linux/2022/03/01/ipmitool/](https://chhanz.github.io/linux/2022/03/01/ipmitool/)   