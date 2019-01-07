---
layout: post
title: "SAN Switch - 운영 매뉴얼"
description: " "
author: chhanz
date: 2016-05-13
tags: [SAN]
category: SAN
---

# SAN Switch - 운영 매뉴얼
* * *
SAN Switch 의 설정을 위해 주로 GUI - Web Console 을 접속합니다.  
하지만 장비 및 접속 PC 에 따라 JAVA Version 에 대한 제약 사항으로 인해 접속이 안되는 경우가 많습니다.   
그리하여 telnet , ssh 를 통한 CLI 접근을 통해 설정을 하면 편리하게 SAN Switch 설정을 할 수 있습니다.   

아래 명령들을 통해 SAN Switch 설정을 배워봅시다.   

# Switch configuration
* * *
## Switch name 변경

```
switch_name > switchname “san_sw_new_name” 
```

## Switch Domain ID 변경
Domain ID는 fabric내에서의 switch 구별을 위한 것으로 유일한 ID를 부여해야 합니다.
~~~
switch_name> switchdisable
switch_name> configure
Configure…       Fabric parameters (yes, y, no, n): [no] y
Domain: (1..239) [1] <new_id>    <<< 신규 ID 입력
R_A_TOV: (4000..120000) [10000] 
E_D_TOV: (1000..5000) [2000]
Data field size: (256..2112) [2112]
Sequence Level Switching: (0..1) [0]

Disable Device Probing: (0..1) [0] 
    Suppress Class F Traffic: (0..1) [0] 
    VC Encoded Address Mode: (0..1) [0] 
    Per-frame Route Priority: (0..1) [0] 
    Long Distance Fabric: (0..1) [0] 
    BB credit: (1..16) [16] 
    Virtual Channel parameters (yes, y, no, n): [no] 
    Zoning Operation parameters (yes, y, no, n): [no] 
    RSCN Transmission Mode (yes, y, no, n): [no] 
    NS Operation Parameters (yes, y, no, n): [no] 
    Arbitrated Loop parameters (yes, y, no, n): [no] 
    System services (yes, y, no, n): [no] 
    Portlog events enable (yes, y, no, n): [no]
WARNING: The domain ID is changed. The port level zoning may be affected.
done.
switch_name> switchenable
~~~
위와 같이 설정을 하며, 주로 Domain ID 를 제외한 나머지 설정은 Enter 를 입력 하여 기본값으로 설정합니다.

## Switch IP 변경

SAN Switch 의 기본 접속 IP 는 10.77.77.77 입니다.   
변경을 위해 아래와 같이 설정하여 변경을 합니다.   
~~~
switch_name> ipaddrset 
Ethernet IP Address [10.77.77.77]: 192.168.0.23
Ethernet Subnetmask [255.255.255.0]: 255.255.255.0
Fibre Channel IP Address [0.0.0.0]: 
Fibre Channel Subnetmask [0.0.0.0]:
  Committing configuration...Done.

switch_name> ipaddrshow
~~~
_ipaddrshow_ 명령을 통해 IP 설정을 확인 할 수 있습니다.   

## Port Configuration
* * *    

### Port Speed 설정
설정 가능한 Port Speed 는 아래와 같습니다. 
> 0 : Auto   
1 : 1G   
2 : 2G   
4 : 4G   
8 : 8G   
16 : 16G  (16 G 지원 Switch)

~~~
switch_name> portcfgspeed  <port 번호> <port speed>
~~~
### Port 설정 확인
~~~
switch_name> portcfgshow
~~~

# Zone Configuration
* * *
## Alias
Switch 의 Port 번호 혹은 WWWN 을 알기쉽게 alias 로 지정하여, zone member 확인을 쉽게 합니다.   

* Alias 생성   
~~~
switch_name> alicreate <“alias name”>,<“member_1;…;member_n”>
switch_name> alicreate "test_fc0","1,0"
switch_name> alicreate "test_fc0","10:00:00:00:C9:4E:03:76"
~~~
> Port Zoning : switch_name> alicreate "test_fc0","1,0"   
WWWN Zoning : switch_name> alicreate "test_fc0","10:00:00:00:C9:4E:03:76"     

* Alias 삭제   
~~~
switch_name> alidelete <“alias name”>
~~~   

## Zone
Zone 은 일종의 Network Switch 의 VLAN 과 비슷한 역할을 하는 기능이며, member 들 사이의 통신을 제한 하는 기능입니다.   

* Zone 생성
~~~
switch_name> zonecreate <"zone name">,<"member_1;…;member_n">
switch_name> zonecreate "test_fc0__stg_fc1","test_fc0;stg_fc1"
~~~
Zone 생성할 때 alias 대신 Port 번호 및 WWWN 을 바로 입력을 할 수 있습니다.  
하지만 관리의 편의를 위해 alias 를 사용하는 것을 권장합니다.   

* Zone 삭제
~~~
switch_name> zonedelete <"zone name">
switch_name> zonedelete "test_fc0__stg_fc1"
~~~   

## Config 적용
Zone 을 적용하기 위해서는 Config Group 을 생성하여 Zone 을 Group 에 추가 해야합니다.   

* Config Group 생성 및 Zone 추가
~~~
switch_name> cfgcreate <“group name”>,<“member_1;…;member_n>
switch_name> cfgcreate "test_zone","test_fc0__stg_fc1"
~~~

* 생성 되있는 Group 에 Zone 추가
~~~
switch_name> cfgadd <“group name”>,<“member_1;…;member_n>
switch_name> cfgadd "test_zone","test_fc1__stg_fc2"
~~~

* Zone Config 적용
~~~ 
switch_name> cfgenable <“group name”>
switch_name> cfgenable "test_zone"
~~~

* Zone Config 해제 및 삭제   
~~~
switch_name> cfgdisable <“group name”>
switch_name> cfgdisable "test_zone"   
switch_name> cfgdelete <“group name”>
switch_name> cfgdelete "test_zone"
~~~   

* Zone Configuration 확인(예제)

_zoneshow_ 명령을 통해 현재 Switch 에 설정된 Config 를 확인 할 수 있습니다.    
~~~
IBM_2498_B24:admin> zoneshow
Defined configuration:
 cfg:   ZONE_CFG
                Server1_fcs0__V7K3_A1; Server1_fcs0__V7K3_B1; 
                Server1_fcs0__V7K3_A2; Server1_fcs0__V7K3_B2; 
                Server2_fcs0__V7K3_A1; Server2_fcs0__V7K3_B1; 
                Server2_fcs0__V7K3_A2; Server2_fcs0__V7K3_B2; 
                Server3_fcs0__V7K4_A1; Server3_fcs0__V7K4_B1; 
                Server3_fcs0__V7K4_A2; Server3_fcs0__V7K4_B2; 
                Server4_fcs0__V7K4_A1; Server4_fcs0__V7K4_B1; 
                Server4_fcs0__V7K4_A2; Server4_fcs0__V7K4_B2; 
                Server5_fcs0__V7K5_A1; Server5_fcs0__V7K5_B1; 
                Server5_fcs0__V7K5_A2; Server5_fcs0__V7K5_B2; 
                Server6_fcs0__V7K5_A1; Server6_fcs0__V7K5_B1; 
                Server6_fcs0__V7K5_A2; Server6_fcs0__V7K5_B2
 zone:  Server1_fcs0__V7K3_A1
                Server1_fcs0; V7K3_A1
 zone:  Server1_fcs0__V7K3_A2
                Server1_fcs0; V7K3_A2
 zone:  Server1_fcs0__V7K3_B1
                Server1_fcs0; V7K3_B1
 zone:  Server1_fcs0__V7K3_B2
                Server1_fcs0; V7K3_B2
 zone:  Server2_fcs0__V7K3_A1
                Server2_fcs0; V7K3_A1
 zone:  Server2_fcs0__V7K3_A2
                Server2_fcs0; V7K3_A2

 .... 중략 ....
 
 alias: Server1_fcs0
                1,12
 alias: Server2_fcs0
                1,13
 alias: Server3_fcs0
                1,14
 alias: Server4_fcs0
                1,15
 alias: Server5_fcs0
                1,16
 alias: Server6_fcs0
                1,17
 alias: V7K3_A1 1,0
 alias: V7K3_A2 1,2
 alias: V7K3_B1 1,1
 alias: V7K3_B2 1,3
~~~

# Switch 정보 확인
* * *  
Switch 의 모든 Port 의 연결 상태, WWWN 정보를 확인 할 수 있습니다.
~~~
예제)
IBM_2498_B24:admin> switchshow
switchName:     IBM_2498_B24
switchType:     71.2
switchState:    Online   
switchMode:     Native
switchRole:     Principal
switchDomain:   1
switchId:       000000
switchWwn:      00:00:00:aa:aa:aa:aa:aa
zoning:         ON (ZONE_CFG)
switchBeacon:   OFF

Index Port Address Media Speed State     Proto
==============================================
  0   0   010000   id    N8   Online      FC  F-Port  a0:01:07:00:04:00:00:00 
  1   1   010100   id    N8   Online      FC  F-Port  a0:01:07:00:04:00:00:00 
  2   2   010200   id    N8   Online      FC  F-Port  a0:01:07:00:04:00:00:00 
  3   3   010300   id    N8   Online      FC  F-Port  a0:01:07:00:04:00:00:00 
  4   4   010400   id    N8   Online      FC  F-Port  a0:01:07:00:04:00:00:00 
  5   5   010500   id    N8   Online      FC  F-Port  a0:01:07:00:04:00:00:00 
  6   6   010600   id    N8   Online      FC  F-Port  a0:01:07:00:04:00:00:00 
  7   7   010700   id    N8   Online      FC  F-Port  a0:01:07:00:04:00:00:00 
  8   8   010800   id    N8   Online      FC  F-Port  a0:01:07:00:04:00:00:00 
  9   9   010900   id    N8   Online      FC  F-Port  a0:01:07:00:04:00:00:00 
 10  10   010a00   id    N8   Online      FC  F-Port  a0:01:07:00:04:00:00:00 
 11  11   010b00   id    N8   Online      FC  F-Port  v0:01:07:00:04:20:20:20 
 12  12   010c00   id    N8   Online      FC  F-Port  v0:01:07:00:00:20:20:20 
 13  13   010d00   id    N8   Online      FC  F-Port  v0:01:07:00:00:20:20:20 
 14  14   010e00   id    N8   Online      FC  F-Port  v0:01:07:00:00:20:20:20 
 15  15   010f00   id    N8   Online      FC  F-Port  v0:01:07:00:00:20:20:20 
 16  16   011000   id    N8   Online      FC  F-Port  v0:01:07:00:00:20:20:20 
 17  17   011100   id    N8   Online      FC  F-Port  v0:01:07:00:00:20:20:20 
 18  18   011200   id    N8   No_Light    FC  
 19  19   011300   id    N8   No_Light    FC  
 20  20   011400   id    N8   No_Light    FC  
 21  21   011500   id    N8   No_Light    FC  
 22  22   011600   id    N8   No_Light    FC  
 23  23   011700   id    N8   No_Light    FC 
~~~

위 명령어를 이용하면 쉽게 SAN Switch Configuration 이 가능합니다.   

