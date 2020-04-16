---
layout: post
title: "[Devops] Jenkins 설치(RPM/WAR)"
description: " "
author: chhanz
date: 2020-04-16
tags: [devops]
category: devops
---
   
# 목차
+ [Gitlab-CE 설치](https://chhanz.github.io/devops/2020/02/16/install-gitlab/)   
+ [Jenkins 설치](https://chhanz.github.io/devops/2020/04/16/install-jenkins/)   
   
# Jenkins RPM 설치
RPM 을 이용한 설치 과정입니다.   
* 참고 문서 : [https://pkg.jenkins.io/redhat/](https://pkg.jenkins.io/redhat/)   
   
## RPM Version
* 필수 Package 설치
```bash
$ yum -y install java-1.8.0-openjdk java-1.8.0-openjdk-devel
```
   
* Jenkins repository 추가
```bash
$ wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat/jenkins.repo
```
   
* Jenkins 설치
```bash
$ yum install jenkins
```
   
   
* Jenkins 서비스 시작
```bash
$ systemctl enable jenkins
$ systemctl start jenkins
```
   
# Jenkins WAR 설치
`Warfile` 을 배포하여 설치 하는 과정입니다.   
   
## WAR Version
* 필수 Package 설치
```bash
$ yum -y install java-1.8.0-openjdk java-1.8.0-openjdk-devel
```
   
* Tomcat 설치
```bash
$ yum install tomcat
```
   
* `Warfile` 배포
```bash
$ wget -O /var/lib/tomcat/webapps/ROOT.war http://mirrors.jenkins.io/war-stable/latest/jenkins.war
```
   
* Tomcat 서비스 시작
```bash
$ systemctl enable --now tomcat 
```
   
## Jenkins 초기화 작업
하기 작업은 `RPM`/`WAR` 방식이 동일합니다.   

<img src="/assets/images/post/2020-04-16-jenkins/1.png" style="max-width: 95%; height: auto;">   
* Web Console 접속은 `https://[Jenkins-Server-IP]:8080` 입니다.   
* 출력된 경로에서 Unlock Password 를 확인하고 입력합니다.   
```bash
[root@fastvm-centos-7-7-92 ~]# cat /var/lib/jenkins/secrets/initialAdminPassword
4c7a738784d4437d882c56c6e28cfa06
```
      
<img src="/assets/images/post/2020-04-16-jenkins/2.png" style="max-width: 95%; height: auto;">   
* Jenkins Plugin 설치를 어떻게 할 것인지 선택합니다. Default 로 설치하겠습니다.   
   
<img src="/assets/images/post/2020-04-16-jenkins/3.png" style="max-width: 95%; height: auto;">   
* 위와 같이 설치 과정을 확인 할 수 있습니다.(성능에 따라 소요되는 시간이 차이가 있습니다.)   
   
<img src="/assets/images/post/2020-04-16-jenkins/4.png" style="max-width: 95%; height: auto;">   
* 추가 설치가 완료되면 Admin 계정 생성을 진행합니다.   
   
<img src="/assets/images/post/2020-04-16-jenkins/5.png" style="max-width: 95%; height: auto;">   
* Jenkins 에 접근할 URL 을 설정합니다.   
   
<img src="/assets/images/post/2020-04-16-jenkins/6.png" style="max-width: 95%; height: auto;">   
* Jenkins 를 사용 할 준비가 완료 되었습니다.    
   
<img src="/assets/images/post/2020-04-16-jenkins/7.png" style="max-width: 95%; height: auto;">   
* Jenkins 설치가 완료되고 Jenkins 를 사용 할 수 있게 되었습니다.   
   