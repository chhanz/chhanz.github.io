---
layout: post
title: "[Devops] Gitlab CE 설치"
description: " "
author: chhanz
date: 2020-02-16
tags: [devops]
category: devops
---
# 목차
+ [Gitlab-CE 설치](https://chhanz.github.io/devops/2020/02/16/install-gitlab/)   
+ [Jenkins 설치](https://chhanz.github.io/devops/2020/04/16/install-jenkins/)   
+ [Nexus Repository Manager 설치](https://chhanz.github.io/devops/2020/04/17/install-nexus-ce/)   
   
# Gitlab CE
## Gitlab 이란? 
위키백과에서는 아래와 같이 설명하고 있습니다.   
```console
깃랩(GitLab)은 깃랩 사(GitLab Inc.)가 개발한 위키와 이슈 추적 기능을 갖춘 웹 기반의 데브옵스 시스템으로써,
오픈 소스 라이선스 및 사유 소프트웨어 라이선스를 사용한다.
2019년 현재, 깃 저장소와 이슈 추적 기능을 가춘 유일한 단일 어플리케이션의 (Single Application) 데브옵스 솔루션이다.
시중에 유통되고 있는 많은 데브옵스 솔루션들은 자신들의 특화된 영역 이외는 API를 이용한 연동 만을 제공하지만 깃랩은
단일 어플리케이션으로써 데브옵스의 전 영역의 기능들을 모두 제공하고 있다. 
```
* 출처: [위키백과-깃랩](https://ko.wikipedia.org/wiki/%EA%B9%83%EB%9E%A9)   
   
이번 포스팅에서는 형상관리 도구로 사용되는 Gitlab 을 설치해보고 간단하게 사용 방법에 대해 알아보도록 하겠습니다.   
   
## Gitlab CE 설치
Gitlab 설치를 할 시스템은 아래와 같습니다.   
- Memory 최소 4GB 이상   
- CentOS 7 Latest Version   
- Disk 100GB 이상   
- `Firewalld`, `SELinux` Disabled. (필요에 따라 Enable 합니다.)   

### 필수 패키지 설치   
아래와 같이 필수 패키지를 설치합니다.   
```bash
[root@fastvm-centos-7-7-90 ~]# yum -y install wget bash-completion git policycoreutils-python
```
   
### Postfix 설치 및 설정
Gitlab system 에서 Notification 을 수행하기 위해 Postfix 를 설치하고 간단하게 설정합니다.   
```bash
[root@fastvm-centos-7-7-90 ~]# yum -y install postfix

[root@fastvm-centos-7-7-90 ~]# systemctl status postfix
● postfix.service - Postfix Mail Transport Agent
   Loaded: loaded (/usr/lib/systemd/system/postfix.service; enabled; vendor preset: disabled)
   Active: active (running) since Fri 2020-02-14 15:05:26 KST; 1min 51s ago
 Main PID: 1605 (master)
   CGroup: /system.slice/postfix.service
           ├─1605 /usr/libexec/postfix/master -w
           ├─1622 pickup -l -t unix -u
           └─1623 qmgr -l -t unix -u

Feb 14 15:05:25 fastvm-centos-7-7-90 systemd[1]: Starting Postfix Mail Transport Agent...
Feb 14 15:05:26 fastvm-centos-7-7-90 postfix/master[1605]: daemon started -- version 2.10.1, configuration /etc/postfix
Feb 14 15:05:26 fastvm-centos-7-7-90 systemd[1]: Started Postfix Mail Transport Agent.
[root@fastvm-centos-7-7-90 ~]#
```
   
Postfix 설정 변경을 합니다.   
`/etc/postfix/main.cf` 를 수정합니다.   
```bash
## Example

myhostname = gitlab.example.com

mydomain = example.com

myorigin = $myhostname 

inet_interfaces = all

mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain

relay_domains = $mydestination
```
위 설정은 예제이며, 테스트 환경 또는 운영 환경에 맞게 설정합니다.   
   
### Gitlab CE 설치 시작
Gitlab CE repository 를 설치합니다.   
```console
# curl -sS https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.rpm.sh | sudo bash
```
아래와 같이 Gitlab 을 설치합니다.   
```console
# EXTERNAL_URL="https://gitlab.example.com" yum install -y gitlab-ce
```
   
설치가 완료되면 아래와 같이 `gitlab-ctl` 명령을 통해 서비스 상태를 확인 할 수 있습니다.   
```bash
[root@fastvm-centos-7-7-90 ~]# gitlab-ctl status
run: alertmanager: (pid 4417) 152397s; run: log: (pid 3459) 152540s
run: crond: (pid 4406) 152403s; run: log: (pid 4405) 152404s
run: gitaly: (pid 4432) 152397s; run: log: (pid 2861) 152667s
run: gitlab-exporter: (pid 4451) 152396s; run: log: (pid 3360) 152556s
run: gitlab-workhorse: (pid 4465) 152396s; run: log: (pid 3094) 152594s
run: grafana: (pid 4478) 152396s; run: log: (pid 3661) 152496s
run: logrotate: (pid 9250) 1193s; run: log: (pid 3194) 152572s
run: nginx: (pid 4496) 152395s; run: log: (pid 3124) 152588s
run: node-exporter: (pid 4542) 152394s; run: log: (pid 3324) 152562s
run: postgres-exporter: (pid 4586) 152394s; run: log: (pid 3482) 152535s
run: postgresql: (pid 4593) 152393s; run: log: (pid 2924) 152661s
run: prometheus: (pid 4602) 152393s; run: log: (pid 3423) 152546s
run: redis: (pid 4616) 152393s; run: log: (pid 2725) 152673s
run: redis-exporter: (pid 4621) 152392s; run: log: (pid 3384) 152552s
run: registry: (pid 4628) 152392s; run: log: (pid 3298) 152565s
run: sidekiq: (pid 4638) 152391s; run: log: (pid 3080) 152600s
run: unicorn: (pid 4644) 152391s; run: log: (pid 3064) 152606s
[root@fastvm-centos-7-7-90 ~]#
```
   
### Gitlab Web UI 접속
`https://gitlab.example.com` 으로 접속합니다.   
<img src="/assets/images/post/2020-02-16-gitlab/1.png" style="max-width: 95%; height: auto;">   
위와 같이 초기 접속시에는 `root` 관리자 비밀번호 설정을 합니다.   
   
<img src="/assets/images/post/2020-02-16-gitlab/2.png" style="max-width: 95%; height: auto;">   
관리자로 로그인된 Gitlab 의 모습입니다.   
   
### Gitlab 사용자 생성
<img src="/assets/images/post/2020-02-16-gitlab/3.png" style="max-width: 95%; height: auto;">   
사용자 생성을 위해 `Admin Area` 를 선택합니다.   
   
<img src="/assets/images/post/2020-02-16-gitlab/4.png" style="max-width: 95%; height: auto;">   
`Users` 메뉴를 선택합니다.   
   
<img src="/assets/images/post/2020-02-16-gitlab/5.png" style="max-width: 95%; height: auto;">   
`New User` 를 선택합니다.   
   
<img src="/assets/images/post/2020-02-16-gitlab/6.png" style="max-width: 95%; height: auto;">   
신규로 생성할 사용자 정보를 입력합니다.   
   
<img src="/assets/images/post/2020-02-16-gitlab/7.png" style="max-width: 95%; height: auto;">   
사용자 생성이 완료되면 위와 같이 입력한 이메일로 비밀번호 초기화 메일이 전송됩니다.   
   
<img src="/assets/images/post/2020-02-16-gitlab/8.png" style="max-width: 95%; height: auto;">   
안내된 초기화 링크를 통해 접속하면 비밀번호 초기화가 가능합니다.   
   
<img src="/assets/images/post/2020-02-16-gitlab/9.png" style="max-width: 95%; height: auto;">   
위와 같이 사용자 생성이 완료된 것을 볼 수 있습니다.   
   
### Gitlab Project 생성
<img src="/assets/images/post/2020-02-16-gitlab/13.png" style="max-width: 95%; height: auto;">   
초기 화면에서 `Create a project` 메뉴를 선택하면 위와 같이 Project 생성이 가능합니다.   
   
`Mytestproject` 를 생성 해보겠습니다.   
   
<img src="/assets/images/post/2020-02-16-gitlab/14.png" style="max-width: 95%; height: auto;">   
위와 같이 `Project` 가 생성이 되었습니다.   
   
<img src="/assets/images/post/2020-02-16-gitlab/15.png" style="max-width: 95%; height: auto;">   
기능 테스트를 위해 소스를 `Clone` 합니다.   
   
```bash
[root@fastvm-centos-7-7-90 ~]# git clone git@gitlab.example.com:chhanz/mytestproject.git
Cloning into 'mytestproject'...
The authenticity of host "gitlab.example.com (192.168.200.90)" cant be established.
ECDSA key fingerprint is SHA256:f1oXJM1Hqui9COg3tZROl/8z2qvr6fY6MhYdbhxNk0c.
ECDSA key fingerprint is MD5:a7:16:d4:d2:46:90:31:e8:96:19:3a:f4:a1:39:f8:96.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added "gitlab.example.com,192.168.200.90" (ECDSA) to the list of known hosts.
remote: Enumerating objects: 3, done.
remote: Counting objects: 100% (3/3), done.
remote: Total 3 (delta 0), reused 0 (delta 0), pack-reused 0
Receiving objects: 100% (3/3), done.
[root@fastvm-centos-7-7-90 ~]#
```
위와 같이 소스를 `clone` 합니다.   
   
```bash
[root@fastvm-centos-7-7-90 mytestproject]# ls -la 
total 4
drwxr-xr-x  3 root root  35 Feb 14 16:45 .
dr-xr-x---. 5 root root 219 Feb 14 16:45 ..
drwxr-xr-x  8 root root 163 Feb 14 16:45 .git
-rw-r--r--  1 root root  17 Feb 14 16:45 README.md
[root@fastvm-centos-7-7-90 mytestproject]#
[root@fastvm-centos-7-7-90 mytestproject]# echo "TEST :: COMMIT" >> README.md 
[root@fastvm-centos-7-7-90 mytestproject]# cat README.md 
# Mytestproject

TEST :: COMMIT
[root@fastvm-centos-7-7-90 mytestproject]#
```
테스트를 위해 `README.md` 에 내용을 추가합니다.  
   
```bash
[root@fastvm-centos-7-7-90 mytestproject]# git status
# On branch master
# Changes not staged for commit:
#   (use "git add <file>..." to update what will be committed)
#   (use "git checkout -- <file>..." to discard changes in working directory)
#
#       modified:   README.md
#
no changes added to commit (use "git add" and/or "git commit -a")
[root@fastvm-centos-7-7-90 mytestproject]# git add .
[root@fastvm-centos-7-7-90 mytestproject]# git commit -m "first commit "
[master d4da160] first commit
 1 file changed, 1 insertion(+)
[root@fastvm-centos-7-7-90 mytestproject]# git push -u origin master
Counting objects: 5, done.
Writing objects: 100% (3/3), 271 bytes | 0 bytes/s, done.
Total 3 (delta 0), reused 0 (delta 0)
To git@gitlab.example.com:chhanz/mytestproject.git
   f11547a..d4da160  master -> master
[root@fastvm-centos-7-7-90 mytestproject]#
```
변경된 소스에 대해 `commit` 후, `push` 를 진행합니다.   
   
<img src="/assets/images/post/2020-02-16-gitlab/16.png" style="max-width: 95%; height: auto;">   
`Project` 에 변경된 소스 내용이 반영되었습니다.   
   
### Web IDE 제공
<img src="/assets/images/post/2020-02-16-gitlab/17.png" style="max-width: 95%; height: auto;">   
Gitlab 에서도 Web IDE 를 제공합니다.   

### PR 기능
<img src="/assets/images/post/2020-02-16-gitlab/18.png" style="max-width: 95%; height: auto;">   
Web IDE 에서 수정한 내용을 `Pull request` 할 수 있습니다.   

<img src="/assets/images/post/2020-02-16-gitlab/19.png" style="max-width: 95%; height: auto;">   
위와 같이 `PR` 된 소스가 `Merge` 된 것을 볼 수 있습니다.   
   
# 참고 자료
- Gitlab 설치 : [https://about.gitlab.com/install/#centos-7?version=ce](https://about.gitlab.com/install/#centos-7?version=ce)












