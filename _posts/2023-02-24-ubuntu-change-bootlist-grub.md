---
layout: post
title: "[Ubuntu] Default boot kernel 변경 방법 (use rescue node)" 
description: ""
author: chhanz
date: 2023-02-24
tags: [linux, aws]
category: linux
---

# Ubuntu - Default boot kernel 변경 방법
Ubuntu 인스턴스에서 특정 커널 버전이 이슈가 있어서 이전에 사용하던 커널 버전으로 변경이 필요한 경우엔 아래와 같은 방법을 통해 Default Boot Kerenl 을 변경 할 수 있습니다.   
* 참고 : 해당 과정은 인스턴스가 시작이 안될때, 복구 인스턴스를 이용하여 복구하는 방법이고 인스턴스가 동작한다면 후반부의 Boot Kernel 확인, Update Grub 만 적용하면 된다.   

# Workaround
복구 인스턴스에 문제가 되는 인스턴스의 Root Volume 을 Attach 합니다.   
```bash
$ sudo lsblk
NAME     MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
loop0      7:0    0  24.4M  1 loop /snap/amazon-ssm-agent/6312
loop1      7:1    0  55.6M  1 loop /snap/core18/2679
loop2      7:2    0  63.3M  1 loop /snap/core20/1778
loop3      7:3    0 111.9M  1 loop /snap/lxd/24322
loop4      7:4    0  49.8M  1 loop /snap/snapd/17950
xvda     202:0    0     8G  0 disk
├─xvda1  202:1    0   7.9G  0 part /
├─xvda14 202:14   0     4M  0 part
└─xvda15 202:15   0   106M  0 part /boot/efi
xvdf     202:80   0     8G  0 disk                          << ISSUE DISK
├─xvdf1  202:81   0   7.9G  0 part
├─xvdf14 202:94   0     4M  0 part
└─xvdf15 202:95   0   106M  0 part
```
   
이슈 인스턴스의 Root Volume 을 mount 할 경로를 생성하고 `chroot` 를 사용하기 위해 아래와 같이 /proc, /dev, /sys 경로를 bind 합니다.   
```bash
$ sudo mkdir /mnt/rescue
$ sudo mount /dev/xvdf1 /mnt/rescue
$ sudo mount -o bind /proc /mnt/rescue/proc
$ sudo mount -o bind /dev /mnt/rescue/dev
$ sudo mount -o bind /sys /mnt/rescue/sys
$ sudo chroot /mnt/rescue/
```
   
`chroot` 가 완료되면 root 프롬프트가 시작되고 이슈 인스턴스의 Boot Kernel 순서를 확인합니다.   
```bash
root@ip-172-31-13-208:/# cat /boot/grub/grub.cfg  | egrep 'menuentry |submenu ' | awk -F"'" '{print $1 $2}'
menuentry Ubuntu                                    --------------->> 0
submenu Advanced options for Ubuntu                 --------------->> 1
	menuentry Ubuntu, with Linux 5.15.0-1030-aws    --------------->> 1>0
	menuentry Ubuntu, with Linux 5.15.0-1030-aws (recovery mode)   >> 1>1
	menuentry Ubuntu, with Linux 5.15.0-1028-aws    --------------->> 1>2
	menuentry Ubuntu, with Linux 5.15.0-1028-aws (recovery mode)   >> 1>3
...skip
```
위와 같이 Boot Kernel 이 확인 되고 Submenu 를 사용하는 것으로 확인 되었습니다.   
Submenu 를 사용하기 때문에 우측에 작성한 것과 같이 `>` 를 이용하여 순번이 지정됩니다.   

확인한 Boot Kernel 순번을 `/etc/default/grub` 의 `GRUB_DEFAULT` 에 넣습니다.    
```bash
root@ip-172-31-13-208:/# cat /etc/default/grub | grep GRUB_DEFAULT
GRUB_DEFAULT="1>2"
```

grub 정보를 update 합니다.   
```bash
root@ip-172-31-13-208:/# update-grub
Sourcing file `/etc/default/grub'
Sourcing file `/etc/default/grub.d/40-force-partuuid.cfg'
Sourcing file `/etc/default/grub.d/50-cloudimg-settings.cfg'
Sourcing file `/etc/default/grub.d/init-select.cfg'
Generating grub configuration file ...
GRUB_FORCE_PARTUUID is set, will attempt initrdless boot
Found linux image: /boot/vmlinuz-5.15.0-1030-aws
Found initrd image: /boot/microcode.cpio /boot/initrd.img-5.15.0-1030-aws
Found linux image: /boot/vmlinuz-5.15.0-1028-aws
Found initrd image: /boot/microcode.cpio /boot/initrd.img-5.15.0-1028-aws
Found Ubuntu 20.04.5 LTS (20.04) on /dev/xvda1
done
```

아래 명령어를 이용하여 잘 적용이 되었는지 한번 더 확인 할 수 있습니다.   
```bash
root@ip-172-31-13-208:/# cat /boot/grub/grub.cfg | grep "set default" | grep -v next_entry
   set default="1>2"
```
   
이후 이슈 인스턴스의 Root Volume 을 분리합니다.
```bash
root@ip-172-31-13-208:/# exit
exit
ubuntu@ip-172-31-13-208:~$ sudo umount /mnt/rescue/dev
ubuntu@ip-172-31-13-208:~$ sudo umount /mnt/rescue/sys
ubuntu@ip-172-31-13-208:~$ sudo umount /mnt/rescue/proc
ubuntu@ip-172-31-13-208:~$ sudo umount /mnt/rescue
```
   
이슈 인스턴스의 Volume 을 다시 연겶하고 Boot 하여 Kernel 이 이전 kernel 로 Boot 되었는지 확인합니다.   
```bash
$ sudo uname -a
Linux ip-172-31-12-248 5.15.0-1028-aws #32~20.04.1-Ubuntu SMP Mon Jan 9 18:02:08 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux
```
   
# 참고 문서
* [https://help.ubuntu.com/community/Grub2/Installing](https://help.ubuntu.com/community/Grub2/Installing)   
* [https://aws.amazon.com/ko/premiumsupport/knowledge-center/revert-stable-kernel-ec2-reboot/](https://aws.amazon.com/ko/premiumsupport/knowledge-center/revert-stable-kernel-ec2-reboot/)   