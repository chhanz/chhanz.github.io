---
layout: post
title: "[Docker] Traefik 기본 사용법"
description: "Traefik 기본 사용법"
author: chhanz
date: 2026-02-27
tags: [docker]
categories: [docker]
---

# Traefik 기본 사용법

이번 포스팅에서는 Docker 환경에서 **Traefik**을 구성하고 사용하는 방법에 대해 기록하도록 하겠습니다.

## Traefik 이란?

Traefik은 클라우드 네이티브 환경을 위한 리버스 프록시 / 로드 밸런서입니다.   
Nginx나 HAProxy와 같은 전통적인 프록시와 달리, 서비스를 자동으로 감지하고 라우팅 설정을 동적으로 업데이트하는 것이 특징입니다.   

특히 Docker 환경에서 컨테이너에 레이블(Label)만 추가하면 자동으로 라우팅이 설정되어, 별도로 설정 파일을 관리할 필요가 없습니다.

## 테스트 환경

* 테스트 환경 : Amazon Linux 2023
* Traefik : v3.3

## 핵심 개념

Traefik 은 4가지 핵심 컴포넌트로 구성됩니다.

![Traefik 핵심 개념 흐름도](/assets/images/post/2026-02-27-traefik-basic-usage/1.png)

### EntryPoints
외부에서 들어오는 네트워크 포트를 정의합니다.

```yaml
entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"
```

### Routers
요청을 규칙에 따라 분류하여 적절한 서비스로 연결합니다.

```yaml
# Host 기반 라우팅
rule: "Host(`example.com`)"

# Path 기반 라우팅
rule: "PathPrefix(`/api`)"

# 복합 조건
rule: "Host(`example.com`) && PathPrefix(`/api`)"
```

### Middlewares
라우터와 서비스 사이에서 요청/응답을 변환하는 플러그인입니다.

| 미들웨어 | 용도 |
|----------|------|
| `basicAuth` | HTTP Basic 인증 |
| `redirectScheme` | HTTP → HTTPS 리다이렉트 |
| `stripPrefix` | URL 경로 앞부분 제거 |
| `rateLimit` | 요청 속도 제한 |
| `headers` | 헤더 추가/수정 |

### Providers
Traefik이 라우팅 설정을 읽어오는 소스입니다.

| Provider | 설명 |
|----------|------|
| `docker` | Docker 컨테이너 레이블 자동 감지 |
| `file` | 정적 YAML/TOML 파일 |
| `kubernetes` | Kubernetes Ingress |

## 설치 (Docker Compose)

아래와 같은 방법으로 Traefik 을 구성합니다.

### 디렉토리 구조

```
traefik/
├── docker-compose.yml
├── traefik.yml        ← 정적 설정 (Static Config)
└── dynamic.yml        ← 동적 설정 (Dynamic Config)
```

### traefik.yml (정적 설정)

```yaml
# traefik.yml
api:
  dashboard: true
  insecure: true       # 대시보드 인증 없이 접근 (개발용)

entryPoints:
  web:
    address: ":80"

providers:
  docker:
    exposedByDefault: false   # 레이블 없는 컨테이너는 노출 안 함
  file:
    filename: /etc/traefik/dynamic.yml
    watch: true               # 파일 변경 자동 감지

log:
  level: INFO
```

### docker-compose.yml

```yaml
services:
  traefik:
    image: traefik:v3.3
    container_name: traefik
    restart: unless-stopped
    ports:
      - "80:80"
      - "127.0.0.1:8888:8080"   # 대시보드 (로컬 전용)
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/etc/traefik/traefik.yml:ro
      - ./dynamic.yml:/etc/traefik/dynamic.yml:ro
    networks:
      - traefik_net

networks:
  traefik_net:
    external: true
```

> 대시보드 포트(`8888`)는 `127.0.0.1`에만 바인딩하여 외부 노출을 차단합니다.

## 실전 예시 1 — Docker 컨테이너 라우팅

컨테이너에 레이블만 추가하면 Traefik 이 자동으로 라우팅 설정을 감지합니다.

```yaml
services:
  myapp:
    image: nginx
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.myapp.rule=Host(`myapp.example.com`)"
      - "traefik.http.routers.myapp.entrypoints=web"
      - "traefik.http.services.myapp.loadbalancer.server.port=80"
    networks:
      - traefik_net
```

위와 같이 레이블을 추가하면 `myapp.example.com` 으로 들어오는 요청이 해당 컨테이너로 자동 라우팅되는 것을 확인 할 수 있습니다.

## 실전 예시 2 — Path 기반 라우팅

여러 서비스를 하나의 도메인에서 경로로 분리할 때 아래와 같이 구성합니다.

```yaml
services:
  # docs.example.com/      → open-webui
  open-webui:
    image: ghcr.io/open-webui/open-webui
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.webui.rule=Host(`docs.example.com`)"
      - "traefik.http.routers.webui.entrypoints=web"

  # docs.example.com/docs/ → mkdocs
  mkdocs:
    image: squidfunk/mkdocs-material
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.mkdocs.rule=Host(`docs.example.com`) && PathPrefix(`/docs`)"
      - "traefik.http.routers.mkdocs.entrypoints=web"
```

## 실전 예시 3 — BasicAuth 미들웨어

특정 서비스에 HTTP Basic 인증을 추가하는 방법입니다.

### 비밀번호 해시 생성

```bash
$ htpasswd -nb username password
username:$apr1$xxxxxxxx$hashedpassword
```

### dynamic.yml 에 미들웨어 정의

출력된 해시를 그대로 `dynamic.yml` 에 붙여넣으면 됩니다.

```yaml
# dynamic.yml
http:
  middlewares:
    my-auth:
      basicAuth:
        users:
          - "username:$apr1$xxxxxxxx$hashedpassword"
```

### 컨테이너 레이블에서 참조

```yaml
labels:
  - "traefik.http.routers.myapp.middlewares=my-auth@file"
```

> 파일 프로바이더의 미들웨어를 Docker 레이블에서 참조할 때는 반드시 `@file` 접미사를 붙여야 합니다.

## 실전 예시 4 — ELB 헬스체크 처리

AWS ELB(Elastic Load Balancer) 뒤에 Traefik을 배치할 때, ELB 헬스체크는 Host 헤더를 포함하지 않습니다.   
이 경우 아래와 같이 별도 라우터를 파일 프로바이더로 등록합니다.

```yaml
# dynamic.yml
http:
  routers:
    elb-health:
      rule: "Path(`/health`)"
      entryPoints:
        - web
      service: health-service
      priority: 1

  services:
    health-service:
      loadBalancer:
        servers:
          - url: "http://localhost"
```

위와 같이 구성하면 Host 조건 없이 `/health` 경로만으로 라우팅되어 ELB 헬스체크가 정상 통과됩니다.

## 대시보드

Traefik 대시보드를 통해 현재 라우터/서비스/미들웨어 상태를 실시간으로 확인 할 수 있습니다.

```bash
# 로컬에서 접속
http://localhost:8888/dashboard/

# API 로 라우터 목록 확인
$ curl http://localhost:8888/api/http/routers | jq .
```

## 주의 사항

Docker 레이블의 Host rule 작성 시 반드시 백틱(`` ` ``)을 사용해야 합니다.

```yaml
# ✅ 올바른 문법
- "traefik.http.routers.myapp.rule=Host(`myapp.example.com`)"

# ❌ 작동 안 함
- 'traefik.http.routers.myapp.rule=Host("myapp.example.com")'
```

## 참고 자료

* [Traefik 공식 문서](https://doc.traefik.io/traefik/)
* [Traefik Concepts](https://doc.traefik.io/traefik/getting-started/concepts/)
* [Docker Provider](https://doc.traefik.io/traefik/providers/docker/)
* [File Provider](https://doc.traefik.io/traefik/providers/file/)
* [BasicAuth Middleware](https://doc.traefik.io/traefik/middlewares/http/basicauth/)
* [Docker Hub — traefik](https://hub.docker.com/_/traefik)
