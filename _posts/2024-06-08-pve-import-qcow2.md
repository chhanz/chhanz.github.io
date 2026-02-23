---
layout: post
title: "[Proxmox] Import the qcow2 image"
description: "Import Rocky Linux and Amazon Linux 2023"
author: chhanz
date: 2024-06-08
tags: [linux]
category: linux
---

# 이전 글
* Install Proxmox :    
[https://tech.chhanz.xyz/linux/2024/05/13/install-pve-8-2/](https://tech.chhanz.xyz/linux/2024/05/13/install-pve-8-2/)   
* Create Cluster :   
[https://tech.chhanz.xyz/linux/2024/05/31/pve-cluster](https://tech.chhanz.xyz/linux/2024/05/31/pve-cluster)   
* Deploy Ceph in Proxmox 8.2.1 :   
[https://tech.chhanz.xyz/linux/2024/05/31/pve-with-ceph/](https://tech.chhanz.xyz/linux/2024/05/31/pve-with-ceph/)   
* VM Live Migration on Proxmox 8.2.1 :   
[https://tech.chhanz.xyz/linux/2024/06/07/pve-migration/](https://tech.chhanz.xyz/linux/2024/06/07/pve-migration/)   
   
# Qcow2 이미지 추가
Proxmox 에 `Cloud-init` device 기능과 qcow2 유형의 Cloud Image 를 이용하면 Proxmox 에서도 간단하게 운영체제를 설정하고 생성, 운영 할 수 있습니다.   
   
# How to
먼저 Template 생성을 위해 VM 을 생성합니다.   
아래 작성한 내용은 Rocky Linux 8.10 을 추가하기 위한 내용을 구성되어 있습니다.   
   
<center><img src="/assets/images/post/2024-06-08-pve/q1.png" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;Template 생성을 위한 VM 생성을 시작합니다.   
   
<center><img src="/assets/images/post/2024-06-08-pve/q2.png" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;Cloud Image 를 사용할 것이므로 `Do not use any media` 를 선택합니다.   
   
<center><img src="/assets/images/post/2024-06-08-pve/q3.png" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;Cloud Image 를 Base Disk 로 사용해야되므로 기본 DISK 는 제거합니다.   
   

```console
# mkdir /var/lib/vz/template/qcow
# cd /var/lib/vz/template/qcow

# wget http://dl.rockylinux.org/pub/rocky/8/images/x86_64/Rocky-8-GenericCloud-Base-8.10-20240528.0.x86_64.qcow2

# qm importdisk 101 Rocky-8-GenericCloud-Base-8.10-20240528.0.x86_64.qcow2 vmpool
importing disk 'Rocky-8-GenericCloud-Base-8.10-20240528.0.x86_64.qcow2' to VM 101 ...
  Logical volume "vm-101-disk-0" created.
transferred 0.0 B of 10.0 GiB (0.00%)
...
Successfully imported disk as 'unused0:vmpool:vm-101-disk-0'
```
위와 같이 PVE 노드에서 qcow2 이미지를 내려받고 `qm importdisk` 명령어를 통해 `vmpool` 을 사용하며 `101` VM 에 DISK 로 추가합니다.   
   
<center><img src="/assets/images/post/2024-06-08-pve/q4.png" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;위와 같이 `Unused Disk 0` 로 추가된 것을 볼 수 있습니다.    
    
<center><img src="/assets/images/post/2024-06-08-pve/q5.png" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;추가된 Unused Disk 를 `VirtIO Block` 유형으로 변경합니다.   
   
<center><img src="/assets/images/post/2024-06-08-pve/q6.png" style="max-width: 95%; height: auto;"></center> 
   
&nbsp;&nbsp;&nbsp;&nbsp;virtio0 유형의 디스크로 변경된 것을 볼 수 있습니다.   
   
  

<center><img src="/assets/images/post/2024-06-08-pve/q7.png" style="max-width: 95%; height: auto;"></center>   
      
&nbsp;&nbsp;&nbsp;&nbsp;추가된 virtio0 유형의 디스크를 Boot Order 에 추가합니다.   
   
<center><img src="/assets/images/post/2024-06-08-pve/q8.png" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;해당 디스크가 정상적인 부트 리스트에 가도록 설정합니다.   
   
<center><img src="/assets/images/post/2024-06-08-pve/q9.png" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;Cloud-init 기능을 이용 할 수 있도록 Cloudinit Drive 를 추가합니다.   
   
<center><img src="/assets/images/post/2024-06-08-pve/q10.png" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;Cloudinit Drive 가 사용할 PVE Storage 를 선택합니다.   
   
<center><img src="/assets/images/post/2024-06-08-pve/q11.png" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;Cloud-init 정보를 설정합니다.   
&nbsp;&nbsp;&nbsp;&nbsp;Cloud-init 에 의하여 생성할 계정 및 비밀번호, 네트워크 설정을 하였습니다.   
   
<center><img src="/assets/images/post/2024-06-08-pve/q12.png" style="max-width: 95%; height: auto;"></center>   
 
&nbsp;&nbsp;&nbsp;&nbsp;Template 생성을 위해 `Convert to template` 를 선택합니다.   
   
 <center><img src="/assets/images/post/2024-06-08-pve/q13.png" style="max-width: 95%; height: auto;"></center>   
    
&nbsp;&nbsp;&nbsp;&nbsp;Template 생성이 되었습니다.   
   
<center><img src="/assets/images/post/2024-06-08-pve/q14.png" style="max-width: 95%; height: auto;"></center>   

&nbsp;&nbsp;&nbsp;&nbsp;VM 생성을 위해 Template 를 Clone 합니다.   
   
<center><img src="/assets/images/post/2024-06-08-pve/q15.png" style="max-width: 95%; height: auto;"></center>   
     
&nbsp;&nbsp;&nbsp;&nbsp;Mode 는 `Full Clone` 으로 설정하고 Clone 합니다.   
   
<center><img src="/assets/images/post/2024-06-08-pve/q16.png" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;Clone 된 VM 을 시작하면 Cloud-init 에 설정한 것과 같이 자동으로 초기 설정이 완료된 상태의 운영체제를 확인 할 수 있습니다.   
    
# Import Amazon Linux 2023 
아래 문서와 같이 Amazon Linux 2023 은 Amazon EC2 가 아닌 다른 KVM 혹은 VMware 와 같은 환경에서 사용이 가능합니다.   
   
* [Amazon EC2 외부에서 사용 시 Amazon Linux 2023 설정 및 cloud-init 구성](https://docs.aws.amazon.com/ko_kr/linux/al2023/ug/outside-ec2-configuration.html)   
   
위 문서에서는 `seed.iso` 를 생성해서 Cloud-init 정보 주입을 해야하지만 Proxmox 에서는 Cloudinit Device 기능을 이용하면 자동으로 이 부분을 설정 할 수 있습니다.   
   
아래는 Amazon Linux 2023 을 추가하는 과정에 일부입니다.   
VM 생성 과정은 이전에 설명한 Rocky Linux 부분을 참고합니다.   
   
```console
root@pve1:~# cd /var/lib/vz/template/qcow/

root@pve1:/var/lib/vz/template/qcow# wget https://cdn.amazonlinux.com/al2023/os-images/2023.4.20240528.0/kvm/al2023-kvm-2023.4.20240528.0-kernel-6.1-x86_64.xfs.gpt.qcow2

root@pve1:/var/lib/vz/template/qcow# qm importdisk 103 al2023-kvm-2023.4.20240528.0-kernel-6.1-x86_64.xfs.gpt.qcow2 vmpool
```
   
Amazon Linux 2023 부팅 이후, 아래와 같이 Cloudinit Device 에서 `seed.iso` 역할을 대신하고 있는 것을 확인 할 수 있습니다.   
   
```console
[root@test222 ~]# cat /etc/os-release
NAME="Amazon Linux"
VERSION="2023"
...

[root@test222 ~]# mount /dev/sr0 /mnt
mount: /mnt: WARNING: source write-protected, mounted read-only.

[root@test222 ~]# ls -l /mnt
total 2
-rw-r--r--. 1 root root  54 Jun  8 12:52 meta-data
-rw-r--r--. 1 root root 216 Jun  8 12:52 network-config
-rw-r--r--. 1 root root 217 Jun  8 12:52 user-data
-rw-r--r--. 1 root root   0 Jun  8 12:52 vendor-data

[root@test222 ~]# cat /mnt/user-data
#cloud-config
hostname: test222
manage_etc_hosts: true
fqdn: test222
user: ec2-user
password: $5$M2ADMz3P$sMZAACAjq6WcEamzC1mnm5fGpKT/dDgYlQfnOlKIh.8
chpasswd:
  expire: False
users:
  - default
package_upgrade: true
```
   
참고로 AWS 에서 제공하는 Amazon Linux 2023 Cloud image 의 경우, 기본적으로 ssh 를 Password 를 이용한 접근을 허용이 안 되어있습니다.   
SSH 를 Password 를 이용하여 접근하기 위해서는 console 에서 `/etc/ssh/sshd_config` 를 수정이 필요합니다.   
   
만약 초기 Cloud Image 를 수정하여 SSH 를 Password 를 이용한 접근을 활성화 하기 위해서는 아래와 같은 방법을 이용하면 쉽게 해결 할 수 있습니다.   
   
```console
# apt install libguestfs-tools

# virt-customize -a al2023-kvm-2023.4.20240528.0-kernel-6.1-x86_64.xfs.gpt.qcow2 --run-command "sed -i 's/ssh_pwauth:   false/ssh_pwauth:   true/g' /etc/cloud/cloud.cfg"
[   0.0] Examining the guest ...
[   1.9] Setting a random seed
virt-customize: warning: random seed could not be set for this type of guest
[   1.9] Running: sed -i 's/ssh_pwauth:   false/ssh_pwauth:   true/g' /etc/cloud/cloud.cfg
[   1.9] Finishing off
```
   
위와 같이 qcow2 이미지에 설정된 `ssh_pwauth` 설정을 `virt-customize` 명령어를 이용하여 수정하고 수정된 qcow2 이미지를 import 하는 방법입니다.   
   
# 참고 자료
* [https://pve.proxmox.com/pve-docs/qm.1.html](https://pve.proxmox.com/pve-docs/qm.1.html)    
* [Amazon EC2 외부에서 사용 시 Amazon Linux 2023 설정 및 cloud-init 구성](https://docs.aws.amazon.com/ko_kr/linux/al2023/ug/outside-ec2-configuration.html)    
* [https://rockylinux.org/ko/download](https://rockylinux.org/ko/download)   
* [https://cdn.amazonlinux.com/al2023/os-images/2023.4.20240528.0/kvm/](https://cdn.amazonlinux.com/al2023/os-images/2023.4.20240528.0/kvm/)   
* [https://pve.proxmox.com/wiki/Cloud-Init_Support](https://pve.proxmox.com/wiki/Cloud-Init_Support)   