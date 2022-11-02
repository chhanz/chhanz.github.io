---
layout: post
title: "[OCP] [Preview] Microshift (Lightweight Openshift)" 
description: ""
author: chhanz
date: 2022-11-02
tags: [openshift]
category: openshift
---
   
# Microshift 란?
Kubecon 2022 에서 Redhat 이 발표한 Lightweight Kubernetes Solution 입니다.   
([https://www.redhat.com/en/about/press-releases/red-hat-introduces-lightweight-kubernetes-solution-power-next-evolution-open-edge-computing](https://www.redhat.com/en/about/press-releases/red-hat-introduces-lightweight-kubernetes-solution-power-next-evolution-open-edge-computing))   
   
`k3s` 와 같은 느낌의 Solution 으로 예상이 되어 한번 설치하여 테스트하고 설치 과정중 이슈가 있던 부분에 대해 기록해보도록 하겠습니다.   
   
# 설치
먼저 이번 테스트 환경은 CentOS 8 Stream 에서 진행하였습니다.    
```bash
$ cat /etc/redhat-release
CentOS Stream release 8   
```
   
## CRI-O 설치
공식 문서에선 `cri-o` 1.21 version 을 설치하는 가이드가 있어서 그대로 진행했으나 진행이 안되었습니다.   
마치 `cri-o` repository 가 등록이 되어 있는 것처럼 되어 있으나 등록이 안되어 있었습니다.   
(위 부분은 점점 개선이 될 것으로 기대하고 있습니다.)   
   
아래와 같이 repository 를 등록을 진행하고 `cri-o` 를 설치합니다.   
```bash
$ sudo curl https://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/stable/CentOS_8_Stream/devel:kubic:libcontainers:stable.repo -o /etc/yum.repos.d/pstable.repo
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   380  100   380    0     0    462      0 --:--:-- --:--:-- --:--:--   462

$ sudo curl https://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/stable:/cri-o:/1.21:/1.21.7/CentOS_8_Stream/devel:kubic:libcontainers:stable:cri-o:1.21:1.21.7.repo -o /etc/yum.repos.d/cri-o-1.21.7.repo
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   432  100   432    0     0    523      0 --:--:-- --:--:-- --:--:--   523

$ sudo dnf repolist
repo id                             repo name 
...
devel_kubic_libcontainers_stable    Stable Releases of Upstream github.com/containers packages (CentOS_8_Stream)
devel_kubic_libcontainers_stable_cri-o_1.21_1.21.7      devel:kubic:libcontainers:stable:cri-o:1.21:1.21.7 (CentOS_8_Stream)
...

$ sudo dnf -y install cri-o cri-tools
````
   
`cri-o` 서비스를 시작합니다.   
```bash
$ sudo systemctl enable --now cri-o
```
    
## microshift 설치
아래 명령어를 참고하여 설치 및 서비스를 시작합니다.   
   
Repository 설정 진행.   
```bash
$ sudo dnf copr enable -y @redhat-et/microshift
Enabling a Copr repository. Please note that this repository is not part
of the main distribution, and quality may vary.

The Fedora Project does not exercise any power over the contents of
this repository beyond the rules outlined in the Copr FAQ at
<https://docs.pagure.org/copr.copr/user_documentation.html#what-i-can-build-in-copr>,
and packages are not held to any quality or security level.

Please do not file bug reports about these packages in Fedora
Bugzilla. In case of problems, contact the owner of this repository.
Repository successfully enabled.
```
   
`microshift` 설치 진행.   
```bash
$ sudo dnf install -y microshift
```
   
서비스 기동.   
```bash
$ sudo systemctl enable microshift --now
Created symlink /etc/systemd/system/multi-user.target.wants/microshift.service → /usr/lib/systemd/system/microshift.service.
$ sudo systemctl status microshift
● microshift.service - MicroShift
   Loaded: loaded (/usr/lib/systemd/system/microshift.service; enabled; vendor preset: disabled)
   Active: active (running) since Mon 2022-10-31 08:31:49 UTC; 7s ago
 Main PID: 15599 (microshift)
    Tasks: 9 (limit: 23492)
   Memory: 271.9M
   CGroup: /system.slice/microshift.service
           └─15599 /usr/bin/microshift run
```
   
## Install Client (`oc`)   
`microshift` 를 control 하기 위해 client 를 아래와 같이 설치합니다.   
```bash
$ sudo curl -O https://mirror.openshift.com/pub/openshift-v4/$(uname -m)/clients/ocp/stable/openshift-client-linux.tar.gz
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 50.1M  100 50.1M    0     0  9005k      0  0:00:05  0:00:05 --:--:-- 10.8M
$ sudo tar -xf openshift-client-linux.tar.gz -C /usr/local/bin oc kubectl
```
   
## Kubeconfig 설정
아래와 같이 kubeconfig 를 설정합니다.   
```bash
$ mkdir ~/.kube
$ sudo cat /var/lib/microshift/resources/kubeadmin/kubeconfig > ~/.kube/config
```
   
# 설치간 이슈 사항
위와 같이 설치한 이후, `microshift` 에서 `flannel-cni` 가 running 상태가 안되는 현상이 발생됩니다.   
상세 내역을 확인하면,   
```bash
$ oc describe pod -n kube-system kube-flannel-ds-8qlpj
... 생략
Events:
  Type     Reason                  Age                  From               Message
  ----     ------                  ----                 ----               -------
  Normal   Scheduled               4m41s                default-scheduler  Successfully assigned kube-system/kube-flannel-ds-8qlpj to ip-172-31-40-0.ap-northeast-2.compute.internal
  Warning  FailedCreatePodSandBox  1s (x23 over 4m41s)  kubelet            Failed to create pod sandbox: rpc error: code = Unknown desc = error creating pod sandbox with name "k8s_kube-flannel-ds-8qlpj_kube-system_53a706db-6c04-4e24-a2da-3e937d860c21_0": invalid policy in "/etc/containers/policy.json": Unknown key "keyPaths"
```
위와 같이 `Unknown key "keyPaths"` 라는 error 와 함께 pod 가 정상적으로 동작 하지 못합니다.   
[https://github.com/cri-o/cri-o/issues/6197](https://github.com/cri-o/cri-o/issues/6197) issue 를 참고하여 아래와 같이 수정합니다.   
   
```bash
$ diff /etc/containers/policy.json /etc/containers/policy.old
13c13
<             "keyPath": "/etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release"
---
>             "keyPaths": ["/etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release", "/etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-beta"]
20c20
<             "keyPath": "/etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release"
---
>             "keyPaths": ["/etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release", "/etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-beta"]
```
기존에 `keyPaths` 를 `keyPath` 로 변경하였습니다.   
이후 `microshift` 재시작 이후 정상적으로 Pod 가 생성되는 것을 확인 할 수 있습니다.   

```bash
$ oc get nodes
NAME                                             STATUS   ROLES    AGE   VERSION
ip-172-31-40-0.ap-northeast-2.compute.internal   Ready    <none>   15m   v1.21.0
$ oc get pod -A
NAMESPACE                       NAME                                  READY   STATUS    RESTARTS   AGE
kube-system                     kube-flannel-ds-8qlpj                 1/1     Running   0          15m
kubevirt-hostpath-provisioner   kubevirt-hostpath-provisioner-lx55d   1/1     Running   0          2m4s
openshift-dns                   dns-default-mp8cr                     2/2     Running   0          15m
openshift-dns                   node-resolver-tfrpd                   1/1     Running   0          15m
openshift-ingress               router-default-6c96f6bc66-5x7mm       1/1     Running   0          15m
openshift-service-ca            service-ca-7bffb6f6bf-5bn2b           1/1     Running   0          15m
```
   
# App 배포 테스트
Lightweight Kubernetes 라서 그런가 `oc new-app` 기능은 정상적으로 작동하지 못했습니다.   
이유는 내부에 Openshift 의 ImageStream 이 포함이 안되어 있어서 그렇습니다.   
(ImageStream 을 추가하거나 연결하면 정상적으로 구현 될 것으로 보임)   
   
사전에 생성된 Container Image 를 통해 App 을 배포해보겠습니다.   
```bash
$ cat << EOF > flask.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: flask-deployment
spec:
  selector:
    matchLabels:
      app: flask
  replicas: 2
  template:
    metadata:
      labels:
        app: flask
    spec:
      containers:
      - name: flask
        image: quay.io/chhanz/flask-example-app
        ports:
        - containerPort: 80
EOF

$ oc create -f flask.yml
deployment.apps/flask-deployment created

$ oc expose deployment/flask-deployment --type="NodePort"
service/flask-deployment exposed
```
   
아래와 같이 resource 가 생성된 것을 볼 수 있습니다.   
```bash
$ oc get all -l app=flask
NAME                                    READY   STATUS    RESTARTS   AGE
pod/flask-deployment-6d7459756c-ddnmr   1/1     Running   0          110s
pod/flask-deployment-6d7459756c-zskwd   1/1     Running   0          110s

NAME                                          DESIRED   CURRENT   READY   AGE
replicaset.apps/flask-deployment-6d7459756c   2         2         2       110s

$ oc get svc | grep flask
flask-deployment            NodePort    10.43.145.182   <none>        80:32353/TCP   18s
```
   
NodePort 를 통해 App 이 정상적으로 접근이 되는지 확인합니다.   
```bash
$ curl localhost:32353
 Container LAB | POD Working : flask-deployment-6d7459756c-ddnmr | v=1
$ curl localhost:32353
 Container LAB | POD Working : flask-deployment-6d7459756c-zskwd | v=1
$ curl localhost:32353
 Container LAB | POD Working : flask-deployment-6d7459756c-ddnmr | v=1
$ curl localhost:32353
 Container LAB | POD Working : flask-deployment-6d7459756c-zskwd | v=1
```
   
# 마치며
아직은 공식 문서가 완벽하게 준비가 안된 것으로 보여 이슈가 되는 부분 및 설정 방법에 대한 정확한 가이드가 빠져있어서 많은 것을 확인해보지는 못하였습니다.   
하지만 몇가지 기능들만 정상적으로 설정하고 작동 할 수 있다면, 충분히 매력적인 Solution 이 될 것이라 생각되어 안정화가 되길 기대합니다.   
   
# 참고 자료
* [https://microshift.io/](https://microshift.io/)   
* [https://github.com/cri-o/cri-o](https://github.com/cri-o/cri-o)   
* [https://github.com/chhanz/flask-example-app](https://github.com/chhanz/flask-example-app)   
* [https://www.redhat.com/en/about/press-releases/red-hat-introduces-lightweight-kubernetes-solution-power-next-evolution-open-edge-computing](https://www.redhat.com/en/about/press-releases/red-hat-introduces-lightweight-kubernetes-solution-power-next-evolution-open-edge-computing)    
