--- 
layout: post
title: "[fast-vm] CentOS 8 custom image 생성"
description: " "
author: chhanz
date: 2019-09-25
tags: [linux, fast-vm]
category: linux
---

# CentOS 8 custom image 생성
* * *

드디어 `CentOS 8` 이 release 되었습니다. (2019-09-24)
> [CentOS 8 release news](https://twitter.com/CentOSProject/status/1173652996305170432)   

이것 저것 새로운 기능들을 테스트 해보고 싶은 욕망에 `fast-vm` 에서 사용할 custom image 를 생성해 보도록 하겠습니다.   
   
## Custom image 생성
아직 `CentOS 8` 의 `fast-vm` public image 는 아직 추가가 안 되었습니다.   
하지만 `RHEL 8` 을 통해 `CentOS 8` image 를 생성 할 수 있습니다.
   
> 여담으로 `fast-vm` 의 개발자, _@ondrej_ 에게 공식 public image upload 를 요청 하였습니다.   
> 테스트 로그도 첨부 하였죠! [issue #10 - request add `CentOS 8` fast-vm-public-image](https://github.com/OndrejHome/fast-vm-public-images/issues/10)   

### Download CentOS 8 iso image 
```bash
$ cd /tmp;wget http://mirror.kakao.com/centos/8.0.1905/isos/x86_64/CentOS-8-x86_64-1905-dvd1.iso
```
   
### Download rhel 8 hackfile, xml, kickstart-ks
```bash
$ wget https://raw.githubusercontent.com/OndrejHome/fast-vm-public-images/master/centos/xml/centos-6.3-current.xml
$ wget https://raw.githubusercontent.com/OndrejHome/fast-vm-public-images/master/rhel/ks/virt-install-rhel-8.sh
$ wget https://raw.githubusercontent.com/OndrejHome/fast-vm-public-images/master/rhel/hacks/6g_rhel-8-hacks.sh
$ wget https://raw.githubusercontent.com/OndrejHome/fast-vm-public-images/master/rhel/ks/rhel-8.ks
```
   
### Change rhel 8 to CentOS 7 (filename 및 내용 변경)
```diff
[root@test-vm-host centos-8.0]# diff centos-8.ks rhel-8.ks 
35,37c35,37
++ volgroup c8vg --pesize=4096 pv.1
++ logvol swap  --fstype="swap" --size=256 --name=swap_lv --vgname=c8vg
++ logvol /  --fstype="xfs" --size=5000 --name=root_lv --vgname=c8vg
---
-- volgroup r8vg --pesize=4096 pv.1
-- logvol swap  --fstype="swap" --size=256 --name=swap_lv --vgname=r8vg
-- logvol /  --fstype="xfs" --size=5000 --name=root_lv --vgname=r8vg

[root@test-vm-host centos-8.0]# diff virt-install-centos-8.sh virt-install-rhel-8.sh 
9c9 
++ --name centos-8-fastvm-install \
---
-- --name rhel-8-fastvm-install \
21c21
++ virsh --connect qemu:///system undefine centos-8-fastvm-install
---
-- virsh --connect qemu:///system undefine rhel-8-fastvm-install

[root@test-vm-host centos-8.0]# diff 6g_centos-8-hacks.sh 6g_rhel-8-hacks.sh
28c28 
++ guestfish -a "/dev/$THINPOOL_VG/$VM_NAME" -m /dev/c8vg/root_lv -m /dev/sda1:/boot --selinux <<EOF
---
-- guestfish -a "/dev/$THINPOOL_VG/$VM_NAME" -m /dev/r8vg/root_lv -m /dev/sda1:/boot --selinux <<EOF
```
   
### Create empty image
```bash
$ fast-vm import_custom_image 6 centos-8.0 empty centos-6.3-current.xml  
```
   
<center><img src="/assets/images/post/2019-09-25-fastvm-custom-image/img-1.png" style="max-width: 100%; height: auto;"></center>   
   
### `virt-install` 을 이용하여 base image 설치
```bash
$ ./virt-install-centos-8.sh /dev/c7vg/fastvm-centos-8.0 /tmp/CentOS-8-x86_64-1905-dvd1.iso centos-8.ks
```
* 설치 시작   
<center><img src="/assets/images/post/2019-09-25-fastvm-custom-image/img-2.png" style="max-width: 100%; height: auto;"></center>   
   
* kickstart 를 기준으로 자동 설치   
<center><img src="/assets/images/post/2019-09-25-fastvm-custom-image/img-3.png" style="max-width: 100%; height: auto;"></center>   
   
* 설치 완료   
<center><img src="/assets/images/post/2019-09-25-fastvm-custom-image/img-4.png" style="max-width: 100%; height: auto;"></center>   
   

### Export image
```bash
$ fast-vm export_image centos-8.0 gz 
```
<center><img src="/assets/images/post/2019-09-25-fastvm-custom-image/img-5.png" style="max-width: 100%; height: auto;"></center>   
   
### Remove empty image
```bash
$ fast-vm remove_image centos-8.0 
```
<center><img src="/assets/images/post/2019-09-25-fastvm-custom-image/img-6.png" style="max-width: 100%; height: auto;"></center>   

### Import custom image
```bash
## 6gb image 를 import 하기 위함.
$ mv centos-8.0.img.gz 6g__centos-8.0.img.gz    

## import custom image  
$ fast-vm import_image centos-8.0 6g__centos-8.0.img.gz centos-6.3-current.xml 6g_centos-8-hacks.sh  
```
   
<center><img src="/assets/images/post/2019-09-25-fastvm-custom-image/img-7.png" style="max-width: 100%; height: auto;"></center>   
   
### install `libguestfs` requirements
Import 한 image 를 이용하여 `vm` 을 생성하니 아래와 같은 에러가 발생 되었습니다.   

* hackfile 에서 `libguestfs` 확인 부분 삭제 case   
<center><img src="/assets/images/post/2019-09-25-fastvm-custom-image/error.png" style="max-width: 100%; height: auto;"></center>   
* hackfile 에서 `libguestfs` 추가된 부분   
<center><img src="/assets/images/post/2019-09-25-fastvm-custom-image/img-8.png" style="max-width: 100%; height: auto;"></center>   
    
이 문제는 `RHEL 8`, `CentOS 8` 일부 시스템(RHEL/CentOS 7.x, libguestfs-appliance-1.38.0)에서 `xfs` 의 새로운 기능으로 인해 `libguestfs` 가 정상적으로 작동하지 못하여 발생되는 원인입니다.  
   
설치 방법은 아래와 같습니다.   
`fast-vm` 가이드 문서 : [https://github.com/OndrejHome/fast-vm-public-images/tree/master/rhel](https://github.com/OndrejHome/fast-vm-public-images/tree/master/rhel)   
   
```bash
[root@test-vm-host centos-8.0]# mkdir /var/tmp/fedora29
[root@test-vm-host centos-8.0]# cd /var/tmp/fedora29/
[root@test-vm-host fedora29]# wget http://ftp.linux.cz/pub/linux/people/ondrej_famera/fastvm-images/appliance-1.39.11.tar.xz
[root@test-vm-host fedora29]# tar xvf appliance-1.39.11.tar.xz  
appliance/
appliance/README.fixed
appliance/root
appliance/initrd 
appliance/kernel 
[root@test-vm-host fedora29]# echo 'x /var/tmp/fedora29' > /etc/tmpfiles.d/fast-vm-fedora29-appliance.conf
```
   
### `vm` 생성 테스트
```bash
[root@test-vm-host fast-vm]# fast-vm create centos-8.0 77
[77][inf] using file /etc/fast-vm/config-centos-8.0.xml as libvirt XML 
[77][inf] using file /etc/fast-vm/hacks-centos-8.0.sh as hack file 
[77][inf] defining virtual machine 'fastvm-centos-8.0-77' in libvirt 
fastvm-centos-8.0-77에서 정의된 도메인 /tmp/tmp.xkf30zZawx.xml 

Domain title updated successfully 
[77][inf] creating disk 'fastvm-centos-8.0-77' 
[77][inf] adding static lease for 192.168.200.77 into libvirts DHCP 
[77][inf] applying hacks from /etc/fast-vm/hacks-centos-8.0.sh 
*stdin*:3: libguestfs: error: sh: mv: '/etc/sysconfig/network-scripts/ifcfg-ens3' and '/etc/sysconfig/network-scripts/ifcfg-ens3' are the same file 
[77][wrn] there was issue applying hacks to this machine, check syslog for more details 
[77][inf] applying hacks finished 
[77][ok] VM 'fastvm-centos-8.0-77' created

[root@test-vm-host fast-vm]# fast-vm console 77 
도메인 fastvm-centos-8.0-77에 연결되었습니다 
Escape character is ^]

...

CentOS Linux 8 (Core) 
Kernel 4.18.0-80.el8.x86_64 on an x86_64

fastvm-centos-8-0-77 login: root 
Password:  
Last login: Wed Sep 25 15:42:04 on ttyS0 
[root@fastvm-centos-8-0-77 ~]# cat /etc/redhat-release  
CentOS Linux release 8.0.1905 (Core)  
[root@fastvm-centos-8-0-77 ~]# uname -a 
Linux fastvm-centos-8-0-77 4.18.0-80.el8.x86_64 #1 SMP Tue Jun 4 09:19:46 UTC 2019 x86_64 x86_64 x86_64 GNU/Linux 
[root@fastvm-centos-8-0-77 ~]#
```
   
위와 같이 정상적으로 `CentOS 8` 을 사용 할 수 있게 되었습니다.   

# 참고 자료
* fast-vm guide : [https://www.famera.cz/blog/fast-vm/user_guide.html](https://www.famera.cz/blog/fast-vm/user_guide.html)   
* fast-vm public image github : [https://github.com/OndrejHome/fast-vm-public-images](https://github.com/OndrejHome/fast-vm-public-images)   
   
   

