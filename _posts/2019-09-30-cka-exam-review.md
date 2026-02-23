---
layout: post
title: "[Kubernetes] CKA(Certified Kubernetes Administrator) 시험 합격 후기"
description: " "
author: chhanz
date: 2019-09-30
tags: [kubernetes]
category: linux
---

# [Kubernetes] CKA(Certified Kubernetes Administrator) 시험 합격 후기
* * * 
안녕하세요. `chhanz` 입니다.   
2019년 취득 목표로 잡고 공부하던 `CKA`, _Certified Kubernetes Administrator_ 자격증을 드디어 취득하였습니다.   

<center><img src="/assets/images/post/2019-09-30-cka-exam-review/logo_cka.png" style="max-width: 40%; height: auto;"></center>   
    
`CKA` 자격증을 취득하고 느낀점은 커뮤니티에 올려주신 많은 합격 후기들이 ***"너무 도움이 많이 되었다."***  라는 점입니다.   
그리하여 제가 공부를 어떻게 했고, 시험이 어떤식으로 진행이 되었는지 공유해드리겠습니다.   

# 공부 준비
* * *
다양한 리소스를 이용하여 공부를 하였으나, 제가 제일 유용하였고 도움이 되었다고 생각되는 자료 리스트입니다.   
1. [Kubernetes Tutorials](https://kubernetes.io/docs/tutorials/)   
    언제나 기본기는 중요합니다. hands-on lab 도 제공하여 처음 기본을 잡는데 유용하였습니다._(katacoda practice lab)_   
2. [Kubernetes in Action](http://www.yes24.com/Product/Goods/67151222)   
    스터디 그룹에서 번역의 상태가......, 하지만 내용은 너무 좋은 책입니다.   
    [`Kubernetes Korea Group의 Kubernetes Architecture Study 모임`](https://github.com/grepsean/k8skr-study-architecture) 에서 진행된 스터디 자료를 참조하시면 더욱 좋습니다.   
3. [Certified Kubernetes Administrator (CKA) with Practice Tests](https://www.udemy.com/course/certified-kubernetes-administrator-with-practice-tests/)   
     _Udemy_ 에서 유료로 제공되는 인터넷 강의입니다. 영문으로 구성된 강의이며, 영문 자막을 제공하고 있습니다.   
     강의 자체를 100% 소화를 못하더라도 중간중간 제공되는 Practice Lab 을 풀어보는 것을 좋습니다.    
     해당 Lab 시스템이 실제 시험과 매우 비슷한 환경입니다. 다만 실제 시험과 달리 성능이 매우 느립니다. ;(   
4. [Kubernetes the hard way](https://github.com/kelseyhightower/kubernetes-the-hard-way)   
     Kubernetes 를 공부하기 시작하면 많은 분들이 이 자료를 추천합니다.   
     저의 경우, _Open Infrastructur & Cloud Native Days Korea 2019_ 에서 [`@jmyung`](https://github.com/jmyung)님께서 진행하신 [kubernetes-the-hard-way-modified](https://github.com/jmyung/kubernetes-the-hard-way-modified) 를 현장에서 실습하고   
     `GCP` 기반으로 되어 있는 내용을 `VM` 기반으로 변경하여 설치하면서 다시 한번 리뷰 하였습니다.   
     _[`@jmyung`](https://github.com/jmyung) 님이 현장에서 해주신 hands-on lab 이 매우 도움이 많이 되었습니다. 감사합니다!!! :)_   
5. [CKA-StudyGuide](https://github.com/David-VTUK/CKA-StudyGuide)   
     분야별 Example Lab 문제를 제공합니다.   
     시험보는 느낌으로 테스트 해보시는 것도 도움이 됩니다.   
     
# 시험 준비
* * *
## 시험 신청
저는 _Open Infrastructur & Cloud Native Days Korea 2019_ 의 CNCF 부스에서 15% 할인 쿠폰을 받아서 조금 저렴한 가격에 시험을 등록 하였습니다.   
   
<center><img src="/assets/images/post/2019-09-30-cka-exam-review/img1.png" style="max-width: 100%; height: auto;"></center>   
   
## 시험 준비
CNCF Portal 에서 후보자가 확인하고 준비할 사항에 대해 링크 및 설명을 제공합니다.   
하나씩 체크하면서 준비합니다.   
   
<center><img src="/assets/images/post/2019-09-30-cka-exam-review/img2.png" style="max-width: 100%; height: auto;"></center>   
   
추가로 연결되는 사이트에서 시험 가능한 시간을 선택하면 됩니다.   
   
## 시험 당일
시험 보기전 사전에 확인하는 사항이 매우 많습니다.   
저의 경우, 시험은 아침 10시 15분이였습니다. 그리고 시험 시작 15분 전인 10시에 `exam classroom` 을 입장 할 수 있도록 링크가 활성화 되었습니다.   
`exam classroom` 에 입장을 하면 Live Chat 을 이용하여 시험 감독관의 시험 환경 확인이 시작됩니다.   
생각보다 이 과정은 오래걸립니다. 저는 약 15분 동안 확인하고 추가 질문하는데 사용하였습니다.   
미리 시험 시작 15분전에 입장하시고 시험 환경 확인을 받는 것을 추천 드림니다.   

### 시험 환경 확인
- 시험 감독관은 Webcam 을 통해 본인 확인 및 시험 환경을 확인합니다.
    - Webcam 에 본인 신분 확인을 할 수 있도록 여권을 보여달라고 요청합니다. 
    - 키보드가 있는 위치를 볼 수 있도록 Webcam 을 돌려달라고 합니다.   
    - 시험을 볼 수 있는 주변 환경을 Webcam 을 통해 천천히 보여달라고 합니다.   
    - 책상 전체 및 책상 밑 부붙을 보여달라고 합니다.   

> 시험에 필요한 물품이 아닌 것은 사전에 정리하는 것이 좋을 것 같습니다.     

# 시험 보는 동안의 주의 사항
* * * 
1. 저는 집과 가까운 인근 스터디룸을 대여하여 시험을 보았습니다.   
평소와 달리 노트북 모니터로 보니 글씨가 작은 듯하여 자세히 보기 위해 자주 노트북 가까이 갔더니 Webcam 기준에서는 화면 밑으로 제 모습이 사라지는 경우가 있었던 것 같습니다.   
바로 Live Chat 으로 주의를 주며, 화면 안쪽에 있어 달라고 요청합니다.   
   
2. Windows 기준, `Terminal` 에서는 `ctrl`+`insert` , `shift`+`insert` 를 사용해야되고 `Web Page` 에서는 `ctrl`+`c`/`v` 를 사용 하였습니다.   
마우스가 `Terminal` 로 들어가면 `ctrl`+`c`/`v` 를 사용 못하고 `Terminal` 밖으로 마우스가 이동하면 `ctrl`+`c`/`v` 가 사용 가능 했습니다.   
그리고 `ctrl`+`w` 는 `tab` 제거 단축키이므로 입력하면 안됩니다.   
   
3. 시험보는 도중, `command` 가 입력이 잘 안된다는 느낌이 들면서 `Connection Lost` 라는 문구가 나오면서 `Web page` 와 `Terminal` 창이 꺼졌습니다.   
매우 당황했습니다. ㅠㅠ   
_Live Chat 을 통해 문제에 대해 알렸습니다. 이후 감독관이 조치를 해주었습니다._   
당황하지 말고 Live Chat 으로 요청하시면 될 것 같습니다.   

# 합격
* * *
총 3시간의 시험 시간 중, 2시간 정도는 문제 풀이 / 30분은 검토 진행 하였습니다.   
CKA 시험의 경우, 불합격하더라도 재시험의 기회를 주기 때문에   
불합격하면 부족한 부분을 더 공부해서 재시험에 도전 해야겠다는 생각을 하며 `Request Break Exam` 하였습니다.   
   
그리고 약 30시간 정도 후, 시험 합격 결과가 통보 되었습니다.   
아래와 같이 합격하여 재시험은 볼 필요가 없어졌습니다. ^^/   
   
<center><img src="/assets/images/post/2019-09-30-cka-exam-review/cka.png" style="max-width: 100%; height: auto;"></center>   

# 마치며
여러가지의 공부 자료들이 많이 도움이 되었지만,   
`Kubernetes Korea User Group` 및 `Openinfra day` 에서 공유 해주신 자료와 정보  
마지막으로 `Kubernetes Korea Group의 Kubernetes Architecture Study 모임` 에서의 100일간 스터디 그룹이 많은 도움이 되었습니다.   
   
감사합니다.