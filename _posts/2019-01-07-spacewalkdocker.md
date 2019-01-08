---
layout: post
title: "Spacewalk latest Docker Image 제작기"
description: " "
author: chhanz
date: 2019-01-07
tags: [docker, spacewalk]
category: docker
---

# Spacewalk latest Docker Image 제작기
* * * 

안녕하세요? chhanz 입니다.   
고객사의 요청으로 Spacewalk 로 docker container 형태로 운영을 해야되는 요건이 생겨서,   
image를 만들기 시작 하였습니다...... ;(    

# Spacewalk 란?
* * *
Spacewalk는 오픈 소스 Linux 시스템 관리 솔루션입니다.   
Red Hat Satellite 제품이 파생 된 업스트림 커뮤니티 프로젝트입니다.

<center><img src="/assets/images/post/2019-01-07-spacewalkdocker/1.png" height="550"> <br> 
<a href="https://spacewalkproject.github.io/index.html">@Go to detail</a>  <br>  
<a href="https://www.slideshare.net/ienvyou/ss-31321783">@[오픈소스컨설팅]클라우드자동화 및 운영효율화방안</a><br> </center>   

# 쉽게 가자...
* * * 
docker 의 장점이 뭡니까!  
docker hub의 많은 offiaical image 아닙니까!   

열심히 docker image를 찾아보았습니다.   
하지만...

```
# docker search spacewalk
INDEX       NAME                                            DESCRIPTION                                     STARS     OFFICIAL   AUTOMATED
docker.io   docker.io/bashell/spacewalk                     Spacewalk Docker Image                          7                    [OK]
docker.io   docker.io/ruo91/spacewalk                       Spacewalk is an open source Linux systems ...   4                    [OK]
docker.io   docker.io/pajinek/docker-spacewalk              Spacewalk in Docker (without systemd)           3                    [OK]
docker.io   docker.io/egonzalez90/spacewalk                 Spacewalk docker image                          1                    [OK]
```

OFFICIAL 은 없고, 그나마 STARS 는 7개 뿐이고...   
내가 만들어야 겠다... ;)   
이렇게 시작 되었습니다.  

# Docker image 를 만들어보자!
* * * 

먼저 참고할 Dockerfile 은 docker hub 에서 가져왔습니다.   
> https://bitbucket.org/bashell-com/spacewalk    

Dockerfile 은 아래와 같이 수정하였습니다.

~~~
# Dockerfile - Spacewalk
#
# - Build
# 
# docker build --rm -t spacewalk .
#
# - Run
# docker run --privileged=true -d --name="spacewalk" -p 80:80 -p 443:443 spacewalk

# 1. Base images
FROM     centos:6
MAINTAINER chhanz <chhan@osci.kr>

# 2. Set the environment variable
WORKDIR /opt

# 3. Add the epel, spacewalk, jpackage, supervisord
ADD conf/group_spacewalkproject-epel6-addons-epel-6.repo /etc/yum.repos.d/epel6-addons-epel-6.repo
ADD conf/group_spacewalkproject-java-packages-epel-7.repo /etc/yum.repos.d/java-packages-epel-7.repo
RUN yum install -y epel-release \
 && rpm -Uvh https://copr-be.cloud.fedoraproject.org/results/@spacewalkproject/spacewalk-2.8/epel-6-x86_64/00736372-spacewalk-repo/spacewalk-repo-2.8-11.el6.noarch.rpm \
 && yum check-update ; yum upgrade -y \
 && yum install -y spacewalk-setup-postgresql spacewalk-postgresql tomcat-native python-setuptools python-pip \
 && yum clean all \
 && pip install supervisor && pip install --upgrade meld3==0.6.10 && mkdir /etc/supervisord.d \
 && rm -rf /root/.cache \
 && cat /usr/share/zoneinfo/Asia/Seoul > /etc/localtime

# 4. Install supervisord config
ADD conf/supervisord.conf /etc/supervisord.d/supervisord.conf

# 5. Install spacewalk initial and running scripts
ADD conf/answer.txt   /opt/answer.txt
ADD conf/spacewalk.sh /opt/spacewalk.sh

# 6. Start supervisord
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.d/supervisord.conf"]

# System Log
VOLUME /var/log

# PostgreSQL Data
VOLUME /var/lib/pgsql/data

# RPM repository
VOLUME /var/satellite

# Bootstrap directory
VOLUME /var/www/html/pub

# Port
EXPOSE 80 443
~~~

수정된 내용은 아래와 같습니다.
> 1. Update Spacewalk (Spacewalk 2.6 > Spacewalk 2.8)
2. Spacewalk 2.8 Repository 로 변경
3. spacewalk-setup 에 필요한 Answer file 을 최신버전의 요건에 맞게 수정하였습니다.
4. Container  로 실행할때, Spacewalk 가 정상적으로 시작되는지 확인이 가능하도록 내부 Script 를 수정하였습니다.
5. supervisord 를 통해, Spacewalk 를 시작하는데 해당 Log 를 debug 수준으로 설정해서 상태를 확인하는 것이 더욱 쉽게 만들었습니다.
6. localtime 을 Asia/Seoul 으로 설정 하였습니다.

위와 같이 수정한 Dockerfile 를 Build 합니다.


# Build
* * * 

Dockerfile 및 image 에 추가될 file 이 있는 Directory 에서 Build 를 진행합니다.

~~~
# docker build --rm -t spacewalk .
~~~

많은 시간이 소요되면서 Build 가 진행 됩니다.   

~~~
# docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
spacewalk           latest             f0e26b8230ad        13 days ago         1.04 GB
~~~

위와 같이 Build 가 완료 되었습니다.


# Run 
* * * 

Build 가 된 이미지를 실행합니다.   
먼저 Container 가 종료되고, 제거가 되더라도 Spacewalk 데이터를 보존 할 수 있게 Volume 으로 사용될 경로를 생성합니다.   

~~~
mkdir -p /data/var/lib/pgsql/data
mkdir -p /data/var/satellite
mkdir -p /data/var/www/html/pub
mkdir -p /data/var/log/tomcat6
mkdir -p /data/var/log/httpd
mkdir -p /data/var/log/cobbler

chown 26:26 /data/var/lib/pgsql/data
chmod 777 -R /data/var
~~~

Volume 생성이 다 되었다면, 

~~~
# docker run --privileged=true -d --name="spacewalk" -p 80:80 -p 443:443 -v /data/var/log:/var/log -v /data/var/lib/pgsql/data:/var/lib/pgsql/data -v /data/var/satellite:/var/satellite -v /data/var/www/html/pub:/var/www/html/pub spacewalk
~~~

위 명령으로 Container 를 시작합니다.

https://(Docker Host IP)  로 접속합니다.   

아래와 같이 Spacewalk 화면을 확인 할 수 있습니다.   

<img src="/assets/images/post/2019-01-07-spacewalkdocker/0.png" height="400">   

# 마치며
* * *

위와 같이 나만의 특별한 Docker Image 를 생성 할 수 있었습니다.    
해당 Dockerfile 및 기타 필요한 file, 쉽게 Spacewalk 를 운영 할 수 있도록 만든 Script 들을 github 에 올려놨습니다.

~~~
# git clone https://github.com/chhanz/spacewalk-docker-img.git
~~~

앞으로도 Opensource Software 를 손쉽게 사용 할 수 있도록 노력 하겠습니다.

감사합니다.

## 참고 자료
* * *
* Base Dockerfile : [https://bitbucket.org/bashell-com/spacewalk](https://bitbucket.org/bashell-com/spacewalk)     
* Spacewalk Document : [https://spacewalkproject.github.io/documentation.html](https://spacewalkproject.github.io/documentation.html)   
* chhanz github : [https://github.com/chhanz/spacewalk-docker-img](https://github.com/chhanz/spacewalk-docker-img)
* 해당 포스팅은 오픈소스컨설팅 기술블로그에서도 확인하실 수 있습니다! : [https://tech.osci.kr/spacewalk/2019/01/07/55869620/](https://tech.osci.kr/spacewalk/2019/01/07/55869620/)
