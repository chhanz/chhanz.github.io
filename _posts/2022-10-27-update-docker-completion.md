---
layout: post
title: "[Docker] Docker Completion 설정" 
description: ""
author: chhanz
date: 2022-10-27
tags: [docker]
category: docker
---
   
# Docker Completion 설정 (자동 완성)
최근 `Podman` 만 사용하다가 오랜만에 `Docker` 를 설치하면서 변경된 부분이 있는데 따로 공식 문서나 자료가 없어서 관련하여 작성해본다.      
   
# 변경된 이유
```console
Docker CE (https://github.com/docker/docker-ce)
⚠️ This repository is now deprecated and will be archived (Docker CE itself is NOT deprecated) ⚠️
Starting with the Docker 20.10 release, packages for the Docker Engine and Docker CLI are built directly from their respective source repositories instead of from this repository.
```
기존에 사용중이던 [`docker-ce`](https://github.com/docker/docker-ce) repository 에서 위와 같이 `Docker 20.10` version 이 되면서 repository 가 변경 되었다.   
그래서 아래와 같이 [`docker/cli`](https://github.com/docker/cli) repository 에서 해당 completion file 을 이용하여 설정해야된다.   
   
# 설정
아래와 같은 방법으로 최신 docker completion 을 추가 할 수 있다.   
(Bash 기준으로 작성)   
   
```bash
$ sudo curl -L https://raw.githubusercontent.com/docker/cli/master/contrib/completion/bash/docker -o /etc/bash_completion.d/docker

$ sudo docker <tab>
attach     commit     context    diff       export     image      info       load       logs       node       port       push       rm         save       service    stats      system     trust      version
build      config     cp         events     help       images     inspect    login      manifest   pause      ps         rename     rmi        search     stack      stop       tag        unpause    volume
builder    container  create     exec       history    import     kill       logout     network    plugin     pull       restart    run        secret     start      swarm      top        update     wait
```
    
# 참고 자료
* [https://github.com/docker/cli](https://github.com/docker/cli)   
* 다른 Shell completion file   
    - [https://github.com/docker/cli/tree/master/contrib/completion](https://github.com/docker/cli/tree/master/contrib/completion)   
    - Bash, Zsh, fish, powershell 지원    