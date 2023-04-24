---
layout: post
title: "[Amazon Linux 2] docker buildx 사용법" 
description: ""
author: chhanz
date: 2023-04-24
tags: [linux, aws]
category: linux
---

# Buildx ?
Buildx 는 멀티 플랫폼 용으로 빌드하는 기능 등을 포함하는 CLI 확장 플러그인으로 19.03 버전 부터 사용할 수 있습니다.   
   
# Buildx on Amazon Linux 2
[CentOS (RHEL 계열)](https://docs.docker.com/engine/install/centos/) 및 [Ubuntu](https://docs.docker.com/engine/install/ubuntu/) 의 배포판에서는 `docker-buildx-plugin` 패키지를 설치하면 Buildx 플러그인이 활성화 되는 방식입니다.   
   
Amazon Linux 2 의 경우, `docker` 만 설치하면 따로 추가 패키지 설치 없이 플러그인이 활성화 되어있습니다.   
   
# Install `docker` on Amazon Linux 2
아래 명령어를 통해 `docker` 설치가 가능합니다.   
```bash
$ sudo amazon-linux-extras install -y docker
$ sudo systemctl enable --now docker
```
   
아래와 같이 `docker` 패키지에 플러그인이 포함되어 있습니다.   
```bash
$ rpm -ql docker-20.10.23-1.amzn2.0.1.x86_64 | grep buildx
/usr/libexec/docker/cli-plugins/docker-buildx
```
   
```bash
$ sudo yum changelog all docker | head -n20
...
==================== Installed Packages ====================
docker-20.10.23-1.amzn2.0.1.x86_64       installed
* Tue Apr 11 12:00:00 2023 Sai Harsha <ssuryad@amazon.com> - 20.10.23-1.amzn2.0.1
- Update to 20.10.23 from upstream

* Tue Mar 28 12:00:00 2023 Sonia Xu <sonix@amazon.com> - 20.10.22-1.amzn2.0.2
- Update buildx to v0.10.4                                                      << 
- Change the buildx plugin name to docker-buildx
```
현재 패키지에 포함된 buildx version 은 `v0.10.4` 로 확인 됩니다.   
      
# 멀티 플랫폼용 컨테이너 이미지 빌드 테스트
Buildx 문서에 나온 [예제](https://github.com/docker/buildx#building-multi-platform-images)를 활용하여 멀티 플랫폼용 컨테이너 이미지 빌드를 해보도록 하겠습니다.   
    
## Dockerfile 작성
테스트에 사용할 Dockerfile 은 아래와 같습니다.   
```docker
FROM --platform=$BUILDPLATFORM golang:alpine AS build
ARG TARGETPLATFORM
ARG BUILDPLATFORM
RUN echo "I am running on $TARGETPLATFORM. This image is builded from $BUILDPLATFORM." > /log
FROM alpine
COPY --from=build /log /log
```
    
## Builder 생성
아래 명령어를 이용하여 `test` builder 를 생성합니다.   
```bash
$ sudo docker buildx create --name test --driver docker-container
test
```
   
## Builder 선택
아래 명령어를 통해 사용 가능한 Builder 목록을 확인 할 수 있습니다.   
```bash
$ sudo docker buildx ls
NAME/NODE DRIVER/ENDPOINT             STATUS   BUILDKIT PLATFORMS
test      docker-container
  test0   unix:///var/run/docker.sock inactive
default * docker
  default default                     running  20.10.23 linux/amd64, linux/386
```
   
아래와 같이 `test` builder 를 선택합니다.   
```bash
$ sudo docker buildx use test
$ sudo docker buildx ls
NAME/NODE DRIVER/ENDPOINT             STATUS   BUILDKIT PLATFORMS
test *    docker-container
  test0   unix:///var/run/docker.sock inactive
default   docker
  default default                     running  20.10.23 linux/amd64, linux/386
```
   
## 멀티 플랫폼용 컨테이너 빌드 및 Dockerhub Push
Dockerhub 에 컨테이너 이미지를 Push 하기 위해 사전에 `docker login` 을 수행합니다.   
   
아래와 같이 테스트 컨테이너 이미지를 빌드합니다.   
```bash
$ sudo docker buildx build --platform linux/amd64,linux/arm64 -t han0495/mul-arch-test:latest . --push
```
   
빌드가 완료되면 Dockerhub 에 아래와 같이 멀티 플랫폼에서 사용이 가능한 컨테이너로 이미지가 Push 되어 있습니다.   
<center><img src="/assets/images/post/2023-04-24-docker-buildx/buildx-1.png" style="max-width: 95%; height: auto;"></center>   
   
## x86 플랫폼 테스트 (t2.micro)
x86 플랫폼에서 해당 이미지를 실행합니다.   
```bash
$ uname -p
x86_64
$ sudo docker run -ti han0495/mul-arch-test cat /log
I am running on linux/amd64. This image is builded from linux/amd64.
```
   
## ARM 플랫폼 테스트 (t4g.small)
ARM 플랫폼에서 해당 이미지를 실행합니다.   
```bash
$ uname -p
aarch64
$ sudo docker run -ti han0495/mul-arch-test cat /log
I am running on linux/arm64. This image is builded from linux/amd64.
```
   
위와 같이 멀티플랫폼용 컨테이너 이미지 빌드가 잘 되고 docker host 아키텍처에 따라 적절한 컨테이너 이미지를 사용하는 것을 확인 할 수 있었습니다.   
   
# 참고 자료
* [https://github.com/docker/buildx](https://github.com/docker/buildx)   
* [https://hub.docker.com/r/han0495/mul-arch-test/tags](https://hub.docker.com/r/han0495/mul-arch-test/tags)   