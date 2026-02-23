---
layout: post
title: "Container Registry - Github Package Registry 사용 with GITHUB CLI"
description: "DockerHub 대체 용도"
author: chhanz
date: 2026-01-13
tags: [linux]
category: linux
---

<center>
<img width="800" height="430" src="https://github.blog/wp-content/uploads/2019/05/facebook-1200x630-final.png?resize=1200%2C630" class="d-block cover-image wp-post-image" alt="" decoding="async" loading="lazy" srcset="https://github.blog/wp-content/uploads/2019/05/facebook-1200x630-final.png?w=1200 1200w, https://github.blog/wp-content/uploads/2019/05/facebook-1200x630-final.png?w=300 300w, https://github.blog/wp-content/uploads/2019/05/facebook-1200x630-final.png?w=768 768w, https://github.blog/wp-content/uploads/2019/05/facebook-1200x630-final.png?w=1024 1024w" sizes="auto, (max-width: 1200px) 100vw, 1200px">
</center>
   
# Github Package Registry
DockerHub 의 대안으로 Github Package Registry 를 사용해보고 `github-cli` 인 `gh` 를 사용하여 보다 안전하게 컨테이너 이미지를 관리하는 방법에 대해 작성해보도록 하겠습니다.   
   
# Github CLI 설치
Github CLI ([https://cli.github.com/](https://cli.github.com/)) 페이지를 참고하여 설치를 수행합니다.   
   
저의 경우, Linux 시스템에 아래와 같은 방법으로 설치하였습니다.   
```bash
type -p yum-config-manager >/dev/null || sudo yum install yum-utils
sudo yum-config-manager --add-repo https://cli.github.com/packages/rpm/gh-cli.repo
sudo yum install gh
```
   
# Github CLI 를 이용하여 Github Login
Github CLI 를 이용하여 로그인을 하는 사유에는 암호화가 안되고 텍스트로 보관하고 있던 토큰값을 관리하는데 귀찮음(?), 안정성에 문제로 인해 `gh` 를 이용하면 좋을 것 같아 이번 포스트에서는 해당 방법을 사용하였습니다.   
   
`gh auth` 명령어를 이용하여 Github 를 로그인 할 수 있습니다.
   
```bash
$ gh auth login --scopes write:packages
? Where do you use GitHub? GitHub.com
? What is your preferred protocol for Git operations on this host? HTTPS
? Authenticate Git with your GitHub credentials? Yes
? How would you like to authenticate GitHub CLI? Login with a web browser

! First copy your one-time code: 1234-abcd
Press Enter to open https://github.com/login/device in your browser...
```
    
![](/assets/images/post/2026-01-13-gh/g1.png)    
    
브라우져를 통해 github 에 one-time code 와 함께 device 인증을 수행하면 위와 같이 인증이 완료된 모습을 확인 할 수 있으며, 다음 단계가 수행이 됩니다.   
   
```bash
...
✓ Authentication complete.
- gh config set -h github.com git_protocol https
✓ Configured git protocol
! Authentication credentials saved in plain text
✓ Logged in as chhanz
```
   
참고로 `--scopes write:packages` 는 차후 컨테이너 이미지 저장소에 이미지 PUSH 를 위해 미리 권한을 부여하였습니다.   
필요시에 적합한 권한을 부여하여 로그인을 수행하면 됩니다.   
만약 새로운 권한이 필요한 경우, [`gh auth refresh`](https://cli.github.com/manual/gh_auth_refresh) 를 사용하여 권한을 추가하면 됩니다.   
   
# Github 로그인 상태 확인
`gh auth status` 명령을 통해 로그인 상태, 권한 등에 대해 확인이 가능합니다.    
해당 명령어로는 기본적으로 암호화된 토큰 정보만 확인이 가능합니다.   
   
```bash
$ gh auth status
github.com
  ✓ Logged in to github.com account chhanz (/root/.config/gh/hosts.yml)
  - Active account: true
  - Git operations protocol: https
  - Token: git_***.......
  - Token scopes: 'gist', 'read:org', 'repo', 'workflow', 'write:packages'
```
   
# Push the Container Image
이번 테스트에서는 `podman` 을 이용하여 이미지를 PUSH 하는 예제를 보여드릴 것입니다.   
하지만 `docker` 도 동일한 방법으로 사용이 가능합니다.   
   
```bash
$ export CR_PAT=$(gh auth token) \
&& echo $CR_PAT | podman login ghcr.io -u <<USERNAME>> --password-stdin
Login Succeeded!
```
   
위 명령어를 통해 `gh` 로 토큰값을 받아와서 `ghcr.io`, Github Package Registry 를 로그인합니다.   
    
```bash
$ podman images
REPOSITORY                              TAG         IMAGE ID      CREATED       SIZE
ghcr.io/chhanz/git-readme-stats-docker  latest      2f2b17297e20  5 hours ago   300 MB
```
   
위와 같이 빌드된 이미지를 tag 를 아래 구조를 참고하여 수정한 이미지를 활용합니다.   
   
> ghcr.io/네임스페이스/컨테이너 이미지 이름:태그   
    
    
```bash
$ podman push ghcr.io/chhanz/git-readme-stats-docker
Getting image source signatures
Copying blob f35e3e5c2bc9 done   |
Copying blob 0649e2656ebe done   |
Copying blob e5aa2ce04d97 done   |
Copying blob def753c8a096 done   |
Copying blob bf948625900f done   |
Copying blob 7bb20cf5ef67 done   |
Copying config 2f2b17297e done   |
Writing manifest to image destination
```
설정된 태그를 이용하여 위와 같이 PUSH 를 수행합니다.   
    
# Change package visibility
기본적으로 PUSH 된 이미지는 private 로 되어 있습니다.    
GITHUB 정책에 의하여 무료로 사용 가능한 private 제한이 있고, public 이미지의 경우 무료로 사용이 가능합니다.   
   
위와 같은 사유로 인해 이미지를 Public 으로 변경을 해보도록 하겠습니다.   
   
![](/assets/images/post/2026-01-13-gh/g3.png)    
   
GITHUB 의 Package 메뉴를 선택하면 위와 같이 이미지가 PUSH 된 것을 확인 할 수 있습니다.   
먼저 `Connect Repository` 를 선택하고 해당 이미지와 연결할 `Repository` 를 지정합니다.   
   
![](/assets/images/post/2026-01-13-gh/g4.png)    
   
위와 같이 `Repository` 가 연결된 것을 확인 할 수 있습니다.   
이후 `Package settings` 를 선택합니다.   
    
![](/assets/images/post/2026-01-13-gh/g2.png)    
   
설정 하단에 `Change package visibility` 부분에 `Change visibility` 를 이용하여 private 에서 public 이미지로 변경을 합니다.   
   
위와 같은 방법으로 이미지를 Public 으로 변경합니다.    
    
![](/assets/images/post/2026-01-13-gh/g5.png)    
    
[https://github.com/chhanz?tab=packages](https://github.com/chhanz?tab=packages) 를 보시면 이미지가 Public 으로 전환 된 것을 확인 할 수 있습니다.   
   
# 참고 문서
* [https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)    
* [https://cli.github.com/manual/](https://cli.github.com/manual/)    
