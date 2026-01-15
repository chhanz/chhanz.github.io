---
layout: post
title: "adb 를 이용하여 Android 16 무선 페어링 방법"
description: ""
author: chhanz
date: 2026-01-14
tags: [linux]
category: linux
---

# adb 를 이용하여 Android 16 무선 페어링 방법
정확한 사용 방법에 대해서 기록된 내용이 없어서, 해당 포스팅을 작성하게 되었습니다.   
    
# How to
`adb` 를 사용하는 방법은 PC, APP 둘 다 동일한 방법으로 진행하면 됩니다.    

* PC : [https://developer.android.com/tools/releases/platform-tools?hl=ko](https://developer.android.com/tools/releases/platform-tools?hl=ko)     
* Mobile : `ADB Shell` 최신 버전   
   
## Connect
개발자 옵션에서 무선 디버깅을 활성화합니다.   
    
"페어링 코드로 기기 페어링" 을 누르고 나오는 정보를 아래와 같이 터미널을 통해 페어링을 먼저합니다.   

```bash
$ adb pair 127.0.0.1:43033
Enter pairing code: 123456
Successfully paired to 127.0.0.1:43033 [guid=adb-abcdefg-chhanz]
```
   
페어링이 완료된 이후, "무선 디버깅" 메뉴에 표기된 'IP 주소 및 포트' 정보를 기반으로 connect 합니다.   
해당 포트값은 `pair` 용 포트와 `connect` 용 포트 번호가 다릅니다.   
    
```bash
$ adb connect 127.0.0.1:43853
connected to 127.0.0.1:43853
```
    
이후 `adb devices` 와 같은 명령어로 장치 접속 상태를 확인합니다.   
    
    