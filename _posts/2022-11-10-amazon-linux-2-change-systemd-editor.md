---
layout: post
title: "[Linux] Amazon Linux 2 systemd editor 변경" 
description: ""
author: chhanz
date: 2022-11-10
tags: [linux]
category: linux
---
# intro
요즘 Amazon Linux 2 (ec2) 를 사용하면서 개인적으로 불편한 점을 발견하여 아래와 같이 기록한다.   
    
# systemctl `edit`
제목과 같이 `systemctl edit` 명령을 통해 systemd 의 `override.conf` 를 수정 할 수 있는데 Amazon Linux 2 에서는 계속 `nano` Editor 로 해당 editor 가 작동하는 불편함이 있었다.   
OS 전체의 Editor 가 `nano` 로 설정된 것은 아니다. `crontab -e` 는 `vi` 로 열린다.    
    
# Configuration
아래 명령어를 통해 Environment 를 추가하면 systemd Editor 를 변경 할 수 있다.   
```bash
$ sudo printf "export SYSTEMD_EDITOR=\"$(which vi)\"\n" >> ~/.bashrc
```
    
변경 이후, Shell 을 다시 login 한다.   
   
테스트 진행,
```bash
$ sudo systemctl edit network
```
`vi` 으로 editor 가 작동 되는 것을 볼 수 있다.   
   

