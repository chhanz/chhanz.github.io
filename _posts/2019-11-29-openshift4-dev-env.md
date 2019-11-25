---
layout: post
title: "[OpenShift] KVM 환경에 OpenShift 4 구동해보자!"
description: "Install on Laptop: Red Hat CodeReady Containers"
author: chhanz
date: 2019-11-25
tags: [openshift]
category: openshift
---

OpenShift 3.X 에서는 [`minishift`](https://www.okd.io/minishift/) 를 Laptop 에 배포하여 OpenShift 를 체험하고 테스트 간단하게 할 수 있습니다.   
그런데 ___" OpenShift 4.X 에서는 `minishift` 와 같은 테스트 환경을 구축 할 수 없을까? "___ 라는 생각에서 검색을 시작했습니다.   
   
# OpenShift 4 on Laptop 
OpenShift 4 부터는 [`Red Hat OpenShift Cluster Manager`](https://cloud.redhat.com/openshift/) 에서 각종 환경에 배포 할 수 있는 가이드를 제공하고 있습니다.   
<center><img src="/assets/images/post/2019-11-29-openshift-4/image1.png" style="max-width: 90%; height: auto;"></center>   
위와 같이 `Install on Laptop: Red Hat CodeReady Containers` 를 제공하여 `minishift` 와 같은 테스트 환경을 구축 할 수 있게 되어 있습니다.   
   
<center><img src="/assets/images/post/2019-11-29-openshift-4/image2.png" style="max-width: 90%; height: auto;"></center>   
[https://cloud.redhat.com/openshift/install/crc/installer-provisioned](https://cloud.redhat.com/openshift/install/crc/installer-provisioned)   
위 페이지에 접속하면 지원하는 운영체제별로 `crc` 명령을 다운로드 받을 수 있도록 제공하고 있습니다.  
   
저는 Linux 를 선택하고 `libvirt` 를 사용하는 `KVM` 환경에 배포 해보도록 하겠습니다.   
# Install crc command
```bash
$ https://mirror.openshift.com/pub/openshift-v4/clients/crc/latest/crc-linux-amd64.tar.xz
$ xz -d crc-linux-amd64.tar.xz;tar xvf crc-linux-amd64.tar
$ sudo cp crc-linux-1.1.0-amd64/crc /usr/bin/
```
위 과정을 통해 `crc` 명령을 설치합니다. 그리고 `crc` 명령을 통해 OpenShift 를 설치합니다.   
# crc setup
<img src="/assets/images/post/2019-11-29-openshift-4/crc_non_root.png" style="max-width: 70%; height: auto;">   
위와 같이 해당 작업은 sudo 가 가능한 일반 user에서 진행합니다.   
```bash
$ crc setup
```
   
<img src="/assets/images/post/2019-11-29-openshift-4/crc_setup.png" style="max-width: 70%; height: auto;">   
위와 같이 설치가 진행되고 종료가 되면 OpenShift 4 를 시작 할 준비가 다 된 것입니다.   
# crc start
```bash
$ crc start
```
<img src="/assets/images/post/2019-11-29-openshift-4/crc_setup-2.png" style="max-width: 70%; height: auto;">   
`$ crc start` 명령을 시작하면 가상화 환경을 설정하고 `Image pull secret` 을 요구합니다.   
`pull secret` 은 [https://cloud.redhat.com/openshift/install/crc/installer-provisioned](https://cloud.redhat.com/openshift/install/crc/installer-provisioned) 에서 받을 수 있습니다.   
<img src="/assets/images/post/2019-11-29-openshift-4/copy_pull_key.png" style="max-width: 90%; height: auto;">   
`Copy Pull Secret` 버튼을 눌르고 Shell 에 붙여넣기 합니다.   
<img src="/assets/images/post/2019-11-29-openshift-4/crc_setup-3.png" style="max-width: 90%; height: auto;">   
이후 `crc start` 과정을 마무리 합니다.   
<img src="/assets/images/post/2019-11-29-openshift-4/crc_setup-4.png" style="max-width: 90%; height: auto;">   
OpenShift 시작이 완료 되면 위와 같이 `crc oc-env` 를 입력하여 `oc` 명령을 Shell 에서 사용 가능하도록 설정 할 수 있습니다.   
또한, `crc start` 가 완료되며 출력된 내용을 보면   
```
To access the cluster, first set up your environment by following 'crc oc-env' instructionsINFO Then you can access it by running 'oc login -u developer -p developer https://api.crc.testing:6443'
To login as an admin, username is 'kubeadmin' and password is e4FEb-9dxdF-9N2wH-Dj7B8INFOINFO You can now run 'crc console' and use these credentials to access the OpenShift web console
```
`oc login -u developer -p developer https://api.crc.testing:6443` 을 이용하여 CLI 로 접근 할 수도 있고   
`https://api.crc.testing:6443` `KVM` localhost에서 해당 경로로 Web Console 접근이 가능합니다.   
   
다음은 OpenShift 4 의 GUI 에 접근하여 테스트를 해보고 OpenShift 4 를 경험해 보겠습니다.   
    

# OpenShift4 Web Console 이용하기
OpenShift Web Console 로 접근하여 git source 를 이용하여 서비스 배포를 해보겠습니다. ( S2I 기능 테스트 )   
## Source To Image(`S2I`)
<img src="/assets/images/post/2019-11-29-openshift-4/test1.png" style="max-width: 90%; height: auto;">   
git source 와 container image 를 선택하고 Build 합니다.   
<img src="/assets/images/post/2019-11-29-openshift-4/test2.png" style="max-width: 90%; height: auto;">   
S2I 가 정상적으로 작동되고 Build 가 완료된 것을 볼 수 있습니다.   
<img src="/assets/images/post/2019-11-29-openshift-4/test3.png" style="max-width: 90%; height: auto;">   
위와 같이 S2I 가 완료된 서비스가 작동 되는 것을 확인 할 수 있습니다.   
   
   
# 참고 자료
* [https://github.com/chhanz/sample-httpd-example](https://github.com/chhanz/sample-httpd-example)   
* [https://cloud.redhat.com/openshift/install/crc/installer-provisioned](https://cloud.redhat.com/openshift/install/crc/installer-provisioned)   






