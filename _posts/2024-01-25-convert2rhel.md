---
layout: post
title: "[Linux] convert2rhel 사용법"
description: "CentOS7 > RHEL 7 로 변환하는 법"
author: chhanz
date: 2024-01-25
tags: [linux]
category: linux
---

# 개요
2020년 CentOS 운영체제에 대한 정책 변경으로 인해 사용자들은 대체 운영체제인 Rocky Linux, Alma Linux 등 기타 운영체제로 변경하는 경우들도 많았습니다.   
그리고 얼마 후면 CentOS 7 의 [EOS](https://endoflife.software/operating-systems/linux/centos) 인 2024년 06월 30일가 됩니다.   
   
위와 같이 이유로 인해 `convert2rhel` 를 이용하면 CentOS 에서 RHEL 로 변경하고 ELS 와 같은 계약을 통해 EOS 기간을 늘리면서 다른 배포판으로 전환하는 기간을 확보 혹은 RHEL 로 전환 등 여러 방향으로 사용이 가능할 것으로 보여서 아래와 같이 운영체제를 CentOS 에서 RHEL 로 변환하는 테스트를 진행해 보았습니다.   
   
# 테스트 환경
+ CentOS 7 on AWS (서울 리전 : ami-09e2a570cb404b37e)   
   
# convert2rhel 사용법

```bash
[root@ip-172-31-32-212 ~]# cat /etc/redhat-release
CentOS Linux release 7.9.2009 (Core)
```
위와 같이 CentOS 7.9 운영체제를 테스트에 활용하도록 하겠습니다.   
   
```bash
[root@ip-172-31-32-212 ~]# curl -o /etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release https://www.redhat.com/security/data/fd431d51.txt
[root@ip-172-31-32-212 ~]# curl --create-dirs -o /etc/rhsm/ca/redhat-uep.pem https://ftp.redhat.com/redhat/convert2rhel/redhat-uep.pem
```
RHEL 레포지토리를 사용하기 위해서 key 를 추가합니다.   
   
```bash
[root@ip-172-31-32-212 ~]# curl -o /etc/yum.repos.d/convert2rhel.repo https://ftp.redhat.com/redhat/convert2rhel/7/convert2rhel.repo
```
RHEL `convert2rhel` 레포지토리를 추가합니다.   
   
```bash
[root@ip-172-31-32-212 ~]# yum update -y && reboot
```
RHEL 7 으로 변환하기 위해서는 최신버전의 패키지와 커널이 필요하므로 운영체제를 업데이트를 진행합니다.   
   
```bash
[root@ip-172-31-32-212 ~]# yum install -y convert2rhel 
```
위와 같이 `convert2rhel` 패키지를 설치합니다.  
   
다음 단계를 가기 전에 [Red Hat Customer Portal - Activation Keys](https://access.redhat.com/management/activation_keys) 에서 Organization ID 를 확인하고 Activation Key 를 생성합니다.   
그리고 생성한 Activation Key 에 Subscription 을 추가합니다.   
   
위 단계에서 확인한 값을 옵션으로 추가하고 RHEL 7으로 운영체제를 변환을 시작합니다.   
```bash
[root@ip-172-31-32-212 ~]# convert2rhel --org [org id] --activationkey [key] -y 
```

```bash
...
[2024-01-25T13:35:54+0000] TASK - [Final: Update RHSM custom facts] **********************************
Updating RHSM custom facts collected during the conversion.
RHSM custom facts uploaded successfully.

Conversion successful!

WARNING - In order to boot the RHEL kernel, restart of the system is needed.
[root@ip-172-31-32-212 ~]# reboot
...

"재부팅 이후" ********************************************************************
[root@ip-172-31-32-212 ~]# cat /etc/redhat-release
Red Hat Enterprise Linux Server release 7.9 (Maipo)
```
위와 같이 CentOS 7 에서 RHEL 7 로 변환이 완료 되었습니다.   
   
참고로 `convert2rhel` 은 CentOS 뿐만아니라 Oracle Linux, Alma Linux, Rocky Linux 도 지원하니 참고하면 좋을 것 같습니다.   

# 테스트간 발생된 이슈 관련
사용하는 운영체제의 패키지, 커널이 최신 버전으로 패치가 안된 경우, 아래와 같은 에러가 발생합니다.   
```bash
========== Overridable (Review and either fix or ignore the failure) ==========
(OVERRIDABLE) PACKAGE_UPDATES::OUT_OF_DATE_PACKAGES - Outdated packages detected
     Description: Please refer to the diagnosis for further information
     Diagnosis: The system has 27 package(s) not updated based on the enabled system repositories.
    List of packages to update: curl iwl100-firmware iwl1000-firmware iwl105-firmware iwl135-firmware iwl2000-firmware iwl2030-firmware iwl3160-firmware iwl3945-firmware iwl4965-firmware iwl5000-firmware iwl5150-firmware iwl6000-firmware
iwl6000g2a-firmware iwl6000g2b-firmware iwl6050-firmware iwl7260-firmware kernel kernel-tools kernel-tools-libs libcurl linux-firmware microcode_ctl python-perf systemd systemd-libs systemd-sysv.

    Not updating the packages may cause the conversion to fail.
    Consider updating the packages before proceeding with the conversion.
     Remediation: N/A

========== Error (Must fix before conversion) ==========
(ERROR) IS_LOADED_KERNEL_LATEST::INVALID_KERNEL_VERSION - Invalid kernel version detected
     Description: The loaded kernel version mismatch the latest one available in the enabled system repositories
     Diagnosis: The version of the loaded kernel is different from the latest version in the enabled system repositories.
     Latest kernel version available in updates: 3.10.0-1160.105.1.el7
     Loaded kernel version: 3.10.0-1160.102.1.el7
     Remediation: To proceed with the conversion, update the kernel version by executing the following step:

    1. yum install kernel-3.10.0-1160.105.1.el7 -y
    2. reboot
```
   
위와 같은 경우, 아래 명령어를 통해 최신버전으로 업데이트를 하고 재부팅을 통해 최신 커널이 로드되도록 합니다.  
```bash
$ sudo yum update -y && reboot
```
   
그 외 이슈는 `/var/log/convert2rhel/` 경로에 로그를 확인하고 조치합니다.   

# 참고 문서 
+ **Migrate to Red Hat Enterprise Linux from CentOS Linux**   
[https://www.redhat.com/en/interactive-labs/migrate-red-hat-enterprise-linux-centos-linux](https://www.redhat.com/en/interactive-labs/migrate-red-hat-enterprise-linux-centos-linux)   
   
+ **An Introduction to Convert2RHEL: Now officially supported to convert RHEL-like systems to RHEL**    
[https://www.redhat.com/en/blog/introduction-convert2rhel-now-officially-supported-convert-rhel-systems-rhel](https://www.redhat.com/en/blog/introduction-convert2rhel-now-officially-supported-convert-rhel-systems-rhel)   
   
+ [https://access.redhat.com/articles/2360841](https://access.redhat.com/articles/2360841)   
   
+ [https://access.redhat.com/support/policy/convert2rhel-support](https://access.redhat.com/support/policy/convert2rhel-support)   