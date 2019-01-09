---
layout: post
title: "JFS vs JFS2"
description: "JFS 와 JFS2의 차이점" 
author: chhanz
date: 2012-09-06
tags: [aix, jfs, jfs2]
category: aix
---

# JFS 와 JFS2 차이점  
* * *

JFS2 는 AIX V4.3. 에서 소개되었던 JFS 의 upgrade version   
JFS 와 JFS2 는 모두 AIX 에 기본적으로 탑재되어 있습니다. 다만 POWER system 에서는 JFS/JFS2 를 모두 사용할 수 있지만,    
IA64 system 에서는 JFS2 만 사용할 수 있습니다.    

## JFS vs JFS2
* * *

| Function | JFS2 | JFS |
|:-:|:-:|:-:|
|Fragments/Block Size|512~4096 Block Size|512~4096 Block Size|
| Architectural Maximum File (만들 수 있는 최대  File Size) | 1PB(**1) | 64GB |
| Architectural Maximum File System Size (만들 수 있는 최대 파일 시스템 Size) | 4PB | 1TB(**2) |
| Maximum File Size Tested (최대 파일 크기 테스트) | 1TB | 64GB |
| Maximum File System Size (최대 파일 시스템 크기) | 1TB | 1TB |
| Number of Inodes (Inodes 수) | Dynamic, Limited by disk space | Fixed, set at file system creation |
| Directory Organization (디렉토리 조직) | B-tree | Linear |
| Compresssion (압축) | No | Yes |
| Default Ownership at Creation(생성 시 기본 소유권) | root.system | sys.sys |
| SGID of Default File Mode(기본 파일 모드 SGID) | SGID=off | SGID=on |
| Quotas | No | Yes |
| Available on IA64 Architecture(IA64 아키텍처에서 사용 가능) | Yes | No |
| Available on POWER Architecture (POWER 아키텍처에서 사용 가능) | Yes | Yes |

```
(**1) PB (PetaBytes) = 1,048,576 GB
(**2) TB (TeraBytes) = 1,024 GB    
```

cf) SGID = Linux SetUID 와 같은 기능

## JFS2 의 대표적인 몇 가지 특징
* * * 
- Extent based addressing structure ( 범위 기반 주소 지정 구조 )   
- Dynamic disk inode allocation ( 동적 디스크 inode 할당 )   
- Directory organization ( 디렉토리 조직 )   
- On-line file system space defragmentation ( 온라인 파일 시스템 공간 조각 모음 )   
- Variable block size ( 가변 블록 크기 )   


JFS 와 JFS2 의 addressing 구조에 많은 차이가 있습니다.   
JFS2 의 addressing structure 를 살펴보면, block allocation policy 가 변화하면서 좀 더 효율적이고, 확장성이 뛰어나면, compact 한 구조를 가지게 되있습니다.
특히 JFS2 에서는 더 이상 필요 없는 공간을 free 시켜서, 다른 공간에 할당하는 inode의 dynamic allocation 이 가능합니다.
기존의 JFS 는 file system 을 생성할 때 inode 가 고정되지만, JFS2 에서는 사용중인 file system 의 inode 를 변화시킬 수 있다.

또 현재 mount 되어 사용 중인 file system 을 defragmentation(조각 모음) 이 가능합니다.    
File system 의 남은 공간을 다시 fragement 하면 I/O 가 그만큼 더 빨라질 수 있고, 공간 효율도 더 높일 수 있습니다.    

이와 같은 이유로 JFS2 에서는 “Large File enabled System    ( 큰 용량의 파일 허용 )” 이라는 옵션이 없어졌다. JFS2 에는 두 가지의 directory 구조를 사용합니다.    
작은 directory 와 큰 directory 에 사용하는 directory 구조가 다른데, 큰 directory 구조에는 기존의 linear 가 아닌 B-tree 형태를 사용합니다.
이 B-tree 구조는 좀 더 빠른 operation(directory look up, delete, insert...) 이 가능합니다.   

JFS2 가 512, 1024, 2048, 4096 byte 의 block size 를 지원하는 것은 JFS 와 같습니다. 
Block size 가 작으면, disk 사용률은 높아지는 대신에, fragment(조각모음)율이 높아져서 path(경로) 가 길어지고, block size 가 커지면, path 가 짧기 때문에 performance(작업)는 좋아지지만, 디스크 사용률은 약간 낮아집니다.
이 밖에도 performance 를 높이기 위해서 vnode cache 가 NFS 에 추가되고, File system cache 가 좀 더 확장된 면이 있습니다.


