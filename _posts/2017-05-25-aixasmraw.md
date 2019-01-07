---
layout: post
title: "Create a raw Logical Volume for Oracle ASM On AIX"
description: " "
author: chhanz
date: 2017-05-25
tags: [aix]
category: aix
---

# Create a raw Logical Volume for Oracle ASM On AIX
* * *

Raw Device 의 용량 산정은 VG 의 PP Size 를 기준으로 합니다.

```
# lsvg RAWVG
VOLUME GROUP:       RAWVG                    VG IDENTIFIER:  00c25b6700004c00000001399f63219x
VG STATE:           active                   PP SIZE:        64 megabyte(s)
VG PERMISSION:      read/write               TOTAL PPs:      30 (1920 megabytes)
MAX LVs:            4096                     FREE PPs:       6 (384 megabytes)
LVs:                3                        USED PPs:       24 (1536 megabytes)
OPEN LVs:           3                        QUORUM:         2 (Enabled)
TOTAL PVs:          1                        VG DESCRIPTORS: 2
STALE PVs:          0                        STALE PPs:      0
ACTIVE PVs:         1                        AUTO ON:        no
Concurrent:         Enhanced-Capable         Auto-Concurrent: Disabled
VG Mode:            Concurrent                               
Node ID:            1                        Active Nodes:       2 
MAX PPs per VG:     2097152                  MAX PVs:        1024
LTG size (Dynamic): 1024 kilobyte(s)         AUTO SYNC:      no
HOT SPARE:          no                       BB POLICY:      relocatable 
MIRROR POOL STRICT: off                                       
PV RESTRICTION:     none                     INFINITE RETRY: no
```

위 RAWVG 정보를 보면 PP SIZE 가 64 mb 로 확인 됩니다.   
그럼 10 GB 의 Raw Device 를 만들기 위해서는   
```
10240 = 64 * 160
```
160 개의 PP 가 필요합니다.   


용량 산정이 완료가 되었다면, 아래 명령을 통해 Raw Device 를 생성합니다.   
```
mklv -y rawlv1 -t raw RAWVG 160
mklv -y rawlv2 -t raw RAWVG 160
mklv -y rawlv3 -t raw RAWVG 160
...
```

