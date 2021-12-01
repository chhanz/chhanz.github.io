---
layout: post
title: "[Linux] systemd 에 Service 등록"
description: "RHEL/CentOS"
author: chhanz
date: 2019-01-18
tags: [linux]
category: linux
---

# [Linux][RHEL/CentOS] systemd 에 Service 등록
* * * 

Systemd 에 사용자가 자주 사용하는 Service 를 등록하고 Systemd 를 통해 관리 할 수 있습니다.   
   
아래는 Systemd 에 등록할 Service Script 입니다.   

## Systemd test 용 Script 
* * *
~~~
#!/bin/bash

echo -e " Start Systemd Test " | logger -t Testsystemd

while :
do
	echo -e "Running systemd"
	sleep 30
done
~~~

# systemd 에 Service 등록
* * *
systemd 에 서비스를 등록하기 위해 아래 경로에 아래와 같이 설정을 합니다.   
~~~
# vi /etc/systemd/system/testchk.service

// /etc/systemd/system/testchk.service 내용
[Unit]
Description=Systemd Test Daemon

[Service]
Type=simple
ExecStart=/root/test-daemon.sh
Restart=on-failure

[Install]
WantedBy=multi-user.target
~~~

# 서비스 등록 및 시작
* * *
## + 등록된 서비스 시작   

~~~
# systemctl start testchk

// 서비스 상태 체크
# systemctl status testchk
● testchk.service - Systemd Test Daemon
   Loaded: loaded (/etc/systemd/system/testchk.service; enabled; vendor preset: disabled)
   Active: active (running) since Sat 2019-01-19 22:20:57 KST; 5s ago
 Main PID: 12003 (test-daemon.sh)
    Tasks: 2
   CGroup: /system.slice/testchk.service
           ├─12003 /bin/bash /root/test-daemon.sh
           └─12006 sleep 30

Jan 19 22:20:57 localhost.local systemd[1]: Started Systemd Test Daemon.
Jan 19 22:20:57 localhost.local test-daemon.sh[12003]: Runniog systemd
~~~

## + 재부팅 후에도 서비스가 시작되도록 서비스 등록   

~~~
# systemctl enable testchk
Created symlink from /etc/systemd/system/multi-user.target.wants/testchk.service to /etc/systemd/system/testchk.service.
~~~
위와 같이 등록이 가능합니다.   
_[Install]_ 항목에 설정된 내용에 맞게 서비스에 등록이 됩니다.

# Service Restart Action 지정
* * *
위에 테스트로 만들어진 /etc/systemd/system/testchk.service 를 보면, _Restart_ 설정이 있습니다.   
_on-failure_ 로 _Restart_ 를 설정하면 서비스에 문제가 생기면 systemd 가 해당 서비스를 재시작 합니다.   

## + 서비스 상태 확인

~~~
# systemctl status testchk
● testchk.service - Systemd Test Daemon
   Loaded: loaded (/etc/systemd/system/testchk.service; enabled; vendor preset: disabled)
   Active: active (running) since Sat 2019-01-19 22:20:57 KST; 5min ago
 Main PID: 12003 (test-daemon.sh)
    Tasks: 2
   CGroup: /system.slice/testchk.service
           ├─12003 /bin/bash /root/test-daemon.sh
           └─12487 sleep 30

Jan 19 22:21:27 localhost.local test-daemon.sh[12003]: Runniog systemd
Jan 19 22:21:57 localhost.local test-daemon.sh[12003]: Runniog systemd
Jan 19 22:22:27 localhost.local test-daemon.sh[12003]: Runniog systemd
Jan 19 22:22:57 localhost.local test-daemon.sh[12003]: Runniog systemd
Jan 19 22:23:27 localhost.local test-daemon.sh[12003]: Runniog systemd
Jan 19 22:23:57 localhost.local test-daemon.sh[12003]: Runniog systemd
Jan 19 22:24:27 localhost.local test-daemon.sh[12003]: Runniog systemd
Jan 19 22:24:57 localhost.local test-daemon.sh[12003]: Runniog systemd
Jan 19 22:25:27 localhost.local test-daemon.sh[12003]: Runniog systemd
Jan 19 22:25:57 localhost.local test-daemon.sh[12003]: Runniog systemd
~~~

## + 서비스 강제 중지

~~~
# ps -ef | grep test
root     12003     1  0 22:20 ?        00:00:00 /bin/bash /root/test-daemon.sh
root     12500 11911  0 22:26 pts/1    00:00:00 grep --color=auto test
# kill -9 12003
~~~

## + 서비스 재시작 확인

~~~
# systemctl status testchk
● testchk.service - Systemd Test Daemon
   Loaded: loaded (/etc/systemd/system/testchk.service; enabled; vendor preset: disabled)
   Active: active (running) since Sat 2019-01-19 22:27:05 KST; 28s ago
 Main PID: 12509 (test-daemon.sh)
    Tasks: 2
   CGroup: /system.slice/testchk.service
           ├─12509 /bin/bash /root/test-daemon.sh
           └─12512 sleep 30

Jan 19 22:27:05 localhost.local systemd[1]: testchk.service holdoff time over, scheduling restart.
Jan 19 22:27:05 localhost.local systemd[1]: Stopped Systemd Test Daemon.
Jan 19 22:27:05 localhost.local systemd[1]: Started Systemd Test Daemon.
Jan 19 22:27:05 localhost.local test-daemon.sh[12509]: Runniog systemd
~~~

위와 같이 서비스가 문제가 발생하여, 서비스가 중지가 되고 해당 서비스가 재시작이 된 것을 볼 수 있습니다.   

systemd 를 이용하면 손쉽게 Custom 서비스를 관리 할 수 있습니다.


# 참고자료 
* * *

* systemd : [https://www.freedesktop.org/wiki/Software/systemd/](https://www.freedesktop.org/wiki/Software/systemd/)   
* on-failure Option : [https://singlebrook.com/2017/10/23/auto-restart-crashed-service-systemd/](https://singlebrook.com/2017/10/23/auto-restart-crashed-service-systemd/)
