---
layout: post
title: "[Linux] Note tail/tailf" 
description: ""
author: chhanz
date: 2022-11-11
tags: [linux]
category: linux
---

# intro
이번 포스트는 간단한 메모 형식으로 작성하고 작성하게된 계기는 안좋은 옛날 습관이 얼마나 무서운가를 남기기 위해 작성하였다.   
   
# Where is my `tailf`....?
기존에 UNIX engineer 시절 때는 [`tail`](https://www.ibm.com/docs/en/aix/7.2?topic=t-tail-command) 명령으로 `-f` 옵션을 이용하여 로그를 모니터링을 하였다.   
하지만 어느 날 Linux engineer 를 하면서 [`tailf`](https://linux.die.net/man/1/tailf) 라는 명령어를 알게 되면서 `tail` 을 안쓰는 이상한 습관이 생겨버렸다.   
    
`tailf` 는 `util-linux` Package 에 포함되어 있다가 2017 년도에 제거된 명령어인 것으로 보인다.    
([https://www.spinics.net/lists/util-linux-ng/msg13779.html](https://www.spinics.net/lists/util-linux-ng/msg13779.html))   
   
그런데 나는 아직까지 사용을 했었다.    
키보드 3회를 더 누르는게 너무 귀찮았다.    
    
# Alternative Command
`tail` 을 사용하면 되지만 아직도 난 귀찮다.    
그래서 아래와 같이 script 를 명령어에 추가하여 사용한다.   
```bash
$ cat $(which tailf)
#!/bin/bash

if [ $# -eq 0 ]
    then echo -e "[ERROR] Please Input Parameter"
    exit
fi

tail -f $1
```
   
# Detail to `tail` command
`tail` command option 에는 `-f` 와 `-F` 가 있다.    
쉽게 보면 option 의 차이는 다시 추적을 하느냐 마느냐 가 있다.      
아래 man page 를 참고하면 이해가 편하다.   
```console
tail(1) — Linux manual page
...
       -f, --follow[={name|descriptor}]
              output appended data as the file grows;

              an absent option argument means 'descriptor'

       -F     same as --follow=name --retry
       ...
       --retry
              keep trying to open a file if it is inaccessible
...
```

아래는 관련한 테스트 로그이다.   
## `-F` 관련 로그   
```bash
$ tail -F test
...
13
tail: ‘test’ has become inaccessible: No such file or directory
tail: ‘test’ has appeared;  following end of new file
14
...
```
1 부터 100 까지 `test` 라는 파일에 숫자를 기록하는 중에 `test` 파일을 제거 하고 다시 생성되는 과정의 테스트를 진행해보았다.   
`tail -F` 는 위와 같은 로그가 출력되고 신규로 생성된 파일로 모니터링을 연결한다.   
   
# 마치며
아직도 신규 버전의 OS 를 들어가면 아직도 `tailf` 를 치고 있다.    
습관이란건 고치기가 어렵다. 그래서 script 를 만들어서 사용한다. ㅋㅋㅋㅋㅋㅋㅋ    
        
사실 저 script 도 매번 작성하기 귀찮아서 copy & paste 를 하기 위해 이 포스팅을 작성하는 것이다. ㅋㅋㅋ   
   
# 참고 자료
* [`tailf`](https://linux.die.net/man/1/tailf)   