---
layout: post
title: "[Linux] systemd-networkd DEBUG mode 활성화" 
description: ""
author: chhanz
date: 2023-08-31
tags: [linux]
category: linux
---

# Enable DEBUG mode on systemd-networkd
`systemd-networkd` 를 사용하는 Ubuntu, Amazon Linux 2023 과 같은 운영체제에서 `systemd-networkd`의 Debug mode 를 활성화하여 조금 더 자세한 로그를 살펴 볼 수 있습니다.   
   
# How to
아래와 같이 systemd override directory 를 생성합니다.   
```bash
$ sudo mkdir -p /etc/systemd/system/systemd-networkd.service.d/
```
   
해당 경로에 `/etc/systemd/system/systemd-networkd.service.d/10-debug-mode.conf` 라는 설정 파일을 생성하고 아래 내용을 입력합니다.   
```bash
$ sudo vi /etc/systemd/system/systemd-networkd.service.d/10-debug-mode.conf
[Service]
Environment=SYSTEMD_LOG_LEVEL=debug
```
   
`systemd-networkd` 를 재시작합니다.
```bash
$ sudo systemctl daemon-reload
$ sudo systemctl restart systemd-networkd
```
   
Debug 모드로 로그가 생성되는지 확인합니다.   
   
```bash
$ sudo journalctl -b -u systemd-networkd -f
...
... systemd-networkd[2371]: enX0: NDISC: Sent Router Solicitation, next solicitation in 9min 43s
... systemd-networkd[2371]: enX0: DHCPv6 client: Sent Solicit
... systemd-networkd[2371]: enX0: DHCPv6 client: Next retransmission in 1min 52s
... systemd-networkd[2371]: enX0: DHCPv6 client: Sent Solicit
... systemd-networkd[2371]: enX0: DHCPv6 client: Next retransmission in 1min 59s
...
```
   
# 참고 자료
* [https://coreos.com/os/docs/latest/network-config-with-networkd.html](https://coreos.com/os/docs/latest/network-config-with-networkd.html)   