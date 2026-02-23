---
layout: post
title: "[Container] Container & Orchestration 교육 자료 "
description: " "
author: chhanz
date: 2020-05-21
tags: [docker,podman,kubernetes,openshift]
category: container
---

> 해당 자료는 사내 교육용으로 제작된 자료입니다.   
> 자료 사용시 출처 부탁 드려요.   

* [https://github.com/chhanz/container-hands-on](https://github.com/chhanz/container-hands-on)   
   
# Container & Orchestration 교육 자료
   
# 목차
+ [Docker](#Docker)   
+ [Podman](#Podman)   
+ [Kubernetes](#Kubernetes)   
+ [OpenShift](#OpenShift)   

# Docker {#Docker}
## Hands-on 환경
> OS : CentOS 7.7   
> Disable `SELinux`, `Firewalld`   

## Install
* Install Package    
```bash
$ yum -y install docker
```
* start service `docker`   
```bash
$ systemctl enable --now docker
```

## RUN
* start container `nginx`    
```bash
$ docker run -d -ti --name nginx -p 80:80 nginx
```
   
* check container `nginx`   
```bash
$ docker ps -a 
```
   
* access web
```bash
$ crul http://192.168.200.100
```
<img src="https://raw.githubusercontent.com/chhanz/container-hands-on/master/assets/Docker/img/nginx-page.png" style="max-width: 95%; height: auto;">   

   
* stop container `nginx`   
```bash
$ docker stop nginx
```
   
* delete container `nginx`   
```bash
$ docker rm nginx
```
   
* container images   
```bash
$ docker images
```
   
## Build
> 참고 소스 : [https://github.com/chhanz/docker-swarm-demo](https://github.com/chhanz/docker-swarm-demo)   
   
* create [`Dockerfile`](https://raw.githubusercontent.com/chhanz/container-hands-on/master/assets/Docker/dockerfile/Dockerfile)   

```console
FROM php:7.2-apache
MAINTAINER chhan <cheolhee.han@ibm.com>

ADD htdocs/index.php /var/www/html/index.php

EXPOSE 80 
```
   
* create [`index.php`](https://raw.githubusercontent.com/chhanz/container-hands-on/master/assets/Docker/dockerfile/htdocs/index.php)   
```console
├── Dockerfile
└── htdocs
    └── index.php
```
   
* [`index.php`](https://raw.githubusercontent.com/chhanz/container-hands-on/master/assets/Docker/dockerfile/htdocs/index.php)     

```php
<html>
<head><title>chhan sample page</title></head>
<body>
<center>
<b>
<?php
$host=gethostname();
echo "Container Name : ";
echo $host;
?>
<p> Image Version : original </p>
</b>
</center>
</body>
</html>
```

* build image
```bash
$ docker build -t php-web:v1 .
Sending build context to Docker daemon 69.63 kB
Step 1/4 : FROM php:7.2-apache
Trying to pull repository docker.io/library/php ... 
7.2-apache: Pulling from docker.io/library/php
68ced04f60ab: Already exists
1d2a5d8fa585: Pull complete
5d59ec4ae241: Pull complete
d42331ef4d44: Pull complete
408b7b7ee112: Pull complete
570cd47896d5: Pull complete
2419413b2a16: Pull complete
ece88053da01: Pull complete
b2131b538da3: Pull complete
e26c9457b1ed: Pull complete
6b4ecf095186: Pull complete
6a41f34ff2f0: Pull complete
b6669ed2ef9e: Pull complete
0441670f3790: Pull complete
Digest: sha256:aa35f1d87dc285959f365c0181967956849734577db72b5b30de7cc73308b44f
Status: Downloaded newer image for docker.io/php:7.2-apache
 ---> ba07a75a195b
Step 2/4 : MAINTAINER chhan <cheolhee.han@ibm.com>
 ---> Running in ae0e738f0c73
 ---> 642eae0a1cb5
Removing intermediate container ae0e738f0c73
Step 3/4 : ADD htdocs/index.php /var/www/html/index.php
 ---> 2a23b4d2dc2d
Removing intermediate container f685d41d2501
Step 4/4 : EXPOSE 80
 ---> Running in 18a7ba3a06a8
 ---> d4c7b832c710
Removing intermediate container 18a7ba3a06a8
Successfully built d4c7b832c710
```
   
* change tag
```bash
$ docker tag php-web:v1 han0495/php-web:v1
```
* docker login
```bash
$ docker login
Login with your Docker ID to push and pull images from Docker Hub. If you don't have a Docker ID, head over to https://hub.docker.com to create one.
Username: han0495
Password:
Login Succeeded
```
   
* push image
```bash
$ docker push han0495/php-web:v1
The push refers to a repository [docker.io/han0495/php-web]
89bb5e6b86ac: Pushed
6565bce2d5e5: Mounted from library/php
2159d2f64d7e: Mounted from library/php
7c111aa3fc84: Mounted from library/php
1bc9b7122630: Mounted from library/php
bc4aa4d1d971: Mounted from library/php
8b81b9cd95de: Mounted from library/php
85dc2281e45a: Mounted from library/php
0fc284fc9cf5: Mounted from library/php
732057c800a3: Mounted from library/php
4cc11613548d: Mounted from library/php
df6c050501b6: Mounted from library/php
b4bfb20b5f05: Mounted from library/php
2e8cc9f5313f: Mounted from library/php
f2cb0ecef392: Mounted from library/nginx
v1: digest: sha256:0b13f585044db431341d5cce3b48df37e78598317fdf60f0135ffffb2c89a80c size: 3449
```
<img src="https://raw.githubusercontent.com/chhanz/container-hands-on/master/assets/Docker/img/push-img.png" style="max-width: 95%; height: auto;">   
   
* run
```bash
$ docker run -d -ti --name php-web -p 80:80 han0495/php-web:v1
```
<img src="https://raw.githubusercontent.com/chhanz/container-hands-on/master/assets/Docker/img/php-web-img.png" style="max-width: 95%; height: auto;">   

# Podman {#Podman}
## Hands-on 환경
> OS : CentOS 8.1   
> Disable `SELinux`, `Firewalld`   

## Install
```bash
$ dnf -y install podman
```
   
## RUN
* start container `httpd`    
```bash
$ podman run -d -ti --name web -p 80:80 httpd
```
* check container `nginx`   
```bash
$ podman ps -a 
```
* access web

```bash
$ curl 192.168.200.101
<html><body><h1>It works!</h1></body></html>
```
* 참고 자료: [https://chhanz.github.io/container/2020/03/02/podman/](https://chhanz.github.io/container/2020/03/02/podman/)   

# Kubernetes {#Kubernetes}
## Hands-on 환경
> Kubernetes Master 3 Node cluster 구성   
> Kubernetes Worker 2 Node   
> Kubernetes v1.16.8   
> Docker v18.09.7   
   
## APP 배포(NodePort)
* [`php-web.yaml`](https://raw.githubusercontent.com/chhanz/container-hands-on/master/assets/kubernetes/php-web.yaml) Yaml 작성

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    run: php-web
  name: php-web
spec:
  replicas: 5
  selector:
    matchLabels:
      run: php-web
  template:
    metadata:
      labels:
        run: php-web
    spec:
      containers:
      - image: han0495/php-web:v1
        name: php-web

---

apiVersion: v1
kind: Service
metadata:
  labels:
    run: php-web
  name: php-web
  namespace: default
spec:
  clusterIP: 10.233.25.48
  externalTrafficPolicy: Cluster
  ports:
  - nodePort: 30518
    port: 80
    protocol: TCP
    targetPort: 80
  selector:
    run: php-web
  sessionAffinity: None
  type: NodePort
```
* `php-web` 배포
```bash
$ kubectl create -f php-web.yaml
```
* `php-web` 배포 확인
```bash
$ kubectl get all
```
* `php-web` 서비스 확인

```bash
$ curl worker1.example.com:30518
$ curl worker2.example.com:30518
```
## Kubernetes-dashboard 둘러보기
```bash
$ kubectl get all -l k8s-app=kubernetes-dashboard -A
```
   
## Kubernetes Node 장애 시나리오
```bash
$ kubectl drain worker2.example.com
```
   
# OpenShift {#OpenShift}
## Hands-on 환경
<img src="https://raw.githubusercontent.com/chhanz/container-hands-on/master/assets/openshift/img/infra.png" style="max-width: 95%; height: auto;">   
   
> OpenShift 3 Node cluster 구성   
> OpenShift Worker 2 Node   
> OpenShift Infra 2 Node   
> OpenShift v3.11   
> Docker v1.13.1   

## APP 배포(S2I)

### GIT Source
```bash
$ oc new-app httpd~https://github.com/chhanz/sample-httpd-example.git
$ oc expose service sample-httpd-example
```
### Local Source 
```bash
$ git clone https://github.com/chhanz/sample-httpd-example.git
$ cd sample-httpd-example
$ vi index.html

## 변경된 Source Build
$ oc start-build sample-httpd-example --from-dir=./ --commit=v2
```
## Auto-scaling
* [`Dockerfile`](https://raw.githubusercontent.com/chhanz/container-hands-on/master/assets/kubernetes/Dockerfile) sample source
```Dockerfile
FROM php:5-apache
ADD index.php /var/www/html/index.php
RUN chmod a+rx index.php
```
   
* [`index.php`](https://raw.githubusercontent.com/chhanz/container-hands-on/master/assets/kubernetes/index.php) source   
[CPU 부하 유발 source.](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/#run-expose-php-apache-server)   
```php
<?php
  $x = 0.0001;
  for ($i = 0; $i <= 1000000; $i++) {
    $x += sqrt($x);
  }
  echo "OK!";
?>
```

* Build image : [https://hub.docker.com/r/han0495/hpa-example](https://hub.docker.com/r/han0495/hpa-example)   

### APP 배포
* [`php-apache.yml`](https://raw.githubusercontent.com/chhanz/container-hands-on/master/assets/openshift/php-apache.yml)
```bash
$ oc create -f php-apache.yml
$ oc expose service/php-apache
```

### HPA(Horizontal Pod Autoscaler) 생성
```bash
$ oc autoscale deployment php-apache --cpu-percent=25 --min=1 --max=10
```

### 부하 발생
```bash
$ while true; do wget -q -O- http://php-apache-test-project.apps.chhan.com; done
```
* HPA 상태 확인
```bash
$ oc get hpa
```
* Grafana Dashboard
   
<img src="https://raw.githubusercontent.com/chhanz/container-hands-on/master/assets/openshift/img/load1.png" style="max-width: 95%; height: auto;">   
   
<img src="https://raw.githubusercontent.com/chhanz/container-hands-on/master/assets/openshift/img/load2.png" style="max-width: 95%; height: auto;">   
   
<img src="https://raw.githubusercontent.com/chhanz/container-hands-on/master/assets/openshift/img/load3.png" style="max-width: 95%; height: auto;">   
