---
layout: post
title: "[AWS] CloudFormation과 SSM을 이용한 RHEL HA 클러스터 자동 구성"
description: ""
author: chhanz
date: 2025-08-20
tags: [aws, linux, cloud]
category: aws
---

![](https://clusterlabs.org/projects/pacemaker/doc/deprecated/en-US/Pacemaker/2.0/html-single/Pacemaker_Administration/Common_Content/images/title_logo.svg)

# RHEL HA 클러스터 자동 구성
AWS에서 RHEL 기반 고가용성(HA) 클러스터를 자동으로 구성하는 솔루션을 소개합니다.   
CloudFormation 템플릿과 SSM 문서를 활용하여 Pacemaker 기반의 HA 클러스터를 완전 자동화된 방식으로 배포할 수 있습니다.   
   
<center><h1 style="color: red;">
<br> [주의] 해당 솔루션은 POC 환경 혹은 개발 환경, 이슈 재현 환경등으로 사용하는 것을 권장 드립니다. <br> <br>
운영 환경에는 적합한 설정이 아닌 부분이 있을 수 있습니다.<br> <br>
</h1></center>
   
# 솔루션 소스 
Github 의 [chhanz/rhel.ha-cluster_pacemaker_on_aws](https://github.com/chhanz/rhel.ha-cluster_pacemaker_on_aws) 에서 소스를 제공하고 있습니다.   
   
# 솔루션 개요
이 솔루션은 두 가지 주요 구성 요소로 이루어져 있습니다:

1. **CloudFormation 템플릿** (`deployment.yaml`) - AWS 인프라 자동 구성
2. **SSM 문서** (`ha-cluster-setup-document.json`) - HA 클러스터 자동 설정

## 아키텍처 구성
### 인프라 구성
- 기본 리전 : ap-northeast-2 (서울)   
- **VPC**: `10.0.0.0/16` CIDR 블록   
- **서브넷**:    
  - SubnetB (ap-northeast-2b): `10.0.1.0/24`   
  - SubnetD (ap-northeast-2d): `10.0.2.0/24`   
- **EC2 인스턴스**: RHEL 9.6 (`t3.medium`) 2대   
- **보안 그룹**: 클러스터 내부 통신 허용   
- **IAM 역할**: STONITH 및 Elastic IP 관리 권한   

### HA 클러스터 구성
- **Pacemaker/Corosync** 기반 클러스터
- **STONITH**: `fence_aws` 사용
- **Ansible**: `rhel-system-roles` 로 자동 구성
- **선택적 Dummy 리소스**: 테스트용 Dummy 리소스

# 배포 과정

## 1단계: 인프라 배포
CloudFormation 스택을 생성하여 AWS 인프라를 구성합니다.

```bash
# CloudFormation 스택 생성
aws cloudformation create-stack \
    --stack-name rhel-ha-cluster \
    --template-body file://deployment.yaml \
    --parameters ParameterKey=SameSubnet,ParameterValue=false \
    --capabilities CAPABILITY_NAMED_IAM \
    --region ap-northeast-2
```

### 파라미터 설명
- `SameSubnet`: 
  - `false` (기본값): 서로 다른 AZ에 배치 (권장)
  - `true`: 같은 서브넷에 배치
   
인스턴스가 생성되고 운영체제 업데이트 및 최초 설정 작업이 수행되고, 운영체제 재부팅이 진행 될 것 입니다.    
진행이 완료된 이후, 다음 단계로 가시면 됩니다.      

## 2단계: SSM 문서 생성
HA 클러스터 자동 설정을 위한 SSM 문서를 생성합니다.

```bash
# SSM 문서 생성
aws ssm create-document \
    --name "HA-Cluster-Setup" \
    --document-type "Command" \
    --document-format "JSON" \
    --content file://ha-cluster-setup-document.json \
    --region ap-northeast-2
```

## 3단계: HA 클러스터 구성
생성된 인스턴스에서 HA 클러스터를 자동으로 구성합니다.
   
***[주의] HA 클러스터 설정 실행은 Node 1 에서만 SSM 문서 "명령 실행" 을 수행합니다.***   
   
```bash
# 인스턴스 정보 확인
aws cloudformation describe-stacks \
    --stack-name rhel-ha-cluster \
    --query 'Stacks[0].Outputs' \
    --region ap-northeast-2

# HA 클러스터 설정 실행 > Node 1 로 사용될 인스턴스 한대에 대상으로 SSM 문서 명령 실행
aws ssm send-command \
    --document-name "HA-Cluster-Setup" \
    --instance-ids "i-xxxxxxxxx" \
    --parameters '{
        "Node1InstanceId":"i-xxxxxxxxx",
        "Node1PrivateIP":"10.0.1.10",
        "Node2InstanceId":"i-yyyyyyyyy",
        "Node2PrivateIP":"10.0.2.20",
        "ClusterPassword":"secure-password",
        "ClusterName":"my-ha-cluster",
        "DeployDummyResource":"false"
    }' \
    --region ap-northeast-2
```
   
혹은 Systems Manager > "문서" 에서 "HA-Cluster-Setup" 를 검색하고 실행하면 AWS 콘솔에서도 각 파라미터를 입력 할 수 있도록 제공합니다.   

![HA-Cluster-Setup 파라미터](/assets/images/post/2025-08-20-pcs-ssm/ssm-para.png)

# 주요 기능

## 자동화된 구성
- **시스템 업데이트**: 최신 패키지로 자동 업데이트
- **사용자 생성**: haadm 계정 자동 생성
- **인스턴스 연결**: Session Manager 를 사용하도록 설정
- **필수 패키지**: rhel-system-roles, AWS CLI, 기타 도구 설치

## HA 클러스터 설정
- **방화벽/SELinux**: 자동 비활성화
- **부팅 시 시작**: 비활성화 (수동 시작)
- **클라우드 에이전트**: 자동 설치
- **STONITH 설정**: `fence_aws` 사용

## 네트워크 구성
- **호스트 파일**: 자동 업데이트 (`/etc/hosts`)
- **Ansible 인벤토리**: 동적 생성

# 생성되는 파일들
SSM 문서 실행 시 `/usr/local/ha_cluster/`에 다음 파일들이 생성됩니다:

- `inventory.yml`: Ansible 인벤토리
- `update-hosts.yaml`: 호스트 파일 업데이트 플레이북
- `fast-aws-playbook.yaml`: HA 클러스터 배포 플레이북
- `group_vars/${CLUSTER_NAME}.yml`: 클러스터 설정 변수

# 클러스터 상태 확인
배포 완료 후 클러스터 상태를 확인할 수 있습니다.

```bash
# 클러스터 상태 확인
$ sudo pcs status
Cluster name: fast-aws-rh-cluster
Cluster Summary:
  * Stack: corosync (Pacemaker is running)
  * Current DC: fast-aws-rh-node-1 (version 2.1.9-1.2.el9_6-49aab9983) - partition with quorum
  * Last updated: Wed Aug 20 04:51:15 2025 on fast-aws-rh-node-1
  * Last change:  Wed Aug 20 04:50:26 2025 by root via root on fast-aws-rh-node-1
  * 2 nodes configured
  * 4 resource instances configured

Node List:
  * Online: [ fast-aws-rh-node-1 fast-aws-rh-node-2 ]

Full List of Resources:
  * mystonith   (stonith:fence_aws):     Started fast-aws-rh-node-1
  * example-1   (ocf:pacemaker:Dummy):   Started fast-aws-rh-node-2
  * example-2   (ocf:pacemaker:Dummy):   Started fast-aws-rh-node-1
  * example-3   (ocf:pacemaker:Dummy):   Started fast-aws-rh-node-2

Daemon Status:
  corosync: active/disabled
  pacemaker: active/disabled
  pcsd: active/enabled
```
# 클러스터 설정 확인
   
```bash
$ sudo pcs config
Cluster Name: fast-aws-rh-cluster
Corosync Nodes:
 fast-aws-rh-node-1 fast-aws-rh-node-2
Pacemaker Nodes:
 fast-aws-rh-node-1 fast-aws-rh-node-2

Resources:
  Resource: example-1 (class=ocf provider=pacemaker type=Dummy)
    Operations:
      migrate_from: example-1-migrate_from-interval-0s
        interval=0s timeout=20s
      migrate_to: example-1-migrate_to-interval-0s
        interval=0s timeout=20s
      monitor: example-1-monitor-interval-10s
        interval=10s timeout=20s
      reload: example-1-reload-interval-0s
        interval=0s timeout=20s
      reload-agent: example-1-reload-agent-interval-0s
        interval=0s timeout=20s
      start: example-1-start-interval-0s
        interval=0s timeout=20s
      stop: example-1-stop-interval-0s
        interval=0s timeout=20s
  Resource: example-2 (class=ocf provider=pacemaker type=Dummy)
    Operations:
      migrate_from: example-2-migrate_from-interval-0s
        interval=0s timeout=20s
      migrate_to: example-2-migrate_to-interval-0s
        interval=0s timeout=20s
      monitor: example-2-monitor-interval-10s
        interval=10s timeout=20s
      reload: example-2-reload-interval-0s
        interval=0s timeout=20s
      reload-agent: example-2-reload-agent-interval-0s
        interval=0s timeout=20s
      start: example-2-start-interval-0s
        interval=0s timeout=20s
      stop: example-2-stop-interval-0s
        interval=0s timeout=20s
  Resource: example-3 (class=ocf provider=pacemaker type=Dummy)
    Operations:
      migrate_from: example-3-migrate_from-interval-0s
        interval=0s timeout=20s
      migrate_to: example-3-migrate_to-interval-0s
        interval=0s timeout=20s
      monitor: example-3-monitor-interval-10s
        interval=10s timeout=20s
      reload: example-3-reload-interval-0s
        interval=0s timeout=20s
      reload-agent: example-3-reload-agent-interval-0s
        interval=0s timeout=20s
      start: example-3-start-interval-0s
        interval=0s timeout=20s
      stop: example-3-stop-interval-0s
        interval=0s timeout=20s

Stonith Devices:
  Resource: mystonith (class=stonith type=fence_aws)
    Attributes: mystonith-instance_attributes
      pcmk_delay_max=45
      pcmk_host_map=fast-aws-rh-node-1:i-123456789012abcdef;fast-aws-rh-node-2:i-09876543214321ffedcba
      pcmk_reboot_retries=4
      pcmk_reboot_timeout=600
      power_timeout=600
      region=ap-northeast-2
    Operations:
      monitor: mystonith-monitor-interval-300
        interval=300 timeout=60
      start: mystonith-start-interval-0s
        interval=0s timeout=600

Cluster Properties: cib-bootstrap-options
  cluster-infrastructure=corosync
  cluster-name=fast-aws-rh-cluster
  dc-version=2.1.9-1.2.el9_6-49aab9983
  have-watchdog=false
  stonith-watchdog-timeout=0
```
   
# STONITH 테스트

```bash
$ sudo pcs stonith fence fast-aws-rh-node-2
Node: fast-aws-rh-node-2 fenced
```
   
# 정리
사용이 완료된 후에는 다음 명령어로 리소스를 정리할 수 있습니다.

```bash
# CloudFormation 스택 삭제
aws cloudformation delete-stack \
    --stack-name rhel-ha-cluster \
    --region ap-northeast-2

# SSM 문서 삭제
aws ssm delete-document \
    --name "HA-Cluster-Setup" \
    --region ap-northeast-2
```

# 참고 문서
* rhel.ha-cluster_pacemaker_on_aws:    
[https://github.com/chhanz/rhel.ha-cluster_pacemaker_on_aws](https://github.com/chhanz/rhel.ha-cluster_pacemaker_on_aws)
* Red Hat High Availability Add-On Reference :    
[https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9/html/configuring_and_managing_high_availability_clusters/index](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9/html/configuring_and_managing_high_availability_clusters/index)
