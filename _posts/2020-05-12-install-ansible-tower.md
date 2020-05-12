---
layout: post
title: "[Ansible] Red Hat Ansible Tower Bundle 설치(v3.6.3)"
description: " "
author: chhanz
date: 2020-05-12
tags: [ansible]
category: ansible
---

# Red Hat Ansible Tower Bundle 설치(v3.6.3)

## Ansible Tower 설치 준비
Ansible Tower 설치를 위해 아래와 같이 Repository 를 `Enable` 합니다.   
```bash
$ subscription-manager repos --enable=rhel-7-server-rpms
$ subscription-manager repos --enable=rhel-7-server-ansible-2.9-rpms
$ subscription-manager repos --enable=rhel-server-rhscl-7-rpms
```

<img src="/assets/images/post/2020-05-12-ansible-tower/1.png" style="max-width: 95%; height: auto;">   
위와 같이 Red Hat Ansible Tower Download Center 에서 `Ansible Tower 3.6.3 Setup Bundle` 을 Download 합니다.   
   
Download 된 Bundle 을 설치할 시스템에 Upload 하고 아래와 같이 진행니다.   
   
```bash
[root@fastvm-r77-99 ~]# tar xzvf ansible-tower-setup-bundle-3.6.3-1.tar.gz

[root@fastvm-r77-99 ~]# cd ansible-tower-setup-bundle-3.6.3-1
```
   
### Ansible Tower 설치 inventory 수정
아래와 같이 Ansible Tower 에서 사용될 Password 를 지정합니다.   
```yaml
$ vi inventory

...

[all:vars]
admin_password='password'        << password 변경

pg_host=''
pg_port=''

pg_database='awx'
pg_username='awx'
pg_password='password'           << password 변경
pg_sslmode='prefer'  # set to 'verify-full' for client-side enforced SSL

rabbitmq_username=tower 
rabbitmq_password='password'     << password 변경
... 

```
   
### 필수 Package 설치
OS 설치 환경에 따라 차이가 있으나, `setup.sh` 에서 자동으로 설치가 진행 안되는 Package 는 수동으로 설치를 진행해야됩니다.   
```bash
$ yum -y install wget curl rsync
```
   
### Ansible Tower 배포
아래 bundle 디렉토리에 있는 `setup.sh` 스크립트를 구동하면 자동으로 ansible core 를 설치하고, 이후 Ansible Tower 를 배포하는 playbook 을 수행합니다.   
```bash
[root@fastvm-r77-99 ansible-tower-setup-bundle-3.6.3-1]# ./setup.sh
```
   
### 배포 완료

<img src="/assets/images/post/2020-05-12-ansible-tower/2.png" style="max-width: 95%; height: auto;">   
위와 같이 배포가 완료되면 Web console 로 접근이 가능합니다.   
`inventory` 에서 지정한 `Admin` 계정의 Password 를 입력하여 접근합니다.   
   
<img src="/assets/images/post/2020-05-12-ansible-tower/3.png" style="max-width: 95%; height: auto;">   
Red Hat 에서 지급된 라이센스 파일을 추가하거나, 서브스크립션이 활성화 되어 있는 RHN 계정을 로그인합니다.   
   
<img src="/assets/images/post/2020-05-12-ansible-tower/4.png" style="max-width: 95%; height: auto;">   
위와 같이 Ansible Tower 배포가 완료 되었습니다.   
   
# 참고 자료
* [https://docs.ansible.com/ansible-tower/latest/html/quickinstall/index.html](https://docs.ansible.com/ansible-tower/latest/html/quickinstall/index.html)   
