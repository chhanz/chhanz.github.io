---
layout: post
title: "[Linux] `YumRepo Error: All mirror URLs are not using ftp, http[s] or file.`"
description: "해결 방법 (CentOS 6)"
author: chhanz
date: 2020-12-10
tags: [linux]
category: linux
---
# `YumRepo Error: All mirror URLs are not using ftp, http[s] or file.` 해결 방법
아래와 같이 CentOS 6에서 발생되는 이슈입니다.   
```bash
[root@fastvm-centos-6-10-51 ~]# yum repolist
Loaded plugins: fastestmirror
Determining fastest mirrors
YumRepo Error: All mirror URLs are not using ftp, http[s] or file.
 Eg. Invalid release/repo/arch combination/
removing mirrorlist with no valid mirrors: /var/cache/yum/x86_64/6/base/mirrorlist.txt
YumRepo Error: All mirror URLs are not using ftp, http[s] or file.
 Eg. Invalid release/repo/arch combination/
removing mirrorlist with no valid mirrors: /var/cache/yum/x86_64/6/extras/mirrorlist.txt
YumRepo Error: All mirror URLs are not using ftp, http[s] or file.
 Eg. Invalid release/repo/arch combination/
removing mirrorlist with no valid mirrors: /var/cache/yum/x86_64/6/updates/mirrorlist.txt
repo id                                             repo name                                                       status
base                                                CentOS-6 - Base                                                 0
extras                                              CentOS-6 - Extras                                               0
updates                                             CentOS-6 - Updates                                              0
repolist: 0
```
   
발생되는 이유는 CentOS 6 의 EOL 이 `2020-11-30` 로 인해 fastmirror site 에서 CentOS 6 Package가 제거 되어서 그렇습니다.   
   
# 해결 방법(임시)
아래와 같이 `mirrorlist.txt` 에 CentOS Vault Repository 를 추가합니다.   
```bash
$ echo "https://vault.centos.org/6.10/os/x86_64/" > /var/cache/yum/x86_64/6/base/mirrorlist.txt
$ echo "https://vault.centos.org/6.10/extras/x86_64/" > /var/cache/yum/x86_64/6/extras/mirrorlist.txt
$ echo "https://vault.centos.org/6.10/updates/x86_64/" > /var/cache/yum/x86_64/6/updates/mirrorlist.txt
```
추가 이후에 아래와 같이 `yum repolist` 가 정상 작동 되는 것을 볼 수 있습니다.   
```bash
[root@fastvm-centos-6-10-51 ~]# yum repolist
Loaded plugins: fastestmirror
Determining fastest mirrors
base                                                                                               | 3.7 kB     00:00
base/primary_db                                                                                    | 4.7 MB     00:03
extras                                                                                             | 3.4 kB     00:00
extras/primary_db                                                                                  |  29 kB     00:00
updates                                                                                            | 3.4 kB     00:00
updates/primary_db                                                                                 |  12 MB     00:07
repo id                                             repo name                                                       status
base                                                CentOS-6 - Base                                                 6,713
extras                                              CentOS-6 - Extras                                                  47
updates                                             CentOS-6 - Updates                                              1,193
repolist: 7,953
```
위와 같이 적용하면 `yum clean all` 명령어가 수행이 되면 다시 동일한 문제가 발생 될 것입니다.   
   
# 해결 방법(영구)
아래와 같이 `/etc/yum.repos.d/` 하위의 `repo` 파일을 수정합니다.   
```bash
$ sed -i -e "s/^mirrorlist=http:\/\/mirrorlist.centos.org/#mirrorlist=http:\/\/mirrorlist.centos.org/g" /etc/yum.repos.d/CentOS-Base.repo
$ sed -i -e "s/^#baseurl=http:\/\/mirror.centos.org/baseurl=https:\/\/vault.centos.org/g" /etc/yum.repos.d/CentOS-Base.repo
```
   
아래와 같이 `repo` 가 수정됩니다.   
```diff
$ diff CentOS-Base.repo.old CentOS-Base.repo
15,16c15,16
< mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=os&infra=$infra
< #baseurl=http://mirror.centos.org/centos/$releasever/os/$basearch/
---
> #mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=os&infra=$infra
> baseurl=https://vault.centos.org/centos/$releasever/os/$basearch/
23,24c23,24
< mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=updates&infra=$infra
< #baseurl=http://mirror.centos.org/centos/$releasever/updates/$basearch/
---
> #mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=updates&infra=$infra
> baseurl=https://vault.centos.org/centos/$releasever/updates/$basearch/
31,32c31,32
< mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=extras&infra=$infra
< #baseurl=http://mirror.centos.org/centos/$releasever/extras/$basearch/
---
> #mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=extras&infra=$infra
> baseurl=https://vault.centos.org/centos/$releasever/extras/$basearch/
```
   
아래와 같이 yum cache 가 clean 되어도 mirror site 정보가 유지 됩니다.   
```bash
[root@fastvm-centos-6-10-51 yum.repos.d]# yum clean all
Loaded plugins: fastestmirror
Cleaning repos: base extras updates
Cleaning up Everything
[root@fastvm-centos-6-10-51 yum.repos.d]# yum repolist
Loaded plugins: fastestmirror
Determining fastest mirrors
base                                                                                               | 3.7 kB     00:00
base/primary_db                                                                                    | 4.7 MB     00:03
extras                                                                                             | 3.4 kB     00:00
extras/primary_db                                                                                  |  29 kB     00:00
updates                                                                                            | 3.4 kB     00:00
updates/primary_db                                                                                 |  12 MB     00:07
repo id                                             repo name                                                       status
base                                                CentOS-6 - Base                                                 6,713
extras                                              CentOS-6 - Extras                                                  47
updates                                             CentOS-6 - Updates                                              1,193
repolist: 7,953
[root@fastvm-centos-6-10-51 yum.repos.d]#
```
   
# 결론
Vault 가 엄청 느립니다 ............   
   
# 참고 자료
* [https://www.reddit.com/r/sysadmin/comments/k63mcw/centos_repositories_down/](https://www.reddit.com/r/sysadmin/comments/k63mcw/centos_repositories_down/)   
* [https://qiita.com/imunew/items/3810a41960f40db85c94](https://qiita.com/imunew/items/3810a41960f40db85c94)   
* [https://forum.directadmin.com/threads/how-do-i-fix-these-yum-errors.54874/](https://forum.directadmin.com/threads/how-do-i-fix-these-yum-errors.54874/)   