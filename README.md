![Jekyll site CI](https://github.com/chhanz/chhanz.github.io/workflows/Jekyll%20site%20CI/badge.svg)   

# `chhanz` Tech blog

[@Go to the Page Information.](https://chhanz.github.io/about)

Thanks for visit. :)



## AEO (요약 / 자주 묻는 질문) 데이터

포스트별 AEO 데이터는 `_data/aeo/<포스트 파일명(확장자 제외)>.yml` 에 둡니다.
빌드 시 `_plugins/aeo_data.rb` 가 해당 포스트에 병합하며, 포스트 front matter 에 같은 키가 있으면 front matter 가 우선합니다.
포스트 파일을 건드리지 않으므로 수정일(`dateModified`, sitemap `lastmod`)이 바뀌지 않습니다.

```yaml
# _data/aeo/2026-10-30-asahi-linux-macos-keymap.yml
description: "(포스트 description 이 비어 있을 때만 사용)"
keywords: ["Asahi Linux", "Toshy"]          # 본문의 구체적 제품/도구/명령명
summary:                                   # 글 상단 "요약" 박스 (결론 먼저, 2~3개)
  - "..."
tested_on: "Fedora Asahi Remix 44, ..."    # 본문에 테스트 환경이 있을 때만
faq:                                       # 글 하단 "자주 묻는 질문" + FAQPage JSON-LD
  - q: "...?"
    a: "..."
```

새 글은 위 필드를 front matter 에 직접 써도 됩니다.
