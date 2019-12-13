---
layout: post
title: "[Linux] noVNC 구성"
description: " "
author: chhanz
date: 2019-12-13
tags: [linux]
category: linux
---

# noVNC 구성
## noVNC 란?
noVNC는 HTML VNC 클라이언트 프로그램입니다.   
   
## noVNC 구성
* install requirement package
```console
$ yum -y groupinstall "GNOME Desktop"
$ yum -y install epel-release
```
   
* install `noVNC` package
```console
$ yum -y install novnc python-websockify numpy tigervnc-server
```
   
* start service `vncserver`
```console
$ vncserver :1
```
`vncserver` 가 시작되면 `vnc` 접속용 `password` 입력을 요구합니다.    
해당 `password` 는 noVNC 에 접근 할 때 필요한 `password` 입니다.   
   
* start service `websockify`
```console
$ websockify -D --web=/usr/share/novnc/ 6080 localhost:5901
```
위와 같이 명령을 수행하면 `6080` 포트로 noVNC 서비스가 작동합니다.   

## noVNC 이용
noVNC 가 설치된 서버의 아이피로 접속합니다.   
> ***ex) http://192.168.100.100:6080***   
   
아래와 같이 접속이 되며 `vnc password` 를 입력을 요청합니다.   
<center><img src="/assets/images/post/2019-12-13-novnc/image1.png" style="max-width: 95%; height: auto;"></center>   
   
`vnc password` 를 입력하면 아래와 같이 `VNC Viewer` 클라이언트 프로그램 없이 웹브라우저를 통해 `VNC` 접속이 가능합니다.   
<center><img src="/assets/images/post/2019-12-13-novnc/image2.png" style="max-width: 90%; height: auto;"></center>   

# 참고 자료
* noVNC : [https://github.com/novnc/noVNC](https://github.com/novnc/noVNC)   
