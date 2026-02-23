---
layout: post
title: "[Prometheus] Pacemaker Exporter 사용기"
description: ""
author: chhanz
date: 2022-08-07
tags: [linux]
category: linux
---

# Pacemaker Exporter 사용기
Pacemaker (이하 `pcs`) Exporter 를 사용해보고 실제 pcs cluster 를 어떻게 모니터링 하는지 확인해보자.   
   
# pcs exporter 설치
아래 명령을 통해 설치가 가능하다.   
```bash
[root@c-node-4 ~]# wget https://github.com/ClusterLabs/ha_cluster_exporter/releases/download/1.3.0/ha_cluster_exporter-amd64.gz
 
[root@c-node-4 ~]# gzip -d ha_cluster_exporter-amd64.gz
 
[root@c-node-4 ~]# chmod u+x ha_cluster_exporter-amd64
```
pcs cluster node 에 해당 exporter 를 설치한다.   
    
# pcs exporter option
pcs exporter 의 option 은 아래와 같다.   
```bash
[root@c-node-4 ~]# ./ha_cluster_exporter-amd64 --help
usage: ha_cluster_exporter-amd64 [<flags>]
 
Flags:
  -h, --help                    Show context-sensitive help (also try --help-long and --help-man).
      --web.listen-address=:9664
                                Address to listen on for web interface and telemetry.
      --web.telemetry-path=/metrics
                                Path under which to expose metrics.
      --web.config.file=/etc/ha_cluster_exporter.web.yaml
                                [EXPERIMENTAL] Path to configuration file that can enable TLS or authentication.
      --crm-mon-path=/usr/sbin/crm_mon
                                path to crm_mon executable
      --cibadmin-path=/usr/sbin/cibadmin
                                path to cibadmin executable
      --corosync-cfgtoolpath-path=/usr/sbin/corosync-cfgtool
                                path to corosync-cfgtool executable
      --corosync-quorumtool-path=/usr/sbin/corosync-quorumtool
                                path to corosync-quorumtool executable
      --sbd-path=/usr/sbin/sbd  path to sbd executable
      --sbd-config-path=/etc/sysconfig/sbd
                                path to sbd configuration
      --drbdsetup-path=/sbin/drbdsetup
                                path to drbdsetup executable
      --drbdsplitbrain-path=/var/run/drbd/splitbrain
                                path to drbd splitbrain hooks temporary files
      --enable-timestamps       [DEPRECATED] server-side metric timestamping is discouraged by Prometheus best-practices and should be avoided
      --address=0.0.0.0         [DEPRECATED] please use --web.listen-address or --web.config.file to use Prometheus Exporter Toolkit
      --port=9664               [DEPRECATED] please use --web.listen-address or --web.config.file to use Prometheus Exporter Toolkit
      --log-level=info          [DEPRECATED] please user log.level
      --log.level=info          Only log messages with the given severity or above. One of: [debug, info, warn, error]
      --log.format=logfmt       Output format of log messages. One of: [logfmt, json]
      --version                 Show application version.
```
   
# run pcs exporter
default 설정으로 exporter 를 구동하면 아래와 같이 `9664` port 로 metric 을 expose 한다.   
```bash
[root@c-node-4 ~]# netstat -antp
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
...생략
tcp6       0      0 :::9664                 :::*                    LISTEN      27528/./ha_cluster_     <<
```
   
아래와 같이 metric expose 를 확인 할 수 있다.   
```bash
[root@c-node-4 ~]# curl localhost:9664/metrics
# HELP ha_cluster_corosync_member_votes How many votes each member node has contributed with to the current quorum
# TYPE ha_cluster_corosync_member_votes gauge
ha_cluster_corosync_member_votes{local="false",node="c-node-5",node_id="5"} 1
ha_cluster_corosync_member_votes{local="false",node="c-node-6",node_id="6"} 1
ha_cluster_corosync_member_votes{local="true",node="c-node-4",node_id="4"} 1
# HELP ha_cluster_corosync_quorate Whether or not the cluster is quorate
# TYPE ha_cluster_corosync_quorate gauge
ha_cluster_corosync_quorate 1
...생략
```
   
* 참고 : 상세 metric 정보는 해당 [문서 (https://github.com/ClusterLabs/ha_cluster_exporter/blob/main/doc/metrics.md)](https://github.com/ClusterLabs/ha_cluster_exporter/blob/main/doc/metrics.md) 를 참고한다.   
   
# grafana dashboard 
ClusterLabs 에서 제공하는 Grafana 기본 Dashboard 를 이용하여 pcs cluster monitoring 를 한다.   
   
해당 Dashboard 는 https://grafana.com/grafana/dashboards/12229 에서 확인이 가능하며 Grafana 에서 아래와 같이 추가를 할 수 있다.   
   
<center><img src="/assets/images/post/2022-08-07-pcs-exporter/import.png" style="max-width: 95%; height: auto;"></center>   
    
ClusterLabs 에서 제공한 Dashboard 는 `Node-exporter` metric 과 `pcs-exporter` metric 을 같이 사용한다.   
Prometheus 에서 위와 같이 Target 을 설정한다.   
```bash
- job_name: "pcs"
  static_configs:
    - targets:
        - c-node-4:9664
        - c-node-5:9664
        - c-node-6:9664
        - c-node-4:9100
        - c-node-5:9100
        - c-node-6:9100
```
Label 이 `Node-exporter`와 `pcs-exporter` 하나로 관리 되야지 Dashboard 에서 확인이 가능하다.   
   
Dashboard 설정이 완료되면 아래와 같이 Cluster 를 monitoring 할 수 있다.   
<center><img src="/assets/images/post/2022-08-07-pcs-exporter/all-clean.png" style="max-width: 95%; height: auto;"></center>   
    
# Test
## Stop Node
Cluster node 한대를 stop 한다.   
<center><img src="/assets/images/post/2022-08-07-pcs-exporter/node-one-err.png" style="max-width: 95%; height: auto;"></center>   
    
위와 같이 node 하나다 offline 된 것을 볼 수 있다.   
   
## Fail Resource
Cluster Resource 문제 감지에 대한 테스트를 위해 아래와 같이 강제로 VIP 를 제거한다.   
```bash
[root@c-node-4 ~]# ip addr del 192.168.200.250/24 dev eth0
[root@c-node-4 ~]# ip a
...생략
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 52:54:00:2f:96:6f brd ff:ff:ff:ff:ff:ff
    inet 192.168.200.98/24 brd 192.168.200.255 scope global dynamic eth0
...생략

[root@c-node-4 ~]# pcs status
Cluster name: testcluster
Stack: corosync
Current DC: c-node-4 (version 1.1.23-1.el7_9.1-9acf116022) - partition with quorum
Last updated: Mon Aug  1 14:31:28 2022
Last change: Mon Aug  1 14:30:17 2022 by root via cibadmin on c-node-4
 
3 nodes configured
1 resource instance configured
 
Online: [ c-node-4 c-node-6 ]
OFFLINE: [ c-node-5 ]
 
Full list of resources:
 
 VIP    (ocf::heartbeat:IPaddr2):       FAILED c-node-4     << 실패
 
Failed Resource Actions:
* VIP_monitor_10000 on c-node-4 'not running' (7): call=7, status=complete, exitreason='',
    last-rc-change='Mon Aug  1 14:31:28 2022', queued=0ms, exec=0ms
 
Daemon Status:
  corosync: active/disabled
  pacemaker: active/disabled
  pcsd: active/enabled
```
<center><img src="/assets/images/post/2022-08-07-pcs-exporter/resource-err.png" style="max-width: 95%; height: auto;"></center>   
    
위와 같이 Resource 상태 확인하고 Fail Count 를 증가한다.   
   
## Crash Cluster 
강제로 node 의 interface 를 down 으로 만들어 총 Node 두대를 장애로 만들어본다.   
```bash
[root@c-node-6 ~]# ifdown eth0
```
   
<center><img src="/assets/images/post/2022-08-07-pcs-exporter/node-two-err.png" style="max-width: 95%; height: auto;"></center>   
    
위와 같이 Cluster 의 status 가 KO 로 표기된다.

## Clean Resouce 
Cluster 정상화 이후, Resource 의 Fail count 초기화를 진행한다.   
```bash
[root@c-node-4 ~]# pcs resource cleanup
Cleaned up all resources on all nodes
Waiting for 1 reply from the CRMd. OK
```
<center><img src="/assets/images/post/2022-08-07-pcs-exporter/resource-clean.png" style="max-width: 95%; height: auto;"></center>   
    
위와 같이 Fail count 가 초기화 된 것을 볼 수 있다.   
