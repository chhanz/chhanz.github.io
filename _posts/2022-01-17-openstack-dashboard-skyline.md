---
layout: post
title: "[OpenStack] [Preview] OpenStack Dashboard - Skyline"
description: ""
author: chhanz
date: 2022-01-17
tags: [openstack]
category: openstack
---
# 흥미   
최근 OpenStack 커뮤니티 그룹에서 올라온 글을 보고 기존에 Horizon 의 약한 부분에 대해 매우 아쉬움을 가지고 있던 저는 매우 흥미를 느끼며 이 포스팅을 작성하게 되었습니다.   
   <center><img src="/assets/images/post/2022-01-17-skyline/openinfra.jpg" style="max-width: 95%; height: auto;"></center>   
* 흥미로운 소식 : [https://www.facebook.com/photo/?fbid=10166019386805577&set=gm.5334637036550404](https://www.facebook.com/photo/?fbid=10166019386805577&set=gm.5334637036550404)   
   
# Preview
이 흥미로운 Project 는 Skyline 이라는 이름의 새로운 OpenStack Dashboard Project 입니다.   
[(https://wiki.openstack.org/wiki/Skyline#Description)](https://wiki.openstack.org/wiki/Skyline#Description)      
   
# Install
테스트에 활용된 OpenStack 환경은 아래와 같습니다.   
```console
* OpenStack wallaby (all-in-one version) [deploy tool `kolla-ansible`]
* ubuntu 20.04
```
   
Skyline 에서 사용될 User 를 생성합니다.   
```bash
(osp) root@u-node-1:/etc/kolla# openstack user create --domain default --password-prompt skyline
User Password:
Repeat User Password:
+---------------------+----------------------------------+
| Field               | Value                            |
+---------------------+----------------------------------+
| domain_id           | default                          |
| enabled             | True                             |
| id                  | 1bd73a672fa343569fa4d771eb3f0d23 |
| name                | skyline                          |
| options             | {}                               |
| password_expires_at | None                             |
+---------------------+----------------------------------+
```
   
Service 프로젝트에 skyline 계정 Admin role 을 추가합니다.   
```bash
(osp) root@u-node-1:/etc/kolla# openstack role add --project service --user skyline admin
```
   
### Database 생성
테스트 환경이므로 OpenStack 내부의 mariadb 를 활용합니다.   
(운영 환경에 적용할 경우, 별도의 DB 를 사용하는 것이 좋을 것으로 보입니다.)    
   
kolla-ansible 배포에서 사용된 database `password` 를 확인합니다.   
```bash
(osp) root@u-node-1:/etc/kolla# cat passwords.yml | grep data
...
database_password: R25MrFQko4WhQ8NeTbBZVU36h12v2SREVOrR0fAp
...
```
   
database 생성 및 권한 부여를 합니다.   
```bash
(osp) root@u-node-1:/etc/kolla# mysql -u root -h 10.10.10.11 -p
Enter password: {{ database_password }}
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 1975
Server version: 10.3.31-MariaDB-1:10.3.31+maria~focal-log mariadb.org binary distribution
 
Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.
 
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
 
MariaDB [(none)]> CREATE DATABASE IF NOT EXISTS skyline DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_general_ci;
Query OK, 1 row affected (0.013 sec)
 
MariaDB [(none)]> GRANT ALL PRIVILEGES ON skyline.* TO 'skyline'@'localhost' IDENTIFIED BY 'MySkylineDBPassword';
Query OK, 0 rows affected (0.010 sec)
 
MariaDB [(none)]> GRANT ALL PRIVILEGES ON skyline.* TO 'skyline'@'%'  IDENTIFIED BY 'MySkylineDBPassword';
Query OK, 0 rows affected (0.014 sec)
 
MariaDB [(none)]>
```
   
### Skyline 배포
Source 를 Clone 합니다.   
```bash
(osp) root@u-node-1:/etc/kolla# cd /root
(osp) root@u-node-1:~# git clone https://opendev.org/skyline/skyline-apiserver
Cloning into 'skyline-apiserver'...
remote: Enumerating objects: 277, done.
remote: Counting objects: 100% (277/277), done.
remote: Compressing objects: 100% (137/137), done.
remote: Total 877 (delta 221), reused 140 (delta 140), pack-reused 600
Receiving objects: 100% (877/877), 595.88 KiB | 1.02 MiB/s, done.
Resolving deltas: 100% (497/497), done.
```
   
Default config file 을 `/etc/skyline/skyline.yaml` 로 추가하고 설정을 수정합니다.   
```bash
(osp) root@u-node-1:~# mkdir /etc/skyline
(osp) root@u-node-1:~# cp skyline-apiserver/etc/skyline.yaml.sample /etc/skyline/skyline.yaml
```
   
```console
default:
  access_token_expire: 3600
  access_token_renew: 1800
  cors_allow_origins: []
  database_url: mysql://skyline:MySkylineDBPassword@10.10.10.11:3306/skyline         << 접근이 가능한 database_url 수정 필요 (기존 localhost)
  debug: false
  log_dir: ./log
  secret_key: aCtmgbcUqYUy_HNVg5BDXCaeJgJQzHJXwqbXr0Nmb2o
  session_name: session
developer:
  show_raw_sql: false
openstack:
  base_domains:
  - heat_user_domain
  base_roles:
  - keystone_system_admin
  - keystone_system_reader
  - keystone_project_admin
  - keystone_project_member
  - keystone_project_reader
  - nova_system_admin
  - nova_system_reader
  - nova_project_admin
  - nova_project_member
  - nova_project_reader
  - cinder_system_admin
  - cinder_system_reader
  - cinder_project_admin
  - cinder_project_member
  - cinder_project_reader
  - glance_system_admin
  - glance_system_reader
  - glance_project_admin
  - glance_project_member
  - glance_project_reader
  - neutron_system_admin
  - neutron_system_reader
  - neutron_project_admin
  - neutron_project_member
  - neutron_project_reader
  - heat_system_admin
  - heat_system_reader
  - heat_project_admin
  - heat_project_member
  - heat_project_reader
  - placement_system_admin
  - placement_system_reader
  - panko_system_admin
  - panko_system_reader
  - panko_project_admin
  - panko_project_member
  - panko_project_reader
  - ironic_system_admin
  - ironic_system_reader
  - octavia_system_admin
  - octavia_system_reader
  - octavia_project_admin
  - octavia_project_member
  - octavia_project_reader
  default_region: RegionOne
  extension_mapping:
    fwaas_v2: neutron_firewall
    vpnaas: neutron_vpn
  interface_type: public
  keystone_url: http://10.10.10.250:5000/v3/                          << openstack keystone_url 로 변경
  nginx_prefix: /api/openstack
  reclaim_instance_interval: 604800
  service_mapping:
    compute: nova
    identity: keystone
    image: glance
    network: neutron
    orchestration: heat
    placement: placement
    volumev3: cinder
  system_admin_roles:
  - admin
  - system_admin
  system_project: service
  system_project_domain: Default
  system_reader_roles:
  - system_reader
  system_user_domain: Default
  system_user_name: skyline
  system_user_password: {{ password }}                                  << skyline user 생성할때 입력한 password
setting:
  base_settings:
  - flavor_families
  - gpu_models
  - usb_models
  flavor_families:
  - architecture: x86_architecture
    categories:
    - name: general_purpose
      properties: []
    - name: compute_optimized
      properties: []
    - name: memory_optimized
      properties: []
    - name: high_clock_speed
      properties: []
  - architecture: heterogeneous_computing
    categories:
    - name: compute_optimized_type_with_gpu
      properties: []
    - name: visualization_compute_optimized_type_with_gpu
      properties: []
  gpu_models:
  - nvidia_t4
  usb_models:
  - usb_c
```
   
Bootstrap 을 진행합니다.   
```bash
(osp) root@u-node-1:~/skyline-apiserver/container# docker run -d --name skyline_bootstrap -e KOLLA_BOOTSTRAP="" -v /etc/skyline/skyline.yaml:/etc/skyline/skyline.yaml --net=host 99cloud/skyline:latest
614a74d2204441cfb42266cefe17eb06eb96a4234fd03b1a7e2ddaf64140ab98
 
(osp) root@u-node-1:~/skyline-apiserver/container# docker logs skyline_bootstrap
+ echo '/usr/local/bin/gunicorn -c /etc/skyline/gunicorn.py skyline_apiserver.main:app'
+ mapfile -t CMD
++ xargs -n 1
++ tail /run_command
+ [[ -n 0 ]]
+ cd /skyline/libs/skyline-apiserver/
+ make db_sync
poetry run alembic upgrade head
Skipping virtualenv creation, as specified in config file.
+ exit 0
```
위 과정은 생성한 Database 를 초기화 하는 과정으로 보입니다.   
   
bootstrap 컨테이너를 제거하고 skyline main application 을 배포합니다.   
```bash
(osp) root@u-node-1:~/skyline-apiserver/container# docker rm -f skyline_bootstrap
skyline_bootstrap

(osp) root@u-node-1:~/skyline-apiserver/container# docker run -d --name skyline --restart=always -v /etc/skyline/skyline.yaml:/etc/skyline/skyline.yaml --net=host 99cloud/skyline:latest
8cde23649596ef629558889a0c7b6700b5528da63160154292bcfab17bb24f9b

(osp) root@u-node-1:~/skyline-apiserver/container# docker ps -a
CONTAINER ID   IMAGE                                                                    COMMAND                  CREATED          STATUS                    PORTS     NAMES
8cde23649596   99cloud/skyline:latest     
 
(osp) root@u-node-1:~/skyline-apiserver/container# docker logs -f skyline
...
+ echo 'Running command: /usr/local/bin/gunicorn -c /etc/skyline/gunicorn.py skyline_apiserver.main:app'
+ exec /usr/local/bin/gunicorn -c /etc/skyline/gunicorn.py skyline_apiserver.main:app
+ echo '/usr/local/bin/gunicorn -c /etc/skyline/gunicorn.py skyline_apiserver.main:app'
+ mapfile -t CMD
++ tail /run_command
++ xargs -n 1
+ [[ -n '' ]]
+ nginx-generator -o /etc/nginx/nginx.conf
+ nginx
+ echo 'Running command: /usr/local/bin/gunicorn -c /etc/skyline/gunicorn.py skyline_apiserver.main:app'
+ exec /usr/local/bin/gunicorn -c /etc/skyline/gunicorn.py skyline_apiserver.main:app
Running command: /usr/local/bin/gunicorn -c /etc/skyline/gunicorn.py skyline_apiserver.main:app
```
   
정상적으로 Application 이 작동하면 `https://XXXXXXXXXXXXXXXXXXXX:8080` 으로 접근이 가능합니다.   
   
# Preview
* Login page : region 별로 domain 을 지정 할 수 있도록 되어있습니다. multi region 을 관리하는데 편리함을 위해 만들어진 것으로 보입니다.   
(초기 설치 이후, 중국어로 콘솔이 나와서 매우 당황했으나 언어를 English 로 변경하면 사용하는데 문제가 없었다.)   
   <center><img src="/assets/images/post/2022-01-17-skyline/1.png" style="max-width: 95%; height: auto;"></center>   
   
* Overview page : 프로젝트 Quota 현황을 볼 수 있습니다.   
   <center><img src="/assets/images/post/2022-01-17-skyline/2.png" style="max-width: 95%; height: auto;"></center>   
   
* Instance page : Instance 상세 현황을 볼 수 있습니다.   
(Instance 현황은 `error` 지만 Dashboard 의 화면 구성을 보는데 목적으로 추가하였습니다.)   
   <center><img src="/assets/images/post/2022-01-17-skyline/3.png" style="max-width: 95%; height: auto;"></center>   
      
# 개인적 의견
* 장점   
     * Horizon 보다 빠른 속도   
     * 깔끔하고 정리된 느낌   
* 단점   
     * 아직 정보가 부족함   
   
***총평 : 기존의 Horizon 보다 사용하기 편리했고 빠른 성능으로 인해 불편함을 느끼지 못함. 매우 기대되는 Project 이다!!***   

# 참고 문서
* [https://opendev.org/skyline/skyline-apiserver](https://opendev.org/skyline/skyline-apiserver)   
* [https://satishdotpatel.github.io/openstack-skyline-dashborad/](https://satishdotpatel.github.io/openstack-skyline-dashborad/)   