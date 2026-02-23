---
layout: post
title: "[Linux] .bash_history 로그에 timestamp 추가하기"
description: " "
author: chhanz
date: 2020-03-10
tags: [linux]
category: linux
---

# .bash_history 로그에 timestamp 추가하기
* * * 
## Add timestamp to .bash_history
`/etc/profile` 에 해당 구문을 추가한다.   
```console
HISTTIMEFORMAT="[%Y-%m-%d %H:%M:%S] "
export HISTTIMEFORMAT
```
   
## Result
```bash
[root@fastvm-centos-7-7-30 ~]# history 
    1  [2020-01-13 17:34:40] history -ps
    2  [2020-01-13 17:34:40] ls
    3  [2020-01-13 17:34:40] ip a
    4  [2020-01-13 17:34:40] lsblk
    5  [2020-01-13 17:34:40] df
    6  [2020-01-13 17:34:40] history -ps
    7  [2020-01-13 17:34:40] history
    8  [2020-01-13 17:34:40] ls
    9  [2020-01-13 17:34:40] cd /etc
   10  [2020-01-13 17:34:40] ls
   11  [2020-01-13 17:34:40] cd profile.d/
```
