---
layout: post
title: "CentOS 7 raw device 생성"
description: " "
author: chhanz
date: 2018-10-1
tags: [linux]
category: linux
---

# CentOS 7 raw device 생성
* * * 
>raw device 생성을 위해 아래 절차를 따라 /etc/udev/rules.d/60-raw.rules 을 수정합니다.   

1. udev rules 을 사용하여 raw device 를 생성합니다.   
~~~
# vi /etc/udev/rules.d/60-raw.rules
~~~
2. SCSI Device 를 사용하는 경우,   
~~~
ACTION=="add|change", KERNEL=="sdc", RUN+="/usr/bin/raw /dev/raw/raw1 %N"
~~~
3. multipath device 를 사용하는 경우,   
~~~
ACTION=="add|change", ENV{DM_NAME}="mpath1", RUN+="/usr/bin/raw /dev/raw/raw1 %N" 
~~~
4. LVM device 를 사용하는 경우,
~~~
ACTION=="add|change", ENV{DM_VG_NAME}=="vg_test", ENV{DM_LV_NAME}=="lv_test1", RUN+="/bin/raw /dev/raw/raw1 %N"
~~~
5. raw device 의 권한 설정   
~~~
ACTION=="add", KERNEL=="raw*", OWNER="oracle", GROUP="dba", MODE="0660"
~~~
6. udev rules 갱신   
~~~
# udevadm trigger --action=add
~~~
7. raw device 설정 확인   
~~~
# raw -qa
/dev/raw/raw1:  bound to major 8, minor 17
# ls -l /dev/raw
total 0
crw-rw---- 1 oracle  dba 162,  2 Jan 21 05:21 raw1
~~~
