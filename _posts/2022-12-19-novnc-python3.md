---
layout: post
title: "[Linux] noVNC 구성 with python3" 
description: ""
author: chhanz
date: 2022-11-11
tags: [linux]
category: linux
---

# noVNC with python2 
[https://chhanz.github.io/linux/2019/12/13/linux-configure-novnc/](https://chhanz.github.io/linux/2019/12/13/linux-configure-novnc/)   

# noVNC 구성
기존에 python2 기반(centos 7)으로 작성되있는 문서에 python3(rhel 8)으로 변경된 부분 업데이트 작성한 문서입니다.   

## noVNC 란?
noVNC는 HTML VNC 클라이언트 프로그램입니다.   
   
## noVNC 구성
TEST ENV : AWS EC2 RHEL 8.6    

* install requirement package
```console
$ sudo dnf -y groupinstall GNOME
$ sudo dnf -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm
```
   
* install `noVNC` package
```console
$ sudo dnf -y install novnc python3-websockify python3-numpy tigervnc-server
```
   
* start service `vncserver`
```console
$ vncserver :1
```
`vncserver` 가 시작되면 `vnc` 접속용 `password` 입력을 요구합니다.    
해당 `password` 는 noVNC 에 접근 할 때 필요한 `password` 입니다.   
   
* start service `websockify`   
    ```console
    $ sudo websockify -D --web=/usr/share/novnc/ 80 localhost:5901
    WebSocket server settings:
      - Listen on :80
      - Web server. Web root: /usr/share/novnc
      - No SSL/TLS support (no cert file)
      - Backgrounding (daemon)
    $ ps -ef | grep websockify
    root       22997       1  9 08:29 ?        00:00:00 /usr/bin/python3 /bin/websockify -D --web=/usr/share/novnc/ 80 localhost:5901
    ```
위와 같이 명령을 수행하면 `80` 포트로 noVNC 서비스가 작동합니다.   

## noVNC 이용
noVNC 가 설치된 서버의 아이피로 접속합니다.   
> ***ex) http://public-ip***   
   
아래와 같이 접속이 되며 연결을 누르게 되면 `vnc password` 를 입력을 요청합니다.   
<center><img src="/assets/images/post/2022-12-19-novnc-py3/1.png" style="max-width: 95%; height: auto;"></center>   
   
`vnc password` 를 입력하면 아래와 같이 `VNC Viewer` 클라이언트 프로그램 없이 웹브라우저를 통해 `VNC` 접속이 가능합니다.   
<center><img src="/assets/images/post/2022-12-19-novnc-py3/2.png" style="max-width: 90%; height: auto;"></center>   

# 참고 자료
* noVNC : [https://github.com/novnc/noVNC](https://github.com/novnc/noVNC)   
* EPEL : [https://docs.fedoraproject.org/en-US/epel/](https://docs.fedoraproject.org/en-US/epel/)   