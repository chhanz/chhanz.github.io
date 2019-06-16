---
layout: post
title: "[VMware] Linux SCSI ID 확인 방법"
description: " "
author: chhanz
date: 2019-06-16
tags: [VMware,linux]
category: VMware
---

# VMware ESXi에서 Linux SCSI ID 확인 방법
* * *
VMware ESXi 상에서 운영중인 Linux 의 경우, 아래와 같이 DISK 의 SCSI ID 가 확인이 불가능합니다.   
GuestOS 의 DISK 를 다른 GuestOS 로 이관을 하거나, GuestOS 의 VMX 를 재생성 하였을때, VMDK 의 순서가 확인이 안될 경우...   
이러한 경우로 인해 명확하게 어떤 VMDK 가 실제로 운영체제에서 어떤 DISK 로 사용 되었는지 확인이 필요합니다.   
   
실제로 VMware 시스템에서는 아래와 같이 SCSI ID 가 확인이 기본적으로 안됩니다.   
   
<center><img src="/assets/images/post/2019-06-16-vmware-scsi-id-check/no_config.png" style="max-width: 100%; height: auto;"></center>   
   
이처럼 SCSI ID 가 확인이 불가능합니다.   
   
## VMware ESXi 설정 변경
* * *
ESXi 에서 GuestOS를 수정합니다.( 해당 설정을 변경하기 위해 GuestOS 는 중지해야합니다.)   
**[VM 선택]** - **[작업]** - **[설정 편집]** - **[VM 옵션]** - **[고급]** - **[구성 매개 변수]** - **[구성 편집]** 을 선택합니다.   
   
<center><img src="/assets/images/post/2019-06-16-vmware-scsi-id-check/mod_vmx.png" style="max-width: 100%; height: auto;"></center>   
   
위와 같이 `disk.enableuuid=true` 항목을 추가합니다.   
    
## 설정 확인
* * *
VM 설정을 하면 아래와 같이 SCSI ID를 정상적으로 확인 할 수 있습니다.   
   
<center><img src="/assets/images/post/2019-06-16-vmware-scsi-id-check/result_config.png" style="max-width: 100%; height: auto;"></center>   
   
## 참고 자료
* * *
- [https://blogs.vmware.com/kb/2013/03/setting-disk-enableuuidtrue-in-vmware-data-protection.html](https://blogs.vmware.com/kb/2013/03/setting-disk-enableuuidtrue-in-vmware-data-protection.html)   
