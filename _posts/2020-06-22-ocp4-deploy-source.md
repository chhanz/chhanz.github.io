---
layout: post
title: "[OpenShift 4.4] Deploying Applications From Source"
description: " "
author: chhanz
date: 2020-06-22
tags: [kubernetes,openshift]
category: openshift
---
    
> 해당 자료는 사내 교육용으로 제작된 자료입니다.   
> 자료 사용시 출처 부탁 드려요.   
     
# 목차
+ [Deploying Applications From Images](/openshift/2020/06/18/ocp4-deploy-image/)   
+ [Deploying Applications From Source](/openshift/2020/06/22/ocp4-deploy-source/)   
+ [Deploying Applications From Template](/openshift/2020/06/24/ocp4-template/)   
      
# Deploying Applications From Source
이번 Lab 은 Source 를 이용하여 App 을 배포 하도록 하겠습니다.   

# PHP WebApp 배포
> Web Console 로 `developer` 계정으로 로그인합니다.   

<img src="/assets/images/post/2020-06-22-ocp4-source/src-1.png" style="max-width: 95%; height: auto;"><br>
   테스트를 위한 신규 Project 생성합니다.      
<br><img src="/assets/images/post/2020-06-22-ocp4-source/src-2.png" style="max-width: 95%; height: auto;"><br>
`From Git` 항목을 선택합니다.      
<br><img src="/assets/images/post/2020-06-22-ocp4-source/src-3.png" style="max-width: 95%; height: auto;"><br>
소스 주소 `https://github.com/chhanz/docker-swarm-demo.git` 를 입력하고 사용할 `Builder` 로 `PHP` 를 선택합니다.   
<br><img src="/assets/images/post/2020-06-22-ocp4-source/src-4.png" style="max-width: 95%; height: auto;"><br>
`Builder` 로 사용할 `PHP` Version 선택합니다.      
<br><img src="/assets/images/post/2020-06-22-ocp4-source/src-5.png" style="max-width: 95%; height: auto;"><br>
Build 가 시작되는 것을 확인 할 수 있습니다.   
<br><img src="/assets/images/post/2020-06-22-ocp4-source/src-6.png" style="max-width: 95%; height: auto;"><br>
상세 로그를 확인 할 수 있습니다.   
<br><img src="/assets/images/post/2020-06-22-ocp4-source/src-7.png" style="max-width: 95%; height: auto;"><br>
Build 가 완료 되었습니다.(`S2I`)   
<br><img src="/assets/images/post/2020-06-22-ocp4-source/src-8.png"><br>위와 같이 `original` 배포 완료가 된 것을 확인 할 수 있습니다.      
<br><img src="/assets/images/post/2020-06-22-ocp4-source/src-9.png" style="max-width: 95%; height: auto;"><br>
Scale Out 을 수행하여 APP 이 정상 작동하는지 확인 하도록 하겠습니다.      
<br><img src="/assets/images/post/2020-06-22-ocp4-source/src-10.png"><br>Load Balancing 이 잘 되는 것을 확인 할 수 있습니다.   
<br><img src="/assets/images/post/2020-06-22-ocp4-source/src-11.png" style="max-width: 95%; height: auto;"><br>
Source 를 수정하여 `Github` 에 반영해보도록 하겠습니다.      
<br><img src="/assets/images/post/2020-06-22-ocp4-source/src-12.png" style="max-width: 95%; height: auto;"><br>
`Github` 에 Source Push 되었습니다.      
<br><img src="/assets/images/post/2020-06-22-ocp4-source/src-13.png" style="max-width: 95%; height: auto;"><br>
신규 Version 으로 Start Build 합니다.      
<br><img src="/assets/images/post/2020-06-22-ocp4-source/src-14.png" style="max-width: 95%; height: auto;"><br>
Build 가 완료 되었습니다.   
<br><img src="/assets/images/post/2020-06-22-ocp4-source/src-15.png"><br>`Version v2` 배포 완료 되었습니다.      
   