---
layout: post
title: "[Ansible] USER/GROUP 생성 Playbook"
description: " "
author: chhanz
date: 2021-01-18
tags: [ansible]
category: ansible
---
# [Ansible] USER/GROUP 생성 Playbook
## 잡설 (회고?)
연말과 연초가 너무 바빴습니다.    
몸이 바쁘다 보니 글 쓰는게 소홀했습니다. 올해는 바쁘더라도 짧은 내용이라도 더 열심히 글 작성해보겠습니다.   
   
# Playbook 
위에서 말한 것과 같이 작업도 많고 시간은 부족한데 BAU 업무는 여전히 진행 되야 합니다.   
이번에 작성한 Playbook 은 다량의 시스템에 USER과 GROUP 을 생성하는 Playbook 을 작성하였습니다.   
   
***Playbook 을 이용하여 BAU 업무 투자 시간이 채감상 3분의 1로 줄었습니다.***   
   
# Playbook 사용법
## Clone Playbook 
아래와 같이 Playbook 을 Clone 진행합니다.   
```bash
$ cd /etc/ansible/roles
$ sudo git clone https://github.com/chhanz/ansible.role-mgt-usergrp.git
```
   
## Playbook 및 Varfile 작성
아래와 같이 Playbook 및 Varfile 을 작성합니다.   
예제 Playbook 과 Varfile 은 `ansible.role-mgt-usergrp/tests/` 경로의 예제 파일을 참고 하시면 됩니다.   

### Playbook 예제      
```bash   
$ cat create_usergrp.yml
---
- name: management 'user'
  hosts: node
  vars_files:
    - userlist.yml
  roles:
  - role: ansible.role-mgt-usergrp
```
   
### Varfile 예제
```bash
$ cat userlist.yml
---
group_list:
    - grp_name: demogrp
      gid: 777

user_list:
    - id: demouser
      new_password: 6af286f0509e7c166abf710850f44fc4
      uid: 770
      groups: demogrp
      comment: "KR/ANSIBLE/DEMO/USER/"
    - id: demouser1
      new_password: 6af286f0509e7c166abf710850f44fc4
      uid: 771
      groups: demogrp
      comment: "KR/ANSIBLE/DEMO/USER/"
    - id: demouser2
      new_password: 6af286f0509e7c166abf710850f44fc4
      uid: 772
      groups: demogrp
      comment: "KR/ANSIBLE/DEMO/USER/"
    - id: demouser3
      new_password: 6af286f0509e7c166abf710850f44fc4
      uid: 773
      groups: demogrp
      comment: "KR/ANSIBLE/DEMO/USER/"
```
   
## Inventory 예제
```bash
$ cat inventory
[node]
192.168.200.201
192.168.200.202

[node:vars]
ansible_ssh_user=root
ansible_ssh_pass=testtest
```
   
# Playbook 수행
아래와 같이 Playbook 을 수행합니다.   
```bash
$ ansible-playbook -i inventory create_usergrp.yml
```
   
## 참고 : 수행 로그   
```bash
$ ansible-playbook -i inventory create_usergrp.yml

PLAY [management 'user'] **********************************************************************************

TASK [Gathering Facts] ************************************************************************************
ok: [192.168.200.202]
ok: [192.168.200.201]

TASK [ansible.role-mgt-usergrp : create 'groups'] *********************************************************
changed: [192.168.200.202] => (item={u'grp_name': u'demogrp', u'gid': 777})
changed: [192.168.200.201] => (item={u'grp_name': u'demogrp', u'gid': 777})

TASK [ansible.role-mgt-usergrp : create 'users'] **********************************************************
changed: [192.168.200.202] => (item={u'comment': u'KR/ANSIBLE/DEMO/USER/', u'new_password': u'6af286f0509e7c166abf710850f44fc4', u'id': u'demouser', u'groups': u'demogrp', u'uid': 770})
changed: [192.168.200.201] => (item={u'comment': u'KR/ANSIBLE/DEMO/USER/', u'new_password': u'6af286f0509e7c166abf710850f44fc4', u'id': u'demouser', u'groups': u'demogrp', u'uid': 770})
changed: [192.168.200.202] => (item={u'comment': u'KR/ANSIBLE/DEMO/USER/', u'new_password': u'6af286f0509e7c166abf710850f44fc4', u'id': u'demouser1', u'groups': u'demogrp', u'uid': 771})
changed: [192.168.200.201] => (item={u'comment': u'KR/ANSIBLE/DEMO/USER/', u'new_password': u'6af286f0509e7c166abf710850f44fc4', u'id': u'demouser1', u'groups': u'demogrp', u'uid': 771})
changed: [192.168.200.201] => (item={u'comment': u'KR/ANSIBLE/DEMO/USER/', u'new_password': u'6af286f0509e7c166abf710850f44fc4', u'id': u'demouser2', u'groups': u'demogrp', u'uid': 772})
changed: [192.168.200.202] => (item={u'comment': u'KR/ANSIBLE/DEMO/USER/', u'new_password': u'6af286f0509e7c166abf710850f44fc4', u'id': u'demouser2', u'groups': u'demogrp', u'uid': 772})
changed: [192.168.200.202] => (item={u'comment': u'KR/ANSIBLE/DEMO/USER/', u'new_password': u'6af286f0509e7c166abf710850f44fc4', u'id': u'demouser3', u'groups': u'demogrp', u'uid': 773})
changed: [192.168.200.201] => (item={u'comment': u'KR/ANSIBLE/DEMO/USER/', u'new_password': u'6af286f0509e7c166abf710850f44fc4', u'id': u'demouser3', u'groups': u'demogrp', u'uid': 773})

PLAY RECAP ************************************************************************************************
192.168.200.201            : ok=3    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
192.168.200.202            : ok=3    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```
   
## 점검
아래와 같이 계정 생성이 문제없이 된 것을 확인 할 수 있습니다.   
   
```bash
[root@fastvm-centos-7-7-201 ~]# cat /etc/passwd | tail -n4
demouser:x:770:777:KR/ANSIBLE/DEMO/USER/:/home/demouser:/bin/bash
demouser1:x:771:777:KR/ANSIBLE/DEMO/USER/:/home/demouser1:/bin/bash
demouser2:x:772:777:KR/ANSIBLE/DEMO/USER/:/home/demouser2:/bin/bash
demouser3:x:773:777:KR/ANSIBLE/DEMO/USER/:/home/demouser3:/bin/bash

[root@fastvm-centos-7-7-201 ~]# id demouser
uid=770(demouser) gid=777(demogrp) groups=777(demogrp)

[root@fastvm-centos-7-7-201 ~]# id demouser1
uid=771(demouser1) gid=777(demogrp) groups=777(demogrp)

[root@fastvm-centos-7-7-201 ~]# id demouser2
uid=772(demouser2) gid=777(demogrp) groups=777(demogrp)

[root@fastvm-centos-7-7-201 ~]# id demouser3
uid=773(demouser3) gid=777(demogrp) groups=777(demogrp)
```
   
# 참고 자료
* [https://github.com/chhanz/ansible.role-mgt-usergrp](https://github.com/chhanz/ansible.role-mgt-usergrp)   