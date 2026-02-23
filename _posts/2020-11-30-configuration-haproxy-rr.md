---
layout: post
title: "[Linux] haproxy 를 이용한 RoundRobin 구성 (on CentOS7)"
description: " "
author: chhanz
date: 2020-11-30
tags: [linux]
category: linux
---

# haproxy 를 이용한 RoundRobin 구성 (on CentOS7)
   
<center><p><br><img src="http://www.haproxy.org/img/HAProxyCommunityEdition_60px.png" style="max-width: 95%; height: auto;"></p></center>   
 
> ***`HAPROXY` 를 이용하여 HW L4 를 구현 할 수 있다?????***    
   
이번 포스팅에서는 haproxy 의 RoundRobin(rr) 알고리즘을 이용하여 RoundRobin 웹서비스를 구현하도록 하겠습니다.   
   
# 테스트용 웹 서비스
아래와 같이 각각의 flask app 서비스를 하는 웹 서비스를 테스트에 활용합니다.   
```console
[root@k3s-10-50-1-70 ~]# kubectl get all
NAME                 READY   STATUS    RESTARTS   AGE
pod/pod-test-app-1   1/1     Running   0          2m47s
pod/pod-test-app-2   1/1     Running   0          83s
pod/pod-test-app-3   1/1     Running   0          69s

NAME                     TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
service/kubernetes       ClusterIP   10.43.0.1       <none>        443/TCP        54d
service/pod-test-app-1   NodePort    10.43.176.145   <none>        80:31636/TCP   43s   <<
service/pod-test-app-2   NodePort    10.43.172.6     <none>        80:31881/TCP   38s   <<
service/pod-test-app-3   NodePort    10.43.115.212   <none>        80:30230/TCP   36s   <<
```   
   
# haproxy 설치
haproxy 를 설치하기전에 `SELinux`, `firewalld` 는 `disabled` 합니다.   
   
## `SELinux` , `firewalld` 를 사용하려면
만약 `SELinux` 와 `firewalld` 를 사용하려면 아래와 커멘드를 활용합니다.   
### `SELinux` 
```console
# setsebool -P haproxy_connect_any 1
```
### `firewalld`
```console
# firewalld-cmd --add-service=http
# firewalld-cmd --add-service=http --permanent
# firewalld-cmd --reload
```

## Install
설치는 아래 커멘드로 진행됩니다.    
```console
# yum -y install haproxy
```
   
## Start/Stop Service
서비스의 시작/중지는 아래 커멘드로 진행됩니다.   
    + start
    ```console
    # systemctl start haproxy
    ```
    + stop
    ```console
    # systemctl stop haproxy
    ```
# haproxy 설정
기본적으로 haproxy 는 `/etc/haproxy/haproxy.cfg` 설정 파일을 수정하여 설정합니다.   
   
테스트용 서비스를 RoundRobin 구성을 하기 위해 설정 파일을 수정합니다.   
   
```console
...
frontend testweb-front
    bind *:8080
    default_backend testweb-backend
    mode tcp
    option tcplog

backend testweb-backend
    balance roundrobin
    mode tcp
    server w1 10.50.1.70:31636 check
    server w2 10.50.1.70:31881 check
    server w3 10.50.1.70:30230 check
...
```
* 참고 : default 로 포함되어 있던 frontend 및 backend 는 삭제하였습니다.   
   
# haproxy 알고리즘
아래와 같이 `blance` 부분이 알고리즘을 적용하는 설정 부분입니다.   
```console
...
backend testweb-backend
    balance roundrobin   << 
...
```
haproxy 에서 사용 가능한 알고리즘은 아래와 같습니다.   
- `roundrobin` : 순차적으로 분배 (최대 연결 가능 서버 4128개)   
- `static-rr` : 서버에 부여된 가중치(weight)에 따라서 분배   
- `leastconn` : 접속 수가 가장 적은 서버로 분배   
- `source` : 운영 중인 서버의 가중치를 나눠서 접속자 IP를 해싱(hashing)해서 분배   
- `uri` : 접속하는 URI를 해싱해서 운영 중인 서버의 가중치를 나눠서 분배(URI의 길이 또는 depth로 해싱)   
- `rdp-cookie` : TCP 요청에 대한 RDP 쿠키에 따른 분배   
   
# haproxy roundrobin 테스트
실제로 roundrobin 방식으로 웹서비스가 접근이 되는지 확인합니다.   
```bash
[root@lb haproxy]# while true; do curl lb.okd.chhanz.com:8080; done
 Container LAB | POD Working : pod-test-app-1 | v=1
 Container LAB | POD Working : pod-test-app-2 | v=1
 Container LAB | POD Working : pod-test-app-3 | v=1
 Container LAB | POD Working : pod-test-app-1 | v=1
 Container LAB | POD Working : pod-test-app-2 | v=1
 Container LAB | POD Working : pod-test-app-3 | v=1
 Container LAB | POD Working : pod-test-app-1 | v=1
 Container LAB | POD Working : pod-test-app-2 | v=1
 Container LAB | POD Working : pod-test-app-3 | v=1
 Container LAB | POD Working : pod-test-app-1 | v=1
...
```
위와 같이 순서대로 (1 > 2 > 3) 웹서비스에 접근하는 것을 확인 할 수 있었습니다.   
    

# 참고 자료
* [https://cyuu.tistory.com/category/haproxy](https://cyuu.tistory.com/category/haproxy)   