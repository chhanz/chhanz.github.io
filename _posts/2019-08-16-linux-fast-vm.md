---
layout: post
title: "[Linux] Fast-VM 설치 및 활용"
description: " "
author: chhanz
date: 2019-08-16
tags: [linux, fast-vm]
category: linux
---

# Fast-VM
* * *
## Fast-VM 이란?
> `Fast-VM` 라는 _Open Source Solution_ 을 알게된 것은 *Ondrej Faměra* 라는 친구를 만나면서 입니다.   
> ***Thank You. Ondrej ^o^***

`Fast-VM` 은 *Ondrej Faměra* 가 만든 libvirtd 기반의 가상화 Provisioning Solution 입니다.   
기존의 libvirtd 기반의 가상화는 virt-manager 혹은 virsh 을 통해 VM 생성 및 운영을 하였습니다.  
    
`Fast-VM` 을 이용하면 `fast-vm` 이라는 명령어 하나로 VM을 생성하고 관리 할 수 있습니다.   
다양한 Linux 배포판을 설치하고 테스트를 해야되는 저는 `fast-vm` 을 통해 여러가지 스트레스들이 사라졌습니다. ^^    
      
## Fast-VM 설치
`fast-vm` 의 설치 환경은 아래와 같습니다.   
> - CentOS/RHEL 7.6 and Fedora 28, 29, 30, RHEL system   
> - KVM 가상화를 사용 할 수 있도록 CPU 가상화 기능 활성화   
> - LVM Pool 공간으로 사용될 Free VG 공간   
> - Package 설치를 위한 Public Network 연결 허용   
   
`fast-vm` 설치는 `ansible` 을 이용하여 간편하게 설치가 가능합니다.   
   
~~~console
[root@fastvm-host ~]# yum -y install ansible
~~~
먼저 `ansible` 을 설치합니다.   
   
~~~console
[root@fastvm-host ~]# ansible-galaxy install ondrejhome.fast-vm-server
- downloading role 'fast-vm-server', owned by ondrejhome
- downloading role from https://github.com/OndrejHome/ansible.fast-vm-server/archive/v6.tar.gz
- extracting ondrejhome.fast-vm-server to /etc/ansible/roles/ondrejhome.fast-vm-server
- ondrejhome.fast-vm-server (v6) was installed successfully
[root@fastvm-host ~]#
~~~
`ansible-galaxy` 명령을 통해 `fast-vm` _playbook_ 을 Download 합니다.   
   
~~~console
[root@fastvm-host defaults]# vgs
  VG     #PV #LV #SN Attr   VSize   VFree
  centos   1   2   0 wz--n- 278.36g <120.37g
[root@fastvm-host defaults]#
~~~
위와 같이 Free Size 의 VG 를 준비합니다.   
   
~~~yaml
[root@fastvm-host defaults]# pwd
/etc/ansible/roles/ondrejhome.fast-vm-server/defaults

[root@fastvm-host defaults]# cat main.yml
---
### areas that can be configured by this role

## configure repositories needed for fast-vm installation
config_repositories: true
## install packages needed by fast-vm and fast-vm itself
install_fastvm: true
## configure libvirt for fast-vm access (change groups and permissions settings)
config_libvirt_access: true
## configure libvirt network for fast-vm (libvirtd service will be enabled after boot)
config_libvirt_network: true
## configure storage for fast-vm (create thinpool LV)
config_storage: true
## configure sudoers for fast-vm
config_sudoers: true
## generate /etc/fast.conf configuration file
config_fastvm_conf: true
## install OVMF UEFI firmware needed by UEFI fast-vm machines
install_ovmf: true
## install and configure fence_virtd that can be used to fence the fast-vm VMs using fence_xvm
install_fence_virtd: true
## install custom version of qemu-kvm,qemu-img and seabios-bin to support LSI and MEGASAS emaulated drivers
install_custom_qemu: true

### variable that are required by some areas from above
# all variable has list of 'required by' on which above options needs them

## group with access to fast-vm
# required by: config_libvirt_access, config_sudoers, config_fastvm_conf
fastvm_group: libvirt

## name of VG where fast-vm thinpool LV is located
# required by: config_storage, config_fastvm_conf
fastvm_vg: centos

## name of fast-vm thinpool LV
# required by: config_storage, config_fastvm_conf
fastvm_lv: fast-vm-pool

## size of fast-vm thinpool LV
# required by: config_storage, config_fastvm_conf
fastvm_lv_size: 100G

## fast-vm network subnet number
# required by: config_libvirt_network, config_fastvm_conf
fastvm_net: 100

## name of fast-vm NAT libvirt network
# required by: config_libvirt_network, config_fastvm_conf, install_fence_virt
fastvm_net_name: fast-vm-nat

## prefix for fast-vm VMs
# required by: config_fastvm_conf
fastvm_vm_prefix: 'fastvm-'

## fast-vm notes directory - here fast-vm stores VM notes and other VM stateful details
# required by: config_fastvm_conf
fastvm_notes_dir: '/var/tmp'

## Allow only owners of VMs and 'root' to delete them
# required by: config_fastvm_conf
fastvm_owner_only_delete: 'yes'

## Multicast address of fence_virt daemon
# required by: install_fence_virt
fence_virtd_address: '225.0.0.12'
[root@fastvm-host defaults]#
~~~
`/etc/ansible/roles/ondrejhome.fast-vm-server/defaults` 위 경로의 `main.yml` 을 설치 환경에 맞게 설정합니다.      
(현재는 `firewalld` 설정 관련 Option 을 추가 하였습니다. 상세 내용은 하단에 첨부하도록 하겠습니다.)   
   
`/etc/ansible/roles/ondrejhome.fast-vm-server/defaults/main.yml` 에서 아래 Option 을 시스템 환경에 맞게 설정하였습니다.   
~~~yaml
fastvm_vg: centos
fastvm_lv_size: 100G
~~~
   
~~~yaml
[root@fastvm-host ~]# cat install.yaml
- hosts: localhost
  roles:
     - { role: ondrejhome.fast-vm-server }
~~~
위와 같이 `localhost` 에 설치하도록 `ansible-playbook` 을 작성합니다.   
   
~~~console
[root@fastvm-host ~]# ansible-playbook install.yaml

... 중략 ...

TASK [ondrejhome.fast-vm-server : make fence_xvm.key readable by everyone] **************************************************************************************
ok: [localhost]

TASK [ondrejhome.fast-vm-server : generate /etc/fence_virt.conf configuration] **************************************************************************************
ok: [localhost]

TASK [ondrejhome.fast-vm-server : start and enable fence_virtd service] **************************************************************************************
changed: [localhost]

TASK [ondrejhome.fast-vm-server : install custom qemu-kvm, qemu-img and seabios-bin packages] **************************************************************************************
 [WARNING]: Consider using yum module rather than running yum

changed: [localhost]

PLAY RECAP ***************************************************************************
localhost                  : ok=28   changed=2    unreachable=0    failed=0

[root@fastvm-host ~]#
~~~
위와 같이 설치가 손쉽게 되는 것을 볼 수 있습니다.   
   
# Fast-VM 운영
* * *
## Show VM List
~~~console
[root@fastvm-host ~]# fast-vm list
VM# Image name      Status       Profile_name    Size( %used )  Activity  Notes
=== Space used:   0.00% of 100.00g
[root@fastvm-host ~]#
~~~
## Import OS Images
`fast-vm` Document Page 를 참조하면 다양한 Linux 배포판 Template 가 생성 되어 있고, 사용이 가능합니다.   
   
* Image List : [https://www.famera.cz/blog/fast-vm/image_list.html](https://www.famera.cz/blog/fast-vm/image_list.html)   
   
해당 Page 를 통해 Os Image 를 Import 하도록 하겠습니다.   
~~~console
[root@test-vm-host ~]# fast-vm import_image centos-6.9 http://ftp.linux.cz/pub/linux/people/ondrej_famera/fastvm-images/generated/6g__centos-6.9.img.xz \
> https://raw.githubusercontent.com/OndrejHome/fast-vm-public-images/master/centos/xml/centos-6.3-current.xml \
> https://raw.githubusercontent.com/OndrejHome/fast-vm-public-images/master/centos/hacks/6g_centos-6-hacks.sh 
[__][inf] provided empty file path 
[__][inf] Detected remote file with size 199916708 
[__][inf] provided empty file path 
[__][inf] Detected remote file with size 1596 
[__][inf] downloading https://raw.githubusercontent.com/OndrejHome/fast-vm-public-images/master/centos/xml/centos-6.3-current.xml 
[__]into /tmp/tmp.Ca4rz7xD9y
[__][inf] provided empty file path 
[__][inf] Detected remote file with size 1334 
[__][inf] downloading https://raw.githubusercontent.com/OndrejHome/fast-vm-public-images/master/centos/hacks/6g_centos-6-hacks.sh
[__]into /tmp/tmp.6QO7k5K5zK
[__][inf] Size of image was determined from the filename to be 6G. 
[__][inf] creating LV fastvm-centos-6.9 ... 
[__][inf] importing image http://ftp.linux.cz/pub/linux/people/ondrej_famera/fastvm-images/generated/6g__centos-6.9.img.xz into /dev/c7vg/fastvm-centos-6.9 
[__][inf] please wait while importing image (to show image write progress, install 'pv')
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current 
                                 Dload  Upload   Total   Spent    Left  Speed 
100  190M  100  190M    0     0  3180k      0  0:01:01  0:01:01 --:--:-- 55347 
0+640923 records in 
0+640923 records out
6442450944 bytes (6.4 GB) copied, 62.6419 s, 103 MB/s 
[__][ok] Image centos-6.9 imported
[root@test-vm-host ~]# 
~~~
위와 같이 Image 를 Download 하고 `fast-vm` 에 Import 하였습니다.   
   
~~~console
[root@test-vm-host ~]# fast-vm list_images  
IMAGE                       |SYSTEM                |USER                  | 
Image name             Size |XML      Hack file for|XML      Hack file for|
centos-6.10              6g |ok       create       |missing  no hack files| 
centos-6.9               6g |ok       create       |missing  no hack files| 
centos-7.3               6g |ok       create       |missing  no hack files|
centos-7.6               6g |ok       create       |missing  no hack files| 
centos-7.6-ext           6g |ok       create       |missing  no hack files|

NOTE: if image is missing XML it wouldn't be possible to create a VM from it!
 Image with missing hack file(s) can work if it's not needed.

 USER XML and hack file(s) takes precendense before SYSTEM ones.
[root@test-vm-host ~]#  
~~~
`CentOS 6.9` 가 Import 되었습니다.   

## hack file 수정
기본적으로 제공된 OS Image 는 유럽 Timezone 이 설정 되어 있습니다.   
그리하여 *hack file* 을 수정하여 아시아 Timezone 으로 변경을 할 수 있고, 이를 응용하여 나만의 Custom Image 를 생성 할 수 있습니다.   
~~~diff
$ vi /etc/fast-vm/hacks-centos-6.9.sh 

#!/bin/bash
## test if guestfish command is present
which guestfish 2>&1 > /dev/null
if [ "$?" != 0 ]; then
        echo "[!!!] Command 'guestfish' not found (Install it!). Making changes to VM FAILED."
        exit 1
fi
## using direct backend to avoid selinux issues on fedora for now
export LIBGUESTFS_BACKEND=direct
## hostname
VM_HOSTNAME=$(echo $VM_NAME|sed -e 's/\./-/g; s/_/-/g')

guestfish -a "/dev/$THINPOOL_VG/$VM_NAME" -m /dev/c6vg/root_lv -m /dev/sda1:/boot <<EOF
# configure correct MAC address for eth0 network adapter
sh 'sed -i "s/HWADDR=.*$/HWADDR=\"${VM_MAC}\"/; s/^ONBOOT=.*$/ONBOOT=\"yes\"/" /etc/sysconfig/network-scripts/ifcfg-eth0'
# change the hostname of machine
sh 'sed -i "s/HOSTNAME=.*$/HOSTNAME=$VM_HOSTNAME/" /etc/sysconfig/network'

++ # Change Timezone 
++ sh 'rm -f /etc/localtime'
++ sh 'ln -s /usr/share/zoneinfo/Asia/Seoul /etc/localtime'

# CentOS 6.4, 6.4, 6.5 contained broken line in 'file_contexts' file, this removes it so we can apply other selinux labels
sh 'sed -i "/\\pid/d" /etc/selinux/targeted/contexts/files/file_contexts'
selinux-relabel /etc/selinux/targeted/contexts/files/file_contexts /etc/selinux/targeted/contexts/files/file_contexts
# relabel files that we were touching with correct SELinux labels
selinux-relabel /etc/selinux/targeted/contexts/files/file_contexts /etc/sysconfig/network-scripts/ifcfg-eth0
selinux-relabel /etc/selinux/targeted/contexts/files/file_contexts /etc/sysconfig/network
EOF
~~~
위와 같이 `guestfish` 명령을 통해 Image 변경 작업을 할 수 있도록 설정합니다.   
   
## Start fast-vm 
수정된 Image 를 이용하여 VM 을 생성 하도록 하겠습니다.   
~~~console
[root@test-vm-host ~]# fast-vm create centos-6.9 30 
[30][inf] using file /etc/fast-vm/config-centos-6.9.xml as libvirt XML 
[30][inf] using file /etc/fast-vm/hacks-centos-6.9.sh as hack file
[30][inf] defining virtual machine 'fastvm-centos-6.9-30' in libvirt
Domain fastvm-centos-6.9-30 defined from /tmp/tmp.AUMMkEdrbo.xml

Domain title updated successfully
[30][inf] creating disk 'fastvm-centos-6.9-30' 
[30][inf] adding static lease for 192.168.200.30 into libvirts DHCP 
[30][inf] applying hacks from /etc/fast-vm/hacks-centos-6.9.sh 

[30][inf] applying hacks finished 
[30][ok] VM 'fastvm-centos-6.9-30' created 
~~~
VM ID 30 으로 VM 이 생성 되었습니다.   
     
~~~console
[root@test-vm-host ~]# fast-vm start 30 
[30][inf] starting VM fastvm-centos-6.9-30 (192.168.200.30) 
Domain fastvm-centos-6.9-30 started 
~~~
VM ID 30 의 VM 을 시작 하였습니다.   
   
~~~console
[root@test-vm-host ~]# fast-vm ssh 30 
[30][inf] checking the 192.168.200.30 for active SSH connection (ctrl+c to interrupt) 
................[30][inf]  
[30]SSH ready
Warning: Permanently added '192.168.200.30' (RSA) to the list of known hosts. 
root@192.168.200.30's password:  
~~~
`fast-vm ssh` 명령을 통해 해당 VM 에 `ssh` 로 접속을 합니다.   
시스템이 부팅중일 경우, `ssh` 서비스가 시작 될 때까지 접속 대기합니다.   
* 참고 : 기본적으로 사용되는 이미지의 `root` 비밀번호는 `testtest` 입니다.   
   
~~~console
[root@fastvm-centos-6-9-30 ~]# cat /etc/redhat-release  
CentOS release 6.9 (Final) 

[root@fastvm-centos-6-9-30 ~]# date 
Fri Aug 16 11:02:43 KST 2019
~~~
위와 같이 VM 이 생성 및 시작, hack file 이 적용된 것을 확인 할 수 있습니다.   
   
## Delete fast-vm 
아래 명령을 통해 사용을 다한 `fast-vm` 을 삭제 할 수 있습니다.   
~~~console
[root@test-vm-host fast-vm]# fast-vm delete 30 
[30][wrn] VM fastvm-centos-6.9-30 is active, forcefully stopping it 
Domain fastvm-centos-6.9-30 destroyed 

[30][inf] removing DHCP reservation 192.168.200.30 for 52:54:00:96:5c:80
Updated network fast-vm-nat persistent config and live state 
[30][inf] removing VM drive 
[30][inf] undefining VM fastvm-centos-6.9-30 from libvirt 
Domain fastvm-centos-6.9-30 has been undefined 

[30][ok] VM 'fastvm-centos-6.9-30' deleted 
[root@test-vm-host fast-vm]#
~~~
해당 VM 이 삭제 되었습니다.   

# fast-vm 에 PR 을 해보자!
* * *
`fast-vm` 은 Open Source Solution 으로 언제나 Github를 통해 PR 을 할 수 있습니다.   
저의 경우, 아래와 같은 이슈로 인해 PR 진행 하였습니다.   
- `firewalld` deamon 의 `disable` 로 인한 배포 실패   
- 지원하는 `ansible` 최소버전에 대한 이슈. ( [`yum` Module `update_only` option 관련](https://docs.ansible.com/ansible/2.5/modules/yum_module.html) )   
   
<center><img src="/assets/images/post/2019-08-16-fast-vm/pr1.png" style="max-width: 100%; height: auto;"></center>   
   
위와 같이 PR 을 생성하고 현재는 `Source` 에 `Merge` 되었습니다.   
   
# 마치며
위에서 소개한 `fast-vm` 의 부분은 극히 필수적인 요소들입니다.   
libvirtd 에서 제공하는 다양한 부분을 지원하고 있으며, 해당 내용은 아래 _참고 문서_ 를 확인 바람니다.   
   
***사용 중 발생된 이슈/추가 기능 구현 관련에 대해 `github` 를 통해 PR 할 수 있습니다.   ***
   
# 참고 문서
* github : [https://github.com/OndrejHome/ansible.fast-vm-server](https://github.com/OndrejHome/ansible.fast-vm-server)   
* Fast-VM User Guide : [https://www.famera.cz/blog/fast-vm/user_guide.html](https://www.famera.cz/blog/fast-vm/user_guide.html)   
* Fast-VM Image List : [https://www.famera.cz/blog/fast-vm/image_list.html](https://www.famera.cz/blog/fast-vm/image_list.html)   
