---
layout: post
title: "[AWS] Firecracker microVM with Amazon EC2 Nested Virtualization"
description: ""
author: chhanz
date: 2026-02-23
tags: [aws, linux, container]
categories: [aws]
---

# Firecracker microVM with Amazon EC2 Nested Virtualization

## Firecracker 란?

[Firecracker](https://firecracker-microvm.github.io/)는 AWS에서 개발한 오픈소스 VMM(Virtual Machine Monitor)입니다.   
KVM을 사용하여 경량 microVM을 생성하고 관리하며, AWS Lambda와 AWS Fargate의 기반 기술로 사용되고 있습니다.

Firecracker는 64-bit Intel, AMD, Arm CPU를 지원하며, hardware virtualization 기능이 필요합니다.   
Fly.io, Kata Containers, firecracker-containerd 등 다양한 프로젝트에서 활용되고 있습니다.

이번 포스팅에서는 AWS EC2 Nested Virtualization 환경에서 Firecracker microVM을 설치하고 실행하는 방법에 대해 기록하도록 하겠습니다.

## EC2 Nested Virtualization

기존에는 EC2에서 KVM을 사용하기 위해 `.metal` 인스턴스 타입을 사용해야 했습니다.   
`.metal` 인스턴스는 비용이 높아 Firecracker와 같은 KVM 기반 기술을 테스트하기에 부담이 되었습니다.

하지만 AWS Nitro 기반 일반 EC2 인스턴스에서 Nested Virtualization(KVM)을 지원하게 되면서, **C8i, M8i, R8i** 인스턴스 타입에서도 KVM을 사용할 수 있게 되었습니다.

> **참고:** Nested Virtualization은 현재 C8i, M8i, R8i 인스턴스 타입에서만 지원됩니다. (출처: [AWS 공식 문서](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/amazon-ec2-nested-virtualization.html))

## 테스트 환경

- 테스트 환경: Amazon Linux 2023 (Nitro 기반 EC2 인스턴스)
- Firecracker 버전: v1.14.1
- Guest OS: Ubuntu 24.04

## KVM 지원 확인

먼저 EC2 인스턴스에서 KVM이 지원되는지 확인합니다.

```bash
[root@ip-172-31-53-163 ~]# ls -la /dev/kvm
crw-rw-rw-. 1 root kvm 10, 232 Feb 23 12:20 /dev/kvm

[root@ip-172-31-53-163 ~]# lsmod | grep kvm
kvm_intel             393216  0
kvm                  1155072  1 kvm_intel
irqbypass              16384  1 kvm
```

위와 같이 `/dev/kvm` 디바이스가 존재하고 KVM 모듈이 로드되어 있으면 Firecracker를 사용할 수 있습니다.

> **KVM이 지원되지 않는 경우**   
> `/dev/kvm` 디바이스가 없다면 EC2 인스턴스를 생성할 때 **"Enable nested virtualization"** 옵션이 활성화되어 있는지 확인하세요.   
> AWS 콘솔에서 인스턴스 생성 시 → *Advanced details* → *Enable nested virtualization* 항목을 체크합니다.   
> 2026년 02월 23일 기준, 지원 인스턴스 타입은 **C8i, M8i, R8i** 만 해당됩니다.

![KVM 지원 확인](/assets/images/post/2026-02-23-firecracker-microvm/1.png)

## Firecracker 설치

아래와 같은 방법으로 Firecracker 바이너리를 다운로드합니다.

```bash
$ ARCH="$(uname -m)"
$ release_url="https://github.com/firecracker-microvm/firecracker/releases"
$ latest=$(basename $(curl -fsSLI -o /dev/null -w  %{url_effective} ${release_url}/latest))
$ curl -L ${release_url}/download/${latest}/firecracker-${latest}-${ARCH}.tgz \
    | tar -xz
$ mv release-${latest}-$(uname -m)/firecracker-${latest}-${ARCH} firecracker
```

바이너리가 정상적으로 다운로드 되었는지 확인합니다.

```bash
[root@ip-172-31-53-163 ~]# ./firecracker --version
Firecracker v1.14.1
```

## Kernel 및 RootFS 준비

Firecracker microVM을 실행하기 위해서는 Linux kernel과 rootfs 이미지가 필요합니다.   
아래와 같이 Firecracker CI에서 제공하는 테스트용 kernel과 rootfs를 다운로드합니다.

> Amazon Linux 2023에서 squashfs 처리 및 iptables 관리를 위해 아래 패키지를 먼저 설치합니다.
> ```bash
> # yum -y install squashfs-tools-4.5-3.amzn2023.0.2.x86_64
> # yum -y install iptables-nft-1.8.8-3.amzn2023.0.2.x86_64
> ```

```bash
ARCH="$(uname -m)"
release_url="https://github.com/firecracker-microvm/firecracker/releases"
latest_version=$(basename $(curl -fsSLI -o /dev/null -w  %{url_effective} ${release_url}/latest))
CI_VERSION=${latest_version%.*}

# Kernel 다운로드
latest_kernel_key=$(curl "http://spec.ccfc.min.s3.amazonaws.com/?prefix=firecracker-ci/$CI_VERSION/$ARCH/vmlinux-&list-type=2" \
    | grep -oP "(?<=<Key>)(firecracker-ci/$CI_VERSION/$ARCH/vmlinux-[0-9]+\.[0-9]+\.[0-9]{1,3})(?=</Key>)" \
    | sort -V | tail -1)
wget "https://s3.amazonaws.com/spec.ccfc.min/${latest_kernel_key}"

# RootFS 다운로드 (squashfs → ext4 변환)
latest_ubuntu_key=$(curl "http://spec.ccfc.min.s3.amazonaws.com/?prefix=firecracker-ci/$CI_VERSION/$ARCH/ubuntu-&list-type=2" \
    | grep -oP "(?<=<Key>)(firecracker-ci/$CI_VERSION/$ARCH/ubuntu-[0-9]+\.[0-9]+\.squashfs)(?=</Key>)" \
    | sort -V | tail -1)
ubuntu_version=$(basename $latest_ubuntu_key .squashfs | grep -oE '[0-9]+\.[0-9]+')

wget -O ubuntu-$ubuntu_version.squashfs.upstream "https://s3.amazonaws.com/spec.ccfc.min/$latest_ubuntu_key"

# SSH 키 생성 및 rootfs에 삽입
unsquashfs ubuntu-$ubuntu_version.squashfs.upstream
ssh-keygen -f id_rsa -N ""
cp -v id_rsa.pub squashfs-root/root/.ssh/authorized_keys
mv -v id_rsa ./ubuntu-$ubuntu_version.id_rsa

# ext4 이미지 생성
sudo chown -R root:root squashfs-root
truncate -s 1G ubuntu-$ubuntu_version.ext4
sudo mkfs.ext4 -d squashfs-root -F ubuntu-$ubuntu_version.ext4
```

다운로드 완료 후 파일 목록을 확인합니다.

```bash
[root@ip-172-31-53-163 ~]# ls -l | egrep "ubuntu|id_rsa|vmlinux"
-rw-r--r--.  1 root root        607 Feb 23 12:47 id_rsa.pub
-rw-r--r--.  1 root root 1073741824 Feb 23 13:07 ubuntu-24.04.ext4
-rw-------.  1 root root       2655 Feb 23 12:47 ubuntu-24.04.id_rsa
-rw-r--r--.  1 root root  107810816 Nov 18 09:37 ubuntu-24.04.squashfs.upstream
-rw-r--r--.  1 root root   44278288 Nov 18 09:37 vmlinux-6.1.155
```

<!-- 파일 목록은 본문 코드블록으로 대체 -->

## 네트워크 설정

Firecracker는 TUN/TAP 네트워크 백엔드만 지원합니다.   
microVM을 시작하기 전에 TAP 디바이스와 NAT를 먼저 설정합니다.

```bash
TAP_DEV="tap0"
TAP_IP="192.168.0.1"
MASK_SHORT="/24"

# TAP 디바이스 생성
sudo ip link del "$TAP_DEV" 2> /dev/null || true
sudo ip tuntap add dev "$TAP_DEV" mode tap
sudo ip addr add "${TAP_IP}${MASK_SHORT}" dev "$TAP_DEV"
sudo ip link set dev "$TAP_DEV" up

# iptables NAT 설정
sudo iptables -P FORWARD ACCEPT
HOST_IFACE=$(ip -j route list default | jq -r '.[0].dev')
sudo iptables -t nat -D POSTROUTING -o "$HOST_IFACE" -j MASQUERADE || true
sudo iptables -t nat -A POSTROUTING -o "$HOST_IFACE" -j MASQUERADE
```

## vm_config.json 작성

API 방식 대신 config 파일을 사용하면 한 번에 microVM을 구성하고 시작할 수 있습니다.

```json
{
  "boot-source": {
    "kernel_image_path": "vmlinux-6.1.155",
    "boot_args": "console=ttyS0 reboot=k panic=1"
  },
  "drives": [
    {
      "drive_id": "rootfs",
      "is_root_device": true,
      "is_read_only": false,
      "path_on_host": "ubuntu-24.04.ext4",
      "cache_type": "Unsafe",
      "io_engine": "Sync"
    }
  ],
  "machine-config": {
    "vcpu_count": 2,
    "mem_size_mib": 1024,
    "smt": false
  },
  "network-interfaces": [
    {
      "iface_id": "eth0",
      "host_dev_name": "tap0",
      "guest_mac": "06:00:c0:a8:00:02"
    }
  ]
}
```

## Firecracker microVM 실행

`--config-file` 옵션으로 vm_config.json을 지정하여 microVM을 시작합니다.   
`--enable-pci` 플래그는 VirtIO 장치를 PCI transport로 생성하여 높은 처리량과 낮은 지연을 제공합니다.

```bash
[root@ip-172-31-53-163 ~]# sudo ./firecracker \
    --api-sock /tmp/firecracker.socket \
    --config-file vm_config.json \
    --enable-pci
2026-02-23T13:00:50.965053032 [anonymous-instance:main] Running Firecracker v1.14.1
2026-02-23T13:00:50.965322102 [anonymous-instance:main] Listening on API socket ("/tmp/firecracker.socket").
2026-02-23T13:00:51.022688684 [anonymous-instance:main] pci: adding PCI segment: id=0x0, ...
2026-02-23T13:00:51.023549260 [anonymous-instance:main] Artificially kick devices
...
Successfully started microvm that was configured from one single json
```

![실행 완료](/assets/images/post/2026-02-23-firecracker-microvm/2.png)

## 동작 확인

microVM이 시작되면 Host에서 ping 및 SSH로 접속할 수 있습니다.

```bash
# Host에서 microVM ping 확인
[root@ip-172-31-53-163 ~]# ping 192.168.0.2
PING 192.168.0.2 (192.168.0.2) 56(84) bytes of data.
64 bytes from 192.168.0.2: icmp_seq=1 ttl=127 time=0.299 ms

# SSH 접속
[root@ip-172-31-53-163 ~]# ssh -i ubuntu-24.04.id_rsa root@192.168.0.2
Welcome to Ubuntu 24.04.3 LTS (GNU/Linux 6.1.155 x86_64)
...
root@ubuntu-fc-uvm:~#
```

microVM 내부에서 외부 네트워크 연결이 가능하도록 설정하고 외부 통신 여부 확인합니다.

```bash
# 기본 라우팅 및 DNS 설정
[root@ip-172-31-53-163 ~]# ssh -i ubuntu-24.04.id_rsa root@192.168.0.2 \
    "ip route add default via 192.168.0.1 dev eth0"
[root@ip-172-31-53-163 ~]# ssh -i ubuntu-24.04.id_rsa root@192.168.0.2 \
    "echo 'nameserver 8.8.8.8' > /etc/resolv.conf"

# 외부 통신 확인
root@ubuntu-fc-uvm:~# ping 1.1.1.1
64 bytes from 1.1.1.1: icmp_seq=1 ttl=49 time=3.19 ms

root@ubuntu-fc-uvm:~# curl naver.com
<html>
<head><title>301 Moved Permanently</title></head>
...
```

## tmux 를 이용한 microVM 관리

Firecracker microVM을 실행하면 해당 터미널이 VM 콘솔로 점유됩니다.   
tmux를 활용하면 별도 터미널 없이 백그라운드 세션으로 microVM을 관리할 수 있습니다.

```console
# tmux 세션으로 microVM 시작
[root@ip-172-31-53-163 ~]# tmux new-session -d -s u24 \
    '/root/firecracker --api-sock /tmp/firecracker-u24.socket \
    --config-file vm_config.json --enable-pci'

# 실행 중인 세션 확인
[root@ip-172-31-53-163 ~]# tmux list-session
u24: 1 windows (created Mon Feb 23 13:31:49 2026)

# 세션에 접속 (VM 콘솔 진입)
[root@ip-172-31-53-163 ~]# tmux attach-session -t u24
```

![tmux 세션 관리](/assets/images/post/2026-02-23-firecracker-microvm/3.png)

## 참고

- Firecracker 공식 사이트: [https://firecracker-microvm.github.io/](https://firecracker-microvm.github.io/)
- Firecracker GitHub: [https://github.com/firecracker-microvm/firecracker](https://github.com/firecracker-microvm/firecracker)
- Firecracker Getting Started: [https://github.com/firecracker-microvm/firecracker/blob/main/docs/getting-started.md](https://github.com/firecracker-microvm/firecracker/blob/main/docs/getting-started.md)
- Firecracker RootFS & Kernel Setup: [https://github.com/firecracker-microvm/firecracker/blob/main/docs/rootfs-and-kernel-setup.md](https://github.com/firecracker-microvm/firecracker/blob/main/docs/rootfs-and-kernel-setup.md)
- Firecracker Network Setup: [https://github.com/firecracker-microvm/firecracker/blob/main/docs/network-setup.md](https://github.com/firecracker-microvm/firecracker/blob/main/docs/network-setup.md)
