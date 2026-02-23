---
layout: post
title: "[CEPH] Ceph Architecture"
description: ""
author: chhanz
date: 2021-08-18
tags: [ceph]
category: ceph
---
   <center><img src="/assets/images/post/2021-08-18-ceph-architecture/ceph.png" style="max-width: 95%; height: auto;"></center>   

# Ceph 란?
Ceph는 오픈소스 소프트웨어(Software Defined Storage) 스토리지 플랫폼으로 단일 분산 컴퓨터 클러스터에 object 스토리지를 구현하고 object, block 및 file Level 의 스토리지 기능을 제공한다.   
또한 ***single point of failure*** 이 없는 완전히 분산된 운영을 주로 목표로 하며 엑사바이트 수준으로 scale-out이 가능하다.   
   
# 소프트웨어 정의 스토리지(Software Defined Storage)를 선택해야 하는 이유
소프트웨어 정의 스토리지의 주요 이점은 다음과 같다.   
* 비용 대비 성능 절충 : 애플리케이션이 동일한 소프트웨어 스택을 사용하여 서로 다른 하드웨어 및 내구성 구성의 성능 및 비용 절충을 선택할 수 있다.
* 유연한 인터페이스 : 산업 표준 API를 선택하거나, 애플리케이션에 클라이언트 라이브러리를 내장하거나, 필요한 경우 독점 API를 사용할 수 있다.
* 다양한 스토리지 구현 : object, block 및 file 추상화 전반에 걸쳐 동일한 스토리지 소프트웨어 스택을 활용하여 R&D 및 운영 비용을 절감한다.

# Ceph architecture

   <center><img src="/assets/images/post/2021-08-18-ceph-architecture/1.png" style="max-width: 95%; height: auto;"></center>   

* **Ceph OSD daemon** : Ceph OSD는 Ceph 클라이언트를 대신하여 데이터를 저장한다.    
     또한 Ceph OSD는 Ceph 노드의 CPU, 메모리 및 네트워킹을 활용하여 data replication, erasure coding, rebalancing, recovery, monitoring 및 report 기능을 수행한다.   
* **Ceph Monitor** : Ceph Monitor는 Ceph 스토리지 클러스터의 현재 상태에 대한 Ceph 스토리지 클러스터 맵의 마스터 복사본을 유지한다.   
     모니터에는 높은 일관성이 필요하며, Ceph 스토리지 클러스터의 상태에 대한 합의를 보장하기 위해 Paxos 알고리즘을 사용한다.   
* **Ceph Manager** : Ceph Manager는 Ceph Monitor 대신 placement groups(PG), 프로세스 메타데이터 및 호스트 메타데이터에 대한 자세한 정보를 유지하여 규모에 맞게 성능을 크게 향상시킨다.   
     Ceph Manager는 PG 통계와 같은 많은 읽기 전용 Ceph CLI 쿼리의 실행을 처리한다. Ceph Manager는 RESTful 모니터링 API도 제공한다.   
* **MDS(Metadata Servers)** : 클라이언트에 의한 효율적인 POSIX 명령 실행을 위해 CephFS 에서 사용하는 메타데이터를 저장한다.      
    
   
## Ceph Clients

   <center><img src="/assets/images/post/2021-08-18-ceph-architecture/2.png" style="max-width: 95%; height: auto;"></center>   

### Ceph Object Gateway (RADOS Gateway)
Ceph Object Gateway(RADOS Gateway, RADOSGW 또는 RGW)는 라이브러리(librados)를 사용하여 구축된 object 스토리지 인터페이스이다.   
라이브러리를 사용하여 Ceph 클러스터와 통신하고 OSD 프로세스에 직접 데이터를 쓴다. 응용 프로그램에 RESTful API가 포함된 게이트웨이를 제공하고 다음 두 인터페이스를 지원한다. (Amazon S3 및 OpenStack Swift)   
   
Ceph Object Gateway는 배포할 수 있는 게이트웨이 수를 제한하지 않고 표준 HTTP 로드 밸런서를 지원하여 확장성 지원을 제공한다.   
   
RGW 의 몇 가지 사용 사례는 다음과 같다.   
* Image storage (for example, SmugMug, Tumblr)   
* Backup services   
* File storage and sharing (for example, Dropbox)   
   
### RADOS Block Device
Ceph Block Device(RADOS block device, RBD)는 RBD 이미지를 통해 Ceph 클러스터 내에 블록 스토리지를 제공한다.   
RBD 이미지는 클러스터의 서로 다른 OSD에 흩어져 있는 개별 object로부터 구성됩니다. 클러스터 내의 object 간에 데이터를 스트라이핑 할 수 있다.   
RBD를 구성하는 object는 클러스터 주변의 서로 다른 OSD에 분산되기 때문에 블록 디바이스에 대한 액세스는 자동으로 병렬화된다.   
   
RBD는 다음과 같은 기능을 제공한다.
* Storage for virtual disks in the Ceph cluster   
* Mount support in the Linux kernel   
* Boot support in QEMU, KVM, and OpenStack Cinder   
   
### Ceph File System (CephFS)
Ceph 파일 시스템(CephFS)은 확장 가능한 단일 계층 공유 디스크를 제공하는 병렬 파일 시스템이다.   
CephFS에 저장된 파일과 관련된 메타데이터는 Ceph Metadata Server(MDS)에서 관리한다.   
   
## Placement Groups 

   <center><img src="/assets/images/post/2021-08-18-ceph-architecture/3.png" style="max-width: 80%; height: auto;"></center>   


클러스터에 수백만 개의 object 를 저장하고 개별적으로 관리하는 것은 리소스를 많이 사용한다.   
따라서 Ceph는 placement group (PG)을 사용하여 수많은 object 를 보다 효율적으로 관리한다.   
   
PG는 object 모음을 포함하는 역할을 하는 Pool 의 하위 집합이다.   
Ceph는 Pool 을 일련의 PG로 분할하고 [***CRUSH 알고리즘***](https://whatis.techtarget.com/definition/CRUSH-Controlled-Replication-Under-Scalable-Hashing)은 클러스터 맵과 클러스터 상태를 고려하여 PG를 클러스터의 OSD에 무작위로 고르게 배포한다.   

## Pool 

   <center><img src="/assets/images/post/2021-08-18-ceph-architecture/4.jpg" style="max-width: 95%; height: auto;"></center>   

PG 의 집합(Object 의 집합)이며 Pool 단위로 PG 를 관리하고 데이터를 저장한다.   
   
## Pool Type

   <center><img src="/assets/images/post/2021-08-18-ceph-architecture/5.png" style="max-width: 95%; height: auto;"></center>   

기본적으로 Ceph 는 Replicated pool 방식과 Erasure coded pool 방식을 통해 데이터 복원을 지원한다.   
주로 일반 스토리지의 RAID 1 (mirror) 와 RAID 6 or RAID 5 (parity) 와 비교한다면 이해가 편할 것이다.   
   
각 방식에는 아래와 같은 장단점이 있다.   
* Replicated pool   
    + 높은 내구성   
    + 3 replica 로 인한 200% overhead   
    + 빠른 복구     
* Erasure coded pool   
    + 비용 효율적인 내구성   
    + 50% overhead   
    + expensive recovery   

# 참고 자료
원문 및 캡처 자료는 아래 자료들을 참고 했습니다.   
* [https://docs.ceph.com/en/latest/start/intro/](https://docs.ceph.com/en/latest/start/intro/)   
* [https://access.redhat.com/documentation/en-us/red_hat_ceph_storage/4/html/architecture_guide/the-ceph-architecture_arch](https://access.redhat.com/documentation/en-us/red_hat_ceph_storage/4/html/architecture_guide/the-ceph-architecture_arch)   
* [https://www.slideshare.net/sageweil1/20150222-scale-sdc-tiering-and-ec](https://www.slideshare.net/sageweil1/20150222-scale-sdc-tiering-and-ec)   
* [https://docs.ceph.com/en/mimic/rados/operations/pools/](https://docs.ceph.com/en/mimic/rados/operations/pools/)   
* [https://www.theregister.com/2018/11/22/ceph_ref_architecture/](https://www.theregister.com/2018/11/22/ceph_ref_architecture/)   
* [https://whatis.techtarget.com/definition/CRUSH-Controlled-Replication-Under-Scalable-Hashing](https://whatis.techtarget.com/definition/CRUSH-Controlled-Replication-Under-Scalable-Hashing)   
* [https://en.wikipedia.org/wiki/Erasure_code](https://en.wikipedia.org/wiki/Erasure_code)   
