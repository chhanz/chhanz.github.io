---
layout: post
title: "[ansible] ansible-vault 를 이용하여 암호화 하기"
description: " "
author: chhanz
date: 2019-01-30
tags: [ansible]
category: ansible
---

# [ansible] ansible-vault 를 이용하여 암호화 하기
* * *

아래는 Ansible 을 이용하여 특정 node 에 httpd 를 설치하는 간단한 ansible 구문 입니다.   

~~~yaml
---
- hosts: node
  tasks:
    - name: install httpd
      yum:
        name=httpd
        state=present
    - name: Start web server
      service:
        name=httpd
        state=started
~~~

ansible 을 이용하여, node host 에 접근해서 httpd 설치 명령을 실행하기 위해서는 ansible 에서 사용될 User 정보 및 Password 정보, ssh 접근에 대한 정보 등을 사전에 ansible 시스템에 추가하거나 vars 혹은 inventory 에 설정을 해야됩니다.   
하지만 위와 같이 vars 혹은 inventory 에 등록하는 것은 보안에 취약하므로, ansible-vault 를 이용해서 중요 정보를 암호화 할 수 있습니다.   
   
## ansible-playboot 문서 구문
* * *
ansible-playbook 문서 구성은 아래와 같습니다.   

~~~
# tree
.
├── apache.yml     // Playbook
├── group_vars     // Playbook 전역 변수 Directory
│   └── all
└── inventory      // Host Inventory
   
1 directory, 3 files   
~~~

   
## ~/group_vars/all 암화화
* * *

~/group_vars/all 을 암호화 합니다.   


~~~
# mkdir ~/group_vars
# ansible-vault create ~/group_vars/all
>> ansible-vault passwd 입력
// Start of File
---
ansible_connection: ssh
ansible_ssh_user: root
ansible_port: 22
ansible_ssh_pass: rootpasswd
// End of File
~~~


## Playbook 실행
* * *
ansible-vault 로 암호화된 파일을 로드하면서 Playbook 을 시작하기 위해서는 아래와 명령 수행을 합니다.

~~~
# ansible-playbook -i inventory --ask-vault-pass  apache.yml
Vault password: <Password 입력>
~~~

<center><img src="/assets/images/post/2019-01-30-ansible/0.png" height="230"> <br></center>


위와 같이 ~/group_vars/all 전역 변수에 선언된 내용들을 이용해서, 해당 명령을 수행 할 수 있습니다.   

ansible-vault 로 암호화 된 파일을 읽기 위해서는 아래와 같이 명령으로 해야됩니다.   


~~~
# ansible-vault view ~/group_vars/all
ansible_connection: ssh
ansible_ssh_user: root
ansible_port: 22
ansible_ssh_pass: rootpasswd

// ansible-vault 미 사용일 경우
# cat ~/group_vars/all
$ANSIBLE_VAULT;1.1;AES256
37306166613966396265353335663565383733323336616335323232336632346637326239306364
3964373733376262623639373936373636613964656130340a336537613134663837663136346165
39626166623738613938326665386336653231643538383932653333663832633032303539313866
3437363637613334360a633730336264353764323536353637663338656239386432386434373162
66306162353562633734393731386233333261376461353362656666633337393931646432636263
37663866346233383165386430663265363932336362326132356666376138643338313565333033
39306135306638653434636332663662653265393464336335646366633135636261636630313961
30366231396562336338376137623461353066323264643836393065363432343833653531633263
3261
~~~


