---
layout: post
title: "[Devops] Jenkins CI Pipeline 구성"
description: " "
author: chhanz
date: 2020-05-04
tags: [devops]
category: devops
---

# 목차
+ [Gitlab-CE 설치](https://chhanz.github.io/devops/2020/02/16/install-gitlab/)   
+ [Jenkins 설치](https://chhanz.github.io/devops/2020/04/16/install-jenkins/)   
+ [Nexus Repository Manager 설치](https://chhanz.github.io/devops/2020/04/17/install-nexus-ce/)   
+ [Jenkins CI Pipeline 구성](https://chhanz.github.io/devops/2020/05/04/jenkins-ci/) 
   
# Jenkin 를 이용하여 CI 를 자동화해보자!
이번 포스팅에서는 Jenkins 를 이용하여 CI 를 자동화 하는 방법을 알아보도록 하겠습니다.   
이 구성은 Github 의 [Actions](https://help.github.com/en/actions) 와 비슷하게 구성 할 수 있습니다.   
   
# Pipeline 시나리오
1) Gitlab 의 특정 Project 에서 `Push` or `Merge` 가 발생하면 Jenkins 에 CI 를 발생하도록 webhook 을 발생한다.   
2) Jenkins 는 설정된 Pipeline 에 맞게 CI 를 진행한다.   
3) CI 는 Clone source > docker build > docker run > docker rm 으로 진행 됩니다.   

# CI 설정
## 테스트 소스
CI 테스트용으로 사용될 소스는 아래와 같습니다.   
<img src="/assets/images/post/2020-05-04-jenkins-ci/1.png" style="max-width: 95%; height: auto;">   
* `Dockerfile` 과 `index.html` 로 구성된 소스입니다.   
   
```docker
FROM httpd

COPY index.html /usr/local/apache2/htdocs
```
* `Dockerfile` 내용입니다.   
* `httpd` image 에 `index.html` 를 추가하는 `Dockerfile` 입니다.   
   
<img src="/assets/images/post/2020-05-04-jenkins-ci/2.png" style="max-width: 95%; height: auto;">   
* `index.html` 내용입니다.   
   
## Jenkins Token 생성 및 등록
<img src="/assets/images/post/2020-05-04-jenkins-ci/3.png" style="max-width: 95%; height: auto;">   
* `Gitlab` - `User Setting` - `Access Tokens` 를 선택합니다. 이후 위와 같이 Token 을 생성합니다.  
   
<img src="/assets/images/post/2020-05-04-jenkins-ci/4.png" style="max-width: 95%; height: auto;">   
* 생성된 Token 값을 복사합니다.   
   
<img src="/assets/images/post/2020-05-04-jenkins-ci/5.png" style="max-width: 95%; height: auto;">   
* `Jenkins` - `Credentials` 에서 신규 Credentials 를 추가합니다.   
   
<img src="/assets/images/post/2020-05-04-jenkins-ci/6.png" style="max-width: 95%; height: auto;">   
* `Gitlab API Token` 로 Token 이 생성 되었습니다.    
   
<img src="/assets/images/post/2020-05-04-jenkins-ci/7.png" style="max-width: 95%; height: auto;">   
* Jenkins 관리 - Gitlab 부분에서 조금전 생성한 Token 및 Gitlab Host 정보를 입력합니다.   
   
## Pipeline 생성
<img src="/assets/images/post/2020-05-04-jenkins-ci/8.png" style="max-width: 95%; height: auto;">   
* 새 작업을 선택합니다.   
   
<img src="/assets/images/post/2020-05-04-jenkins-ci/9.png" style="max-width: 95%; height: auto;">   
* Project 이름을 지정하고 Pipeline 항목을 선택합니다.   
   
<img src="/assets/images/post/2020-05-04-jenkins-ci/10.png" style="max-width: 95%; height: auto;">   
* 제일 하단에 위와 같이 Pipeline script 를 입력합니다.   

<img src="/assets/images/post/2020-05-04-jenkins-ci/11.png" style="max-width: 95%; height: auto;">   
* 테스트로 진행된 Pipeline 이 정상적으로 작동되는 것을 볼 수 있습니다.   

<img src="/assets/images/post/2020-05-04-jenkins-ci/12.png" style="max-width: 95%; height: auto;">   
* 참고로 위와 같이 각 Job 별로 상세 로그를 확인 할 수 있습니다.   

## Pipeline Script 추가
```console
node {
    stage ('clone') {
        git branch: 'master', credentialsId: 'chhanz', url: 'git@gitlab.example.com:chhanz/cicd-httpd-source.git'
    }

    stage ('docker build') {
         sh ' docker build --tag sample-ci-httpd .'
    }
    
    stage ('run docker') {
         sh ' docker run -d -ti --name jenkins-ci -p 33333:80 sample-ci-httpd'
    }
    
    stage ('check httpd') {
         sh 'curl -s http://127.0.0.1:33333'
    }
    
    stage ('rm docker') {
         sh ' docker rm -f jenkins-ci'
    }

}
```
위와 같이 Pipeline Script 를 구성하였습니다.   
* 상세 Pipeline 순서
> 1) Clone Source   
> 2) Build Image   
> 3) Run Container   
> 4) Healthy check    
> 5) Delete Container   

## Build 결과
<img src="/assets/images/post/2020-05-04-jenkins-ci/13.png" style="max-width: 95%; height: auto;">   
* 특이사항 없이 지정한 Pipeline 에 맞게 Build 가 진행 되는 것을 확인 할 수 있습니다.   

## Gitlab 과 Jenkins 연동
지금까진 수동으로 Build 진행 되는 Pipeline 을 생성하였습니다.   

이제는 Gitlab Source 의 `Push` or `Merge` 가 발생되면 Jenkins 에서 Build 가 자동으로 진행 되도록 구성하여 CI 자동화를 완성하도록 하겠습니다.   

<img src="/assets/images/post/2020-05-04-jenkins-ci/14.png" style="max-width: 95%; height: auto;">   
* Project 구성에서 Build Triggers 부분에서 Gitlab Webhook 기능을 활성화 합니다.   

<img src="/assets/images/post/2020-05-04-jenkins-ci/15.png" style="max-width: 95%; height: auto;">   
* `고급` 을 선택하고 `Secret token` 을 생성합니다.   
       
<img src="/assets/images/post/2020-05-04-jenkins-ci/16.png" style="max-width: 95%; height: auto;">   
* Gitlab - Settings - Integrations 를 선택합니다.   

<img src="/assets/images/post/2020-05-04-jenkins-ci/17.png" style="max-width: 95%; height: auto;">   
* Jenkins 에서 확인한 Webhook URL, Secret token 을 입력합니다.   
   
<img src="/assets/images/post/2020-05-04-jenkins-ci/18.png" style="max-width: 95%; height: auto;">   
* 참고로 Gitlab 에서 Test 로 Push Event 를 발생하여, Build trigger 가 작동 하는지 확인 할 수 있습니다.   
   
<img src="/assets/images/post/2020-05-04-jenkins-ci/19.png" style="max-width: 95%; height: auto;">   
* 위와 같이 Test Push Event 에 의해 Build 가 작동하였습니다.   
      
## CI 자동화 테스트
실제로 소스를 변경하여 CI 가 자동화 되는지 확인하겠습니다.   
```bash
[root@fastvm-centos-7-7-91 cicd-httpd-source]# git add .
[root@fastvm-centos-7-7-91 cicd-httpd-source]# git status
# On branch master
# Changes to be committed:
#   (use "git reset HEAD <file>..." to unstage)
#
#	modified:   index.html
#
[root@fastvm-centos-7-7-91 cicd-httpd-source]# git commit -m "update index.html"
[master ad71674] update index.html
 1 file changed, 1 insertion(+), 1 deletion(-)
[root@fastvm-centos-7-7-91 cicd-httpd-source]# git push
Counting objects: 5, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 279 bytes | 0 bytes/s, done.
Total 3 (delta 2), reused 0 (delta 0)
To git@gitlab.example.com:chhanz/cicd-httpd-source.git
   c633ff8..ad71674  master -> master
``` 
    
<img src="/assets/images/post/2020-05-04-jenkins-ci/20.png" style="max-width: 95%; height: auto;">   
* 소스가 변경되고 Push 가 되고 자동으로 Pipeline 이 작동한 것을 확인 할 수 있습니다.   
* Commit 내용도 확인이 가능합니다.   
      
<img src="/assets/images/post/2020-05-04-jenkins-ci/21.png" style="max-width: 95%; height: auto;">   
* 상세 로그 확인하니 수정된 소스로 Container 가 실행된 것을 볼 수 있습니다.   

# 참고 자료
* [https://www.jenkins.io/doc/book/pipeline/](https://www.jenkins.io/doc/book/pipeline/)   
* [https://tech.osci.kr/2020/01/16/86039236/](https://tech.osci.kr/2020/01/16/86039236/)   

   
   













