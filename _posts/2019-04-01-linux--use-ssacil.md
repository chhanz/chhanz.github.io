---
layout: post
title: "[Linux] CentOS 7 HP SSACLI Command 사용법"
description: " "
author: chhanz
date: 2019-04-01
tags: [linux]
category: linux
---

# [Linux] CentOS 7 HP SSACLI Command 사용법   
* * *   

벤더(IBM,HP,Dell 등) 의 x86 하드웨어에서는 Linux 운영체제 상에서 하드웨어 레이드 컨트롤러의 상태를 확인 할 수 있는 도구들을 제공하고 있습니다.   
HP의 경우, Smart Storage Adminstrator 관리 명령어를 제공하고 있습니다.   
(예전에는 hpssacli, hpasucil 와 같은 명령어였습니다.)   
현재는 ssacli 로 변경 되었으며, Linux 운영체제상에서 하드웨어 RAID 구성, 상태 확인, 변경등이 가능하도록 지원하는 HP 에서 제공되는 관리 도구 입니다.   

# SSACLI 설치   
* * *   
Download : [HP Support Link](https://support.hpe.com/hpsc/swd/public/detail?sp4ts.oid=null&swItemId=MTX_688838b13b194c7abe1aa98584&swEnvOid=4184#tab1)   
<center><img src="/assets/images/post/2019-04-01-use-ssacli/image-01.png"></center></br>
위 HP Support 페이지에서 해당 rpm Package 를 다운받습니다.   
이후 시스템에 Upload 후 아래와 같이 설치 진행합니다.   
   
~~~sh   
# yum -y install ssacli-3.40-3.0.x86_64.rpm
Loaded plugins: fastestmirror
Examining ssacli-3.40-3.0.x86_64.rpm: ssacli-3.40-3.0.x86_64
Marking ssacli-3.40-3.0.x86_64.rpm to be installed
Resolving Dependencies
--> Running transaction check
---> Package ssacli.x86_64 0:3.40-3.0 will be installed
--> Finished Dependency Resolution

Dependencies Resolved

===================================================================================================================================================================================================================================================================================================
 Package                                                           Arch                                                              Version                                                              Repository                                                                          Size
===================================================================================================================================================================================================================================================================================================
Installing:
 ssacli                                                            x86_64                                                            3.40-3.0                                                             /ssacli-3.40-3.0.x86_64                                                             39 M

Transaction Summary
===================================================================================================================================================================================================================================================================================================
Install  1 Package

Total size: 39 M
Installed size: 39 M
Downloading packages:
Running transaction check
Running transaction test
Transaction test succeeded
Running transaction
  Installing : ssacli-3.40-3.0.x86_64                                                                                                                                                                                                                                                          1/1

  Verifying  : ssacli-3.40-3.0.x86_64                                                                                                                                                                                                                                                          1/1

Installed:
  ssacli.x86_64 0:3.40-3.0

Complete!
~~~   
   
# SSACLI을 이용하여 하드웨어 확인   
* * *   

## 컨트롤러 상세 상태 확인   
~~~sh   
# ssacli ctrl all show detail

Smart Array P410i in Slot 0 (Embedded)
   Bus Interface: PCI
   Slot: 0
   Serial Number: 50014380095F6F00
   Cache Serial Number: PACCQID11492789
   Controller Status: OK
   Hardware Revision: C
   Firmware Version: 6.40-0
   Firmware Supports Online Firmware Activation: False
   Rebuild Priority: Medium
   Expand Priority: Medium
   Surface Scan Delay: 15 secs
   Surface Scan Mode: Idle
   Parallel Surface Scan Supported: No
   Queue Depth: Automatic
   Monitor and Performance Delay: 60  min
   Elevator Sort: Enabled
   Degraded Performance Optimization: Disabled
   Wait for Cache Room: Disabled
   Surface Analysis Inconsistency Notification: Disabled
   Post Prompt Timeout: 0 secs
   Cache Board Present: True
   Cache Status: OK
   Cache Ratio: 100% Read / 0% Write
   Drive Write Cache: Disabled
   Total Cache Size: 0.2
   Total Cache Memory Available: 0.1
   No-Battery Write Cache: Disabled
   SATA NCQ Supported: True
   Number of Ports: 2 Internal only
   Encryption: Not Set
   Driver Name: hpsa
   Driver Version: 3.4.18
   Driver Supports SSD Smart Path: True
   PCI Address (Domain:Bus:Device.Function): 0000:05:00.0
   Port Max Phy Rate Limiting Supported: False
   Host Serial Number: SGH033XJT1
   Sanitize Erase Supported: False
   Primary Boot Volume: None
   Secondary Boot Volume: None
~~~  
   
## 전체 Logical Drive 상태 확인   
~~~sh   
# ssacli ctrl slot=0 ld all show

Smart Array P410i in Slot 0 (Embedded)

   Array A

      logicaldrive 1 (279.37 GB, RAID 1, OK)

   Array B

      logicaldrive 2 (558.88 GB, RAID 0, OK)

   Array C

      logicaldrive 3 (558.88 GB, RAID 0, OK)

   Array D

      logicaldrive 4 (447.10 GB, RAID 0, Failed)
~~~   
   
## 특정 Logical Drive 상태 확인   
아래와 같이 특정 Lofical Drive 의 상태 및 Linux 에서 사용되는 Disk Label, Physical Drive 정보를 확인 할 수 있습니다.   
~~~sh   
# ssacli ctrl slot=0 ld 1 show

Smart Array P410i in Slot 0 (Embedded)

   Array A

      Logical Drive: 1
         Size: 279.37 GB
         Fault Tolerance: 1
         Heads: 255
         Sectors Per Track: 32
         Cylinders: 65535
         Strip Size: 256 KB
         Full Stripe Size: 256 KB
         Status: OK
         Unrecoverable Media Errors: None
         Caching:  Enabled
         Unique Identifier: 600508B1001C5D5CE92263CB4F53A2B0
         Disk Name: /dev/sda
         Mount Points: /boot 1024 MB Partition Number 1
         OS Status: LOCKED
         Logical Drive Label: AB1AB56550014380095F6F00F968
         Mirror Group 1:
            physicaldrive 1I:1:1 (port 1I:box 1:bay 1, SAS HDD, 300 GB, OK)
         Mirror Group 2:
            physicaldrive 1I:1:2 (port 1I:box 1:bay 2, SAS HDD, 300 GB, OK)
         Drive Type: Data
         LD Acceleration Method: Controller Cache
~~~   
## 전체 Physical Drive 상태 확인   
~~~sh   
# ssacli ctrl slot=0 pd all show

Smart Array P410i in Slot 0 (Embedded)

   Array A

      physicaldrive 1I:1:1 (port 1I:box 1:bay 1, SAS HDD, 300 GB, OK)
      physicaldrive 1I:1:2 (port 1I:box 1:bay 2, SAS HDD, 300 GB, OK)

   Array B

      physicaldrive 1I:1:3 (port 1I:box 1:bay 3, SAS HDD, 600 GB, OK)

   Array C

      physicaldrive 1I:1:4 (port 1I:box 1:bay 4, SAS HDD, 600 GB, OK)

   Array D

      physicaldrive 2I:1:5 (port 2I:box 1:bay 5, SAS HDD, 146 GB, Failed)
~~~   

## Physical Drive 상태 확인   
아래와 같이 특정 Physical Drive의 상태를 확인 할 수 있습니다.   
테스트에 사용된 Disk는 장애가 발생되어 Failed 로 상태가 나오고 있습니다.   
~~~sh   
# ssacli ctrl slot=0 pd 2I:1:5 show

Smart Array P410i in Slot 0 (Embedded)

   Array D

      physicaldrive 2I:1:5
         Port: 2I
         Box: 1
         Bay: 5
         Status: Failed
         Last Failure Reason: Init drive type mix
         Drive Type: Data Drive
         Interface Type: SAS
         Size: 146 GB
         Drive exposed to OS: False
         Logical/Physical Block Size: 512/512
         Rotational Speed: 10000
         Firmware Revision: HPDE
         Serial Number: 6SD2S3R40000B132J1A9
         WWID: 5000C50033CD8419
         Model: HP      EG0146FAWHU
         PHY Count: 2
         PHY Transfer Rate: 6.0Gbps, Unknown
         Sanitize Erase Supported: False
         Shingled Magnetic Recording Support: None
~~~   
   
위와 같이 다양하게 하드웨어 RAID를 확인 할 수 있습니다.   
또한 Array(Logical Drive) 생성 및 삭제, 기타 컨트롤러 설정이 Linux 운영체제 안에서 설정이 가능합니다.   
~~~sh
# ssacli help

CLI Syntax
   A typical SSACLI command line consists of three parts: a target device,
   a command, and a parameter with values if necessary. Using angle brackets to
   denote a required variable and plain brackets to denote an optional
   variable, the structure of a typical SSACLI command line is as follows:

      <target> <command> [parameter=value]

   <target> is of format:
      [controller all|slot=#|serialnumber=#]
      [array all|<id>]
      [physicaldrive all|allunassigned|[#:]#:#|[#:]#:#-[#:]#:#]
      [ssdphysicaldrive all|allunassigned|[#:]#:#|[#:]#:#-[#:]#:#]
      [logicaldrive all|#]
      [enclosure all|#:#|serialnumber=#]
      [licensekey all|<key>]
      [ssdinfo]
      [tapedrive all]
      Note 1: The #:#:# syntax is only needed for systems that
              specify port:box:bay. Other physical drive targeting
              schemes are box:bay and port:id.

   Example targets:
   ("CN0" is a sample port name that may be different depending on the
   controller)
      controller slot=5
      controller serialnumber=P21DA2322S
      controller slot=7 array A
      controller slot=5 logicaldrive 5
      controller slot=5 physicaldrive 1:5
      controller slot=5 physicaldrive CN0:2:3
      controller slot=5 ssdphysicaldrive all
      controller slot=5 tapedrive all
      controller slot=5 enclosure CN0:1 show
      controller slot=5 licensekey XXXXX-XXXXX-XXXXX-XXXXX-XXXXX

For detailed command information type any of the following:
   help add
   help create
   help delete
   help diag
   help flash
   help heal
   help modify
   help remove
   help shorthand
   help show
   help target
   help rescan
   help version
   <중략>
~~~   

# 참고 자료   
* * *    
HP SSA Document : [https://support.hpe.com/hpsc/doc/public/display?docId=c03909334](https://support.hpe.com/hpsc/doc/public/display?docId=c03909334)   
HP Support Page : [https://support.hpe.com/hpesc/public/home](https://support.hpe.com/hpesc/public/home)   
   
추가로 기타 다른 벤더에서도 제공하는 도구는 아래와 같습니다.   
사용 방법도 위와 비슷한 환경으로 되어 있습니다.   
IBM, Lenovo : [https://support.lenovo.com/kr/ko/downloads/ds031558](https://support.lenovo.com/kr/ko/downloads/ds031558)   
Dell/EMC : [https://www.dell.com/support/article/kr/ko/krdhs1/sln283135/how-to-use-the-poweredge-raid-controller-perc-command-line-interface-cli-utility-to-manage-your-raid-controller?lang=en](https://www.dell.com/support/article/kr/ko/krdhs1/sln283135/how-to-use-the-poweredge-raid-controller-perc-command-line-interface-cli-utility-to-manage-your-raid-controller?lang=en)