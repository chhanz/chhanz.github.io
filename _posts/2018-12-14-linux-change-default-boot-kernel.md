---
layout: post
title: "[Linux] Default boot kernel 변경 방법"
description: "RHEL/CentOS"
author: chhanz
date: 2018-12-14
tags: [linux]
category: linux
---

# RHEL / CentOS 7 - Default boot kernel 변경 방법
* * * 

시스템을 부팅을 하면서 GRUB Menu 에서 Kernel 을 특정 버전으로 선택하여, 부팅을 할 수 있습니다.   
하지만 시스템을 물리적으로 접근이 불가능하거나, 원격으로만 작업이 가능할 경우에는 아래와 같은 방법으로 Default boot Kernel 을 변경해서 특정 버전으로 선택하여 부팅을 할 수 있습니다.   
주로 Kernel Update 이후, Kernel Version 원복 등으로 사용 할 수 있습니다.   

# Kernel Entry 확인
* * *
GRUB Menu 에서 Kernel Entry 가 어떻게 나올지 확인을 합니다.   

```
# cat /etc/grub2.cfg | grep "menuentry " | awk -F"'" '{print $2}'
CentOS Linux (3.10.0-957.1.3.el7.x86_64.debug) 7 (Core)
CentOS Linux (3.10.0-957.1.3.el7.x86_64) 7 (Core)
CentOS Linux (3.10.0-862.el7.x86_64) 7 (Core)
CentOS Linux (0-rescue-300ad7a22ef1472facc28c7d606e6ca3) 7 (Core)
```
위와 같이 확인되면 Entry 는 아래와 같이 지정을 할 수 있습니다.

```
CentOS Linux (3.10.0-957.1.3.el7.x86_64.debug) 7 (Core)			 >> Entry 0
CentOS Linux (3.10.0-957.1.3.el7.x86_64) 7 (Core) 					 >> Entry 1 
CentOS Linux (3.10.0-862.el7.x86_64) 7 (Core)					 >> Entry 2
CentOS Linux (0-rescue-300ad7a22ef1472facc28c7d606e6ca3) 7 (Core) 	 >> Entry 3
```

# Entry 변경
* * *
_grub2-set-default_ 명령을 통해 변경이 가능합니다.   

기존 Kernel Version 은 아래와 같습니다.   

~~~
# cat /boot/grub2/grubenv
# GRUB Environment Block
saved_entry=CentOS Linux (3.10.0-957.1.3.el7.x86_64) 7 (Core)

# uname -a
Linux localhost.local 3.10.0-957.1.3.el7.x86_64 #1 SMP Thu Nov 29 14:49:43 UTC 2018 x86_64 x86_64 x86_64 GNU/Linux
~~~

* Entry 변경

~~~
# grub2-set-default 2

# cat /boot/grub2/grubenv
# GRUB Environment Block
saved_entry=2
~~~

위와 같이 변경을 하고 시스템을 재부팅 합니다.   

# Default Boot Kernel 변경 확인
* * *
시스템이 재부팅 되면 아래와 같이 Default Boot Kernel 이 변경된 것을 확인 할 수 있습니다.   
~~~
# uptime
 22:11:20 up 1 min,  1 user,  load average: 0.89, 0.37, 0.14

# uname -a
Linux localhost.local 3.10.0-862.el7.x86_64 #1 SMP Fri Apr 20 16:44:24 UTC 2018 x86_64 x86_64 x86_64 GNU/Linux

# cat /boot/grub2/grubenv
# GRUB Environment Block
saved_entry=2

~~~
