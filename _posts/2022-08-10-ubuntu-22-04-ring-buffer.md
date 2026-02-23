---
layout: post
title: "[Ubuntu] Ubuntu 22.04 Ring Buffer 설정 방법"
description: ""
author: chhanz
date: 2022-08-10
tags: [linux]
category: linux
---

# Temporary settings
아래와 같이 `ethtool` 명령을 통해 online 중에 변경이 가능하다.    
주의) 변경되는 Interface 의 Link UP/DOWN 이 발생한다.   
```bash
$ sudo ethtool -G eth0 rx 4096 tx 4096
$ sudo ethtool -g eth0
Ring parameters for eth0:
Pre-set maximums:
RX:             4096
RX Mini:        n/a
RX Jumbo:       n/a
TX:             4096
Current hardware settings:
RX:             4096
RX Mini:        n/a
RX Jumbo:       n/a
TX:             4096
```
   
# Permanently settings
주로 CentOS 와 같은 RHEL 계열은 network-script 에 `ETHTOOL_OPTS` 을 사용하거나 `NetworkManager` 를 통해 설정하는데   
(참고 문서 : [How to make NIC ethtool settings persistent (apply automatically at boot)](https://access.redhat.com/solutions/2127401))
   
Ubuntu 22.04 의 경우,   
1. `networkd-dispatcher` 를 이용한 설정 방법   
    + [https://askubuntu.com/questions/1175333/how-to-change-nic-settings-ethtool-settings-via-netplan](https://askubuntu.com/questions/1175333/how-to-change-nic-settings-ethtool-settings-via-netplan)    
2. `rc.local` 혹은 `udev` rule 을 이용한 설정 방법   
3. `systemd.link` 를 이용하는 방법   
   
위와 같이 다양한 방법들이 있으나, Ubuntu 에서 권고되는 방식인 `systemd.link` 를 이용하는 방법에 대해 작성해본다.   
   
## `systemd.link` 설정   
먼저 [`systemd.link`](https://manpages.ubuntu.com/manpages/jammy/man5/systemd.link.5.html) 를 사용하기 위해서는 `networkctl` 명령을 통해 Network file 이 생성된 것을 확인 해야된다.   
   
```console
$ sudo networkctl status eth0
● 2: eth0
                     Link File: /usr/lib/systemd/network/99-default.link            <<
                  Network File: /run/systemd/network/10-netplan-eth0.network        <<
                          Type: ether
                         State: enslaved (configured)
                  Online state: online
...생략
```
해당 시스템은 `netplan` 에 의해 Network 가 설정되고 해당 Network File 이 build 되어 설정된 것을 확인 할 수 있다.   
   
위 network file 과 동일한 이름으로 link file 을 생성합니다.   
```console
$ sudo cat /etc/systemd/network/10-netplan-eth0.link
[Match]
MACAddress=xx:xx:xx:xx:xx:xx

[Link]
RxBufferSize=4096
TxBufferSize=4096
```
위와 같이 적용할 Interface 의 MAC Address 와 `RxBufferSize` , `TxBufferSize` 값을 입력한 link file 이다.   
   
***(주의)*** 해당 `systemd.link` 로 적용한 내용은 OS 기동중에는 적용이 불가능하며 재부팅을 하면 반영된다.   
```console
There is no consistent way to manage NIC ring buffer sizes "on boot" at this time.
```
(참고) [https://github.com/systemd/systemd/issues/13601](https://github.com/systemd/systemd/issues/13601)   

### Check   
시스템 재부팅 이후, 아래와 같이 정상적으로 반영되고 Ring Buffer 가 설정 된 것을 확인 할 수 있다.   
```console
$ sudo networkctl status eth0
● 2: eth0
                     Link File: /etc/systemd/network/10-netplan-eth0.link           <<
                  Network File: /run/systemd/network/10-netplan-eth0.network
                          Type: ether
                         State: enslaved (configured)
                  Online state: online
...생략
 
$ sudo ethtool -g eth0
Ring parameters for eth0:
Pre-set maximums:
RX:             4096
RX Mini:        n/a
RX Jumbo:       n/a
TX:             4096
Current hardware settings:
RX:             4096
RX Mini:        n/a
RX Jumbo:       n/a
TX:             4096
```
   
여러 Interface 에 적용하기 위해서는 `/etc/systemd/network` 경로에 각각 link file 을 생성하고 시스템을 재부팅하면 적용된다.   
   
# 참고 문서
* [https://github.com/systemd/systemd/issues/13601](https://github.com/systemd/systemd/issues/13601)   
* [https://manpages.ubuntu.com/manpages/jammy/man5/systemd.link.5.html](https://manpages.ubuntu.com/manpages/jammy/man5/systemd.link.5.html)   