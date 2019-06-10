---
layout: post
title: "[Openshift] Openshift Origin v3.11 설치, App 배포"
description: " "
author: chhanz
date: 2019-06-07
tags: [openshift]
category: openshift
---

<center><img src="/assets/images/post/2019-06-07-okd/openshift-origin-logo.png" style="max-width: 100%; height: auto;"></center>   
   
안녕하세요 chhanz 입니다.   
이번 포스팅에서는 Kubernetes에 기반을 둔 Developer-Oriented PaaS 인 Openshift를 살펴볼 것입니다.   
   
# Openshift 란?
---
OpenShift 는 개발자 및 IT 운영팀을 단일 플랫폼에서 통합하여, 하이브리드 클라우드 및 멀티 클라우드 인프라 전반에서 애플리케이션을 일관되게 구축, 배포 및 관리하도록 지원하는 플랫폼입니다.   

# Openshift 이점
---
## 주요 이점
 - 애플리케이션 라이프사이클 전반에 걸쳐 운영 및 개발팀에서 더 큰 가치 실현   
 - 애플리케이션 개발 주기 단축 및 소프트웨어 배포 빈도 증가   
 - 하이브리드 클라우드 및 멀티 클라우드 전반에서 IT 운영 비용 절감 및 애플리케이션 이식성 실현   
   
## 개발팀을 위한 이점
>- Openshift는 개발자에게 셀프 서비스 방식으로 애플리케이션과 컴포넌트를 프로비저닝, 빌드 및 배포하도록 지원하는 최적의 플랫폼입니다.   
>- Source To Image(S2I) 프로세스 같은 자동화된 워크플로우 덕분에 소스 형상 관리의 소스 코드를 즉시 실행 가능한 도커 포맷 컨테이너 이미지로 간단하게 생성할 수 있습니다.   
>- Openshift는 CI(Continuous Integration)와 CD(Continuous Delivery)의 통합 툴을 제공하기 때문에 모든 조직에게 이상적인 솔루션이 될 수 있습니다.   

## 운영팀을 위한 이점
>- Openshift는 IT 운영팀에 애플리케이션 빌드 배포 자동화와 정책 기반 권한 관리를 지원하는 안전한 엔터프라이즈급 Kubernetes를 제공합니다.   
>- 클러스터 서비스, 스케줄링 그리고 오케스트레이션을 통해 부하 분산과 자동 스케일링 기능을 제공합니다. 보안 기능을 통해 테넌트가 다른 애플리케이션이나 기본 호스트에 지장을 주지 않도록 방지합니다.   
>- Openshift는 Persistent Storage를 Linux 컨테이너에 직접 연결할 수 있기 때문에 IT 조직은 하나의 플랫폼에서 스테이트풀(Stateful) 및 스테이트리스(Stateless) 애플리케이션을 모두 실행할 수 있습니다.   

# Openshift 종류
---
Openshift 에는 다양한 버전이 존재합니다.   
   
* **OpenShift Origin**   
    * OpenShift Online, OpenShift 전용 및 OpenShift 컨테이너 플랫폼에서 사용되는 업스트림 커뮤니티 프로젝트다.  
* **OpenShift Container Platform**   
    * OpenShift Container Platform은 Red Hat이 제공하고 지원하는 엔터프라이즈 버전입니다.   
* **OpenShift Online**   
    * OpenShift Online은 Red Hat의 호스팅형 퍼블릭 PaaS 로서 클라우드에서 애플리케이션 개발, 구축, 배포, 호스팅 솔루션을 제공합니다.   
* **OpenShift Dedicated**   
    * OpenShift Dedicated는 퍼블릭 클라우드에서 관리형 싱글 테넌트 OpenShift 환경을 제공합니다. 전체 OpenShift Cluster를 기업 전용 솔루션으로 구축하고 Red Hat을 통해 종합적으로 관리합니다.   

# Openshift Origin 설치
---
Openshift 설치 테스트 환경은 아래와 같습니다.   
> CentOS Linux release 7.6.1810 (Core)   
> Openshift Origin v3.11   
> Docker v1.13.1   

 Openshift 를 설치하기 위해서는 기본적으로 필요한 OS 설정 및 Infra 구성이 필요합니다.   
* **OS 설정**   
   1) SELinux : Enforcing   
   2) Firewalld Disable / iptables Enable (설치간 자동으로 설정 진행됨)   
   3) NetworkManager Enable   
   
* **추가 필요 Infra 요소**   
   1) Internal DNS 서버 (이번 포스팅에서는 DNS 시스템 구성 내용은 제외되어 있습니다.)   
   
위와 같이 Openshift 를 배포하기 위해서는 기본 설정이 필요합니다.   

## 주요 OS 설정 부분   
---
`/etc/sysconfig/network-script/` 의 내용은 아래와 같은 내부 Internal DNS 및 Upstream DNS 설정 해야됩니다.   

~~~sh
# cat /etc/sysconfig/network-scripts/ifcfg-eth1
TYPE=Ethernet
BOOTPROTO=static
DEFROUTE=yes
NAME=eth1
UUID=XXXXXXXX-XXXXX-XXXX-XXXX-XXXXXXXXXXXXX
DEVICE=eth1
ONBOOT=yes
IPADDR=192.168.XX.50
NETMASK=255.255.255.0
GATEWAY=192.168.XX.XX
DNS1=192.168.XX.111      # Internal DNS
DNS2=1.1.1.1             # Upstream
~~~   
   
`SELinux` 설정 확인   
~~~sh
# cat /etc/selinux/config
...
SELINUX=enforcing         # Enforcing 설정
...
~~~   
   
## DNS 설정 부분
---
Internal DNS 는 아래와 같이 `Zone File` 을 설정합니다.   
~~~sh
# cat /var/named/example.com.zone
$TTL 3H
@	IN SOA	ns.example.com. root.example.com. (
					0	; serial
					1D	; refresh
					1H	; retry
					1W	; expire
					3H )	; minimum

	IN      NS      ns.example.com.
ns	IN	A	192.168.XX.111
*	IN	A	192.168.XX.50             # wildcard DNS 설정
master	IN	A	192.168.XX.50
;
~~~   
***wildcard DNS*** 설정을 합니다.   
**참고자료 :** [https://docs.openshift.com/container-platform/3.11/install/prerequisites.html#wildcard-dns-prereq](https://docs.openshift.com/container-platform/3.11/install/prerequisites.html#wildcard-dns-prereq)   

## Requirements Package 설치
---
Openshift 설치를 하기 위해서 `centos-openshift-origin311` Repository 를 `Enable` 해야됩니다.   
~~~sh
[root@master ~]# yum install centos-release-openshift-origin311.noarch
Loaded plugins: fastestmirror
Loading mirror speeds from cached hostfile
 * base: ftp.nara.wide.ad.jp
 * extras: data.aonenetworks.kr
 * updates: ftp.nara.wide.ad.jp
Resolving Dependencies
--> Running transaction check
---> Package centos-release-openshift-origin311.noarch 0:1-2.el7.centos will be installed
--> Processing Dependency: centos-release-paas-common for package: centos-release-openshift-origin311-1-2.el7.centos.noarch
--> Processing Dependency: centos-release-ansible26 for package: centos-release-openshift-origin311-1-2.el7.centos.noarch
--> Running transaction check
---> Package centos-release-ansible26.noarch 0:1-3.el7.centos will be installed
--> Processing Dependency: centos-release-configmanagement for package: centos-release-ansible26-1-3.el7.centos.noarch
---> Package centos-release-paas-common.noarch 0:1-1.el7.centos will be installed
--> Running transaction check
---> Package centos-release-configmanagement.noarch 0:1-1.el7.centos will be installed
--> Finished Dependency Resolution
 
Dependencies Resolved
 
===================================================================================================================================================================================================================================================================================================
 Package                                                                                   Arch                                                          Version                                                               Repository                                                     Size
===================================================================================================================================================================================================================================================================================================
Installing:
 centos-release-openshift-origin311                                                        noarch                                                        1-2.el7.centos                                                        extras                                                         11 k
Installing for dependencies:
 centos-release-ansible26                                                                  noarch                                                        1-3.el7.centos                                                        extras                                                        4.1 k
 centos-release-configmanagement                                                           noarch                                                        1-1.el7.centos                                                        extras                                                        4.3 k
 centos-release-paas-common                                                                noarch                                                        1-1.el7.centos                                                        extras                                                         11 k
 
Transaction Summary
===================================================================================================================================================================================================================================================================================================
Install  1 Package (+3 Dependent packages)
 
Total download size: 31 k
Installed size: 39 k
Is this ok [y/d/N]:y
 
...
Running transaction
  Installing : centos-release-configmanagement-1-1.el7.centos.noarch                                                                                                                                                                                                                           1/4
  Installing : centos-release-ansible26-1-3.el7.centos.noarch                                                                                                                                                                                                                                  2/4
  Installing : centos-release-paas-common-1-1.el7.centos.noarch                                                                                                                                                                                                                                3/4
  Installing : centos-release-openshift-origin311-1-2.el7.centos.noarch                                                                                                                                                                                                                        4/4
  Verifying  : centos-release-paas-common-1-1.el7.centos.noarch                                                                                                                                                                                                                                1/4
  Verifying  : centos-release-configmanagement-1-1.el7.centos.noarch                                                                                                                                                                                                                           2/4
  Verifying  : centos-release-openshift-origin311-1-2.el7.centos.noarch                                                                                                                                                                                                                        3/4
  Verifying  : centos-release-ansible26-1-3.el7.centos.noarch                                                                                                                                                                                                                                  4/4
 
Installed:
  centos-release-openshift-origin311.noarch 0:1-2.el7.centos
 
Dependency Installed:
  centos-release-ansible26.noarch 0:1-3.el7.centos                                             centos-release-configmanagement.noarch 0:1-1.el7.centos                                             centos-release-paas-common.noarch 0:1-1.el7.centos
 
Complete!
[root@master ~]#
~~~   
위와 같이 설치가 완료가 되면 추가로 Openshift Origin v3.11 설치를 위한 Repogitory 가 Enable 됩니다.   
~~~sh
[root@master ~]# yum repolist
Loaded plugins: fastestmirror
Loading mirror speeds from cached hostfile
 * base: ftp.nara.wide.ad.jp
 * centos-ansible26: data.aonenetworks.kr
 * extras: data.aonenetworks.kr
 * updates: ftp.nara.wide.ad.jp
centos-ansible26                                                                                                                                                                                                                                                            | 2.9 kB  00:00:00
centos-openshift-origin311                                                                                                                                                                                                                                                  | 2.9 kB  00:00:00
(1/2): centos-ansible26/7/x86_64/primary_db                                                                                                                                                                                                                                 | 6.5 kB  00:00:00
(2/2): centos-openshift-origin311/primary_db                                                                                                                                                                                                                                |  19 kB  00:00:00
repo id                                                                                                                                         repo name                                                                                                                                    status
base/7/x86_64                                                                                                                                   CentOS-7 - Base                                                                                                                              10,019
centos-ansible26/7/x86_64                                                                                                                       CentOS-7 - Ansible26                                                                                                                              8
centos-openshift-origin311                                                                                                                      CentOS OpenShift Origin                                                                                                                          31
extras/7/x86_64                                                                                                                                 CentOS-7 - Extras                                                                                                                               409
updates/7/x86_64                                                                                                                                CentOS-7 - Updates                                                                                                                            1,982
repolist: 12,449
[root@master ~]#
~~~
   
Openshift Origin v3.11 은 ansible Version 에 종속성이 있어서 추가로 `centos-ansible26` Repository 가 `Enable` 됩니다.   

추가로 Openshift ansible Playbook 및 ansible 을 설치합니다.   
~~~sh 
[root@master ~]# yum install openshift-ansible ansible
~~~
   
설치가 완료되면 아래와 같이 `/usr/share/ansible/openshift-ansible/` 경로에 Playbook 이 생성됩니다.   
~~~sh
[root@master ~]# cd /usr/share/ansible/openshift-ansible/
[root@master openshift-ansible]# ls -la
합계 12
drwxr-xr-x.  5 root root   72  6월  5 07:14 .
drwxr-xr-x.  3 root root   31  6월  5 07:14 ..
-rw-r--r--.  1 root root 1303 11월  2  2018 ansible.cfg
drwxr-xr-x.  3 root root   34  6월  5 07:15 inventory
drwxr-xr-x. 38 root root 4096  6월  5 07:14 playbooks
drwxr-xr-x. 93 root root 4096  6월  5 07:14 roles
[root@master openshift-ansible]#
~~~   

## All-in-one Inventory 작성
---
노드 하나에 master, infra, compute 의 기능을 전부 설치하는 All-in-one Inventory 를 작성합니다.   
~~~sh
[root@master openshift-ansible]# cat inventory/hosts.localhost
#bare minimum hostfile
 
[OSEv3:children]
masters
nodes
etcd
 
[OSEv3:vars]
# if your target hosts are Fedora uncomment this
#ansible_python_interpreter=/usr/bin/python3
openshift_deployment_type=origin
openshift_portal_net=172.30.0.0/16
# localhost likely doesn't meet the minimum requirements
openshift_disable_check=disk_availability,memory_availability
 
openshift_node_groups=[{'name': 'node-config-all-in-one', 'labels': ['node-role.kubernetes.io/master=true', 'node-role.kubernetes.io/infra=true', 'node-role.kubernetes.io/compute=true']}]
openshift_release="3.11"
openshift_master_default_subdomain=apps.example.com
 
# uncomment the following to enable htpasswd authentication; defaults to AllowAllPasswordIdentityProvider
openshift_master_identity_providers=[{'name': 'htpasswd_auth', 'login': 'true', 'challenge': 'true', 'kind': 'HTPasswdPasswordIdentityProvider'}]
 
 
[masters]
localhost ansible_connection=local
 
[etcd]
localhost ansible_connection=local
 
[nodes]
# openshift_node_group_name should refer to a dictionary with matching key of name in list openshift_node_groups.
localhost ansible_connection=local openshift_node_group_name="node-config-all-in-one"
~~~
   
`openshift_master_identity_providers` 항목을 추가하여 htpasswd 기능을 활성화 하였습니다.   
   
## prerequisites.yml 배포
---
Openshift Cluster 배포하기 전에 `prerequisites.yml` 를 실행하여 Cluster 구성간 필요한 설정 작업 및 추가 패키지 설치를 합니다.   
~~~sh
# ansible-playbook -i inventory/hosts.localhost playbooks/prerequisites.yml
...

PLAY RECAP ****************************************************************************************************************************************************************************************************************************************************************************************
localhost                  : ok=83   changed=23   unreachable=0    failed=0
 
 
INSTALLER STATUS **********************************************************************************************************************************************************************************************************************************************************************************
Initialization  : Complete (0:00:35)
Tuesday 04 June 2019  10:38:27 +0900 (0:00:00.032)       0:01:35.916 ***********
===============================================================================
Ensure openshift-ansible installer package deps are installed ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 19.40s
container_runtime : Install Docker -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 10.40s
os_firewall : need to pause here, otherwise the iptables service starting can sometimes cause ssh to fail --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 10.13s
os_firewall : Wait 10 seconds after disabling firewalld ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 10.10s
Gathering Facts ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 4.49s
openshift_excluder : Install docker excluder - yum ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 4.01s
os_firewall : Install iptables packages ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 3.08s
container_runtime : restart container runtime ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 2.88s
container_runtime : Fixup SELinux permissions for docker ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 1.54s
openshift_repos : refresh cache ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ 0.76s
openshift_repos : Ensure libselinux-python is installed ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ 0.74s
Gather Cluster facts ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 0.66s
os_firewall : Ensure firewalld service is not enabled -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 0.60s
openshift_repos : Configure origin gpg keys ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ 0.60s
os_firewall : Start and enable iptables service -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 0.55s
container_runtime : Get current installed Docker version ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 0.52s
container_runtime : Place additional/blocked/insecure registries in /etc/containers/registries.conf ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 0.50s
openshift_repos : Configure correct origin release repository ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ 0.46s
container_runtime : Configure Docker service unit file ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 0.45s
Detecting Operating System from ostree_booted ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 0.44s
[root@master openshift-ansible]#
~~~   

## deploy_cluster.yml 배포
---
`prerequisites.yml` 가 위와 같이 정상적으로 배포가 되면 Cluster 구성 준비가 완료 된 것입니다.   
`deploy_cluster.yml` 을 이용하여 Cluster 배포를 시작합니다.   
~~~sh
# ansible-playbook -i inventory/hosts.localhost playbooks/deploy_cluster.yml
...

PLAY RECAP ****************************************************************************************************************************************************************************************************************************************************************************************
localhost                  : ok=566  changed=138  unreachable=0    failed=0
 
 
INSTALLER STATUS **********************************************************************************************************************************************************************************************************************************************************************************
Initialization               : Complete (0:00:23)
Health Check                 : Complete (0:00:38)
Node Bootstrap Preparation   : Complete (0:01:14)
etcd Install                 : Complete (0:00:32)
Master Install               : Complete (0:04:37)
Master Additional Install    : Complete (0:00:36)
Node Join                    : Complete (0:00:18)
Hosted Install               : Complete (0:00:40)
Cluster Monitoring Operator  : Complete (0:00:11)
Web Console Install          : Complete (0:00:40)
Console Install              : Complete (0:00:18)
metrics-server Install       : Complete (0:00:01)
Service Catalog Install      : Complete (0:03:39)
Tuesday 04 June 2019  11:23:04 +0900 (0:00:00.096)       0:14:35.316 **********
===============================================================================
openshift_control_plane : Wait for all control plane pods to become ready ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 97.17s
/root/openshift-ansible/roles/openshift_control_plane/tasks/main.yml:272 -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
template_service_broker : Verify that TSB is running -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 53.92s
/root/openshift-ansible/roles/template_service_broker/tasks/deploy.yml:52 ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
openshift_service_catalog : Wait for Controller Manager rollout success ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 43.92s
/root/openshift-ansible/roles/openshift_service_catalog/tasks/start.yml:14 -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
openshift_control_plane : Wait for control plane pods to appear --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 42.90s
/root/openshift-ansible/roles/openshift_control_plane/tasks/main.yml:220 -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Run health checks (install) - EL ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 37.39s
/root/openshift-ansible/playbooks/openshift-checks/private/install.yml:24 ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
openshift_service_catalog : Wait for API Server rollout success --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 32.19s
/root/openshift-ansible/roles/openshift_service_catalog/tasks/start.yml:2 ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
openshift_web_console : Pause for the web console deployment to start --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 30.16s
/root/openshift-ansible/roles/openshift_web_console/tasks/install.yml:158 ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
openshift_service_catalog : oc_process ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 16.35s
/root/openshift-ansible/roles/openshift_service_catalog/tasks/install.yml:44 ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
openshift_console : Waiting for console rollout to complete -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 9.06s
/root/openshift-ansible/roles/openshift_console/tasks/start.yml:2 --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
openshift_manageiq : Configure role/user permissions --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 5.73s
/root/openshift-ansible/roles/openshift_manageiq/tasks/main.yaml:45 ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
tuned : Restart tuned service -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 5.41s
/root/openshift-ansible/roles/tuned/tasks/main.yml:38 --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
openshift_control_plane : Wait for APIs to become available -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 5.29s
/root/openshift-ansible/roles/openshift_control_plane/tasks/check_master_api_is_ready.yml:2 ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
openshift_node : Install node, clients, and conntrack packages ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 4.55s
/root/openshift-ansible/roles/openshift_node/tasks/install.yml:2 ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
tuned : Restart tuned service -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 4.05s
/root/openshift-ansible/roles/tuned/tasks/main.yml:38 --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Gathering Facts ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 3.86s
/root/openshift-ansible/playbooks/init/basic_facts.yml:2 -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
openshift_excluder : Install docker excluder - yum ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 3.62s
/root/openshift-ansible/roles/openshift_excluder/tasks/install.yml:9 -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
openshift_cli : Install clients ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ 3.57s
/root/openshift-ansible/roles/openshift_cli/tasks/main.yml:2 -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
ansible_service_broker : Create custom resource definitions for asb ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ 3.29s
/root/openshift-ansible/roles/ansible_service_broker/tasks/install.yml:128 -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
openshift_hosted : Create OpenShift router ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 3.22s
/root/openshift-ansible/roles/openshift_hosted/tasks/router.yml:85 -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
openshift_control_plane : Start and enable self-hosting node ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 3.04s
/root/openshift-ansible/roles/openshift_control_plane/tasks/main.yml:201 -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
[root@master openshift-ansible]#
~~~
배포가 완료되면 아래와 같이 `# oc get all` 명령을 통해 Openshift 가 정상적으로 설치가 된 것을 확인 할 수 있습니다.   

~~~sh
[root@master ~]# oc get all
NAME                           READY     STATUS    RESTARTS   AGE
pod/docker-registry-1-9t2zp    1/1       Running   0          10m
pod/registry-console-1-n4v9t   1/1       Running   0          10m
pod/router-1-58cpz             1/1       Running   3          10m

NAME                                       DESIRED   CURRENT   READY     AGE
replicationcontroller/docker-registry-1    1         1         1         10m
replicationcontroller/registry-console-1   1         1         1         10m
replicationcontroller/router-1             1         1         1         10m

NAME                       TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)                   AGE
service/docker-registry    ClusterIP   172.30.205.4     <none>        5000/TCP                  10m
service/kubernetes         ClusterIP   172.30.0.1       <none>        443/TCP,53/UDP,53/TCP     10m
service/registry-console   ClusterIP   172.30.204.108   <none>        9000/TCP                  10m
service/router             ClusterIP   172.30.237.203   <none>        80/TCP,443/TCP,1936/TCP   10m

NAME                                                  REVISION   DESIRED   CURRENT   TRIGGERED BY
deploymentconfig.apps.openshift.io/docker-registry    1          1         1         config
deploymentconfig.apps.openshift.io/registry-console   1          1         1         config
deploymentconfig.apps.openshift.io/router             1          1         1         config

NAME                                        HOST/PORT                                   PATH      SERVICES           PORT      TERMINATION   WILDCARD
route.route.openshift.io/docker-registry    docker-registry-default.apps.example.com              docker-registry    <all>     passthrough   None
route.route.openshift.io/registry-console   registry-console-default.apps.example.com             registry-console   <all>     passthrough   None
[root@master ~]#
~~~
## Htpasswd 설정 && USER 권한 설정
---
htpasswd 설정을 동해 Openshift Cluster를 관리할 `admin` 계정을 생성합니다.   
~~~sh
# cat /etc/origin/master/master-config.yaml | grep htpasswd
    name: htpasswd_auth
      file: /etc/origin/master/htpasswd
~~~
Master 설정을 확인하여 htpasswd 가 저장되는 경로를 확인합니다.   

~~~sh
[root@master master]# htpasswd /etc/origin/master/htpasswd admin
New password:
Re-type new password:
Updating password for user admin

[root@master master]# cat /etc/origin/master/htpasswd
admin:$apr1$vfGx9xr2$G9/SgRxXUupu/mUVSuwmR/
[root@master master]#
~~~
`htpasswd` 명령을 이용하여 신규 사용자 `admin` 을 생성합니다.   

~~~sh
[root@master master]# oc login -u admin
Authentication required for https://master.example.com:8443 (openshift)
Username: admin
Password:
Login successful.

You have access to the following projects and can switch between them with 'oc project <projectname>':
...
  * sample-project
...
Using project "".
[root@master master]# oc new-project sample-project
Now using project "sample-project" on server "https://master.example.com:8443".

You can add applications to this project with the 'new-app' command. For example, try:

    oc new-app centos/ruby-25-centos7~https://github.com/sclorg/ruby-ex.git

to build a new example application in Ruby.
[root@master master]#
~~~   
신규로 생성된 `admin` 으로 login을 하고 사용할 Project 를 생성합니다.   
~~~sh
[root@master master]# oc login -u system:admin
Logged into "https://master.example.com:8443" as "system:admin" using existing credentials.

You have access to the following projects and can switch between them with 'oc project <projectname>':
...
  * sample-project
...
Using project "sample-project".

[root@master master]# oc adm policy add-scc-to-user anyuid -z default
scc "anyuid" added to: ["system:serviceaccount:sample-project:default"]

[root@master master]# oc login -u admin
Logged into "https://master.example.com:8443" as "admin" using existing credentials.

You have access to the following projects and can switch between them with 'oc project <projectname>':
...
  * sample-project
...
Using project "sample-project".
[root@master master]#
~~~
default serviceaccount 에 anyuid scc 를 추가하여 pod 를 제어 할 수 있는 권한을 부여합니다.   

# Sample APP 배포
---
Sample APP 를 배포하여 실제로 Openshift 를 이용하여 서비스를 시작해보겠습니다.   

## S2I 기능을 이용한 APP 배포
---
 Openshift 의 S2I 기능을 이용하여 Sample APP 를 배포하겠습니다.   
> APP : wildfly:latest   
> Source : https://github.com/chhanz/openshift-deploy.git   
   
~~~sh
[root@master ~]# oc new-app wildfly~https://github.com/chhanz/openshift-deploy --name sampleapp
--> Found image 05e5cf6 (2 weeks old) in image stream "openshift/wildfly" under tag "13.0" for "wildfly"

    WildFly 13.0.0.Final
    --------------------
    Platform for building and running JEE applications on WildFly 13.0.0.Final

    Tags: builder, wildfly, wildfly13

    * A source build using source code from https://github.com/chhanz/openshift-deploy will be created
      * The resulting image will be pushed to image stream tag "sampleapp:latest"
      * Use 'start-build' to trigger a new build
    * This image will be deployed in deployment config "sampleapp"
    * Port 8080/tcp will be load balanced by service "sampleapp"
      * Other containers can access this service through the hostname "sampleapp"

--> Creating resources ...
    imagestream.image.openshift.io "sampleapp" created
    buildconfig.build.openshift.io "sampleapp" created
    deploymentconfig.apps.openshift.io "sampleapp" created
    service "sampleapp" created
--> Success
    Build scheduled, use 'oc logs -f bc/sampleapp' to track its progress.
    Application is not exposed. You can expose services to the outside world by executing one or more of the commands below:
     'oc expose svc/sampleapp'
    Run 'oc status' to view your app.
~~~  
신규 APP 가 생성이 되고 sample.war 소스를 기반으로  
~~~sh
[root@master ~]# oc logs -f bc/sampleapp
Cloning "https://github.com/chhanz/openshift-deploy" ...
	Commit:	7c4656f9d88fe9ffbf846ba0dff5b74742f34c67 (Change Location)
	Author:	chhanz <han0495@gmail.com>
	Date:	Fri Jun 7 22:00:34 2019 +0900
Using docker-registry.default.svc:5000/openshift/wildfly@sha256:895e0a6c732f8244ce75b376651155fdef12311df0d940ce111756ef43aa2bfc as the s2i builder image
Moving binaries in source directory into /wildfly/standalone/deployments for later deployment...
Moving all war artifacts from /opt/app-root/src/. directory into /wildfly/standalone/deployments for later deployment...
'/opt/app-root/src/./sample.war' -> '/wildfly/standalone/deployments/sample.war'
Moving all ear artifacts from /opt/app-root/src/. directory into /wildfly/standalone/deployments for later deployment...
Moving all rar artifacts from /opt/app-root/src/. directory into /wildfly/standalone/deployments for later deployment...
Moving all jar artifacts from /opt/app-root/src/. directory into /wildfly/standalone/deployments for later deployment...
...done

Pushing image docker-registry.default.svc:5000/sample-project/sampleapp:latest ...
Pushed 2/13 layers, 15% complete
Pushed 3/13 layers, 23% complete
Pushed 4/13 layers, 31% complete
Pushed 5/13 layers, 39% complete
Pushed 6/13 layers, 46% complete
Pushed 7/13 layers, 54% complete
Pushed 8/13 layers, 62% complete
Pushed 9/13 layers, 69% complete
Pushed 10/13 layers, 77% complete
Pushed 11/13 layers, 85% complete
Pushed 12/13 layers, 92% complete
Pushed 13/13 layers, 100% complete
Push successful
~~~   
위와 같이 git 에서 소스를 가져와서 이미지로 생성하고 Openshift registory 에 Push 합니다.   
~~~sh
[root@master ~]# oc get po
NAME                READY     STATUS      RESTARTS   AGE
sampleapp-1-build   0/1       Completed   0          4m
sampleapp-1-rsklv   1/1       Running     0          3m
[root@master ~]#

[root@master ~]# oc get svc
NAME        TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
sampleapp   ClusterIP   172.30.37.118   <none>        8080/TCP   4m
[root@master ~]#
~~~   
생성된 service 를 이용하여 route 를 생성합니다.   
~~~sh
[root@master ~]# oc expose service/sampleapp
route.route.openshift.io/sampleapp exposed
[root@master ~]# oc get route
NAME        HOST/PORT                                   PATH      SERVICES    PORT       TERMINATION   WILDCARD
sampleapp   sampleapp-sample-project.apps.example.com             sampleapp   8080-tcp                 None
[root@master ~]#
~~~
sampleapp 에 대한 route 가 생성이 되었습니다.   
실제로 서비스가 되는지 확인하도록 하겠습니다.   

<center><img src="/assets/images/post/2019-06-07-okd/sampleapp1.png" style="max-width: 100%; height: auto;"><br>sample 서비스 정상 구동중</center>
  

# Web Console
---
Openshift 는 Web Console 을 제공하여 좀더 편리하게 서비스를 배포하고 운영 할 수 있도록 하고 있습니다.   

![Openshift Web Condole](/assets/images/post/2019-06-07-okd/okd-web-console.png)
admin 계정으로 로그인을 하겠습니다.   

![배포된 sampleapp 어플리케이션](/assets/images/post/2019-06-07-okd/okd-web-console2.png)
위와 같이 배포된 어플리케이션들에 대해 상태를 확인하고 Scale Up/Down 등의 기능을 수행이 가능합니다.   

![Openshift Grafana](/assets/images/post/2019-06-07-okd/grafana-cluster-show.png)
Openshift Origin v3.11에는 기본적으로 Prometheus + Grafana Dashboard 를 제공하고 있습니다.   
***(openshift-monitoring Project 에서 실행중)***   

   
이번 포스팅에서는 Openshift Origin 설치 및 APP 를 배포하여 서비스가 동작되는 것을 확인 하였습니다.   
이후 포스팅에서는 Web Console 를 통한 배포/관리, HPA 를 이용한 Auto-Scaling 구현을 작성해보도록 하겠습니다.   

감사합니다.   

   
# 참고자료
---

- 설치 관련 참고 자료   
   * DNS 구성 관련 : [https://www.unixmen.com/setting-dns-server-centos-7/](https://www.unixmen.com/setting-dns-server-centos-7/)
   * DNS 설정 관련 : [https://docs.openshift.com/container-platform/3.11/install/prerequisites.html#wildcard-dns-prereq](https://docs.openshift.com/container-platform/3.11/install/prerequisites.html#wildcard-dns-prereq)
   * ansible-playbook inventory 관련 : [https://docs.okd.io/3.11/install/configuring_inventory_file.html](https://docs.okd.io/3.11/install/configuring_inventory_file.html)
- scc 관련
   * [https://blog.openshift.com/understanding-service-accounts-sccs/](https://blog.openshift.com/understanding-service-accounts-sccs/)
- git source
   * chhanz github : [https://github.com/chhanz/openshift-deploy](https://github.com/chhanz/openshift-deploy)