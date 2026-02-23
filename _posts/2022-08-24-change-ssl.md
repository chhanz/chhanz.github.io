---
layout: post
title: "[SSL] Apache/Nginx/etc 인증서 교체 방법"
description: "https"
author: chhanz
date: 2022-08-24
tags: [devops]
category: devops
---

# SSL 인증서 교체 방법
## Apache 교체
Apache 의 경우,   
```bash
<VirtualHost *:443>
ServerName "지정한 서버인증서에 포함(지원)된 도메인"
SSLEngine on
SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1 (서버 환경에 따라서 선택적 적용)
SSLCertificateKeyFile /인증서파일경로/개인키 ex. sslcert.co.kr_xxxxx.key.pem
SSLCertificateFile /인증서파일경로/서버인증서 ex. sslcert.co.kr_xxxxx.crt.pem
SSLCertificateChainFile /인증서파일경로/체인인증서ex. chain-bundle.pem
SSLCACertificateFile /인증서파일경로/루트인증서 ex. AAACertificateServices.Root.crt.pem
</VirtualHost>
```

위와 같이 `SLCertificateKeyFile`, `SSLCertificateFile`, `SSLCertificateChainFile`, `SSLCACertificateFile` option 이 별도로 분리되어 있습니다.    
각각 option 형식에 맞는 SSL 인증서의 경로를 입력하고 Apache 를 재시작 합니다.    
* 설정 파일 참고 ([https://www.sslcert.co.kr/guides/Apache-SSL-Certificate-Install](https://www.sslcert.co.kr/guides/Apache-SSL-Certificate-Install))   
   
## Nginx 교체
Nginx 의 경우,    
```bash
server {
listen 443; (1.15 버젼 부터는 listen 443 ssl; 형식으로 변경됨)
ssl on; (1.15 버젼 부터는 옵션 지원 종료)
server_name www.sslcert.co.kr; (지정한 서버인증서에 포함(지원)된 도메인)
ssl_certificate_key /파일경로/sslcert.co.kr_xxxxx.key.pem; (개인키 파일 지정)
ssl_certificate /파일경로/sslcert.co.kr_xxxxx.ca-bundle.pem; (서버인증서+체인+루트 통합 unified 파일 지정)
ssl_protocols TLSv1.2; (서버 환경에 따라 선택적 적용)
 
location /
root path
}
```
Apache 와 달리 `ssl_certificate_key`, `ssl_certificate` option 으로 SSL 인증서르 관리합니다.    
RootCA, ChainCA 를 따로 추가 할 수가 없으므로 아래와 같은 방법으로 하나의 인증서로 Build 하는 과정이 필요합니다.   
   
```bash
$ cat ChainCA1.crt ChainCA2.crt RootCA.crt > Chain_RootCA_build.crt
```
위 파일은 일부 인증서 업체에서 사전에 빌드하여 제공하는 경우가 있습니다.    
   
```bash
$ cat STAR_chhanz_com.crt <(echo) Chain_RootCA_Bundle.crt  > STAR_chhanz_com_nginx.crt
$ cat [도메인 인증서] <(echo) [RootCA + ChainCA 인증서] > [도메인 인증서 newname]
```
위와 같은 방법으로 사용할 도메인 인증서를 앞에 오도록 지정하고 하나의 인증서로 만들어야 됩니다.   

* 설정 파일 참고 ([https://www.sslcert.co.kr/guides/NGINX-SSL-Certificate-Install](https://www.sslcert.co.kr/guides/NGINX-SSL-Certificate-Install))      
   
### 주의 사항
```console
-----END CERTIFICATE----------BEGIN CERTIFICATE-----
```
위와 같이 개행(`\n`)이 안되는 경우, 잘못 build 된 인증서이므로 확인이 필요합니다.    
```console
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
```
정상적으로 build 된 인증서는 위와 같이 정상적으로 개행(`\n`) 이 되어 있습니다.   
   
# ETC
대표적으로 Apache 혹은 Nginx 와 비슷한 경우가 많으며 해당 솔루션에서 필요로한 인증서 Type 을 build 하여 설정합니다.    
    
# 참고 자료
* [https://www.sslcert.co.kr/guides/](https://www.sslcert.co.kr/guides/)   
 