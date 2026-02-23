---
layout: post
title: "[Proxmox] Create Cluster the Proxmox 8.2.1"
description: "Proxmox Cluster 생성"
author: chhanz
date: 2024-05-31
tags: [linux]
category: linux
---

# 이전 글
* Install Proxmox :    
[https://tech.chhanz.xyz/linux/2024/05/13/install-pve-8-2/](https://tech.chhanz.xyz/linux/2024/05/13/install-pve-8-2/)   

# Cluster 생성
이전 글에 이어서 설치된 Proxmox 3대를 이용하여 Cluster 를 구성해보겠습니다.   
   
<center><img src="/assets/images/post/2024-05-31-pve-cluster/pve-infra.png" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;테스트 구성도   

* 테스트에 사용할 네트워크 정보   
    * vmbr0 : VM Network   
    * Cluster 및 CEPH Public Network : `20.20.20.0/24`   
   
<center><img src="/assets/images/post/2024-05-31-pve-cluster/cl1.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;PVE 관리 GUI > `Datacenter` > `Cluster` > `Create Cluster` 를 선택하고 Cluster Name / Network 을 입력합니다.   

<center><img src="/assets/images/post/2024-05-31-pve-cluster/cl2.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;Cluster 생성을 수행하면 위와 같이 TASK 가 완료되는 것을 확인 할 수 있습니다.   
   
<center><img src="/assets/images/post/2024-05-31-pve-cluster/cl3.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;pve1 노드 한개로 구성된 Cluster 정보를 볼 수 있습니다.   
<center><img src="/assets/images/post/2024-05-31-pve-cluster/cl4.jpg" style="max-width: 95%; height: auto;"></center>
   
&nbsp;&nbsp;&nbsp;&nbsp;pve1 노드에서 Cluster Join Information 을 확인하고 pve2 노드를 Cluster 에 Join 할 준비를 합니다.   
   
<center><img src="/assets/images/post/2024-05-31-pve-cluster/cl5.png" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;pve2 노드에서 `Join Cluster` 를 선택합니다.   
   
<center><img src="/assets/images/post/2024-05-31-pve-cluster/cl6.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;위와 같이 pve1 노드에서 확인한 Join 정보를 입력합니다.   
   
<center><img src="/assets/images/post/2024-05-31-pve-cluster/cl7.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;pve1 노드와 pve2 노드가 Cluster 노드가 된 것을 확인 할 수 있습니다.   
   
<center><img src="/assets/images/post/2024-05-31-pve-cluster/cl8.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;pve3 노드도 동일하게 작업을 수행합니다.   
   
<center><img src="/assets/images/post/2024-05-31-pve-cluster/cl9.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;pve-cluster 에 Join 중에는 위와 같은 TASK 를 확인 할 수 있습니다.   
   
<center><img src="/assets/images/post/2024-05-31-pve-cluster/cl10.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;3개의 노드가 추가가 완료 되었습니다.   
   
<center><img src="/assets/images/post/2024-05-31-pve-cluster/cl11.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;Proxmox 관리 웹에서 위와 같이 pve 노드들을 확인 할 수 있으며, 하나의 관리 웹으로 모든 노드를 통합 관리 할 수 있습니다.   
   
# Cluster info
아래와 같이 pve 노드에서 corosync 를 통해 Cluster 를 생성한 것을 볼 수 있습니다.   
```console
root@pve1:~# corosync-cfgtool -s
Local node ID 1, transport knet
LINK ID 0 udp
    addr    = 20.20.20.50
    status:
        nodeid:          1:    localhost
        nodeid:          2:    connected
        nodeid:          3:    connected
root@pve1:~# corosync-cfgtool -n
Local node ID 1, transport knet
nodeid: 2 reachable
   LINK: 0 udp (20.20.20.50->20.20.20.51) enabled connected mtu: 1397

nodeid: 3 reachable
   LINK: 0 udp (20.20.20.50->20.20.20.52) enabled connected mtu: 1397
```
   
아래와 같이 PVE 명령어를 통해 Cluster 상태를 점검 할 수 있습니다.   
   
```console
root@pve1:~# pvecm status
Cluster information
-------------------
Name:             pve-cluster
Config Version:   3
Transport:        knet
Secure auth:      on

Quorum information
------------------
Date:             Tue May 14 23:01:14 2024
Quorum provider:  corosync_votequorum
Nodes:            3
Node ID:          0x00000001
Ring ID:          1.d
Quorate:          Yes

Votequorum information
----------------------
Expected votes:   3
Highest expected: 3
Total votes:      3
Quorum:           2
Flags:            Quorate

Membership information
----------------------
    Nodeid      Votes Name
0x00000001          1 20.20.20.50 (local)
0x00000002          1 20.20.20.51
0x00000003          1 20.20.20.52
```
   
# 참고 자료
* corosync two ring : [https://pve.proxmox.com/wiki/Cluster_Manager#pvecm_redundancy](https://pve.proxmox.com/wiki/Cluster_Manager#pvecm_redundancy)   
* [https://pve.proxmox.com/wiki/Cluster_Manager](https://pve.proxmox.com/wiki/Cluster_Manager)   