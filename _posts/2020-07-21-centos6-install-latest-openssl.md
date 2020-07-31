---
layout: post
title: "[Linux] CentOS6 OPENSSL 최신버전 설치"
description: " "
author: chhanz
date: 2020-07-21
tags: [linux]
category: linux
---

# CentOS6 에 OPENSSL 최신버전 설치
CentOS 6 에서는 openssl 1.0.1e-58.el6_10 까지만 지원하고 (Repository 에서 제공하는 Version)   
`https://www.openssl.org` 에서 제공하는 버전은 openssl-1.1.1g 입니다.   
    
CentOS 6 에서는 Source 설치를 해야지만 최신 버전 사용이 가능한 것입니다.   
   
# Requirement package
아래와 같이 필수 패키지를 설치합니다.   
```bash
$ yum install gcc make gcc-c++ perl perl-Test-Harness perl-Test-Simple zlib-devel
```
   
# Source 설치
설치 방법은 간단합니다.   
```bash
$ wget https://www.openssl.org/source/openssl-1.1.1g.tar.gz
$ cd openssl-1.1.1g
$ ./config
$ make
$ make test
$ make install
```
하지만 위와 같이 하면 `make test` 부분에서 ERROR 가 발생합니다.   
   
> Test::More version 0.96 required     
   
위와 같은 ERROR 이 발생하는데 CentOS6 에서 지원하는 `perl` 의 version 이 낮아서 그렇습니다.   
   
# perl source 설치
아래와 같이 `perl` 을 source 설치합니다.   
```bash
$ wget https://www.cpan.org/src/5.0/perl-5.32.0.tar.gz
$ tar -xzf perl-5.32.0.tar.gz
$ cd perl-5.32.0
$ ./Configure -des -Dprefix=/usr/local/perl-5.32
$ make
$ make test
$ make install
```
   
섫치가 완료되면 기존 `perl` 실행 파일을 bakcup 받고 최신 버전 `perl` 로 PATH 설정을 합니다.   
```bash
$ mv /usr/bin/perl perl_5_10
$ ln -s /usr/local/localperl/bin/perl perl
```
   
아래와 같이 최신 버전 `perl` 을 확인 할 수 있습니다.   
```bash
[root@fastvm-centos-6-10-108 /]# perl -v

This is perl 5, version 32, subversion 0 (v5.32.0) built for x86_64-linux

Copyright 1987-2020, Larry Wall

Perl may be copied only under the terms of either the Artistic License or the
GNU General Public License, which may be found in the Perl 5 source kit.

Complete documentation for Perl, including FAQ lists, should be found on
this system using "man perl" or "perldoc perl".  If you have access to the
Internet, point your browser at http://www.perl.org/, the Perl Home Page.

[root@fastvm-centos-6-10-108 /]#
```
   
# perl 설치 이후 재시도
라이브러리 PATH 설정을 합니다.   
```bash
$ cd /etc/ld.so.conf.d/
$ cat openssl-1.1.1g.conf
/usr/local/ssl/lib

$ ldconfig -v
```
   
openssl version 을 확인합니다.   
```bash   
$ cd /usr/local/ssl/bin
$ ./openssl version
OpenSSL 1.1.1g  21 Apr 2020
```
   
PATH 를 변경합니다.   
```bash
$ ln -s /usr/local/ssl/bin/openssl /usr/bin/openssl
$ ls -l $(which openssl)
lrwxrwxrwx. 1 root root 26 Jul 21 23:01 /usr/bin/openssl -> /usr/local/ssl/bin/openssl
```
   
최종 확인합니다.   
```bash
[root@fastvm-centos-6-10-108 ~]# openssl version
OpenSSL 1.1.1g  21 Apr 2020
[root@fastvm-centos-6-10-108 ~]#
```
   
설치가 완료는 되었으나, 개인적으론 CentOS 7 을 사용하는게 정신 건강에 같습니다 ㅎㅎㅎㅎ .......      
