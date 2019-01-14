---
layout: post
title: "[AIX] Mirror 상태인 VG, alt_disk_install 하는 법"
description: " " 
author: chhanz
date: 2012-12-28
tags: [aix, alt_disk_install]
category: aix
---

# Mirror VG, 한개의 PV 로 alt_disk_install 하는 방법
* * *

Mirror 된 VG 를 alt_disk_install 을 진행하면 target PV 는 2EA 가 필요합니다.   
따라서 Mirror 된 VG 는 한개의 target PV 에 하기 위해서는 **-i** 옵션을 사용합니다.   

## image.data 수정
* * *
-i 옵션에 사용될 image.data 를 수정합니다.

```
# lspv 
hdisk0 000aaaa120011111 rootvg active 
hdisk1 000aaaa120222222 rootvg active 
hdisk2 none None 

# vi /image.data

## lv_data의 항목중 
* LV_SOURCE_DISK_LIST= hdisk0 hdisk1 -> hdisk0로 변경 
* COPIES= 2 -> 1로 변경 
* PP= 2 -> 1로 변경 
```

위와 같이 Source PV 하나를 제거하고, LV의 COPY 수량, LV 용량을 수정합니다.    

## alt_disk_install 진행
* * *
```
# alt_disk_install -COB -i /image.data hdisk2
```

