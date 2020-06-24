---
layout: post
title: "[OpenShift 4.4] Deploying Applications From Images"
description: " "
author: chhanz
date: 2020-06-18
tags: [kubernetes,openshift]
category: openshift
---
   
> 해당 자료는 사내 교육용으로 제작된 자료입니다.   
> 자료 사용시 출처 부탁 드려요.   
   
# 목차
+ [Deploying Applications From Images](/openshift/2020/06/18/ocp4-deploy-image/)   
+ [Deploying Applications From Source](/openshift/2020/06/22/ocp4-deploy-source/)   
+ [Deploying Applications From Template](/openshift/2020/06/24/ocp4-template/)   
      
# Deploying Applications From Images
이번 Lab 은 Container Image 로 생성된 App 을 배포 하도록 하겠습니다.   
   
## Django WebApp 배포
> Web Console 로 `developer` 계정으로 로그인합니다.

<img src="/assets/images/post/2020-06-18-ocp4-image/img-1.png" style="max-width: 95%; height: auto;">   
* 새로운 Project 를 생성합니다.   
   
<img src="/assets/images/post/2020-06-18-ocp4-image/img-2.png" style="max-width: 95%; height: auto;">      
   
<img src="/assets/images/post/2020-06-18-ocp4-image/img-3.png" style="max-width: 95%; height: auto;">   
* [`openshiftkatacoda/blog-django-py`](https://github.com/openshift-katacoda/blog-django-py) Django WebApp 를 배포합니다.    
* Copy to Paste : `openshiftkatacoda/blog-django-py`   
<img src="/assets/images/post/2020-06-18-ocp4-image/img-4.png" style="max-width: 95%; height: auto;">   
   
<img src="/assets/images/post/2020-06-18-ocp4-image/img-5.png" style="max-width: 95%; height: auto;">   
   
<img src="/assets/images/post/2020-06-18-ocp4-image/img-6.png" style="max-width: 95%; height: auto;">   
   
<img src="/assets/images/post/2020-06-18-ocp4-image/img-7.png" style="max-width: 95%; height: auto;">   
배포 완료!   
      
## CLI 로 배포
```bash
$ oc login -u developer
$ oc project django-project
$ oc new-app openshiftkatacoda/blog-django-py --name blog-from-image
$ oc expose svc/blog-from-image

$ oc get all
NAME                                  READY   STATUS      RESTARTS   AGE
pod/blog-django-py-6b787ccc9f-hl7tk   1/1     Running     0          16m
pod/blog-from-image-1-74snj           1/1     Running     0          41s
pod/blog-from-image-1-deploy          0/1     Completed   0          45s

NAME                                      DESIRED   CURRENT   READY   AGE
replicationcontroller/blog-from-image-1   1         1         1       45s

NAME                      TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/blog-django-py    ClusterIP   172.30.139.80   <none>        8080/TCP   16m
service/blog-from-image   ClusterIP   172.30.210.95   <none>        8080/TCP   48s

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/blog-django-py   1/1     1            1           16m

NAME                                        DESIRED   CURRENT   READY   AGE
replicaset.apps/blog-django-py-6b787ccc9f   1         1         1       16m
replicaset.apps/blog-django-py-6f84ff6b79   0         0         0       16m

NAME                                                 REVISION   DESIRED   CURRENT   TRIGGERED BY
deploymentconfig.apps.openshift.io/blog-from-image   1          1         1         config,image(blog-from-image:latest)

NAME                                             IMAGE REPOSITORY                                                                  TAGS     UPDATED
imagestream.image.openshift.io/blog-django-py    image-registry.openshift-image-registry.svc:5000/django-project/blog-django-py    latest   16 minutes ago
imagestream.image.openshift.io/blog-from-image   image-registry.openshift-image-registry.svc:5000/django-project/blog-from-image   latest   46 seconds ago

NAME                                       HOST/PORT                                           PATH   SERVICES          PORT       TERMINATION   WILDCARD
route.route.openshift.io/blog-django-py    blog-django-py-django-project.apps.ocp.chhan.com           blog-django-py    8080-tcp                 None
route.route.openshift.io/blog-from-image   blog-from-image-django-project.apps.ocp.chhan.com          blog-from-image   8080-tcp                 None
```
   
## 간단한 Container Image 를 Build 해봅시다.
* 참고 자료 : [Best practices for writing Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)   
```docker
FROM httpd:2.4
COPY index.html /usr/local/apache2/htdocs/
EXPOSE 80
```   
   
해당 경로에는 [`Dockerfile`](https://raw.githubusercontent.com/chhanz/sample-httpd-example/master/Dockerfile) 및 [`index.html`](https://raw.githubusercontent.com/chhanz/sample-httpd-example/master/index.html) 파일이 필요합니다.   
   
### Build
```bash
$ docker build -t han0495/sample-httpd .
Sending build context to Docker daemon  3.072kB
Step 1/3 : FROM httpd:2.4
2.4: Pulling from library/httpd
afb6ec6fdc1c: Pull complete
5a6b409207a3: Pull complete
41e5e22239e2: Pull complete
9829f70a6a6b: Pull complete
3cd774fea202: Pull complete
Digest: sha256:db9c3bca36edb5d961d70f83b13e65e552641e00a7eb80bf435cbe9912afcb1f
Status: Downloaded newer image for httpd:2.4
 ---> d4e60c8eb27a
Step 2/3 : COPY index.html /usr/local/apache2/htdocs/
 ---> caf363ed04d9
Step 3/3 : EXPOSE 80
 ---> Running in d2052322cca7
Removing intermediate container d2052322cca7
 ---> bf4d56b96457
Successfully built bf4d56b96457
Successfully tagged han0495/sample-httpd:latest
```
### Push
```bash
$ docker login
$ docker push <DockerHub 계정>/sample-httpd
```
   
### Deploy
<img src="/assets/images/post/2020-06-18-ocp4-image/img-8.png" style="max-width: 95%; height: auto;">   
<img src="/assets/images/post/2020-06-18-ocp4-image/img-9.png" style="max-width: 95%; height: auto;">   
   
 배포에 문제가 생기는 경우, `SCC` 를 확인합니다.   
      
# 참고 자료
* [https://hub.docker.com/r/han0495/sample-httpd](https://hub.docker.com/r/han0495/sample-httpd)   
* [https://github.com/chhanz/sample-httpd-example](https://github.com/chhanz/sample-httpd-example)   
* [https://chhanz.github.io/openshift/2019/11/25/openshift4-dev-env/](https://chhanz.github.io/openshift/2019/11/25/openshift4-dev-env/)   
* [https://docs.openshift.com/container-platform/4.4/authentication/managing-security-context-constraints.html](https://docs.openshift.com/container-platform/4.4/authentication/managing-security-context-constraints.html)   