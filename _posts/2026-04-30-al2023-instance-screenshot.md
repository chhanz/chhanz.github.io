---
layout: post
title: "[AWS] AL2023 인스턴스 스크린샷 기능 활성화"
description: "AL2023 스크린샷"
author: chhanz
date: 2026-04-30
tags: [aws, linux]
categories: [aws]
---

### 개요

EC2 인스턴스 운영 중 SSH 접속이 되지 않거나 상태 검사 가 실패 되는 경우, 인스턴스 내부 로그를 확인 할 수 없기 때문에 원인 파악이 쉽지 않습니다. 저의 경우 이런 상황 에서는 EC2 콘솔 `인스턴스 진단` 탭의 `인스턴스 스크린샷` 과 `시스템 로그` 기능을 통해 현재 콘솔 상태를 확인 하고 문제를 파악하는데 이 기능들은 온프레미스 VM과 달리 제한된 환경인 EC2 에서는 매우 도움이 되는 기능입니다.

그런데 Amazon Linux 2023 (이하 AL2023) 기본 AMI 에서 인스턴스 스크린샷 기능을 테스트 해 보았는데, 정상적으로 동작 하지 않는 현상을 확인 하였습니다. 이번 포스팅에서는 해당 현상과 해결 방법에 대해 기록 하도록 하겠습니다.

### 테스트 환경

- 테스트 환경: Amazon Linux 2023
- Kernel: 6.1.166-197.305.amzn2023.x86_64

### 현상

AL2023 기본 AMI 로 기동 한 인스턴스 의 스크린샷을 조회 해 보면, 아래와 같이 AWS 로고 와 `Booting 'Amazon Linux ...'` 메시지 이후 화면이 갱신되지 않는 것을 볼 수 있습니다. OS 는 정상적으로 부팅되어 로그인 까지 가능 한 상태 임에도, 스크린샷 상으로는 초기 부팅 화면에서 정지된 것 처럼 보입니다.

![AL2023 인스턴스 스크린샷 - 로고 화면에서 멈춤](/assets/images/post/2026-04-30-al2023-instance-screenshot/1.png)

이 문제는 AL2023 기본 AMI 에 가상 콘솔 관련 커널 모듈이 포함된 `kernel-modules-extra` 패키지 가 설치되어 있지 않아 발생 하는 현상 으로 확인 하였습니다.

### 해결 방법

아래와 같이 `kernel-modules-extra` 패키지를 설치 합니다.

```
[root@ip-172-31-15-154 ~]# dnf install kernel-modules-extra.x86_64
Last metadata expiration check: 0:00:14 ago on Thu Apr 30 02:01:59 2026.
Dependencies resolved.
================================================================================
 Package                         Arch    Version
================================================================================
Installing:
 kernel-modules-extra            x86_64  1:6.1.166-197.305.amzn2023
Installing dependencies:
 kernel-modules-extra-common     x86_64  1:6.1.166-197.305.amzn2023

Transaction Summary
================================================================================
Install  2 Packages
...생략
Running: dracut -f --kver 6.1.166-197.305.amzn2023.x86_64

Installed:
  kernel-modules-extra-1:6.1.166-197.305.amzn2023.x86_64
  kernel-modules-extra-common-1:6.1.166-197.305.amzn2023.x86_64

Complete!
```

![kernel-modules-extra 패키지 설치](/assets/images/post/2026-04-30-al2023-instance-screenshot/2.png)

설치 과정에서 `dracut` 을 통해 initramfs 가 재생성 되므로, 아래와 같이 인스턴스를 재부팅 합니다.

```
$ sudo reboot
```

### 결과 확인

재부팅 이후 인스턴스 스크린샷을 다시 조회 해 보면, 아래와 같이 로그인 프롬프트 까지 정상적으로 표시되는 것을 확인 할 수 있습니다.

![AL2023 인스턴스 스크린샷 - 로그인 프롬프트 표시](/assets/images/post/2026-04-30-al2023-instance-screenshot/3.png)

위와 같은 방법으로 AL2023 에서도 인스턴스 스크린샷 기능을 정상적으로 활용 할 수 있습니다. 사용자 지정 AMI 제작 시 해당 패키지를 포함 시켜 두면, 이후 기동 되는 인스턴스 들에서 바로 해당 기능을 활용 가능 합니다.

### 참고

- 공식 문서: [EC2 User Guide - Instance console output and screenshot](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-console.html)
