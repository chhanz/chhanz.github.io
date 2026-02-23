---
layout: post
title: "[CEPH] ceph-ansible 을 이용한 ceph quincy 설치"
description: "설치간 발생한 이슈 정리"
author: chhanz
date: 2024-01-10
tags: [ceph]
category: ceph
---

# [`ceph-ansible`](https://docs.ceph.com/projects/ceph-ansible/en/latest/) 을 이용한 Ceph quincy 설치
오늘은 Ceph quincy 버전을 설치 테스트하면서 발생한 문제에 대해 메모하도록 하겠습니다.   
   
# 설치
기본적인 설치는 이전에 작성한 `octopus` 버전 문서를 참고합니다.   
[https://tech.chhanz.xyz/ceph/2021/02/23/ceph-ansible/](https://tech.chhanz.xyz/ceph/2021/02/23/ceph-ansible/)   
   
# 이슈
아래와 같이 `site-container.yml` 을 이용해서 playbook 을 수행하려고 할 때 아래와 같이 에러가 발생합니다.   
   
```bash
(deploy) root@deploy:~/ceph-ansible# ansible-playbook -i inventory site-container.yml -b
[DEPRECATION WARNING]: [defaults]callback_whitelist option, normalizing names to new standard, use callbacks_enabled instead. This feature will be
removed from ansible-core in version 2.15. Deprecation warnings can be disabled by setting deprecation_warnings=False in ansible.cfg.
[DEPRECATION WARNING]: "include" is deprecated, use include_tasks/import_tasks instead. This feature will be removed in version 2.16. Deprecation
warnings can be disabled by setting deprecation_warnings=False in ansible.cfg.
ERROR! couldn't resolve module/action 'openstack.config_template.config_template'. This often indicates a misspelling, missing collection, or incorrect mo
dule path.

The error appears to be in '/root/ceph-ansible/roles/ceph-config/tasks/main.yml': line 138, column 3, but may
be elsewhere in the file depending on the exact syntax problem.

The offending line appears to be:


- name: "generate {{ cluster }}.conf configuration file"
  ^ here
We could be wrong, but this one looks like it might be an issue with
missing quotes. Always quote template expression brackets when they
start a value. For instance:

    with_items:
      - {{ foo }}

Should be written as:

    with_items:
      - "{{ foo }}"
```
    
```bash
ERROR! couldn't resolve module/action 'openstack.config_template.config_template'. This often indicates a misspelling, missing collection, or incorrect mo
dule path.
```
   
주요 에러 포인트는 위와 같습니다.   
   
위와 같이 에러가 발생하는 경우, `requirements.yml` 을 `ansible-galaxy` 명령어를 이용하여 설치를 수행해야합니다.   

```bash
$ ansible-galaxy install -r requirements.yml
```
   
`requirements.yml` 내용은 아래와 같습니다.   
```yaml
---
# These are Ansible requirements needed to run ceph-ansible master
collections:
  - name: https://opendev.org/openstack/ansible-config_template
    version: 1.2.1
    type: git
  - name: ansible.utils
    version: '>=2.5.0'
  - name: community.general
  - name: ansible.posix
```
   
위 파일 내용을 확인한 것과 같이 ansible-playbook 에서 `ansible-config_template` 가 꼭 필요한 모듈이며, Python Virtual Environment 을 사용하면서 pip 을 이용한 `requirements.txt` 만으로는 부족한 부분입니다.   
그리하여 위와 같은 이슈가 발생되며 `requirements.yml` 을 설치하면 문제가 해소됩니다.   
   
# 참고 문서
* [https://docs.ceph.com/projects/ceph-ansible/en/latest/](https://docs.ceph.com/projects/ceph-ansible/en/latest/)   