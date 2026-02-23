---
layout: post
title: "[Ubuntu] Ubuntu 18.04 LTS Enable ESM" 
description: ""
author: chhanz
date: 2023-06-12
tags: [linux, aws]
category: linux
---

# ESM 이란?
ESM(Extended security maintenance)는 Ubuntu LTS 릴리즈의 보안 유지관리의 범위 및 기간을 기본 5년 지원에 추가로 5년 확장 지원하는 서비스 팩입니다.   
   
# Ubuntu 18.04 EOL
Ubuntu 18.04 LTS(Bionic)는 2023년 5월 31일부로 지원 종료로 인해 ESM 활성화를 해야 최신 보안 패치 유지가 가능합니다.   
   
# ESM 활성화 - 개인 사용자
[Ubuntu One](https://login.ubuntu.com/) 에 가입을 하면 개인 사용자의 경우, 최대 5대 활성화가 가능한 ESM 토큰을 발급 받습니다.   
   
<center><img src="/assets/images/post/2023-06-12-ubuntu-pro/pro-1.png" style="max-width: 95%; height: auto;"></center>   
   
위와 같이 사전에 생성되어 있는 명령어를 이용하여 Ubuntu 운영체제에 입력합니다.   
   
## (optional) `pro` 명령어 설치
`pro` 명령이 없는 경우, 아래 명령을 이용하여 패키지를 설치합니다.   
```bash
$ sudo apt install ubuntu-advantage-tools
```
   
## 토큰 연결
아래와 같이 ESM 을 활성화 합니다.   
명령어 : `sudo pro attach <token-id>`    
   
```bash
$ sudo pro attach <token-id>
Enabling default service esm-apps
Updating package lists
Ubuntu Pro: ESM Apps enabled
Enabling default service esm-infra
Updating package lists
Ubuntu Pro: ESM Infra enabled
Enabling default service livepatch
Installing canonical-livepatch snap
Canonical livepatch enabled.
This machine is now attached to 'Ubuntu Pro - free personal subscription'

SERVICE          ENTITLED  STATUS    DESCRIPTION
cc-eal           yes       disabled  Common Criteria EAL2 Provisioning Packages
cis              yes       disabled  Security compliance and audit tools
esm-apps         yes       enabled   Expanded Security Maintenance for Applications
esm-infra        yes       enabled   Expanded Security Maintenance for Infrastructure
fips             yes       disabled  NIST-certified core packages
fips-updates     yes       disabled  NIST-certified core packages with priority security updates
livepatch        yes       enabled   Canonical Livepatch service
ros              yes       disabled  Security Updates for the Robot Operating System
ros-updates      yes       disabled  All Updates for the Robot Operating System

NOTICES
Operation in progress: pro attach

Enable services with: pro enable <service>

     Account: chhanz@chhanz.testdom
Subscription: Ubuntu Pro - free personal subscription
```
   
연결이 완료 되면 아래 명령어 (`pro status`) 를 통해 ESM 활성화 상태를 확인 할 수 있습니다.   
```bash
$ pro status
SERVICE          ENTITLED  STATUS    DESCRIPTION
cc-eal           yes       disabled  Common Criteria EAL2 Provisioning Packages
cis              yes       disabled  Security compliance and audit tools
esm-apps         yes       enabled   Expanded Security Maintenance for Applications
esm-infra        yes       enabled   Expanded Security Maintenance for Infrastructure
fips             yes       disabled  NIST-certified core packages
fips-updates     yes       disabled  NIST-certified core packages with priority security updates
livepatch        yes       enabled   Canonical Livepatch service
ros              yes       disabled  Security Updates for the Robot Operating System
ros-updates      yes       disabled  All Updates for the Robot Operating System

Enable services with: pro enable <service>

     Account: chhanz@chhanz.testdom
Subscription: Ubuntu Pro - free personal subscription    <<<
```   
   
# Cloud 에서 Ubuntu Pro 를 사용한다면?
현재 Cloud Provider 인 [`AWS / Azure / GCP`](https://ubuntu.com/pro) 에서 Ubuntu Pro 18.04 를 사용 할 수 있습니다.   
한가지 예로 AWS 에서 Ubuntu Pro 를 사용하면 어떤 식으로 ESM 가 활성화 되는지 보도록 하겠습니다.   
   
## Ubuntu Pro for AWS
Ubuntu Pro AMI 를 이용하여 인스턴스를 생성하면 아래와 같이 사전에 ESM 이 활성화가 된 상태로 생성이 됩니다.   
```bash
$ pro status
SERVICE          ENTITLED  STATUS    DESCRIPTION
cc-eal           yes       disabled  Common Criteria EAL2 Provisioning Packages
cis              yes       disabled  Security compliance and audit tools
esm-apps         yes       enabled   Expanded Security Maintenance for Applications
esm-infra        yes       enabled   Expanded Security Maintenance for Infrastructure
fips             yes       disabled  NIST-certified core packages
fips-updates     yes       disabled  NIST-certified core packages with priority security updates
livepatch        yes       enabled   Canonical Livepatch service

Enable services with: pro enable <service>

                Account: 123456789012
           Subscription: 123456789012
            Valid until: Fri Dec 31 00:00:00 9999 UTC
Technical support level: essential
```
   
AWS 문서[(https://aws.amazon.com/ko/about-aws/whats-new/2023/04/amazon-ec2-ubuntu-pro-subscription-model/)](https://aws.amazon.com/ko/about-aws/whats-new/2023/04/amazon-ec2-ubuntu-pro-subscription-model/) 를 참고하면 Ubuntu Pro 는 온디멘드 형식으로 사용한 만큼 요금이 과금되는 것으로 안내하고 있습니다.   
   
위와 같이 Cloud 에서 Ubuntu Pro 를 사용하면 따로 토큰 활성화 과정없이 ESM 이 사용 가능합니다.   
   
# CVE 보안 취약점 점검
`pro` 명령어를 사용하면 시스템에 특정 CVE 이 취약한지 점검이 가능합니다.   
```bash
$ pro fix CVE-2021-32628
CVE-2021-32628: Redis vulnerabilities
 - https://ubuntu.com/security/CVE-2021-32628

No affected source packages are installed.

✔ CVE-2021-32628 does not affect your system.
```
   
## 취약점 검토 및 조치 테스트
[시나리오] 보안팀으로 `CVE-2023-0459` 에 대하여 시스템에 취약한 부분이 있는지 검토하고 조치를 권고 받았습니다.   

### 취약점 검토
아래와 같이 `pro fix <CVE-code>` 를 이용하여 취약점 검토를 수행합니다.   
```bash
$ pro fix CVE-2023-0459
CVE-2023-0459: Linux kernel (Intel IoTG) vulnerabilities
 - https://ubuntu.com/security/CVE-2023-0459

1 affected source package is installed: linux-aws-5.4
Error: CVE-2023-0459 metadata defines no fixed version for linux-aws-5.4-headers-5.4.0-1097.
1 package is still affected: linux-aws-5.4
✘ CVE-2023-0459 is not resolved.
```
취약점 : [https://ubuntu.com/security/CVE-2023-0459](https://ubuntu.com/security/CVE-2023-0459)   
조치 버전 : focal - Released (5.4.0-1102.110)   

### 취약점 조치
아래와 같이 최신 버전의 커널로 업그레이드를 수행하고 이전 커널 버전을 제거합니다.   
```bash
$ uname -a
Linux ip-172-31-50-52 5.4.0-1097-aws #105~18.04.1-Ubuntu SMP Mon Feb 13 17:50:57 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux

$ sudo apt install linux-image-aws
$ sudo reboot

## remove old kernel
$ sudo apt remove linux-aws-5.4-headers-5.4.0-1097 
$ sudo apt remove linux-modules-5.4.0-1097-aws

$ pro fix CVE-2023-0459
CVE-2023-0459: Linux kernel (Intel IoTG) vulnerabilities
 - https://ubuntu.com/security/CVE-2023-0459

1 affected source package is installed: linux-aws-5.4
(1/1) linux-aws-5.4:
A fix is available in Ubuntu standard updates.
The update is already installed.

✔ CVE-2023-0459 is resolved.
```
특정 CVE 에 대한 조치가 완료 된 것을 확인 할 수 있습니다.   
   
# 참고 자료
+ [https://ubuntu.com/pro/tutorial](https://ubuntu.com/pro/tutorial)   
+ [https://canonical.com/blog/18-04-end-of-standard-support-kr](https://canonical.com/blog/18-04-end-of-standard-support-kr)   