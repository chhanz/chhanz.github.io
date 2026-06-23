---
layout: post
title: "[AWS] Bedrock AgentCore Web Search를 MCP로 연동"
description: "AgentCore 웹 검색 연동"
author: chhanz
date: 2026-06-23
tags: [aws, ai]
categories: [aws]
---

## [AWS] Bedrock AgentCore Web Search를 MCP로 연동

최근 AWS에서 Amazon Bedrock AgentCore에 웹 검색 기능을 추가했다는 소식을 접하고, 실제로 AI 에이전트에 연결하여 테스트를 해보았습니다. 관련하여 게이트웨이를 직접 구성하고 MCP 클라이언트에 붙이는 과정까지 한 번에 정리된 내용이 많지 않아, 이번 포스팅에서는 AgentCore Web Search를 게이트웨이로 노출하고 MCP 도구로 연동하는 방법에 대해 기록하도록 하겠습니다.

### Bedrock AgentCore Web Search 란?

![Bedrock AgentCore Web Search 개요](/assets/images/post/2026-06-23-bedrock-agentcore-web-search-hermes/2.png)

Amazon Bedrock AgentCore는 AI 에이전트를 운영하기 위한 관리형 서비스입니다. 이번에 추가된 Web Search는 에이전트가 외부 웹을 검색할 수 있도록 제공되는 내장 도구로, AWS가 자체적으로 구축한 웹 인덱스를 통해 검색 결과를 반환합니다.

핵심은 AgentCore Gateway를 통해 이 검색 기능을 MCP(Model Context Protocol) 엔드포인트로 노출할 수 있다는 점입니다. 즉, 게이트웨이가 MCP 서버 역할을 하고, 에이전트는 일반적인 MCP 도구를 호출하듯 웹 검색을 사용할 수 있습니다.

저의 경우 별도의 Runtime을 새로 구성할 필요 없이, 게이트웨이에 Web Search 타겟만 추가하는 방식으로 연동을 진행하였습니다.

### 테스트 환경

- 테스트 환경: Amazon Linux 2023 (kernel 6.1.x)
- 리전: us-east-1
- 인증: EC2 인스턴스 IAM 롤 (SigV4 자동 서명)
- MCP 클라이언트: 네이티브 MCP 클라이언트 (stdio 방식)
- 로컬 프록시: mcp-proxy-for-aws (uvx 실행)

### 전체 구성 흐름

연동 구조는 아래와 같습니다.

```
[AI 에이전트] -- stdio --> [mcp-proxy-for-aws] -- SigV4/HTTPS --> [AgentCore Gateway] --> [Web Search Target]
```

로컬 프록시가 표준 입출력(stdio)으로 들어온 MCP 요청을 받아 SigV4로 서명한 뒤, AgentCore Gateway의 MCP 엔드포인트로 전달하는 방식입니다. EC2 인스턴스 프로파일 롤을 사용하므로 별도의 액세스 키를 코드에 넣을 필요가 없습니다.

### 1. 게이트웨이 서비스 롤 생성

먼저 게이트웨이가 사용할 IAM 서비스 롤을 생성합니다. 이 롤은 게이트웨이가 Web Search 백엔드를 호출할 때 사용하는 롤로, 게이트웨이를 생성할 때 `--role-arn`으로 참조하므로 **게이트웨이보다 먼저** 만들어 두어야 합니다.

먼저 게이트웨이 서비스가 이 롤을 사용할 수 있도록 신뢰 정책(`trust-policy.json`)을 작성합니다.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": { "Service": "bedrock-agentcore.amazonaws.com" },
            "Action": "sts:AssumeRole",
            "Condition": {
                "StringEquals": { "aws:SourceAccount": "<계정ID>" },
                "ArnLike": { "aws:SourceArn": "arn:aws:bedrock-agentcore:us-east-1:<계정ID>:gateway/*" }
            }
        }
    ]
}
```

다음으로 게이트웨이 호출 권한(`InvokeGateway`)과 Web Search 도구 호출 권한(`InvokeWebSearch`)을 담은 권한 정책(`permissions.json`)을 작성합니다.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "InvokeGateway",
            "Effect": "Allow",
            "Action": "bedrock-agentcore:InvokeGateway",
            "Resource": "arn:aws:bedrock-agentcore:us-east-1:<계정ID>:gateway/*"
        },
        {
            "Sid": "InvokeWebSearch",
            "Effect": "Allow",
            "Action": "bedrock-agentcore:InvokeWebSearch",
            "Resource": "arn:aws:bedrock-agentcore:us-east-1:aws:tool/web-search.v1"
        }
    ]
}
```

`InvokeWebSearch`의 Resource는 AWS가 제공하는 Web Search 도구의 고정 ARN(`arn:aws:bedrock-agentcore:us-east-1:aws:tool/web-search.v1`)입니다. 두 정책 파일이 준비되면 아래와 같이 롤을 생성하고 권한을 붙입니다.

```
$ aws iam create-role \
  --role-name AgentCoreWebSearchGatewayRole \
  --assume-role-policy-document file://trust-policy.json

$ aws iam put-role-policy \
  --role-name AgentCoreWebSearchGatewayRole \
  --policy-name websearch \
  --policy-document file://permissions.json
```

> 신뢰 정책의 `aws:SourceArn`은 게이트웨이를 만들기 전이라 `gateway/*` 와일드카드로 시작하고, 게이트웨이 ID가 확정되면 해당 ID로 좁히는 것을 권장합니다.

### 2. 게이트웨이 생성

서비스 롤이 준비되면 Bedrock AgentCore에 Gateway를 생성합니다. 아래와 같이 AWS CLI로 MCP 프로토콜과 AWS_IAM 인증 방식을 지정하고, 앞에서 만든 서비스 롤을 `--role-arn`으로 지정합니다.

```
$ aws bedrock-agentcore-control create-gateway \
  --region us-east-1 \
  --name hermes-websearch-gw \
  --role-arn arn:aws:iam::<계정ID>:role/AgentCoreWebSearchGatewayRole \
  --protocol-type MCP \
  --authorizer-type AWS_IAM
```

응답으로 반환되는 게이트웨이 ID와 MCP 엔드포인트(`gatewayUrl`)를 기록해 둡니다.

### 3. Web Search 타겟 추가

생성한 게이트웨이 안에 Web Search 타겟을 추가합니다.

![타겟 생성](/assets/images/post/2026-06-23-bedrock-agentcore-web-search-hermes/1.png)

저의 경우 발급된 MCP 엔드포인트에 대해 타겟 이름을 `web-search-tool`로 지정하여 Web Search 타겟을 생성하였습니다. 생성이 완료되면 아래와 같은 형태의 MCP 엔드포인트와 타겟이 구성됩니다.

```
endpoint   : https://{게이트웨이ID}.gateway.bedrock-agentcore.us-east-1.amazonaws.com/mcp
target name: /web-search-tool
```

### 4. 호출자에게 게이트웨이 호출 권한 부여

이제 게이트웨이를 호출하는 주체(저의 경우 Hermes가 동작하는 EC2 인스턴스 프로파일 롤)에 게이트웨이 호출 권한을 부여합니다. 이 호출자 롤에는 `InvokeGateway` 권한만 있으면 됩니다. 아래와 같이 인라인 정책을 추가합니다.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "InvokeGateway",
            "Effect": "Allow",
            "Action": "bedrock-agentcore:InvokeGateway",
            "Resource": "arn:aws:bedrock-agentcore:us-east-1:<계정ID>:gateway/{게이트웨이ID}"
        }
    ]
}
```

앞의 서비스 롤(1단계)과 호출자 롤(4단계)은 역할이 다릅니다. 서비스 롤은 게이트웨이가 Web Search 백엔드를 호출할 때 사용하는 롤이고, 호출자 롤은 우리 에이전트가 게이트웨이를 호출할 때 사용하는 롤입니다. 두 롤을 혼동하지 않도록 주의합니다.

### 5. 로컬 프록시로 연결 확인

게이트웨이를 MCP로 호출하기 위해 mcp-proxy-for-aws 프록시를 사용합니다. 이 프록시는 표준 입출력(stdio)으로 동작하는 MCP 서버이므로, MCP 프로토콜 메시지를 표준 입력으로 직접 넣어 도구 목록이 정상적으로 반환되는지 확인할 수 있습니다.

아래와 같이 초기화(`initialize`) 메시지와 도구 목록 조회(`tools/list`) 메시지를 프록시에 전달합니다.

```bash
$ GW="https://{게이트웨이ID}.gateway.bedrock-agentcore.us-east-1.amazonaws.com/mcp"
$ {
    printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"probe","version":"1.0"}}}'
    printf '%s\n' '{"jsonrpc":"2.0","method":"notifications/initialized"}'
    printf '%s\n' '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
    sleep 6
  } | AWS_REGION=us-east-1 uvx mcp-proxy-for-aws@latest "$GW"
```

`tools/list` 응답에서 아래와 같이 `web-search-tool___WebSearch` 도구가 조회되면 게이트웨이까지 정상적으로 연결된 것입니다.

```json
{"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2024-11-05","capabilities":{"prompts":{"listChanged":false},"resources":{"listChanged":false},"tools":{"listChanged":false}},"serverInfo":{"name":"MCP Proxy for AWS","version":"1.6.2"},"instructions":"MCP Proxy for AWS provides access to SigV4 protected MCP servers through a single interface. This proxy handles authentication and request routing to the appropriate backend services."}}
{"jsonrpc":"2.0","id":2,"result":{"tools":[{"name":"web-search-tool___WebSearch","inputSchema":{"type":"object","properties":{"maxResults":{"description":"Maximum number of results to return. Valid range: 1-25. Defaults to 10.","type":"integer"},"query":{"description":"The search query string","type":"string"}},"required":["query"]}}]}}
```

`id:1` 응답으로 프록시 초기화가 완료되고, `id:2` 응답에 `web-search-tool___WebSearch` 도구와 입력 스키마(`query` 필수, `maxResults` 1~25)가 포함된 것을 확인 할 수 있습니다.

마지막의 `sleep 6`은 프록시가 게이트웨이까지 요청을 왕복할 시간을 확보하기 위한 것입니다. 표준 입력이 즉시 닫히면 초기화 응답만 돌아오고 `tools/list` 응답을 받지 못할 수 있으므로, 입력을 잠시 열어둔 상태로 요청을 보내야 합니다.

### 6. MCP 클라이언트에 등록

연결이 확인되면 MCP 클라이언트 설정에 서버를 등록합니다. 아래와 같이 stdio 방식으로 프록시 실행 명령을 지정하고, 리전만 환경 변수로 전달합니다. 인증은 인스턴스 프로파일 롤을 통해 자동으로 처리되므로 별도의 키 설정은 필요하지 않습니다.

```yaml
# config.yaml (MCP 서버 등록 예시)
mcp_servers:
  agentcore-websearch:
    command: uvx
    args:
      - mcp-proxy-for-aws@latest
      - https://{게이트웨이ID}.gateway.bedrock-agentcore.us-east-1.amazonaws.com/mcp
    env:
      AWS_REGION: us-east-1
```

### 7. 연동 결과 확인

등록 후 MCP 클라이언트에서 서버 목록과 연결 상태를 확인합니다.

```
$ hermes mcp list

  MCP Servers:

  Name             Transport                      Tools        Status
  ──────────────── ────────────────────────────── ──────────── ──────────

  agentcore-websearch uvx mcp-proxy-for-aws@1.6...   all          ✓ enabled
```

이어서 `hermes mcp test` 명령으로 해당 서버에 실제로 연결하여 도구가 발견되는지 확인합니다.

```
$ hermes mcp test agentcore-websearch

  Testing 'agentcore-websearch'...
  Transport: stdio → uvx
  Auth: none
  ✓ Connected (3233ms)
  ✓ Tools discovered: 1

    web-search-tool___WebSearch
```

위와 같이 게이트웨이가 정상적으로 등록되고, 에이전트가 웹 검색 도구를 호출할 수 있는 상태가 된 것을 확인 할 수 있습니다.

### 8. 실제 검색 호출과 응답 형식

마지막으로 도구를 실제로 호출(`tools/call`)하여 검색 결과가 돌아오는지 확인합니다. 앞의 5번에서 사용한 프로브 방식에 `tools/call` 메시지를 넣어 `query`를 전달합니다.

```bash
$ GW="https://{게이트웨이ID}.gateway.bedrock-agentcore.us-east-1.amazonaws.com/mcp"
$ {
    printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"probe","version":"1.0"}}}'
    printf '%s\n' '{"jsonrpc":"2.0","method":"notifications/initialized"}'
    printf '%s\n' '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"web-search-tool___WebSearch","arguments":{"query":"chhanz","maxResults":3}}}'
    sleep 8
  } | AWS_REGION=us-east-1 uvx mcp-proxy-for-aws@latest "$GW"
```

검색 결과는 표준 MCP의 `tools/call` 응답 봉투로 돌아옵니다. 도구는 `type`이 `text`인 `content` 블록을 하나 반환하며, 그 안의 `text`에는 직렬화된 JSON 문서가 문자열로 담겨 있습니다. 즉, 응답의 바깥쪽 구조는 아래와 같습니다.

```json
{"jsonrpc":"2.0","id":2,"result":{"content":[{"type":"text","text":"{\"id\":\"d0f5e9f5\",\"results\":[ ... ]}"}]}}
```

`content[0].text`의 내부 문자열을 다시 JSON으로 파싱하면, 검색 응답 `id`와 함께 관측 결과 배열(`results`)을 얻을 수 있습니다. 각 항목은 게시일(`publishedDate`), 본문 요약(`text`), 제목(`title`), 출처 URL(`url`)로 구성됩니다.

```json
{
  "id": "d0f5e9f5",
  "results": [
    {
      "publishedDate": "unknown",
      "text": "chhanz / openshift-hands-on-lab Public ... OpenShift 4.X Hands-on lab ...",
      "title": "chhanz/openshift-hands-on-lab: OpenShift 4.X Hands-on lab",
      "url": "https://github.com/chhanz/openshift-hands-on-lab"
    },
    {
      "publishedDate": "unknown",
      "text": "chhanz / kubernetes-hands-on-lab Public ... Fork 3 Star 6 ...",
      "title": "kubernetes-hands-on-lab/README.md at master · chhanz/kubernetes-hands-on-lab · GitHub",
      "url": "https://github.com/chhanz/kubernetes-hands-on-lab/blob/master/README.md"
    },
    {
      "publishedDate": "04:00PM, Thursday, February 17 2022, PST",
      "text": "chhanz / njmon-grafana-dashboard-json Public ... njmon Grafana Dashboard For Linux ...",
      "title": "chhanz/njmon-grafana-dashboard-json: njmon Grafana Dashboard For Linux · GitHub",
      "url": "https://github.com/chhanz/njmon-grafana-dashboard-json"
    }
  ]
}
```

위와 같이 실제 검색 쿼리를 전달하면 출처 URL과 제목이 포함된 결과가 반환되는 것을 확인 할 수 있습니다. 에이전트는 이 `text` 안의 JSON을 파싱하여 최신 웹 정보를 답변에 활용하게 됩니다.

### 정리

위와 같은 방법으로 별도의 Runtime 구성 없이, AgentCore Gateway에 Web Search 타겟을 추가하고 로컬 MCP 프록시를 통해 AI 에이전트에 웹 검색 기능을 연동할 수 있습니다. EC2 인스턴스 프로파일 롤을 활용하면 자격 증명을 코드에 노출하지 않고도 안전하게 게이트웨이를 호출할 수 있어, 사내 에이전트 환경에 적용하기에 적합합니다.

### 참고

- Amazon Bedrock AgentCore Web Search 소개: [https://aws.amazon.com/ko/blogs/machine-learning/introducing-web-search-on-amazon-bedrock-agentcore/](https://aws.amazon.com/ko/blogs/machine-learning/introducing-web-search-on-amazon-bedrock-agentcore/)
