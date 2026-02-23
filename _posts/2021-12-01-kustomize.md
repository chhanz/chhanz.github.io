---
layout: post
title: "[Kubernetes] Kustomize "
description: ""
author: chhanz
date: 2021-12-01
tags: [kubernetes]
category: kubernetes
---
# 목차
+ [Kustomize 란?](#info)   
+ [Kustomize 설치](#install)   
+ [Completion 설정](#completion)   
+ [Kustomize 기본](#base)   
  + [Kustomize build](#build)   
  + [Run kustomize](#run)   
  + [`resources` 추가](#resource)   
  + [`patch`](#patch)    
  + [`prefix/label`](#prefixlabel)   
  + [`secretGenerator` 이용](#secretgenerator)   
  + [overlay 적용](#overlay)   
+ [참고 자료](#refdoc)   

# Kustomize 란? {#info}
Kustomize는 쿠버네티스 구성을 사용자 정의화하는 도구이다. 이는 애플리케이션 구성 파일을 관리하기 위해 다음 기능들을 가진다.   
* 다른 소스에서 리소스 생성   
* 리소스에 대한 교차 편집 필드 설정   
* 리소스 집합을 구성하고 사용자 정의   
[(https://kubernetes.io/ko/docs/tasks/manage-kubernetes-objects/kustomization/#kustomize-%EA%B0%9C%EC%9A%94 발췌)](https://kubernetes.io/ko/docs/tasks/manage-kubernetes-objects/kustomization/#kustomize-%EA%B0%9C%EC%9A%94)   
   
***개인적으론 `Helm` 보다 `Kustomize` 가 사용하기 좋았다.***   

# Kustomize 설치 {#install}
아래 명령어를 통해 OS 에 맞게 자동으로 설치 진행된다.   
```bash
root@node1:~# curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh"  | bash
 
{Version:kustomize/v4.4.0 GitCommit:63ec6bdb3d737a7c66901828c5743656c49b60e1 BuildDate:2021-09-27T16:24:12Z GoOs:linux GoArch:amd64}
kustomize installed to //root/kustomize
```
   
사용의 편의를 위해 Path 를 이동하였다.   
```bash
root@node1:~# mv kustomize /usr/local/bin/
 
root@node1:~# kustomize --help
 
Manages declarative configuration of Kubernetes.
See https://sigs.k8s.io/kustomize
 
Usage:
  kustomize [command]
 
Available Commands:
  build                     Build a kustomization target from a directory or URL.
  cfg                       Commands for reading and writing configuration.
  completion                Generate shell completion script
  create                    Create a new kustomization in the current directory
  edit                      Edits a kustomization file
  fn                        Commands for running functions against configuration.
  help                      Help about any command
  version                   Prints the kustomize version
 
Flags:
  -h, --help          help for kustomize
      --stack-trace   print a stack-trace on error
 
Additional help topics:
  kustomize docs-fn                   [Alpha] Documentation for developing and invoking Configuration Functions.
  kustomize docs-fn-spec              [Alpha] Documentation for Configuration Functions Specification.
  kustomize docs-io-annotations       [Alpha] Documentation for annotations used by io.
  kustomize docs-merge                [Alpha] Documentation for merging Resources (2-way merge).
  kustomize docs-merge3               [Alpha] Documentation for merging Resources (3-way merge).
  kustomize tutorials-command-basics  [Alpha] Tutorials for using basic config commands.
  kustomize tutorials-function-basics [Alpha] Tutorials for using functions.
 
Use "kustomize [command] --help" for more information about a command.
```
   
# Completion 설정 {#completion}
아래 명령어를 통해 completion 을 설정한다.   
```bash
root@node1:~/test# kustomize completion bash > /etc/bash_completion.d/kustomize
```
   
# Kustomize 기본 {#base}
Kustomize 의 테스트를 위해 flask 예제 어플리케이션을 준비한다.   
```bash
root@node1:~/test# kubectl create deployment --image=quay.io/chhanz/flask-example-app flash-app -o yaml --dry-run > deployment.yml
W1110 13:11:30.171887   79409 helpers.go:553] --dry-run is deprecated and can be replaced with --dry-run=client.
```
   
아래와 같이 `kustomization.yaml` 을 작성한다.   
```bash
root@node1:~/test# cat kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
 
resources:
- base/deployment.yml               <<<
```
   
위 `kustomization.yaml` 은 아래와 같은 파일 구조를 가진다.   
```bash
├── base
│   └── deployment.yml
└── kustomization.yaml
```
   
kustomize 의 기본은 `resources` 부분에 어플리케이션을 선언하면 된다.   
   
## Kustomize build {#build}
아래 명령어를 통해 작성한 `kustomization.yaml` 를 kubernetes 에 맞는 `yaml` 형식으로 변환 할 수 있다.   
```bash
root@node1:~/test# kustomize build
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  labels:
    app: flash-app
  name: flash-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: flash-app
  strategy: {}
  template:
    metadata:
      creationTimestamp: null
      labels:
        app: flash-app
    spec:
      containers:
      - image: quay.io/chhanz/flask-example-app
        name: flask-example-app
        resources: {}
status: {}
```
   
## Run kustomize {#run}
생성한 `kustomization.yaml` 을 이용하여 아래와 같이 어플리케이션을 배포 할 수 있다.   
```bash
root@node1:~/test# kustomize build | kubectl create -f  -           <<<
deployment.apps/flash-app created
root@node1:~/test#
 
root@node1:~/test# kubectl get all
NAME                             READY   STATUS    RESTARTS   AGE
pod/flash-app-69f5f676d6-z7wf4   1/1     Running   0          14s
 
NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.233.0.1   <none>        443/TCP   131m
 
NAME                        READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/flash-app   1/1     1            1           14s
 
NAME                                   DESIRED   CURRENT   READY   AGE
replicaset.apps/flash-app-69f5f676d6   1         1         1       14s
```
   
## `resources` 추가 {#resource}
만들어둔 `kustomize` 에 신규 리소스 `service` 를 추가해본다.   
```bash
root@node1:~/test# cat kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
 
resources:
- base/deployment.yml
- base/service.yml              <<<
```
   
추가한 `kustomize` 를 kubernetes 에 배포한다.   
```bash
root@node1:~/test# kustomize build . | kubectl create -f -
service/flask-app created
```
   
```bash
root@node1:~/test# kubectl get all
NAME                             READY   STATUS    RESTARTS   AGE
pod/flask-app-669644b479-vh969   1/1     Running   0          31s
 
NAME                 TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
service/flask-app    ClusterIP   10.233.27.235   <none>        80/TCP    31s        <<<
service/kubernetes   ClusterIP   10.233.0.1      <none>        443/TCP   3h3m
 
NAME                        READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/flask-app   1/1     1            1           31s
 
NAME                                   DESIRED   CURRENT   READY   AGE
replicaset.apps/flask-app-669644b479   1         1         1       31s
```   
위와 같이 서비스가 생성 된 것을 확인 할 수 있다.   
   
# `patch` {#patch}
`kustomize` 는 resource 의 spec 별로 `patch` 를 이용하여 Base `yaml` 을 수정안하고 전체 어플리케이션을 수정 할 수 있다.   
예를 들면 service 의 속성만 기존과 다르게 변경도 할 수 있다.   
```bash
root@node1:~/test# cat patch/svc-nodeport.yml
apiVersion: v1
kind: Service
metadata:
  creationTimestamp: null
  labels:
    app: flask-app
  name: flask-app
spec:
  type: NodePort
```
위는 기존에 `ClusterIP` 로 선언된 `type` 을 `NodePort` 로 `patch` 하는 yaml 이다.   
해당 yaml 을 작성하고 아래와 같이 `kustomization.yaml`에 추가한다.   
   
```bash
root@node1:~/test# cat kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
 
resources:
- base/deployment.yml
- base/service.yml
 
patches:
- patch/svc-nodeport.yml            <<<
```
위와 같이 작성한 `kustomization.yaml` 을 build 해서 확인해보면,   
```bash
root@node1:~/test# kustomize build .
apiVersion: v1
kind: Service
metadata:
  labels:
    app: flask-app
  name: flask-app
spec:
  ports:
  - port: 80
    protocol: TCP
    targetPort: 80
  selector:
    app: flask-app
  type: NodePort                    <<<
status:
  loadBalancer: {}
---
apiVersion: apps/v1
kind: Deployment
... 생략 ...
```
`ClusterIP` 에서 `NodePort` 로 변경 된 것을 볼 수 있다.   
   
변경된 `kustomize` 를 배포한다.   
```bash
root@node1:~/test# kustomize build . | kubectl apply -f -
Warning: resource services/flask-app is missing the kubectl.kubernetes.io/last-applied-configuration annotation which is required by kubectl apply. kubectl apply should only be used on resources created declaratively by either kubectl
create --save-config or kubectl apply. The missing annotation will be patched automatically.
service/flask-app configured
Warning: resource deployments/flask-app is missing the kubectl.kubernetes.io/last-applied-configuration annotation which is required by kubectl apply. kubectl apply should only be used on resources created declaratively by either kubectl create --save-config or kubectl apply. The missing annotation will be patched automatically.
deployment.apps/flask-app configured
``` 
   
서비스 확인.
```bash 
root@node1:~/test# kubectl get all
NAME                             READY   STATUS        RESTARTS   AGE
pod/flask-app-669644b479-4gjwz   1/1     Terminating   0          2m58s
pod/flask-app-669644b479-4lscv   1/1     Running       0          5s
 
NAME                 TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
service/flask-app    NodePort    10.233.49.196   <none>        80:32312/TCP   5s                <<<
service/kubernetes   ClusterIP   10.233.0.1      <none>        443/TCP        3h17m
 
NAME                        READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/flask-app   1/1     1            1           5s
 
NAME                                   DESIRED   CURRENT   READY   AGE
replicaset.apps/flask-app-669644b479   1         1         1       5s

root@node1:~/test# curl node6:32312
 Container LAB | POD Working : flask-app-669644b479-4lscv | v=1
root@node1:~/test# curl node5:32312
 Container LAB | POD Working : flask-app-669644b479-4lscv | v=1
root@node1:~/test# curl node4:32312
 Container LAB | POD Working : flask-app-669644b479-4lscv | v=1

```
`NodePort` 로 `Patch`가 되었다.   
   
# `prefix/label` {#prefixlabel}
유용한 옵션으로 prefix 와 label 설정이 있다.   
해당 옵션은 배포되는 어플리케이션에 리소스에 prefix 이름을 넣고 label 을 설정하는 옵션이다.   
```bash
root@node1:~/test# cat kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
 
resources:
- base/deployment.yml
- base/service.yml
 
namePrefix: prefix-                     <<<
commonLabels:
  t_label: testtest                     <<<
 
patches:
- patch/svc-nodeport.yml
```
   
```bash
root@node1:~/test# kubectl get all -l t_label -o wide
NAME                                    READY   STATUS    RESTARTS   AGE   IP            NODE    NOMINATED NODE   READINESS GATES
pod/prefix-flask-app-7df7849944-wr9bs   1/1     Running   0          17s   10.233.70.1   node5   <none>           <none>
 
NAME                       TYPE       CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE   SELECTOR
service/prefix-flask-app   NodePort   10.233.5.176   <none>        80:32705/TCP   18s   app=flask-app,t_label=testtest
 
NAME                               READY   UP-TO-DATE   AVAILABLE   AGE   CONTAINERS          IMAGES                             SELECTOR
deployment.apps/prefix-flask-app   1/1     1            1           18s   flask-example-app   quay.io/chhanz/flask-example-app   app=flask-app,t_label=testtest
 
NAME                                          DESIRED   CURRENT   READY   AGE   CONTAINERS          IMAGES                             SELECTOR
replicaset.apps/prefix-flask-app-7df7849944   1         1         1       18s   flask-example-app   quay.io/chhanz/flask-example-app   app=flask-app,pod-template-hash=7df7849944,t_label=testtest
```
위와 같이 prefix 로 설정한 `prefix-` 가 각 리소스에 name 으로 설정되었고, label 도 `t_label=testtest` 가 추가된 것을 볼 수 있다.   
   
# secretGenerator 이용 {#secretgenerator}
kustomize 를 통해 secret 도 관리 할 수 있다.   
```bash
root@node1:~/test/base# cat test.conf
[test]
name=testtest
config=test.conf
description=testtest config
```
위 내용은 secret 으로 mount 할 test config 이다.   
   
base deployment 수정
```bash
root@node1:~/test/base# cat deployment.yml
apiVersion: apps/v1
kind: Deployment
... 생략 ...
    spec:
      containers:
      - image: quay.io/chhanz/flask-example-app
        name: flask-example-app
        volumeMounts:
        - name: mount-secret                                <<<
          mountPath: "/usr/src/app/data"      
        resources: {}
      volumes:
      - name: mount-secret
        secret:
          secretName: mount-test-secret                      <<<
```
위와 같이 해당 어플리케이션은 `mount-test-secret` 이름의 secret 을 pod 에 mount 하도록 되어 있다.   
   
`kustomization.yaml` 작성
```bash
root@node1:~/test/base# cat kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
 
resources:
- deployment.yml
- service.yml
 
namePrefix: prefix-
commonLabels:
  app: flask-app
  t_label: testtest
 
secretGenerator:                    <<<
- name: mount-test-secret
  files:
  - test.conf
  type: Opaque
```
secretGenerator 를 이용하여 `mount-test-secret` 이름의 secret 을 생성한다.   
   
build 를 하면 아래와 같은 yaml 을 볼 수 있다.   
```bash
root@node1:~/test/base# kustomize build .
apiVersion: v1
data:
  test.conf: |                                                                          <<<
    W3Rlc3RdCm5hbWU9dGVzdHRlc3QKY29uZmlnPXRlc3QuY29uZgpkZXNjcmlwdGlvbj10ZX              <<<
    N0dGVzdCBjb25maWcK                                                                  <<<
kind: Secret
metadata:
  labels:
    app: flask-app
    t_label: testtest
  name: prefix-moun-test-secret-6c8d796cc7
 
... 생략
---
apiVersion: apps/v1
kind: Deployment
... 생략
 
      volumes:
      - name: mount-secret
        secret:
          secretName: prefix-moun-test-secret-6c8d796cc7                                <<<
```
secret 들에 hash 들이 붙으면서 자동으로 base yaml 을 수정, 적용한다.   
   
해당 어플리케이션을 배포하고 secret 이 mount 되었는지 확인한다.   
```bash
<<K9s-Shell>> Pod: default/prefix-flask-app-787d6569db-k6f98 | Container: flask-example-app
/usr/src/app # ls
Dockerfile        data              main.py           requirements.txt
/usr/src/app # cat data/test.conf
[test]
name=testtest
config=test.conf
description=testtest config
/usr/src/app #
```

# overlay 적용 {#overlay}
base yaml 을 다른 kubernetes cluster 혹은 namespace 에 배포를 쉽게 하기 위해 overlay 를 적용 할 수 있다.   
```bash
root@node1:~/test# kubectl create ns prod
namespace/prod created
 
root@node1:~/test# tree
.
├── base
│   ├── deployment.yml
│   ├── kustomization.yaml
│   └── service.yml
├── overlays
│   └── prod
│       └── kustomization.yaml
└── patch
    └── svc-nodeport.yml
 
4 directories, 5 file
```
위와 같이 테스트를 위해 `prod` 라는 namespace 를 생성하고 `overlays/prod/kustomizetion.yaml` 을 생성한다.   
```bash
root@node1:~/test# cat overlays/prod/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
 
bases:
- ../../base
 
namespace: prod
```
위와 같이 `bases` 는 기존에 `default` namespace 에 배포 되는 어플리케이션을 `prod` namespace 로 변경하는 `kustomization.yaml` 이다.   
간단히 설명하면 `bases` 에 있는 어플리케이션을 다른 overlay 인 `prod` namespace 로 배포하게 된다.    

build 를 해보면,   
```bash
root@node1:~/test# kustomize build  overlays/prod/
apiVersion: v1
kind: Service
metadata:
  creationTimestamp: null
  labels:
    app: flask-app
    t_label: testtest
  name: prefix-flask-app
  namespace: prod
spec:
  ports:
  - port: 80
    protocol: TCP
    targetPort: 80
  selector:
    app: flask-app
    t_label: testtest
status:
  loadBalancer: {}
---
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  labels:
    app: flask-app
    t_label: testtest
  name: prefix-flask-app
  namespace: prod
spec:
  replicas: 1
  selector:
    matchLabels:
      app: flask-app
      t_label: testtest
  strategy: {}
  template:
    metadata:
      creationTimestamp: null
      labels:
        app: flask-app
        t_label: testtest
    spec:
      containers:
      - image: quay.io/chhanz/flask-example-app
        name: flask-example-app
        resources: {}
status: {}
```
위와 같은 yaml 을 생성되고 어플리케이션을 배포하면,   
```bash
root@node1:~/test# kustomize build  overlays/prod/ | kubectl create -f -
service/prefix-flask-app created
deployment.apps/prefix-flask-app created

root@node1:~/test# kubectl get all -n prod
NAME                                    READY   STATUS    RESTARTS   AGE
pod/prefix-flask-app-7df7849944-chbsb   1/1     Running   0          6s
 
NAME                       TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
service/prefix-flask-app   ClusterIP   10.233.17.231   <none>        80/TCP    7s
 
NAME                               READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/prefix-flask-app   1/1     1            1           6s
 
NAME                                          DESIRED   CURRENT   READY   AGE
replicaset.apps/prefix-flask-app-7df7849944   1         1         1       6s
```
위와 같이 `prod` namespace 에 어플리케이션이 배포 된 것을 볼 수 있다.   
   
# 참고 자료 {#refdoc}
* [https://kubernetes.io/ko/docs/tasks/manage-kubernetes-objects/kustomization/](https://kubernetes.io/ko/docs/tasks/manage-kubernetes-objects/kustomization/)   
* [https://www.jacobbaek.com/1172](https://www.jacobbaek.com/1172)   
* [https://github.com/kubernetes-sigs/kustomize](https://github.com/kubernetes-sigs/kustomize)   
* [https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/](https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/)   