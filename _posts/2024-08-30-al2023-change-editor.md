---
layout: post
title: "[Amazon Linux 2023] update-alternatives 로 editor 변경"
description: ""
author: chhanz
date: 2024-08-30
tags: [linux]
category: linux
---

# update-alternatives 로 editor 변경
이번 글에서는 Amazon Linux 2023 에서 `update-alternatives` 을 이용하여 Default Editor 를 변경하는 과정을 직접 등록하고 사용해보도록 하겠습니다.   
   
# Configuration
사용할 Editor 를 아래와 같은 방법으로 등록합니다.   

```bash
$ sudo update-alternatives --install /usr/bin/editor editor /usr/bin/vim 1
$ sudo update-alternatives --install /usr/bin/editor editor /usr/bin/nano 2
```
   
등록된 Editor 를 다음과 같은 방법으로 확인합니다.   
   
```bash
$ sudo update-alternatives --display editor
editor - status is auto.
 link currently points to /usr/bin/nano
/usr/bin/vim - priority 1
/usr/bin/nano - priority 2
Current `best' version is /usr/bin/nano.
```
   
# default editor 변경
아래와 같은 방법으로 등록된 Editor 을 변경 할 수 있습니다.   
   
```bash
$ sudo update-alternatives --config editor

There are 2 programs which provide 'editor'.

  Selection    Command
-----------------------------------------------
   1           /usr/bin/vim
*+ 2           /usr/bin/nano

Enter to keep the current selection[+], or type selection number: 1   <<---!! Editor 선택
```
   
```bash
$ sudo update-alternatives --display editor
editor - status is manual.
 link currently points to /usr/bin/vim   <<---!! Vim 으로 선택됨.
/usr/bin/vim - priority 1
/usr/bin/nano - priority 2
Current `best' version is /usr/bin/nano.
```

# 참고 문서
* [https://www.baeldung.com/linux/systemd-unit-file-editor](https://www.baeldung.com/linux/systemd-unit-file-editor)   