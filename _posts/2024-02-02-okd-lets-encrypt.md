---
layout: post
title: "[OKD 4.14] OKD Cluster 에 Let’s Encrypt Certificates 설치"
description: " "
author: chhanz
date: 2024-02-22
tags: [kubernetes,openshift]
category: openshift
---

![](https://letsencrypt.org/images/letsencrypt-logo-horizontal.svg)       
# Let’s Encrypt Certificates 
[Let's Encrypt](https://letsencrypt.org/)는 사용자에게 무료로 TLS 인증서를 발급해주는 비영리기관입니다. 몇 가지 TLS 인증서 종류 중에서 완전 자동화가 가능한 DV (Domain Validated, 도메인 확인) 인증서를 무료로 발급할 수 있습니다.   
   
위 인증서를 발급 받고 OKD Cluster 에 설치하여 콘솔 및 Route 에서 HTTPS 서비스를 할 수 있도록 와일드 카드 인증서를 발급 받아보았습니다.
   
# 발급
아래와 같이 인증서 발급을 위해 [acme.sh](https://github.com/neilpang/acme.sh) repository 를 clone 합니다.   
   
```bash
$ git clone https://github.com/neilpang/acme.sh
```
   
먼저 스크립트는 인증서 발급 과정중에 발생되는 도메인 소유권 검증 과정을 자동으로 수행을 할 수 있습니다.   
예를 들면 AWS 의 Route53 을 사용하는 경우, AWS CLI ACCESS KEY 와 같은 정보를 입력하면 자동으로 레코드를 등록하여 도메인 소유권 검증 과정이 발생됩니다.   

이번 글에서는 위와 같은 자동으로 레코드를 등록하는 과정을 수동으로 하여 자동화된 과정을 조금 더 자세히 살펴보겠습니다.   
   
아래 명령어로 인증서를 발급을 요청합니다.   
```bash
$ cd acme.sh/
$ ./acme.sh --issue -d api.lab.chhanz.xyz -d *.apps.lab.chhanz.xyz -m chhanz@chhanz.xyz \
--yes-I-know-dns-manual-mode-enough-go-ahead-please --dns --server letsencrypt

[Thu Feb 22 00:24:56 UTC 2024] Using CA: https://acme-v02.api.letsencrypt.org/directory
[Thu Feb 22 00:24:56 UTC 2024] Create account key ok.
[Thu Feb 22 00:24:56 UTC 2024] Registering account: https://acme-v02.api.letsencrypt.org/directory
[Thu Feb 22 00:24:58 UTC 2024] Registered
...
[Thu Feb 22 00:25:01 UTC 2024] Getting webroot for domain='api.lab.chhanz.xyz'
[Thu Feb 22 00:25:01 UTC 2024] Getting webroot for domain='*.apps.lab.chhanz.xyz'
[Thu Feb 22 00:25:01 UTC 2024] Add the following TXT record:
[Thu Feb 22 00:25:01 UTC 2024] Domain: '_acme-challenge.api.lab.chhanz.xyz'
[Thu Feb 22 00:25:01 UTC 2024] TXT value: 'UkdnEI3wlI88Btjej70O_0iQM6r9ACcT6qHQF9dc0dU'
[Thu Feb 22 00:25:01 UTC 2024] Please be aware that you prepend _acme-challenge. before your domain
[Thu Feb 22 00:25:01 UTC 2024] so the resulting subdomain will be: _acme-challenge.api.lab.chhanz.xyz
[Thu Feb 22 00:25:01 UTC 2024] Add the following TXT record:
[Thu Feb 22 00:25:01 UTC 2024] Domain: '_acme-challenge.apps.lab.chhanz.xyz'
[Thu Feb 22 00:25:01 UTC 2024] TXT value: 'H5ieT06TSQnbFZ0YH-wNqxvt-8zAmvsVmowm0iLVlpU'
...
``` 
위와 같이 도메인 소유권 검증을 위해 특정 TXT 레코드에 대한 값 등록을 확인하고 있습니다.   
위 레코드를 사용하는 DNS (Route53) 에 레코드를 등록합니다.   

등록이 완료되고 TXT 레코드 확인이 가능한지 확인합니다.   
   
```bash
$ dig -t txt _acme-challenge.api.lab.chhanz.xyz +short
"UkdnEI3wlI88Btjej70O_0iQM6r9ACcT6qHQF9dc0dU"
$ dig -t txt _acme-challenge.apps.lab.chhanz.xyz +short
"H5ieT06TSQnbFZ0YH-wNqxvt-8zAmvsVmowm0iLVlpU"
```
   
레코드 확인이 가능하면 `--renew` 를 이용하여 인증서 발급을 시도합니다.   
```bash
$ ./acme.sh --renew -d api.lab.chhanz.xyz -d *.apps.lab.chhanz.xyz -m chhanz@chhanz.xyz \
--yes-I-know-dns-manual-mode-enough-go-ahead-please --dns --server letsencrypt

[Thu Feb 22 00:34:16 UTC 2024] The domain 'api.lab.chhanz.xyz' seems to have a ECC cert already, lets use ecc cert.
[Thu Feb 22 00:34:16 UTC 2024] Renew: 'api.lab.chhanz.xyz'
[Thu Feb 22 00:34:16 UTC 2024] Renew to Le_API=https://acme-v02.api.letsencrypt.org/directory
[Thu Feb 22 00:34:17 UTC 2024] Using CA: https://acme-v02.api.letsencrypt.org/directory
[Thu Feb 22 00:34:17 UTC 2024] Multi domain='DNS:api.lab.chhanz.xyz,DNS:*.apps.lab.chhanz.xyz'
[Thu Feb 22 00:34:17 UTC 2024] Verifying: api.lab.chhanz.xyz
[Thu Feb 22 00:34:19 UTC 2024] Pending, The CA is processing your order, please just wait. (1/30)
[Thu Feb 22 00:34:22 UTC 2024] Success
[Thu Feb 22 00:34:22 UTC 2024] Verifying: *.apps.lab.chhanz.xyz
[Thu Feb 22 00:34:23 UTC 2024] Pending, The CA is processing your order, please just wait. (1/30)
[Thu Feb 22 00:34:27 UTC 2024] Success
[Thu Feb 22 00:34:27 UTC 2024] Verify finished, start to sign.
[Thu Feb 22 00:34:27 UTC 2024] Lets finalize the order.
...
[Thu Feb 22 00:34:30 UTC 2024] Cert success.
...
[Thu Feb 22 00:34:30 UTC 2024] Your cert is in: /home/ec2-user/.acme.sh/api.lab.chhanz.xyz_ecc/api.lab.chhanz.xyz.cer
[Thu Feb 22 00:34:30 UTC 2024] Your cert key is in: /home/ec2-user/.acme.sh/api.lab.chhanz.xyz_ecc/api.lab.chhanz.xyz.key
[Thu Feb 22 00:34:30 UTC 2024] The intermediate CA cert is in: /home/ec2-user/.acme.sh/api.lab.chhanz.xyz_ecc/ca.cer
[Thu Feb 22 00:34:30 UTC 2024] And the full chain certs is there: /home/ec2-user/.acme.sh/api.lab.chhanz.xyz_ecc/fullchain.cer
```
   
위와 같이 인증서 발급이 완료가 되면 OKD Cluster 에 설치가 가능한 인증서 형식으로 추출합니다.   
   
```bash
$ mkdir ssl
$ ./acme.sh --install-cert -d api.lab.chhanz.xyz -d *.apps.lab.chhanz.xyz \
 --cert-file ssl/cert.pem \
 --key-file ssl/key.pem \
 --fullchain-file ssl/fullchain.pem \
 --ca-file ssl/ca.cer
[Thu Feb 22 00:38:12 UTC 2024] The domain 'api.lab.chhanz.xyz' seems to have a ECC cert already, lets use ecc cert.
[Thu Feb 22 00:38:12 UTC 2024] Installing cert to: ssl/cert.pem
[Thu Feb 22 00:38:12 UTC 2024] Installing CA to: ssl/ca.cer
[Thu Feb 22 00:38:12 UTC 2024] Installing key to: ssl/key.pem
[Thu Feb 22 00:38:12 UTC 2024] Installing full chain to: ssl/fullchain.pem
```
   
`ssl/` 하위 경로로 인증서가 저장된 것을 볼 수 있습니다.   
   
# 인증서 설치
아래와 같이 `oc` 명령어를 이용하여 route 에 인증서를 설치합니다.   
   
```bash
$ cd ssl/

$ oc create secret tls router-certs --cert=fullchain.pem --key=key.pem -n openshift-ingress
secret/router-certs created

$ oc patch ingresscontroller default -n openshift-ingress-operator --type=merge '--patch={"spec": { "defaultCertificate": { "name": "router-certs" }}}'
ingresscontroller.operator.openshift.io/default patched

$ oc create secret tls api-certs --cert=fullchain.pem --key=key.pem -n openshift-config
secret/api-certs created

$ oc patch apiserver cluster --type merge '--patch={"spec": {"servingCerts": {"namedCertificates": [ { "names": [  ""  ], "servingCertificate": {"name": "api-certs" }}]}}}'
apiserver.config.openshift.io/cluster patched
```
   
인증서 설치가 완료되고 일정시간 route pod 가 patch 가 수행이 됩니다.   
pod 교체가 완료가 되면 아래와 같이 인증서가 설치되어 HTTPS 를 TLS 가 적용된 상태를 사용 할 수 있습니다.   
   
```bash
$ curl -Iv https://console-openshift-console.apps.lab.chhanz.xyz
...
* Server certificate:
*  subject: CN=api.lab.chhanz.xyz
*  start date: Feb  5 10:52:02 2024 GMT
*  expire date: May  5 10:52:01 2024 GMT
*  subjectAltName: host "console-openshift-console.apps.lab.chhanz.xyz" matched cert's "*.apps.lab.chhanz.xyz"
*  issuer: C=US; O=Let's Encrypt; CN=R3
*  SSL certificate verify ok.
```
   
# 참고 문서
+ [https://www.redhat.com/en/blog/requesting-and-installing-lets-encrypt-certificates-for-openshift-4](https://www.redhat.com/en/blog/requesting-and-installing-lets-encrypt-certificates-for-openshift-4)   