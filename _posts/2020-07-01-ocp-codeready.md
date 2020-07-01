---
layout: post
title: "[OpenShift 4.4] CodeReady Workspaces 를 이용하여 통합 개발 환경(IDE) 구현"
description: " "
author: chhanz
date: 2020-07-01
tags: [kubernetes,openshift]
category: openshift
---
   
# CodeReady Workspace 란?
Red Hat® CodeReady Workspaces는 팀을 위한 클라우드 네이티브 개발을 실용적으로 만들어주는 개발자 툴입니다.   
쿠버네티스와 컨테이너를 사용해 개발 또는 IT 팀의 누구에게든 일관적으로 사전 설정된 개발 환경을 제공합니다.   
개발자는 Red Hat OpenShift®에서 구동되는 컨테이너에서 코드를 작성하고, 빌드하고, 테스트할 수 있습니다.   
사용자 경험 또한 노트북에서 통합 개발 환경(IDE)을 사용하는 것만큼이나 빠르고 친숙합니다.   
* [https://www.redhat.com/ko/technologies/jboss-middleware/codeready-workspaces](https://www.redhat.com/ko/technologies/jboss-middleware/codeready-workspaces)   
   
# CodeReady Workspace 배포   
   
<img src="/assets/images/post/2020-07-01-ocp-codeready/1.png" style="max-width: 95%; height: auto;"><br>CodeReady 배포 할 Project 생성합니다.   
<br><img src="/assets/images/post/2020-07-01-ocp-codeready/2.png" style="max-width: 95%; height: auto;"><br>`admin` 계정으로 로그인 후, OperatorHub 에서 `CodeReady` 를 검색합니다.   
<br><img src="/assets/images/post/2020-07-01-ocp-codeready/3.png" style="max-width: 95%; height: auto;"><br>`Install` 을 누르고 설치를 시작합니다.   
<br><img src="/assets/images/post/2020-07-01-ocp-codeready/4.png" style="max-width: 95%; height: auto;"><br>Namespace 를 선택하고 `Subscribe` 를 선택합니다.   
<br><img src="/assets/images/post/2020-07-01-ocp-codeready/5.png" style="max-width: 95%; height: auto;"><br> Installed Operators 에서 CodeReady 의 Status 가 `Succeeded` 가 될 때까지 기다립니다.   
<br><img src="/assets/images/post/2020-07-01-ocp-codeready/6.png" style="max-width: 95%; height: auto;"><br>위와 같이 `install strategy completed with no errors` Event 메뉴에서 메시지가 나올때까지 대기합니다.   
<br><img src="/assets/images/post/2020-07-01-ocp-codeready/7.png" style="max-width: 95%; height: auto;"><br>Installed Operators 에서 CodeReady 를 선택 후 `Create Instance` 를 선택합니다.  
<br><img src="/assets/images/post/2020-07-01-ocp-codeready/8.png" style="max-width: 95%; height: auto;"><br>수정이 필요할 경우, 수정 후 `Create` 를 선택 합니다.   
<br><img src="/assets/images/post/2020-07-01-ocp-codeready/9.png" style="max-width: 95%; height: auto;"><br>위와 같이 CheCluster 생성이 된 것을 볼 수 있습니다.   
<br><img src="/assets/images/post/2020-07-01-ocp-codeready/10.png" style="max-width: 95%; height: auto;"><br>CheCluster 에서 Pod 들이 순차적으로 배포가 되고 실행이 완료되면 CodeReady 에 접근이 가능해집니다.   
<br><img src="/assets/images/post/2020-07-01-ocp-codeready/11.png" style="max-width: 95%; height: auto;"><br>CodeReady Workspace URL 을 통해 접근합니다.   

# CodeReady Workspace 을 이용해서 개발해보자
<br><img src="/assets/images/post/2020-07-01-ocp-codeready/12.png" style="max-width: 95%; height: auto;"><br>초기 접속을 하면 사용할 계정을 생성합니다.   
<br><img src="/assets/images/post/2020-07-01-ocp-codeready/13.png" style="max-width: 95%; height: auto;"><br>Sample 을 선택합니다.   
<br><img src="/assets/images/post/2020-07-01-ocp-codeready/14.png" style="max-width: 95%; height: auto;"><br>테스트를 위해 Python 을 선택하도록 하겠습니다.   
<br><img src="/assets/images/post/2020-07-01-ocp-codeready/15.png" style="max-width: 95%; height: auto;"><br>위와 같이 Sample Python code 가 있고, IDE 환경이 실행됩니다.   
<br><img src="/assets/images/post/2020-07-01-ocp-codeready/16.png" style="max-width: 95%; height: auto;"><br>`Debug` 메뉴를 통해 debug 할 수 있습니다.   
<br><img src="/assets/images/post/2020-07-01-ocp-codeready/17.png" style="max-width: 95%; height: auto;"><br>하단에 Debug Console 에서 debug 된 내용을 확인 할 수 있습니다.   
<br><img src="/assets/images/post/2020-07-01-ocp-codeready/18.png" style="max-width: 95%; height: auto;"><br>`Terminal` 에서 `Run Task` 를 선택하고 개발된 Code 를 Run 할 수 있습니다.   
<br><img src="/assets/images/post/2020-07-01-ocp-codeready/19.png" style="max-width: 95%; height: auto;"><br>하단에 RUN 내용이 출력됩니다.   

# Sample Code
```python
marks = [90, 25 ,67, 45, 80]
number = 0

for mark in marks:
    number = number + 1
    if mark >= 60:
        print("%d is pass." % number)
    else:
        print("%d is fail." % number)
```
위 Source 를 이용해서 간단하게 Python 프로그래밍을 해보았습니다.   
<br><img src="/assets/images/post/2020-07-01-ocp-codeready/20.png" style="max-width: 95%; height: auto;"><br>별도의 개발 환경 구축 없이 간편하게 WEB Console 을 통해 개발 할 수 있었습니다.   
   
# 참고 자료
* [https://access.redhat.com/documentation/en-us/red_hat_codeready_workspaces/2.1/html/installation_guide/installing-codeready-workspaces-on-ocp-4#creating-the-codeready-workspaces-project-in-openshift-4-web-console_installing-codeready-workspaces-on-openshift-4-from-operatorhub](https://access.redhat.com/documentation/en-us/red_hat_codeready_workspaces/2.1/html/installation_guide/installing-codeready-workspaces-on-ocp-4#creating-the-codeready-workspaces-project-in-openshift-4-web-console_installing-codeready-workspaces-on-openshift-4-from-operatorhub)   
* CodeReady 배포시 TLS 에러로 인해 배포가 안 되는 경우,
    + [https://access.redhat.com/solutions/4675271](https://access.redhat.com/solutions/4675271)   
* [https://access.redhat.com/documentation/en-us/red_hat_codeready_workspaces/2.1/html/end-user_guide/navigating-codeready-workspaces-using-the-dashboard_crw](https://access.redhat.com/documentation/en-us/red_hat_codeready_workspaces/2.1/html/end-user_guide/navigating-codeready-workspaces-using-the-dashboard_crw)   
* [https://www.eclipse.org/che/](https://www.eclipse.org/che/)   