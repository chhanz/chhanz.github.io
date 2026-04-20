---
layout: post
title: "[AI] OpenClaw에서 Hermes Agent로 마이그레이션"
description: "AI 에이전트 이관 경험"
author: chhanz
date: 2026-04-20
tags: [ai, devops]
categories: [ai]
---

## Hermes Agent 란?

[Hermes Agent](https://github.com/nousresearch/hermes-agent)는 [Nous Research](https://nousresearch.com/)에서 MIT 라이선스로 공개한 AI 에이전트 프레임워크입니다.
기존에 사용하던 OpenClaw의 후속 프로젝트로, Skills 중심 아키텍처와 세션 간 기억(FTS5 검색) 기능을 지원합니다.

이번 포스팅에서는 OpenClaw에서 Hermes Agent로 마이그레이션한 경험에 대해 기록하도록 하겠습니다.

## 마이그레이션 배경

OpenClaw를 약 6개월간 운영하면서 아래 두 가지 한계를 느꼈습니다.

1. **스킬이 정적이다** - 새로운 워크플로우가 필요하면 매번 직접 스킬을 만들어 등록해야 합니다. 에이전트가 스스로 학습한 내용을 기록하는 기능이 없습니다.
2. **세션 간 기억이 얕다** - `USER.md` / `MEMORY.md` 파일 기반 기억 방식은 양이 많아지면 검색이 되지 않습니다. "저번에 해결한 이슈를 다시 찾아줘"가 항상 처음부터 시작됩니다.

Hermes Agent는 이 두 가지에 대해 아래와 같은 해결책을 제공합니다.

- **자율 스킬 생성/업데이트**: 어려운 작업을 완료하면 "스킬로 저장할까요?"를 제안하고, 기존 스킬이 낡으면 자동 수정합니다.
- **세션 검색(session_search)**: 모든 과거 대화가 FTS5에 저장되어 키워드/불리언/prefix 검색이 가능합니다.
- **모델 유연성**: `config.yaml`에서 provider를 한 줄 바꾸면 OpenRouter, Amazon Bedrock, OpenAI 등 200+ LLM을 즉시 전환할 수 있습니다.

## 테스트 환경

- OS: Amazon Linux 2023 (EC2)
- LLM Provider: Amazon Bedrock (Claude Opus 4.6)
- 게이트웨이: Telegram, Slack
- OpenClaw 운영 기간: 약 6개월
- 커스텀 스킬: 16개

## 사전 상태 파악

마이그레이션 전에 기존 OpenClaw 워크스페이스 구조를 확인했습니다.

```
~/.openclaw/
├── openclaw.json              # 메인 설정 (provider, 게이트웨이 토큰, 채널)
├── workspace/
│   ├── SOUL.md                # 에이전트 페르소나 설정
│   ├── USER.md                # 사용자 프로파일
│   ├── AGENTS.md, TOOLS.md    # 에이전트/툴 설정
│   ├── skills/                # 16개 커스텀 스킬
│   └── memory/                # 날짜별 메모리 조각
├── credentials/               # 플랫폼 토큰
├── cron/                      # 스케줄 잡
├── flows/, agents/            # 멀티 에이전트 라우팅
└── memory/main.sqlite         # 런타임 기억 DB
```

이 중 반드시 이관해야 하는 항목은 세 가지로 압축했습니다.

1. **SOUL.md**: 에이전트 페르소나. 이게 깨지면 에이전트가 다른 사람이 됩니다.
2. **custom skills**: 6개월간 축적된 16개 스킬 (블로그 포스팅, 프레젠테이션, 리서치 저장 등)
3. **Amazon Bedrock provider 설정**: EC2 IAM Role + ap-northeast-2 + Claude Opus

## 마이그레이션 실행

### Hermes Agent 설치

아래와 같이 Hermes Agent를 설치합니다.

```bash
$ curl -fsSL https://raw.githubusercontent.com/nousresearch/hermes-agent/main/scripts/install.sh | bash
```

Hermes는 `~/.hermes/`를 홈 디렉토리로 사용하고, OpenClaw는 `~/.openclaw/`를 사용하므로 두 에이전트가 공존 가능합니다.
단계적 이전과 롤백이 가능하다는 점이 중요합니다.

### `hermes claw migrate` 실행

```bash
$ hermes claw migrate
```

`--overwrite` 옵션을 사용하면 이미 존재하는 Hermes 항목도 덮어쓰지만, 저의 경우 첫 실행에서는 `--overwrite` 없이 진행했습니다.

실행 결과 리포트:

```
- migrated: 26
- archived: 15
- skipped:  21
- conflict: 2
- error:    0
```

### 결과 분류

| 상태 | 의미 | 대표 항목 |
|------|------|-----------|
| `migrated` | 1:1로 이관 완료 | 스킬 16개, MEMORY.md, provider 설정, 브라우저 설정 |
| `archived` | Hermes에 매핑이 없어 archive 폴더에 보관 | IDENTITY.md, TOOLS.md, 크론 잡, 멀티에이전트 라우팅 |
| `skipped` | 원본 값 없음 또는 이미 존재하여 생략 | 미사용 플랫폼 설정, TTS 설정 |
| `conflict` | 이미 존재해서 덮어쓰지 않음 | SOUL.md, 모델 설정 |
| `error` | 실패 | (없음) |

`migrated` 26개 중 16개가 스킬이며, 나머지는 메모리, 에이전트 설정, 브라우저 설정 등이 포함되어 있습니다.

실제로 이관된 경로:

```
~/.openclaw/workspace/skills/* → ~/.hermes/skills/openclaw-imports/*
```

## 수동 처리가 필요한 항목

### 1. SOUL.md 페르소나 이전

```bash
$ cp ~/.openclaw/workspace/SOUL.md ~/.hermes/SOUL.md.imported
$ diff ~/.hermes/SOUL.md ~/.hermes/SOUL.md.imported
```

Hermes의 `SOUL.md`는 OpenClaw 대비 섹션 구조가 다릅니다 (`Core Truths`, `Vibe`, `Boundaries`, `Continuity`).
그대로 덮어쓰지 말고 섹션별로 병합하는 것이 맞습니다.

### 2. 크론 잡 재등록

크론 잡은 자동 이관되지 않습니다. 아카이브된 내용을 확인 후 재등록합니다.

```bash
$ cat ~/.hermes/migration/openclaw/*/archive/cron-store/*.json
```

저의 경우 에이전트에게 "아카이브된 크론 잡들을 보고 Hermes에 맞게 다시 등록해줘"라고 요청하는 것이 가장 정확했습니다.

### 3. 게이트웨이 전환

OpenClaw 게이트웨이를 바로 삭제하지 않고, 비활성화만 해두는 것이 안전합니다.

```bash
# OpenClaw 게이트웨이 비활성화
$ systemctl --user disable --now openclaw-gateway

# Hermes 게이트웨이 설치 및 시작
$ hermes gateway install
$ hermes gateway start
```

### 4. OpenClaw 디렉토리 처리

Hermes가 안정화된 후에 아래 명령으로 OpenClaw 디렉토리를 정리합니다.

```bash
$ hermes claw cleanup
# → ~/.openclaw 를 ~/.openclaw.pre-migration 으로 리네이밍
```

## 이관 후 만난 버그: Amazon Bedrock Claude 모델 사용 불가

이관 후 첫 실행에서 아래와 같은 에러가 발생했습니다.

```
The provided model identifier is invalid.
```

Nova 모델은 정상 동작하는데 **Claude 모델만 실패**하는 현상이었습니다.

### 원인: `normalize_model_name()`의 점(.) 치환 문제

Amazon Bedrock 모델 ID는 점을 구조적 구분자로 사용합니다:

```
global.anthropic.claude-opus-4-6-v1
```

그런데 Hermes의 `agent/anthropic_adapter.py`에서 OpenRouter 포맷을 가정하고 모든 점을 하이픈으로 바꾸면서 Amazon Bedrock이 인식하지 못하는 ID가 생성되었습니다.

```
global-anthropic-claude-opus-4-6-v1   ← Amazon Bedrock이 모르는 ID
```

### 수정

해당 파일을 패치하여 Amazon Bedrock 모델 ID일 경우 점 치환을 건너뛰도록 수정했습니다. 단위 테스트 182건 통과를 확인 후 PR을 제출했습니다.

- PR: [https://github.com/NousResearch/hermes-agent/pull/12778](https://github.com/NousResearch/hermes-agent/pull/12778)

**교훈**: Hermes Agent는 아직 Amazon Bedrock Claude처럼 비주류 경로에서 버그를 만날 가능성이 있습니다. 다만 오픈소스이므로 직접 고치고 PR을 보낼 수 있다는 점이 장점입니다.

## 이관 후 체감 변화

### 좋았던 점

1. **스킬 로딩이 명시적** - 시스템 프롬프트에 스킬 목록이 주입되고, 관련 있으면 자동 로드됩니다. 예측 가능합니다.
2. **세션 검색이 실용적** - "저번에 이 이슈 어떻게 풀었지?"에 에이전트가 자진해서 검색하고 요약해줍니다.
3. **서브에이전트 위임** - 병렬 작업과 컨텍스트 폭주 방지에 유용합니다.
4. **내장 도구 최적화** - `read_file`, `search_files`, `patch`가 셸 명령보다 우선이고 토큰 소비가 적습니다.
5. **Command Approval Required** - Hermes Agent는 파일 수정, 외부 메시지 전송 등 주요 액션을 실행하기 전에 사용자 승인을 요청합니다. OpenClaw에서는 에이전트가 바로 실행해버리는 경우가 있어 불안했는데, 승인 과정이 추가되면서 안정적으로 운영할 수 있다는 체감이 큽니다.
6. **채널 이관이 즉시 완료** - 텔레그램, 슬랙 등 기존 게이트웨이 채널 설정이 `config.yaml`에 토큰만 옮기면 바로 연결됩니다. 채널별 재인증이나 봇 재등록 없이 기존 대화방에서 그대로 사용할 수 있어 편리했습니다.
7. **슬랙 봇 상태 표시 지원** - OpenClaw에서는 슬랙 봇이 동작 중인지 알 수 없었는데, Hermes Agent로 이관 후에는 "평가중", "정리중" 같은 상태 표시가 슬랙에 표기됩니다. 에이전트가 요청을 처리 중인지 한눈에 알 수 있어 사용 경험이 크게 개선되었습니다.

### 아쉬운 점

1. **문서가 아직 얇다** - 공식 문서나 커뮤니티 자료가 아직 충분하지 않아, 트러블슈팅 시 소스코드를 직접 읽어야 하는 경우가 많습니다.
2. **커뮤니티 스킬이 적다** - OpenClaw는 5,400+ 스킬, Hermes는 자체 생성 중심이라 초기 선택지가 적습니다.
3. **마이그레이션 도구가 archive로 밀어두는 항목이 많다** - 크론/멀티에이전트/게이트웨이를 수동으로 재설정해야 합니다.

## 참고 자료

- Hermes Agent GitHub: [https://github.com/nousresearch/hermes-agent](https://github.com/nousresearch/hermes-agent)
- OpenClaw GitHub: [https://github.com/openclaw/openclaw](https://github.com/openclaw/openclaw)
