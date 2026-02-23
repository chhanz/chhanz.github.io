---
layout: post
title: "[Linux] userauth_pubkey: key type ssh-rsa not in PubkeyAcceptedAlgorithms" 
description: ""
author: chhanz
date: 2023-09-03
tags: [linux]
category: linux
---

# userauth_pubkey: key type ssh-rsa not in PubkeyAcceptedAlgorithms 오류 해결 방법
주로 구버전의 운영체제 혹은 구버전의 SSH client 에서 최신 버전의 운영체제로 접속 할 때, 위와 같은 에러를 `/var/log/secure` 에서 확인 할 수 있습니다.   
**(예 /> Ubuntu 14.04 에서 Amazon Linux 2023 접속 할 때 등)**   
   
`/var/log/secure` 로그 내용은 아래와 같습니다.   
(운영체제 마다 로그 위치는 차이가 있습니다.)    
```console
Jul 26 05:20:18 ip-172-31-35-0 sshd[7154]: userauth_pubkey: key type ssh-rsa not in PubkeyAcceptedAlgorithms [preauth]
Jul 26 05:20:18 ip-172-31-35-0 sshd[7154]: Connection closed by authenticating user ec2-user 172.31.41.36 port 53627 [preauth]
Jul 26 05:20:19 ip-172-31-35-0 sshd[7156]: userauth_pubkey: key type ssh-rsa not in PubkeyAcceptedAlgorithms [preauth]
Jul 26 05:20:19 ip-172-31-35-0 sshd[7156]: Connection closed by authenticating user ec2-user 172.31.41.36 port 53628 [preauth]
Jul 26 05:20:19 ip-172-31-35-0 sshd[7158]: userauth_pubkey: key type ssh-rsa not in PubkeyAcceptedAlgorithms [preauth]
Jul 26 05:20:19 ip-172-31-35-0 sshd[7158]: Connection closed by authenticating user ec2-user 172.31.41.36 port 53629 [preauth]
```
   
# Workaround
아래 명령어를 통해 시스템 암호화 정책을 이전 릴리즈와 호환 되는 정책으로 변경합니다.   
```bash
$ sudo update-crypto-policies --set LEGACY
$ sudo update-crypto-policies --show
LEGACY
```
   
아래와 같이 기존에 시스템 암호화 정책이 이전 릴리즈와 호환 되도록 변경이 됩니다.   
```diff
$ diff origin change
1c1
< ciphers aes256-gcm@openssh.com,chacha20-poly1305@openssh.com,aes256-ctr,aes128-gcm@openssh.com,aes128-ctr
---
> ciphers aes256-gcm@openssh.com,chacha20-poly1305@openssh.com,aes256-ctr,aes256-cbc,aes128-gcm@openssh.com,aes128-ctr,aes128-cbc,3des-cbc
3c3
< kexalgorithms curve25519-sha256,curve25519-sha256@libssh.org,ecdh-sha2-nistp256,ecdh-sha2-nistp384,ecdh-sha2-nistp521,diffie-hellman-group-exchange-sha256,diffie-hellman-group14-sha256,diffie-hellman-group16-sha512,diffie-hellman-group18-sha512
---
> kexalgorithms curve25519-sha256,curve25519-sha256@libssh.org,ecdh-sha2-nistp256,ecdh-sha2-nistp384,ecdh-sha2-nistp521,diffie-hellman-group-exchange-sha256,diffie-hellman-group14-sha256,diffie-hellman-group16-sha512,diffie-hellman-group18-sha512,diffie-hellman-group-exchange-sha1,diffie-hellman-group14-sha1
```
   
# 참고 자료
* [https://access.redhat.com/documentation/ko-kr/red_hat_enterprise_linux/8/html/security_hardening/switching-the-system-wide-crypto-policy-to-mode-compatible-with-previous-systems_using-the-system-wide-cryptographic-policies](https://access.redhat.com/documentation/ko-kr/red_hat_enterprise_linux/8/html/security_hardening/switching-the-system-wide-crypto-policy-to-mode-compatible-with-previous-systems_using-the-system-wide-cryptographic-policies)   