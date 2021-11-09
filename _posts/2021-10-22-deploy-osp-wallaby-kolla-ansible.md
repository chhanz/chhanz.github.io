---
layout: post
title: "[OpenStack] kolla-ansible 을 이용하여 OpenStack multinode 배포 (wallaby)"
description: ""
author: chhanz
date: 2021-10-22
tags: [openstack]
category: openstack
---

# kolla-ansible 이란? 
Kolla-Ansible 은 Docker 컨테이너에 OpenStack 서비스 및 인프라 구성 요소를 배포하는 Tool 이며, OpenStack 클라우드 운영을 위한 프로덕션 준비 컨테이너 및 배포 도구를 제공합니다.   
   
# deploy openstack
## venv 환경 설정
python venv 환경을 아래와 같이 생성합니다.   
```bash
root@u-node-0:~# python3 -m venv osp
root@u-node-0:~# . osp/bin/activate
```

## requirement module 설치
```bash
(osp) root@u-node-0:~# pip install -U pip
(osp) root@u-node-0:~# pip install 'ansible<3.0'
```
   
## kolla-ansible 설치
```bash
(osp) root@u-node-0:~# pip install kolla-ansible
```

## kolla-ansible config 
아래와 같이 config 및 inventory template 를 copy 하고 ansible 설정을 합니다.   
```bash
(osp) root@u-node-0:~# sudo mkdir -p /etc/kolla
(osp) root@u-node-0:~# cp osp/share/kolla-ansible/etc_examples/kolla/* /etc/kolla/
(osp) root@u-node-0:/etc/kolla# cp ~/osp/share/kolla-ansible/ansible/inventory/* .

(osp) root@u-node-0:/etc/kolla# cat /etc/ansible/ansible.cfg
[defaults]
host_key_checking=False
pipelining=True
forks=100
```
   
## 수정 globals.yml
배포할 환경에 맞게 `globals.yml` 를 수정한다.   
(openstack 이 배포될 환경에 맞게 수정이 필요하다.)   
```bash
---
kolla_base_distro: "ubuntu"
kolla_install_type: "source"
openstack_release: "wallaby"
kolla_internal_vip_address: "10.10.10.250"
kolla_external_vip_address: "10.10.10.250"
docker_registry: 10.10.10.10:4000
network_interface: "ens4"
kolla_external_vip_interface: "ens4"
api_interface: "ens4"
neutron_external_interface: "ens5"
enable_chrony: "yes"
enable_cinder: "yes"
```

## inventory 수정
아래와 같이 배포 환경에 맞게 `multinode` 를 수정한다.
```bash
(osp) root@u-node-0:/etc/kolla# cat multinode 
[control]
control01       ansible_host="u-ctl-4"
control02       ansible_host="u-ctl-5"
control03       ansible_host="u-ctl-6"

[network]
network01       ansible_host="u-network-7"

[compute]
compute01       ansible_host="u-compute-8"
compute02       ansible_host="u-compute-9"
compute03       ansible_host="u-compute-10"

[monitoring]
network01       ansible_host="u-network-7"

[storage]
control01       ansible_host="u-ctl-4"
control02       ansible_host="u-ctl-5"
control03       ansible_host="u-ctl-6"

... 생략 ...
```

## kolla-password 생성
openstack service 에서 사용 될 password 를 생성한다.   
```bash
(osp) root@u-node-0:/etc/kolla# kolla-genpwd
```

## bootstrap
배포전 bootstrap 을 수행한다.  
```bash
(osp) root@u-node-0:/etc/kolla# kolla-ansible -i ./multinode bootstrap-servers
```

## prechecks
precheck 를 수행한다.   
```bash
(osp) root@u-node-0:/etc/kolla# kolla-ansible -i ./multinode prechecks
```
## pull image 
각 node에 image 를 pull 받는다.  
```bash
(osp) root@u-node-0:/etc/kolla# kolla-ansible -i ./multinode pull
```
## deploy
Kolla-ansible을 이용하여 openstack 을 배포한다.  
```bash
(osp) root@u-node-0:/etc/kolla# kolla-ansible -i ./multinode deploy
```

## post openstack 
openstack cli 를 설치한다.  
```bash
pip install python3-openstackclient
```
   
아래와 같이 post-deploy 옵션으로 `admin-openrc.sh` 을 생성한다.  
```bash
kolla-ansible post-deploy
. /etc/kolla/admin-openrc.sh
```
## Check
위와 같이 horizon dashboard 로 접근이 가능하다.   
admin password 는 전 과정에서 생성한 `passwords.yml` 을 참고한다.   
   <center><img src="/assets/images/post/2021-10-22-kolla-ansible/1.png" style="max-width: 95%; height: auto;"></center>   

하기 문서를 참고하여 서비스가 정상적으로 배포가 되었는지 확인한다.   
([https://docs.openstack.org/ocata/ko_KR/install-guide-rdo/nova-verify.html](https://docs.openstack.org/ocata/ko_KR/install-guide-rdo/nova-verify.html))   


# 참고 자료
* [https://docs.openstack.org/kolla-ansible/latest/user/quickstart.html](https://docs.openstack.org/kolla-ansible/latest/user/quickstart.html)   
* [https://docs.openstack.org/ocata/ko_KR/install-guide-rdo/nova-verify.html](https://docs.openstack.org/ocata/ko_KR/install-guide-rdo/nova-verify.html)   
