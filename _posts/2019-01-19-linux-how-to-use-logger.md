---
layout: post
title: "[Linux] logger 를 이용한 로그 관리"
description: " "
author: chhanz
date: 2019-01-19
tags: [linux]
category: linux
---

# [Linux] logger 를 이용한 로그 관리
* * *

 _/var/log/messages_ 는 _syslogd_ 를 이용하여 로그를 기록합니다.   
주로 시스템의 핵심 로그가 작성되고, 해당 파일을 모니터링하여 시스템의 장애에 대해 파악하기가 좋습니다.   
시스템을 운영하면서 특별히 _/var/log/messages_ 에 별도의 메시지를 기록하기 위해서는 _logger_ 라는 명령을 사용하면 쉽게 적용이 가능합니다.   
   
아래는 이번 포스팅을 위해 httpd Web 서비스가 정상인지 체크하는 간단하게 제작된 스크립트입니다.   
해당 스크립트에서 발생되는 메시지를  _/var/log/messages_ 에 기록 하도록 하겠습니다.   

# Check Web
* * *

~~~
#!/bin/bash

echo -e " "
echo -e " Service Check : httpd "
WEBSTAT=`systemctl status httpd | grep "Active:" | grep running | wc -l`
echo -e " "
if [[ "$WEBSTAT" -eq "0" ]]; then

	echo -e " ########### Web Service Stop ###########"
	echo -e " ########### RESTART HTTPD SERVER ########### "
	systemctl start httpd
	sleep 5

	echo -e " ########### CHECK HTTPD SERVER ########### "
	systemctl -l status httpd

fi

echo -e " ########### CHECK HTTPD SERVER ########### "
echo -e " * * * * Web Server : Running * * * * "
~~~

# logger 를 이용하여 messages 에 등록
아래 명령어를 통해 _/var/log/messages_ 에 로그를 기록합니다.   

~~~
# ./chkweb.sh | logger -t ServiceCHKDeamon

# tail -n 10 /var/log/messages
Jan 19 21:43:50 localhost ServiceCHKDeamon: Service Check : httpd
Jan 19 21:43:50 localhost ServiceCHKDeamon: httpd
Jan 19 21:43:50 localhost ServiceCHKDeamon: ########### CHECK HTTPD SERVER ###########
Jan 19 21:43:50 localhost ServiceCHKDeamon: * * * * Web Server : Running * * * *

// httpd 가 중지 되었을 때
# ./chkweb.sh | logger -t ServiceCHKDeamon

# cat /var/log/messages
Jan 19 21:45:27 localhost ServiceCHKDeamon: Service Check : httpd
Jan 19 21:45:27 localhost ServiceCHKDeamon: httpd
Jan 19 21:45:27 localhost ServiceCHKDeamon: ########### Web Service Stop ###########
Jan 19 21:45:27 localhost ServiceCHKDeamon: ########### RESTART HTTPD SERVER ###########
Jan 19 21:45:27 localhost systemd: Starting The Apache HTTP Server...
Jan 19 21:45:27 localhost systemd: Started The Apache HTTP Server.
Jan 19 21:45:32 localhost ServiceCHKDeamon: ########### CHECK HTTPD SERVER ###########
Jan 19 21:45:32 localhost ServiceCHKDeamon: ● httpd.service - The Apache HTTP Server
Jan 19 21:45:32 localhost ServiceCHKDeamon:   Loaded: loaded (/usr/lib/systemd/system/httpd.service; disabled; vendor preset: disabled)
Jan 19 21:45:32 localhost ServiceCHKDeamon:  Drop-In: /etc/systemd/system/httpd.service.d
Jan 19 21:45:32 localhost ServiceCHKDeamon:           └─test.conf
Jan 19 21:45:32 localhost ServiceCHKDeamon:   Active: active (running) since Sat 2019-01-19 21:45:27 KST; 5s ago
Jan 19 21:45:32 localhost ServiceCHKDeamon:     Docs: man:httpd(8)
Jan 19 21:45:32 localhost ServiceCHKDeamon:           man:apachectl(8)
Jan 19 21:45:32 localhost ServiceCHKDeamon: Main PID: 22565 (httpd)
Jan 19 21:45:32 localhost ServiceCHKDeamon:   Status: "Processing requests..."
Jan 19 21:45:32 localhost ServiceCHKDeamon:    Tasks: 6
Jan 19 21:45:32 localhost ServiceCHKDeamon:   CGroup: /system.slice/httpd.service
Jan 19 21:45:32 localhost ServiceCHKDeamon:           ├─22565 /usr/sbin/httpd -DFOREGROUND
Jan 19 21:45:32 localhost ServiceCHKDeamon:           ├─22566 /usr/sbin/httpd -DFOREGROUND
Jan 19 21:45:32 localhost ServiceCHKDeamon:           ├─22567 /usr/sbin/httpd -DFOREGROUND
Jan 19 21:45:32 localhost ServiceCHKDeamon:           ├─22568 /usr/sbin/httpd -DFOREGROUND
Jan 19 21:45:32 localhost ServiceCHKDeamon:           ├─22569 /usr/sbin/httpd -DFOREGROUND
Jan 19 21:45:32 localhost ServiceCHKDeamon:           └─22570 /usr/sbin/httpd -DFOREGROUND
Jan 19 21:45:32 localhost ServiceCHKDeamon: UND
Jan 19 21:45:32 localhost ServiceCHKDeamon: Jan 19 21:45:27 localhost.local systemd[1]: Starting The Apache HTTP Server...
Jan 19 21:45:32 localhost ServiceCHKDeamon: Jan 19 21:45:27 localhost.local systemd[1]: Started The Apache HTTP Server.
Jan 19 21:45:32 localhost ServiceCHKDeamon: ########### CHECK HTTPD SERVER ###########
Jan 19 21:45:32 localhost ServiceCHKDeamon: * * * * Web Server : Running * * * *
~~~


위와 같이 특정 스크립트의 내용을 _/var/log/messages_ 에 등록함으로 특정 모니터링 소프트웨어에 등록하여 서비스 상태 체크를 손쉽게 설정 할 수 있습니다.   

# 참고 자료
* * * 

* man logger : [https://linux.die.net/man/1/logger](https://linux.die.net/man/1/logger)
* Oracle Document : [https://docs.oracle.com/cd/E19957-01/820-3203/log_syslog/index.html](https://docs.oracle.com/cd/E19957-01/820-3203/log_syslog/index.html)
