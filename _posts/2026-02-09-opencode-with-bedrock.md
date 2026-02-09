---
layout: post
title: "[AI] opencode - Amazon Bedrock과 연동하여 opencode 사용하기"
description: ""
author: chhanz
date: 2026-02-09
tags: [ai, aws]
categories: [ai]
---

# opencode 란?

opencode는 터미널에서 사용할 수 있는 AI 기반 코딩 어시스턴트입니다.   
다양한 AI 프로바이더를 지원하며, Amazon Bedrock과 연동하여 AWS 환경에서 손쉽게 AI 코딩 어시스턴트를 활용할 수 있습니다.

이번 포스팅에서는 opencode를 설치하고 Amazon Bedrock과 연동하여 사용하는 방법에 대해 기록하도록 하겠습니다.

* 공식 사이트: [https://opencode.ai/](https://opencode.ai/)

# 테스트 환경

- 테스트 환경: Amazon Linux 2023
- AWS Region: ap-northeast-2

# 설치

아래와 같이 opencode를 설치합니다.

```bash
$ curl -fsSL https://opencode.ai/install | bash

Installing opencode version: 1.1.53
■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 100%
Successfully added opencode to $PATH in /root/.bashrc

                                 ▄
█▀▀█ █▀▀█ █▀▀█ █▀▀▄ █▀▀▀ █▀▀█ █▀▀█ █▀▀█
█░░█ █░░█ █▀▀▀ █░░█ █░░░ █░░█ █░░█ █▀▀▀
▀▀▀▀ █▀▀▀ ▀▀▀▀ ▀  ▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀


OpenCode includes free models, to start:

cd <project>  # Open directory
opencode      # Run command

For more information visit https://opencode.ai/docs
```

위와 같이 설치가 완료된 것을 볼 수 있습니다.

# Amazon Bedrock Provider 설정

## AWS 자격 증명 확인

Amazon Bedrock을 사용하기 위해서는 AWS 자격 증명이 필요합니다.   
저의 경우, EC2 인스턴스 프로파일(IAM Role)을 사용하여 인증하도록 설정하였습니다.

```bash
$ aws configure list
NAME       : VALUE                    : TYPE             : LOCATION
profile    : <not set>                : None             : None
access_key : ****************1234     : iam-role         :
secret_key : ****************5678     : iam-role         :
region     : ap-northeast-2           : imds             :
```

## AWS Config 설정

아래와 같이 AWS config 파일을 구성합니다.

```bash
$ cat ~/.aws/config
[default]
region = ap-northeast-2
credential_source = Ec2InstanceMetadata
output = json
```

## opencode 인증 설정

opencode에서 Amazon Bedrock을 IAM 인증으로 사용하기 위해 아래와 같이 auth.json 파일을 구성합니다.

```bash
$ cat ~/.local/share/opencode/auth.json
{
  "amazon-bedrock": {
    "type": "iam"
  }
}
```

## opencode Provider 설정

IAM role 인증이 정상적으로 동작하도록 opencode 설정 파일을 아래와 같이 구성합니다.

```bash
$ cat ~/.config/opencode/opencode.json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "amazon-bedrock": {
      "options": {
        "region": "ap-northeast-2",
        "profile": "default"
      }
    }
  }
}
```

## 예제 이미지
### 인증 실패

![인증 실패](/assets/images/post/2026-02-09-opencode/fail.png)

위와 같이 IAM role 인증이 실패하는 경우가 발생하는 경우, `auth.json` 에 `type` 이 `iam` 으로 잘 설정이 되어 있는지 확인이 필요합니다.   

### 인증 성공

![인증 성공](/assets/images/post/2026-02-09-opencode/done.png)

위와 같이 API KEY 없이 IAM role 인증으로 Amazon Bedrock 사용이 가능한 것을 확인 할 수 있습니다.

# 참고

- opencode 공식 문서: [https://opencode.ai/docs](https://opencode.ai/docs)
- Amazon Bedrock 문서: [https://docs.aws.amazon.com/bedrock/](https://docs.aws.amazon.com/bedrock/)