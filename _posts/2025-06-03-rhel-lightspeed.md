---
layout: post
title: "RHEL Lightspeed 사용기"
description: ""
author: chhanz
date: 2025-06-03
tags: [linux]
category: linux
---

# RHEL Lightspeed 사용기
   
<p><br><center><iframe width="560" height="315" src="https://www.youtube.com/embed/GVGxH3eFxz4?si=ueCCQ5YQ1_Hq1pUY" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></center><br></p>
   
[RHEL Lightspeed](https://www.redhat.com/ko/technologies/linux-platforms/enterprise-linux-10/lightspeed) 은 Red Hat 이 수십 년간 축적해온 Linux 전문 지식이 적용된 AI 기반 서비스를 활용하면 간소화된 명령으로 Red Hat Enterprise Linux를 구축, 배포, 관리할 수 있는 도구입니다.    
   
RHEL Lightspeed 은 Red Hat Enterprise Linux 9.6 및 10에서 사용할 수 있습니다.   
   
***이번 포스팅에서는 RHEL Lightspeed 이 어떻게 RHEL 에서 사용되고, 활용 할 수 있을지 몇가지 예제를 수행하여 활용을 해보았습니다.***   
   
# Recommanded
* 기본적으로 Developers Subscription 이상의 서브스크립션이 필요합니다.   
* `rhc` 혹은 `subscription-manager` 명령어를 통해 운영체제에 서브스크립션이 활성화 된 상태가 필요합니다.   
   
# command-line-assistant 설치
아래와 같은 방법으로 command-line-assistant (이하 CLA) 를 설치합니다.   
   
```bash
$ sudo dnf install command-line-assistant
```
   
# How to
기본적으로 아래와 같은 구문으로 명령어를 수행합니다.   
   
```bash
$ c "질문"
```
   
# Example 
* What is redhat?   
아래와 같이 RHEL 과 관련한 질문을 할 수 있습니다.    
<center><img src="/assets/images/post/2025-06-03-rhel-lightspeed/l1.png" style="max-width: 95%; height: auto;"></center>  
   
* What is this error messages?   
아래와 같이 파이프(`|`)를 통해 시스템에서 발생되는 메시지에 대한 자료를 요청 할 수 있습니다.   
<center><img src="/assets/images/post/2025-06-03-rhel-lightspeed/l2.png" style="max-width: 95%; height: auto;"></center>  
   
* How do I install NFS Server?   
아래와 같이 RHEL 에 서버 역할을 구성하는 방안에 대해 질의하고 안내 받을 수 있습니다.   
<center><img src="/assets/images/post/2025-06-03-rhel-lightspeed/l3.png" style="max-width: 95%; height: auto;"></center>  
   
* 특정 포맷의 데이터를 원하는 형태로 가공을 요청 할 수 있습니다.   
    * 테스트 데이터 (`json`)    
        ```json
        $ cat test.json
        [{
        "id": 1,
        "first_name": "Jeanette",
        "last_name": "Penddreth",
        "email": "jpenddreth0@cs.dom",
        "gender": "Female",
        "ip_address": "2.5.1.2"
        }, {
        "id": 2,
        "first_name": "Giavani",
        "last_name": "Frediani",
        "email": "gfrediani1@se.dom",
        "gender": "Male",
        "ip_address": "2.1.4.2"
        }, {
        "id": 3,
        "first_name": "Noell",
        "last_name": "Bea",
        "email": "nbea2@ik.dom",
        "gender": "Female",
        "ip_address": "1.6.1.2"
        }, {
        "id": 4,
        "first_name": "Willard",
        "last_name": "Valek",
        "email": "wvalek3@v.com",
        "gender": "Male",
        "ip_address": "6.6.8.6"
        }]
        ```
아래와 같이 CLA 를 이용하여 table 형태로 편리하게 포맷을 변경 할 수 있습니다.   
   
<center><img src="/assets/images/post/2025-06-03-rhel-lightspeed/l4.png" style="max-width: 95%; height: auto;"></center>  
   
* 특정 명령어 생성 지원    
파이프(`|`)를 통해 특정 출력에 대해 특정 조건의 명령어 생성을 요청 할 수 있습니다.   
또한 한글로 질문을 할 수 있습니다. ***하지만 답변은 영문으로만 제공이 되는 것을 볼 수 있었습니다.***   
   
<center><img src="/assets/images/post/2025-06-03-rhel-lightspeed/l5.png" style="max-width: 95%; height: auto;"></center>  
   
* 테스트용 소스 코드 생성 지원
아래와 같이 테스트를 위한 소스 코드 생성을 지원하는 것을 확인 할 수 있었습니다.   
   
<center><img src="/assets/images/post/2025-06-03-rhel-lightspeed/l6.png" style="max-width: 95%; height: auto;"></center>     
   
* 여러 조건의 명령어 생성 지원
아래와 같은 여러 조건의 명령을 one line 명령어로 생성 지원하는 것을 확인 할 수 있었습니다.   
   
<center><img src="/assets/images/post/2025-06-03-rhel-lightspeed/l7.png" style="max-width: 95%; height: auto;"></center>  
   
* 특정 어플리케이션 (`httpd`) 의 설정 파일 점검
아래와 같이 `httpd` 의 설정 파일을 점검 요청 할 수 있었습니다.   
   
```bash
[root@ip-172-31-8-200 conf]# systemctl start httpd
Job for httpd.service failed because the control process exited with error code.
See "systemctl status httpd.service" and "journalctl -xeu httpd.service" for details.
```
위와 같이 `httpd` 서비스가 정상적으로 동작을 안하는 문제로 인해 CLA 에게 설정 파일 검토를 요청 하였습니다.   
   
<center><img src="/assets/images/post/2025-06-03-rhel-lightspeed/l8.png" style="max-width: 95%; height: auto;"></center>  
   
위와 같이 Listen 구문에 문제가 있는 것을 확인했고, 가능한 설정 방법에 대해 안내를 지원하였습니다.   
   
```bash
[root@ip-172-31-8-200 conf]# cat httpd.conf | grep Listen
# Listen: Allows you to bind Apache to specific IP addresses and/or
# Change this to Listen on a specific IP address, but note that if
#Listen 12.34.56.78:80
Listen 9999999
```
실제로 위와 같이 잘못된 Listen 설정을 확인 할 수 있었습니다.   
   
## 총평
그 외에도 데이터를 기반한 스크립트 생성, 명령어 간편화 등등 여러 플랫폼을 사용하지 않고 RHEL 운영체제 명령어를 통해 지원을 받을 수 있는 점에서 도움이 되는 기능이 였습니다.   
   
또한 현재 Red Hat 에서 제공하는 interactive lab 을 통해 위 기능을 직접 사용해보고 활용 방법에 대해 실습 할 수 있는 랩도 제공 중이오니 직접 실습을 해보시면 도움이 될 것 같습니다.   
   
[+] [https://www.redhat.com/en/interactive-labs/Solve-problems-with-Command-Line-Assistant](https://www.redhat.com/en/interactive-labs/Solve-problems-with-Command-Line-Assistant)   
   
# 참고 자료
* [https://www.redhat.com/ko/technologies/linux-platforms/enterprise-linux-10/lightspeed](https://www.redhat.com/ko/technologies/linux-platforms/enterprise-linux-10/lightspeed)