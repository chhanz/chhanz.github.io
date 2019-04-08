---
layout: post
title: "[GPFS] CentOS 7 - IBM GPFS Hands on Tranining"
description: " "
author: chhanz
date: 2019-04-05
tags: [linux, GPFS]
category: linux
---
# [GPFS] CentOS 7 - IBM GPFS Hands on Tranining
   
# 목표 Hands-on 구성도
* * *   
<center><img src="/assets/images/post/2019-04-05-gpfs/img01.png"></center>   
   
# Hands-on 환경
* * *
> OS Version : CentOS 7.3   
> Kernel Version : 3.10.0-514.el7.x86_64   
> GPFS Version : gpfs v4.2.2-3   
> OS Configuration : SSH Key Copy 완료
   
# Hands-on Lab
Cluster 구성   
~~~
[root@gpfs1 desc]# mmcrcluster -N node_desc --ccr-disable -p gpfs1 -s gpfs2 -r /usr/bin/ssh -R /usr/bin/scp -C gpfscluster
mmcrcluster: Performing preliminary node verification ...
mmcrcluster: Processing quorum and other critical nodes ...
mmcrcluster: Finalizing the cluster data structures ...
mmcrcluster: Command successfully completed
mmcrcluster: Warning: Not all nodes have proper GPFS license designations.
    Use the mmchlicense command to designate licenses as needed.
mmcrcluster: Propagating the cluster configuration data to all
  affected nodes.  This is an asynchronous process.
[root@gpfs1 desc]#
 
[root@gpfs1 desc]# mmchlicense server --accept -N gpfs1,gpfs2
 
The following nodes will be designated as possessing server licenses:
    gpfs1
    gpfs2
mmchlicense: Command successfully completed
mmchlicense: Propagating the cluster configuration data to all
  affected nodes.  This is an asynchronous process.
[root@gpfs1 desc]# 
~~~   

GPFS portability layer 생성   
~~~   
[root@gpfs1 desc]# mmbuildgpl --build-package
--------------------------------------------------------
mmbuildgpl: Building GPL module begins at Thu Apr  4 20:49:28 KST 2019.
--------------------------------------------------------
Verifying Kernel Header...
  kernel version = 31000514 (3.10.0-514.el7.x86_64, 3.10.0-514)
  module include dir = /lib/modules/3.10.0-514.el7.x86_64/build/include
  module build dir   = /lib/modules/3.10.0-514.el7.x86_64/build
  kernel source dir  = /usr/src/linux-3.10.0-514.el7.x86_64/include
  Found valid kernel header file under /usr/src/kernels/3.10.0-514.el7.x86_64/include
Verifying Compiler...
  make is present at /bin/make
  cpp is present at /bin/cpp
  gcc is present at /bin/gcc
  g++ is present at /bin/g++
  ld is present at /bin/ld
Verifying rpmbuild...
Verifying Additional System Headers...
  Verifying kernel-headers is installed ...
    Command: /bin/rpm -q kernel-headers 
    The required package kernel-headers is installed
make World ...
make InstallImages ...
make rpm ...
Wrote: /root/rpmbuild/RPMS/x86_64/gpfs.gplbin-3.10.0-514.el7.x86_64-4.2.2-3.x86_64.rpm
--------------------------------------------------------
mmbuildgpl: Building GPL module completed successfully at Thu Apr  4 20:50:08 KST 2019.
--------------------------------------------------------
[root@gpfs1 desc]# 
~~~   

Node1 build 된 package 설치   
~~~
# yum install /root/rpmbuild/RPMS/x86_64/gpfs.gplbin-3.10.0-514.el7.x86_64-4.2.2-3.x86_64.rpm
Loaded plugins: fastestmirror
Examining /root/rpmbuild/RPMS/x86_64/gpfs.gplbin-3.10.0-514.el7.x86_64-4.2.2-3.x86_64.rpm: gpfs.gplbin-3.10.0-514.el7.x86_64-4.2.2-3.x86_64
Marking /root/rpmbuild/RPMS/x86_64/gpfs.gplbin-3.10.0-514.el7.x86_64-4.2.2-3.x86_64.rpm to be installed
Resolving Dependencies
--> Running transaction check
---> Package gpfs.gplbin-3.10.0-514.el7.x86_64.x86_64 0:4.2.2-3 will be installed
--> Finished Dependency Resolution
 
Dependencies Resolved
 
===================================================================================================================================================================================================================
 Package                                                     Arch                             Version                            Repository                                                                   Size
===================================================================================================================================================================================================================
Installing:
 gpfs.gplbin-3.10.0-514.el7.x86_64                           x86_64                           4.2.2-3                            /gpfs.gplbin-3.10.0-514.el7.x86_64-4.2.2-3.x86_64                           4.1 M
 
Transaction Summary
===================================================================================================================================================================================================================
Install  1 Package
 
Total size: 4.1 M
Installed size: 4.1 M
Is this ok [y/d/N]: y
Downloading packages:
Running transaction check
Running transaction test
Transaction test succeeded
Running transaction
  Installing : gpfs.gplbin-3.10.0-514.el7.x86_64-4.2.2-3.x86_64                                                                                                                                                1/1
  Verifying  : gpfs.gplbin-3.10.0-514.el7.x86_64-4.2.2-3.x86_64                                                                                                                                                1/1
 
Installed:
  gpfs.gplbin-3.10.0-514.el7.x86_64.x86_64 0:4.2.2-3                                                                                                                                                              
 
Complete!
[root@gpfs1 desc]# 
~~~   
Node2 또한 위와 같이 설치합니다.   
~~~   
[root@gpfs1 ]# scp /root/rpmbuild/RPMS/x86_64/gpfs.gplbin-3.10.0-514.el7.x86_64-4.2.2-3.x86_64.rpm gpfs2:/root/
gpfs.gplbin-3.10.0-514.el7.x86_64-4.2.2-3.x86_64.rpm

[root@gpfs2 ]# yum -y install /root/gpfs.gplbin-3.10.0-514.el7.x86_64-4.2.2-3.x86_64.rpm
~~~   

License enable   
~~~   
[root@gpfs1 ~]# mmchlicense server --accept -N gpfs1,gpfs2

The following nodes will be designated as possessing server licenses:
	gpfs1
	gpfs2
mmchlicense: Command successfully completed
mmchlicense: Propagating the cluster configuration data to all
  affected nodes.  This is an asynchronous process.
[root@gpfs1 ~]#
~~~   

Cluster 구성 확인   
~~~   
[root@gpfs1 desc]# mmlscluster
 
GPFS cluster information
========================
  GPFS cluster name:         gpfscluster.gpfs1
  GPFS cluster id:           12307248785610108094
  GPFS UID domain:           gpfscluster.gpfs1
  Remote shell command:      /usr/bin/ssh
  Remote file copy command:  /usr/bin/scp
  Repository type:           server-based
 
GPFS cluster configuration servers:
-----------------------------------
  Primary server:    gpfs1
  Secondary server:  gpfs2
 
 Node  Daemon node name  IP address      Admin node name  Designation
----------------------------------------------------------------------
   1   gpfs1             192.168.13.200  gpfs1            quorum-manager
   2   gpfs2             192.168.13.201  gpfs2            quorum-manager
~~~   
GPFS 서비스 시작
~~~   
[root@gpfs1 ~]# mmstartup -a
Thu Apr  4 20:30:49 KST 2019: mmstartup: Starting GPFS ...
[root@gpfs1 ~]# mmgetstate -a
 
 Node number  Node name        GPFS state
------------------------------------------
       1      gpfs1            active
       2      gpfs2            active
~~~   
NSD Stanza File 작성   
***Stanza files Document : [Link](https://www.ibm.com/support/knowledgecenter/STXKQY_5.0.0/com.ibm.spectrum.scale.v5r00.doc/bl1adm_stanzafiles.htm)***   
~~~   
[root@gpfs1 desc]# cat disk.test.1
%nsd: device=vdb nsd=test1_nsd11 servers=gpfs1 FailureGroup=10 pool=system
%nsd: device=vdb nsd=test1_nsd21 servers=gpfs2 FailureGroup=20 pool=system
[root@gpfs1 desc]# cat disk.test.2
%nsd: device=vdc nsd=test2_nsd11 servers=gpfs1 FailureGroup=10 pool=system
%nsd: device=vdc nsd=test2_nsd21 servers=gpfs2 FailureGroup=20 pool=system
[root@gpfs1 desc]#
~~~   
NSD 생성   
~~~   
# mmcrnsd -F disk.test.1
mmcrnsd: Processing disk vdb
mmcrnsd: Processing disk vdb
mmcrnsd: Propagating the cluster configuration data to all
  affected nodes.  This is an asynchronous process.

# mmcrnsd -F disk.test.2
mmcrnsd: Processing disk vdc
mmcrnsd: Processing disk vdc
mmcrnsd: Propagating the cluster configuration data to all
  affected nodes.  This is an asynchronous process.
~~~   
NSD 생성 확인   
~~~   
# mmlsnsd -X
 
 Disk name    NSD volume ID      Device         Devtype  Node name                Remarks         
---------------------------------------------------------------------------------------------------
 test1_nsd11    C0A80DC85CA5F091   /dev/vdb       generic  gpfs1                    server node
 test1_nsd21    C0A80DC95CA5F093   /dev/vdb       generic  gpfs2                    server node
 test2_nsd11    C0A80DC85CA5F0C5   /dev/vdc       generic  gpfs1                    server node
 test2_nsd21    C0A80DC95CA5F0C6   /dev/vdc       generic  gpfs2                    server node
 
[root@gpfs1 desc]# 
~~~   
GPFS 파일시스템 생성   
~~~   
[root@gpfs1 desc]# mmcrfs gpfs.test1 -F disk.test.1  -A yes -B 256k -m 2 -M 2 -r 2 -R 2 -T /test1
 
The following disks of gpfs.2d1 will be formatted on node gpfs1:
    test1_nsd11: size 20480 MB
    test1_nsd21: size 20480 MB
Formatting file system ...
Disks up to size 192 GB can be added to storage pool system.
Creating Inode File
   5 % complete on Thu Apr  4 20:57:49 2019
  10 % complete on Thu Apr  4 20:57:54 2019
  16 % complete on Thu Apr  4 20:57:59 2019
  21 % complete on Thu Apr  4 20:58:04 2019
  26 % complete on Thu Apr  4 20:58:09 2019
  31 % complete on Thu Apr  4 20:58:15 2019
  36 % complete on Thu Apr  4 20:58:20 2019
  41 % complete on Thu Apr  4 20:58:25 2019
  46 % complete on Thu Apr  4 20:58:30 2019
  51 % complete on Thu Apr  4 20:58:35 2019
  56 % complete on Thu Apr  4 20:58:40 2019
  62 % complete on Thu Apr  4 20:58:46 2019
  67 % complete on Thu Apr  4 20:58:51 2019
  72 % complete on Thu Apr  4 20:58:56 2019
  77 % complete on Thu Apr  4 20:59:01 2019
  83 % complete on Thu Apr  4 20:59:07 2019
  88 % complete on Thu Apr  4 20:59:12 2019
  93 % complete on Thu Apr  4 20:59:17 2019
  98 % complete on Thu Apr  4 20:59:22 2019
 100 % complete on Thu Apr  4 20:59:24 2019
Creating Allocation Maps
Creating Log Files
   3 % complete on Thu Apr  4 20:59:37 2019
  28 % complete on Thu Apr  4 20:59:50 2019
  53 % complete on Thu Apr  4 21:00:02 2019
  78 % complete on Thu Apr  4 21:00:15 2019
 100 % complete on Thu Apr  4 21:00:16 2019
Clearing Inode Allocation Map
Clearing Block Allocation Map
Formatting Allocation Map for storage pool system
Completed creation of file system /dev/gpfs.test1.
mmcrfs: Propagating the cluster configuration data to all
  affected nodes.  This is an asynchronous process.

[root@gpfs1 desc]# mmcrfs gpfs.test2 -F disk.test.2  -A yes -B 256k -m 2 -M 2 -r 2 -R 2 -T /test2
 
The following disks of gpfs.2d1 will be formatted on node gpfs1:
    test2_nsd11: size 20480 MB
    test2_nsd21: size 20480 MB
Formatting file system ...
Disks up to size 192 GB can be added to storage pool system.
Creating Inode File
   3 % complete on Thu Apr  4 21:00:58 2019
   9 % complete on Thu Apr  4 21:01:03 2019
  14 % complete on Thu Apr  4 21:01:09 2019
  19 % complete on Thu Apr  4 21:01:14 2019
  24 % complete on Thu Apr  4 21:01:19 2019
  29 % complete on Thu Apr  4 21:01:25 2019
  34 % complete on Thu Apr  4 21:01:30 2019
  39 % complete on Thu Apr  4 21:01:36 2019
  45 % complete on Thu Apr  4 21:01:41 2019
  50 % complete on Thu Apr  4 21:01:47 2019
  56 % complete on Thu Apr  4 21:01:52 2019
  61 % complete on Thu Apr  4 21:01:58 2019
  66 % complete on Thu Apr  4 21:02:03 2019
  71 % complete on Thu Apr  4 21:02:08 2019
  76 % complete on Thu Apr  4 21:02:13 2019
  81 % complete on Thu Apr  4 21:02:18 2019
  86 % complete on Thu Apr  4 21:02:23 2019
  91 % complete on Thu Apr  4 21:02:28 2019
  95 % complete on Thu Apr  4 21:02:33 2019
 100 % complete on Thu Apr  4 21:02:37 2019
Creating Allocation Maps
Creating Log Files
   3 % complete on Thu Apr  4 21:02:50 2019
  28 % complete on Thu Apr  4 21:03:03 2019
  53 % complete on Thu Apr  4 21:03:16 2019
  78 % complete on Thu Apr  4 21:03:28 2019
 100 % complete on Thu Apr  4 21:03:29 2019
Clearing Inode Allocation Map
Clearing Block Allocation Map
Formatting Allocation Map for storage pool system
Completed creation of file system /dev/gpfs.test2.
mmcrfs: Propagating the cluster configuration data to all
  affected nodes.  This is an asynchronous process.
~~~   
Fileset 생성   
~~~   
[root@gpfs1 test1]# mmcrfileset gpfs.test1 dir1 --inode-space new --inode-limit 200000
Fileset dir1 created with id 1 root inode 131075.
[root@gpfs1 test1]# mmlsfileset gpfs.test1 -L
Filesets in file system 'gpfs.test1':
Name                            Id      RootInode  ParentId Created                      InodeSpace      MaxInodes    AllocInodes Comment
root                             0              3        -- Thu Apr  4 21:00:16 2019        0                65792          65792 root fileset
dir1                             1         131075        -- Fri Apr  5 00:14:34 2019        1               200000          65920
[root@gpfs1 test1]#

[root@gpfs1 test1]# mmdf gpfs.test1
disk                disk size  failure holds    holds              free KB             free KB
name                    in KB    group metadata data        in full blocks        in fragments
--------------- ------------- -------- -------- ----- -------------------- -------------------
Disks in storage pool: system (Maximum disk size allowed is 192 GB)
test1_nsd11            20971520       10 Yes      Yes        20235264 ( 96%)           824 ( 0%)
test1_nsd21            20971520       20 Yes      Yes        20235264 ( 96%)           824 ( 0%)
                -------------                         -------------------- -------------------
(pool total)         41943040                              40470528 ( 96%)          1648 ( 0%)
 
                =============                         ==================== ===================
(total)              41943040                              40470528 ( 96%)          1648 ( 0%)
 
Inode Information
-----------------
Total number of used inodes in all Inode spaces:               4039
Total number of free inodes in all Inode spaces:             127673
Total number of allocated inodes in all Inode spaces:        131712
Total of Maximum number of inodes in all Inode spaces:       265792

[root@gpfs1 test1]# mmcrfileset gpfs.test1 dir2 --inode-space new --inode-limit 200000
Fileset dir2 created with id 2 root inode 262147.
[root@gpfs1 test1]# mmlsfileset gpfs.test1 -L
Filesets in file system 'gpfs.test1':
Name                            Id      RootInode  ParentId Created                      InodeSpace      MaxInodes    AllocInodes Comment
root                             0              3        -- Thu Apr  4 21:00:16 2019        0                65792          65792 root fileset
dir1                             1         131075        -- Fri Apr  5 00:14:34 2019        1               200000          65920
dir2                             2         262147        -- Fri Apr  5 00:21:25 2019        2               200000          65920
[root@gpfs1 test1]#
~~~   
Fileset Link 구성   
~~~   
# mmlinkfileset gpfs.test1 dir1 -J /test1/dir1
Fileset Base linked at /test1/dir1
# mmlinkfileset gpfs.test1 dir2 -J /test2/dir2
Fileset Base linked at /test1/dir2

# mmlsfileset gpfs.test1
Filesets in file system 'gpfs.test1':
Name                     Status    Path
root                     Linked    /test
dir1                     Linked    /test/dir1
dir2                     Linked    /test/dir2
~~~   
   

# 참고 자료
* * *   
***IBM GPFS Document :***   
> [https://www.ibm.com/support/knowledgecenter/STXKQY_5.0.0/com.ibm.spectrum.scale.v5r00.doc/bl1adm_stanzafiles.htm](https://www.ibm.com/support/knowledgecenter/STXKQY_5.0.0/com.ibm.spectrum.scale.v5r00.doc/bl1adm_stanzafiles.htm)   
> [https://www.ibm.com/support/knowledgecenter/en/STXKQY_5.0.2/com.ibm.spectrum.scale.v5r02.doc/bl1adv_gpfsrep.htm](https://www.ibm.com/support/knowledgecenter/en/STXKQY_5.0.2/com.ibm.spectrum.scale.v5r02.doc/bl1adv_gpfsrep.htm)   
> [https://www.ibm.com/support/knowledgecenter/en/STXKQY_4.2.1/com.ibm.spectrum.scale.v4r21.doc/bl1adv_filesets.htm](https://www.ibm.com/support/knowledgecenter/en/STXKQY_4.2.1/com.ibm.spectrum.scale.v4r21.doc/bl1adv_filesets.htm)   
> [https://www.ibm.com/support/knowledgecenter/en/STXKQY_5.0.2/com.ibm.spectrum.scale.v5r02.doc/bl1adm_mmrestripefs.htm](https://www.ibm.com/support/knowledgecenter/en/STXKQY_5.0.2/com.ibm.spectrum.scale.v5r02.doc/bl1adm_mmrestripefs.htm)
