---
layout: post
title: "[AIX] Mirror Disk 교체"
description: ""
author: chhanz
date: 2012-08-26
tags: [aix]
category: aix
---

# Mirror Disk 교체
* * *
Mirroring 으로 구성된 rootvg 에서 장애난 DISK 교체 절차는 아래와 같습니다.   

1. 장애 디스크 확인
```
# errpt 
613E5F38  1212232603  P  H  LVDD  I/O ERROR DETECTED BY LVM
A668F553  1212092003  P  H  hdisk1  DISK OPERATION ERROR
```
2. bootlist 확인
```
# bootlist -om normal
```
3. bootlist 재설정
```
# unmirrorvg rootvg hdisk1
```
4. Unmirror VG 수행
```
# unmirrorvg rootvg hdisk1
```
5. 각 DISK 의 LV 상태 확인
```
# lspv -l hdisk0
# lspv -l hdisk1
```
6. 제거가 안되거나, Mirroring 이 아닌 LV 가 남아 있는 경우
``` 
# migratepv -l hd6 hdisk1 hdisk0
# lspv -l hdisk0    // 확인
# lspv -l hdisk1    // 확인
```
7. VG 에서 DISK 제거
```
# reducevg rootvg hdisk1
```
8. 시스템에서 DISK 제거
```
rmdev -Rdl hdisk1
```
9. bosboot 수행
``` 
# bosboot -ad hdisk0
```
10. 신규 디스크 추가(물리 DISK 교체 및 장착)
~~~
# diag 
혹은
# cfgmgr -v
~~~
11. VG 에 신규 DISK 추가
```
# extendvg rootvg hdisk1
```
12. Mirror VG 수행
```
# mirrorvg -S rootvg hdisk0 hdisk1
```
13. rootvg Mirror 확인
```
# lsvg -l rootvg
```
14. bosboot 수행
```
# bosboot -ad hdisk0
```
15. bootlist 신규 등록
```
# bootlist -om normal hdisk0 hdisk1
```
16. bootlist 확인
```
# bootlist -om normal
```
