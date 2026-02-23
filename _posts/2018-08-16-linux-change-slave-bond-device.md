---
layout: post
title: "[Linux] Bonding Network Currently Active Slave 변경"
description: "RHEL/CentOS"
author: chhanz
date: 2018-08-16
tags: [linux]
category: linux
---

# RHEL / CentOS 7 Bonding Currently Active Slave 변경
* * * 

_Bonding(본딩)_ 는 이중화 구성을 통한 빠른 장애 대응 및 네트워크 대역폭 증가에 매우 유용합니다.   
아래 절차는 _본딩_ 인터페이스를 중단하지 않고, Slave 인터페이스로 전환하는 방법을 설명하려고 합니다.   


```
# cat /proc/net/bonding/bond0
Ethernet Channel Bonding Driver: v3.7.1 (April 27, 2011)

Bonding Mode: fault-tolerance (active-backup)
Primary Slave: None
Currently Active Slave: eth1
MII Status: up
MII Polling Interval (ms): 100
Up Delay (ms): 0
Down Delay (ms): 0

Slave Interface: eth1
MII Status: up
Speed: 1000 Mbps
Duplex: full
Link Failure Count: 0
Permanent HW addr: 00:2a:4a:16:01:63
Slave queue ID: 0

Slave Interface: eth2
MII Status: up
Speed: 1000 Mbps
Duplex: full
Link Failure Count: 0
Permanent HW addr: 00:2a:4a:16:01:64
Slave queue ID: 0
```

위와 같이 _본딩_ 구성이 되어 있습니다.   


# Currently Active Slave 를 eth2 인터페이스로 변경
* * *
_ifenslave_  명령을 통해 Slave 인터페이스를 추가, 제거 변경을 할 수가 있습니다.   

```
# ifenslave -c bond0 eth2
# cat /proc/net/bonding/bond0
Ethernet Channel Bonding Driver: v3.7.1 (April 27, 2011)

Bonding Mode: fault-tolerance (active-backup)
Primary Slave: None
Currently Active Slave: eth2
MII Status: up
MII Polling Interval (ms): 100
Up Delay (ms): 0
Down Delay (ms): 0

Slave Interface: eth1
MII Status: up
Speed: 1000 Mbps
Duplex: full
Link Failure Count: 0
Permanent HW addr: 00:2a:4a:16:01:63
Slave queue ID: 0

Slave Interface: eth2
MII Status: up
Speed: 1000 Mbps
Duplex: full
Link Failure Count: 0
Permanent HW addr: 00:2a:4a:16:01:64
Slave queue ID: 0
```

위와 같이 eth2 로 변경된 것을 확인 할 수 있습니다.   

# Slave 인터페이스 제거
* * * 
아래와 같이 bond device 에서 Slave 인터페이스를 제거 할 수 있습니다.   

```
# ifenslave -d bond0 eth1
# cat /proc/net/bonding/bond0
Ethernet Channel Bonding Driver: v3.7.1 (April 27, 2011)

Bonding Mode: fault-tolerance (active-backup)
Primary Slave: None
Currently Active Slave: eth2
MII Status: up
MII Polling Interval (ms): 100
Up Delay (ms): 0
Down Delay (ms): 0

Slave Interface: eth2
MII Status: up
Speed: 1000 Mbps
Duplex: full
Link Failure Count: 0
Permanent HW addr: 00:2a:4a:16:01:64
Slave queue ID: 0
```

본딩에서 Slave 의 포트가 장애가 났거나 포트 변경을 할때 손쉽게 사용 할 수 있는 방법입니다.   


# Slave 인터페이스 추가
* * *
아래와 같이 bond device 에 Slave 인터페이스를 추가 할 수 있습니다.   

```
# ifenslave bond0 eth1
# cat /proc/net/bonding/bond0
Ethernet Channel Bonding Driver: v3.7.1 (April 27, 2011)

Bonding Mode: fault-tolerance (active-backup)
Primary Slave: None
Currently Active Slave: eth2
MII Status: up
MII Polling Interval (ms): 100
Up Delay (ms): 0
Down Delay (ms): 0

Slave Interface: eth2
MII Status: up
Speed: 1000 Mbps
Duplex: full
Link Failure Count: 0
Permanent HW addr: 00:2a:4a:16:01:64
Slave queue ID: 0

Slave Interface: eth1
MII Status: up
Speed: 1000 Mbps
Duplex: full
Link Failure Count: 0
Permanent HW addr: 00:2a:4a:16:01:63
Slave queue ID: 0
```

위와 같이 정상적으로 추가된 것을 확인 할 수 있습니다.  

# 참고 자료
* * *
Red Hat Community : [How to test nic bonding? - https://access.redhat.com/discussions/669983](https://access.redhat.com/discussions/669983)


