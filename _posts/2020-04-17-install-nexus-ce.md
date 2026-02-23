---
layout: post
title: "[Devops] Nexus Repository Manager 설치(use docker)"
description: " "
author: chhanz
date: 2020-04-17
tags: [devops]
category: devops
---

# 목차
+ [Gitlab-CE 설치](https://chhanz.github.io/devops/2020/02/16/install-gitlab/)   
+ [Jenkins 설치](https://chhanz.github.io/devops/2020/04/16/install-jenkins/)   
+ [Nexus Repository Manager 설치](https://chhanz.github.io/devops/2020/04/17/install-nexus-ce/)   


# Nexus Repository Manager 3 (OSS Version) 설치
Private Container Image 저장소를 만들기 위해 Nexus Registory Manager(이하 Nexus) 구성을 하려고 합니다.    
   
# Nexus Data 저장 공간 생성
* Nexus Data 공간을 생성합니다.   
```bash
$ mkdir /data
$ chown 200:200 /data
```
UID/GID 는 `200` 으로 설정합니다.([Container Image 에 선언되어 있습니다.](https://github.com/sonatype/docker-nexus3#persistent-data))   
   
# Use Docker
* `Docker` 를 이용할 경우, 아래와 같이 명령을 수행합니다.   
```bash
$ docker run -d -p 8081:8081 -p 5000:5000 --name nexus -v /data:/nexus-data sonatype/nexus3
```
   
# Use Podman
* `Podman` 을 이용할 경우, 아래와 같이 명령을 수행합니다.   
```bash
$ podman run -d -p 8081:8081 -p 5000:5000 --name nexus -v /data:/nexus-data sonatype/nexus3
```

# Nexus 초기 설정
<img src="/assets/images/post/2020-04-17-nexus/1.png" style="max-width: 95%; height: auto;">   
* 위와 같이 `http://<Server-IP>:8081` 로 접속합니다.   
   
   
<img src="/assets/images/post/2020-04-17-nexus/2.png" style="max-width: 95%; height: auto;">   
* `admin` 계정 password 를 다음과 같은 경로에서 확인하여 입력합니다.   
```bash
$ cat /data/admin.password
```
Container Volume 을 /data 로 연결을 해서 해당 경로로 확인합니다.   
   
   
<img src="/assets/images/post/2020-04-17-nexus/3.png" style="max-width: 95%; height: auto;">   
* Next 를 누르고 다음을 진행합니다.   
   
   
<img src="/assets/images/post/2020-04-17-nexus/4.png" style="max-width: 95%; height: auto;">   
* `admin` 계정의 Password 를 신규로 생성합니다.   
   
   
<img src="/assets/images/post/2020-04-17-nexus/5.png" style="max-width: 95%; height: auto;">   
* `anonymous` 계정 활성화 여부를 선택하고 진행합니다.   
   
   
<img src="/assets/images/post/2020-04-17-nexus/6.png" style="max-width: 95%; height: auto;">   
* 설치가 완료 되었습니다.   
   
   
# Private Container Image 저장소 생성 
<img src="/assets/images/post/2020-04-17-nexus/7.png" style="max-width: 95%; height: auto;">   
* 관리 페이지에서 `Repository` 메뉴를 선택합니다.   
   
      
<img src="/assets/images/post/2020-04-17-nexus/8.png" style="max-width: 95%; height: auto;">   
* `Create Repository` 를 선택합니다.   
   
   
<img src="/assets/images/post/2020-04-17-nexus/9.png" style="max-width: 95%; height: auto;">   
* 생성 가능한 Repository 종류가 나오며, `Docker (Hosted)` 를 선택합니다.   
   
   
<img src="/assets/images/post/2020-04-17-nexus/10.png" style="max-width: 95%; height: auto;">   
* Repository 의 이름을 지정하고, Repositoty 에 사용할 Port 를 지정합니다.   
   
   
<img src="/assets/images/post/2020-04-17-nexus/11.png" style="max-width: 95%; height: auto;">   
* 추가로 HTTPS Port, Docker V1 API 활성화, 익명 사용자 Pull 권한 등을 용도에 맞게 설정합니다.   
   
   
<img src="/assets/images/post/2020-04-17-nexus/12.png" style="max-width: 95%; height: auto;">   
* 만약 `anonymous` Pull 기능이 필요하다면, Realms 메뉴에서 `Docker Bearer Token Realm` 를 추가합니다.   
   
   
## Container Image Push 
* 아래와 같이 Docker Host 에서 `/etc/docker/daemon.json` 를 수정하여 Private Image Repository 를 사용 할 수 있도록 추가합니다.
```bash
$ cat /etc/docker/daemon.json 
{
        "insecure-registries" : ["192.168.200.92:5000"]
}
```
   
* Docker login 을 진행합니다.   
 
```bash
$ docker login 192.168.200.92:5000
Username: admin
Password:
WARNING! Your password will be stored unencrypted in /root/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store
   
Login Succeeded
```
   
* Container Image 를 Push 하기 위해 tag 를 수정합니다.
   
```bash
$ docker tag test-go-web 192.168.200.92:5000/test-go-web:latest
$ docker images
REPOSITORY                        TAG                 IMAGE ID            CREATED             SIZE
<none>                            <none>              6a111295a403        8 days ago          386MB
test-go-web                       latest              4aa4b4c6d791        8 days ago          7.49MB
192.168.200.92:5000/test-go-web   latest              4aa4b4c6d791        8 days ago          7.49MB
golang                            alpine              760fdda71c8f        3 weeks ago         370MB
```
   
* Container Image 를 Push 합니다.   
```bash
$ docker push 192.168.200.92:5000/test-go-web
The push refers to repository [192.168.200.92:5000/test-go-web]
3417e2abcc0c: Pushed
latest: digest: sha256:35e67bc46ce93066a042e97954afeff9a7f2c6498783040703a32efa1a4c4e21 size: 528
```
위와 같이 Push 가 완료가 되고, 아래와 같이 Nexus GUI 에서 Container Image 저장 상태를 확인 할 수 있습니다.      
   
<img src="/assets/images/post/2020-04-17-nexus/13.png" style="max-width: 95%; height: auto;">   
  
# 참고 자료
* [https://www.jacobbaek.com/846](https://www.jacobbaek.com/846)   
* [https://help.sonatype.com/repomanager3/security/realms](https://help.sonatype.com/repomanager3/security/realms)   
* [https://blog.sonatype.com/using-nexus-3-as-your-repository-part-3-docker-images](https://blog.sonatype.com/using-nexus-3-as-your-repository-part-3-docker-images)   
   

 











