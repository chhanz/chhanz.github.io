---
layout: post
title: "[Ubuntu] unattended-upgrades 설정 (자동 업데이트)"
description: "Ubuntu 22.04"
author: chhanz
date: 2022-05-11
tags: [linux]
category: linux
---

# unattended-upgrades 란?
`unattended-upgrades` 는 Ubuntu system 의 최신 보안 패치 및 기타 업데이트를 자동으로 수행하고 시스템을 유지, 관리 하는 것에 목적이 있는 서비스 입니다.   
   
# 설치
Ubuntu 를 설치하면 기본적으로 해당 서비스는 설치되어 작동하고 있습니다.   
만약 설치가 안되어 있다면 아래와 같이 설치를 진행합니다.   
```bash
$ sudo apt install unattended-upgrades -y
```
   
구동중인 daemon 정보는 아래와 같습니다.   
```bash
$ sudo systemctl status unattended-upgrades
● unattended-upgrades.service - Unattended Upgrades Shutdown
     Loaded: loaded (/lib/systemd/system/unattended-upgrades.service; enabled; vendor preset: enabled)
     Active: active (running) since Thu 2022-04-28 14:26:19 KST; 3 days ago
       Docs: man:unattended-upgrade(8)
   Main PID: 681 (unattended-upgr)
      Tasks: 2 (limit: 9495)
     Memory: 14.5M
        CPU: 65ms
     CGroup: /system.slice/unattended-upgrades.service
             └─681 /usr/bin/python3 /usr/share/unattended-upgrades/unattended-upgrade-shutdown --wait-for-signal
 
Apr 28 14:26:19 u-node-1 systemd[1]: Started Unattended Upgrades Shutdown.
```
   
# 설정
`unattended-upgrades` 에 Default 로 들어가는 설정은 아래와 같습니다.   
```bash
$ cat /etc/apt/apt.conf.d/50unattended-upgrades | egrep -v "//|^$"
Unattended-Upgrade::Allowed-Origins {
        "${distro_id}:${distro_codename}";
        "${distro_id}:${distro_codename}-security";
        "${distro_id}ESMApps:${distro_codename}-apps-security";
        "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::Package-Blacklist {
};
Unattended-Upgrade::DevRelease "auto";
```
기본적으로 설정 되있는 것을 보면 4개의 Repository 에 대해서는 Update 가 Allow 되어 있는 것을 볼 수 있습니다.   
특별히 추가한 Repository 가 없다면 Update 대상이 되는 REpository 는 `jammy`, `jammy-security` 가 될 것 입니다. (Ubuntu 22.04 기준)   

# 서비스 Enable / Disable
안정적인 운영을 요구하는 시스템이라면 해당 서비스를 Disable 하는 것이 좋습니다.   
Package 의 업데이트가 운영중인 서비스에 영향이 가는 것을 막기 위함입니다.   
   
Disable 을 위해서는 아래 명령을 이용하면 됩니다.   
```bash
$ sudo dpkg-reconfigure unattended-upgrades
```
위 명령을 입력하면 아래와 같은 Text UI 가 확인이 되고 `<No>` 를 선택하면 서비스가 Disable 됩니다.   
   <center><img src="/assets/images/post/2022-05-11-ubuntu-unattended-upgrades/1.png" style="max-width: 95%; height: auto;"></center>    
   
상세 설정은 아래와 같이 `0` 로 변경됩니다.   
```bash
ubuntu@chhan-u2204:~$ sudo dpkg-reconfigure unattended-upgrades
Replacing config file /etc/apt/apt.conf.d/20auto-upgrades with new version
   
ubuntu@chhan-u2204:~$ cat /etc/apt/apt.conf.d/20auto-upgrades
APT::Periodic::Update-Package-Lists "0";
APT::Periodic::Unattended-Upgrade "0";
```

Enable 을 위해서는 Disable 에서 사용한 명령을 그대로 사용하고 `<Yes>` 를 선택하면 서비스가 Enable 됩니다.   
상세 설정은 아래와 같이 `1` 로 변경됩니다.   
```bash
ubuntu@chhan-u2204:~$ sudo dpkg-reconfigure unattended-upgrades
Replacing config file /etc/apt/apt.conf.d/20auto-upgrades with new version
    
ubuntu@chhan-u2204:~$ cat /etc/apt/apt.conf.d/20auto-upgrades
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
```
   
# 주요 기능
`unattended-upgrades` 에 포함된 기능 중, 활용하기 좋은 설정 부분에 대해 알아보도록 하겠습니다.   
   
## Blacklist 기능
`/etc/apt/apt.conf.d/50unattended-upgrades` 의 `Unattended-Upgrade::Package-Blacklist` 영역에 내용을 추가하여 `unattended-upgrades` 서비스가 특정 Package 를 Update 못하도록 하는 설정을 할 수 있습니다.   
```console
Unattended-Upgrade::Package-Blacklist {
    // The following matches all packages starting with linux-
//  "linux-";
 
    // Use $ to explicitely define the end of a package name. Without
    // the $, "libc6" would match all of them.
//  "libc6$";
//  "libc6-dev$";
//  "libc6-i686$";
 
    // Special characters need escaping
//  "libstdc\+\+6$";
 
    // The following matches packages like xen-system-amd64, xen-utils-4.1,
    // xenstore-utils and libxenstore3.0
//  "(lib)?xen(store)?";
 
    // For more information about Python regular expressions, see
    // https://docs.python.org/3/howto/regex.html
};
```
   
한가지 예로 `nginx` Package 에 대해 자동으로 update 가 안되도록 하기 위해서는 아래와 같이 설정하면 됩니다.   
```console
Unattended-Upgrade::Package-Blacklist {
    "nginx";
};
```
   
## Auto-Reboot
주기적으로 시스템을 Update 하고 자동으로 재부팅을 진행하고 싶은 경우, 아래 설정을 이용 할 수 있습니다.   
```console
// Automatically reboot *WITHOUT CONFIRMATION* if
//  the file /var/run/reboot-required is found after the upgrade
//Unattended-Upgrade::Automatic-Reboot "false";
 
// Automatically reboot even if there are users currently logged in
// when Unattended-Upgrade::Automatic-Reboot is set to true
//Unattended-Upgrade::Automatic-Reboot-WithUsers "true";
 
// If automatic reboot is enabled and needed, reboot at the specific
// time instead of immediately
//  Default: "now"
//Unattended-Upgrade::Automatic-Reboot-Time "02:00";
```
   
`Unattended-Upgrade::Automatic-Reboot` 재부팅 여부를 설정 할 수 있고,   
`Unattended-Upgrade::Automatic-Reboot-WithUsers` 로그인한 사용자에 대한 재부팅 여부 설정,   
`Unattended-Upgrade::Automatic-Reboot-Time` 재부팅 시간을 설정 할 수 있습니다.   
   
# 작동 확인
기본적으로 `unattended-upgrades` 는 매일 06:25 분에 수행되는 cron.daily 에 등록 되어 있습니다.   
```bash
ubuntu@chhan-u2204:~$ cat /etc/crontab | grep daily
25 6    * * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
```
(위 시간은 각 시스템에 설정에 따라 차이가 있을 수 있습니다.)   
   
수행하는 script 는 아래 부분입니다.   
```bash
ubuntu@chhan-u2204:~$ cat /etc/cron.daily/apt-compat  | tail -n1
exec /usr/lib/apt/apt.systemd.daily
```
   
# 작동 로그
자동으로 update 가 완료되는 아래와 경로에 로그가 생성되고 확인이 가능합니다.   
```bash
$ cat /var/log/unattended-upgrades/unattended-upgrades-dpkg.log | more
Log started: 2022-05-04  06:29:22
(Reading database ...
Preparing to unpack .../libinput-bin_1.20.0-1ubuntu0.1_amd64.deb ...
Unpacking libinput-bin (1.20.0-1ubuntu0.1) over (1.20.0-1) ...
Preparing to unpack .../libinput10_1.20.0-1ubuntu0.1_amd64.deb ...
Unpacking libinput10:amd64 (1.20.0-1ubuntu0.1) over (1.20.0-1) ...
Setting up libinput-bin (1.20.0-1ubuntu0.1) ...
Setting up libinput10:amd64 (1.20.0-1ubuntu0.1) ...
Processing triggers for libc-bin (2.35-0ubuntu3) ...
NEEDRESTART-VER: 3.5
NEEDRESTART-KCUR: 5.15.0-25-generic
NEEDRESTART-KEXP: 5.15.0-27-generic
NEEDRESTART-KSTA: 3
NEEDRESTART-SVC: NetworkManager.service
... 생략
```
   
apt `history.log` 에도 해당 내용이 기록됩니다.   
```bash
$ cat /var/log/apt/history.log
... 생략
Start-Date: 2022-05-04  06:29:23
Commandline: /usr/bin/unattended-upgrade
Upgrade: libinput10:amd64 (1.20.0-1, 1.20.0-1ubuntu0.1), libinput-bin:amd64 (1.20.0-1, 1.20.0-1ubuntu0.1)
End-Date: 2022-05-04  06:29:23
... 생략
```
   
# 참고 자료
* [https://linuxhint.com/enable-disable-unattended-upgrades-ubuntu/](https://linuxhint.com/enable-disable-unattended-upgrades-ubuntu/)    
