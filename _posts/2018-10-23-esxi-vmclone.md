---
layout: post
title: "ESXi VM Clone Script"
description: " "
author: chhanz
date: 2018-10-23
tags: [VMware]
category: VMware
---

# ESXi - VM Clone Script
* * *

ESXi 는 VMware 에서 제공하는 Hypervisor 입니다.  
VMware 의 모든 가상화 기술을 이용하기 위해서는 vCenter 를 필수로 사용해야합니다.  
하지만 유료 라이센스라 제약 사항이 있습니다.(개인 사용자의 경우ㅠㅠ)   

제일 많이 사용되고 필요로 하는 기능중 하나가 바로 VM Clone 을 하는 기능입니다.   
vCenter 가 없이 ESXi 에서 VM Clone 을 하는 방법을 알아봅시다.   

# Test 환경
* * *
VMware ESXi-6.7.0-8169922-standard (VMware, Inc.)    

# ESXi ssh enable
* * *

<img src="/assets/images/post/2018-10-23-vmclone/0.png" height="220" border="1">

위와 같이 ESXi 에서 [작업] > [서비스] > [SSH 사용] 을 선택하여 ssh 를 활성화합니다.   

# VM Clone Script 추가
* * *
추가 할 Script 의 내용은 아래와 같습니다.

```
#!/bin/sh
if [ $# -ne 2 ];then
        echo "USAGE: $0 SRC_DIR DEST_DIR";
        exit;
fi;
## remove /
SRC=`basename "$1" /`
DEST=`basename "$2" /`
if [ ! -d "$SRC" ];then
        echo "Source Dir \"$SRC\" is not exist. Exit....";
        exit;
fi
if [ -d "$DEST" ];then
        echo "Dest Dir \"$DEST\" is already exist. Exit....";
        exit;
fi
echo "Soruce VM : $SRC"
echo "Target VM : $DEST"
mkdir "$DEST"
vmkfstools -d thin -i "${SRC}/${SRC}".vmdk "${DEST}/${DEST}".vmdk
sed "s/${SRC}/${DEST}/g" < "${SRC}/${SRC}".vmx > "${DEST}/${DEST}".vmx
sed "s/${SRC}/${DEST}/g" < "${SRC}/${SRC}".vmxf > "${DEST}/${DEST}".vmxf

echo "Done!";
```

위 Script 는 다른 분이 제작한 Script 에서 vmdk 속성 변경 및 진행 과정 출력 부분을 수정하였습니다.   
(thin 옵션 추가)   

## Script 추가
Script 를 추가하기 위해 ESXi 를 ssh 로 접속하고 아래 절차를 수행합니다.   

~~~
# vi /bin/vm-copy.sh
# chmod 755 /bin/vm-copy.sh
# ls -la /bin/vm-copy.sh
-rwxr-xr-x    1 root     root           640 Oct 23 07:32 /bin/vm-copy.sh
~~~

# VM Clone
* * *
VM Clone 을 하기 위해 Clone 할 VM 이 위치한 datastore 경로에 접근합니다.   
이후 vm-copy.sh 명령을 수행합니다.   
(VM Clone 을 위해서는 Source VM 이 Shutdown 상태에서 만 가능합니다.)    

```
# vm-copy.sh ./centos7.5_temp/ ./clone-test
Destination disk format: VMFS thin-provisioned
Cloning disk 'centos7.5_temp/centos7.5_temp.vmdk'...
Clone: 100% done.
/bin/vm-copy.sh: line 22: can't open centos7.5_temp/centos7.5_temp.vmxf: no such file
Done!
```

위와 같이 Clone 이 완료 된 것을 확인 할 수 있습니다.   

# VM 등록
* * *

ESXi 에서 [가상 시스템] > [VM 생성/등록] 메뉴를 선택합니다.   

<img src="/assets/images/post/2018-10-23-vmclone/1.png" height="400" border="1">

- [기존 가상 시스템 등록]을 선택합니다.   

<img src="/assets/images/post/2018-10-23-vmclone/2.png" height="200" border="1">

- 복제한 VM 의 데이터스토어 경로를 선택합니다.   

<img src="/assets/images/post/2018-10-23-vmclone/3.png" height="400" border="1">

- 등록할 VM 을 확인 후 다음을 선택합니다.   

<img src="/assets/images/post/2018-10-23-vmclone/4.png" height="400" border="1">

- 등록할 준비가 되었습니다. 완료를 선택합니다.   

<img src="/assets/images/post/2018-10-23-vmclone/5.png" height="150" border="1">

- 위와 같이 복제된 VM 이 정상 적으로 등록 된 것을 볼 수 있습니다.   

<img src="/assets/images/post/2018-10-23-vmclone/6.png" height="400" border="1">

- 해당 VM 을 [전원 켜기] 를 진행하면 위와 같은 질의가 나옵니다. [복사함] 을 선택하면 해당 VM 이 정상적으로 부팅 될 것입니다.   


# 참고 자료
* * *
Script 참조 : [@Go Document](https://www.lesstif.com/plugins/viewsource/viewpagesrc.action?pageId=12943617)

