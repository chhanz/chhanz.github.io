---
layout: post
title: "[AWS] Client VPN 구축 자동화 도구"
description: "Client VPN 한 번에 구축"
author: chhanz
date: 2026-06-15
tags: [aws, cloud, devops]
categories: [aws]
---

## AWS Client VPN 구축 자동화 도구

![AWS Client VPN 인터넷 게이트웨이 시나리오](/assets/images/post/2026-06-15-fast-aws-clientvpn/1.png)

AWS Client VPN을 구성하다 보면 인증서 발급, ACM import, 엔드포인트 생성, 서브넷 연결, 인가 규칙, 그리고 접속용 `.ovpn` 파일 생성까지 손이 많이 가는 작업을 매번 반복하게 됩니다. 저의 경우에도 테스트 환경을 만들고 지우는 일이 잦아, 이 과정을 명령 한 줄로 처리할 수 있도록 도구를 만들어 보았습니다.

이번 포스팅에서는 직접 만든 `fast-aws-clientvpn` 도구의 구조와 사용 방법에 대해 기록하도록 하겠습니다.

- 저장소: [https://github.com/chhanz/fast-aws-clientvpn](https://github.com/chhanz/fast-aws-clientvpn)

### 설계 방향

이 도구는 두 가지 역할을 명확히 나눕니다.

- 인증서 "생성"은 셸 스크립트(`mgt-clientvpn.sh`)가 담당합니다.
- AWS 자원의 "상태"는 CloudFormation 템플릿(`clientvpn.yaml`)이 담당합니다.

인증서 발급은 절차적인 작업이라 shell 을 통해 생성을 하며, 엔드포인트 같은 클라우드 자원은 선언적으로 관리하는 것이 자연스럽기 때문에 CloudFormation으로 분리했습니다. 인증 방식은 상호 인증(서버와 클라이언트가 같은 CA로 서명된 X.509 인증서)을 사용합니다.

구성 파일은 아래와 같습니다.

| 파일 | 설명 |
|------|------|
| `mgt-clientvpn.sh` | 통합 관리 스크립트 (단일 진입점) |
| `clientvpn.yaml` | CloudFormation 템플릿 (VPN 인프라 선언) |
| `clientvpn.conf` | `configure` 가 생성하는 설정 파일 (직접 만들지 않아도 됩니다) |

### 테스트 환경

- 실행 호스트: MacOS
- AWS CLI v2 설치 및 자격 증명 구성 (`aws configure` )
- `git` 설치 (인증서 생성 시 easy-rsa를 내려받습니다)
- 필요한 권한: ACM, EC2(Client VPN), CloudFormation
- 대상 VPC와 서브넷 및 외부 접근이 필요한 경우 인터넷 게이트웨이 혹은 NAT 게이트웨이가 필요합니다.

### 사용 순서

권장 흐름은 `configure` -> `deploy` -> `status` -> `gen` -> `destroy` 입니다.

#### 1. configure - 환경값 입력

아래와 같이 대화형으로 환경값을 입력받아 `clientvpn.conf` 에 저장합니다.

```bash
$ ./mgt-clientvpn.sh configure
Region [ap-northeast-2]:
VPC ID: vpc-0abc1234
Subnet ID: subnet-0def5678
Client CIDR (/22~/12) [10.100.0.0/22]:
Internal network CIDR (to authorize) [172.31.0.0/16]:
Split Tunnel? (true/false) [true]:
DNS servers (comma-separated) [169.254.169.253]:
[OK] Subnet-VPC match confirmed
[OK] Saved -> ./clientvpn.conf
```

입력값은 두 단계로 검증합니다.

- 형식 검증(항상): VPC/Subnet ID 접두사, Client CIDR 마스크 범위(/22 ~ /12).
- 실시간 검증(권한이 있을 때): 서브넷이 실제로 그 VPC에 속하는지 확인합니다. 권한이 없으면 검증을 건너뛰고 수동 확인 안내를 보여준 뒤 진행합니다(배포를 막지 않습니다).

각 항목의 의미는 아래와 같습니다.

| 항목 | 기본값 | 설명 |
|------|--------|------|
| Region | `ap-northeast-2` | 배포할 리전 |
| VPC ID | (필수) | `vpc-` 로 시작 |
| Subnet ID | (필수) | `subnet-` 로 시작 |
| Client CIDR | `10.100.0.0/22` | VPN 접속자에게 줄 IP 대역 (/12 ~ /22) |
| 사내망 CIDR | `172.31.0.0/16` | VPN으로 접근을 허용할 내부 대역 |
| Split Tunnel | `true` | true면 사내망 트래픽만 VPN으로 보냅니다 |
| DNS Servers | `169.254.169.253` | VPN 클라이언트에 푸시할 DNS (AWS Route 53 Resolver 주소) |

#### 2. deploy - 배포

아래 명령으로 배포를 진행합니다.

```bash
$ ./mgt-clientvpn.sh deploy                # Split Tunnel (기본)
$ ./mgt-clientvpn.sh deploy --full-tunnel  # Full Tunnel (모든 트래픽을 VPN으로)
```

배포는 다음 순서로 동작합니다.

1. ACM에서 태그 `Name=clientvpn-server` 인 인증서를 찾습니다.
2. 없으면 easy-rsa로 CA/서버/클라이언트 인증서를 생성하고 ACM에 import 합니다. 있으면 그대로 재사용합니다.
3. CloudFormation으로 VPN 엔드포인트를 배포합니다.
4. 접속용 `.ovpn` 파일을 생성합니다 (스크립트와 같은 디렉토리의 `clientvpn-certs/` 아래).

여기서 멱등성의 기준은 로컬 파일이 아니라 ACM 인증서의 태그(`Name=clientvpn-server`) 한 가지입니다. 호스트를 새로 만들어도 같은 태그의 인증서가 있으면 그대로 재사용하기 때문에, 같은 명령을 다시 실행해도 안전하게 동작합니다.

Split Tunnel과 Full Tunnel의 차이는 아래와 같습니다.

- Split(기본): 사내망(`TargetCidr`) 트래픽만 VPN을 거치고, 나머지는 일반 인터넷 회선으로 갑니다.
- Full: 모든 트래픽(`0.0.0.0/0`)을 VPN으로 보냅니다. Split 모드에서는 `0.0.0.0/0` 경로를 만들지 않습니다(연결이 끊길 수 있어 의도적으로 막아둡니다).
- Full Tunnel로 배포하면 인터넷 트래픽을 위한 인가 규칙(`0.0.0.0/0` authorization rule)이 자동으로 추가됩니다(이게 없으면 인터넷이 차단됩니다).

#### 3. status - 상태 확인

아래 명령으로 현재 상태를 확인합니다.

```bash
$ ./mgt-clientvpn.sh status
=== Stack status ===
CREATE_COMPLETE

=== Client VPN endpoint ===
-------------------------------------------------------------------
|  cvpn-endpoint-0abc...  |  available  |  True  |  10.100.0.0/22  |
-------------------------------------------------------------------

=== Tunnel mode ===
Current conf SPLIT_TUNNEL=true (Split: only internal network over VPN)
DNS servers pushed to clients: 169.254.169.253
```

위와 같이 스택 상태, 엔드포인트 상태, 연결된 서브넷, 인증서 ARN, 터널 모드를 확인 할 수 있습니다.

Client CIDR은 엔드포인트 생성 후 변경할 수 없습니다. 바꾸려면 `destroy` 후 다시 배포해야 합니다.

#### 4. gen - 접속 설정 재생성

이미 배포된 엔드포인트의 `.ovpn` 파일을 다시 내려받아 생성합니다.

```bash
$ ./mgt-clientvpn.sh gen
[OK] Client configuration generated: ./clientvpn-certs/clientvpn-stack-client1.ovpn
```

#### 5. destroy - 삭제

`yes` 를 입력해야 진행합니다. 스택을 먼저 삭제하고 완료를 기다린 뒤 인증서를 정리합니다.

```bash
$ ./mgt-clientvpn.sh destroy
Really delete? (yes): yes
[OK] Stack deletion complete.
[OK] Certificate deletion complete.
```

엔드포인트가 인증서를 참조하고 있어 순서를 지키지 않으면 인증서 삭제가 실패합니다. 그래서 스택 삭제가 끝나기를 기다린 뒤 인증서를 정리하도록 했습니다.

### 생성되는 파일 위치

- 설정 파일: 스크립트와 같은 디렉토리의 `clientvpn.conf`
- 인증서/키 및 `.ovpn`: 스크립트와 같은 디렉토리의 `clientvpn-certs/`
  - 개인 키 파일은 권한 `600` 으로 저장됩니다.

생성된 `.ovpn` 파일은 AWS VPN Client 또는 OpenVPN 호환 클라이언트에서 그대로 불러와 접속할 수 있습니다. 클라이언트 인증서와 키가 파일 안에 함께 삽입되기 때문에 별도 설정 없이 바로 사용 가능합니다.

### 참고

위와 같은 방법으로 인증서 발급부터 엔드포인트 배포, 접속 설정 파일 생성까지 명령 한 줄로 처리가 가능합니다. 테스트 환경을 반복해서 만들고 지우거나, 간단한 원격 접속 환경이 필요할 때 활용하면 도움이 됩니다.

- 저장소: [https://github.com/chhanz/fast-aws-clientvpn](https://github.com/chhanz/fast-aws-clientvpn)
- AWS Client VPN 공식 문서: [https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/](https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/)
- easy-rsa: [https://github.com/OpenVPN/easy-rsa](https://github.com/OpenVPN/easy-rsa)
