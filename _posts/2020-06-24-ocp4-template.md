---
layout: post
title: "[OpenShift 4.4] Deploying Applications From Template"
description: " "
author: chhanz
date: 2020-06-24
tags: [kubernetes,openshift]
category: openshift
---
    
> 해당 자료는 사내 교육용으로 제작된 자료입니다.   
> 자료 사용시 출처 부탁 드려요.   
     
# 목차
+ [Deploying Applications From Images](/openshift/2020/06/18/ocp4-deploy-image/)   
+ [Deploying Applications From Source](/openshift/2020/06/22/ocp4-deploy-source/)   
+ [Deploying Applications From Template](/openshift/2020/06/24/ocp4-template/)   
      
# Deploying Applications From Template
이번 Lab 은 Template 로 생성된 App 을 배포 하도록 하겠습니다.   
   
## Django + pgsql 배포 (no pv)
<img src="/assets/images/post/2020-06-24-ocp4-template/temp-1.png" style="max-width: 95%; height: auto;"><br>신규 Project 생성   
<br><img src="/assets/images/post/2020-06-24-ocp4-template/temp-2.png" style="max-width: 95%; height: auto;"><br>
`From Catalog` 를 선택합니다.      
<br><img src="/assets/images/post/2020-06-24-ocp4-template/temp-3.png" style="max-width: 95%; height: auto;"><br>Django + pgsql(Ephemeral) 선택합니다.   
<br><img src="/assets/images/post/2020-06-24-ocp4-template/temp-4.png" style="max-width: 95%; height: auto;"><br>   
<br><img src="/assets/images/post/2020-06-24-ocp4-template/temp-5.png" style="max-width: 95%; height: auto;"><br>
필요한 옵션을 입력하고 APP 을 배포합니다.      
<br><img src="/assets/images/post/2020-06-24-ocp4-template/temp-6.png" style="max-width: 95%; height: auto;"><br>
pgsql 이 배포됩니다.   
<br><img src="/assets/images/post/2020-06-24-ocp4-template/temp-7.png" style="max-width: 95%; height: auto;"><br>
Django 가 Build 됩니다.   
<br><img src="/assets/images/post/2020-06-24-ocp4-template/temp-8.png" style="max-width: 95%; height: auto;"><br>   
<br><img src="/assets/images/post/2020-06-24-ocp4-template/temp-9.png" style="max-width: 95%; height: auto;"><br>
Page Views 수가 올라가면서 해당 데이터는 DB 에 저장됩니다.   
   
***하지만 해당 Template 는 no PV 옵션으로 Pod 이 재생성되면 데이터는 삭제됩니다.***
    
## Django + pgsql 배포 (Use pv)
* [https://chhanz.github.io/kubernetes/2019/04/15/kubernetes-chapter-2-network-volume/](https://chhanz.github.io/kubernetes/2019/04/15/kubernetes-chapter-2-network-volume/)   
   
위와 같이 Template 를 이용하여 App 를 배포합니다.   
차이점은 PV 를 `cluster-admin` 이 PV 를 생성하고 제공해야됩니다.   
<img src="/assets/images/post/2020-06-24-ocp4-template/temp-10.png" style="max-width: 95%; height: auto;">   
PV 를 사용하여 배포하겠습니다.   
<br><img src="/assets/images/post/2020-06-24-ocp4-template/temp-11.png" style="max-width: 95%; height: auto;"><br>
<br><img src="/assets/images/post/2020-06-24-ocp4-template/temp-12.png" style="max-width: 95%; height: auto;"><br>
위와 같이 PV 로 사용중인 NFS 에 DATA 가 저장 되는 것을 볼 수 있습니다.   

```bash
$ oc get pvc -A
NAMESPACE                  NAME                     STATUS   VOLUME            CAPACITY   ACCESS MODES   STORAGECLASS   AGE
openshift-image-registry   image-registry-storage   Bound    registry-pv0001   100Gi      RWX                           32h
pv-test-project            postgresql               Bound    pv0003            10Gi       RWO                           55s

$ oc get pv
NAME              CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM                                             STORAGECLASS   REASON   AGE
pv0001            10Gi       RWO            Recycle          Available                                                                             98m
pv0002            10Gi       RWO            Recycle          Available                                                                             98m
pv0003            10Gi       RWO            Recycle          Bound       pv-test-project/postgresql                                                98m
pv0004            10Gi       RWX            Retain           Available                                                                             98m
pv0005            10Gi       RWX            Retain           Available                                                                             98m
pv0006            10Gi       RWX            Retain           Available                                                                             98m
registry-pv0001   100Gi      RWX            Retain           Bound       openshift-image-registry/image-registry-storage                           32h
```
위와 같이 pvc 가 생성이 되고 pvc 조건에 맞는 pv 가 Bound 됩니다.   

## PV 할당 정보 확인
<img src="/assets/images/post/2020-06-24-ocp4-template/temp-13.png" style="max-width: 95%; height: auto;">   
<br><img src="/assets/images/post/2020-06-24-ocp4-template/temp-14.png" style="max-width: 95%; height: auto;">   

