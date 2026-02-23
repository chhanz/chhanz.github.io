---
layout: post
title: "[Proxmox] Deploy Ceph in Proxmox 8.2.1"
description: "Proxmox with Ceph 설치"
author: chhanz
date: 2024-05-31
tags: [linux]
category: linux
---

# 이전 글
* Install Proxmox :    
[https://tech.chhanz.xyz/linux/2024/05/13/install-pve-8-2/](https://tech.chhanz.xyz/linux/2024/05/13/install-pve-8-2/)   
* Create Cluster :   
[https://tech.chhanz.xyz/linux/2024/05/31/pve-cluster](https://tech.chhanz.xyz/linux/2024/05/31/pve-cluster)   
   
# Ceph Cluster 배포
이전 글에 이어서 설치된 Proxmox 3대를 이용하여 Ceph Cluster 를 구성해보겠습니다.   
   
<center><img src="/assets/images/post/2024-05-31-pve-cluster/pve-infra.png" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;테스트 구성도   

* 테스트에 사용할 네트워크 정보   
    * vmbr0 : VM Network   
    * Cluster 및 CEPH Public Network : `20.20.20.0/24`   
    * CEPH Cluster Network : `30.30.30.0/24`   

# 배포
<center><img src="/assets/images/post/2024-05-31-pve-ceph/ceph1.png" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;PVE 관리 GUI > `Datacenter` > `Ceph` 메뉴를 선택하고 `Install Ceph` 를 선택합니다.   
   
<center><img src="/assets/images/post/2024-05-31-pve-ceph/ceph2.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;설치할 Ceph 버전을 Quincy 로 선택하고 Repository 를 `No-Subscription` 을 선택하였습니다.   

<center><img src="/assets/images/post/2024-05-31-pve-ceph/ceph3.png" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;Ceph 패키지를 설치를 수행합니다. `Y` 를 입력합니다.   

<center><img src="/assets/images/post/2024-05-31-pve-ceph/ceph4.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;일정 시간 이후로 Ceph 패키지가 설치가 완료된 것을 확인 할 수 있습니다.   

<center><img src="/assets/images/post/2024-05-31-pve-ceph/ceph5.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;패키지가 설치된 이후, Ceph 에서 사용할 네트워크를 지정합니다.   

<center><img src="/assets/images/post/2024-05-31-pve-ceph/ceph6.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;위와 같이 pve1 노드에 Ceph 기본 설치가 완료되었습니다.   

<center><img src="/assets/images/post/2024-05-31-pve-ceph/ceph7.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;pve1 노드만 설치된 대시보드의 모습입니다.   

<center><img src="/assets/images/post/2024-05-31-pve-ceph/ceph9.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;Ceph MON 을 추가합니다. 각 노드 > `Ceph` > `Monitor` 메뉴를 이용합니다.   

<center><img src="/assets/images/post/2024-05-31-pve-ceph/ceph10.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;pve2 를 Ceph MON 으로 추가하는 과정으로 Monitor 이름을 지정합니다.      

<center><img src="/assets/images/post/2024-05-31-pve-ceph/ceph11.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;mon.pve2 가 추가된 것을 확인 할 수 있습니다.   

<center><img src="/assets/images/post/2024-05-31-pve-ceph/ceph12.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;마지막으로 pve3 도 Ceph MON 을 추가합니다.   

<center><img src="/assets/images/post/2024-05-31-pve-ceph/ceph13.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;pve2 노드를 Ceph MGR 로 추가합니다.   

<center><img src="/assets/images/post/2024-05-31-pve-ceph/ceph14.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;위 과정을 통해 pve2, pve3 노드의 Ceph MGR 이 추가되었습니다.   

<center><img src="/assets/images/post/2024-05-31-pve-ceph/ceph15.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;Ceph OSD 생성을 위해 각 노드 > `Ceph` > `OSD` 메뉴를 이용합니다.   

<center><img src="/assets/images/post/2024-05-31-pve-ceph/ceph16.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;`Create : OSD` 를 선택하면 위와 같은 화면이 나오며 OSD 에 사용할 디스크을 지정합니다.   
   
<center><img src="/assets/images/post/2024-05-31-pve-ceph/ceph17.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;추가된 OSD 를 확인 할 수 있습니다.   
   
<center><img src="/assets/images/post/2024-05-31-pve-ceph/ceph18.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;나머지 OSD 도 각각 추가합니다. 각 노드별로 두개의 디스크를 사용할 것입니다.   
   
<center><img src="/assets/images/post/2024-05-31-pve-ceph/ceph19.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;OSD 가 모두 추가가 되면 위와 같이 Ceph 가 정상적으로 구성이 되고 사용할 준비가 되었습니다.   
   
<center><img src="/assets/images/post/2024-05-31-pve-ceph/ceph20.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;Ceph Pool 을 생성하여 pve-cluster 에서 사용 할 vmpool 을 생성합니다.   
   
<center><img src="/assets/images/post/2024-05-31-pve-ceph/ceph21.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;생성이 완료된 것을 볼 수 있습니다. 또한 각 노드에서 vmpool 을 동시에 사용 할 수 있습니다.   
   
<center><img src="/assets/images/post/2024-05-31-pve-ceph/ceph22.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;생성된 Ceph Pool 은 RBD 유형이고 Ceph Pool 을 사용하면 pve-cluster 에서 손쉽게 라이브 마이그레이션을할 수 있도록     
&nbsp;&nbsp;&nbsp;&nbsp;지원할 수 있습니다.   
   
# Command
아래와 같이 기존의 Ceph 명령어로도 Ceph 정보를 확인 할 수 있습니다.   
   
```bash
root@pve1:~# ceph -s
  cluster:
    id:     5d4305ee-5756-40e7-b2fd-04e0eb19a4d3
    health: HEALTH_OK

  services:
    mon: 3 daemons, quorum pve1,pve2,pve3 (age 2m)
    mgr: pve1(active, since 2m), standbys: pve2, pve3
    osd: 6 osds: 6 up (since 8s), 6 in (since 13m)

  data:
    pools:   1 pools, 1 pgs
    objects: 2 objects, 577 KiB
    usage:   1.7 GiB used, 598 GiB / 600 GiB avail
    pgs:     100.000% pgs not active
             1 remapped+peering
```
   
# 참고 문서
* [https://pve.proxmox.com/wiki/Deploy_Hyper-Converged_Ceph_Cluster](https://pve.proxmox.com/wiki/Deploy_Hyper-Converged_Ceph_Cluster)