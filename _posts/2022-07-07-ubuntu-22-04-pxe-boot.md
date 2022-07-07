---
layout: post
title: "[Ubuntu] Ubuntu 22.04 PXE Boot Server 구성"
description: "isc-dhcp-server, tftpd-hpa, apache2"
author: chhanz
date: 2022-07-07
tags: [linux]
category: linux
---

# Ubuntu 22.04 PXE Boot Server 구성
PXE Boot 를 구성하기 위해서는 3가지 요소가 필요하다.   
* `httpd` : ISO 배포를 위함.   
* `tftpd` : bootloader 배포를 위함.    
* `dhcpd` : PXE Boot 간 IP 를 임대하기 위함.   
   
# `httpd` 구성
`apache2` 를 이용하여 구성합니다. (`nginx` 와 같은 기타 다른 WEB Application 을 이용해도 무방합니다.)   
   
## Install `apache2`
아래 명령을 이용하여 설치를 진행합니다.   
```bash
$ sudo apt install -y apache2
```
   
Ubuntu ISO 를 Web 서버의 DocumentRoot 에 추가합니다.    
```bash
$ cd /var/www/html/
$ sudo wget https://releases.ubuntu.com/22.04/ubuntu-22.04-live-server-amd64.iso
````
   
Web 서비스를 시작합니다.    
```bash
$ sudo systemctl enable --now apache2
```
   
# `tftpd` 구성
`tftpd-hpa` 를 이용하여 구성합니다.   
    
## Install `tftpd-hpa`
아래 명령을 이용하여 설치를 진행합니다.   
```bash
$ sudo apt install -y tftp-hpa tftpd-hpa 
```
    
## Configuration `tftpd`
tftpd 설정 파일은 `/etc/default/tftpd-hpa` tftp directory 를 변경하려면 해당 파일을 수정하면 됩니다.   
```bash
$ cat /etc/default/tftpd-hpa
# /etc/default/tftpd-hpa
TFTP_USERNAME="tftp"
TFTP_DIRECTORY="/srv/tftp"   << TFTP Root Directory
TFTP_ADDRESS=":69"
TFTP_OPTIONS="--secure"
```
   
## PXE Boot 추가
PXE Boot 에 필요한 Bootloader 및 ramdisk 등을 TFTP Root Directory 에 추가합니다.   
   
Bootloader 는 `syslinux-common`, `pxelinux` package 를 설치 후에 추출합니다.   
```bash
$ sudo apt-get install syslinux-common pxelinux
```
   
아래와 같이 Bootloader 를 추출합니다.    
```bash
$ sudo cp /usr/lib/syslinux/modules/bios/ldlinux.c32 /src/ftfp/u22/
$ sudo cp /usr/lib/PXELINUX/pxelinux.0 /src/ftfp/u22/
```
    
Ubuntu ISO 에서 ramdisk 및 kernel image 를 추출합니다.   
```bash
$ sudo mount ubuntu-22.04-live-server-amd64.iso /mnt
$ sudo cp /mnt/casper/initrd /src/ftfp/u22/
$ sudo cp /mnt/casper/vmlinuz /src/ftfp/u22/
$ sudo umount /mnt
```
   
`pxelinux.cfg` 디렉토리를 생성합니다.   
이후 `default` 설정 파일을 아래와 같이 생성합니다.   
```bash
$ sudo mkdir -p /srv/tftp/u22/pxelinux.cfg
$ cat /srv/tftp/u22/pxelinux.cfg/default
DEFAULT install
 LABEL install
 KERNEL vmlinuz
 INITRD initrd
 APPEND root=/dev/ram0 ramdisk_size=1500000 ip=dhcp url=http://<Web Server IP>/ubuntu-22.04-live-server-amd64.iso
```
   
## `tftpd` 서비스 시작
`tftpd` 서비스를 시작/재시작 합니다.    
```bash
$ sudo systemctl start tftpd-hpa.service
 or
$ sudo systemctl restart tftpd-hpa.service

$ sudo systemctl status tftpd-hpa.service
● tftpd-hpa.service - LSB: HPA's tftp server
     Loaded: loaded (/etc/init.d/tftpd-hpa; generated)
     Active: active (running) since Fri 2022-07-01 06:32:25 UTC; 16s ago
       Docs: man:systemd-sysv-generator(8)
    Process: 52202 ExecStart=/etc/init.d/tftpd-hpa start (code=exited, status=0/SUCCESS)
      Tasks: 1 (limit: 4579)
     Memory: 408.0K
        CPU: 7ms
     CGroup: /system.slice/tftpd-hpa.service
             └─52210 /usr/sbin/in.tftpd --listen --user tftp --address :69 --secure /srv/tftp
 
Jul 01 06:32:25 test-u22 systemd[1]: Starting LSB: HPA's tftp server...
Jul 01 06:32:25 test-u22 tftpd-hpa[52202]:  * Starting HPA's tftpd in.tftpd
Jul 01 06:32:25 test-u22 tftpd-hpa[52202]:    ...done.
Jul 01 06:32:25 test-u22 systemd[1]: Started LSB: HPA's tftp server.
```
   
# DHCP 서버 구성
`dhcpd` 구성은 기존에 CentOS 구성과 동일한 설정을 사용 할 수 있습니다.    
* 참고 문서 : [https://chhanz.github.io/linux,%20dhcp/2020/11/17/configuration-dhcp/](https://chhanz.github.io/linux,%20dhcp/2020/11/17/configuration-dhcp/)   
   
## Install `dhcpd`
아래 명령을 이용하여 설치를 진행합니다.   
```bash
$ sudo apt install -y isc-dhcp-server
```
   
## Configuration `dhcp`
아래와 같이 `dhcpd.conf` 를 구성하고 IP 대역 및 PXE Boot 를 위해 `next-server` 를 추가합니다.   
```console
# /etc/dhcp/dhcpd.conf
... 생략

subnet 20.20.20.0 netmask 255.255.255.0 {
 option routers                  20.20.20.2;
 option subnet-mask              255.255.255.0;
 option domain-name              "example.com";
 option domain-name-servers      20.20.20.2, 1.1.1.1;
 option time-offset              -18000;     # Eastern Standard Time
 range 20.20.20.200 20.20.20.220;
 next-server 20.20.20.2;
 filename "u22/pxelinux.0";
}
```
    
설정 적용을 위해 서비스를 재시작합니다.   
```bash
$ sudo systemctl restart isc-dhcp-server
```
   
# PXE Boot 테스트
구성된 PXE 시스템을 이용하여 Ubuntu 22.04 를 배포하겠습니다.   
<center><img src="/assets/images/post/2022-07-07-u22-pxe/1.png" style="max-width: 95%; height: auto;"></center>    
위와 같이 NIC 로 Boot 하면 DHCP 로 지정된 IP 를 할당 받고 TFTP 를 통해 `pxelinux.0` 를 load 합니다.   
      
<center><img src="/assets/images/post/2022-07-07-u22-pxe/2.png" style="max-width: 95%; height: auto;"></center>    
PXE Boot 를 통한 Ubuntu 설치 과정 진행됨.   
   
<center><img src="/assets/images/post/2022-07-07-u22-pxe/3.png" style="max-width: 95%; height: auto;"></center>    
설치 완료된 모습.   
    
# 참고
## 1. `No space left on device` 에러
<center><img src="/assets/images/post/2022-07-07-u22-pxe/err.png" style="max-width: 95%; height: auto;"></center>    
위와 같이 설치 과정에서 `No space left on device` 라는 ERROR 가 발생되면 `pxelinux.cfg` 의 `default` 설정 파일에서 `ramdisk_size` 옵션이 필요합니다.    
Ubuntu ISO 이미지를 ramdisk 에 Download 하는데 ramdisk 의 size 가 부족하여 발생되는 것입니다.    
[(https://unix.stackexchange.com/questions/516651/cant-start-vm-with-pxe-write-error-no-space-left-on-device-and-end-up-in-dra)](https://unix.stackexchange.com/questions/516651/cant-start-vm-with-pxe-write-error-no-space-left-on-device-and-end-up-in-dra)    

아래와 같이 옵션을 추가하여 해결합니다.   
```bash
$ cat /srv/tftp/u22/pxelinux.cfg/default
DEFAULT install
 LABEL install
 KERNEL vmlinuz
 INITRD initrd
 APPEND root=/dev/ram0 ramdisk_size=1500000 ip=dhcp url=http://20.20.20.2/ubuntu-22.04-live-server-amd64.iso        <<
```
    
## 2. `dhcp` Network Interface 지정
아래와 같이 해당 설정 파일에 `INTERFACESv4` 옵션에 Interface name 을 입력하면 됩니다.    
```bash
$ cat /etc/default/isc-dhcp-server
...생략
INTERFACESv4="ens8"
...생략
```
   
## 3. Automated Server Install
아래 문서를 참고하여 autoinstall 설정 파일을 생성하고 Web 서버의 DocumentRoot 에 추가합니다.   
* Autoinstall 문서 : [https://ubuntu.com/server/docs/install/autoinstall](https://ubuntu.com/server/docs/install/autoinstall)   
* Quick Start : [https://ubuntu.com/server/docs/install/autoinstall-quickstart](https://ubuntu.com/server/docs/install/autoinstall-quickstart)   

`pxelinux.cfg` 의 `default` 설정 파일 APPEND 에 아래 예제와 같이 autoinstall script 를 추가합니다.   
```console
...
APPEND ip=dhcp url=http://20.20.20.2/ubuntu-20.04.2-live-server-amd64.iso autoinstall ds=nocloud-net;s=http://192.168.222.1/script/
...
```

# 참고 자료
* [https://access.redhat.com/documentation/ko-kr/red_hat_enterprise_linux/6/html/installation_guide/s1-netboot-pxe-config](https://access.redhat.com/documentation/ko-kr/red_hat_enterprise_linux/6/html/installation_guide/s1-netboot-pxe-config)    
* [https://wiki.syslinux.org/wiki/index.php?title=Library_modules](https://wiki.syslinux.org/wiki/index.php?title=Library_modules)    
* [https://documentation.suse.com/ko-kr/sles/15-SP3/html/SLES-all/cha-deployment-prep-uefi-httpboot.html](https://documentation.suse.com/ko-kr/sles/15-SP3/html/SLES-all/cha-deployment-prep-uefi-httpboot.html)    
* [https://help.ubuntu.com/community/isc-dhcp-server](https://help.ubuntu.com/community/isc-dhcp-server)   
* [https://askubuntu.com/questions/913250/how-can-i-get-isc-dhcp-server-dhcpd-to-listen-on-one-interface-only](https://askubuntu.com/questions/913250/how-can-i-get-isc-dhcp-server-dhcpd-to-listen-on-one-interface-only)   