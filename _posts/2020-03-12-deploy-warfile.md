---
layout: post
title: "[Tomcat] Tomcat War file 배포"
description: " "
author: chhanz
date: 2020-03-12
tags: [tomcat]
category: tomcat
---

# SubPath 배포

1. `sample.war` 을 준비한다.   
2. `/var/lib/tomcat/webapps` 에 War File을 위치한다.   
3. Tomcat 서비스를 기동한다.   
4. `http://localhost:8080/sample` 으로 접근이 가능하다.   

# ROOT 로 서비스

1. `sample.war` 을 준비한다.    
2. `/var/lib/tomcat/webapps` 에 War File을 위치한다.   
3. `/var/lib/tomcat/webapps/sample.war` file 의 이름을 `ROOT.war` 로 변경한다.   
4. tomcat 서비스를 기동한다.   
5. `http://localhost:8080/`으로 접근이 가능하다.   
   
