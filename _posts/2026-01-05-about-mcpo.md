---
layout: post
title: "mcpo - Open WebUI MCP 서버 연동 도구"
description: "OpenAPI 호환 API 생성 도구"
author: chhanz
date: 2026-01-05
tags: [linux, ai]
category: ai
---
# mcpo 란

  

`mcpo` 는 MCP 서버 명령을 받아 표준 RESTful OpenAPI를 통해 접근 가능하게 해주는 매우 간단한 프록시입니다.   
이러한 기능을 활용하여 LLM 에이전트 및 OpenAPI 를 사용하는 애플리케이션과 연동하는데 도움이 됩니다.   

  

# mcpo 의 필요성

  

MCP 서버는 일반적으로 원시 표준 입출력(stdio)을 통해 통신하는데, 이는 다음과 같은 단점이 있습니다.

  

🔓 본질적으로 보안에 취약합니다.   
❌ 대부분의 도구와 호환되지 않습니다.   
🧩 문서화, 인증, 오류 처리 등과 같은 표준 기능이 부족합니다.   

  

위와 같은 단점을 보완하고 여러 MCP 서버를 통합 관리하는데 편리함을 제공합니다.

개인적으로는 MCP 서버를 stdio 형태로 사용하면 사용자의 Laptop 과 같은 디바이스의 리소스를 사용하므로 발생되는 문제, LLM 의 재시작으로 인해 MCP 서버의 재시작등의 관리적으로 연관된 불편함이 다수 존재하였습니다.   

`mcpo` 는 이러한 불편함을 통합 관리하게 만들어주므로 인해 편리함을 제공하였다고 생각합니다.   

  

# Build

이번 포스팅에서는 `mcpo` 를 container 이미지로 빌드하고 빌드된 이미지를 이용하여 사용하는 방법에 대해 설명을 드리겠습니다.

  

아래와 같은 방법으로 `mcpo` container 이미지를 빌드합니다.

```bash
$ git clone https://github.com/open-webui/mcpo.git
$ cd mcpo/
$ docker build -t mcpo .
$ docker images
REPOSITORY   TAG       IMAGE ID       CREATED          SIZE
mcpo         latest    98c0476e1d50   15 seconds ago   539MB

$ docker run --rm mcpo

 Usage: mcpo [OPTIONS]

╭─ Options ────────────────────────────────────────────────────────────────────╮
│ --host                -h      TEXT     Host address [default: 0.0.0.0]       │
│ --port                -p      INTEGER  Port number [default: 8000]           │
│ --cors-allow-origins          TEXT     CORS allowed origins [default: *]     │
│ --api-key             -k      TEXT     API key for authentication            │
│ --strict-auth                          API key protects all endpoints and    │
│                                        documentation                         │
│ --env                 -e      TEXT     Environment variables                 │
│ --env-path                    TEXT     Path to environment variables file    │
│ --type,--server-type          TEXT     Server type [default: stdio]          │
│ --config              -c      TEXT     Config file path                      │
│ --name                -n      TEXT     Server name                           │
│ --description         -d      TEXT     Server description                    │
│ --version             -v      TEXT     Server version                        │
│ --ssl-certfile        -t      TEXT     SSL certfile                          │
│ --ssl-keyfile         -K      TEXT     SSL keyfile                           │
│ --root-path                   TEXT     Root path                             │
│ --path-prefix                 TEXT     URL prefix                            │
│ --header              -H      TEXT     Headers in JSON format                │
│ --hot-reload                           Enable hot reload for config file     │
│                                        changes                               │
│ --log-level                   TEXT     Set log level (DEBUG, INFO, WARNING,  │
│                                        ERROR, CRITICAL)                      │
│ --install-completion                   Install completion for the current    │
│                                        shell.                                │
│ --show-completion                      Show completion for the current       │
│                                        shell, to copy it or customize the    │
│                                        installation.                         │
│ --help                                 Show this message and exit.           │
╰──────────────────────────────────────────────────────────────────────────────╯
```

  

# 사용 방법

먼저 사용할 MCP 서버들을 `json` 형태로 선언합니다.   

테스트에 활용될 MCP 서버는 아래와 같이 `time`, `memory` 를 사용하도록 하겠습니다.

  

`mcpo.json` 예제입니다.

```bash
$ cat ~/mcpo.json
{
  "mcpServers": {
        "time": {
      "command": "uvx",
      "args": ["mcp-server-time", "--local-timezone=Asia/Seoul"]
    },
        "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "tags": ["memory", "notes"]
    }
  }
}
```

  

아래와 같은 방법으로 빌드한 이미지를 실행하고 미리 작성한 `mcpo.json` 을 `—config` 옵션을 이용하여 지정합니다.

참고로 `--api-key "top-secret"`   옵션을 추가하면 API 인증을 설정 할 수 있으니, 구성 환경에 적합하게 활용하면 도움이 될 것 같습니다.

```bash
$ docker run -d -p 8000:8000 \
        -v /root/mcpo.json:/app/mcpo.json \
        --restart=always \
        --name mcpo mcpo -- mcpo --config /app/mcpo.json
5414cbd48fd916fd1e9582ade16157a6cc0238c5ae631c830dc411eb4e39817c

$ docker logs -f mcpo
...
2026-01-05 00:48:28,993 - INFO - Successfully connected to 'time'.
2026-01-05 00:48:28,994 - INFO - Initiating connection for server: 'memory'...
Knowledge Graph MCP Server running on stdio
2026-01-05 00:48:39,094 - INFO - Successfully connected to 'memory'.
2026-01-05 00:48:39,095 - INFO -
--- Server Startup Summary ---
2026-01-05 00:48:39,095 - INFO - Successfully connected to:
2026-01-05 00:48:39,096 - INFO -   - time
2026-01-05 00:48:39,096 - INFO -   - memory
2026-01-05 00:48:39,097 - INFO - --------------------------

INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
...
```

위와 같이 `docker logs` 를 이용하여 현재 시작된 MCP 서버를 확인 할 수 있으며, 아래와 같은 방법으로 OpenAPI 호환 API 를 호출 테스트를 할 수 있습니다.   

```bash
$ curl -s localhost:8000/openapi.json | jq
{
  "openapi": "3.1.0",
  "info": {
    "title": "MCP OpenAPI Proxy",
    "description": "Automatically generated API from MCP Tool Schemas\n\n- **available tools**：\n    - [time](/time/docs)\n    - [memory](/memory/docs)",
    "version": "1.0"
  },
  "paths": {}
}

$ curl -s localhost:8000/time/openapi.json | jq
{
  "openapi": "3.1.0",
  "info": {
    "title": "mcp-time",
    "description": "mcp-time MCP Server",
    "version": "1.25.0"
  },
  "servers": [
    {
      "url": "/time"
    }
  ],
  "paths": {
    "/get_current_time": {
      "post": {
        "summary": "Get Current Time",
        "description": "Get current time in a specific timezones",
        "operationId": "tool_get_current_time_post",
...

$ curl -s localhost:8000/memory/openapi.json | jq | head -n6
{
  "openapi": "3.1.0",
  "info": {
    "title": "memory-server",
    "description": "memory-server MCP Server",
    "version": "0.6.3"
...
```

이와 같이 Proxy 된 MCP 서버를 [Open WebUI](https://github.com/open-webui/open-webui) 와 같은 도구에 연결하여 사용하거나, stdio 사용에 보안적인 문제로 인해 고민중이라면 `mcpo` 를 사용하는 것도 좋은 방안이 될 것 같습니다.

  

# 참고 문서

*   MCP Support - [https://docs.openwebui.com/features/plugin/tools/openapi-servers/mcp/](https://docs.openwebui.com/features/plugin/tools/openapi-servers/mcp/)    
*   mcpo - [https://github.com/open-webui/mcpo](https://github.com/open-webui/mcpo)