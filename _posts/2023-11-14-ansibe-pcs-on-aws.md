---
layout: post
title: "[Linux] Ansible Playbook 을 이용한 EC2 인스턴스 PCS Cluster 환경 생성" 
description: ""
author: chhanz
date: 2023-11-14
tags: [linux]
category: linux
---

# Ansible Playbook 을 이용한 EC2 인스턴스 Pacemaker Cluster 환경 생성
AWS 에서 Pacemaker 테스트 환경을 구성 할 때, 여러 작업을 Ansible Playbook 을 통해 테스트 환경 구축을 자동화 할 수 있습니다.   
`ansible.ha-cluster-pacemaker` 플레이북을 이용하여 자동화가 되며, 해당 플레이북에 [`Add support for fence_aws`](https://github.com/OndrejHome/ansible.ha-cluster-pacemaker/pull/32) PR 을 진행했고, AWS 에서도 사용이 가능한 Playbook 이 되어서 빠른 테스트 환경 구축에 활용 할 수 있게 되었습니다.    
   
# 테스트 환경
1. EC2 인스턴스를 준비 합니다.   
RHEL-HA AMI 를 이용하여 인스턴스를 생성합니다.   
   
* 참고 : [ansible.fast-ec2](https://github.com/chhanz/ansible.fast-ec2) playbook 을 이용하여 EC2 배포를 자동화합니다.   
   
2. Ansible Role setup
아래와 같이 `ansible.cfg` 를 설정하고 `roles` 경로를 생성합니다.    
    ```
    $ mkdir roles
    $ cat ansible.cfg
    [defaults]
    roles_path=roles
    ```
   
3. install pcs role
아래와 같이 Pacemaker 구축에 사용할 ansible role 을 설치합니다.   
   
    `ansible.pcs-modules-2` 를 설치합니다.   
    ```
    $ ansible-galaxy role install OndrejHome.pcs-modules-2
    Starting galaxy role install process
    - downloading role 'pcs-modules-2', owned by OndrejHome
    - downloading role from https://github.com/OndrejHome/ansible.pcs-modules-2/archive/28.0.0.tar.gz
    - extracting OndrejHome.pcs-modules-2 to /home/ec2-user/roles/OndrejHome.pcs-modules-2
    - OndrejHome.pcs-modules-2 (28.0.0) was installed successfully
    ```
   
    `ansible.ha-cluster-pacemaker` 를 설치합니다.   
    ```
    $ cd roles/
    $ git clone https://github.com/OndrejHome/ansible.ha-cluster-pacemaker.git

    $ ln -s ./OndrejHome.pcs-modules-2 ondrejhome.pcs-modules-2
    ```
   
4. `cluster.yml` 을 작성합니다.   
   
    ```
    $ cat cluster.yml
    - hosts: cluster
      roles:
        - { role: 'ansible.ha-cluster-pacemaker',
                cluster_name: 'aws-cluster',
                cluster_configure_fence_xvm: false,
                cluster_configure_fence_aws: true,
                cluster_configure_stonith_style: 'one-device-per-cluster',
                enable_repos: false,
                fence_aws_region: 'ap-northeast-2' }
    ```
   
      
5. `inventory` 를 작성합니다.   
    ```
    $ cat inventory
    [cluster]
    172.31.0.252    instance_id="i-AAAAAAAAAAAAAAAAA"
    172.31.5.226    instance_id="i-BBBBBBBBBBBBBBBBB"

    [cluster:vars]
    ansible_ssh_user="ec2-user"
    ansible_ssh_private_key_file="~/.ssh/id_rsa"
    ansible_ssh_common_args='-o StrictHostKeyChecking=no'
    ```
    
6. Playbook 을 실행합니다.    
    ```
    $ ansible-playbook -i inventory cluster.yml -v -b
    ...
    PLAY RECAP ********************************************************************************************************************
    172.31.0.252               : ok=27   changed=11   unreachable=0    failed=0    skipped=40   rescued=0    ignored=1
    172.31.5.226               : ok=20   changed=9    unreachable=0    failed=0    skipped=28   rescued=0    ignored=0
    ```
   
7. 설치가 완료된 Cluster 상태를 확인합니다.   
   
   ```
    $ ssh ec2-user@172.31.0.252 "sudo pcs status"
    Cluster name: aws-cluster
    Status of pacemakerd: 'Pacemaker is running' (last updated 2023-11-14 05:20:23Z)
    Cluster Summary:
    * Stack: corosync
    * Current DC: ip-172-31-0-252 (version 2.1.5-9.el9_2.3-a3f44794f94) - partition with quorum
    * Last updated: Tue Nov 14 05:20:23 2023
    * Last change:  Tue Nov 14 05:20:07 2023 by hacluster via crmd on ip-172-31-0-252
    * 2 nodes configured
    * 1 resource instance configured

    Node List:
    * Online: [ ip-172-31-0-252 ip-172-31-5-226 ]

    Full List of Resources:
    * fence-aws    (stonith:fence_aws):     Started ip-172-31-0-252

    Daemon Status:
    corosync: active/enabled
    pacemaker: active/enabled
    pcsd: active/enabled
    ```
     
추가로 아래와 같이 인스턴스 프로파일이 정상적으로 연결이 되어 있으면 `fence_aws` 명령어를 통해 stonith (`fence device`) 테스트가 가능합니다.   
   
    ```
    $ sudo fence_aws -o status -r ap-northeast-2 -n i-AAAAAAAAAAAAAAAAA
    Status: ON
    ```
    
# 참고 문서
* [https://github.com/chhanz/ansible.fast-ec2](https://github.com/chhanz/ansible.fast-ec2)    
* [https://github.com/OndrejHome/ansible.ha-cluster-pacemaker](https://github.com/OndrejHome/ansible.ha-cluster-pacemaker)   
* [https://github.com/OndrejHome/ansible.pcs-modules-2](https://github.com/OndrejHome/ansible.pcs-modules-2)   