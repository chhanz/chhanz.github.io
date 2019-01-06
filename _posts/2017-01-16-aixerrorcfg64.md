---
layout: post
title: "Could not load program: Cannot run a 64-bit program until the 64-bit environment has been configured."
description: " "
author: chhanz
date: 2017-01-16
tags: [aix]
category: aix
---

# Could not load program: Cannot run a 64-bit program until the 64-bit environment has been configured.

aix maintenance mode 로 부팅 진행 후, shell 환경에서 아래와 같이 Error 가 발생하면서   
일부 명령어들이 정상 작동 하지 않습니다.  

cf. [Booting AIX into Maintenance Mode](http://www-01.ibm.com/support/docview.wss?uid=isg3T1013056)

# Error 내용   
```
# ls
 Could not load program ls: Cannot run a 64-bit program until the 64-bit
 environment has been configured. See the system administrator.
```

# 해결 방법
```
# /etc/methods/cfg64
```

# 해결 이후
```
# ls 
 test.log
 test.sh
 .profile
 ... < 하략 >
```
