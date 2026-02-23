---
layout: post
title: "[Linux] ISC DHCP 에서 Kea DHCP 로 마이그레이션 (Docker)"
description: "ISC DHCP (dhcpd) 에서 Kea DHCP 컨테이너로 마이그레이션하는 방법"
author: chhanz
date: 2026-02-09
tags: [linux, docker]
categories: [linux]
---

# ISC DHCP 에서 Kea DHCP 로 마이그레이션 (Docker)

## ISC DHCP EOL (End of Life)

ISC(Internet Systems Consortium) 는 2022년 말에 ISC DHCP (dhcpd) 의 유지보수 종료를 공식 발표하였습니다.   
1995년부터 약 30년간 사용되어 온 ISC DHCP 는 더 이상 업데이트가 제공되지 않으며, 심각한 보안 취약점이 발견되더라도 패치가 제공되지 않습니다.   
   
ISC 는 후속 DHCP 서버로 Kea DHCP 를 권장하고 있으며, 마이그레이션을 위한 도구인 KeaMA(Kea Migration Assistant) 와 공식 Docker 이미지도 제공하고 있습니다.   
   
이번 포스팅에서는 기존 ISC DHCP 설정을 Docker 기반의 Kea DHCP 로 마이그레이션하는 방법에 대해 기록하도록 하겠습니다.   

## Kea DHCP 란?

Kea DHCP 는 ISC 에서 개발한 차세대 오픈소스 DHCP 서버입니다.   
ISC DHCP 와 비교하여 아래와 같은 특징이 있습니다.   
   
- JSON 기반 설정 파일 형식   
- REST API 를 통한 원격 관리 지원 (kea-ctrl-agent)   
- 데이터베이스 백엔드 지원 (MySQL, PostgreSQL)   
- 멀티스레드 지원으로 높은 성능   
- DHCPv4, DHCPv6, Dynamic DNS 가 별도 프로세스로 분리   
- Hook 라이브러리를 통한 기능 확장   
- High Availability 지원   

## 테스트 환경

- 테스트 환경: Amazon Linux 2   
- 기존 DHCP 서버: ISC DHCP (dhcpd)   
- 마이그레이션 대상: Kea DHCP (Docker Container)   
- Kea DHCP 이미지: `docker.cloudsmith.io/isc/docker/kea-dhcp4`   

## Step 1) 기존 ISC DHCP 설정 확인 및 백업

마이그레이션 전 반드시 기존 설정 파일과 Lease 파일을 백업합니다.   

```bash
$ sudo cp /etc/dhcp/dhcpd.conf /etc/dhcp/dhcpd.conf.backup
$ sudo cp /var/lib/dhcpd/dhcpd.leases /var/lib/dhcpd/dhcpd.leases.backup
```

기존 ISC DHCP 설정 파일을 확인합니다.   

```bash
$ cat /etc/dhcp/dhcpd.conf
#
# DHCP Server Configuration file.
#   see /usr/share/doc/dhcp*/dhcpd.conf.example
#   see dhcpd.conf(5) man page
#

# Global configuration ####################################
option domain-name "chhanz.xyz";
default-lease-time 3600;
max-lease-time 7200;
authoritative;

# subnet configuration ####################################
subnet 10.100.200.0 netmask 255.255.255.0 {
option routers                  10.100.200.1;
option subnet-mask              255.255.255.0;
option domain-name-servers      1.1.1.1;
option time-offset              -18000;
range 10.100.200.100 10.100.200.200;
}

host pve1.chhanz.xyz {
hardware ethernet BC:24:11:F3:9F:00;
fixed-address 10.100.200.50;
}

host pve2.chhanz.xyz {
hardware ethernet BC:24:11:D7:AA:55;
fixed-address 10.100.200.51;
}

host pve3.chhanz.xyz {
hardware ethernet BC:24:11:C9:53:86;
fixed-address 10.100.200.52;
}
```

위와 같이 `10.100.200.0/24` 서브넷에 대한 DHCP 설정과 Proxmox 노드 3대에 대한 고정 IP 할당 설정이 되어 있습니다.   

## Step 2) Kea DHCP Docker 이미지 Pull

ISC 에서 제공하는 공식 Kea DHCP Docker 이미지를 가져옵니다.   

```bash
[root@chhan-al2 ~]# docker pull docker.cloudsmith.io/isc/docker/kea-dhcp4
Using default tag: latest
latest: Pulling from isc/docker/kea-dhcp4
f637881d1138: Pull complete
d39b6622b069: Pull complete
307f453979a4: Pull complete
Digest: sha256:fdc40a60b0c392247d2411fb445b88b9d204d929ed4e8431a235edcefbe6a0bd
Status: Downloaded newer image for docker.cloudsmith.io/isc/docker/kea-dhcp4:latest
docker.cloudsmith.io/isc/docker/kea-dhcp4:latest
```

위와 같이 이미지가 정상적으로 다운로드 된 것을 확인 할 수 있습니다.   

## Step 3) KeaMA Docker 를 이용한 설정 변환

ISC 에서 제공하는 KeaMA(Kea Migration Assistant) Docker 이미지를 사용하여 기존 `dhcpd.conf` 를 Kea JSON 설정 파일로 자동 변환합니다.   

먼저 KeaMA Docker 이미지를 가져옵니다.   

```bash
[root@chhan-al2 ~]# docker pull docker.cloudsmith.io/isc/keama/keama:4.5.0
4.5.0: Pulling from isc/keama/keama
4693057ce236: Pull complete
9ad60c84bfbe: Pull complete
ce0f4c80e9b7: Pull complete
...생략
Digest: sha256:1ce87368b16d528a0f6c64b48e5316caaa21bccca99bfe7a3e9b368eaa6b1f1f
Status: Downloaded newer image for docker.cloudsmith.io/isc/keama/keama:4.5.0
docker.cloudsmith.io/isc/keama/keama:4.5.0
```

변환 결과를 저장할 디렉토리를 생성하고 권한을 설정합니다.   

```bash
[root@chhan-al2 ~]# mkdir convert
[root@chhan-al2 ~]# chown 1000:1000 convert
```

아래와 같이 KeaMA 컨테이너를 실행하여 설정 파일을 변환합니다.   

```bash
[root@chhan-al2 ~]# docker run -ti --rm \
	-v /etc/dhcp/dhcpd.conf:/home/keama/app/dhcpd.conf \
	-v /root/convert:/home/keama/app/convert \
	docker.cloudsmith.io/isc/keama/keama:4.5.0 \
	/home/keama/app/keama -4 -i /home/keama/app/dhcpd.conf -o /home/keama/app/convert/kea-dhcpd.conf
KEAMA 4.5.0
Reading isc-dhcp config (IPv4 mode) from /home/keama/app/dhcpd.conf, writing Kea JSON config to /home/keama/app/convert/kea-dhcpd.conf.
Started parsing new subnet declaration in line 15
Converted subnet 10.100.200.0/24 (lines 15 to 22)...
Parsing new host declaration at line 24
Converted host hw-address:bc:24:11:f3:9f:00 hostname:pve1.chhanz.xyz ip-address:10.100.200.50  (lines 24 to 27)
Parsing new host declaration at line 28
Converted host hw-address:bc:24:11:d7:aa:55 hostname:pve2.chhanz.xyz ip-address:10.100.200.51  (lines 28 to 31)
Parsing new host declaration at line 32
Converted host hw-address:bc:24:11:c9:53:86 hostname:pve3.chhanz.xyz ip-address:10.100.200.52  (lines 32 to 35)
Parsed 36 lines from the input (ISC DHCP config) /home/keama/app/dhcpd.conf file.
Wrote 1964 bytes to Kea JSON output /home/keama/app/convert/kea-dhcpd.conf file.
```

위와 같이 서브넷 1개와 호스트 예약 3개가 정상적으로 변환된 것을 확인 할 수 있습니다.   

### 변환된 설정 파일 확인

```bash
[root@chhan-al2 ~]# cat convert/kea-dhcpd.conf
{
  #
  # DHCP Server Configuration file.
  #   see /usr/share/doc/dhcp*/dhcpd.conf.example
  #   see dhcpd.conf(5) man page
  #
  #
  # Global configuration ####################################
  #option domain-name "chhanz.xyz";
  #option domain-name-servers ns.chhanz.xyz;
  /// This configuration declares some subnets but has no interfaces-config
  /// Reference Kea #245
  "Dhcp4": {
    "valid-lifetime": 3600,
    "max-valid-lifetime": 7200,
    "authoritative": true,
    "subnet4": [
      # subnet configuration ####################################
      {
        "id": 1,
        "subnet": "10.100.200.0/24",
        "option-data": [
          {
            "space": "dhcp4",
            "name": "routers",
            "code": 3,
            "data": "10.100.200.1"
          },
          {
            "space": "dhcp4",
            "name": "subnet-mask",
            "code": 1,
            "data": "255.255.255.0"
          },
          {
            "space": "dhcp4",
            "name": "domain-name-servers",
            "code": 6,
            "data": "1.1.1.1"
          },
          {
            "space": "dhcp4",
            "name": "time-offset",
            "code": 2,
            "data": "-18000"
          }
        ],
        "pools": [
          {
            "pool": "10.100.200.100 - 10.100.200.200"
          }
        ]
      }
    ],
    "host-reservation-identifiers": [
      "hw-address"
    ],
    "reservation-mode": "global",
    "reservations": [
      {
        "hostname": "pve1.chhanz.xyz",
        "hw-address": "bc:24:11:f3:9f:00",
        "ip-address": "10.100.200.50"
      },
      {
        "hostname": "pve2.chhanz.xyz",
        "hw-address": "bc:24:11:d7:aa:55",
        "ip-address": "10.100.200.51"
      },
      {
        "hostname": "pve3.chhanz.xyz",
        "hw-address": "bc:24:11:c9:53:86",
        "ip-address": "10.100.200.52"
      }
    ]
  }
}
```

> 참고 : KeaMA 가 변환한 결과에는 주석(`#`, `///`) 과 함께 `interfaces-config`, `lease-database`, `loggers` 등의 항목이 포함되어 있지 않습니다.   
> 이 항목들은 수동으로 추가해야 하며, 주석도 제거해야 합니다. (Kea 는 표준 JSON 을 사용하므로 주석을 지원하지 않습니다)   

## Step 4) 변환된 설정 파일 수정

KeaMA 가 변환한 설정 파일은 그대로 사용할 수 없으며, 아래와 같은 수정이 필요합니다.   

```bash
[root@chhan-al2 ~]# mkdir -p /etc/kea/config
[root@chhan-al2 ~]# mkdir -p /etc/kea/leases
```

변환된 파일을 복사하고 수정합니다.   

```bash
[root@chhan-al2 ~]# cp convert/kea-dhcpd.conf /etc/kea/config/kea-dhcp4.conf
[root@chhan-al2 ~]# vi /etc/kea/config/kea-dhcp4.conf
```

아래와 같은 항목들을 수정합니다.   

### 1) 주석 제거

Kea 는 표준 JSON 형식을 사용하므로 KeaMA 가 남긴 `#`, `///` 주석을 모두 제거합니다.   

### 2) `interfaces-config`, `control-socket`, `lease-database` 추가

KeaMA 변환 결과에는 포함되지 않는 항목들을 `Dhcp4` 블록 상단에 추가합니다.   

```bash
    "interfaces-config": {
      "interfaces": [ "eth1" ],
      "dhcp-socket-type": "raw"
    },
    "control-socket": {
      "socket-type": "unix",
      "socket-name": "/var/run/kea/kea4-ctrl-socket"
    },
    "lease-database": {
      "type": "memfile",
      "persist": true,
      "name": "/var/lib/kea/kea-leases4.csv",
      "lfc-interval": 3600
    },
```

### 3) `option-data` 에서 불필요한 필드 제거

KeaMA 가 생성한 `space`, `code` 필드는 생략 가능하므로 간결하게 정리합니다.   
또한 `subnet-mask` 옵션은 Kea 가 서브넷 정의에서 자동으로 처리하므로 제거합니다.   

변경 전 (KeaMA 변환 결과):   
```bash
          {
            "space": "dhcp4",
            "name": "routers",
            "code": 3,
            "data": "10.100.200.1"
          },
```

변경 후:   
```bash
          {
            "name": "routers",
            "data": "10.100.200.1"
          },
```

### 4) `reservation-mode` 를 신규 키워드로 변경

Kea 2.6 이상에서 `reservation-mode` 는 deprecated 되었습니다.   
아래와 같이 `reservations-global`, `reservations-in-subnet` 으로 변경합니다.   

변경 전 (KeaMA 변환 결과):   
```bash
    "reservation-mode": "global",
```

변경 후:   
```bash
    "reservations-global": true,
    "reservations-in-subnet": false,
```

### 5) `loggers` 추가

Docker 환경에서 `docker logs` 로 로그를 확인할 수 있도록 `stdout` 출력 설정을 추가합니다.   

```bash
    "loggers": [
      {
        "name": "kea-dhcp4",
        "output-options": [
          {
            "output": "stdout",
            "flush": true
          }
        ],
        "severity": "INFO",
        "debuglevel": 0
      }
    ]
```

### 최종 설정 파일

위 수정 사항을 모두 반영한 최종 설정 파일은 아래와 같습니다.   

```bash
[root@chhan-al2 ~]# cat /etc/kea/config/kea-dhcp4.conf
{
  "Dhcp4": {
    "interfaces-config": {
      "interfaces": [ "eth1" ],
      "dhcp-socket-type": "raw"
    },
    "control-socket": {
      "socket-type": "unix",
      "socket-name": "/var/run/kea/kea4-ctrl-socket"
    },
    "lease-database": {
      "type": "memfile",
      "persist": true,
      "name": "/var/lib/kea/kea-leases4.csv",
      "lfc-interval": 3600
    },
    "authoritative": true,
    "valid-lifetime": 3600,
    "max-valid-lifetime": 7200,
    "subnet4": [
      {
        "id": 1,
        "subnet": "10.100.200.0/24",
        "option-data": [
          {
            "name": "routers",
            "data": "10.100.200.1"
          },
          {
            "name": "domain-name-servers",
            "data": "1.1.1.1"
          },
          {
            "name": "time-offset",
            "data": "-18000"
          }
        ],
        "pools": [
          {
            "pool": "10.100.200.100 - 10.100.200.200"
          }
        ]
      }
    ],
    "host-reservation-identifiers": [
      "hw-address"
    ],
    "reservations-global": true,
    "reservations-in-subnet": false,
    "reservations": [
      {
        "hostname": "pve1.chhanz.xyz",
        "hw-address": "bc:24:11:f3:9f:00",
        "ip-address": "10.100.200.50"
      },
      {
        "hostname": "pve2.chhanz.xyz",
        "hw-address": "bc:24:11:d7:aa:55",
        "ip-address": "10.100.200.51"
      },
      {
        "hostname": "pve3.chhanz.xyz",
        "hw-address": "bc:24:11:c9:53:86",
        "ip-address": "10.100.200.52"
      }
    ],
    "loggers": [
      {
        "name": "kea-dhcp4",
        "output-options": [
          {
            "output": "stdout",
            "flush": true
          }
        ],
        "severity": "INFO",
        "debuglevel": 0
      }
    ]
  }
}
```

### ISC DHCP 와 Kea DHCP 설정 비교

| 항목 | ISC DHCP (dhcpd.conf) | Kea DHCP (kea-dhcp4.conf) |
|------|----------------------|--------------------------|
| 설정 형식 | 자체 문법 | JSON |
| Subnet 선언 | `subnet 10.100.200.0 netmask 255.255.255.0` | `"subnet": "10.100.200.0/24"` |
| IP 범위 | `range 10.100.200.100 10.100.200.200;` | `"pool": "10.100.200.100 - 10.100.200.200"` |
| 고정 IP 할당 | `host pve1 { hardware ethernet ...; fixed-address ...; }` | `"reservations": [{"hw-address": "...", "ip-address": "..."}]` |
| 옵션 설정 | `option routers 10.100.200.1;` | `"option-data": [{"name": "routers", "data": "10.100.200.1"}]` |
| Lease 저장 | `/var/lib/dhcpd/dhcpd.leases` | `/var/lib/kea/kea-leases4.csv` 또는 DB |
| 서비스명 | `dhcpd` | `kea-dhcp4` |

## Step 5) 설정 파일 검증

컨테이너를 실행하기 전에 설정 파일의 문법을 검증합니다.   

```bash
[root@chhan-al2 ~]# docker run --rm \
    -v /etc/kea/config:/etc/kea \
    docker.cloudsmith.io/isc/docker/kea-dhcp4 \
    kea-dhcp4 -t /etc/kea/kea-dhcp4.conf
2026-02-09 06:04:14.319 WARN  [kea-dhcp4.dhcpsrv/1.140164228530912]
DHCPSRV_MT_DISABLED_QUEUE_CONTROL disabling dhcp queue control when multi-threading is enabled.
2026-02-09 06:04:14.319 WARN  [kea-dhcp4.dhcp4/1.140164228530912]
DHCP4_RESERVATIONS_LOOKUP_FIRST_ENABLED Multi-threading is enabled and host reservations lookup is always performed first.
2026-02-09 06:04:14.319 INFO  [kea-dhcp4.dhcpsrv/1.140164228530912]
DHCPSRV_CFGMGR_NEW_SUBNET4 a new subnet has been added to configuration: 10.100.200.0/24 with params: valid-lifetime=3600
2026-02-09 06:04:14.319 INFO  [kea-dhcp4.dhcpsrv/1.140164228530912]
DHCPSRV_CFGMGR_SOCKET_TYPE_SELECT using socket type raw
...생략
```

위와 같이 `DHCPSRV_CFGMGR_NEW_SUBNET4` 로그에서 `10.100.200.0/24` 서브넷이 정상적으로 추가된 것을 확인 할 수 있습니다.   
ERROR 없이 출력이 완료되면 설정 파일에 문제가 없는 것입니다.   

## Step 6) 기존 ISC DHCP 서비스 중지

Kea DHCP 컨테이너를 시작하기 전에 기존 ISC DHCP 서비스를 중지합니다.   
동일한 포트(UDP 67/68) 를 사용하기 때문에 반드시 기존 서비스를 먼저 중지해야 합니다.   

```bash
[root@chhan-al2 ~]# systemctl stop dhcpd
[root@chhan-al2 ~]# systemctl disable dhcpd
Removed symlink /etc/systemd/system/multi-user.target.wants/dhcpd.service.
```

## Step 7) Kea DHCP 컨테이너 실행

아래와 같이 Kea DHCP 컨테이너를 실행합니다.   
DHCP 서버는 브로드캐스트 패킷을 수신해야 하므로 `--net host` 옵션을 사용합니다.   

```bash
[root@chhan-al2 ~]# docker run -d \
    --name kea-dhcp4 \
    --restart=always \
    --net host \
    -v /etc/kea/config:/etc/kea \
    -v /etc/kea/leases:/var/lib/kea \
    docker.cloudsmith.io/isc/docker/kea-dhcp4
```

컨테이너 실행 상태를 확인합니다.   

```bash
[root@chhan-al2 ~]# docker ps
CONTAINER ID   IMAGE                                          COMMAND                  CREATED         STATUS         PORTS   NAMES
a1b2c3d4e5f6   docker.cloudsmith.io/isc/docker/kea-dhcp4      "/usr/sbin/kea-dhcp4…"   5 seconds ago   Up 3 seconds           kea-dhcp4
```

위와 같이 Kea DHCP 컨테이너가 정상적으로 실행 중인 것을 확인 할 수 있습니다.   

## Step 8) 동작 확인

### 로그 확인

아래와 같이 컨테이너 로그를 통해 Kea DHCP 서버의 동작 상태를 확인합니다.   

```bash
[root@chhan-al2 ~]# docker logs -f kea-dhcp4
2026-02-09 06:13:00.211 INFO  [kea-dhcp4.dhcp4/1.140589193589472]
DHCP4_STARTING Kea DHCPv4 server version 3.0.2 (stable) starting
...생략
2026-02-09 06:13:00.213 INFO  [kea-dhcp4.dhcpsrv/1.140589193589472]
DHCPSRV_CFGMGR_ADD_IFACE listening on interface eth1
2026-02-09 06:13:00.213 INFO  [kea-dhcp4.dhcp4/1.140589193589472]
DHCP4_CONFIG_COMPLETE DHCPv4 server has completed configuration: added IPv4 subnets: 1; DDNS: disabled
...생략
2026-02-09 06:13:00.251 INFO  [kea-dhcp4.dhcp4/1.140589193589472]
DHCP4_MULTI_THREADING_INFO enabled: yes, number of threads: 2, queue size: 64
2026-02-09 06:13:00.251 INFO  [kea-dhcp4.dhcp4/1.140589193589472]
DHCP4_STARTED Kea DHCPv4 server version 3.0.2 started
```

위와 같이 Kea DHCP 서버 버전 3.0.2 가 정상적으로 시작된 것을 확인 할 수 있습니다.   

DHCP 클라이언트가 IP 를 요청하면 아래와 같은 로그를 확인 할 수 있습니다.   

```bash
2026-02-09 06:13:12.733 INFO  [kea-dhcp4.packets/1.140589172878136]
DHCP4_PACKET_RECEIVED [hwtype=1 bc:24:11:27:12:8c], cid=[no info], tid=0x9ae58e2a:
DHCPDISCOVER (type 1) received from 0.0.0.0 to 255.255.255.255 on interface eth1
2026-02-09 06:13:12.733 INFO  [kea-dhcp4.leases/1.140589172878136]
DHCP4_LEASE_OFFER [hwtype=1 bc:24:11:27:12:8c], cid=[no info], tid=0x9ae58e2a:
lease 10.100.200.100 will be offered
...생략
2026-02-09 06:13:12.734 INFO  [kea-dhcp4.leases/1.140589173021496]
DHCP4_LEASE_ALLOC [hwtype=1 bc:24:11:27:12:8c], cid=[no info], tid=0x9ae58e2a:
lease 10.100.200.100 has been allocated for 3600 seconds
2026-02-09 06:13:12.734 INFO  [kea-dhcp4.packets/1.140589173021496]
DHCP4_PACKET_SEND [hwtype=1 bc:24:11:27:12:8c], cid=[no info], tid=0x9ae58e2a:
trying to send packet DHCPACK (type 5) from 10.100.200.1:67 to 10.100.200.100:68 on interface eth1
```

위와 같이 DHCPDISCOVER → DHCPOFFER → DHCPREQUEST → DHCPACK 과정을 거쳐 `10.100.200.100` IP 가 정상적으로 할당되는 것을 확인 할 수 있습니다.   

### Lease 파일 확인

```bash
[root@chhan-al2 ~]# cat /etc/kea/leases/kea-leases4.csv
address,hwaddr,client_id,valid_lifetime,expire,subnet_id,fqdn_fwd,fqdn_rev,hostname,state,user_context,pool_id
10.100.200.100,bc:24:11:27:12:8c,,3600,1770621192,1,0,0,rhel7,0,,0
```

위와 같이 DHCP IP 가 정상적으로 할당되는 것을 확인 할 수 있습니다.   

## 설정 변경 시 컨테이너 재시작

설정 파일을 수정한 후에는 아래와 같이 컨테이너를 재시작합니다.   

```bash
[root@chhan-al2 ~]# vi /etc/kea/config/kea-dhcp4.conf
[root@chhan-al2 ~]# docker restart kea-dhcp4
kea-dhcp4
```

## 참고

- ISC DHCP 마이그레이션 가이드: [https://www.isc.org/dhcp_migration/](https://www.isc.org/dhcp_migration/)   
- KeaMA 웹 인터페이스: [https://dhcp.isc.org/](https://dhcp.isc.org/)   
- KeaMA Docker 이미지: [https://cloudsmith.io/~isc/repos/keama/packages/](https://cloudsmith.io/~isc/repos/keama/packages/)   
- Kea DHCP 공식 문서: [https://kea.readthedocs.io/](https://kea.readthedocs.io/)   
- Kea Docker 이미지: [https://cloudsmith.io/~isc/repos/docker/packages/](https://cloudsmith.io/~isc/repos/docker/packages/)   
- KeaMA 매뉴얼: [https://kb.isc.org/docs/kea-migration-assistant](https://kb.isc.org/docs/kea-migration-assistant)   
- 이전 포스팅 - DHCP 서버 구성: [https://tech.chhanz.xyz/linux/2020/11/17/configuration-dhcp/](https://tech.chhanz.xyz/linux/2020/11/17/configuration-dhcp/)   
