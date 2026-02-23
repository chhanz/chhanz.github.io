---
layout: post
title: "[Proxmox] VM Live Migration on Proxmox 8.2.1"
description: ""
author: chhanz
date: 2024-06-07
tags: [linux]
category: linux
---

# 이전 글
* Install Proxmox :    
[https://tech.chhanz.xyz/linux/2024/05/13/install-pve-8-2/](https://tech.chhanz.xyz/linux/2024/05/13/install-pve-8-2/)   
* Create Cluster :   
[https://tech.chhanz.xyz/linux/2024/05/31/pve-cluster](https://tech.chhanz.xyz/linux/2024/05/31/pve-cluster)   
* Deploy Ceph in Proxmox 8.2.1 :   
[https://tech.chhanz.xyz/linux/2024/05/31/pve-with-ceph/](https://tech.chhanz.xyz/linux/2024/05/31/pve-with-ceph/)   
   
# Migration
기본적으로 PVE Cluster 내에서 수행되는 `offline` 마이그레이션과 `online` 마이그레이션이 존재합니다.   
참고로 기존 PVE Cluster 에서 Remote Cluster 로 마이그레이션하는 `remote-migrate` 방식도 존재합니다.   
   
# How to
아래와 같은 방법으로 VM 을 마이그레이션 할 수 있습니다.   
   
<center><img src="/assets/images/post/2024-06-08-pve/mig1.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;위와 같이 마이그레이션을 할 VM 에서 `Migrate` 메뉴를 선택합니다.   
   
<center><img src="/assets/images/post/2024-06-08-pve/mig2.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;PVE Cluster 내에서 마이그레이션 될 PVE 노드를 선택합니다.   
   
<center><img src="/assets/images/post/2024-06-08-pve/mig3.jpg" style="max-width: 95%; height: auto;"></center>   
   
&nbsp;&nbsp;&nbsp;&nbsp;위와 같이 Migrate 가 완료된 것을 볼 수 있습니다.   
   
# Command 
아래와 같은 방법으로 PVE Node 에서 `qm` 명령어로도 VM 마이그레이션이 가능합니다.   
   
```console
root@pve1:~# qm list
      VMID NAME                 STATUS     MEM(MB)    BOOTDISK(GB) PID
       100 vm1                  running    2048              10.00 3872123

root@pve1:~# qm migrate 100 pve2 --online
Requesting HA migration for VM 100 to node pve2

root@pve1:~# qm list
root@pve1:~#
```
기존에 PVE #1 노드에 존재하던 vm1 이 마이그레이션 이후, `qm list` 명령어로 확인하면 VM 목록을 확인 할 수 없는 것을 볼 수 있습니다.   
   
```console
root@pve2:~# qm list
      VMID NAME                 STATUS     MEM(MB)    BOOTDISK(GB) PID
       100 vm1                  running    2048              10.00 7599
```
   
위와 같이 PVE #2 노드에서 마이그레이션된 VM 을 확인 할 수 있습니다.    
   
# 참고 자료
* [https://pve.proxmox.com/pve-docs/pve-admin-guide.html#qm_migration](https://pve.proxmox.com/pve-docs/pve-admin-guide.html#qm_migration)     
   
