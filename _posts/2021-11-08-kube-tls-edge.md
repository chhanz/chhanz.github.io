---
layout: post
title: "[Kubernetes] HTTPS ingress 적용 (use prometheus)"
description: ""
author: chhanz
date: 2021-11-08
tags: [kubernetes]
category: kubernetes
---

# HTTPS ingress 적용
이전에 배포한 `kube-prometheus` 의 ingress 를 TLS 적용하여 HTTPS 로 서비스 해보도록 하겠습니다.   
   
# TLS 방식
Kubernetes 에서 사용이 가능한 TLS 방식은 아래와 같습니다.   
아래 내용은 OpenShift 기준으로 작성된 내용이지만 이해하기 좋아서 첨부합니다.   
   
   <center><img src="/assets/images/post/2021-11-08-kube-tls/1.png" style="max-width: 95%; height: auto;"></center>      
이미지의 Router 는 Kubernetes 의 Ingress 와 동일하다고 보면 됩니다.   
   
> 1. Clear 방식 (clear to clear) : 일반적인 HTTP 서비스   
> 2. Edge 방식 (TLS to clear) : client 와 ingress 구간을 TLS 암호화하는 방식   
> 3. Re-encrypt 방식 (TLS1 to TLS2) : ingress 기점으로 TLS 암호화를 다르게 하는 방식(두번의 TLS 암호화)   
> 4. Pass-Through 방식 (TLS1 to TLS1) : Application 단에서 TLS 암호화 처리하는 방식   
   
# TLS 적용
위의 설명된 방식중 Edge 방식을 적용 해보도록 하겠습니다.   
```console
                               ┌──┐                        ┌──────────────────┐
                               │  │                        │                  │
                               │  │                        │ ┌─────┐          │
┌───────────┐        HTTPS     │  │        HTTP            │ │APP1 │          │
│ Client    │  ───────────────►│  │ ────────────────────►  │ └─────┘          │
└───────────┘                  │  │                        │        ┌──────┐  │
                               │  │                        │        │ APP2 │  │
                               │  │                        │        └──────┘  │
                               │  │                        │                  │
                               └──┘                        └──────────────────┘
                              Ingress                              Pod 
```
Diagram 을 그려본다면 위와 같은 방식으로 구현된다고 생각하면 좋습니다.   
   
## TLS Secret 생성
아래와 같이 TLS Secret 을 생성합니다.   

```console
#!/bin/bash
 
BASECRT=`base64 -w0 STAR_chhan_testdom.crt`
BASEKEY=`base64 -w0 STAR_chhan_testdom.key`
 
cat << EOF > STAR_chhan_testdom-tls-secret.yml
apiVersion: v1
data:
  tls.crt: ${BASECRT}
  tls.key: ${BASEKEY}
kind: Secret
metadata:
  name: prometheus-tls-secret
  namespace: monitoring
type: kubernetes.io/tls
EOF
 
echo "done generate file 'STAR_chhan_testdom-tls-secret.yml'"
```
`crt` 와 `key` 파일을 `base64` 로 인코딩을 하여 yaml 을 편하게 생성하게 위해 스크립트를 작성했습니다.   
(TLS 는 wildcard TLS 입니다.)   
   
```bash
$ cat STAR_chhan_testdom-tls-secret.yml
apiVersion: v1
data:
  tls.crt: Cxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  tls.key: Kxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
kind: Secret
metadata:
  name: prometheus-tls-secret
  namespace: monitoring
type: kubernetes.io/tls
```
생성된 secret.yml 을 이용하여 TLS Secret 을 생성합니다.   
   
```bash
$ kubectl create -f STAR_chhan_testdom-tls-secret.yml
secret/prometheus-tls-secret created
```
   
## Ingress 생성
아래와 같이 Ingress 에 TLS 를 적용하여 Edge 방식을 사용하는 Ingress 를 생성합니다.   
```console
$ cat << EOF > prometheus-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    kubernetes.io/ingress.class: nginx
  name: prometheus-ingress
  namespace: monitoring
spec:
  tls:
    - hosts:
        - "*.chhanz.testdom"
    - secretName: prometheus-tls-secret
  rules:
  - host: monitor-prometheus.chhanz.testdom
    http:
      paths:
      - pathType: Prefix
        path: "/"
        backend:
          service:
            name: prometheus-k8s
            port:
              number: 9090
```
   
```bash
$ kubectl create -f prometheus-ingress.yaml
```
Ingress 생성   

# TLS 인증 확인
아래와 같이 Client 에서 `openssl` 명령어 혹은 Web Browser 를 통해 확인이 가능합니다.   
```bash
chhan@chhanPC:/mnt/c/Users/chhanz$ openssl s_client -servername monitor-prometheus.chhanz.testdom --connect monitor-prometheus.chhanz.testdom:443

...TL;DR...

---
Certificate chain
 0 s:CN = *.chhanz.testdom                                                                                      <<<
   i:C = SXXXXXX, ST = SXXXXXX, L = SXXXXXX, O = SXXXXXX, CN = SXXXXXX
---

...TL;DR...

```
<center><img src="/assets/images/post/2021-11-08-kube-tls/2.jpg" style="max-width: 95%; height: auto;"><br>Web Browser TLS 인증서 내용 확인</center>    

# NGINX Ingress 의 주요 annotations   
   
|annotations|속성|
|---|---|
|`nginx.ingress.kubernetes.io/backend-protocol: HTTPS`|Ingress 이후, Backend 구간을 HTTPS 통신을 하도록 하는 옵션|
|`nginx.ingress.kubernetes.io/ssl-redirect`|기본적으로 NGINX Ingress 는 TLS 가 활성화 되면 HTTPS 로 Redirect 하는데 해당 옵션을 통해 비활성화를 할 수 있다. (기본값 true) |
|`nginx.ingress.kubernetes.io/force-ssl-redirect`|강제로 HTTPS 로 Redirect 하는 옵션, TLS 인증서가 없는 경우에도 강제로 HTTPS 로 Redirect 할 수 있다.|
   
이 외 annotations 는 [문서](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/) 에서 확인이 가능합니다.   

# 참고 자료
* Route : [https://cloud.redhat.com/blog/self-serviced-end-to-end-encryption-approaches-for-applications-deployed-in-openshift](https://cloud.redhat.com/blog/self-serviced-end-to-end-encryption-approaches-for-applications-deployed-in-openshift)   
* [https://kubernetes.io/ko/docs/concepts/services-networking/ingress/#tls](https://kubernetes.io/ko/docs/concepts/services-networking/ingress/#tls)   
* [https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/)   