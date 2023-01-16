---
layout: post
title: "[CloudWatch] collectd: Available write targets:: [none]" 
description: ""
author: chhanz
date: 2023-01-16
tags: [aws]
category: aws
---

CloudWatch collectd 구성 [(문서)](https://aws.amazon.com/ko/blogs/aws/new-cloudwatch-plugin-for-collectd/)를 테스트하는 도중 아래와 같은 메시지가 대량으로 발생됨.   
```console
abc de 12:34:56 ip-172-31-11-123 collectd[13944]: Available write targets:: [none]
abc de 12:34:56 ip-172-31-11-123 collectd[13944]: Available write targets:: [none]
abc de 12:34:56 ip-172-31-11-123 collectd[13944]: Available write targets:: [none]
abc de 12:34:56 ip-172-31-11-123 collectd[13944]: Available write targets:: [none]
abc de 12:34:56 ip-172-31-11-123 collectd[13944]: Available write targets:: [none]
```
   
찾아보니 syslog 의 LogLevel 을 수정하면 위 로그를 제외시키고 필수적인 로그만 수집이 가능하다.   

```bash
$ sudo vi /etc/collectd.d/loglvl.conf
<Plugin syslog>
  LogLevel notice
</Plugin>

$ sudo systemctl restart collectd
```

위와 같이 LogLevel 을 수정하고 대량의 collectd 로그는 사라짐.

# 참고 자료
* [https://collectd.org/documentation/manpages/collectd.conf.5.shtml#plugin_syslog](https://collectd.org/documentation/manpages/collectd.conf.5.shtml#plugin_syslog)   
* [https://blog.bassbone.tokyo/archives/1184](https://blog.bassbone.tokyo/archives/1184)   