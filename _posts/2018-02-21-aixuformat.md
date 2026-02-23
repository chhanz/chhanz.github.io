---
layout: post
title: "[AIX] hdisk format - diag command"
description: " "
author: chhanz
date: 2018-02-21
tags: [aix]
category: aix
---

# AIX - DISK FORMAT
* * *

주로 AIX 에서는 diag 를 통해 hdisk format 을 진행하고 데이터 삭제 검증을 합니다.   
하지만 동시에 여러개의 hdisk 를 format 을 진행 할 수는 없습니다.   

아래와 같이 명령어를 이용하면 동시에 hdisk format 이 가능합니다.   

```
/usr/lpp/diagnostics/bin/uformat -d hdisk1 -c -o format
```


# 동시에 여러 hdisk format 진행 하는 Command
```
lspv | grep None | awk '{print "/usr/lpp/diagnostics/bin/uformat -d "$1" -c -o format &"}' | sh -x
```

