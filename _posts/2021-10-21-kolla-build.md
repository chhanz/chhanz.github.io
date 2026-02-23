---
layout: post
title: "[OpenStack] kolla-build 를 이용한 kolla image build (wallaby)"
description: ""
author: chhanz
date: 2021-10-21
tags: [openstack]
category: openstack
---

# Registry 
kolla-build 를 통해 생성한 이미지를 저장할 사설 Registry 를 만든다.   
   
## deploy registry
아래와 같이 배포 진행한다.   
```bash
(osp) root@u-node-0:/etc/kolla# docker run -d -p 4000:5000 --name registry -v /etc/kolla/build:/var/lib/registry registry:2
```
   
아래와 같이 `insecure-registries` 를 설정한다.   
추가로 kolla-image 를 pull 받을 node 들도 동일하게 설정을 한다.   
```bash
(osp) root@u-node-0:/etc/docker# cat /etc/docker/daemon.json
{
          "insecure-registries" : ["10.10.10.10:4000"]
}
(osp) root@u-node-0:/etc/docker#
```
   
# Install kolla-build
kolla-build 를 사용하기 위해 아래와 같이 pip module 을 설치합니다.   
```bash
(osp) root@u-node-0:/etc/kolla# pip install kollaCollecting kolla
  Downloading kolla-12.0.1-py3-none-any.whl (381 kB)
     |████████████████████████████████| 381 kB 1.8 MB/s
Requirement already satisfied: oslo.config>=5.1.0 in /root/osp/lib/python3.8/site-packages (from kolla) (8.7.1)
Collecting docker>=2.4.2
  Downloading docker-5.0.0-py2.py3-none-any.whl (146 kB)
     |████████████████████████████████| 146 kB 20.8 MB/s
Requirement already satisfied: pbr!=2.1.0,>=2.0.0 in /root/osp/lib/python3.8/site-packages (from kolla) (5.6.0)
Requirement already satisfied: Jinja2>=2.8 in /root/osp/lib/python3.8/site-packages (from kolla) (3.0.1)
Collecting GitPython>=1.0.1
  Downloading GitPython-3.1.18-py3-none-any.whl (170 kB)
     |████████████████████████████████| 170 kB 22.2 MB/s
Collecting websocket-client>=0.32.0
  Downloading websocket_client-1.1.0-py2.py3-none-any.whl (68 kB)
     |████████████████████████████████| 68 kB 9.0 MB/s
Requirement already satisfied: requests!=2.18.0,>=2.14.2 in /root/osp/lib/python3.8/site-packages (from docker>=2.4.2->kolla) (2.26.0)
Collecting gitdb<5,>=4.0.1
  Downloading gitdb-4.0.7-py3-none-any.whl (63 kB)
     |████████████████████████████████| 63 kB 2.5 MB/s
Collecting smmap<5,>=3.0.1
  Downloading smmap-4.0.0-py2.py3-none-any.whl (24 kB)
Requirement already satisfied: MarkupSafe>=2.0 in /root/osp/lib/python3.8/site-packages (from Jinja2>=2.8->kolla) (2.0.1)
Requirement already satisfied: oslo.i18n>=3.15.3 in /root/osp/lib/python3.8/site-packages (from oslo.config>=5.1.0->kolla) (5.0.1)
Requirement already satisfied: debtcollector>=1.2.0 in /root/osp/lib/python3.8/site-packages (from oslo.config>=5.1.0->kolla) (2.2.0)
Requirement already satisfied: stevedore>=1.20.0 in /root/osp/lib/python3.8/site-packages (from oslo.config>=5.1.0->kolla) (3.3.0)
Requirement already satisfied: PyYAML>=5.1 in /root/osp/lib/python3.8/site-packages (from oslo.config>=5.1.0->kolla) (5.4.1)
Requirement already satisfied: netaddr>=0.7.18 in /root/osp/lib/python3.8/site-packages (from oslo.config>=5.1.0->kolla) (0.8.0)
Requirement already satisfied: rfc3986>=1.2.0 in /root/osp/lib/python3.8/site-packages (from oslo.config>=5.1.0->kolla) (1.5.0)
Requirement already satisfied: six>=1.10.0 in /root/osp/lib/python3.8/site-packages (from debtcollector>=1.2.0->oslo.config>=5.1.0->kolla) (1.16.0)
Requirement already satisfied: wrapt>=1.7.0 in /root/osp/lib/python3.8/site-packages (from debtcollector>=1.2.0->oslo.config>=5.1.0->kolla) (1.12.1)
Requirement already satisfied: charset-normalizer~=2.0.0 in /root/osp/lib/python3.8/site-packages (from requests!=2.18.0,>=2.14.2->docker>=2.4.2->kolla) (2.0.4)
Requirement already satisfied: urllib3<1.27,>=1.21.1 in /root/osp/lib/python3.8/site-packages (from requests!=2.18.0,>=2.14.2->docker>=2.4.2->kolla) (1.26.6)
Requirement already satisfied: idna<4,>=2.5 in /root/osp/lib/python3.8/site-packages (from requests!=2.18.0,>=2.14.2->docker>=2.4.2->kolla) (3.2)
Requirement already satisfied: certifi>=2017.4.17 in /root/osp/lib/python3.8/site-packages (from requests!=2.18.0,>=2.14.2->docker>=2.4.2->kolla) (2021.5.30)
Installing collected packages: smmap, websocket-client, gitdb, GitPython, docker, kolla
Successfully installed GitPython-3.1.18 docker-5.0.0 gitdb-4.0.7 kolla-12.0.1 smmap-4.0.0 websocket-client-1.1.0
```
   
# build image
아래 명령을 통해 kolla-image 를 build 할 수 있다.   
```bash
(osp) root@u-node-0:/etc/kolla# kolla-build --registry 10.10.10.10:4000 -b ubuntu -t source --openstack-release wallaby --push --tag wallaby
```
base image 는 ubuntu 를 사용하고 openstack version 은 wallaby 로 지정했다.   
   
build 가 완료 되면 아래와 같이 지정한 tag 로 image 가 build 된 것을 볼 수 있다.   
```bash
osp) root@u-node-0:/etc/kolla# docker images
REPOSITORY                                                               TAG       IMAGE ID       CREATED             SIZE
10.10.10.10:4000/kolla/ubuntu-source-bifrost-deploy                      wallaby   1b1326827dbf   45 minutes ago      1.87GB
10.10.10.10:4000/kolla/ubuntu-source-bifrost-base                        wallaby   cd0eb65edda7   45 minutes ago      1.85GB
10.10.10.10:4000/kolla/ubuntu-source-ironic-conductor                    wallaby   7d06430242ef   47 minutes ago      1.32GB
10.10.10.10:4000/kolla/ubuntu-source-cinder-volume                       wallaby   a6ee5035a3f1   49 minutes ago      1.25GB
10.10.10.10:4000/kolla/ubuntu-source-monasca-api                         wallaby   0503276e0e16   49 minutes ago      942MB
10.10.10.10:4000/kolla/ubuntu-source-cinder-backup                       wallaby   fcec7cfbfc4c   49 minutes ago      1.24GB
10.10.10.10:4000/kolla/ubuntu-source-cinder-api                          wallaby   64557aaef6e5   49 minutes ago      1.22GB
10.10.10.10:4000/kolla/ubuntu-source-neutron-infoblox-ipam-agent         wallaby   aa23a9c3ad21   49 minutes ago      1.01GB
10.10.10.10:4000/kolla/ubuntu-source-manila-share                        wallaby   8cdd929f6a20   49 minutes ago      1.07GB
10.10.10.10:4000/kolla/ubuntu-source-monasca-agent                       wallaby   63c0f5d7b3f7   49 minutes ago      897MB
10.10.10.10:4000/kolla/ubuntu-source-cinder-scheduler                    wallaby   65ac9546103e   49 minutes ago      1.22GB
10.10.10.10:4000/kolla/ubuntu-source-watcher-applier                     wallaby   b1b492b6db10   49 minutes ago      886MB
10.10.10.10:4000/kolla/ubuntu-source-monasca-persister                   wallaby   dbd1c1090cbd   49 minutes ago      895MB
10.10.10.10:4000/kolla/ubuntu-source-monasca-notification                wallaby   4e1d2960c5cd   49 minutes ago      885MB
10.10.10.10:4000/kolla/ubuntu-source-watcher-api                         wallaby   d526a3cd9e21   49 minutes ago      886MB
10.10.10.10:4000/kolla/ubuntu-source-watcher-engine                      wallaby   82faadd15d21   49 minutes ago      886MB
10.10.10.10:4000/kolla/ubuntu-source-cyborg-agent                        wallaby   9b2d20d94f53   49 minutes ago      875MB
10.10.10.10:4000/kolla/ubuntu-source-magnum-api                          wallaby   7275d24d098a   50 minutes ago      916MB

...
```

# 참고 자료
* [https://docs.openstack.org/kolla/latest/admin/image-building.html](https://docs.openstack.org/kolla/latest/admin/image-building.html)   