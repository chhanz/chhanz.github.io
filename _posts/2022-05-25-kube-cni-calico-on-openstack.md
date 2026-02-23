---
layout: post
title: "[Kubernetes] OpenStack Instance 에서 Cailco CNI 로 Kubernetes 구성"
description: ""
author: chhanz
date: 2022-05-25
tags: [kubernetes]
category: kubernetes
---
# 목차
+ [Intro](#info)   
+ [Issue](#issue)   
+ [Root Cause](#rc)   
+ [Finish](#finish)   
+ [참고 자료](#refdoc)   

# Intro {#info}
최근 Kubernetes 에서 데이터베이스 오퍼레이터를 이용하여 데이터베이스 배포 및 운영을 스터디하는 그룹에 참여하게 되었습니다.   
([https://gasidaseo.notion.site/e49b329c833143d4a3b9715d75b5078d](https://gasidaseo.notion.site/e49b329c833143d4a3b9715d75b5078d))   
   
위와 같은 스터디를 진행하기위해 Kubernetes Cluster 를 생성하는데 `kubeadm` 으로 Kubernetes 를 배포하면 되는 쉬운 환경이라 큰 걱정 없이 환경 구축을 시작했습니다.   
대부분의 스터디맴버의 환경은 `AWS` 이고 나의 환경은 `OpenStack` 이며, 나는 Public Cloud 를 사용 할 이유가 없었다.   
   
하지만 스터디맴버들과 다른 나의 환경이 문제가 되었습니다.ㅎㅎㅎ   
   
# Issue {#issue}
`kubeadm` 을 이용하여 Master node, Worker node 를 정상적으로 배포하고 Kubernetes CNI 는 Calico 를 사용하여 배포하였다.   
문제는 Pod Network (node to another node) 통신에서 문제가 생겼다.   
**동일 Node 에서는 Pod 간 통신이 가능하지만 서로 다른 Node 는 Pod 간 통신이 불가능하였다.**
   
# Root Cause {#rc}
원인은 OpenStack 내에 Security Group 과 Calico IPIPMode 에 있었다.   
   
첫째로 기본적으로 `OpenStack` 은 Single Network 를 활용하여 Instance 를 배포하고 사용한다.   
스터디 모임에서 제공 받은 CNI Yaml 은 IPIPMode 가 `CrossSubnet` 로 다른 Subnet Network 통신을 할 때, Packet 을 `Encapsulation` 하고   
동일 Network 일 경우, `Direct` 방식으로 통신을 하는 설정이다.   
   
그럼 Direct 로 설정을 변경하면 해결이 될까?   
   
OpenStack 은 기본적으로 VM [Sniffing](https://www.ahnlab.com/kr/site/securityinfo/secunews/secuNewsView.do?menu_dist=3&seq=5185) 을 방지하기 위해 OpenStack Network 로 설정된 이외의 IP Network 는 Drop 하는 설정이 추가되어 있다.   
```bash
Chainneutron-openvswi-xxxxxxxxxx (2 references)
num   pkts bytes target     prot opt in     out    source              destination        
1       0     0 RETURN     udp  --  any    any    default              255.255.255.255     udp spt:bootpc dpt:bootps /* Allow DHCP client traffic. */
2       6     6 neutron-openvswi-xxxxxxx  all  --  any   any     anywhere            anywhere           
3       4     2 RETURN     udp  --  any    any    anywhere             anywhere            udp spt:bootpc dpt:bootps /* Allow DHCPclient traffic. */
4       0     0 DROP       udp  -- any    any     anywhere            anywhere             udp spt:bootpsdpt:bootpc /* Prevent DHCP Spoofing by VM. */
5       0     2 RETURN     all  --  any    any    anywhere             anywhere            state RELATED,ESTABLISHED /* Directpackets associated with a known session to the RETURN chain. */
6       0     0 DROP       all  -- any    any     anywhere            anywhere             state INVALID /* Droppackets that appear related to an existing connection (e.g. TCP ACK/FIN) but donot have an entry in conntrack. */
7       0     0 neutron-openvswi-sg-fallback  all --  any    any     anywhere            anywhere             /* Sendunmatched traffic to the fallback chain. */
```
Num `4` 의 설정이 Drop rule 이다.   
   
위와 같은 이유로 Calico IPIPMode 를 `Always` 로 설정해서 항상 Packet 을 `Encapsulation` 하게 만들어서 해당 Packet Drop 이 발생이 안되도록 설정하였다.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~/lab# calicoctl get ippool -o wide
NAME                  CIDR            NAT    IPIPMODE   VXLANMODE   DISABLED   DISABLEBGPEXPORT   SELECTOR
default-ipv4-ippool   172.16.0.0/16   true   Always     Never       false      false  
```
   
두번째로 OpenStack Security Group(이하 SG) 에 IPIP Protocol 통신을 허용하는 Rule 추가해야된다.   
```bash
$ openstack security group rule create --protocol 4 \
  --remote-group SOURCE_GROUP_NAME SECURITY_GROUP
```
   
<center><img src="/assets/images/post/2022-05-25-calico/1.png" style="max-width: 95%; height: auto;"></center>    
   
# Finish {#finish}
설치 완료된 Kubernetes Cluster 정보.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~/lab# k get nodes -o wide
NAME          STATUS   ROLES                  AGE     VERSION   INTERNAL-IP     EXTERNAL-IP   OS-IMAGE           KERNEL-VERSION      CONTAINER-RUNTIME
chhan-k8s-1   Ready    control-plane,master   6h40m   v1.23.6   10.100.200.4    <none>        Ubuntu 22.04 LTS   5.15.0-25-generic   docker://20.10.16
chhan-k8s-2   Ready    <none>                 6h39m   v1.23.6   10.100.200.21   <none>        Ubuntu 22.04 LTS   5.15.0-25-generic   docker://20.10.16
chhan-k8s-3   Ready    <none>                 6h38m   v1.23.6   10.100.200.9    <none>        Ubuntu 22.04 LTS   5.15.0-25-generic   docker://20.10.16
chhan-k8s-4   Ready    <none>                 6h38m   v1.23.6   10.100.200.12   <none>        Ubuntu 22.04 LTS   5.15.0-25-generic   docker://20.10.16
```
   
위와 같이 이슈에 대한 설정을 진행한 이후에는 Node 간 통신이 아래와 같이 정상적으로 되었다.   
실제로 Packet 이 `Encapsulation` 되는 것도 볼 수 있었다.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~/lab#  tcpdump -i ens3 'ip proto 4' -env
tcpdump: listening on ens3, link-type EN10MB (Ethernet), snapshot length 262144 bytes
16:01:09.257998 fa:16:3e:09:06:eb > fa:16:3e:02:d9:5e, ethertype IPv4 (0x0800), length 118: (tos 0x0, ttl 64, id 46515, offset 0, flags [DF], proto IPIP (4), length 104)
    10.100.200.4 > 10.100.200.21: (tos 0x0, ttl 64, id 19197, offset 0, flags [DF], proto ICMP (1), length 84)
    172.16.200.0 > 172.16.110.23: ICMP echo request, id 1, seq 176, length 64
16:01:09.258463 fa:16:3e:02:d9:5e > fa:16:3e:09:06:eb, ethertype IPv4 (0x0800), length 118: (tos 0x0, ttl 63, id 1725, offset 0, flags [none], proto IPIP (4), length 104)
    10.100.200.21 > 10.100.200.4: (tos 0x0, ttl 63, id 24628, offset 0, flags [none], proto ICMP (1), length 84)
    172.16.110.23 > 172.16.200.0: ICMP echo reply, id 1, seq 176, length 64
16:01:10.282025 fa:16:3e:09:06:eb > fa:16:3e:02:d9:5e, ethertype IPv4 (0x0800), length 118: (tos 0x0, ttl 64, id 46735, offset 0, flags [DF], proto IPIP (4), length 104)
    10.100.200.4 > 10.100.200.21: (tos 0x0, ttl 64, id 19333, offset 0, flags [DF], proto ICMP (1), length 84)
    172.16.200.0 > 172.16.110.23: ICMP echo request, id 1, seq 177, length 64
16:01:10.282569 fa:16:3e:02:d9:5e > fa:16:3e:09:06:eb, ethertype IPv4 (0x0800), length 118: (tos 0x0, ttl 63, id 1898, offset 0, flags [none], proto IPIP (4), length 104)
    10.100.200.21 > 10.100.200.4: (tos 0x0, ttl 63, id 24820, offset 0, flags [none], proto ICMP (1), length 84)
    172.16.110.23 > 172.16.200.0: ICMP echo reply, id 1, seq 177, length 64
```
   
이번 이슈는 OpenStack 과 Calico CNI 를 좀 더 깊이 공부하게 되었다.   
이를 잊지 않기 위해 블로그에 정리 진행한다!   

# 참고 자료 {#refdoc}
* [https://github.com/projectcalico/calico/issues/2700](https://github.com/projectcalico/calico/issues/2700)   
* [https://www.ahnlab.com/kr/site/securityinfo/secunews/secuNewsView.do?menu_dist=3&seq=5185](https://www.ahnlab.com/kr/site/securityinfo/secunews/secuNewsView.do?menu_dist=3&seq=5185)   