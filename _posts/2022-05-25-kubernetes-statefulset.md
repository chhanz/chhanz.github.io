---
layout: post
title: "[Kubernetes] Statefulset 와 Headless Service"
description: ""
author: chhanz
date: 2022-05-25
tags: [kubernetes]
category: kubernetes
---
# 목차
+ [Statefuleset 이란?](#info)   
+ [Test](#test)   
+ [Run Statefuleset](#run)   
+ [Headless Service](#headless)   
+ [참고 자료](#refdoc)   
   
# Statefuleset 이란? {#info}
Statefulset 은 deployment 와 유사하게 container spec 기반으로 pod 를 관리하는 resource 이다.   
    
Statefulset 는 아래와 같은 환경을 요구하는 어플리케이션에서 유용하게 사용 할 수 있다.   
> * 안정된, 고유한 네트워크 식별자.   
> * 안정된, 지속성을 갖는 스토리지.   
> * 순차적인, 정상 배포(graceful deployment)와 스케일링.   
> * 순차적인, 자동 롤링 업데이트.   
     
# Test {#test}
아래 yaml 을 이용하여 Statefulset 을 만들었다.   
사용된 어플리케이션은 Flask 이며, App 이 기동될 때 Pod 정보를 PV 에 기록하는 init container 가 수행되도록 작성 되어있다.   
```yaml
---
apiVersion: v1
kind: Service
metadata:
  name: flask
  labels:
    app: flask
spec:
  ports:
  - port: 80
    name: web
  clusterIP: None
  selector:
    app: flask
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: flask
spec:
  selector:
    matchLabels:
      app: flask
  serviceName: "flask"
  replicas: 3
  minReadySeconds: 10
  template:
    metadata:
      labels:
        app: flask
    spec:
      terminationGracePeriodSeconds: 10
      containers:
      - name: flask-app
        image: han0495/flask-example-app
        ports:
        - containerPort: 80
          name: web
        volumeMounts:
        - name: www
          mountPath: /usr/src/app/log
      initContainers:
      - name: init-dump-log
        image: busybox:1.28
        command: ['sh', '-c', "echo $(hostname)-$(date +%s) |tee -a /usr/src/app/log/dump.log"]
        volumeMounts:
        - name: www
          mountPath: /usr/src/app/log
  volumeClaimTemplates:
  - metadata:
      name: www
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: "local-path"
      resources:
        requests:
          storage: 1Gi
```
`/usr/src/app/log` 경로로 `dump.log` 파일을 생성하고 내용에는 Pod Hostname 과 Timestemp 를 기록한다.   
해당 내용은 Pod 가 재기동 될 때도 동일하게 진행하며 내용은 `dump.log` 에 추가된다.   
   
## Run Statefuleset {#run}
Statefulset 을 생성하면 아래와 같이 Pod 가 생성이 된다.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~/lab# k get pod
NAME                         READY   STATUS    RESTARTS   AGE
flask-0                      1/1     Running   0          2m13s
flask-1                      1/1     Running   0          103s
flask-2                      1/1     Running   0          73s
```
여기서 Statefulset 특징이 나오는데 Pod 의 이름과 Pod 실행 순서의 특징을 확인 할 수 있다.   
   
hash 값이 포함이 안된 Pod 이름으로 설정이 되고 Pod 가 동시에 실행이 되는 것이 아니고 Pod 가 순서대로 (0 > 1 > 2) 생성이 된 것을 볼 수 있다.   

## Rule 'Pod Name'   
```console
flask-0
flask-1
...

* 형식 : {Statefulset name}-{0..N-1}
```
   
추가로 Pod 가 생성이 되면서 각 Pod 로 PV 가 Attach 된 것을 확인 할 수 있다.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# k get pvc
NAME          STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
www-flask-0   Bound    pvc-bad300e1-a206-4a6f-a1cc-2c0c14fb3cf1   1Gi        RWO            local-path     5m53s
www-flask-1   Bound    pvc-4602df57-e676-4bc2-86ef-7fa252172967   1Gi        RWO            local-path     5m23s
www-flask-2   Bound    pvc-36dc7a21-c164-407b-9bf6-bb976e7cf417   1Gi        RWO            local-path     4m53s
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# k get pv
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                 STORAGECLASS   REASON   AGE
pvc-36dc7a21-c164-407b-9bf6-bb976e7cf417   1Gi        RWO            Delete           Bound    default/www-flask-2   local-path              4m48s
pvc-4602df57-e676-4bc2-86ef-7fa252172967   1Gi        RWO            Delete           Bound    default/www-flask-1   local-path              5m19s
pvc-bad300e1-a206-4a6f-a1cc-2c0c14fb3cf1   1Gi        RWO            Delete           Bound    default/www-flask-0   local-path              5m48s
```
   
# Headless Service {#headless}
Statefulset 은 안정적인 네트워크를 연동하기 위해 Headless Service 를 사용하여 네트워크 구성을 해야된다.   
생성 방법은 `clusterIP` 의 값을 `None` 으로 생성하면 된다.   

```yaml
---
apiVersion: v1
kind: Service
metadata:
  name: flask
  labels:
    app: flask
spec:
  ports:
  - port: 80
    name: web
  clusterIP: None       <<
  selector:
    app: flask
```
   
생성된 Service 정보.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# k describe svc flask
Name:              flask
Namespace:         default
Labels:            app=flask
Annotations:       <none>
Selector:          app=flask
Type:              ClusterIP
IP Family Policy:  SingleStack
IP Families:       IPv4
IP:                None
IPs:               None
Port:              web  80/TCP
TargetPort:        80/TCP
Endpoints:         172.16.107.16:80,172.16.110.18:80,172.16.234.21:80
Session Affinity:  None
Events:            <none>
```
   
## DNS Rule {#dns}
Statefulset 으로 생성된 Pod 는 아래와 같은 DNS Rule 로 Kuberntes 에서 안정적인 접근을 할 수 있다.   
아래 명령어를 통해 network 점검이 가능한 Pod 를 생성하고 테스트 해보았다.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~#  k run -ti --rm --image=nicolaka/netshoot testpod1 -- zsh
```
   
Service 확인.   
```bash
testpod1  ~  nslookup flask
Server:         10.200.1.10
Address:        10.200.1.10#53
 
Name:   flask.default.svc.cluster.local
Address: 172.16.110.23
Name:   flask.default.svc.cluster.local
Address: 172.16.234.35
Name:   flask.default.svc.cluster.local
Address: 172.16.107.19
 
...
 
* 형식 : {Service name}.{namespace}.svc.{cluster.domain}
```
   
Pod 확인.   
```bash
testpod1  ~  nslookup -type=srv flask
Server:         10.200.1.10
Address:        10.200.1.10#53
 
flask.default.svc.cluster.local service = 0 33 80 flask-0.flask.default.svc.cluster.local.
flask.default.svc.cluster.local service = 0 33 80 flask-1.flask.default.svc.cluster.local.
flask.default.svc.cluster.local service = 0 33 80 flask-2.flask.default.svc.cluster.local.
 
...
 
* 형식 : {Pod name}.{Service name}.{namespace}.svc.{cluster.domain}
```
   
```bash
 testpod1  ~  nslookup flask-0.flask.default.svc.cluster.local
Server:         10.200.1.10
Address:        10.200.1.10#53

Name:   flask-0.flask.default.svc.cluster.local
Address: 172.16.234.35
```

# PV 관련 {#pv}
Statefulset 은 PV 를 동일한 Pod 에 각각 연결되고 Pod 가 재기동이 되도 동일한 Pod 에 다시 연결된다.   
   
생성된 Pod 에 APP 이 발생한 Log 를 확인한다.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# k get pod -o wide -l app=flask
NAME      READY   STATUS    RESTARTS   AGE   IP              NODE          NOMINATED NODE   READINESS GATES
flask-0   1/1     Running   0          13m   172.16.234.21   chhan-k8s-3   <none>           <none>
flask-1   1/1     Running   0          12m   172.16.110.17   chhan-k8s-2   <none>           <none>
flask-2   1/1     Running   0          12m   172.16.107.16   chhan-k8s-4   <none>           <none>

(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# k logs flask-1 init-dump-log
flask-1-1653458449

(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# k exec flask-1 -- cat /usr/src/app/log/dump.log
Defaulted container "flask-app" out of: flask-app, init-dump-log (init)
flask-1-1653458449
```
PV 에 `dump.log` 가 생성된 것을 볼 수 있다.   
   
Pod 를 강제로 delete 해보도록 하자.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# k delete pod flask-1
pod "flask-1" deleted
```
   
Pod 가 재생성 되고,   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# k get pod -o wide -l app=flask
NAME      READY   STATUS            RESTARTS   AGE   IP              NODE          NOMINATED NODE   READINESS GATES
flask-0   1/1     Running           0          14m   172.16.234.21   chhan-k8s-3   <none>           <none>
flask-1   0/1     PodInitializing   0          3s    172.16.110.18   chhan-k8s-2   <none>           <none>          <<<
flask-2   1/1     Running           0          13m   172.16.107.16   chhan-k8s-4   <none>           <none>

(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# k get pod -o wide -l app=flask
NAME      READY   STATUS    RESTARTS   AGE   IP              NODE          NOMINATED NODE   READINESS GATES
flask-0   1/1     Running   0          15m   172.16.234.21   chhan-k8s-3   <none>           <none>
flask-1   1/1     Running   0          14s   172.16.110.18   chhan-k8s-2   <none>           <none>          <<<
flask-2   1/1     Running   0          14m   172.16.107.16   chhan-k8s-4   <none>           <none>
```
   
PV 가 기존 Pod 에 mount 되고 `dump.log` 에 정상적으로 write 되는 것을 확인 해보도록 하자.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# k logs flask-1 init-dump-log
flask-1-1653459303

(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# k exec flask-1 -- cat /usr/src/app/log/dump.log
Defaulted container "flask-app" out of: flask-app, init-dump-log (init)
flask-1-1653458449
flask-1-1653459303
```
   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:/tmp# k describe pod flask-1
...
Volumes:
  www:
    Type:       PersistentVolumeClaim (a reference to a PersistentVolumeClaim in the same namespace)
    ClaimName:  www-flask-1
    ReadOnly:   false
...
```
이전에 사용하던 동일한 PV 가 연결 된 것을 확인 할 수 있다.   
   
# 참고 자료 {#refdoc}
* [https://kubernetes.io/ko/docs/concepts/workloads/controllers/statefulset/](https://kubernetes.io/ko/docs/concepts/workloads/controllers/statefulset/)   
* [https://kubernetes.io/ko/docs/concepts/services-networking/service/#%ED%97%A4%EB%93%9C%EB%A6%AC%EC%8A%A4-headless-%EC%84%9C%EB%B9%84%EC%8A%A4](https://kubernetes.io/ko/docs/concepts/services-networking/service/#%ED%97%A4%EB%93%9C%EB%A6%AC%EC%8A%A4-headless-%EC%84%9C%EB%B9%84%EC%8A%A4)   
* [https://github.com/chhanz/flask-example-app](https://github.com/chhanz/flask-example-app)