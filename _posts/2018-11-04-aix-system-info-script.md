---
layout: post
title: "[AIX] System Information collection Script"
description: ""
author: chhanz
date: 2018-11-04
tags: [aix]
category: aix
---

# [AIX] System Information collection Script
* * *

회사 U2C 솔루션 개발을 하는 중, AIX 에서 필수 시스템 정보를 수집하는 Script 가 필요로 해서 간단하게 제작한 Script 입니다.

# Script 내용
* * *

~~~ksh
#! /bin/ksh
# Make by. chhan

DATEC=$(date +%Y%m%d-%H%M)
IdChk=`id | grep root | wc -l`
OutFile="`hostname`_"$DATEC".txt"

#Checking ROOT 
if [ $IdChk -eq 0 ]; then
   echo
   echo "You must login root... Try again..."
   echo
   exit
 fi

echo " * * * * * Check AIX System Information * * * * * " 
echo " " 
echo " This Check Output File "
echo " View ./"$OutFile
echo " Date : " $(date)
echo " "
echo " # Gethering Information . . . . . "

prtconf > /tmp/prtconf-$DATEC.txt
sleep 1

cputype=$(cat /tmp/prtconf-$DATEC.txt | grep "Processor Type" | awk -F ":" '{print $2}')
kerneltype=$(cat /tmp/prtconf-$DATEC.txt | grep "Kernel Type" | awk -F ":" '{print $2}')
sizemem=$(cat /tmp/prtconf-$DATEC.txt | grep "^Memory Size" | awk -F ":" '{print $2}')
cpucore=$(cat /tmp/prtconf-$DATEC.txt | grep "Number Of Processors" | awk -F ":" '{print $2}')
ipaddr=$(cat /tmp/prtconf-$DATEC.txt | grep "IP Address:" | awk -F ":" '{print $2}')
subnet=$(cat /tmp/prtconf-$DATEC.txt | grep "Sub Netmask:" | awk -F ":" '{print $2}')
gateway=$(cat /tmp/prtconf-$DATEC.txt | grep "Gateway:" | awk -F ":" '{print $2}')
totalps=$(cat /tmp/prtconf-$DATEC.txt | grep "Total Paging Space:" | awk -F ":" '{print $2}')

echo " # Print & Save Information"
echo "-------------------------------------------"| tee -a $OutFile
echo "            System Infomation              "| tee -a $OutFile
echo "-------------------------------------------"| tee -a $OutFile
echo " Host Name :" $(hostname)| tee -a $OutFile
echo " Vender :" $(uname -M | awk -F "," '{print $1}')| tee -a $OutFile
echo " CPU Type :" $cputype| tee -a $OutFile
#echo " Kernel Type :" $kerneltype| tee -a $OutFile
echo " Kernel Bit :" $(getconf KERNEL_BITMODE)"-bit"| tee -a $OutFile
echo " OS Version :" $(oslevel -s)| tee -a $OutFile
echo " Number Of Processors :" $cpucore| tee -a $OutFile
echo " Memory :"  $sizemem | tee -a $OutFile
echo " " | tee -a $OutFile
echo " IP Address :" $ipaddr" /"$subnet| tee -a $OutFile
echo " Gateway IP: " $gateway| tee -a $OutFile
echo " " | tee -a $OutFile
echo " Total Page Space Size :" $totalps| tee -a $OutFile
echo " Detail Page Space :"| tee -a $OutFile
lsps -a| tee -a $OutFile
echo " " | tee -a $OutFile
echo " LVM Information :"| tee -a $OutFile
lsvg -l rootvg| tee -a $OutFile
echo " " | tee -a $OutFile
echo " Total df Size :" | tee -a $OutFile
df -gt| tee -a $OutFile
echo " "| tee -a $OutFile
echo " rootvg Filesystem Size : "| tee -a $OutFile
df -gt | grep "Mounted"| tee -a $OutFile
lsvg -l rootvg | grep "/" | grep -v "N/A" | awk '{print "df -gt "$7}' | sh | grep -v Mounted| tee -a $OutFile

~~~


# SCRIPT Output 
* * *

~~~
 * * * * * Check AIX System Information * * * * *

 This Check Output File
 View ./aix_test_20181104-2237.txt
 Date :  Wed Jan 9 22:37:52 KST 2019

 # Gethering Information . . . . .
 # Print & Save Information
-------------------------------------------
            System Infomation
-------------------------------------------
 Host Name : aix_test
 Vender : IBM
 CPU Type : PowerPC_POWER7
 Kernel Bit : 64-bit
 OS Version : 6100-09-03-1415
 Number Of Processors : 2
 Memory : 31744 MB

 IP Address : 192.168.00.000 / 255.255.255.0
 Gateway IP:  192.168.00.00

 Total Page Space Size : 16384MB
 Detail Page Space :
Page Space      Physical Volume   Volume Group Size %Used Active  Auto  Type Chksum
hd6             hdisk0            rootvg       16384MB     0   yes   yes    lv     0

 LVM Information :
rootvg:
LV NAME             TYPE       LPs     PPs     PVs  LV STATE      MOUNT POINT
hd5                 boot       1       1       1    closed/syncd  N/A
hd6                 paging     32      32      1    open/syncd    N/A
hd8                 jfs2log    1       1       1    open/syncd    N/A
hd4                 jfs2       8       8       1    open/syncd    /
hd2                 jfs2       20      20      1    open/syncd    /usr
hd9var              jfs2       2       2       1    open/syncd    /var
hd3                 jfs2       10      10      1    open/syncd    /tmp
hd1                 jfs2       2       2       1    open/syncd    /home
hd10opt             jfs2       2       2       1    open/syncd    /opt
hd11admin           jfs2       1       1       1    open/syncd    /admin
lg_dumplv           sysdump    4       4       1    open/syncd    N/A
livedump            jfs2       1       1       1    open/syncd    /var/adm/ras/livedump
loglv00             jfslog     1       1       1    open/syncd    N/A
lv00                jfs        1       1       1    open/syncd    /var/adm/csd
app_lv              jfs2       180     180     1    open/syncd    /app

 Total df Size :
Filesystem    GB blocks      Used      Free %Used Mounted on
/dev/hd4           4.00      1.27      2.73   32% /
/dev/hd2          10.00      6.48      3.52   65% /usr
/dev/hd9var        1.00      0.40      0.60   41% /var
/dev/hd3           5.00      0.90      4.10   19% /tmp
/dev/hd1           1.00      0.14      0.86   15% /home
/dev/hd11admin      0.50      0.00      0.50    1% /admin
/proc                 -         -         -    -  /proc
/dev/hd10opt       1.00      0.61      0.39   61% /opt
/dev/livedump      0.50      0.00      0.50    1% /var/adm/ras/livedump
/dev/lv00          0.50      0.02      0.48    4% /var/adm/csd
/dev/app_lv       90.00     41.10     48.90   46% /app

 rootvg Filesystem Size :
Filesystem    GB blocks      Used      Free %Used Mounted on
/dev/hd4           4.00      1.27      2.73   32% /
/dev/hd2          10.00      6.48      3.52   65% /usr
/dev/hd9var        1.00      0.40      0.60   41% /var
/dev/hd3           5.00      0.90      4.10   19% /tmp
/dev/hd1           1.00      0.14      0.86   15% /home
/dev/hd10opt       1.00      0.61      0.39   61% /opt
/dev/hd11admin      0.50      0.00      0.50    1% /admin
/dev/livedump      0.50      0.00      0.50    1% /var/adm/ras/livedump
/dev/lv00          0.50      0.02      0.48    4% /var/adm/csd
/dev/app_lv       90.00     41.10     48.90   46% /app

~~~
