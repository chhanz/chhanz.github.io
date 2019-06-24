---
layout: post
title: "[Openshift] Openshift Web Console 을 이용한 배포"
description: " "
author: chhanz
date: 2019-06-24
tags: [openshift]
category: openshift
---

# [Openshift] Openshift Web Console 을 이용한 배포
* * *
<center><img src="/assets/images/post/2019-06-07-okd/openshift-origin-logo.png" style="max-width: 100%; height: auto;"></center>   
   
안녕하세요. chhanz 입니다.   
이전 포스팅인 Openshift Origin 설치에 이어서 Openshift Web Console 을 살펴보고 Web Console 을 이용하여 APP 배포도 해보겠습니다.   
   
## Openshift Web Console 
* * *
기본적으로 설치가 완료된 Openshift는 Web Console 이 `expose` 되어 있습니다.   
생성되어 있는 `route` 를 확인하고 접속 해보도록 하겠습니다.   
   
<center><img src="/assets/images/post/2019-06-24-okd-gui/show-route.png" style="max-width: 100%; height: auto;"></center>   
   
위와 같이 모든 `namespace` 의 `route` 를 확인 할 수 있습니다.   
현재 테스트 시스템에서는 `http://console.apps.example.com` 로 `route` 가 생성이 되어 있습니다.   
해당 `Domain` 으로 접속 해보겠습니다.   
   
<center><img src="/assets/images/post/2019-06-24-okd-gui/okd-login-page.png" style="max-width: 100%; height: auto;"></center>   
   
Openshfit Web Console 에 접근하였습니다.   
   
Openshift Web Console 에서는 기본적으로 3가지의 Web Console 을 제공합니다.
> 1. Service Catalog   
> 2. Application Console   
> 3. Cluster Console   
   
지금부터 각각의 Web Console 을 확인해보고 사용해 보겠습니다.   
# Service Catalog
* * *
Service Catalog 는 Openshift 에서 제공되는 기본적인 APP 을 보여주며, 개발자는 Service Catalog 를 통해 손쉽게 APP 을 배포 할 수 있습니다.   
   
<center><img src="/assets/images/post/2019-06-24-okd-gui/service-catalog/service-catalog-1.png" style="max-width: 100%; height: auto;"></center>   
   
이처럼 제공되는 Service 가 많습니다.   
한번 Service Catalog 를 통해 APP 를 배포 해보도록 하겠습니다.   
   
<center><img src="/assets/images/post/2019-06-24-okd-gui/service-catalog/1-make-apache-app.png" style="max-width: 100%; height: auto;"></center>   
   
Apache HTTPD APP 을 선택합니다.   
   
<center><img src="/assets/images/post/2019-06-24-okd-gui/service-catalog/2-make-apache-app.png" style="max-width: 100%; height: auto;"></center>   
   
APP 이 배포될 Project 및 사용될 `Container Image`, 사용될 `Source` 를 입력합니다.   
   
<center><img src="/assets/images/post/2019-06-24-okd-gui/service-catalog/3-make-apache-app.png" style="max-width: 100%; height: auto;"></center>   
   
APP 에 설정된 결과값이 표시되며, APP 배포가 시작 되었습니다.   
   
<center><img src="/assets/images/post/2019-06-24-okd-gui/service-catalog/4-make-apache-app.png" style="max-width: 100%; height: auto;"></center>   
   
APP 이 배포중에 있습니다.   
   
<center><img src="/assets/images/post/2019-06-24-okd-gui/service-catalog/6-make-apache-app.png" style="max-width: 100%; height: auto;"></center>   
   
배포가 완료된 APP 의 상세 로그를 보면 `Container Image`를 Pull 하고 `Source`를 Clone 하여 해당 APP 에 맞게 자동으로 S2I(Source To Image) 를 진행합니다.   
   
<center><img src="/assets/images/post/2019-06-24-okd-gui/service-catalog/5-make-apache-app.png" style="max-width: 100%; height: auto;"></center>   
   
정상적으로 APP 가 배포되고, 서비스 되는 것을 볼 수 있습니다.   
   
# Application Console
* * *
Application Console 는 현재 Openshift 에서 서비스 중인 APP 에 대해 상세한 관리가 가능한 Web Console 입니다.   
예제를 보면서 기능들을 확인하도록 하겠습니다.   
   
   
<center><img src="/assets/images/post/2019-06-24-okd-gui/app-console/app-console.png" style="max-width: 100%; height: auto;"></center>   
<center><img src="/assets/images/post/2019-06-24-okd-gui/app-console/select-project.png" style="max-width: 100%; height: auto;"></center>   
   
Openshift Cluster 에 만들어진 Project 목록이 표기되며, 이전 포스팅에서 sample APP 를 배포한 `sample-project` 를 선택합니다.   
   
   
## Detail APP  & Scale Out APP
<center><img src="/assets/images/post/2019-06-24-okd-gui/app-console/show-overview.png" style="max-width: 100%; height: auto;"></center>   
<center><img src="/assets/images/post/2019-06-24-okd-gui/app-console/show-detail-app-1.png" style="max-width: 100%; height: auto;"></center>   
배포 되어 있는 sample APP 의 정보를 확인 할 수 있습니다.   
현재 생성되어 있는 Pod 의 수는 3개 이며, http://sampleapp-sample-project.apps.example.com 으로 접근 할 수 있도록 구성이 되어 있습니다.   
Web Console 을 통해 Pod 의 수를 증가해보겠습니다.   

   
<center><img src="/assets/images/post/2019-06-24-okd-gui/app-console/scaleout-app.png" style="max-width: 100%; height: auto;"></center>   
   
Pods 옆 `^` 모양의 버튼을 누르면 바로 내가 원하는 만큼 쉽게 Scale Out 할 수 있습니다.   
   
## Build APP
New Version 의 `Build` 도 Web Console 을 통해 쉽게 `Build` 하고 배포 할 수 있습니다.   
   
<center><img src="/assets/images/post/2019-06-24-okd-gui/app-console/show-build.png" style="max-width: 100%; height: auto;"></center>   
   
`#1` 로 `Build` 되어 있습니다. 아래와 같이 `#1`의 `Build` 로그 또한 확인이 가능합니다.   
   
<center><img src="/assets/images/post/2019-06-24-okd-gui/app-console/show-detail-build.png" style="max-width: 100%; height: auto;"></center>   
   
`#2` 신규 `Source` 를 Git 에서 Clone 하여 New Version 으로 `Build` 하겠습니다.   
   
<center><img src="/assets/images/post/2019-06-24-okd-gui/app-console/new-start-build.png" style="max-width: 100%; height: auto;"></center>   
   
오른쪽 상단의 `Start Build` 버튼을 누르면 바로 `Build` 가 시작됩니다.   
그럼 아래와 같이 `Build` 가 시작되고 완료가 되는 것을 볼 수 있습니다.   
<center><img src="/assets/images/post/2019-06-24-okd-gui/app-console/new-start-build-1.png" style="max-width: 100%; height: auto;"></center>   
<center><img src="/assets/images/post/2019-06-24-okd-gui/app-console/complete-build.png" style="max-width: 100%; height: auto;"></center>   
   
## Monitoring
위와 같이 많은 작업을 Web Console로 할 수 있습니다. 이런 많은 APP 들을 한번에 `Monitoring` 메뉴를 통해 한번에 모니터링 할 수 있습니다.   
<center><img src="/assets/images/post/2019-06-24-okd-gui/app-console/cluster-monitor.png" style="max-width: 100%; height: auto;"></center>   
   
Project 내에 모든 리소스들이 생성되고 추가되고 `Build` 되고 삭제되는 것 등등 많은 `Event` 들이 기록되며 각각의 상세 내역도 확인이 가능합니다.   

# Cluster Console
* * *
마지막으로 Cluster Console 이 있습니다.   
Cluster Console 은 Openshift Cluster 의 인프라 영역까지 관리가 가능한 Web Console 입니다.   
지금까지 설명한 Service Catalog, Application Console 은 개발자를 타겟으로한 Console 이라면, Cluster Console 은 운영자를 타겟으로 만들어진 Console 이라 보면 좋습니다.   
## Project && Status
Cluster Console 에 접근하면 Openshift 에 만들어진 Project 들을 확인 할 수 있으며, 해당 Project 의 자세한 현황도 파악 할 수 있습니다.   
<center><img src="/assets/images/post/2019-06-24-okd-gui/cluster-console/view-project.png" style="max-width: 100%; height: auto;"></center>   
<center><img src="/assets/images/post/2019-06-24-okd-gui/cluster-console/show-detail-status.png" style="max-width: 100%; height: auto;"></center>   
   
## Check Resource
Project 내에 생성된 Pod, Network 등을 쉽게 점검하고 확인 할 수 있습니다.   
<center><img src="/assets/images/post/2019-06-24-okd-gui/cluster-console/show-pod.png" style="max-width: 100%; height: auto;"></center>   
<center><img src="/assets/images/post/2019-06-24-okd-gui/cluster-console/show-detail-pod.png" style="max-width: 100%; height: auto;"></center>   
   
## Create Pod
Web Console 을 통해 직접 `Yaml` 파일 내용을 입력하여 바로 Pod 을 생성 할 수 있습니다.   
<center><img src="/assets/images/post/2019-06-24-okd-gui/cluster-console/1-create-pod.png" style="max-width: 100%; height: auto;"></center>   
`[Workloads]` > `[Pods]` 메뉴에서 `[Create POD]` 버튼을 누르면 아래와 같이 `Yaml` 파일 `Template` 내용이 나옵니다.   
<center><img src="/assets/images/post/2019-06-24-okd-gui/cluster-console/2-create-pod.png" style="max-width: 100%; height: auto;"></center>   
   
<center><img src="/assets/images/post/2019-06-24-okd-gui/cluster-console/3-create-pod.png" style="max-width: 100%; height: auto;"></center>   
   
위와 같이 직접 수정해서 Pod 을 생성하도록 하겠습니다.   
   
<center><img src="/assets/images/post/2019-06-24-okd-gui/cluster-console/4-create-pod.png" style="max-width: 100%; height: auto;"></center>   
   
수정한 내역이 반영되어 바로 Pod 이 생성 된 것을 볼 수 있습니다.   
   
# 마치며
제가 사용해본 Openshift 는 Cli 환경에서 충분이 많은 기능을 구현했다고 생각했습니다.   
하지만 Cli 환경이 미숙한 사용자들의 입장에서 본다면 Openshift 의 Web Console 은 정말 매력적인 기능일 것 같습니다.   
쉽게 Cluster 의 상태를 확인 할 수 있고, 서비스를 배포하고 운영 할 수 있었습니다.   
   
다음 포스팅에서는 Openshfit 의 `HPA` 를 이용하여 Auto Scaling 을 구현해보도록 하겠습니다.   
감사합니다.   

