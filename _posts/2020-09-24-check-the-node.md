---
layout: post
title: "[Kubernetes] Node 상태 확인"
description: " "
author: chhanz
date: 2020-09-24
tags: [kubernetes]
category: kubernetes
---
# 목차
+ [Build APP - Container image](/container/2020/09/21/buildah/)   
+ Deploy APP
    + [Build APP](/container/2020/09/22/podman-build-flask-example-app/)   
    + [Create The Deployment](/kubernetes/2020/09/23/create-deployment/)   
+ Check APP
    + [Check The Node](/kubernetes/2020/09/24/check-the-node/)   
    + [Check The APP](/kubernetes/2020/09/24/check-the-app/)   
+ Expose APP   
    + [Expose APP - `NodePort`](/kubernetes/2020/09/25/expose-app/)   
      
# Check The Node
이 문서는 Kubernetes Node 를 확인하는 방법에 대해 포함되어 있습니다.   

# Kubernetes Node
![](https://d33wubrfki0l68.cloudfront.net/5cb72d407cbe2755e581b6de757e0d81760d5b86/a9df9/docs/tutorials/kubernetes-basics/public/images/module_03_nodes.svg)
Kubernetes Node 는 최소한 다음과 같이 동작합니다.   
+ Kubelet은, 쿠버네티스 마스터와 노드 간 통신을 책임지는 프로세스이며, 하나의 머신 상에서 동작하는 파드와 컨테이너를 관리합니다.   
+ (도커, rkt)와 같은 컨테이너 런타임은 레지스트리에서 컨테이너 이미지를 가져와 묶여 있는 것을 풀고 애플리케이션을 동작시키는 책임을 맡습니다.   
   
# Check Kubernetes Node
* Node 정보 확인
    ```bash
    $ kubectl get node
    NAME                    STATUS   ROLES    AGE   VERSION
    fastvm-centos-7-7-110   Ready    master   16d   v1.18.8+k3s1
    ```
* Node 상세 정보 확인
    ```bash
    $ kubectl get node -o wide
    NAME                    STATUS   ROLES    AGE   VERSION        INTERNAL-IP       EXTERNAL-IP   OS-IMAGE                KERNEL-VERSION           CONTAINER-RUNTIME
    fastvm-centos-7-7-110   Ready    master   16d   v1.18.8+k3s1   192.168.200.110   <none>        CentOS Linux 7 (Core)   3.10.0-1062.el7.x86_64   containerd://1.3.3-k3s2
    ```
* Node 성능 사용량 확인
    ```bash
    $ kubectl top nodes
    NAME                    CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
    fastvm-centos-7-7-110   127m         6%     573Mi           66%
    ```
       
   
# Node Management
* Node Schedule 관련
    ```bash
    $ kubectl --help
    ...
      cordon        Mark node as unschedulable
      uncordon      Mark node as schedulable
      drain         Drain node in preparation for maintenance
    ...
    ```
* Mark node as unschedulable   
    ```bash
    $ kubectl cordon <node>
    ````
* Mark node as schedulable
    ```bash
    $ kubectl uncordon <node>
    ````
* Drain node in preparation for maintenance
    ```bash
    $ kubectl drain <node>
    ````
   
# 참고 문서
* [https://github.com/chhanz/kubernetes-hands-on-lab](https://github.com/chhanz/kubernetes-hands-on-lab)   
* [https://github.com/chhanz/kubernetes-hands-on-lab/blob/master/doc/check-the-node.md](https://github.com/chhanz/kubernetes-hands-on-lab/blob/master/doc/check-the-node.md)   
