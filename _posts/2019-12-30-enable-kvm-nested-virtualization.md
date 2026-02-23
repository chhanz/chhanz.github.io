---
layout: post
title: "[Linux] KVM nested virtualization"
description: " "
author: chhanz
date: 2019-12-30
tags: [linux]
category: linux
---

# KVM nested virtualization
KVM nested virtualization 를 구성하여 VM CPU 가상화를 활성화 할 수 있습니다.   
이와 같이 구성 할 경우, 가상화 VM 내에서 한번더 가상화 구성이 가능합니다.   
   
## `kvm-intel` module 설정
아래와 같이 `kvm-intel` module parameter 를 추가합니다.   
```bash
[root@kvm ~]# cat /etc/modprobe.d/kvm-nested-module.conf
options kvm-intel nested=1                  
```
이후 시스템을 재부팅하고 KVM nested virtualization 구성이 되었는지 확인합니다.   
```bash
[root@kvm ~]# cat /sys/module/kvm_intel/parameters/nested
Y
```

## `kvm-intel` module 상세 확인
```bash
[root@kvm ~]# modinfo kvm-intel
filename:       /lib/modules/3.10.0-1062.4.3.el7.x86_64/kernel/arch/x86/kvm/kvm-intel.ko.xz
license:        GPL
author:         Qumranet
retpoline:      Y
rhelversion:    7.7
srcversion:     B7943A94D7B227C40ACD718
alias:          x86cpu:vendor:*:family:*:model:*:feature:*0085*
depends:        kvm
intree:         Y
vermagic:       3.10.0-1062.4.3.el7.x86_64 SMP mod_unload modversions
signer:         CentOS Linux kernel signing key
sig_key:        3F:59:AE:15:77:D5:87:23:18:4F:6D:BA:B1:8A:D5:F5:9D:E4:1D:39
sig_hashalgo:   sha256
parm:           vpid:bool
parm:           flexpriority:bool
parm:           ept:bool
parm:           unrestricted_guest:bool
parm:           eptad:bool
parm:           emulate_invalid_guest_state:bool
parm:           vmm_exclusive:bool
parm:           fasteoi:bool
parm:           enable_apicv:bool
parm:           enable_shadow_vmcs:bool
parm:           nested:bool
parm:           pml:bool
parm:           preemption_timer:bool
parm:           ple_gap:uint
parm:           ple_window:uint
parm:           ple_window_grow:uint
parm:           ple_window_shrink:uint
parm:           ple_window_max:uint
```
## VM 가상화 활성화
아래와 같이 `virt-manager` 에서 CPU 메뉴에서 `Copy Host CPU Configuration` 을 선택합니다.   
<center><img src="/assets/images/post/2019-12-30-kvm/image1.png" style="max-width: 95%; height: auto;"></center>   
   
이후 해당 VM 에서 가상화 활성화 여부를 확인합니다.   
<center><img src="/assets/images/post/2019-12-30-kvm/image2.png" style="max-width: 95%; height: auto;"></center>   

## 참고 문서
* [https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-nested_virt_setup](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-nested_virt_setup)   
* [https://docs.fedoraproject.org/en-US/quick-docs/using-nested-virtualization-in-kvm/](https://docs.fedoraproject.org/en-US/quick-docs/using-nested-virtualization-in-kvm/)   