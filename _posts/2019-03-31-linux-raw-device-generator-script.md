---
layout: post
title: "[Linux] CentOS 7 raw device 자동 생성 스크립트"
description: " "
author: chhanz
date: 2019-03-31
tags: [linux]
category: linux
---

# [Linux] CentOS 7 raw device 자동 생성 스크립트
* * * 
고객사에서 Multipath 로 생성된 mpath device 를 raw device 로 생성하는 작업이 있었습니다.   
너무 많은 mpath device 를 raw device 로 생성을 하다보니, 오타도 발생되고 작업 환경을 콘솔에서 하다보니 불편함도 있다보니 해당 스크립트를 만들었습니다.   

## Download Link   
* * *   
<img src="/assets/images/icon/file_icon.png" width="24" height="24"> <a href="https://github.com/chhanz/raw-device-generator">GitHub</a><br>
<img src="/assets/images/icon/file_icon.png" width="24" height="24"> <a href="https://raw.githubusercontent.com/chhanz/raw-device-generator/master/raw_generator_v1.sh">Raw Script</a>
* * *    

## 사용 방법   
Multipath Device 의 mpath 를 기준으로 해당 DM_UUID 값을 생성하여 60-raw.rules.$DATE 파일로 생성합니다.   

1) Multipath List 확인   
~~~
# multipath -ll | grep mpath
mpathb (3600c0ff00011e91abe3a475901000000) dm-3 HP      ,P2000 G3 FC
mpatha (3600c0ff00011e91a3e3b475901000000) dm-2 HP      ,P2000 G3 FC
~~~   
   
2) 스크립트 Download   
~~~
# wget https://raw.githubusercontent.com/chhanz/raw-device-generator/master/raw_generator_v1.sh
--2019-03-31 20:46:20--  https://raw.githubusercontent.com/chhanz/raw-device-generator/master/raw_generator_v1.sh
Resolving raw.githubusercontent.com (raw.githubusercontent.com)... 151.101.0.133, 151.101.64.133, 151.101.128.133, ...
Connecting to raw.githubusercontent.com (raw.githubusercontent.com)|151.101.0.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 2491 (2.4K) [text/plain]
Saving to: ‘raw_generator_v1.sh’

100%[======================================================================================================================================================================================================================================>] 2,491       --.-K/s   in 0s

2019-03-31 20:46:21 (57.6 MB/s) - ‘raw_generator_v1.sh’ saved [2491/2491]
~~~   
   
3) 스크립트 구동   
~~~
# chmod u+x raw_generator_v1.sh
~~~   
   
<img src="/assets/images/post/2019-03-31-raw-generator/img1.png">
   
4) 생성된 File 확인   
~~~
# ls -la
total 12
drwxr-xr-x   2 root root   65 Mar 31 20:49 .
dr-xr-x---. 16 root root 4096 Mar 31 20:49 ..
-rw-r--r--   1 root root  349 Mar 31 20:49 60-raw.rules.190331_2049
-rwxr--r--   1 root root 2493 Mar 31 20:49 raw_generator_v1.sh

# cat 60-raw.rules.190331_2049

# RawGenerator - 60-raw.rules
# Make . chhanz

ACTION=="add|change",ENV{DM_UUID}=="mpath-3600c0ff00011e91a3e3b475901000000",RUN+="/usr/bin/raw /dev/raw/raw1 %N"
ACTION=="add|change",ENV{DM_UUID}=="mpath-3600c0ff00011e91abe3a475901000000",RUN+="/usr/bin/raw /dev/raw/raw2 %N"

ACTION=="add", KERNEL=="raw*", OWNER="grid", GROUP="dba", MODE="0660"

~~~   

위와 같이 생성된 파일을 이용하여 /etc/udev/rules.d/ 에 넣고 raw device 생성을 합니다.   
상세 raw device 생성 방법은 이전 Posting 확인합니다.   

# 참고 자료   
GITHUB : [https://github.com/chhanz/raw-device-generator](https://github.com/chhanz/raw-device-generator)   
Raw Device 생성 방법 : [https://chhanz.github.io/linux/2018/10/01/linux_rawdevice/](https://chhanz.github.io/linux/2018/10/01/linux_rawdevice/)   

