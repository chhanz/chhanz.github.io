---
layout: post
title: "[Linux] CentOS7 PPC 설치 on PowerVM"
description: " "
author: chhanz
date: 2019-05-10
tags: [linux]
category: linux
---

# CentOS 7 PPC 설치 on PowerVM
---
## 설치 환경
---
> IBM Power7 P750   
> IBM PowerVM 2.4   
> CentOS7(1804)   

## VM 설정
---
VIOS 에서 VM LPAR 를 생성하고 vCD-ROM 을 이용하여 ISO 를 Mount 하여 OS 설치 준비를 합니다.   
   
~~~sh
$ loadopt -disk CentOS-7-ppc64-Everything-1804.iso -vtd vtopt0
lsrep
$ lsrep
Size(mb) Free(mb) Parent Pool         Parent Size      Parent Free
   10198     2958 rootvg                   279552           220416
 
Name                                                  File Size Optical         Access
CentOS-7-ppc64-Everything-1804.iso                         7240 vtopt0          rw
$ lsmap -vadapter vhost25
SVSA            Physloc                                      Client Partition ID
--------------- -------------------------------------------- ------------------
vhost25         U8233.E8B.0637D5P-V1-C181                    0x0000001a
 
VTD                   linuxos_1
Status                Available
LUN                   0x8200000000000000
Backing device        linuxos_lv
Physloc
Mirrored              N/A
 
VTD                   vtopt0
Status                Available
LUN                   0x8100000000000000
Backing device        /var/vio/VMLibrary/CentOS-7-ppc64-Everything-1804.iso
Physloc
Mirrored              N/A
~~~
   

## CD 부팅 
---
LPAR를 키고 SMS 모드로 진입합니다. 이후 vCD-ROM 을 통해 ISO 를 부팅합니다.   
~~~sh
PowerPC Firmware
 Version AL730_149
 SMS 1.7 (c) Copyright IBM Corp. 2000,2008 All rights reserved.
-------------------------------------------------------------------------------
 Main Menu
 1.   Select Language
 2.   Setup Remote IPL (Initial Program Load)
 3.   Change SCSI Settings
 4.   Select Console
 5.   Select Boot Options
 
 
 
 
 
 
 
 
 
 -------------------------------------------------------------------------------
 Navigation Keys:
 
                                             X = eXit System Management Services
 -------------------------------------------------------------------------------
 Type menu item number and press Enter or select Navigation key:5
 
# SMS 모드에서 Select Boot Options 선택

 PowerPC Firmware
 Version AL730_149
 SMS 1.7 (c) Copyright IBM Corp. 2000,2008 All rights reserved.
-------------------------------------------------------------------------------
 Multiboot
 1.   Select Install/Boot Device
 2.   Configure Boot Device Order
 3.   Multiboot Startup <OFF>
 4.   SAN Zoning Support
 
 
 
 
 
 
 
 
 
 
 -------------------------------------------------------------------------------
 Navigation keys:
 M = return to Main Menu
 ESC key = return to previous screen         X = eXit System Management Services
 -------------------------------------------------------------------------------
 Type menu item number and press Enter or select Navigation key:1

# SMS 모드에서 Select Install/Boot Device 선택


 PowerPC Firmware
 Version AL730_149
 SMS 1.7 (c) Copyright IBM Corp. 2000,2008 All rights reserved.
-------------------------------------------------------------------------------
 Select Device Type
 1.   Diskette
 2.   Tape
 3.   CD/DVD
 4.   IDE
 5.   Hard Drive
 6.   Network
 7.   List all Devices
 
 
 
 
 
 
 
 -------------------------------------------------------------------------------
 Navigation keys:
 M = return to Main Menu
 ESC key = return to previous screen         X = eXit System Management Services
 -------------------------------------------------------------------------------
 Type menu item number and press Enter or select Navigation key:3

# SMS 모드에서 CD/DVD 선택

 PowerPC Firmware
 Version AL730_149
 SMS 1.7 (c) Copyright IBM Corp. 2000,2008 All rights reserved.
-------------------------------------------------------------------------------
 Select Media Type
 1.   SCSI
 2.   SSA
 3.   SAN
 4.   SAS
 5.   SATA
 6.   USB
 7.   IDE
 8.   ISA
 9.   List All Devices
 
 
 
 
 
 -------------------------------------------------------------------------------
 Navigation keys:
 M = return to Main Menu
 ESC key = return to previous screen         X = eXit System Management Services
 -------------------------------------------------------------------------------
 Type menu item number and press Enter or select Navigation key:1

# SMS 모드에서 SCSI 선택

 PowerPC Firmware
 Version AL730_149
 SMS 1.7 (c) Copyright IBM Corp. 2000,2008 All rights reserved.
-------------------------------------------------------------------------------
 Select Media Adapter
 1.          U8233.E8B.0637D5P-V26-C181-T1   /vdevice/v-scsi@300000b5
 2.   List all devices
 
 
 
 
 
 
 
 
 
 
 
 
 -------------------------------------------------------------------------------
 Navigation keys:
 M = return to Main Menu
 ESC key = return to previous screen         X = eXit System Management Services
 -------------------------------------------------------------------------------
 Type menu item number and press Enter or select Navigation key:1
 
# SMS 모드에서 vCD-ROM가 연결된 v-SCSI Adapter 선택 선택

 PowerPC Firmware
 Version AL730_149
 SMS 1.7 (c) Copyright IBM Corp. 2000,2008 All rights reserved.
-------------------------------------------------------------------------------
 Select Device
 Device  Current  Device
 Number  Position  Name
 1.        2      SCSI CD-ROM
        ( loc=U8233.E8B.0637D5P-V26-C181-T1-L8100000000000000 )
 
 
 
 
 
 
 
 
 
 
 -------------------------------------------------------------------------------
 Navigation keys:
 M = return to Main Menu
 ESC key = return to previous screen         X = eXit System Management Services
 -------------------------------------------------------------------------------
 Type menu item number and press Enter or select Navigation key:1
 
# SMS 모드에서 SCSI CD-ROM 선택 선택

 PowerPC Firmware
 Version AL730_149
 SMS 1.7 (c) Copyright IBM Corp. 2000,2008 All rights reserved.
-------------------------------------------------------------------------------
 Select Task
 
SCSI CD-ROM
    ( loc=U8233.E8B.0637D5P-V26-C181-T1-L8100000000000000 )
 
 1.   Information
 2.   Normal Mode Boot
 3.   Service Mode Boot
 
 
 
 
 
 
 
 
 -------------------------------------------------------------------------------
 Navigation keys:
 M = return to Main Menu
 ESC key = return to previous screen         X = eXit System Management Services
 -------------------------------------------------------------------------------
 Type menu item number and press Enter or select Navigation key:2

# 부팅 모드 설정

 PowerPC Firmware
 Version AL730_149
 SMS 1.7 (c) Copyright IBM Corp. 2000,2008 All rights reserved.
-------------------------------------------------------------------------------
 Are you sure you want to exit System Management Services?
 1.   Yes
 2.   No
 
 
 
 
 
 
 
 
 
 
 
 
 -------------------------------------------------------------------------------
 Navigation Keys:
 
                                             X = eXit System Management Services
 -------------------------------------------------------------------------------
 Type menu item number and press Enter or select Navigation key:1

 # 재부팅 시작
~~~
   
## CentOS 설치
---
선택한 ISO를 통해 x86에서 많이 보던 설치 화면을 볼 수 있었습니다.   
~~~sh
### 설치 화면
 
      Install CentOS 7 (64-bit kernel)
      Test this media & install CentOS 7  (64-bit kernel)
      Rescue a CentOS system (64-bit kernel)
      Other options...
 
 
 
 
 
 
 
 
 
 
 
 
      Use the ^ and v keys to change the selection.
      Press 'e' to edit the selected item, or 'c' for a command prompt.
   The selected entry will be started automatically in 0s.
 
###
### Text 설치 화면
###
 * installation log files are stored in /tmp during the installation
 * shell is available on TTY2
 * if the graphical installation interface fails to start, try again with the
   inst.text bootoption to start text installation
 * when reporting a bug add logs from /tmp as separate text/plain attachments
11:44:29 Not asking for VNC because we don`t have a network
11:44:30 X startup failed, falling back to text mode
================================================================================
================================================================================
Installation
 
 1) [x] Language settings                 2) [!] Time settings
        (English (United States))                (Timezone is not set.)
 3) [!] Installation source               4) [!] Software selection
        (Processing...)                          (Processing...)
 5) [!] Installation Destination          6) [x] Kdump
        (No disks selected)                      (Kdump is enabled)
 7) [ ] Network configuration             8) [!] Root password
        (Not connected)                          (Password is not set.)
 9) [!] User creation
        (No user will be created)
  Please make your choice from above ['q' to quit | 'b' to begin installation |
  'r' to refresh]:
[anaconda] 1:main* 2:shell  3:log  4:storage-lo> Switch tab: Alt+Tab | Help: F1
 
### 설치 시작
Progress
Setting up the installation environment
.
Creating disklabel on /dev/sda
.
Creating xfs on /dev/sda2
.
Creating lvmpv on /dev/sda3
.
Creating swap on /dev/mapper/centos-swap
.
Creating xfs on /dev/mapper/centos-root
.
Creating prepboot on /dev/sda1
.
Running pre-installation scripts
.
Starting package installation process
 
< 중략 >
 
Installing iwl5150-firmware (298/298)
Performing post-installation setup tasks
Installing boot loader
.
Performing post-installation setup tasks
.
 
Configuring installed system
.
Writing network configuration
.
Creating users
.
Configuring addons
.
Generating initramfs
.
Running post-installation scripts
.
        Use of this product is subject to the license agreement found at /usr/share/centos-release/EULA
 
        Installation complete.  Press return to quit
 
### 설치 완료
 
### 부팅 완료
CentOS Linux 7 (AltArch)
Kernel 3.10.0-862.el7.ppc64 on an ppc64
 
localhost login:
~~~
   
위와 같이 TEXT 모드로 설치가 완료되었습니다.   

## 설치 이후 기능 테스트
---
**OS Information**
~~~sh
### OS Information
[root@powerlinux ~]# cat /etc/redhat-release
CentOS Linux release 7.5.1804 (AltArch)
 
[root@powerlinux ~]# uname -a
Linux powerlinux.centos.com 3.10.0-862.el7.ppc64 #1 SMP Tue Apr 10 15:05:38 GMT 2018 ppc64 ppc64 ppc64 GNU/Linux
[root@powerlinux ~]#
~~~
   
**YUM TEST**
~~~sh
## YUM TEST
 
[root@powerlinux ~]# yum repolist
Loaded plugins: fastestmirror
Determining fastest mirrors
base                                                                                                                     | 3.6 kB  00:00:00
extras                                                                                                                   | 2.9 kB  00:00:00
updates                                                                                                                  | 2.9 kB  00:00:00
(1/4): extras/7/ppc64/primary_db                                                                                         |  31 kB  00:00:00
(2/4): base/7/ppc64/group_gz                                                                                             | 166 kB  00:00:00
(3/4): base/7/ppc64/primary_db                                                                                           | 5.2 MB  00:00:06
(4/4): updates/7/ppc64/primary_db                                                                                        | 5.3 MB  00:00:10
repo id                                                            repo name                                                              status
base/7/ppc64                                                       CentOS-7 - Base                                                        8,788
extras/7/ppc64                                                     CentOS-7 - Extras                                                         63
updates/7/ppc64                                                    CentOS-7 - Updates                                                     1,391
repolist: 10,242
[root@powerlinux ~]#
~~~

   
**H/W Information**
~~~sh
### H/W Information

[root@powerlinux ~]# cat /proc/cpuinfo
processor    : 0
cpu        : POWER7 (architected), altivec supported
clock        : 3300.000000MHz
revision    : 2.1 (pvr 003f 0201)
 
processor    : 1
cpu        : POWER7 (architected), altivec supported
clock        : 3300.000000MHz
revision    : 2.1 (pvr 003f 0201)
 
processor    : 2
cpu        : POWER7 (architected), altivec supported
clock        : 3300.000000MHz
revision    : 2.1 (pvr 003f 0201)
 
processor    : 3
cpu        : POWER7 (architected), altivec supported
clock        : 3300.000000MHz
revision    : 2.1 (pvr 003f 0201)
 
processor    : 4
cpu        : POWER7 (architected), altivec supported
clock        : 3300.000000MHz
revision    : 2.1 (pvr 003f 0201)
 
processor    : 5
cpu        : POWER7 (architected), altivec supported
clock        : 3300.000000MHz
revision    : 2.1 (pvr 003f 0201)
 
processor    : 6
cpu        : POWER7 (architected), altivec supported
clock        : 3300.000000MHz
revision    : 2.1 (pvr 003f 0201)
 
processor    : 7
cpu        : POWER7 (architected), altivec supported
clock        : 3300.000000MHz
revision    : 2.1 (pvr 003f 0201)
 
timebase    : 512000000
platform    : pSeries
model        : IBM,8233-E8B
machine        : CHRP IBM,8233-E8B
 
### Memroy
[root@powerlinux ~]# cat /proc/meminfo
MemTotal:        7824576 kB
MemFree:         6970496 kB
MemAvailable:    7008000 kB
 
## lshw Information
[root@powerlinux ~]# lshw
powerlinux.centos.com
    description: pSeries LPAR
    product: Power 750 Express
    vendor: IBM
    serial: IBM,020637D5P
    width: 64 bits
    capabilities: smp
    configuration: chassis=rackmount
  *-core
       description: Motherboard
       physical id: 0
     *-firmware
          product: IBM,AL730_149
          physical id: 1
          logical name: /proc/device-tree
     *-cpu:0
          description: POWER7 (architected), altivec supported
          product: PowerPC,POWER7
          physical id: 0
          bus info: cpu@0
          version: 2.1 (pvr 003f 0201)
          size: 3300MHz
          capabilities: performance-monitor
          configuration: threads=4
        *-cache:0
             description: L1 Cache (instruction)
             physical id: 0
             size: 32KiB
        *-cache:1
             description: L1 Cache (data)
             physical id: 1
             size: 32KiB
     *-cpu:1
          description: POWER7 (architected), altivec supported
          product: PowerPC,POWER7
          physical id: 4
          bus info: cpu@1
          version: 2.1 (pvr 003f 0201)
          size: 3300MHz
          capabilities: performance-monitor
          configuration: threads=4
        *-cache:0
             description: L1 Cache (instruction)
             physical id: 0
             size: 32KiB
        *-cache:1
             description: L1 Cache (data)
             physical id: 1
             size: 32KiB
     *-memory
          description: System memory
          physical id: 2
          size: 8GiB
  *-vty
       description: Virtual I/O device (vty)
       physical id: 1
       bus info: vio@30000000
       logical name: /proc/device-tree/vdevice/vty@30000000
       configuration: driver=hvc_console
  *-l-lan
       description: Ethernet interface
       physical id: 2
       bus info: vio@3000005b
       logical name: /proc/device-tree/vdevice/l-lan@3000005b
       serial: 92:e7:e9:5e:74:5b
       size: 1Gbit/s
       capacity: 1Gbit/s
       capabilities: ethernet physical fibre 1000bt-fd autonegotiation
       configuration: autonegotiation=on broadcast=yes driver=ibmveth driverversion=1.06 duplex=full ip=192.168.13.121 link=yes multicast=yes port=fibre speed=1Gbit/s
  *-v-scsi
       description: Virtual I/O device (v-scsi)
       physical id: 3
       bus info: vio@300000b5
       logical name: /proc/device-tree/vdevice/v-scsi@300000b5
       logical name: scsi0
       configuration: driver=ibmvscsi
     *-cdrom
          description: SCSI CD-ROM
          product: VOPTA
          vendor: AIX
          physical id: 0.1.0
          bus info: scsi@0:0.1.0
          logical name: /dev/cdrom
          logical name: /dev/sr0
          capabilities: removable audio
          configuration: ansiversion=4 status=ready
        *-medium
             physical id: 0
             logical name: /dev/cdrom
             capabilities: partitioned partitioned:mac
           *-volume:0 UNCLAIMED
                description: Apple partition map
                physical id: 1
                capacity: 1KiB
           *-volume:1 UNCLAIMED
                description: Apple HFS
                physical id: 2
                size: 7292MiB
                capabilities: ro hfs initialized
                configuration: created=2018-05-07 15:00:59 filesystem=hfs label=7 modified=2018-05-07 15:01:01 state=clean
     *-disk
          description: SCSI Disk
          product: VDASD
          vendor: AIX
          physical id: 0.2.0
          bus info: scsi@0:0.2.0
          logical name: /dev/sda
          version: 0001
          serial: 00f637d500004c0000000166d1f4daed.15
          size: 50GiB (53GB)
          capabilities: partitioned partitioned:dos
          configuration: ansiversion=3 logicalsectorsize=512 sectorsize=512 signature=c4b50700
        *-volume:0
             description: PPC PReP Boot partition
             physical id: 1
             bus info: scsi@0:0.2.0,1
             logical name: /dev/sda1
             capacity: 4MiB
             capabilities: primary bootable boot
        *-volume:1
             description: Linux filesystem partition
             physical id: 2
             bus info: scsi@0:0.2.0,2
             logical name: /dev/sda2
             logical name: /boot
             capacity: 1GiB
             capabilities: primary
             configuration: mount.fstype=xfs mount.options=rw,relatime,attr2,inode64,noquota state=mounted
        *-volume:2
             description: Linux LVM Physical Volume partition
             physical id: 3
             bus info: scsi@0:0.2.0,3
             logical name: /dev/sda3
             serial: MjzP9l-erSw-jIrI-8idl-6eUT-y3TI-Zpm0fc
             size: 48GiB
             capacity: 48GiB
             capabilities: primary multi lvm2
  *-ibm_sp
       description: Virtual I/O device (IBM,sp)
       physical id: 4
       bus info: vio@4000
       logical name: /proc/device-tree/vdevice/IBM,sp@4000
  *-rtc
       description: Virtual I/O device (rtc)
       physical id: 5
       bus info: vio@4001
       logical name: /proc/device-tree/vdevice/rtc@4001
  *-nvram
       description: Virtual I/O device (nvram)
       physical id: 6
       bus info: vio@4002
       logical name: /proc/device-tree/vdevice/nvram@4002
  *-gscsi
       description: Virtual I/O device (gscsi)
       physical id: 7
       bus info: vio@4004
       logical name: /proc/device-tree/vdevice/gscsi@4004
[root@powerlinux ~]#
~~~

# 참고 자료
---
- [https://developer.ibm.com/linuxonpower/2018/08/17/announcing-centos-linux-7-power9/](https://developer.ibm.com/linuxonpower/2018/08/17/announcing-centos-linux-7-power9/)   