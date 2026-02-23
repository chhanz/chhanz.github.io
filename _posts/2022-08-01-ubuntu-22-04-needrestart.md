---
layout: post
title: "[Ubuntu] Ubuntu 22.04 needrestart 설정"
description: ""
author: chhanz
date: 2022-08-01
tags: [linux]
category: linux
---

# What?
Ubuntu 22.04 를 사용하는 어느 날 `apt` 를 사용하여 package 설치간 아래와 같은 log 가 나왔다.    
```bash
$ sudo apt install xxx
...생략
Scanning processor microcode...
Scanning linux images...

Running kernel seems to be up-to-date.

The processor microcode seems to be up-to-date.

No services need to be restarted.

No containers need to be restarted.

No user sessions are running outdated binaries.

No VM guests are running outdated hypervisor (qemu) binaries on this host
```
무슨 의미와 동작을 하는지 확인해본다.   

# needrestart
확인해보니 `needrestart` 라는 package 에서 위와 같은 log 를 발생한 것이다.   

# needrestart 란?
Needrestart 란?, APT 를 통해 라이브러리 업그레이드 후 다시 시작해야 하는 daemon 을 확인하는 역할을 하는 package 입니다.   
   
# needrestart 설정
## `Kernel Hint` 설정
<center><img src="/assets/images/post/2022-08-01-needrestart/1.png" style="max-width: 95%; height: auto;"></center>   
    
```bash
"현재 Kernel Version"
ubuntu@chhan-testvm4:/var/log/apt$ uname -a
Linux chhan-testvm4 5.15.0-25-generic #25-Ubuntu SMP Wed Mar 30 15:54:22 UTC 2022 x86_64 x86_64 x86_64 GNU/Linux

"자동 Update 된 Kernel Package"
ubuntu@chhan-testvm4:/var/log/apt$ cat history.log
...생략
Start-Date: 2022-07-22  06:05:36
Commandline: /usr/bin/unattended-upgrade
Install: linux-image-5.15.0-41-generic:amd64 (5.15.0-41.44, automatic), linux-headers-5.15.0-41-generic:amd64 (5.15.0-41.44, automatic), linux-modules-5.15.0-41-generic:amd64 (5.15.0-41.44, automatic), linux-headers-5.15.0-41:amd64 (5.15.0-41.44, automatic)
Upgrade: linux-virtual:amd64 (5.15.0.25.27, 5.15.0.41.43), linux-headers-generic:amd64 (5.15.0.25.27, 5.15.0.41.43), linux-image-virtual:amd64 (5.15.0.25.27, 5.15.0.41.43), linux-headers-virtual:amd64 (5.15.0.25.27, 5.15.0.41.43)
End-Date: 2022-07-22  06:05:53
...

"설치된 Kernel Version"
ubuntu@chhan-testvm4:/var/log/apt$ dpkg -l | grep linux-image
ii  linux-image-5.15.0-25-generic   5.15.0-25.25                            amd64        Signed kernel image generic
ii  linux-image-5.15.0-41-generic   5.15.0-41.44                            amd64        Signed kernel image generic
```
   
위와 같이 신규 Kernel 이 설치 되어 있는데 이전 Kernel 버전으로 운영중인 시스템이라면 위와 같은 최신 Kernel 을 사용하기 위해서는 재부팅이 필요하다라는 Kernel Hint 가 발생합니다.   
이런 Message 를 disable 하기 위해서는 아래와 같이 `/etc/needrestart/needrestart.conf` 를 수정합니다.   

```bash
$ vi /etc/needrestart/needrestart.conf
...생략
# Enable/disable hints on pending kernel upgrades:
#  1: requires the user to acknowledge pending kernels
#  0: disable kernel checks completely
# -1: print kernel hints to stderr only
$nrconf{kernelhints} = 0;              << 수정
```

## daemon 재시작 권고 설정
<center><img src="/assets/images/post/2022-08-01-needrestart/2.png" style="max-width: 95%; height: auto;"></center>   
위와 같이 daemon 이 사용하는 라이브러리로 인해 재시작이 필요하다라고 화면이 출력 및 재시작할 daemon 선택을 요구합니다.    
   
이 부분을 재시작이 필요한 daemon 목록만 확인하고 이후 사용자에 의해 재시작을 하도록 설정하기 위해서는   
아래와 같이 `needrestart.conf` 를 수정합니다.   
```bash
ubuntu@chhan-testvm4:/etc/needrestart$ sudo vi /etc/needrestart/needrestart.conf
...생략
# Restart mode: (l)ist only, (i)nteractive or (a)utomatically.
#
# ATTENTION: If needrestart is configured to run in interactive mode but is run
# non-interactive (i.e. unattended-upgrades) it will fallback to list only mode.
#
#$nrconf{restart} = 'i';
$nrconf{restart} = 'l';                 << (i) to (l)
...생략
```
`(l)ist only` 로 해당 옵션을 변경합니다.   
   
```bash
ubuntu@chhan-testvm4:/etc/needrestart$ sudo apt install gcc
...
Restarting services...
Service restarts being deferred:
 systemctl restart ModemManager.service
 systemctl restart containerd.service
 systemctl restart cron.service
 /etc/needrestart/restart.d/dbus.service
 systemctl restart docker.service
 systemctl restart getty@tty1.service
 systemctl restart irqbalance.service
 systemctl restart multipathd.service
 systemctl restart networkd-dispatcher.service
 systemctl restart packagekit.service
 systemctl restart polkit.service
 systemctl restart rsyslog.service
 systemctl restart serial-getty@ttyS0.service
 systemctl restart snapd.service
 systemctl restart ssh.service
 systemctl restart systemd-journald.service
 systemctl restart systemd-logind.service
 systemctl restart systemd-networkd.service
 systemctl restart systemd-resolved.service
 systemctl restart systemd-timesyncd.service
 systemctl restart systemd-udevd.service
 systemctl restart udisks2.service
 systemctl restart unattended-upgrades.service
 systemctl restart user@1000.service
 
No containers need to be restarted.
 
No user sessions are running outdated binaries.
 
No VM guests are running outdated hypervisor (qemu) binaries on this host.
```
위와 같이 목록만 출력됩니다.   
   
# needrestart 제거 방안
## 임시 제거 방안
APT 를 사용할 때 needrestart 를 확인하는 script 부분을 제거하면 됩니다.   
```bash
ubuntu@chhan-testvm4:/etc/apt/apt.conf.d$ ls -la | grep need
-rw-r--r-- 1 root root  338 Mar 16 07:53 99needrestart

ubuntu@chhan-testvm4:/etc/apt/apt.conf.d$ cat 99needrestart
# needrestart - Restart daemons after library updates.
#
# Call needrestart after package upgrades/installations and check
# for pending service restarts. Should only be triggered if there
# was no error during installation.
#
 
DPkg::Post-Invoke {"test -x /usr/lib/needrestart/apt-pinvoke && /usr/lib/needrestart/apt-pinvoke || true"; };
 
ubuntu@chhan-testvm4:/etc/apt/apt.conf.d$ pwd
/etc/apt/apt.conf.d
 
ubuntu@chhan-testvm4:/etc/apt/apt.conf.d$ sudo mv 99needrestart ./../needrestart.backup
```
위와 같이 `99needrestart` 파일을 다른 곳에 백업하거나 삭제합니다.    
이러면 APT 수행시 needrestart 부분이 제외되어 daemon 확인을 미진행합니다.   
   
## 완전 제거 방안
아래와 같이 needrestart package 를 제거합니다.    
```bash
ubuntu@chhan-testvm4:/etc/apt/apt.conf.d$ dpkg -l | grep needrestart
ii  needrestart                     3.5-5ubuntu2.1                          all          check which daemons need to be restarted after library upgrades

ubuntu@chhan-testvm4:/etc/apt/apt.conf.d$ sudo apt remove needrestart
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
The following packages were automatically installed and are no longer required:
  libintl-perl libintl-xs-perl libmodule-find-perl libmodule-scandeps-perl libproc-processtable-perl libsort-naturally-perl libterm-readkey-perl
Use 'sudo apt autoremove' to remove them.
The following packages will be REMOVED:
  needrestart
0 upgraded, 0 newly installed, 1 to remove and 37 not upgraded.
After this operation, 512 kB disk space will be freed.
Do you want to continue? [Y/n] y
(Reading database ... 98619 files and directories currently installed.)
Removing needrestart (3.5-5ubuntu2.1) ...
Processing triggers for man-db (2.10.2-1) ...
ubuntu@chhan-testvm4:/etc/apt/apt.conf.d$
```
위와 같이 제거하면 daemon 확인 과정이 제거됩니다.   
   
***(참고) 제거 이후, 다시 해당 package 가 필요한 경우 아래와 같이 다시 설치를 진행합니다.***    
```bash
$ sudo apt install needrestart
```
   
# 마치며
needrestart 를 귀찮아서 제거하려 하였으나 안정적인 시스템 운영을 위해 interactive 에서 notification 으로 변경하여 내용을 인지하고 사용자가 직접 시스템을 재시동하도록 유도하는 설정을 하는 것이 좋을 것으로 판단됩니다.   
   
# 참고 문서
* [https://manpages.ubuntu.com/manpages/xenial/man1/needrestart.1.html](https://manpages.ubuntu.com/manpages/xenial/man1/needrestart.1.html)    
* [https://techbits.io/stop-needrestart-kernel-prompts/](https://techbits.io/stop-needrestart-kernel-prompts/)   
