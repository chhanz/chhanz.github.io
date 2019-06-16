---
layout: post
title: "[Kubernetes] Kubernetes HPA 테스트"
description: "Auto-Scale 기능 테스트"
author: chhanz
date: 2019-04-09
tags: [kubernetes]
category: kubernetes
---
# [Kubernetes] Kubernetes Horizontal Pod Autoscaler 테스트
* * *
Kubernetes 의 Horizontal Pod Autoscaler(이하 HPA) 를 테스트 해보겠습니다.   
   
## 부하 테스트 Image 생성
* * *
`Dockerfile` 을 생성합니다.   
~~~Dockerfile
FROM php:5-apache
ADD index.php /var/www/html/index.php
RUN chmod a+rx index.php
~~~
   
Docker image에 같이 추가 될 `index.php` 를 생성합니다.   
~~~php
?php
  $x = 0.0001;
  for ($i = 0; $i <= 1000000; $i++) {
    $x += sqrt($x);
  }
  echo "OK!";
?>
~~~
Image 를 Build 합니다.   
~~~console
# docker build -t hpa-example .
Sending build context to Docker daemon  3.072kB
Step 1/3 : FROM php:5-apache
5-apache: Pulling from library/php
5e6ec7f28fb7: Pull complete
cf165947b5b7: Pull complete
7bd37682846d: Pull complete
99daf8e838e1: Pull complete
ae320713efba: Pull complete
ebcb99c48d8c: Pull complete
9867e71b4ab6: Pull complete
936eb418164a: Pull complete
bc298e7adaf7: Pull complete
ccd61b587bcd: Pull complete
b2d4b347f67c: Pull complete
56e9dde34152: Pull complete
9ad99b17eb78: Pull complete
Digest: sha256:0a40fd273961b99d8afe69a61a68c73c04bc0caa9de384d3b2dd9e7986eec86d
Status: Downloaded newer image for php:5-apache
 ---> 24c791995c1e
Step 2/3 : ADD index.php /var/www/html/index.php
 ---> bcc3ff35ceb8
Step 3/3 : RUN chmod a+rx index.php
 ---> Running in d1e173fb27a3
Removing intermediate container d1e173fb27a3
 ---> f4bb43246866
Successfully built f4bb43246866
Successfully tagged hpa-example:latest
~~~
   
만들어진 이미지를 DockerHub 에 PUSH 합니다.   
~~~console
[root@m01 hpa-example]# docker push han0495/hpa-example
The push refers to repository [docker.io/han0495/hpa-example]
b42dc42a2d18: Pushed
056e15bb815c: Pushed
1aab22401f12: Mounted from library/php
13ab94c9aa15: Mounted from library/php
588ee8a7eeec: Mounted from library/php
bebcda512a6d: Mounted from library/php
5ce59bfe8a3a: Mounted from library/php
d89c229e40ae: Mounted from library/php
9311481e1bdc: Mounted from library/php
4dd88f8a7689: Mounted from library/php
b1841504f6c8: Mounted from library/php
6eb3cfd4ad9e: Mounted from library/php
82bded2c3a7c: Mounted from library/php
b87a266e6a9c: Mounted from library/php
3c816b4ead84: Mounted from library/php
latest: digest: sha256:07c8ebfbe5b8084b878d0ed4ebafe5baad124b0b932e4f56d81480fbf715f03f size: 3449
[root@m01 hpa-example]#
~~~
   
## HPA 생성
* * *
POD 및 HPA 를 아래와 같이 생성합니다.   
~~~console
[root@m01 hpa-example]# kubectl run php-apache --image=han0495/hpa-example --requests=cpu=200m --expose --port=80
kubectl run --generator=deployment/apps.v1 is DEPRECATED and will be removed in a future version. Use kubectl run --generator=run-pod/v1 or kubectl create instead.
service/php-apache created
deployment.apps/php-apache created
 
[root@m01 hpa-example]# kubectl get po
NAME                         READY   STATUS    RESTARTS   AGE
php-apache-9bd5c887f-nm4h5   1/1     Running   0          49s
tomcat-f94554bb9-gkhpz       1/1     Running   0          6h28m
web-7d77974d4c-gd76n         1/1     Running   0          7h52m
[root@m01 hpa-example]# curl 10.233.14.29
OK!
[root@m01 hpa-example]# curl 10.233.14.29
OK!
[root@m01 hpa-example]# kubectl autoscale deployment php-apache --cpu-percent=50 --min=1 --max=10
horizontalpodautoscaler.autoscaling/php-apache autoscaled
[root@m01 hpa-example]#
~~~
POD 가 생성되고 Build 한 Container Image 가 정상적으로 작동 하는지 확인 하였습니다.   

## 부하 테스트
* * *
`busybox` POD 을 생성하고 HPA 를 생성한 POD 에 부하를 생성합니다.   
~~~console
[root@m01 hpa-example]# kubectl run -i --tty load-generator --image=busybox /bin/sh
kubectl run --generator=deployment/apps.v1 is DEPRECATED and will be removed in a future version. Use kubectl run --generator=run-pod/v1 or kubectl create instead.
If you don't see a command prompt, try pressing enter.
/ # while true; do wget -q -O- http://php-apache.default.svc.cluster.local; done
OK!
OK!
OK!
OK!
OK!
OK!
OK!
OK!
OK!
OK!
OK!
OK!
OK!
OK!
OK!
OK!
OK!
OK!
OK!
OK!
~~~
   
부하가 생성이 되고 일정 시간이 지나면, HPA 에서 리소스 사용량이 증가되고 HPA 는 지정한 MAXPODS 값에 맞게 POD의 수를 증가시킵니다.   
~~~console
Every 2.0s: kubectl get hpa;kubectl get po                                                                              Tue Apr  9 19:07:57 2019
 
NAME         REFERENCE               TARGETS    MINPODS   MAXPODS   REPLICAS   AGE
php-apache   Deployment/php-apache   477%/50%   1         10        4          4m21s
NAME                              READY   STATUS              RESTARTS   AGE
load-generator-557649ddcd-jq987   1/1     Running             0          4m9s
php-apache-9bd5c887f-8dc4m        0/1     ContainerCreating   0          4s
php-apache-9bd5c887f-bdrlz        1/1     Running             0          20s
php-apache-9bd5c887f-fthkk        0/1     ContainerCreating   0          4s
php-apache-9bd5c887f-g46b8        0/1     ContainerCreating   0          20s
php-apache-9bd5c887f-hq88l        0/1     ContainerCreating   0          4s
php-apache-9bd5c887f-p6lrq        1/1     Running             0          5m11s
php-apache-9bd5c887f-v5bhw        0/1     ContainerCreating   0          4s
php-apache-9bd5c887f-wjlrm        0/1     ContainerCreating   0          20s
~~~
부하가 477% 이상 발생되면서 POD 이 자동으로 늘어나는 것을 볼 수 있습니다.   
~~~console
Every 2.0s: kubectl get hpa;kubectl get po                                                                              Tue Apr  9 19:08:50 2019
 
NAME         REFERENCE               TARGETS    MINPODS   MAXPODS   REPLICAS   AGE
php-apache   Deployment/php-apache   189%/50%   1         10        10         5m15s
NAME                              READY   STATUS    RESTARTS   AGE
load-generator-557649ddcd-jq987   1/1     Running   0          5m2s
php-apache-9bd5c887f-8dc4m        1/1     Running   0          57s
php-apache-9bd5c887f-bdrlz        1/1     Running   0          73s
php-apache-9bd5c887f-crrsq        1/1     Running   0          41s
php-apache-9bd5c887f-fthkk        1/1     Running   0          57s
php-apache-9bd5c887f-g46b8        1/1     Running   0          73s
php-apache-9bd5c887f-hq88l        1/1     Running   0          57s
php-apache-9bd5c887f-p6lrq        1/1     Running   0          6m4s
php-apache-9bd5c887f-v5bhw        1/1     Running   0          57s
php-apache-9bd5c887f-vs6sl        1/1     Running   0          42s
php-apache-9bd5c887f-wjlrm        1/1     Running   0    
~~~
HPA 가 POD 을 MAXPODS 수까지 생성하였습니다.   
   
~~~console
Every 2.0s: kubectl get hpa;kubectl get po                                                                              Tue Apr  9 19:14:41 2019
 
NAME         REFERENCE               TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
php-apache   Deployment/php-apache   0%/50%    1         10        10         11m
NAME                              READY   STATUS        RESTARTS   AGE
load-generator-557649ddcd-jq987   1/1     Running       0          10m
php-apache-9bd5c887f-bdrlz        0/1     Terminating   0          7m4s
php-apache-9bd5c887f-fthkk        0/1     Terminating   0          6m48s
php-apache-9bd5c887f-g46b8        0/1     Terminating   0          7m4s
php-apache-9bd5c887f-hq88l        0/1     Terminating   0          6m48s
php-apache-9bd5c887f-p6lrq        1/1     Running       0          11m
php-apache-9bd5c887f-vs6sl        0/1     Terminating   0          6m33s
~~~
부하가 중지되면 HPA는 다시 POD의 수를 줄입니다.   

# 참고 자료
* * *
- [https://kubernetes.io/ko/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/](https://kubernetes.io/ko/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/)