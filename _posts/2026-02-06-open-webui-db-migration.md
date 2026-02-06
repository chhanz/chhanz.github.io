---
layout: post
title: "[OpenWebUI] SQLite to PostgreSQL Migration"
description: "Open WebUI 의 데이터베이스를 SQLite 에서 PostgreSQL 로 마이그레이션하는 방법"
author: chhanz
date: 2026-02-02
tags: [ai, linux, docker]
categories: [ai]
---

# Open WebUI - SQLite to PostgreSQL Migration

## Open WebUI 란?

[Open WebUI](https://github.com/open-webui/open-webui) 는 다양한 LLM(Large Language Model) 을 웹 브라우저에서 편리하게 사용할 수 있도록 해주는 오픈소스 웹 인터페이스입니다.    
기본적으로 데이터 저장소로 SQLite 를 사용하지만, 다수의 사용자가 동시에 접근하는 환경에서는 SQLite 의 동시 접근성 한계로 인해 데이터베이스 잠금(lock) 이슈가 발생할 수 있습니다.   

이번 포스팅에서는 이러한 SQLite 의 한계를 해결하기 위해 Open WebUI 의 데이터베이스를 PostgreSQL 로 마이그레이션하는 방법에 대해 기록하도록 하겠습니다.   

## 테스트 환경

| 항목 | 내용 |
|------|------|
| OS | Amazon Linux 2023 |
| Open WebUI | `ghcr.io/open-webui/open-webui:main` |
| PostgreSQL | `postgres:18-alpine` (Docker) |
| Migration Tool | [open-webui-postgres-migration](https://github.com/taylorwilsdon/open-webui-postgres-migration) |

## 사전 준비 - PostgreSQL 구성

먼저 마이그레이션 대상이 될 PostgreSQL 을 Docker Compose 로 구성합니다.   
아래와 같이 `compose.yaml` 파일을 작성합니다.   

```yaml
$ cat pgsql/compose.yaml
services:

  db:
    image: postgres:18-alpine
    restart: always
    shm_size: 512mb
    volumes:
      - /root/data/pgsql:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: postgres
    ports:
      - "5432:5432"
```

아래 명령어를 통해 PostgreSQL 컨테이너를 시작합니다.   

```bash
$ cd pgsql && docker compose up -d
```

## Step 1) PostgreSQL 데이터베이스 초기화 (Bootstrap)

Open WebUI 가 사용하는 테이블 스키마를 PostgreSQL 에 생성하기 위해, 임시로 Open WebUI 를 PostgreSQL 에 연결하여 구동합니다.   
이 과정을 통해 Open WebUI 가 자동으로 필요한 테이블을 생성합니다.   

```bash
$ cat open-webui-imsi.sh
#!/bin/bash

docker run -d \
    --restart=always \
    -e DATABASE_URL=postgres://'postgres':'passwd'@<host ip>:5432/postgres \
    --name open-webui-imsi \
    ghcr.io/open-webui/open-webui:main
```

위 스크립트를 실행하여 임시 컨테이너를 구동합니다.   

```bash
$ bash open-webui-imsi.sh
```

테이블 생성이 완료되면 임시 컨테이너를 중지하고 삭제합니다.   

```bash
$ docker stop open-webui-imsi && docker rm open-webui-imsi
```

## Step 2) 기존 SQLite 데이터베이스 백업

마이그레이션 진행 전 반드시 기존 SQLite 데이터베이스를 백업합니다.   

```bash
$ cp /root/data/webui.db /root/data/webui.db.backup
```

또한 기존 Open WebUI 컨테이너를 중지하여 데이터 정합성을 확보합니다.   

```bash
$ docker stop open-webui
```

## Step 3) 마이그레이션 도구 설치

마이그레이션에는 [open-webui-postgres-migration](https://github.com/taylorwilsdon/open-webui-postgres-migration) 도구를 사용합니다.   
아래와 같이 도구를 설치합니다.   

```bash
$ git clone https://github.com/taylorwilsdon/open-webui-postgres-migration.git
$ cd open-webui-postgres-migration
$ python -m venv venv
$ source venv/bin/activate
(venv) $ pip install -r requirements.txt
```

## Step 4) 마이그레이션 실행

### Foreign Key Check 에러 해결

마이그레이션 도구를 실행하면 SQLite 데이터베이스의 무결성 검사(Integrity Check) 를 수행합니다.   
이 과정에서 아래와 같이 **Foreign Key Check 에러**가 발생할 수 있습니다.   

```
(venv) $ python migrate.py
╭──────────────────────────────────────────────────────────────────────╮
│ SQLite Database Configuration                                        │
╰──────────────────────────────────────────────────────────────────────╯
SQLite database path (webui.db): /root/data/webui.db

✓ Valid SQLite database (version 3.40.0)
╭──────────────────────────────────────────────────────────────────────╮
│ Running SQLite Database Integrity Check                               │
╰──────────────────────────────────────────────────────────────────────╯
Failed Foreign Key Check: [('chat_file', 1, 'chat', 1), ('chat_file', 2, 'chat', 1),
('chat_file', 3, 'chat', 1), ('chat_file', 4, 'chat', 1), ('chat_file', 5, 'chat', 1),
('knowledge_file', 1, 'knowledge', 1), ('knowledge_file', 2, 'knowledge', 1),
...생략
Aborting migration due to database integrity issues
```

이 에러는 `chat_file` 및 `knowledge_file` 테이블에 부모 테이블(`chat`, `knowledge`) 에 존재하지 않는 고아 레코드(orphaned records) 가 남아 있어 발생합니다.   

아래와 같이 SQLite 에서 고아 레코드를 정리하여 해결합니다.   

> 참고 : [https://github.com/taylorwilsdon/open-webui-postgres-migration/issues/19](https://github.com/taylorwilsdon/open-webui-postgres-migration/issues/19)   

```bash
$ sqlite3 /root/data/webui.db
```
   
```sql
-- Remove orphaned chat_file records
DELETE FROM chat_file WHERE chat_id NOT IN (SELECT id FROM chat);

-- Remove orphaned knowledge_file records
DELETE FROM knowledge_file WHERE knowledge_id NOT IN (SELECT id FROM knowledge);
```

### 마이그레이션 수행

고아 레코드 정리 후 다시 마이그레이션 도구를 실행합니다.   

```
(venv) $ python migrate.py
╭──────────────────────────────────────────────────────────────────────╮
│ SQLite Database Configuration                                        │
╰──────────────────────────────────────────────────────────────────────╯
SQLite database path (webui.db): /root/data/webui.db

✓ Valid SQLite database (version 3.40.0)
╭──────────────────────────────────────────────────────────────────────╮
│ Running SQLite Database Integrity Check                               │
╰──────────────────────────────────────────────────────────────────────╯
┏━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━┓
┃ Check Type        ┃ Status    ┃
┡━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━┩
│ Integrity Check   │ ✅ Passed │
│ Quick Check       │ ✅ Passed │
│ Foreign Key Check │ ✅ Passed │
└───────────────────┴───────────┘
╭──────────────────────────────────────────────────────────────────────╮
│ PostgreSQL Connection Configuration                                  │
╰──────────────────────────────────────────────────────────────────────╯
PostgreSQL host (localhost): <host ip>
PostgreSQL port (5432):
Database name (postgres):
Username (postgres):
Password:

Connection Details:
 host:      <host ip>
 port:      5432
 dbname:    postgres
 user:      postgres
 password:  ********

✓ Database connection successful!
✓ PostgreSQL database has been properly bootstrapped!

Proceed with these settings? [y/n]: y
╭──────────────────────────────────────────────────────────────────────╮
│ Batch Size Configuration                                             │
╰──────────────────────────────────────────────────────────────────────╯
The batch size determines how many records are processed at once.
A larger batch size may be faster but uses more memory.
Recommended range: 100-5000

Batch size (500):
╭──────────────────────────────────────────────────────────────────────╮
│ Starting Migration Process                                           │
╰──────────────────────────────────────────────────────────────────────╯
  Migrating auth...             ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%
  Migrating chat...             ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%
  Migrating document...         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%
  Migrating prompt...           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%
  Migrating memory...           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%
  Migrating model...            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%
  Migrating tool...             ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%
  Migrating function...         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%
  Migrating config...           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%
  Migrating tag...              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%
  Migrating file...             ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%
  Migrating user...             ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%
  Migrating knowledge...        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%
  Migrating knowledge_file...   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%
  Migrating chat_file...        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%
...생략
```

위와 같이 모든 테이블의 마이그레이션이 정상적으로 완료된 것을 확인 할 수 있습니다.   

## Step 5) Open WebUI 설정 변경

마이그레이션이 완료되었으므로, Open WebUI 가 PostgreSQL 을 사용하도록 설정을 변경하여 컨테이너를 재시작합니다.   

```bash
$ cat open-webui.sh
#!/bin/bash

docker run -d -p 80:8080 \
    -v /root/data:/app/backend/data \
    --restart=always \
    -e WEBUI_SECRET_KEY='1234567890abcdefg' \
    -e DATABASE_URL=postgres://'postgres':'password'@<host ip>:5432/postgres \
    --name open-webui \
    ghcr.io/open-webui/open-webui:main
```

```bash
$ bash open-webui.sh
```

위와 같이 `DATABASE_URL` 환경 변수를 PostgreSQL 연결 문자열로 설정하여 Open WebUI 를 시작합니다.   

## 마무리

위와 같은 방법으로 Open WebUI 의 데이터베이스를 SQLite 에서 PostgreSQL 로 마이그레이션이 가능합니다.   
PostgreSQL 로 전환 후에는 다수의 사용자가 동시에 접근하는 환경에서도 데이터베이스 잠금 이슈 없이 안정적으로 서비스를 운영할 수 있습니다.   

## 참고

- Open WebUI GitHub : [https://github.com/open-webui/open-webui](https://github.com/open-webui/open-webui)   
- Migration Tool : [https://github.com/taylorwilsdon/open-webui-postgres-migration](https://github.com/taylorwilsdon/open-webui-postgres-migration)   
- Foreign Key Check Issue : [https://github.com/taylorwilsdon/open-webui-postgres-migration/issues/19](https://github.com/taylorwilsdon/open-webui-postgres-migration/issues/19)   
- WEBUI_SECRET_KEY : [https://docs.openwebui.com/getting-started/env-configuration/#webui_secret_key](https://docs.openwebui.com/getting-started/env-configuration/#webui_secret_key)