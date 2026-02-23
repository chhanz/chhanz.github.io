---
layout: post
title: "[Linux] CentOS 8: Failed to download metadata for repo 'appstream'"
description: "EOS CentOS 8"
author: chhanz
date: 2022-02-04
tags: [linux]
category: linux
---
# EOS CentOS 8
CentOS 8 은 `December 31, 2021` 부로 EOS 되었습니다.   
지속적인 사용을 위해서는 CentOS 8 Stream 으로 배포판 변경을 해야지 지속적인 지원을 받을 수 있습니다.   
   
# Error `dnf`
`Error: Failed to download metadata for repo 'appstream': Cannot prepare internal mirrorlist: No URLs in mirrorlist`   
메시지가 나오면서 `dnf` 가 수행이 안되는 것을 확인 할 수 있습니다.   
```bash
[root@chhan-c8 ~]# dnf repolist
CentOS Linux 8 - AppStream                                                                                      87  B/s |  38  B     00:00    
Error: Failed to download metadata for repo 'appstream': Cannot prepare internal mirrorlist: No URLs in mirrorlist
```
   
# 해결 방안
이는 CentOS 8 EOS 로 인해 CentOS 8 Mirror site 가 vault 로 전환되어 Mirror site 를 못 찾아 발생되는 문제입니다.   
([https://www.centos.org/centos-linux-eol/](https://www.centos.org/centos-linux-eol/))   
   
아래 명령어를 통해 기존에 Mirror site 를 Vault 로 전환하여 `dnf` 사용을 할 수 있습니다.   
```bash
[root@chhan-c8 ~]# sed -i 's/mirrorlist/#mirrorlist/g' /etc/yum.repos.d/CentOS-Linux-*
[root@chhan-c8 ~]# sed -i 's|#baseurl=http://mirror.centos.org|baseurl=http://vault.centos.org|g' /etc/yum.repos.d/CentOS-Linux-*
```

아래와 같이 정상적으로 repolist 를 받아오는 것을 확인 할 수 있습니다.    
```bash
[root@chhan-c8 ~]# dnf repolist
repo id                                           repo name
appstream                                         CentOS Linux 8 - AppStream
baseos                                            CentOS Linux 8 - BaseOS
extras                                            CentOS Linux 8 - Extras
```
   
```bash
[root@chhan-c8 ~]# cat /etc/yum.repos.d/CentOS-Linux-BaseOS.repo 
...
[baseos]
name=CentOS Linux $releasever - BaseOS
#mirrorlist=http://#mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=BaseOS&infra=$infra
baseurl=http://vault.centos.org/$contentdir/$releasever/BaseOS/$basearch/os/                                << vault site 로 변경
```
   
위와 같이 당장은 해결이 가능하지만 해당 Repo 는 더이상 Package 의 유지보수가 없으므로 보안에 취약합니다.   
근본적인 해결을 위해서는 다른 배포판(ex. rocky linux 등) 이나 CentOS 8 Stream, RHEL 8 로 전환이 필요합니다.   
   
# CentOS 8 Stream 전환
해당 문서와 혼선을 방지하기 위해 외부 사이트를 링크합니다.    
* [https://linuxhandbook.com/update-to-centos-stream/](https://linuxhandbook.com/update-to-centos-stream/)   

# 참고 자료
* [https://endoflife.software/operating-systems/linux/centos](https://endoflife.software/operating-systems/linux/centos)   
* [https://www.centos.org/centos-linux-eol/](https://www.centos.org/centos-linux-eol/)   
* [https://forums.centos.org/viewtopic.php?f=54&t=78708](https://forums.centos.org/viewtopic.php?f=54&t=78708)   
* [https://stackoverflow.com/questions/70926799/centos-through-vm-no-urls-in-mirrorlist](https://stackoverflow.com/questions/70926799/centos-through-vm-no-urls-in-mirrorlist)   