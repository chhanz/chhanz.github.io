---
layout: post
title: "[Amazon Linux 2023] Certbot 을 이용하여 nginx 에 HTTPS 적용" 
description: ""
author: chhanz
date: 2023-07-09
tags: [linux, aws]
category: linux
---
![](https://certbot.eff.org/assets/certbot-logo-1A-6d3526936bd519275528105555f03904956c040da2be6ee981ef4777389a4cd2.svg)    
# Certbot 이란? 
Certbot은 무료로 TLS 인증서를 발급해주는 비영리기관인 Let's encrypt 를 이용해서 TLS 인증서를 발급, 갱신할 수 있게 도와주는 오픈 소스 프로그램입니다.   
   
## 테스트 환경
Amazon Linux 2023 에서 HTTP (80) 으로 운영중인 Nginx 에 HTTPS (443) 을 적용하도록 하겠습니다.   
   
# Nginx 설정
Nginx 의 설정은 아래 설정만 반영된 기본적은 설정입니다.   
```console
# cat /etc/nginx/nginx.conf
...
    server {
        listen       80;
        listen       [::]:80;
        server_name  test.chhanz.xyz;
        root         /usr/share/nginx/html;
...
```
   
# Certbot 설치
Amazon Linux 2023 에서는 따로 `rpm` package 를 미제공하고 있으므로 Python package 관리 도구인 `pip` 으로 Certbot 을 설치합니다.   
   
## Python venv 생성
아래와 같이 Python venv 를 생성합니다.   
```bash
[root@ip-172-31-52-223 ~]# python3 -m venv /opt/certbot

[root@ip-172-31-52-223 ~]# source /opt/certbot/bin/activate
```
   
## install package
아래와 같이 `certbot` , `certbot-nginx` 를 설치합니다.   
```bash
(certbot) [root@ip-172-31-52-223 ~]# pip install -U pip

(certbot) [root@ip-172-31-52-223 ~]# pip install certbot certbot-nginx
```
   
# Certbot 을 이용한 인증서 발급 및 Nginx 설정
아래와 같이 certbot 명령어를 이용하면 자동으로 인증서 발급 및 Nginx 에 HTTPS 설정을 추가합니다.   
   
```bash
(certbot) [root@ip-172-31-52-223 ~]# certbot --nginx
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Enter email address (used for urgent renewal and security notices)
 (Enter 'c' to cancel): chhanz@chhanz.xyz    <<<----!!! 갱신 알림 및 보안 관련 알림을 위한 이메일 설정

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Please read the Terms of Service at
https://letsencrypt.org/documents/LE-SA-v1.3-September-21-2022.pdf. You must
agree in order to register with the ACME server. Do you agree?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o: y              <<<----!!! 약관 동의 설정

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Would you be willing, once your first certificate is successfully issued, to
share your email address with the Electronic Frontier Foundation, a founding
partner of the Let's Encrypt project and the non-profit organization that
develops Certbot? We'd like to send you email about our work encrypting the web,
EFF news, campaigns, and ways to support digital freedom.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o: n               <<<----!!! 정보 공유 및 이메일 정보 수신 동의 설정
Account registered.

Which names would you like to activate HTTPS for?
We recommend selecting either all domains, or all domains in a VirtualHost/server block.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1: test.chhanz.xyz
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Select the appropriate numbers separated by commas and/or spaces, or leave input
blank to select all options shown (Enter 'c' to cancel): 1  <<<----!!! HTTPS 적용 도메인 설정
Requesting a certificate for test.chhanz.xyz

Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/test.chhanz.xyz/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/test.chhanz.xyz/privkey.pem
This certificate expires on 2023-10-07.
These files will be updated when the certificate renews.

Deploying certificate
Successfully deployed certificate for test.chhanz.xyz to /etc/nginx/nginx.conf
Congratulations! You have successfully enabled HTTPS on https://test.chhanz.xyz

NEXT STEPS:
- The certificate will need to be renewed before it expires. Certbot can automatically renew the certificate in the background, but you may need to take steps to enable that functionality. See https://certbot.org/renewal-setup for instructions.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
If you like Certbot, please consider supporting our work by:
 * Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
 * Donating to EFF:                    https://eff.org/donate-le
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```
   
# Nginx 설정 변경 사항
`certbot` 에서 자동으로 인증서 발급이 완료되면 자동으로 `nginx.conf` 설정을 업데이트합니다.   
아래는 기존 설정 파일과 비교하여 추가된 내용입니다.    
```diff
(certbot) [root@ip-172-31-52-223 ~]# diff /etc/nginx/nginx.conf /etc/nginx/nginx.conf.default
37a38,39
>         listen       80;
>         listen       [::]:80;
51,59c53
<
<     listen [::]:443 ssl ipv6only=on; # managed by Certbot
<     listen 443 ssl; # managed by Certbot
<     ssl_certificate /etc/letsencrypt/live/test.chhanz.xyz/fullchain.pem; # managed by Certbot
<     ssl_certificate_key /etc/letsencrypt/live/test.chhanz.xyz/privkey.pem; # managed by Certbot
<     include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
<     ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
<
< }
---
>     }
88,102c82
<
<
<     server {
<     if ($host = test.chhanz.xyz) {
<         return 301 https://$host$request_uri;
<     } # managed by Certbot
<
<
<         listen       80;
<         listen       [::]:80;
<         server_name  test.chhanz.xyz;
<     return 404; # managed by Certbot
<
<
< }}
---
> }
```
   
# 인증서 적용 확인
아래와 같이 `https://test.chhanz.xyz` (HTTPS)로 접근이 된 것을 볼 수 있습니다.   
![](/assets/images/post/2023-07-09-al2023-certbot-nginx/1.jpg)   
   
아래와 같이 Let's encrypt 발급된 TLS 인증서인 것을 볼 수 있습니다.    
![](/assets/images/post/2023-07-09-al2023-certbot-nginx/2.jpg)   
   
# 인증서 자동 갱신 설정
아래와 같이 자동 갱신을 위한 스크립트를 `crontab` 에 설정합니다.   
참고로 기본적으로 Amazon Linux 2023 에는 `crontab` 이 설치가 안되어 있습니다.   
   
아래 문서를 참고하여 crontab 을 설치하면 해당 명령어 사용이 가능합니다.   
* [https://chhanz.github.io/linux/2023/05/15/al2023-crontab/](https://chhanz.github.io/linux/2023/05/15/al2023-crontab/)   
   

아래와 같이 인증서 갱신 스크립트를 생성합니다.   
```bash
(certbot) [root@ip-172-31-52-223 ~]# cat /opt/certbot/renew.sh
#!/bin/bash

source /opt/certbot/bin/activate
certbot renew | logger -t certbot
```
   
자동 갱신 스크립트에 실행 권한을 부여합니다.   
```bash
(certbot) [root@ip-172-31-52-223 ~]# chmod u+x /opt/certbot/renew.sh
```
   
아래와 같이 `crontab` 에 매달 1일 00 시 (UTC) 에 인증서 자동 갱신을 수행하도록 설정합니다.   
```bash
(certbot) [root@ip-172-31-52-223 ~]# crontab -l
0 0 1 * * /opt/certbot/renew.sh
```
    
위 스크립트가 수행이 되면 아래와 같이 `journalctl` 로그가 기록 됩니다.   
```bash
(certbot) [root@ip-172-31-52-223 ~]# journalctl -e
...
Jul 09 05:16:55 ip-172-31-52-223.ap-northeast-2.compute.internal certbot[25772]:
Jul 09 05:16:55 ip-172-31-52-223.ap-northeast-2.compute.internal certbot[25772]: - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Jul 09 05:16:55 ip-172-31-52-223.ap-northeast-2.compute.internal certbot[25772]: Processing /etc/letsencrypt/renewal/test.chhanz.xyz.conf
Jul 09 05:16:55 ip-172-31-52-223.ap-northeast-2.compute.internal certbot[25772]: - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Jul 09 05:16:55 ip-172-31-52-223.ap-northeast-2.compute.internal certbot[25772]: Certificate not yet due for renewal
Jul 09 05:16:55 ip-172-31-52-223.ap-northeast-2.compute.internal certbot[25772]:
Jul 09 05:16:55 ip-172-31-52-223.ap-northeast-2.compute.internal certbot[25772]: - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Jul 09 05:16:55 ip-172-31-52-223.ap-northeast-2.compute.internal certbot[25772]: The following certificates are not due for renewal yet:
Jul 09 05:16:55 ip-172-31-52-223.ap-northeast-2.compute.internal certbot[25772]:   /etc/letsencrypt/live/test.chhanz.xyz/fullchain.pem expires on 2023-10-07 (skipped)
Jul 09 05:16:55 ip-172-31-52-223.ap-northeast-2.compute.internal certbot[25772]: No renewals were attempted.
Jul 09 05:16:55 ip-172-31-52-223.ap-northeast-2.compute.internal certbot[25772]: - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```
   
# 참고 자료
* [https://certbot.eff.org/instructions?ws=nginx&os=pip](https://certbot.eff.org/instructions?ws=nginx&os=pip)   
