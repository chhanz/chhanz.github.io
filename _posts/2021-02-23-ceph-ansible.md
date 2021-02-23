---
layout: post
title: "[ceph] ceph-ansible 을 이용하여 ceph 배포 (containerized deployment)"
description: " "
author: chhanz
date: 2021-02-23
tags: [ceph]
category: ceph
---
   
# [ceph] ceph-ansible 을 이용하여 ceph 배포
`ceph-ansible` 을 이용하여 ceph 를 배포해보도록 하겠습니다.   
   
***아래 환경은 ceph 테스트를 위해 배포하는 환경이며 운영 환경에 적합한 환경은 아닙니다.***   
   
### 테스트 환경
![](/assets/images/post/2021-02-23-ceph/testenv.png)   
- deploy/grafana server : CentOS 7.7   
- mon/osd #1 : CentOS 7.7     
    - osd : /dev/sdb (100g), /dev/sdc (100g)   
- mon/osd #2 : CentOS 7.7    
    - osd : /dev/sdb (100g), /dev/sdc (100g)   
- mon/osd #3 : CentOS 7.7    
    - osd : /dev/sdb (100g), /dev/sdc (100g)   
   
# 배포 준비   
## clone `ceph-ansible` 
```bash
[root@ceph-deploy ceph-ansible]# git clone https://github.com/ceph/ceph-ansible.git
Cloning into 'ceph-ansible'...
remote: Enumerating objects: 23, done.
remote: Counting objects: 100% (23/23), done.
remote: Compressing objects: 100% (22/22), done.
remote: Total 56802 (delta 15), reused 1 (delta 1), pack-reused 56779
Receiving objects: 100% (56802/56802), 10.54 MiB | 4.76 MiB/s, done.
Resolving deltas: 100% (39491/39491), done.
```

아래와 같이 checkout 을 하여 ceph version 을 지정합니다.   
```bash
[root@ceph-deploy ceph-ansible]# cd ceph-ansible/
[root@ceph-deploy ceph-ansible]# git checkout stable-5.0
Branch stable-5.0 set up to track remote branch stable-5.0 from origin.
Switched to a new branch 'stable-5.0'
[root@ceph-deploy ceph-ansible]#
[root@ceph-deploy ceph-ansible]#
[root@ceph-deploy ceph-ansible]# git status
# On branch stable-5.0
nothing to commit, working directory clean
[root@ceph-deploy ceph-ansible]#
```
   
## Inventory 작성
아래와 같이 mon 과 osd 가 같은 서버에 구축이 되도록 inventory 를 작성합니다.   
```yaml
[mons]
mon1    ansible_host=10.50.2.66
mon2    ansible_host=10.50.2.67
mon3    ansible_host=10.50.2.68

[osds]
mon1
mon2
mon3

[grafana-server]
deploy    ansible_host=10.50.2.65

[all:vars]
ansible_ssh_user=root
ansible_ssh_pass=testtest
```
   
## group_vars 수정
아래와 같이 sample yaml 을 이용하여 group_vars 를 수정합니다.   
```bash
[root@ceph-deploy ceph-ansible]# cd group_vars
[root@ceph-deploy group_vars]# cp all.yml.sample all.yml        
[root@ceph-deploy group_vars]# cp osds.yml.sample osds.yml
```
   
### `all.yml` 수정
아래와 같이 변수에 대한 값을 입력합니다.
```yaml
---
dummy:
ntp_service_enabled: true
ntp_daemon_type: chronyd
monitor_interface: ens160
public_network: 10.50.2.0/24
cluster_network: 40.40.40.0/24
containerized_deployment: true
dashboard_enabled: True
dashboard_admin_user: admin
dashboard_admin_password: P@ssw0rd
grafana_admin_user: admin
grafana_admin_password: P@ssw0rd
```
   
특히 `containerized_deployment` 는 ceph 를 systemd 가 아닌 container 환경으로 배포하기 위해서는 꼭 설정해야됩니다.   
   
### `osds.yml` 수정
아래와 같이 변수에 대한 값을 입력합니다.
```yaml
---
dummy:
devices:
  - /dev/sdb
  - /dev/sdc
```
   
### `site-container.yml` 준비
아래와 같이 sample file 을 복사합니다.   
```bash
[root@ceph-deploy ceph-ansible]# cp site-container.yml.sample site-container.yml
```
   
## Requirement Package 설치   
아래와 같이 Requirement Package 를 설치합니다.   
```bash
[root@ceph-deploy ceph-ansible]# yum install python3 python3-pip python3-setuptools

* python3 venv 생성
[root@ceph-deploy ~]# python3 -m venv py3
[root@ceph-deploy ~]# source py3/bin/activate

(py3) [root@ceph-deploy ceph-ansible]# pip -V
pip 9.0.3 from /root/py3/lib64/python3.6/site-packages (python 3.6)

(py3) [root@ceph-deploy ceph-ansible]# pip install -U pip
(py3) [root@ceph-deploy ceph-ansible]# pip install -r requirements.txt
(py3) [root@ceph-deploy ceph-ansible]# pip install six
```
   
## ceph 배포
아래 명령을 통해 ceph 배포를 시작합니다.   
```bash
(py3) [root@ceph-deploy ceph-ansible]# ansible-playbook -i inventory site-container.yml
...
배포 완료
...
...
PLAY RECAP ********************************************************************************************************************************************************************************deploy                     : ok=117  changed=26   unreachable=0    failed=0    skipped=300  rescued=0    ignored=0
mon1                       : ok=349  changed=49   unreachable=0    failed=0    skipped=529  rescued=0    ignored=0
mon2                       : ok=270  changed=35   unreachable=0    failed=0    skipped=472  rescued=0    ignored=0
mon3                       : ok=281  changed=39   unreachable=0    failed=0    skipped=471  rescued=0    ignored=0


INSTALLER STATUS **************************************************************************************************************************************************************************Install Ceph Monitor           : Complete (0:01:46)
Install Ceph OSD               : Complete (0:01:17)
Install Ceph Dashboard         : Complete (0:01:23)
Install Ceph Grafana           : Complete (0:01:09)
Install Ceph Node Exporter     : Complete (0:00:31)

Tuesday 23 February 2021  15:36:17 +0900 (0:00:00.067)       0:12:39.483 ******
===============================================================================
ceph-container-common : pulling docker.io/ceph/daemon:latest-octopus image ------------------------------------------------------------------------------------------------------- 163.68s 
/root/ceph-ansible/roles/ceph-container-common/tasks/fetch_image.yml:199 ----------------------------------------------------------------------------------------------------------------- 
ceph-container-engine : install container packages -------------------------------------------------------------------------------------------------------------------------------- 84.46s 
/root/ceph-ansible/roles/ceph-container-engine/tasks/pre_requisites/prerequisites.yml:26 ------------------------------------------------------------------------------------------------- 
gather and delegate facts --------------------------------------------------------------------------------------------------------------------------------------------------------- 24.72s 
/root/ceph-ansible/site-container.yml:38 ------------------------------------------------------------------------------------------------------------------------------------------------- 
ceph-mon : waiting for the monitor(s) to form the quorum... ----------------------------------------------------------------------------------------------------------------------- 21.31s 
/root/ceph-ansible/roles/ceph-mon/tasks/ceph_keys.yml:2 ---------------------------------------------------------------------------------------------------------------------------------- 
ceph-dashboard : create dashboard admin user -------------------------------------------------------------------------------------------------------------------------------------- 20.83s 
/root/ceph-ansible/roles/ceph-dashboard/tasks/configure_dashboard.yml:141 ---------------------------------------------------------------------------------------------------------------- 
ceph-grafana : wait for grafana to start ------------------------------------------------------------------------------------------------------------------------------------------ 15.52s 
/root/ceph-ansible/roles/ceph-grafana/tasks/configure_grafana.yml:112 -------------------------------------------------------------------------------------------------------------------- 
ceph-mgr : wait for all mgr to be up ---------------------------------------------------------------------------------------------------------------------------------------------- 13.90s 
/root/ceph-ansible/roles/ceph-mgr/tasks/mgr_modules.yml:7 -------------------------------------------------------------------------------------------------------------------------------- 
ceph-osd : wait for all osd to be up ---------------------------------------------------------------------------------------------------------------------------------------------- 12.63s 
/root/ceph-ansible/roles/ceph-osd/tasks/main.yml:87 -------------------------------------------------------------------------------------------------------------------------------------- 
ceph-grafana : ship systemd service ----------------------------------------------------------------------------------------------------------------------------------------------- 10.97s 
/root/ceph-ansible/roles/ceph-grafana/tasks/systemd.yml:2 -------------------------------------------------------------------------------------------------------------------------------- 
ceph-osd : use ceph-volume lvm batch to create bluestore osds --------------------------------------------------------------------------------------------------------------------- 10.77s 
/root/ceph-ansible/roles/ceph-osd/tasks/scenarios/lvm-batch.yml:3 ------------------------------------------------------------------------------------------------------------------------ 
ceph-infra : open prometheus port ------------------------------------------------------------------------------------------------------------------------------------------------- 10.76s
/root/ceph-ansible/roles/ceph-infra/tasks/dashboard_firewall.yml:40 ---------------------------------------------------------------------------------------------------------------------- 
ceph-mon : fetch ceph initial keys ------------------------------------------------------------------------------------------------------------------------------------------------- 7.44s 
/root/ceph-ansible/roles/ceph-mon/tasks/ceph_keys.yml:19 --------------------------------------------------------------------------------------------------------------------------------- 
ceph-prometheus : write alertmanager config file ----------------------------------------------------------------------------------------------------------------------------------- 5.69s 
/root/ceph-ansible/roles/ceph-prometheus/tasks/main.yml:48 ------------------------------------------------------------------------------------------------------------------------------- 
ceph-dashboard : copy self-signed generated certificate on mons -------------------------------------------------------------------------------------------------------------------- 4.88s 
/root/ceph-ansible/roles/ceph-dashboard/tasks/configure_dashboard.yml:73 ----------------------------------------------------------------------------------------------------------------- 
ceph-osd : apply operating system tuning ------------------------------------------------------------------------------------------------------------------------------------------- 4.73s 
/root/ceph-ansible/roles/ceph-osd/tasks/system_tuning.yml:50 ----------------------------------------------------------------------------------------------------------------------------- 
ceph-config : create ceph initial directories -------------------------------------------------------------------------------------------------------------------------------------- 4.15s 
/root/ceph-ansible/roles/ceph-config/tasks/create_ceph_initial_dirs.yml:2 ---------------------------------------------------------------------------------------------------------------- 
add modules to ceph-mgr ------------------------------------------------------------------------------------------------------------------------------------------------------------ 4.10s 
/root/ceph-ansible/roles/ceph-mgr/tasks/mgr_modules.yml:40 ------------------------------------------------------------------------------------------------------------------------------- 
ceph-config : create ceph initial directories -------------------------------------------------------------------------------------------------------------------------------------- 3.96s 
/root/ceph-ansible/roles/ceph-config/tasks/create_ceph_initial_dirs.yml:2 ---------------------------------------------------------------------------------------------------------------- 
ceph-container-common : get ceph version ------------------------------------------------------------------------------------------------------------------------------------------- 3.87s 
/root/ceph-ansible/roles/ceph-container-common/tasks/main.yml:13 ------------------------------------------------------------------------------------------------------------------------- 
ceph-container-engine : start container service ------------------------------------------------------------------------------------------------------------------------------------ 3.52s 
/root/ceph-ansible/roles/ceph-container-engine/tasks/pre_requisites/prerequisites.yml:81 ------------------------------------------------------------------------------------------------- 
(py3) [root@ceph-deploy ceph-ansible]#
```
   
# 서비스 점검
Container 로 구성된 ceph 는 아래와 같은 방법으로 mgr 에 ceph 명령을 입력하고 ceph 를 운영 할 수 있습니다.   
```bash
[root@ceph-s1 ~]# docker exec ceph-mgr-ceph-s1 ceph -s
  cluster:
    id:     98b454c8-a44a-41c7-a11d-a20f6d37b672
    health: HEALTH_OK

  services:
    mon: 3 daemons, quorum ceph-s1,ceph-s2,ceph-s3 (age 29m)
    mgr: ceph-s1(active, since 24m), standbys: ceph-s2, ceph-s3
    osd: 6 osds: 6 up (since 27m), 6 in (since 27m)

  data:
    pools:   2 pools, 33 pgs
    objects: 0 objects, 0 B
    usage:   6.0 GiB used, 594 GiB / 600 GiB avail
    pgs:     33 active+clean

[root@ceph-s1 ~]#

[root@ceph-s1 ~]# docker exec ceph-mgr-ceph-s1 ceph mon dump 
epoch 1
fsid 98b454c8-a44a-41c7-a11d-a20f6d37b672
last_changed 2021-02-23T15:30:24.754250+0900
created 2021-02-23T15:30:24.754250+0900
min_mon_release 15 (octopus)
0: [v2:10.50.2.66:3300/0,v1:10.50.2.66:6789/0] mon.ceph-s1
1: [v2:10.50.2.67:3300/0,v1:10.50.2.67:6789/0] mon.ceph-s2
2: [v2:10.50.2.68:3300/0,v1:10.50.2.68:6789/0] mon.ceph-s3
dumped monmap epoch 1
[root@ceph-s1 ~]#
```
   
# ceph dashboard
아래와 같이 mgr IP 를 통해 ceph dashboard 에 접속 할 수 있습니다. (`https://mgr IP:8443`)   
   
![](/assets/images/post/2021-02-23-ceph/login.png)   
![](/assets/images/post/2021-02-23-ceph/status.png)   
   
# 참고 문서
- [https://docs.ceph.com/projects/ceph-ansible/en/latest/index.html](https://docs.ceph.com/projects/ceph-ansible/en/latest/index.html)   