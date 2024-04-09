---
layout: post
title: "[Linux] How to extend MD device (RAID 0)"
description: "RAID 0 MD device 증설 방법"
author: chhanz
date: 2024-04-09
tags: [linux]
category: linux
---

# RAID 0 MD device 증설 방법
사용하는 RAID 0 의 MD device 를 증설하는 여러 방법에 대해 작성해보겠습니다.   
   
# 테스트 RAID 디바이스 생성
아래와 같은 방법으로 디스크 3장을 RAID 0 디바이스로 생성 할 수 있습니다.   
   
```bash
$ sudo mdadm --create --level=0 --raid-devices=3 /dev/md0 /dev/xvdb /dev/xvdc /dev/xvdd
mdadm: Defaulting to version 1.2 metadata
mdadm: array /dev/md0 started.

$ sudo mdadm --detail /dev/md0
/dev/md0:
           Version : 1.2
     Creation Time : Mon Apr  8 23:19:51 2024
        Raid Level : raid0
        Array Size : 31432704 (29.98 GiB 32.19 GB)
      Raid Devices : 3
     Total Devices : 3
       Persistence : Superblock is persistent

       Update Time : Mon Apr  8 23:19:51 2024
             State : clean
    Active Devices : 3
   Working Devices : 3
    Failed Devices : 0
     Spare Devices : 0

        Chunk Size : 512K

Consistency Policy : none

              Name : 0
              UUID : 3336d55a:441542ed:a51f9c0c:b2fa98dc
            Events : 0

    Number   Major   Minor   RaidDevice State
       0     202       16        0      active sync   /dev/sdb
       1     202       32        1      active sync   /dev/sdc
       2     202       48        2      active sync   /dev/sdd
       
$ sudo mkfs.xfs /dev/md0
log stripe unit (524288 bytes) is too large (maximum is 256KiB)
log stripe unit adjusted to 32KiB
meta-data=/dev/md0               isize=512    agcount=16, agsize=491008 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=1        finobt=1, sparse=1, rmapbt=0
         =                       reflink=1    bigtime=0 inobtcount=0
data     =                       bsize=4096   blocks=7856128, imaxpct=25
         =                       sunit=128    swidth=384 blks
naming   =version 2              bsize=4096   ascii-ci=0, ftype=1
log      =internal log           bsize=4096   blocks=3840, version=2
         =                       sectsz=512   sunit=8 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0

$ sudo df -hT /data
Filesystem     Type  Size  Used Avail Use% Mounted on
/dev/md0       xfs    30G  247M   30G   1% /data

$ sudo cat /proc/mdstat
Personalities : [raid0]
md0 : active raid0 xvdd[2] xvdc[1] xvdb[0]
      31432704 blocks super 1.2 512k chunks

unused devices: <none>
```

# 온라인 증설 (운영중에 증설)
아래와 같은 방법으로 운영중에 ARRAY 에 신규 디스크를 추가하고 파일시스템을 증설 할 수 있습니다.   
   
```bash
$ sudo mdadm -Gv --level=0 --raid-devices=4 --add /dev/md0 /dev/xvde
mdadm: level of /dev/md0 changed to raid4
mdadm: added /dev/xvde
```
위와 같이 신규 디스크를 array 에 추가를 합니다.   
이 과정에서 array 는 `RAID 0` 에서 `RAID 4` 로 변경이 되고 `reshape` 이 수행됩니다.   
`reshape` 과정이 완료되면 다시 `RAID 0` 로 변경 됩니다.
   
```bash
$ sudo cat /proc/mdstat
Personalities : [raid0] [raid6] [raid5] [raid4]
md0 : active raid4 xvde[4] xvdd[2] xvdc[1] xvdb[0]
      31432704 blocks super 1.2 level 4, 512k chunk, algorithm 5 [5/4] [UUU__]
      [>....................]  reshape =  1.6% (174108/10477568) finish=9.8min speed=17410K/sec

unused devices: <none>

$ sudo mdadm --detail /dev/md0
/dev/md0:
           Version : 1.2
     Creation Time : Mon Apr  8 23:19:51 2024
        Raid Level : raid4
        Array Size : 31432704 (29.98 GiB 32.19 GB)
     Used Dev Size : 10477568 (9.99 GiB 10.73 GB)
      Raid Devices : 5
     Total Devices : 4
       Persistence : Superblock is persistent

       Update Time : Mon Apr  8 23:23:50 2024
             State : clean, FAILED, reshaping
    Active Devices : 3
   Working Devices : 4
    Failed Devices : 0
     Spare Devices : 1

        Chunk Size : 512K

Consistency Policy : resync

    Reshape Status : 4% complete
     Delta Devices : 1, (4->5)

              Name : 0
              UUID : 3336d55a:441542ed:a51f9c0c:b2fa98dc
            Events : 27

    Number   Major   Minor   RaidDevice State
       0     202       16        0      active sync   /dev/sdb
       1     202       32        1      active sync   /dev/sdc
       2     202       48        2      active sync   /dev/sdd
       4     202       64        3      spare rebuilding   /dev/sde
       -       0        0        4      removed
```
위 내용은 `reshape` 중인 array 의 상태입니다.   
   
```bash
$ sudo cat /proc/mdstat
Personalities : [raid0] [raid6] [raid5] [raid4]
md0 : active raid0 xvde[4] xvdd[2] xvdc[1] xvdb[0]
      41910272 blocks super 1.2 512k chunks

unused devices: <none>

$ sudo mdadm --detail /dev/md0
/dev/md0:
           Version : 1.2
     Creation Time : Mon Apr  8 23:19:51 2024
        Raid Level : raid0
        Array Size : 41910272 (39.97 GiB 42.92 GB)
      Raid Devices : 4
     Total Devices : 4
       Persistence : Superblock is persistent

       Update Time : Mon Apr  8 23:34:31 2024
             State : clean
    Active Devices : 4
   Working Devices : 4
    Failed Devices : 0
     Spare Devices : 0

        Chunk Size : 512K

Consistency Policy : none

              Name : 0
              UUID : 3336d55a:441542ed:a51f9c0c:b2fa98dc
            Events : 91

    Number   Major   Minor   RaidDevice State
       0     202       16        0      active sync   /dev/sdb
       1     202       32        1      active sync   /dev/sdc
       2     202       48        2      active sync   /dev/sdd
       4     202       64        3      active sync   /dev/sde
```
위와 같이 `reshape` 이 완료되면 다시 `RAID 0` 가 됩니다.   

```bash
$ sudo lsblk -o NAME,SIZE,TYPE
NAME    SIZE TYPE
xvda      8G disk
└─xvda1   8G part
xvdb     10G disk
└─md0    40G raid0
xvdc     10G disk
└─md0    40G raid0
xvdd     10G disk
└─md0    40G raid0
xvde     10G disk     <<<----!!!! 추가된 디스크
└─md0    40G raid0    <<<----!!!! array 에 추가된 상태
```
위와 같이 `lsblk` 를 통해서도 해당 내용을 확인 할 수 있습니다.   
   
```bash
$ sudo xfs_growfs /data
meta-data=/dev/md0               isize=512    agcount=16, agsize=491008 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=1        finobt=1, sparse=1, rmapbt=0
         =                       reflink=1    bigtime=0 inobtcount=0
data     =                       bsize=4096   blocks=7856128, imaxpct=25
         =                       sunit=128    swidth=384 blks
naming   =version 2              bsize=4096   ascii-ci=0, ftype=1
log      =internal log           bsize=4096   blocks=3840, version=2
         =                       sectsz=512   sunit=8 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
data blocks changed from 7856128 to 10477568

$ sudo df -hT /data
Filesystem     Type  Size  Used Avail Use% Mounted on
/dev/md0       xfs    40G  319M   40G   1% /data
```
MD device 가 증설이 완료되면 위와 같이 파일시스템을 `xfs_growfs` 를 이용하여 증설을 하면 온라인 중에 파일시스템 확장이 완료 됩니다.   
   
# 오프라인 증설 (신규 디스크 추가 없이)
Cloud 환경에서는 기존에 사용중이던 디스크의 용량 증설이 쉽게 가능하고 해당 특성을 이용하면 아래와 같은 방법으로 신규 디스크 추가 없이 파일시스템 증설이 가능합니다.   
   
```bash
[root@ip-172-31-39-227 ~]# lsblk -o NAME,SIZE,TYPE
NAME    SIZE TYPE
xvda      8G disk
└─xvda1   8G part
xvdb     10G disk   <<
└─md100  30G raid0
xvdc     10G disk   <<
└─md100  30G raid0
xvdd     10G disk   <<
└─md100  30G raid0
```
기존에 10G 디스크 3개를 사용하는 MD device 입니다.   
   
```bash
$ sudo df -hT /data
Filesystem     Type  Size  Used Avail Use% Mounted on
/dev/md100     xfs    30G  247M   30G   1% /data

$ sudo umount /data

$ sudo mdadm --stop /dev/md100
mdadm: stopped /dev/md100
```
파일시스템 증설을 위해 위와 같이 `umount` 및 MD device stop 을 수행합니다.   
   
```bash
$ sudo lsblk -o NAME,SIZE,TYPE
NAME    SIZE TYPE
xvda      8G disk
└─xvda1   8G part
xvdb     20G disk   <<
└─md100  30G raid0
xvdc     20G disk   <<
└─md100  30G raid0
xvdd     20G disk   <<
└─md100  30G raid0
```
위와 같이 기존에 10G 디스크를 20G 디스크로 수정이 완료 되었습니다.   
   
```bash
$ sudo cat /etc/mdadm.conf | grep ARRAY
cat: /etc/mdadm.conf: No such file or directory

$ sudo mdadm --examine --scan
ARRAY /dev/md/100  metadata=1.2 UUID=cea56678:c6a875c3:b205f109:e890c88e name=100

$ sudo mdadm --examine --scan > /etc/mdadm.conf

$ sudo cat /etc/mdadm.conf | grep ARRAY
ARRAY /dev/md/100  metadata=1.2 UUID=cea56678:c6a875c3:b205f109:e890c88e name=100
```
MD Device 작업을 위해 `mdadm.conf` 에 array 정보를 추가합니다.   
   
```bash
$ sudo mdadm --assemble --update=devicesize /dev/md100
mdadm: /dev/md100 has been started with 3 drives.

$ sudo mdadm --detail /dev/md100  | grep "Array Size"
        Array Size : 62889984 (59.98 GiB 64.40 GB)
```
위와 같이 `/dev/md100` 디바이스의 용량을 업데이트하고 Array 의 용량이 증가 된 것을 확인 할 수 있습니다.   
   
```bash
$ sudo mount /dev/md100 /data

$ sudo df -hT /data
Filesystem     Type  Size  Used Avail Use% Mounted on
/dev/md100     xfs    30G  247M   30G   1% /data

$ sudo xfs_growfs /data
meta-data=/dev/md100             isize=512    agcount=16, agsize=491008 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=1        finobt=1, sparse=1, rmapbt=0
         =                       reflink=1    bigtime=0 inobtcount=0
data     =                       bsize=4096   blocks=7856128, imaxpct=25
         =                       sunit=128    swidth=384 blks
naming   =version 2              bsize=4096   ascii-ci=0, ftype=1
log      =internal log           bsize=4096   blocks=3840, version=2
         =                       sectsz=512   sunit=8 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
data blocks changed from 7856128 to 15722496

$ sudo df -hT /data
Filesystem     Type  Size  Used Avail Use% Mounted on
/dev/md100     xfs    60G  463M   60G   1% /data
```
위와 같이 `xfs_growfs` 를 이용하여 파일시스템을 확장하면 정상적으로 파일시스템이 확장된 것을 볼 수 있습니다.   
   
# 참고 자료
* [https://www.suse.com/ko-kr/support/kb/doc/?id=000020890](https://www.suse.com/ko-kr/support/kb/doc/?id=000020890)   
* [https://www.redhat.com/en/blog/expanding-capacity-red-hat-enterprise-linux-md-raid-part-1](https://www.redhat.com/en/blog/expanding-capacity-red-hat-enterprise-linux-md-raid-part-1)   