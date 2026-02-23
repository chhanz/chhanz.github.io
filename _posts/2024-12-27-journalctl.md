---
layout: post
title: "[Linux] journalctl 사용법"
description: ""
author: chhanz
date: 2024-12-27
tags: [linux]
category: linux
---

# journalctl 사용법
Amazon Linux 2023 의 경우, `rsyslog` 가 기본 구성이 아니므로 `journalctl` 을 이용하여 시스템 로그를 확인해야합니다.   
이번 포스팅에는 `journalctl` 에서 자주 사용되는 옵션과 기능에 대해 기록을 하도록 하겠습니다.   

* 부팅 로그 관련 옵션   
```console
       -b [[ID][±offset]|all], --boot[=[ID][±offset]|all]
           Show messages from a specific boot. This will add a match for "_BOOT_ID=".
```
   
* 전체 부팅 로그 확인   
```bash
$ sudo journalctl --no-pager --boot 
```
   
* boot log journal 확인   
```bash
$ sudo journalctl --list-boots
IDX BOOT ID                          FIRST ENTRY                 LAST ENTRY
 -3 48b326f3cb704fbda40b249389caa93a Sun 2023-08-13 21:06:46 UTC Tue 2023-09-05 04:28:27 UTC
 -2 bbca42e3d2fb418596d8f84375aaa288 Tue 2023-09-05 04:28:49 UTC Fri 2023-09-08 09:03:43 UTC
```
   
* 특정 boot 로그 확인   
```bash
$ sudo journalctl -b-<IDX number>
```
   
* 특정 boot 로그 확인 > 예제
```bash
$ sudo journalctl -b-3
```

* 특정 일자부터 journal log 확인
```bash
$ sudo journalctl --since "2023-08-07 00:00:00" 
```

* 오늘 날짜 journal log 확인
```bash
$ sudo journalctl --since today
```
   
* 모든 필드와 부팅 로그 수집   
```bash
$ sudo journalctl --no-pager --all --boot > journalctl_all_boot.txt
```
   
* 특정 daemon 로그 확인   
```bash
$ sudo journalctl -u sshd
```
   
# 참고 문서 
* [Chapter 9. Troubleshooting problems by using log files](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/8/html/configuring_basic_system_settings/assembly_troubleshooting-problems-using-log-files_configuring-basic-system-settings#viewing-logs-using-the-command-line_assembly_troubleshooting-problems-using-log-files)   
* [https://man.archlinux.org/man/journalctl.1.en](https://man.archlinux.org/man/journalctl.1.en)   