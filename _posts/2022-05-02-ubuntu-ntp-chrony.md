---
layout: post
title: "[Ubuntu] NTP Service"
description: "Ubuntu 20.04"
author: chhanz
date: 2022-05-02
tags: [linux]
category: linux
---
   
# Ubuntu 20.04 NTP Service 
Ubuntu Server Version 을 설치하게 되면 기본적으로 NTP 서비스를 활성화가 되어있습니다.   
   
```bash
root@u-node-0:/etc/systemd# timedatectl -a
               Local time: Thu 2022-04-28 11:14:26 KST
           Universal time: Thu 2022-04-28 02:14:26 UTC
                 RTC time: Thu 2022-04-28 02:14:27
                Time zone: Asia/Seoul (KST, +0900)
System clock synchronized: yes                          <<
              NTP service: active
          RTC in local TZ: no
```
   
RHEL 계열의 `ntpd` 혹은 `chronyd` 가 자동으로 설치가 되어서 그런건가?   
   
Ubuntu 는 설치가 되면 `systemd-timesyncd` 라는 daemon 이 기본적으로 NTP 서비스를 수행합니다.   
   
```bash
root@u-node-0:/etc/systemd# systemctl status systemd-timesyncd
● systemd-timesyncd.service - Network Time Synchronization
     Loaded: loaded (/lib/systemd/system/systemd-timesyncd.service; enabled; vendor preset: enabled)
     Active: active (running) since Sat 2022-01-15 06:36:26 KST; 3 months 11 days ago
       Docs: man:systemd-timesyncd.service(8)
   Main PID: 164170 (systemd-timesyn)
     Status: "Initial synchronization to time server 91.189.91.157:123 (ntp.ubuntu.com)."
      Tasks: 2 (limit: 2343)
     Memory: 1.4M
     CGroup: /system.slice/systemd-timesyncd.service
             └─164170 /lib/systemd/systemd-timesyncd
 
Apr 06 20:29:10 u-node-0 systemd-timesyncd[164170]: Initial synchronization to time server 91.189.91.157:123 (ntp.ubuntu.com).
```
   
`systemd-timesyncd`의 설정을 변경하기 위해서는 `/etc/systemd/timesyncd.conf` 을 수정해야 되고,   
```bash
root@u-node-0:/etc/systemd# cat /etc/systemd/timesyncd.conf
... 생략
 
[Time]
#NTP=
#FallbackNTP=ntp.ubuntu.com
#RootDistanceMaxSec=5
#PollIntervalMinSec=32
#PollIntervalMaxSec=2048
```
자세한 설정 수정 방법은 `$ man timesyncd.conf`를 참고합니다.   

# Chronyd   
위와 같이 기본 timesyncd 를 사용하거나 내부 NTP Client 및 Server 를 구축하기 위해서는 권장되는 솔루션은 `chronyd` 입니다.   
   
## 설치
아래 명령을 통해 설치가 가능힙니다.   
```bash
$ sudo apt search chronyd
Sorting... Done
Full Text Search... Done
chrony/focal-updates,focal-security,now 3.5-6ubuntu6.2 amd64 [installed]
  Versatile implementation of the Network Time Protocol
 
$ sudo apt install chrony -y
```

재미있는건 `chrony` 가 설치가 되면 자동으로 enable 되어 있던 `systemd-timesyncd`는 disable 이 되고 `chrony` 가 enable 됩니다.   
   
```console
$ cat /var/log/apt/history.log
...
Commandline: apt install chrony
Install: chrony:amd64 (3.5-6ubuntu6.2)
Upgrade: libsystemd0:amd64 (245.4-4ubuntu3.15, 245.4-4ubuntu3.16), systemd-sysv:amd64 (245.4-4ubuntu3.15, 245.4-4ubuntu3.16), libpam-systemd:amd64 (245.4-4ubuntu3.15, 245.4-4ubuntu3.16), systemd:amd64 (245.4-4ubuntu3.15, 245.4-4ubuntu3.16), libnss-systemd:amd64 (245.4-4ubuntu3.15, 245.4-4ubuntu3.16)
Remove: systemd-timesyncd:amd64 (245.4-4ubuntu3.15)   <<<

$ systemctl status systemd-timesyncd
● systemd-timesyncd.service
     Loaded: masked (Reason: Unit systemd-timesyncd.service is masked.)         <<<
     Active: inactive (dead) since Thu 2022-04-28 11:15:22 KST; 7min ago
   Main PID: 164170 (code=exited, status=0/SUCCESS)
     Status: "Shutting down..."
```
   
설치가 완료되면 아래와 같이 서비스가 기동중입니다.   
```bash
$ systemctl status chronyd
● chrony.service - chrony, an NTP client/server
     Loaded: loaded (/lib/systemd/system/chrony.service; enabled; vendor preset: enabled)
     Active: active (running) since Thu 2022-04-28 11:15:25 KST; 7min ago
       Docs: man:chronyd(8)
             man:chronyc(1)
             man:chrony.conf(5)
   Main PID: 414899 (chronyd)
      Tasks: 2 (limit: 2343)
     Memory: 1.2M
     CGroup: /system.slice/chrony.service
             ├─414899 /usr/sbin/chronyd -F -1
             └─414900 /usr/sbin/chronyd -F -1
```
## 설정
`chronyd` 의 설정은 RHEL 에서 사용하는 방식과 동일하지만 설정 파일의 경로에 차이가 있습니다.   
> * RHEL 계열 : `/etc/chrony.conf`   
> * Debian 계열 : `/etc/chrony/chrony.conf`   
   
```bash
$ cat /etc/chrony/chrony.conf
... 생략

pool ntp.ubuntu.com        iburst maxsources 4
pool 0.ubuntu.pool.ntp.org iburst maxsources 1
pool 1.ubuntu.pool.ntp.org iburst maxsources 1
pool 2.ubuntu.pool.ntp.org iburst maxsources 2
 
... 생략
```
`chrony` 설정 파일은 위와 같으며 내부 NTP 서비스를 하기 위해서는   
```console
allow 1.2.3.4
```
위와 같이 `allow` line 을 추가하면 됩니다.   
   
그 외 자세한 설정은 [문서](https://chrony.tuxfamily.org/doc/3.1/chrony.conf.html) 를 참고 합니다.   
## Check
아래 명령을 통해 NTP 서비스 동기화 상태를 확인 할 수 있습니다.   
```bash
$ chronyc sources -v
210 Number of sources = 8
 
  .-- Source mode  '^' = server, '=' = peer, '#' = local clock.
 / .- Source state '*' = current synced, '+' = combined , '-' = not combined,
| /   '?' = unreachable, 'x' = time may be in error, '~' = time too variable.
||                                                 .- xxxx [ yyyy ] +/- zzzz
||      Reachability register (octal) -.           |  xxxx = adjusted offset,
||      Log2(Polling interval) --.      |          |  yyyy = measured offset,
||                                \     |          |  zzzz = estimated error.
||                                 |    |           \
MS Name/IP address         Stratum Poll Reach LastRx Last sample
===============================================================================
^- 91.189.91.157                 2   6   377    36  +8219us[+8219us] +/-  151ms
^- 91.189.94.4                   2   6   377    35  +4838us[+4838us] +/-  146ms
^- 91.189.89.198                 2   6   337    35  +4675us[+4675us] +/-  137ms
^- 91.189.89.199                 2   6   377    35  +5279us[+5279us] +/-  158ms
^- 194.0.5.123                   2   6   377    38  -2538us[-2538us] +/-   41ms
^- 193.123.243.2                 2   6   377    40   -778us[ -846us] +/-   36ms
^- 3.36.253.109                  2   6   377    39   -273us[ -273us] +/-   44ms
^* 163.152.23.171                2   6   377    39   -250us[ -317us] +/- 9385us
```
   
# 참고 문서
* Ubuntu - NTP : [https://ubuntu.com/server/docs/network-ntp](https://ubuntu.com/server/docs/network-ntp)    
* RHEL - chrony :   
[https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/system_administrators_guide/ch-configuring_ntp_using_the_chrony_suite](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/system_administrators_guide/ch-configuring_ntp_using_the_chrony_suite)   
* chrony.conf : [https://chrony.tuxfamily.org/doc/3.1/chrony.conf.html](https://chrony.tuxfamily.org/doc/3.1/chrony.conf.html)   