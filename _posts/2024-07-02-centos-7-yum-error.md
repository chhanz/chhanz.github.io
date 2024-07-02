---
layout: post
title: "[Linux] CentOS 7 : `Could not resolve host: mirrorlist.centos.org; Unknown error`"
description: "EOS CentOS 7 - yum error"
author: chhanz
date: 2024-07-02
tags: [linux]
category: linux
---

# End of Service - CentOS 7

CentOS 7 은 2024년 06월 30일 이후로 End of Service 가 되었습니다.   
지속적인 사용을 위해서는 CentOS Stream 혹은 RHEL 계열의 배포판을 사용해야합니다.   
   
# ERROR `yum`

다음과 같이 `Could not retrieve mirrorlist http://mirrorlist.centos.org/?release=7&arch=x86_64&repo=os&infra=genclo error was 14: curl#6 - "Could not resolve host: mirrorlist.centos.org; Unknown error"` 에러가 발생되는 것을 확인 할 수 있습니다.   
   
```bash
[root@ip-172-31-6-151 ~]# yum repolist
Loaded plugins: fastestmirror
Loading mirror speeds from cached hostfile
Could not retrieve mirrorlist http://mirrorlist.centos.org/?release=7&arch=x86_64&repo=os&infra=genclo error was
14: curl#6 - "Could not resolve host: mirrorlist.centos.org; Unknown error"
Loading mirror speeds from cached hostfile
Loading mirror speeds from cached hostfile
Loading mirror speeds from cached hostfile
repo id                                                       repo name                                                       status
base/7/x86_64                                                 CentOS-7 - Base                                                 0
extras/7/x86_64                                               CentOS-7 - Extras                                               0
updates/7/x86_64                                              CentOS-7 - Updates                                              0
repolist: 0
```
   
# 해결 방안
이는 CentOS 7 의 EOS 로 인해 기존에 Mirror site 가 Vault 로 전환이 되어 Mirror Site 를 찾을 수 없는 문제로 인해 발생되는 것입니다.   
   
아래 명령어를 통해 기존 Mirror site 를 Vault 로 전환하여 `yum` 을 사용 할 수 있습니다.   
   
```bash
[root@ip-172-31-6-151 ~]# sed -i 's/mirrorlist/#mirrorlist/g' /etc/yum.repos.d/CentOS-*
[root@ip-172-31-6-151 ~]# sed -i 's|#baseurl=http://mirror.centos.org|baseurl=http://vault.centos.org|g' /etc/yum.repos.d/CentOS-*
```
   
아래와 같이 정상적으로 repolist 를 받아오는 것을 확인 할 수 있습니다.   

```
[root@ip-172-31-6-151 ~]# yum clean all
[root@ip-172-31-6-151 ~]# yum repolist
Loaded plugins: fastestmirror
Loading mirror speeds from cached hostfile
repo id                                                       repo name                                                       status
base/7/x86_64                                                 CentOS-7 - Base                                                 10,072
extras/7/x86_64                                               CentOS-7 - Extras                                                  526
updates/7/x86_64                                              CentOS-7 - Updates                                               6,173
repolist: 16,771
```
   
```
[root@ip-172-31-6-151 ~]# cat /etc/yum.repos.d/CentOS-Base.repo
[base]
name=CentOS-$releasever - Base
#mirrorlist=http://#mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=os&infra=$infra
baseurl=http://vault.centos.org/centos/$releasever/os/$basearch/
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7
...
```
위와 같이 `baseurl` 을 변경하여 `yum` 사용이 가능하게 되었으나, EOS 된 운영체제는 패키지에 대한 유지보수가 없으므로 보안에 취약하니 근본적인 문제를 해결하기 위해서는 다른 배포판으로 전환을 하는 것이 필요합니다.   
   
# 참고 자료
* [https://www.redhat.com/ko/topics/linux/centos-linux-eol](https://www.redhat.com/ko/topics/linux/centos-linux-eol)   
