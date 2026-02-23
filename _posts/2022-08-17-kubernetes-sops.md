---
layout: post
title: "[Kubernetes] SOPS(Secrets OPerationS) Guide"
description: "Kubernetes Secret/ConfigMap 암호화"
author: chhanz
date: 2022-08-17
tags: [kubernetes]
category: kubernetes
---

# SOPS(Secrets OPerationS) 란?
`sops` 는 YAML, JSON, ENV, INI, BINARY 형식의 파일 암호화를 지원하고 AWS KMS, GCP KMS, Azure Key Vault, age 등을 이용하여 암호화하는 파일 편집기 입니다.   

![출처 : https://github.com/mozilla/sops](/assets/images/post/2022-08-17-sops/demo.gif)
    
# vs `kubeseal`   
GitOps 를 하다보면 Secret 혹은 API Token, Key 등을 git repository 에 실수로 Push 하여 침해 사고를 겪는 경우가 많이 발생 됩니다.    
그리하여 `kubeseal` 이라는 Sealed Secret 도구를 이용하여 `ConfigMap` 혹은 `Secret` 을 Sealed 하여 Git 에 Push 하는 방식을 선택하기도 합니다.   
   
`kubeseal` 도 보안을 강화하는 장점이 있지만,   
GitOps 를 위해 초기 보안 강화 도입이 목적이라면 `SOPS` 가 더 편리하고 좋을 것으로 보입니다.    
    
이유는 아래와 같습니다.    
* `kubeseal` 은 Kubernetes Cluster 에 CRD 와 Operator 를 배포해야 됩니다.   
* 원본 Yaml 을 Sealed 하는 과정 후, 제거를 안한 원본 Yaml 을 실수로 Git push 하는 경우가 실수가 발생 할 수 있습니다.    
   
# SOPS 설치
SOPS 설치는 아래와 같은 방식으로 진행합니다.    
    
```bash
(test) root@testvm-c7 ~/chhan/rpm $ wget https://github.com/mozilla/sops/releases/download/v3.7.3/sops-3.7.3-1.x86_64.rpm
(test) root@testvm-c7 ~/chhan/rpm $ yum localinstall -y sops-3.7.3-1.x86_64.rpm

(test) root@testvm-c7 ~/chhan/rpm $ rpm -ql sops-3.7.3-1.x86_64
/usr/local/bin/sops
```
   
* Release : [https://github.com/mozilla/sops/releases](https://github.com/mozilla/sops/releases)   
   
# Age 설치
SOPS 에서 사용 가능한 암호화 방식중 Local 에서 바로 암호화 하는 방식을 이용하기 위해 `Age` 를 설치하도록 합니다.    
    
```bash
(test) root@testvm-c7 ~/chhan/rpm $ wget https://github.com/FiloSottile/age/releases/download/v1.0.0/age-v1.0.0-linux-amd64.tar.gz
(test) root@testvm-c7 ~/chhan/rpm $ tar xzvf age-v1.0.0-linux-amd64.tar.gz
(test) root@testvm-c7 ~/chhan/rpm $ cd age/
(test) root@testvm-c7 ~/chhan/rpm/age $ cp age* /usr/local/bin
(test) root@testvm-c7 ~/chhan/rpm/age $ ls -la /usr/local/bin | grep age
-rwxr-xr-x  1 root root   4453430 Aug 16 15:23 age
-rwxr-xr-x  1 root root   2660116 Aug 16 15:23 age-keygen
```
* Release : [https://github.com/FiloSottile/age/releases](https://github.com/FiloSottile/age/releases)   
   
## Age 암호화 Key 생성
`age-keygen` 명령을 통해 암호화 Key 를 생성합니다.   
```bash
(test) root@testvm-c7 ~/chhan/rpm $ age-keygen -o key.txt
Public key: age1f8y5zwet3mxv6cw0vt96yjeka7hedkqeze3spff8jxzz2wgcs9aspl99c9

(test) root@testvm-c7 ~/chhan/rpm $ cat key.txt
# created: 2022-08-16T15:26:16+09:00
# public key: age1f8y5zwet3mxv6cw0vt96yjeka7hedkqeze3spff8jxzz2wgcs9aspl99c9
AGE-SECRET-KEY-1EYSCLWDNDMKWPK9HJMWG6LFARXSKU06SUCF6XY4N4L2QZTSQRYAQ7TE2TV
```    
   
# Secret/ConfigMap 암호화
`.bashrc` 혹은 `.zshrc` 등 Shell ENV 에 `Age` Key File 정보 및 `Age` RECIPIENTS 정보를 추가합니다.    
```bash
export SOPS_AGE_RECIPIENTS=$(cat key.txt |grep -oP "public key: \K(.*)")
export SOPS_AGE_KEY_FILE=$(pwd)/key.txt
```
* 테스트 환경에 따라 경로 및 file name 을 수정합니다.   
    
암호화에 사용할 원본 Yaml 은 아래와 같습니다.    
```bash
(test) root@testvm-c7 ~/chhan/rpm $ kubectl create secret generic my-secret --from-literal=superpw=supersecret -o yaml --dry-run > test.yml
 
(test) root@testvm-c7 ~/chhan/rpm $ cat test.yml
apiVersion: v1
data:
  superpw: c3VwZXJzZWNyZXQ=
kind: Secret
metadata:
  creationTimestamp: null
  name: my-secret
```
    
`test.yml` 을 암호화 해보겠습니다.   
```bash
(ENV 선언이 없는 경우) $ sops --encrypt --age $(cat key.txt |grep -oP "public key: \K(.*)") test.yml
(ENV 선언이 된 경우)   $ sops -e test.yml
apiVersion: ENC[AES256_GCM,data:lzU=,iv:oVl0aEc/QCWgsOentMO/3dTt3hj1CwKusqPu8HzsFqg=,tag:pueW5DwAhVvRu8uVoEJnGg==,type:str]
data:
    superpw: ENC[AES256_GCM,data:wr4ye83kOHkvVs1ttcH4LQ==,iv:7mWUK3OjcJzOI4OhakGsWPAndx431LqO7TNfHE61yZE=,tag:Mvej5RAZrPKO/W4PDgX5VQ==,type:str]
kind: ENC[AES256_GCM,data:/Eba+isu,iv:cdJCdv2//6gpZ+8E8yftppqw4foSwB/ko+U2SWWPew0=,tag:boo5PlBsGUbKyUGTwruXOg==,type:str]
metadata:
    creationTimestamp: null
    name: ENC[AES256_GCM,data:dnBOFT9I8Ex/,iv:+w8vI4Jow4gLtqCYu6+Vbpe8MAYVH71H2RFzb/mXvJY=,tag:oIcxsvXP1VEeZnQ2iwNSeg==,type:str]
sops:
    kms: []
    gcp_kms: []
    azure_kv: []
    hc_vault: []
    age:
        - recipient: age1f8y5zwet3mxv6cw0vt96yjeka7hedkqeze3spff8jxzz2wgcs9aspl99c9
          enc: |
            -----BEGIN AGE ENCRYPTED FILE-----
            YWdlLWVuY3J5cHRpb24ub3JnL3YxCi0+IFgyNTUxOSBTeWV4VzB2Zm56aUlPTnpk
            enBoZTlYNjZHMXVlQlRLSS92RTZ4MEhYMldzCjZ3ZjNjK2wySjZ2bWc1VDBob2FW
            Y2c3SjhZbGhwMjBDMHVkcmJxMTlBL28KLS0tIGRoM0I5cFYzQmQ4T3hMLy8ySnoz
            aG1GeWx0bk02QVFxeVROU0M2KzVGV0EK8pKGUc8wa7ZVwCDB97MJQktHc2r0BN7K
            YU4x3dSpL2KeC2XNYmV3EPqeB21+xHXz37k8PPLj5QpZXPGkcbVx5w==
            -----END AGE ENCRYPTED FILE-----
    lastmodified: "2022-08-16T06:53:18Z"
    mac: ENC[AES256_GCM,data:tfJZ5Ooi/GNQRedtdqEd1y0G8O9EDKT3J82xZeysHqjxW/h7MqpLI2dQKSqXxpIKycFNtkHEzxfpcD0tTTA/qFXUeLTqMN7jvOohBdjkaWT9tER86jqslGUeT0DRsm1dvI9sJ1N0Q+KY0fR9DAnCalXEoiTHcuHcPDGj4XSfSIA=,iv:Uhxp0iJ6/ijZHentb5MKX+bUg8/NulzgkrRHnaJhv78=,tag:t8s//SjRx600Lf6jDo0STw==,type:str]
    pgp: []
    unencrypted_suffix: _unencrypted
    version: 3.7.3
```
기본적으로 `-e (encrypt)` 옵션을 사용하면 출력만 되고 `-i (write output back to the same file instead of stdout)` 을 사용하면 해당 파일에 바로 작성하는 방법이 있습니다.    
`-i` 옵션을 미사용하는 경우, 아래와 같은 방법으로 encrypt 된 파일을 생성 할 수 있습니다.    
```bash
$ sops -e test.yml > test.enc.yml
```
    
# 복호화
암호화된 파일을 아래와 같은 방법으로 복호화가 가능합니다.    
```bash
(test) root@testvm-c7 ~/chhan/rpm $ sops -d test.yml
apiVersion: v1
data:
    superpw: c3VwZXJzZWNyZXQ=
kind: Secret
metadata:
    creationTimestamp: null
    name: my-secret
```
   
# Kubernetes 에서 사용
암호화된 Secret 을 아래와 같은 방법으로 바로 Kubernetes 에 사용이 가능합니다.   
```bash
(test) root@testvm-c7 ~/chhan/rpm $ sops -d test.yml | kubectl create -f -
secret/my-secret created
(test) root@testvm-c7 ~/chhan/rpm $ kubectl get secret my-secret
NAME        TYPE     DATA   AGE
my-secret   Opaque   1      9s
```
    
# 암호화된 파일 수정
따로 원본을 수정하고 다시 암호화하는 과정이 필요없고 암호화된 파일을 바로 `vim` 와 같은 시스템에 설정된 `editor` 으로 수정이 가능합니다.   
```bash
(test) root@testvm-c7 ~/chhan/rpm $ sops test.yml
"편집 화면"
apiVersion: v1
data:
    superpw: c3VwZXJzZWNyZXQ=
kind: Secret
metadata:
    creationTimestamp: null
    name: my-secret
```
   
# Git Diff 적용
기본적으로 Git diff 를 사용하면 암호화된 파일을 아래와 같이 `diff` 됩니다.    
```diff
# git diff base.enc.yml
diff --git a/base.enc.yml b/base.enc.yml
index 1471633..6c181fb 100644
--- a/base.enc.yml
+++ b/base.enc.yml
@@ -1,6 +1,7 @@
 apiVersion: ENC[AES256_GCM,data:7C4=,iv:qLmEYR1pqnH6EOMAsTdS9vNANNMQcV6qeSaTXSCWzxs=,tag:BrSYC4e+XLyUUEO0n1PGgw==,type:str]
 data:
     superpw: ENC[AES256_GCM,data:4Aq+erGRt5QYYFIyeEX8Kw==,iv:9/bo92QzP0d6/uKN0z68jBa0sdtjbe0TVRDSpB7Nml0=,tag:RFNj5ehJyZpGEbjAzYXGjQ==,type:str]
+    superpw2: ENC[AES256_GCM,data:BCTgOGr/8j2oYTrp0jPHdA==,iv:o/9KVllyIDXty8NcFjiIqF2pI0K6GxOuxeCEkXWtAbY=,tag:IloTiPZqcG6pcNGFqkAP1w==,type:str]
 kind: ENC[AES256_GCM,data:6jKb68d5,iv:256KcMI62cJ99ZYJLx99yUIVWWwkHfyZW2HlRa/Xtu4=,tag:Y8SsTkzx73Ng6G0247P/Nw==,type:str]
 metadata:
     creationTimestamp: null
@@ -20,8 +21,8 @@ sops:
             OGw3dEVhbUNwYW4ySDlSU2N6aWVzaFEKjo+QF4388+g/Jxe1OurwWfHhOS0NvHSo
             r+dfBDFciZV9ofMP0r4+Cp9yRe58lNlvJ4IMspFvfyw3raepIMcX8A==
             -----END AGE ENCRYPTED FILE-----
-    lastmodified: "2022-08-17T01:04:01Z"
-    mac: ENC[AES256_GCM,data:wNToFg7hsBMjCwXjdVd9OAJkrVf1/pP+pKNfhH8RD8lvkZYe2xYcVB9sRE1/b4F0/U++UW4J33J6EXQmJZstwGeLKesTVBi6Rizjg5XxoR05aU/T8IM1o8gAEkXeZCyL7CaoBj7nKNFf4m/yLZxOqo4TOxMT2wRwX7Tl7xg6APg=,iv:gqW
+    lastmodified: "2022-08-17T01:05:59Z"
+    mac: ENC[AES256_GCM,data:EWnw62B39yLU/tGsP3Gca/+oUsgO+QKjNeEetIXO8CsstbxcKZgLFsckiSI9DNZPKEoPa02GUltYgSbREKAscTpQANIrCJ0Rj1SoZbfzMVH45/+TPU/TRzZpEkQaN6/ulzH3BcecZaEbIWQVoyRQnfSUFN/CvdG5ueF/wCmF0xg=,iv:ZcN
     pgp: []
     unencrypted_suffix: _unencrypted
     version: 3.7.3
```
    
Source 에서 무엇이 수정된 건지 정확하게 파악이 안됩니다.    
    
아래와 같이 git 설정을 진행하면 복호화된 git diff 를 볼 수 있습니다.    
```bash
root@testvm-c7 ~/chhan/rpm/gitdiff (main)$ cat .gitattributes
*.yml diff=sopsdiffer
```
`.gitattributes` 를 생성합니다. sopsdiffer 를 사용할 파일 형식을 지정합니다.   
여기서는 `*.yml` 에 대해서만 diff 하는 경우 sopsdiffer 를 이용하도록 설정합니다.    
    
```bash
root@testvm-c7 ~/chhan/rpm/gitdiff (main)$ git config diff.sopsdiffer.textconv "sops -d"
```
* 참고 자료 : [https://github.com/mozilla/sops#showing-diffs-in-cleartext-in-git](https://github.com/mozilla/sops#showing-diffs-in-cleartext-in-git)    

```bash
root@testvm-c7 ~/chhan/rpm/gitdiff (main)$ git diff base.enc.yml
diff --git a/base.enc.yml b/base.enc.yml
index 1471633..6c181fb 100644
--- a/base.enc.yml
+++ b/base.enc.yml
@@ -1,6 +1,7 @@
 apiVersion: v1
 data:
     superpw: c3VwZXJzZWNyZXQ=
+    superpw2: c3VwZXJzZWNyZXQ=         << 추가 혹은 변경된 부분
 kind: Secret
 metadata:
     creationTimestamp: null
```
   
# 다양한 OS 지원
SOPS 는 Linux, Mac, Windows 등 다양한 운영체제를 지원하여 VSCode 연동등 여러가지 방법으로 활용이 가능합니다.   
   
# 참고 자료
* [https://github.com/mozilla/sops](https://github.com/mozilla/sops)   
* [https://github.com/FiloSottile/age](https://github.com/FiloSottile/age)   