---
layout: post
title: "[RHV] Red Hat Virtualization Host 추가 및 VM 생성"
description: " "
author: chhanz
date: 2020-01-18
tags: [linux, RHV]
category: RHV
---

# 목차
+ [Red Hat Virtualization Host 설치](/rhv/2020/01/03/install-rhvh/)   
+ [Red Hat Virtualization Standalone Manager 설치](/rhv/2020/01/17/install-rhvm/)   
+ [Red Hat Virtualization Host 추가 및 VM 생성](/rhv/2020/01/18/install-rhvm-admin/)   
   
# Red Hat Virtualization Host 추가
[이전 포스트](/rhv/2020/01/17/install-rhvm/)에서는 `RHVM` 을 설치하였습니다.   
[첫번째 포스트](/rhv/2020/01/03/install-rhvh/)에서 설치한 `RHVH` 를 `RHVM` 에 연결하여 `Manager` 에서 `Hypervisor` 를 관리 할 수 있도록 하겠습니다.   
   
## `RHVH` 호스트 추가
<img src="/assets/images/post/2020-01-18-rhvm-admin/1.png" style="max-width: 95%; height: auto;">   
`RHVM` 관리 포탈에서 호스트 탭을 선택합니다. 그리고 `새로 만들기`를 선택합니다.   
   
<br>
<img src="/assets/images/post/2020-01-18-rhvm-admin/2.png" style="max-width: 95%; height: auto;">   
`RHVH` 의 주소 정보 및 SSH 접속 정보를 입력합니다.   
   
<br>
<img src="/assets/images/post/2020-01-18-rhvm-admin/3.png" style="max-width: 95%; height: auto;">   
연결이 되면 `호스트`를 관리하기 위한 설치를 자동으로 진행합니다.   
   
<br>
<img src="/assets/images/post/2020-01-18-rhvm-admin/4.png" style="max-width: 95%; height: auto;">   
설치가 완료되면 위와 같이 실행중으로 표기 됩니다.   
   
## `Storage Domain` 추가
<img src="/assets/images/post/2020-01-18-rhvm-admin/5.png" style="max-width: 95%; height: auto;">   
VMware 에서 Datastore 를 추가하듯 `RHV` 에서는 `Storage Domain` 을 추가해야 됩니다.   
`스토리지` 탭을 선택하고, `새로운 도메인` 을 선택합니다.   
   
<br>
<img src="/assets/images/post/2020-01-18-rhvm-admin/6.png" style="max-width: 95%; height: auto;">   
`DATA` 영역으로 사용할 `DATA Domain` 을 추가합니다.   
위와 같이 `Storage Domain` 정보를 입력합니다.   
   
<br>
<img src="/assets/images/post/2020-01-18-rhvm-admin/7.png" style="max-width: 95%; height: auto;">   
`RHV` 에서는 `ISO` 이미지 관리를 위한 `ISO Domain` 을 생성해야 됩니다.   
위와 같이 `ISO` 영역으로 사용할 `ISO Domain` 을 추가합니다.   
   
<br>
<img src="/assets/images/post/2020-01-18-rhvm-admin/8.png" style="max-width: 95%; height: auto;">   
위와 같이 `Storage Domain` 생성이 된 것을 확인 할 수 있습니다.   
   
## `RHV` 상태 확인
<img src="/assets/images/post/2020-01-18-rhvm-admin/9.png" style="max-width: 95%; height: auto;">   
`Storage Domain` 까지 추가가 되면 위와 같이 `클러스터` 가 사용 가능합니다.   
   
## VM 생성
<img src="/assets/images/post/2020-01-18-rhvm-admin/10.png" style="max-width: 95%; height: auto;">   
새로운 VM 생성을 위해 `가상 머신` 탭에서 `새 가상 머신` 을 선택합니다.   
   
<br>
<img src="/assets/images/post/2020-01-18-rhvm-admin/11.png" style="max-width: 95%; height: auto;">   
VM 이름 입력, `DISK` 생성, `Network` 설정을 진행하고 VM을 생성합니다.   
   
<br>
<img src="/assets/images/post/2020-01-18-rhvm-admin/12.png" style="max-width: 95%; height: auto;">   
VM 생성이 완료되면, `한번 실행` 을 선택합니다.   
`한번 실행`은 DVD 부팅을 위해 선택하는 것입니다.   
   
<br>
<img src="/assets/images/post/2020-01-18-rhvm-admin/13.png" style="max-width: 95%; height: auto;">   
CD 를 추가하고, 설치에 사용 될 이미지를 선택합니다. 그리고 `CD-ROM` 의 부팅 순서를 `First Boot device` 로 설정합니다.   
   
<br>
<img src="/assets/images/post/2020-01-18-rhvm-admin/14.png" style="max-width: 95%; height: auto;">   
메뉴상의 `콘솔` 을 선택하면 위와 같은 콘솔창을 통해 VM 설치를 진행 할 수 있습니다.   
> `RHV`의 콘솔은   
> `Windows` 의 경우, [`virt-viewer-windows-version`](https://virt-manager.org/download/) 설치가 필요합니다.   
> `Linux` 의 경우, `virt-viewer` 패키지 설치가 필요합니다.   
> `Mac` 의 경우, `remote-viewer` 패키지 설치가 필요하며,   
> 상세 가이드는 [https://rizvir.com/articles/ovirt-mac-console/](https://rizvir.com/articles/ovirt-mac-console/) 참조하면 편하게 설정 가능합니다.   
   
<img src="/assets/images/post/2020-01-18-rhvm-admin/15.png" style="max-width: 95%; height: auto;">   
<img src="/assets/images/post/2020-01-18-rhvm-admin/16.png" style="max-width: 95%; height: auto;">   
위와 같이 VM 설치가 된 것을 확인 할 수 있습니다.   
   
# 참고 문서
* [https://access.redhat.com/documentation/ko-kr/red_hat_virtualization/4.1/html/installation_guide/index](https://access.redhat.com/documentation/ko-kr/red_hat_virtualization/4.1/html/installation_guide/index)   
* [https://virt-manager.org/download/](https://virt-manager.org/download/)   
* [https://rizvir.com/articles/ovirt-mac-console/](https://rizvir.com/articles/ovirt-mac-console/)   