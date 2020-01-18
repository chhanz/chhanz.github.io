---
layout: post
title: "[RHV] Red Hat Virtualization Host 설치"
description: " "
author: chhanz
date: 2020-01-03
tags: [linux, RHV]
category: RHV
---

# 목차
+ [Red Hat Virtualization Host 설치](/rhv/2020/01/03/install-rhvh/)   
+ [Red Hat Virtualization Standalone Manager 설치](/rhv/2020/01/17/install-rhvm/)   
+ [Red Hat Virtualization Host 추가 및 VM 생성](/rhv/2020/01/18/install-rhvm-admin/)   

# Red Hat Virtualization Host 란?
RHVH (Red Hat Virtualization Host)는 Red Hat Enterprise Linux 기반의 최소 운영 체제이며 Red Hat Virtualization 환경에서 하이퍼바이저 역할을 하는 물리적 시스템을 간단하게 설정할 수 있도록 설계되었습니다.   
참고 자료 : [RHV Document](https://access.redhat.com/documentation/ko-kr/red_hat_virtualization/4.1/html/installation_guide/red_hat_virtualization_hosts)   
   
## RHVH 설치
준비된 `RHVH 4.1` DVD 이미지를 통해 부팅을 합니다.   
<center><img src="/assets/images/post/2020-01-03-rhvh/1.png" style="max-width: 95%; height: auto;"></center>   
   
언어를 선택합니다.   
<center><img src="/assets/images/post/2020-01-03-rhvh/2.png" style="max-width: 95%; height: auto;"></center>   
   
아래 화면은 RHVH 설치 화면입니다.   
기본적으로 `DATE & TIME`, `KEYBOARD`, `INSTALLATION DESTNITION` 을 설정합니다.   
<center><img src="/assets/images/post/2020-01-03-rhvh/3.png" style="max-width: 95%; height: auto;"></center>   
   
`DATE & TIME` 을 설정합니다.   
<center><img src="/assets/images/post/2020-01-03-rhvh/4.png" style="max-width: 95%; height: auto;"></center>   
   
`KEYBOARD` 를 설정합니다.   
<center><img src="/assets/images/post/2020-01-03-rhvh/5.png" style="max-width: 95%; height: auto;"></center>   
   
`INSTALLATION DESTNITION` 를 설정합니다.   
<center><img src="/assets/images/post/2020-01-03-rhvh/6.png" style="max-width: 95%; height: auto;"></center>   
   
필요에 따라 `Network 및 Hostname` 설정을 합니다.   
<center><img src="/assets/images/post/2020-01-03-rhvh/7.png" style="max-width: 95%; height: auto;"></center>   
   
설치 준비가 완료되면 설치를 시작합니다.   
<center><img src="/assets/images/post/2020-01-03-rhvh/8.png" style="max-width: 95%; height: auto;"></center>   
   
`root`패스워드를 설정합니다.   
<center><img src="/assets/images/post/2020-01-03-rhvh/9.png" style="max-width: 95%; height: auto;"></center>   
   
설치가 완료되면 재부팅을 합니다.   
<center><img src="/assets/images/post/2020-01-03-rhvh/10.png" style="max-width: 95%; height: auto;"></center>   
   
RHVH 가 부팅이 완료되면 `nodectl check` 라는 명령을 통해 시스템 상태 확인이 가능합니다.   
<center><img src="/assets/images/post/2020-01-03-rhvh/11.png" style="max-width: 95%; height: auto;"></center>   
   
## 참고문서
* [https://access.redhat.com/documentation/ko-kr/red_hat_virtualization/4.1/html/installation_guide/red_hat_virtualization_hosts](https://access.redhat.com/documentation/ko-kr/red_hat_virtualization/4.1/html/installation_guide/red_hat_virtualization_hosts)   