---
layout: post
title: "[Linux] DHCP 서버 구성 (on CentOS7)"
description: " "
author: chhanz
date: 2020-11-17
tags: [linux]
category: linux, dhcp
---
   
# DHCP 란?
> 동적 호스트 구성 프로토콜(Dynamic Host Configuration Protocol, DHCP)은 호스트 IP 구성 관리를 단순화하는 IP 표준이다.   
> 동적 호스트 구성 프로토콜 표준에서는 DHCP 서버를 사용하여 IP 주소 및 관련된 기타 구성 세부 정보를 네트워크의 DHCP 사용 클라이언트에게 동적으로 할당하는 방법을 제공한다.   
> * 참고 : [위키백과 - DHCP](https://ko.wikipedia.org/wiki/%EB%8F%99%EC%A0%81_%ED%98%B8%EC%8A%A4%ED%8A%B8_%EA%B5%AC%EC%84%B1_%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C)   
   
# DHCP 동작 원리
아래 내용을 보면 DHCP 의 동작 원리를 쉽게 이해 할 수 있습니다.   
+ 출처 : [https://www.netmanias.com/ko/post/blog/5348/dhcp-ip-allocation-network-protocol/understanding-the-basic-operations-of-dhcp](https://www.netmanias.com/ko/post/blog/5348/dhcp-ip-allocation-network-protocol/understanding-the-basic-operations-of-dhcp)   
   
<center><img src="/assets/images/post/2020-11-17-dhcp/1.png" style="max-width: 95%; height: auto;"></center>   
   
# DHCP 설치
아래 커멘드를 통해 Package 를 설치합니다.   
```bash
$ sudo yum -y install dhcp
```
   
아래 커멘드를 통해 `DHCP` 서비스를 시작합니다.   
```bash
$ sudo systemctl enable --now dhcpd
```
   
아래 커멘드를 통해 `DHCP` 서비스 상태를 확인 할 수 있습니다.   
```bash
$ sudo systemctl status dhcpd
● dhcpd.service - DHCPv4 Server Daemon
   Loaded: loaded (/usr/lib/systemd/system/dhcpd.service; enabled; vendor preset: disabled)
   Active: active (running) since Tue 2020-10-13 21:47:50 KST; 1 months 4 days ago
     Docs: man:dhcpd(8)
           man:dhcpd.conf(5)
 Main PID: 23447 (dhcpd)
   Status: "Dispatching packets..."
   CGroup: /system.slice/dhcpd.service
           └─23447 /usr/sbin/dhcpd -f -cf /etc/dhcp/dhcpd.conf -user dhcpd -group dhcpd --no-pid

Nov 17 16:34:16 dhcp.okd.chhanz.com dhcpd[23447]: Dynamic and static leases present for 10.50.2.22.
Nov 17 16:34:16 dhcp.okd.chhanz.com dhcpd[23447]: Remove host declaration boot.okd.chhanz.com or remove 10.50.2.22
Nov 17 16:34:16 dhcp.okd.chhanz.com dhcpd[23447]: from the dynamic address pool for 10.50.2.0/24
Nov 17 16:34:16 dhcp.okd.chhanz.com dhcpd[23447]: DHCPREQUEST for 10.50.2.22 from 00:50:56:91:c9:22 via ens160
Nov 17 16:34:16 dhcp.okd.chhanz.com dhcpd[23447]: DHCPACK on 10.50.2.22 to 00:50:56:91:c9:22 via ens160
Nov 17 16:34:20 dhcp.okd.chhanz.com dhcpd[23447]: Dynamic and static leases present for 10.50.2.42.
Nov 17 16:34:20 dhcp.okd.chhanz.com dhcpd[23447]: Remove host declaration m2.okd.igts.com or remove 10.50.2.42
Nov 17 16:34:20 dhcp.okd.chhanz.com dhcpd[23447]: from the dynamic address pool for 10.50.2.0/24
Nov 17 16:34:20 dhcp.okd.chhanz.com dhcpd[23447]: DHCPREQUEST for 10.50.2.42 from 00:50:56:91:c9:42 via ens160
Nov 17 16:34:20 dhcp.okd.chhanz.com dhcpd[23447]: DHCPACK on 10.50.2.42 to 00:50:56:91:c9:42 via ens160
```
   
# DHCP 설정
DHCP 설정 파일인 `/etc/dhcp/dhcpd.conf` 을 설정합니다.   
```console
# Global configuration ####################################
option domain-name "chhanz.com";
option domain-name-servers ns.chhanz.com;
default-lease-time 3600;                    //기본 임대 시간
max-lease-time 7200;                        //최대 임대 시간
authoritative;

# subnet configuration ####################################
subnet 10.50.2.0 netmask 255.255.255.0 {
 option routers                  10.50.2.254;
 option subnet-mask              255.255.255.0;
 option domain-name              "chhanz.com";
 option domain-name-servers      10.50.2.51, 1.1.1.1;
 option time-offset              -18000;
 range 10.50.2.52 10.50.2.59;
}
```
위와 같이 Global Configuration 에 공통 설정을 입력 할 수도 있고, subnet Configuration 에 별도로도 설정이 가능합니다.   

## `dhcpd.conf` 항목 설명
+ option domain-name : Domain name을 지정합니다.
+ option domain-name-servers : DNS 서버를 지정합니다.
+ default-lease-time : 임대 요청 만료 시간을 초단위로 지정합니다.
+ max-lease-time : 클라이언트가 가지고 IP를 가지고 있을 최대 시간을 초단위로 지정합니다.
+ option routers : Gateway 주소를 지정합니다.
+ range : 클라이언트에 할당할 IP의 범위를 지정합니다.
   
## 임대 IP 고정 할당 관련
DHCP 서버에서 MAC Address 기반으로 특정 IP 를 지정하여 할당하도록 설정이 가능합니다.   
`/etc/dhcp/dhcpd.conf` 하단에 아래와 같은 설정을 추가합니다.   
```console
host boot.okd.chhanz.com {
 hardware ethernet 00:50:57:81:c8:50;
 fixed-address 10.50.2.52;
}
```   
   
위와 같이 설정하는 경우,    
`00:50:57:81:c8:50` MAC Address 는 `10.50.2.52` 으로 IP 를 할당 받을 것 입니다.   
   
# DHCP Client 테스트
아래와 같이 가상화 서버에서 VM 생성할 때, MAC 주소를 수동으로 설정하거나,   
물리 장비(baremetal) 인 경우, 미리 MAC 주소를 파악하여 DHCP 서버에 설정합니다.   
   
<img src="/assets/images/post/2020-11-17-dhcp/2.png" style="max-width: 95%; height: auto;">   
   
## DHCP Client log
아래와 같은 과정으로 DHCP 서비스가 작동하는 것을 확인 할 수 있습니다.   
```bash
$ tailf /var/log/messages 
...
Nov 16 22:26:04 c7 dhcpd: DHCPDISCOVER from 00:50:57:81:c8:50 via ens160
Nov 16 22:26:04 c7 dhcpd: DHCPOFFER on 10.50.2.50 to 00:50:57:81:c8:50 via ens160
Nov 16 22:26:04 c7 dhcpd: DHCPREQUEST for 10.50.2.50 (10.50.2.52) from 00:50:57:81:c8:50 via ens160
Nov 16 22:26:04 c7 dhcpd: DHCPACK on 10.50.2.50 to 00:50:57:81:c8:50 via ens160
...
```
   
# 참고 자료
+ [https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/networking_guide/sec-dhcp-configuring-server](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/networking_guide/sec-dhcp-configuring-server)   
+ [https://www.netmanias.com/ko/post/blog/5348/dhcp-ip-allocation-network-protocol/understanding-the-basic-operations-of-dhcp](https://www.netmanias.com/ko/post/blog/5348/dhcp-ip-allocation-network-protocol/understanding-the-basic-operations-of-dhcp)   
