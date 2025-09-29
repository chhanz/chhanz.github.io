---
layout: post
title: "[Linux] Loop Mount 구성"
description: ""
author: chhanz
date: 2025-09-29
tags: [linux]
category: linux
---

# Loop Devive 란?
루프 장치(Loop device)는 유닉스 계열 운영 체제에서 특정 파일을 일반 블록 장치처럼 접근할 수 있게 해주는 가상 장치로, 파일 시스템이 포함된 ISO 이미지나 디스크 이미지를 마운트하는 등의 용도로 사용됩니다.    
루프 장치를 통해 파일 전체를 하나의 디스크처럼 취급하여 해당 파일 시스템을 직접 마운트하고 읽거나 쓸 수 있습니다.   
   
# Mount the Loop device 
이러한 Loop Device 와 같은 가상 장치를 통해 Cloud Image, ISO, 파일을 `mount` 하고 블록 장치와 같은 형태로 사용 할 수 있습니다.   
   
이번 글에서는 Cloud Image 의 형태에 따라 Loop device 를 사용하는 방법에 대해 작성해보았습니다.  
   
## Single Partition 구조
일반적으로 파티션 한개를 이미지 백업 받은 파일을 loop device 를 이용하여 `mount` 하는 방법은 일반적인 ISO 이미지를 `mount` 하는 방법과 유사합니다.   
   
```console
# parted part-image-backup.img unit B print
Model:  (file)
Disk /data/part-image-backup.img: 8587820544B
Sector size (logical/physical): 512B/512B
Partition Table: loop
Disk Flags:

Number  Start  End          Size         File system  Flags
 1      0B     8587820543B  8587820544B  xfs

```

한개의 파티션을 `dd` 를 통해 파일로 생성한 형태의 구조입니다.   
   
이런 경우, 아래와 같은 방법으로 파일시스템 탑재를 하고 수정 및 확인이 가능합니다.   
   
```console
# mount -o loop,nouuid part-image-backup.img /mnt

# lsblk
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
loop0     7:0    0    8G  0 loop /mnt        <<<----!!!
...

# cat /mnt/etc/os-release |head -n1
NAME="Amazon Linux"
```
   
## Multiple Partition 구조
디스크 (or 볼륨) 의 모든 파티션을 이미지 백업을 하거나 Cloud Image 와 같은 형태로 제공이 되는 파일을 loop device 를 이용하여 `mount` 하여 사용이 가능하게 하는 방법입니다.   
   
테스트에 사용된 Cloud Image 정보는 아래와 같습니다.   
   
```bash
$ sudo qemu-img info rhel-9.6-x86_64-kvm.raw
image: rhel-9.6-x86_64-kvm.raw
file format: raw
virtual size: 10 GiB (10737418240 bytes)
disk size: 1.61 GiB
Child node '/file':
    filename: rhel-9.6-x86_64-kvm.raw
    protocol type: file
    file length: 10 GiB (10737418240 bytes)
    disk size: 1.61 GiB
    Format specific information:
        extent size hint: 1048576
```
   
먼저 이미지의 파티션 구조를 파악합니다.   
   
```console
# parted rhel-9.6-x86_64-kvm.raw unit B print
Model:  (file)
Disk /root/rhel-9.6-x86_64-kvm.raw: 10737418240B
Sector size (logical/physical): 512B/512B
Partition Table: gpt
Disk Flags:

Number  Start        End           Size         File system  Name  Flags
 1      1048576B     2097151B      1048576B                        bios_grub
 2      2097152B     211812351B    209715200B   fat16              boot, esp
 3      211812352B   1285554175B   1073741824B  xfs                bls_boot
 4      1285554176B  10737401343B  9451847168B  xfs
```
   
`/` 파일시스템은 `1285554176` B 부터 섹터가 시작이 되는 것으로 확인 됩니다.   
   
`losetup` 명령어를 통해 파티션 시작 섹터를 지정하여 loop device 생성합니다.   
   
```console
# losetup -o 1285554176 /dev/loop0 rhel-9.6-x86_64-kvm.raw

# losetup -l
NAME       SIZELIMIT     OFFSET AUTOCLEAR RO BACK-FILE                     DIO LOG-SEC
/dev/loop0         0 1285554176         0  0 /root/rhel-9.6-x86_64-kvm.raw   0     512
```
   
위와 같이 loop0 디바이스가 생성이 되면 아래와 같은 방법을 통해 `mount` 를 수행하고 파일시스템을 탑재할 수 있습니다.   
   
```bash
$ sudo lsblk
NAME          MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
loop0           7:0    0  8.8G  0 loop
nvme0n1       259:0    0   50G  0 disk
├─nvme0n1p1   259:1    0   50G  0 part /
├─nvme0n1p127 259:2    0    1M  0 part
└─nvme0n1p128 259:3    0   10M  0 part /boot/efi

$ sudo mount /dev/loop0 /mnt

$ sudo cat /mnt/etc/redhat-release
Red Hat Enterprise Linux release 9.6 (Plow)
```
   
# 참고 문서
* [https://linux.die.net/man/8/losetup](https://linux.die.net/man/8/losetup)   