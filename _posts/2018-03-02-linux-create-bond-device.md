---
layout: post
title: "[Linux] CentOS 7 네트워크 Bonding 구성"
description: " "
author: chhanz
date: 2018-03-02
tags: [linux]
category: linux
---

# [Linux] CentOS 7 네트워크 Bonding 구성
* * * 

CentOS 7 에서 bonding 구성을 위해서는 아래와 같은 절차가 필요합니다.   

1. CentOS 7 에서는 bonding 모듈이 기본적으로 로드가 되어 있지 않습니다. 아래 명령을 통해 boning 모듈을 로드합니다.   
~~~
# modprobe --first-time bonding
~~~
2. Bond Interface 생성
Bond Interface 생성을 하기위해서는 /etc/sysconfig/network-scripts/ 의 _ifcfg-bond0_ 파일을 생성해야됩니다.   
~~~
# cat  /etc/sysconfig/network-scripts/ifcfg-bond0
DEVICE=bond0
NAME=bond0
TYPE=Bond
IPADDR=10.0.0.1
NETMASK=255.255.255.0
ONBOOT=yes
BOOTPROTO=none
BONDING_OPTS="mode=1 miimon=100"
~~~
3. SLAVE Interface 생성
bond Interface 의 SLAVE Interface 파일을 생성합니다.   
/etc/sysconfig/network-scripts/ 의 _ifcfg-eth1_ 과 _ifcfg-eth2_ 를 수정합니다.   
~~~
# cat ifcfg-eth1
DEVICE=eth1
NAME=eth1
TYPE=Ethernet
BOOTPROTO=none
ONBOOT=yes
MASTER=bond0
SLAVE=yes
# cat ifcfg-eth2
DEVICE=eth2
NAME=eth2
TYPE=Ethernet
BOOTPROTO=none
ONBOOT=yes
MASTER=bond0
SLAVE=yes
~~~
4. NetworkManager disable && network restart
network 재시작을 합니다.   
~~~
# systemctl disable NetworkManager
# systemctl stop NetworkManager
# systemctl restart network
# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 00:2a:4a:16:01:5b brd ff:ff:ff:ff:ff:ff
    inet 192.168.13.63/16 brd 192.168.255.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::22a:4aff:fe16:15b/64 scope link
       valid_lft forever preferred_lft forever
3: eth1: <BROADCAST,MULTICAST,SLAVE,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast master bond0 state UP group default qlen 1000
    link/ether 00:2a:4a:16:01:63 brd ff:ff:ff:ff:ff:ff
4: eth2: <BROADCAST,MULTICAST,SLAVE,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast master bond0 state UP group default qlen 1000
    link/ether 00:2a:4a:16:01:63 brd ff:ff:ff:ff:ff:ff
5: bond0: <BROADCAST,MULTICAST,MASTER,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 00:2a:4a:16:01:63 brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.1/24 brd 10.0.0.255 scope global bond0
       valid_lft forever preferred_lft forever
    inet6 fe80::22a:4aff:fe16:163/64 scope link
       valid_lft forever preferred_lft forever
~~~

위와 같이 bonding 구성이 된것을 확인 할 수 있습니다.   


# 참고자료
* * *
bonding Option : [https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/networking_guide/sec-using_channel_bonding](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/networking_guide/sec-using_channel_bonding)
