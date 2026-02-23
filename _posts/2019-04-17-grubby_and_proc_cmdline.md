---
layout: post
title: "[Linux] grubby 사용법"
description: " "
author: chhanz
date: 2019-04-17
tags: [linux]
category: linux
---

# GRUBBY COMMAND 활용
---
 `grubby` 라는 명령을 통해 GRUB2 부트로더를 손쉽게 수정 할 수 있습니다.
   
## grubby --help
---
~~~sh
[root@fastvm-centos-7-6-21 ~]# grubby --help
Usage: grubby [OPTION...]
  --add-kernel=kernel-path            add an entry for the specified kernel
  --add-multiboot=STRING              add an entry for the specified multiboot
                                      kernel
  --args=args                         default arguments for the new kernel or
                                      new arguments for kernel being updated
  --mbargs=STRING                     default arguments for the new multiboot
                                      kernel or new arguments for multiboot
                                      kernel being updated
  --bad-image-okay                    don`t sanity check images in boot
                                      entries (for testing only)
  --boot-filesystem=bootfs            filesystem which contains /boot
                                      directory (for testing only)
  --bootloader-probe                  check which bootloader is installed on
                                      boot sector
  -c, --config-file=path              path to grub config file to update ("-"
                                      for stdin)
  --copy-default                      use the default boot entry as a template
                                      for the new entry being added; if the
                                      default is not a linux image, or if the
                                      kernel referenced by the default image
                                      does not exist, the first linux entry
                                      whose kernel does exist is used as the
                                      template
  --debug                             print debugging information for failures
  --default-kernel                    display the path of the default kernel
  --default-index                     display the index of the default kernel
  --default-title                     display the title of the default kernel
  --elilo                             configure elilo bootloader
  --efi                               force grub2 stanzas to use efi
  --env=path                          path for environment data
  --extlinux                          configure extlinux bootloader (from
                                      syslinux)
  --grub                              configure grub bootloader
  --grub2                             configure grub2 bootloader
  --info=kernel-path                  display boot information for specified
                                      kernel
  --initrd=initrd-path                initrd image for the new kernel
  -i, --extra-initrd=initrd-path      auxiliary initrd image for things other
                                      than the new kernel
  --lilo                              configure lilo bootloader
  --make-default                      make the newly added entry the default
                                      boot entry
  -o, --output-file=path              path to output updated config file ("-"
                                      for stdout)
  --remove-args=STRING                remove kernel arguments
  --remove-mbargs=STRING              remove multiboot kernel arguments
  --remove-kernel=kernel-path         remove all entries for the specified
                                      kernel
  --remove-multiboot=STRING           remove all entries for the specified
                                      multiboot kernel
  --set-default=kernel-path           make the first entry referencing the
                                      specified kernel the default
  --set-default-index=entry-index     make the given entry index the default
                                      entry
  --set-index=entry-index             use the given index when creating a new
                                      entry
  --silo                              configure silo bootloader
  --title=entry-title                 title to use for the new kernel entry
  --update-kernel=kernel-path         updated information for the specified
                                      kernel
  -v, --version                       print the version of this program and
                                      exit
  --yaboot                            configure yaboot bootloader
  --zipl                              configure zipl bootloader

Help options:
  -?, --help                          Show this help message
  --usage                             Display brief usage message
~~~


## grubby 를 이용해서 현재 부트로더 설정 확인
---
~~~sh
# 파라미터 확인

[root@fastvm-centos-7-6-21 ~]# grubby --info=ALL
index=0
kernel=/boot/vmlinuz-3.10.0-957.el7.x86_64
args="ro crashkernel=128M rd.lvm.lv=c7vg/root_lv rd.lvm.lv=c7vg/swap_lv console=ttyS0,115200n8 LANG=en_US.UTF-8"
root=/dev/mapper/c7vg-root_lv
initrd=/boot/initramfs-3.10.0-957.el7.x86_64.img
title=CentOS Linux (3.10.0-957.el7.x86_64) 7 (Core)
index=1
kernel=/boot/vmlinuz-0-rescue-59c8a0b7323f456ab9d1194e09abca71
args="ro crashkernel=128M rd.lvm.lv=c7vg/root_lv rd.lvm.lv=c7vg/swap_lv console=ttyS0,115200n8"
root=/dev/mapper/c7vg-root_lv
initrd=/boot/initramfs-0-rescue-59c8a0b7323f456ab9d1194e09abca71.img
title=CentOS Linux (0-rescue-59c8a0b7323f456ab9d1194e09abca71) 7 (Core)
index=2
non linux entry
~~~
   
## grubby 를 이용해서 부트로더에 파라미터 추가
---
~~~sh
# 파라미터 추가

[root@fastvm-centos-7-6-21 ~]# grubby --update-kernel=ALL --args="spectre_v2=off nopti"

# 추가된 내용 확인

[root@fastvm-centos-7-6-21 ~]# grubby --info=ALL
index=0
kernel=/boot/vmlinuz-3.10.0-957.el7.x86_64
args="ro crashkernel=128M rd.lvm.lv=c7vg/root_lv rd.lvm.lv=c7vg/swap_lv console=ttyS0,115200n8 LANG=en_US.UTF-8 spectre_v2=off nopti"
root=/dev/mapper/c7vg-root_lv
initrd=/boot/initramfs-3.10.0-957.el7.x86_64.img
title=CentOS Linux (3.10.0-957.el7.x86_64) 7 (Core)
index=1
kernel=/boot/vmlinuz-0-rescue-59c8a0b7323f456ab9d1194e09abca71
args="ro crashkernel=128M rd.lvm.lv=c7vg/root_lv rd.lvm.lv=c7vg/swap_lv console=ttyS0,115200n8 spectre_v2=off nopti"
root=/dev/mapper/c7vg-root_lv
initrd=/boot/initramfs-0-rescue-59c8a0b7323f456ab9d1194e09abca71.img
title=CentOS Linux (0-rescue-59c8a0b7323f456ab9d1194e09abca71) 7 (Core)
index=2
non linux entry
[root@fastvm-centos-7-6-21 ~]#
~~~   

## grubby 를 이용해서 부트로더의 파라미터 삭제
---
~~~sh
# 파라미터 제거

[root@fastvm-centos-7-6-21 ~]# grubby --update-kernel=ALL --remove-args="spectre_v2=off nopti"

# 제거된 내용 확인

[root@fastvm-centos-7-6-21 ~]# grubby --info=ALL
index=0
kernel=/boot/vmlinuz-3.10.0-957.el7.x86_64
args="ro crashkernel=128M rd.lvm.lv=c7vg/root_lv rd.lvm.lv=c7vg/swap_lv console=ttyS0,115200n8 LANG=en_US.UTF-8"
root=/dev/mapper/c7vg-root_lv
initrd=/boot/initramfs-3.10.0-957.el7.x86_64.img
title=CentOS Linux (3.10.0-957.el7.x86_64) 7 (Core)
index=1
kernel=/boot/vmlinuz-0-rescue-59c8a0b7323f456ab9d1194e09abca71
args="ro crashkernel=128M rd.lvm.lv=c7vg/root_lv rd.lvm.lv=c7vg/swap_lv console=ttyS0,115200n8"
root=/dev/mapper/c7vg-root_lv
initrd=/boot/initramfs-0-rescue-59c8a0b7323f456ab9d1194e09abca71.img
title=CentOS Linux (0-rescue-59c8a0b7323f456ab9d1194e09abca71) 7 (Core)
index=2
non linux entry
[root@fastvm-centos-7-6-21 ~]#
~~~   

***상기 `--update-kernel=` 에 특정 커널을 지정하여 특정 커널에만 부트로더 파라미터를 적용 할 수 있다.***   

## cat /proc/cmdline
---
grubby 외에도 현재 부팅된 부트로더 파라미터를 확인 하는 방법이 있습니다.   
확인 방법은 아래와 같습니다.   
~~~sh
[root@fastvm-centos-7-6-21 ~]# cat /proc/cmdline
BOOT_IMAGE=/vmlinuz-3.10.0-957.el7.x86_64 root=/dev/mapper/c7vg-root_lv ro crashkernel=128M rd.lvm.lv=c7vg/root_lv rd.lvm.lv=c7vg/swap_lv console=ttyS0,115200n8 LANG=en_US.UTF-8 spectre_v2=off nopti
~~~   

# 참고 자료
---
- [https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/6/html/deployment_guide/s2-proc-cmdline](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/6/html/deployment_guide/s2-proc-cmdline)