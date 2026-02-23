---
layout: post
title: "[Python] Python 으로 간단히 웹서비스 구동"
description: " "
author: chhanz
date: 2020-07-05
tags: [linux, python]
category: python
---

# Python 으로 간단히 웹서비스를 구동해보자.
Local PC 에서 `jekyll` 과 같이 내가 만든 정적 웹서비스를 테스트 할 수 있는 방법이 없을까 궁리하다가 찾은 방법입니다.   

# 실행
Web Source 가 있는 위치로 이동하여 아래와 같이 명령을 입력합니다.   
```bash
$ pwd
/var/www/html/

$ cat index.html
HELLO!!!

$ python -m SimpleHTTPServer
Serving HTTP on 0.0.0.0 port 8000 ...
10.10.10.10 - - [20/Jan/2017 16:44:01] "GET / HTTP/1.1" 200 -
10.10.10.10 - - [20/Jan/2017 16:46:22] "GET / HTTP/1.1" 200 -
```
   
위와 같이 실행이 되면 `http://127.0.0.1:8000` 으로 웹서비스를 기동하고 테스트 할 수 있습니다.   
