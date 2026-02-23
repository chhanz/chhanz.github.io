---
layout: post
title: "[RHV] Red Hat Virtualization Standalone Manager 설치"
description: " "
author: chhanz
date: 2020-01-17
tags: [linux, RHV]
category: RHV
---

# 목차
+ [Red Hat Virtualization Host 설치](/rhv/2020/01/03/install-rhvh/)   
+ [Red Hat Virtualization Standalone Manager 설치](/rhv/2020/01/17/install-rhvm/)   
+ [Red Hat Virtualization Host 추가 및 VM 생성](/rhv/2020/01/18/install-rhvm-admin/)   
   
# Red Hat Virtualization Manager 요구 사항
Red Hat Virtualization Manager(이하 RHVM)은 아래와 같은 하드웨어 요구 사항이 있습니다.   

<center><img src="/assets/images/post/2020-01-17-rhvm/1.png" style="max-width: 95%; height: auto;"></center>   
   
참고 자료 : [RHV Document](https://access.redhat.com/documentation/en-us/red_hat_virtualization/4.1/html/planning_and_prerequisites_guide/requirements)   
   
# Red Hat Virtualization Manager 설치
`RHVM`은 설치 방법이 두가지가 있습니다.   
`Standalone` 방식, `Self-Hosted Engine` 방식이 있습니다.   
이 방식에 대해 간단히 설명을 하면,   
> `Standalone` : `RHVM` 단독 시스템(baremetal)   
> `Self-Hosted Engine` : `RHVM`을 Hypervisior 에 VM으로 배포하고 기동하는 방식   
                 ___(VMware vCenter Appliance 설치 방식과 동일한 개념입니다.)___   
   
이번 테스트는 `Standalone` 으로 설치 예정입니다.   

## 테스트 시스템 기본 설정 내용
1) `/etc/hosts` 설정   
이번 테스트 시스템은 내부 테스트용으로 DNS 미사용으로 인해 `/etc/hosts`에 아래와 같이 `RHVM` 설치에 필요한 DNS 정보를 입력합니다.   
```bash
[root@rhvm ~]# cat /etc/hosts
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6

# RHV
192.168.10.225  rhvm.test.com
192.168.10.226  rhvh.test.com
# Test-Infra
192.168.10.228  nfs.test.com
192.168.10.229  repo.test.com
[root@rhvm ~]#
```
2) `RHV` Subscription 등록 및 Repository 연결   
```bash
[root@rhvm ~]# yum repolist
Loaded plugins: search-disabled-repos
repo id                                                          repo name                                                        status
jb-eap-7.1-for-rhel-7-server-rpms                                jb-eap-7.1-for-rhel-7-server-rpms                                 1,783
rhel-7-server-rhv-4-tools-rpms                                   rhel-7-server-rhv-4-tools-rpms                                       45
rhel-7-server-rhv-4.1-manager-rpms                               rhel-7-server-rhv-4.1-manager-rpms                                  762
rhel-7-server-rhv-4.1-rpms                                       rhel-7-server-rhv-4.1-rpms                                          773
rhel-7-server-rpms                                               rhel-7-server-rpms                                               26,742
rhel-7-server-supplementary-rpms                                 rhel-7-server-supplementary-rpms                                    351
repolist: 30,456
[root@rhvm ~]#
```
3) `firewalld` 및 `SELinux` 설정   
`firewalld` 및 `SELinux` 설정은 `Enable & Enforcing` 이 권고이나, 이번 테스트에서는 `Disable` 하겠습니다.   
   
## `RHVM` 설치
* `RHVM` Package 설치   
```bash
$ yum -y install rhevm
```
   
* `RHVM` Engine 설치 시작   
```bash
$ engine-setup
```
   
### 설치 과정   
아래와 같이 어떻게 설치를 할 것인지 대화형 방식으로 질의하며 설치 진행 됩니다.   

```bash
[root@rhvm ~]# engine-setup
[ INFO  ] Stage: Initializing
[ INFO  ] Stage: Environment setup
          Configuration files: ['/etc/ovirt-engine-setup.conf.d/10-packaging-wsp.conf', '/etc/ovirt-engine-setup.conf.d/10-packaging.conf']
          Log file: /var/log/ovirt-engine/setup/ovirt-engine-setup-20200117235529-j88sh2.log
          Version: otopi-1.6.3 (otopi-1.6.3-1.el7ev)
[ INFO  ] Stage: Environment packages setup
[ INFO  ] Stage: Programs detection
[ INFO  ] Stage: Environment setup
[ INFO  ] Stage: Environment customization

          --== PRODUCT OPTIONS ==--

          Configure Engine on this host (Yes, No) [Yes]: "Yes 입력"
          Configure Image I/O Proxy on this host? (Yes, No) [Yes]: "Yes 입력"
          Configure WebSocket Proxy on this host (Yes, No) [Yes]: "Yes 입력"
          Please note: Data Warehouse is required for the engine. 
          If you choose to not configure it on this host, you have to configure it on a remote host,
          and then configure the engine on this host so that it can access the database of the remote Data Warehouse host.
          Configure Data Warehouse on this host (Yes, No) [Yes]: "Yes 입력"
          Configure VM Console Proxy on this host (Yes, No) [Yes]: "Yes 입력"

          --== PACKAGES ==--

[ INFO  ] Checking for product updates...
[ INFO  ] No product updates found

          --== NETWORK CONFIGURATION ==--

          Host fully qualified DNS name of this server [rhvm.test.com]: "rhvm.test.com 입력"
          --== DATABASE CONFIGURATION ==--

          Where is the DWH database located? (Local, Remote) [Local]: <Local 입력>
          Setup can configure the local postgresql server automatically for the DWH to run. This may conflict with existing applications.
          Would you like Setup to automatically configure postgresql and create DWH database, or prefer to perform that manually? (Automatic, Manual) [Automatic]: "Automatic 입력"
          Where is the Engine database located? (Local, Remote) [Local]: <Local 입력>
          Setup can configure the local postgresql server automatically for the engine to run. This may conflict with existing applications.
          Would you like Setup to automatically configure postgresql and create Engine database, or prefer to perform that manually? (Automatic, Manual) [Automatic]: "Automatic 입력"

          --== OVIRT ENGINE CONFIGURATION ==--

          Engine admin password: "Password 입력"
          Confirm engine admin password: "Password 입력"
[WARNING] Password is weak: it is too short
          Use weak password? (Yes, No) [No]: "Yes 입력"
          Application mode (Virt, Gluster, Both) [Both]: "Both 입력"

          --== STORAGE CONFIGURATION ==--

          Default SAN wipe after delete (Yes, No) [No]: "No 입력"

          --== PKI CONFIGURATION ==--

          Organization name for certificate [test.com]: "test.com 입력"

          --== APACHE CONFIGURATION ==--

          Setup can configure the default page of the web server to present the application home page. This may conflict with existing applications.
          Do you wish to set the application as the default page of the web server? (Yes, No) [Yes]: "Yes 입력"
          Setup can configure apache to use SSL using a certificate issued from the internal CA.
          Do you wish Setup to configure that, or prefer to perform that manually? (Automatic, Manual) [Automatic]: "Automatic 입력"

          --== SYSTEM CONFIGURATION ==--

          Configure an NFS share on this server to be used as an ISO Domain? (Yes, No) [No]: "No 입력"

          --== MISC CONFIGURATION ==--

          Please choose Data Warehouse sampling scale:
          (1) Basic
          (2) Full
          (1, 2)[1]: "1 선택"

          --== END OF CONFIGURATION ==--

[ INFO  ] Stage: Setup validation

          --== CONFIGURATION PREVIEW ==--

          Application mode                        : both
          Default SAN wipe after delete           : False
          Update Firewall                         : False
          Host FQDN                               : rhvm.test.com
          Configure local Engine database         : True
          Set application as default page         : True
          Configure Apache SSL                    : True
          Engine database secured connection      : False
          Engine database user name               : engine
          Engine database name                    : engine
          Engine database host                    : localhost
          Engine database port                    : 5432
          Engine database host name validation    : False
          Engine installation                     : True
          PKI organization                        : test.com
          DWH installation                        : True
          DWH database secured connection         : False
          DWH database host                       : localhost
          DWH database user name                  : ovirt_engine_history
          DWH database name                       : ovirt_engine_history
          DWH database port                       : 5432
          DWH database host name validation       : False
          Configure local DWH database            : True
          Configure Image I/O Proxy               : True
          Configure VMConsole Proxy               : True
          Configure WebSocket Proxy               : True

          Please confirm installation settings (OK, Cancel) [OK]: "OK 입력 후, 설치 시작"

[ INFO  ] Stage: Transaction setup
[ INFO  ] Stopping engine service
[ INFO  ] Stopping ovirt-fence-kdump-listener service
[ INFO  ] Stopping dwh service
[ INFO  ] Stopping Image I/O Proxy service
[ INFO  ] Stopping vmconsole-proxy service
[ INFO  ] Stopping websocket-proxy service
[ INFO  ] Stage: Misc configuration
[ INFO  ] Stage: Package installation
[ INFO  ] Stage: Misc configuration
[ INFO  ] Upgrading CA
[ INFO  ] Initializing PostgreSQL
[ INFO  ] Creating PostgreSQL 'engine' database
[ INFO  ] Configuring PostgreSQL
[ INFO  ] Creating PostgreSQL 'ovirt_engine_history' database
[ INFO  ] Configuring PostgreSQL
[ INFO  ] Creating CA
[ INFO  ] Creating/refreshing Engine database schema
[ INFO  ] Creating/refreshing DWH database schema
[ INFO  ] Configuring Image I/O Proxy
[ INFO  ] Setting up ovirt-vmconsole proxy helper PKI artifacts
[ INFO  ] Setting up ovirt-vmconsole SSH PKI artifacts
[ INFO  ] Configuring WebSocket Proxy
[ INFO  ] Creating/refreshing Engine 'internal' domain database schema
[ INFO  ] Generating post install configuration file '/etc/ovirt-engine-setup.conf.d/20-setup-ovirt-post.conf'
[ INFO  ] Stage: Transaction commit
[ INFO  ] Stage: Closing up
[ INFO  ] Starting engine service
[ INFO  ] Starting dwh service
[ INFO  ] Restarting ovirt-vmconsole proxy service

          --== SUMMARY ==--

[ INFO  ] Restarting httpd
          In order to configure firewalld, copy the files from
              /etc/ovirt-engine/firewalld to /etc/firewalld/services
              and execute the following commands:
              firewall-cmd --permanent --add-service ovirt-postgres
              firewall-cmd --permanent --add-service ovirt-https
              firewall-cmd --permanent --add-service ovirt-fence-kdump-listener
              firewall-cmd --permanent --add-service ovirt-imageio-proxy
              firewall-cmd --permanent --add-service ovirt-websocket-proxy
              firewall-cmd --permanent --add-service ovirt-http
              firewall-cmd --permanent --add-service ovirt-vmconsole-proxy
              firewall-cmd --reload
          The following network ports should be opened:
              tcp:2222
              tcp:443
              tcp:5432
              tcp:54323
              tcp:6100
              tcp:80
              udp:7410
          An example of the required configuration for iptables can be found at:
              /etc/ovirt-engine/iptables.example
          Please use the user 'admin@internal' and password specified in order to login
          Web access is enabled at:
              http://rhvm.test.com:80/ovirt-engine
              https://rhvm.test.com:443/ovirt-engine
          Internal CA 8D:97:91:6E:9B:BD:60:A1:96:2E:5B:26:4E:43:90:04:AF:2D:19:D0
          SSH fingerprint: SHA256:6hFsMoHw32C85HfGc/N+GMv4SieCKv4PtBSgz43Jr3I

          --== END OF SUMMARY ==--

[ INFO  ] Stage: Clean up
          Log file is located at /var/log/ovirt-engine/setup/ovirt-engine-setup-20200117235529-j88sh2.log
[ INFO  ] Generating answer file '/var/lib/ovirt-engine/setup/answers/20200117235943-setup.conf'
[ INFO  ] Stage: Pre-termination
[ INFO  ] Stage: Termination
[ INFO  ] Execution of setup completed successfully
```
설치에는 약 20분 정도 소요가 됩니다.(설치 환경에 따라 차이 있음.)   
   
## `RHVM` 서비스 확인
아래와 같이 `RHVM` Engine 의 서비스 상태를 확인 할 수 있습니다.   
```bash
[root@rhvm ~]# systemctl status ovirt-engine
● ovirt-engine.service - oVirt Engine
   Loaded: loaded (/usr/lib/systemd/system/ovirt-engine.service; enabled; vendor preset: disabled)
   Active: active (running) since Fri 2020-01-17 23:59:41 KST; 4min 30s ago
 Main PID: 19043 (ovirt-engine.py)
   CGroup: /system.slice/ovirt-engine.service
           ├─19043 /usr/bin/python /usr/share/ovirt-engine/services/ovirt-engine/ovirt-engine.py --redirect-output --systemd=notify s...
           └─19112 ovirt-engine -server -XX:+TieredCompilation -Xms3971M -Xmx3971M -Djava.awt.headless=true -Dsun.rmi.dgc.client.gcIn...
                                                                                                                                        
Jan 17 23:59:40 rhvm.test.com systemd[1]: Starting oVirt Engine...
Jan 17 23:59:40 rhvm.test.com ovirt-engine.py[19043]: 2020-01-17 23:59:40,871+0900 ovirt-engine: INFO _detectJBossVersion:187 D...0', '-
Jan 17 23:59:41 rhvm.test.com ovirt-engine.py[19043]: 2020-01-17 23:59:41,651+0900 ovirt-engine: INFO _detectJBossVersion:207 R...: '[]'
Jan 17 23:59:41 rhvm.test.com systemd[1]: Started oVirt Engine.
Hint: Some lines were ellipsized, use -l to show in full.
```
   
## `RHVM` Web Console 접속
아래와 같이 `https://rhvm.test.com:443/ovirt-engine` 를 통해 접근이 가능합니다.   
`관리 포탈` 을 선택합니다.   
<center><img src="/assets/images/post/2020-01-17-rhvm/2.png" style="max-width: 95%; height: auto;"></center>   
   
설치 과정에서 입력한 `admin` 계정의 패스워드를 입력합니다.   
<center><img src="/assets/images/post/2020-01-17-rhvm/3.png" style="max-width: 95%; height: auto;"></center>   
   
아래와 같이 `RHVM` 에 접속 할 수 있습니다.   
<center><img src="/assets/images/post/2020-01-17-rhvm/4.png" style="max-width: 95%; height: auto;"></center>   
   
# 참고자료
* [https://access.redhat.com/documentation/ko-kr/red_hat_virtualization/4.1/html/installation_guide/part-installing_red_hat_enterprise_virtualization](https://access.redhat.com/documentation/ko-kr/red_hat_virtualization/4.1/html/installation_guide/part-installing_red_hat_enterprise_virtualization)   