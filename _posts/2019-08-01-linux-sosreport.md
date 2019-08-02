---
layout: post
title: "[Linux] sosreport 생성 경로 변경"
description: " "
author: chhanz
date: 2019-08-01
tags: [linux]
category: linux
---

# [참고] Install sosreport Package
* * *
```console
[root@fastvm-centos-7-6-ext-50 ~]# yum -y install sos

... 중략 ...

Installed:
  sos.noarch 0:3.6-19.el7.centos
```
위와 같이 `sos` Package 를 설치하면 sosreport 를 수집 할 수 있습니다.    

# sosreport 생성 경로 변경
* * * 
sosreport 는 기본적으로 아래와 같이 `/var/tmp/sosreport-XXXX.tar.xz` 로 생셩이 됩니다.   
`/var` 경로에 용량이 부족하거나 sosreport 로 수집된 파일의 크기가 큰 경우, 생성 위치를 변경하여 생성 할 수 있습니다.   

## sosreport 기본 경로 생성 로그
```console
[root@fastvm-centos-7-6-ext-50 ~]# sosreport 

sosreport (version 3.6)

... 중략 ...

Creating compressed archive...

Your sosreport has been generated and saved in:
  /var/tmp/sosreport-fastvm-centos-7-6-ext-50-2019-08-02-uhcfevv.tar.xz

The checksum is: a4c9207647dd2ad74fc74d944329dca7

Please send this file to your support representative.
```

## sosreport 변경
아래와 같이 `--tmp-dir` 옵션을 사용합니다.   
```console
[root@fastvm-centos-7-6-ext-50 ~]# sosreport --tmp-dir /tmp

sosreport (version 3.6)

This command will collect diagnostic and configuration information from
this CentOS Linux system and installed applications.

An archive containing the collected information will be generated in
/tmp/sos.O8jeMy and may be provided to a CentOS support representative.

Any information provided to CentOS will be treated in accordance with
the published support policies at:

  https://wiki.centos.org/

The generated archive may contain data considered sensitive and its
content should be reviewed by the originating organization before being
passed to any third party.

No changes will be made to system configuration.

Press ENTER to continue, or CTRL-C to quit.

Please enter the case id that you are generating this report for []:

 Setting up archive ...
 Setting up plugins ...

 Running plugins. Please wait ...

  Finishing plugins              [Running: yum]
  Finished running plugins
Creating compressed archive...

Your sosreport has been generated and saved in:
  /tmp/sosreport-fastvm-centos-7-6-ext-50-2019-08-02-gdjxiur.tar.xz

The checksum is: 91c2374e9d1a48b901241a6f9786df5f

Please send this file to your support representative.
```
   
위와 같이 sosreport 생성 경로를 변경하였습니다.   
해당 수집 방법은 `sos` Package Version 및 `RHEL/CentOS` Version 이 낮은 경우 다른 방법으로 수집을 해야 될 수 있습니다.   
***위와 같은 경우 아래 첨부된 참고 자료 확인 바람니다.***   

# 참고 자료
* * *
- [https://access.redhat.com/solutions/1847](https://access.redhat.com/solutions/1847)