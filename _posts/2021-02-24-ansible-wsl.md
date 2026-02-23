---
layout: post
title: "[Ansible] Windows 10 WSL 을 이용하여 Ansible 를 써보자"
description: ""
author: chhanz
date: 2021-02-24
tags: [ansible]
category: ansible
---

# [Ansible] Windows 10 WSL 을 이용하여 Ansible 를 써보자
MacOS 을 사용하거나 Linux laptop 을 사용하는 분들은 Ansible 을 사용하는 것에 있어 문제가 될 것이 없습니다.   
OS 내부에 `brew` 이나 `apt` , `yum` 같은 Package manager 가 있고 Command 를 이용 할 수 있기 때문이죠.   
   
그럼 Windows 는 사용이 불가능한 것인가?   
   
Windows 에서는 `Windows Subsystem for Linux (WSL)` 을 이용하여 Command 환경을 구현해주는 기능을 활용하면 사용이 가능합니다.   
아래 Link를 통해 상세한 정보를 확인 할 수 있습니다.   
* 참고 자료 : [https://docs.microsoft.com/ko-kr/windows/wsl/faq](https://docs.microsoft.com/ko-kr/windows/wsl/faq)   
   
# WSL 설치 
<img src="/assets/images/post/2021-02-24-ansible-wsl/1.png" style="max-width: 95%; height: auto;">   
WSL 을 설치하기 위해 `제어판` > `프로그램 및 기능` > `Windows 기능 켜기/끄기` > `Linux용 Windows 하위 시스템` 체크 > 확인을 선택합니다.   
   
<img src="/assets/images/post/2021-02-24-ansible-wsl/2.png" style="max-width: 95%; height: auto;">   
Windows Store 에서 `Ubuntu` 를 검색합니다.      
   
<img src="/assets/images/post/2021-02-24-ansible-wsl/3.png" style="max-width: 95%; height: auto;">   
`Ubuntu` 를 선택하면 위와 같이 설치를 진행 할 수 있습니다.   
설치를 진행합니다.   
   
<img src="/assets/images/post/2021-02-24-ansible-wsl/4.png" style="max-width: 95%; height: auto;">   
위와 같이 설치가 완료되면, 시작 버튼을 눌러 `Ubuntu` 를 시작합니다.      
   
<img src="/assets/images/post/2021-02-24-ansible-wsl/5.png" style="max-width: 95%; height: auto;">   
설치가 자동으로 진행이 되며, 위와 같이 `Ubuntu` 에서 사용할 사용자를 생성합니다.   
   
<img src="/assets/images/post/2021-02-24-ansible-wsl/6.png" style="max-width: 95%; height: auto;">   
사용자 계정 및 비밀 번호를 입력합니다.   
   
<img src="/assets/images/post/2021-02-24-ansible-wsl/7.png" style="max-width: 95%; height: auto;">   
위와 같이 설치가 완료되면 실제 `Ubuntu` 시스템에 접속한 것과 같은 화면을 볼 수 있습니다.   

Ansible 설치를 위해 아래 Ubuntu Command 를 사용합니다.   
```bash
$ sudo apt-get updaate
$ sudo apt install ansible sshpass  << 필요시엔 `sshpass` package 도 같이 설치합니다.
```
   
<img src="/assets/images/post/2021-02-24-ansible-wsl/8.png" style="max-width: 95%; height: auto;">   
위 명령을 통해 위와 같이 설치가 가능합니다.   
   
<img src="/assets/images/post/2021-02-24-ansible-wsl/9.png" style="max-width: 95%; height: auto;">   
설치가 완료되면 `ansible --version` 명령을 통해 정상적으로 설치 되었는지 확인합니다.   
   
<img src="/assets/images/post/2021-02-24-ansible-wsl/10.png" style="max-width: 95%; height: auto;">   
설치된 Ansible 이 정상적으로 동작하는지 확인을 위해 Inventory 를 생성합니다.   
   
<img src="/assets/images/post/2021-02-24-ansible-wsl/11.png" style="max-width: 95%; height: auto;">   
Ansible ad-hoc 을 이용하여 `ping` 테스트를 진행 해보았습니다.   
문제 없이 작동하는 것을 볼 수 있습니다.      
   
# 참고 자료 
* [https://docs.microsoft.com/ko-kr/windows/wsl/faq](https://docs.microsoft.com/ko-kr/windows/wsl/faq)   