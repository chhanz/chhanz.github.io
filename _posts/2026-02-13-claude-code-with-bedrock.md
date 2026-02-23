---
layout: post
title: "[AWS] Amazon Bedrock 과 Claude Code 연동 with code-server"
description: ""
author: chhanz
date: 2026-02-13
tags: [aws, ai]
categories: [aws]
---

# Amazon Bedrock과 Claude Code 연동

이번 포스팅에서는 AWS EC2 인스턴스에서 Amazon Bedrock을 활용하여 Claude Code를 사용하는 방법에 대해 기록하도록 하겠습니다.

Claude Code는 Anthropic에서 제공하는 AI 코딩 어시스턴트로, Amazon Bedrock을 통해 AWS 환경에서 안전하게 사용할 수 있습니다. 이를 통해 Anthropic 계정 없이도 AWS IAM 역할 기반 인증으로 Claude Code를 활용할 수 있습니다.

## 테스트 환경

- 테스트 환경: Amazon Linux 2023.10.20260202
- AWS Region: ap-northeast-2

## IAM 역할 생성

Amazon Bedrock을 사용하기 위해 EC2 인스턴스에 연결할 IAM 역할을 생성합니다.

![IAM 설정 완료 예제](/assets/images/post/2026-02-13-claude/1.png)

### Trust Policy JSON 파일 생성

아래와 같이 Trust Policy JSON 파일을 생성합니다.

```
cat > trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
```

### IAM 역할 생성

아래 명령어를 통해 IAM 역할을 생성합니다.

```
aws iam create-role \
  --role-name Bedrock_Profile \
  --assume-role-policy-document file://trust-policy.json \
  --description "Bedrock_Profile"
```

### 관리형 정책 연결

Bedrock 및 MCP 서비스 사용을 위한 관리형 정책을 연결합니다.

```
aws iam attach-role-policy \
  --role-name Bedrock_Profile \
  --policy-arn arn:aws:iam::aws:policy/AmazonBedrockLimitedAccess

aws iam attach-role-policy \
  --role-name Bedrock_Profile \
  --policy-arn arn:aws:iam::aws:policy/AWSMcpServiceActionsFullAccess
```

### 인스턴스 프로파일 생성

```
aws iam create-instance-profile \
  --instance-profile-name Bedrock_Profile
```

### 역할을 인스턴스 프로파일에 추가

```
aws iam add-role-to-instance-profile \
  --instance-profile-name Bedrock_Profile \
  --role-name Bedrock_Profile
```

위와 같이 IAM 역할 생성이 완료되면 EC2 인스턴스에 해당 인스턴스 프로파일을 연결합니다.

## code-server 설치

브라우저에서 VS Code 환경을 사용하기 위해 code-server를 설치합니다.

```
[root@ip-172-31-45-222 ~]# curl -fsSL https://code-server.dev/install.sh | sh
Amazon Linux 2023.10.20260202
Installing v4.108.2 of the amd64 rpm package from GitHub.

+ mkdir -p ~/.cache/code-server
+ curl -#fL -o ~/.cache/code-server/code-server-4.108.2-amd64.rpm.incomplete -C - https://github.com/coder/code-server/releases/download/v4.108.2/code-server-4.108.2-amd64.rpm
######################################################################## 100.0%
+ mv ~/.cache/code-server/code-server-4.108.2-amd64.rpm.incomplete ~/.cache/code-server/code-server-4.108.2-amd64.rpm
+ rpm -U ~/.cache/code-server/code-server-4.108.2-amd64.rpm

rpm package has been installed.

To have systemd start code-server now and restart on boot:
  sudo systemctl enable --now code-server@$USER
Or, if you don't want/need a background service you can run:
  code-server

Deploy code-server for your team with Coder: https://github.com/coder/coder
```

systemd를 통해 code-server 서비스를 활성화합니다.

```
[root@ip-172-31-45-222 ~]# systemctl enable --now code-server@root
Created symlink /etc/systemd/system/default.target.wants/code-server@root.service → /usr/lib/systemd/system/code-server@.service.
```
   
`~/.config/code-server/config.yaml` 에서 `bind-addr` 를 `0.0.0.0:80` 과 같은 환경에 적합한 설정으로 변경하고 접속을 위한 `password` 를 확인합니다.   
    
## Claude Code 확장 플러그인 설치

위 단계에서 확인 된 정보를 통해 code-server 에 접속하고, code-server의 확장 플러그인에서 Claude Code를 설치합니다.

![Claude Code 확장 플러그인 설치](/assets/images/post/2026-02-13-claude/2.png)

![Claude Code 확장 플러그인 설치 완료](/assets/images/post/2026-02-13-claude/3.png)

## Amazon Bedrock 사용 설정

먼저 code-server 에 Claude Code가 Amazon Bedrock을 사용하도록 설정합니다. 로그인 프롬프트를 사용안하도록 아래와 같이 설정합니다.

![Disable Login Prompt](/assets/images/post/2026-02-13-claude/4.png)
   
code-server 설정에서 Claude Code가 CLI 모드로 동작하도록 설정하면 브라우저 환경에서도 Claude Code를 사용할 수 있습니다.

![CLI 모드 설정](/assets/images/post/2026-02-13-claude/5.png)   
   
Cluade Code CLI 에서 Amazon Bedrock 을 사용하도록 아래 설정을 설정합니다.   
   
```
[root@ip-172-31-45-222 ~]# cat ~/.claude/settings.json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "env": {
    "CLAUDE_CODE_USE_BEDROCK": "1",
    "AWS_REGION": "ap-northeast-2"
  }
}
```

인스턴스 프로파일을 통해 Bedrock에서 Claude 모델이 사용 가능한지 확인합니다.

```
[root@ip-172-31-45-222 ~]# aws bedrock list-foundation-models | grep "anthropic.claude-opus-4-5-20251101-v1"
            "modelArn": "arn:aws:bedrock:ap-northeast-2::foundation-model/anthropic.claude-opus-4-5-20251101-v1:0",
            "modelId": "anthropic.claude-opus-4-5-20251101-v1:0",
```

## Claude Code CLI 설치

터미널에서 Claude Code를 사용하기 위해 CLI를 설치합니다.

```
[root@ip-172-31-45-222 ~]# curl -fsSL https://claude.ai/install.sh | bash
Setting up Claude Code...

✔ Claude Code successfully installed!

  Version: 2.1.39

  Location: ~/.local/bin/claude


  Next: Run claude --help to get started

✅ Installation complete!
```

위와 같이 설치가 완료되면 Claude Code가 정상적으로 로드되는 것을 확인할 수 있습니다.

![code-server with Cluade Code](/assets/images/post/2026-02-13-claude/6.png)

## 참고

- Claude Code Third-Party Provider 설정: [https://code.claude.com/docs/ko/vs-code#use-third-party-providers](https://code.claude.com/docs/ko/vs-code#use-third-party-providers)
- code-server : [https://github.com/coder/code-server](https://github.com/coder/code-server)