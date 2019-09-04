---
layout: post
title: "[Kubernetes] kubeadm 을 이용한 Kubernetes 설치"
description: " "
author: chhanz
date: 2019-09-04
tags: [kubernetes]
category: linux
---

# kubeadm 을 이용한 Kubernetes 설치
* * *
`kubeadm` 을 이용하여 kubernetes 테스트 환경을 쉽고 빠르게 구축하도록 하겠습니다.

## 준비 사항
이번 테스트 환경은 1 Master node, 2 Worker node 로 구성을 할 예정입니다.
상세 내역은 아래와 같습니다.
> OS Version : CentOS 7.6    
> Docker Version : v18.6.1   
> Kubernetes Version : v1.15.3   

## 사전 준비
Kubernetes 설치를 위해 사전 준비 작업이 필요합니다.   
위 작업은 운영체제 설정 작업 및 Package 설치 작업이며,   
해당 작업은 `Kubernetes Preinstaller` 를 이용하여 손쉽게 작업하도록 하겠습니다.   
   
- _Kubernetes Preinstaller_ : [https://github.com/chhanz/k8s-install-script](https://github.com/chhanz/k8s-install-script)
   
해당 `source` 는    
```bash
$ git clone https://github.com/chhanz/k8s-install-script.git
```
`git clone` 명령을 통해 로컬에 복제합니다.   

+ Preinstaller File list (v1.15.3)   

```yaml
├── README.md 
├── inventory
├── old_bash-1.12                         ## Old Bash Script (v1.12)
│   ├── 0_preinstall_base.sh
│   ├── 1_mk_master.yml
│   ├── 2_master1_install.sh
│   ├── 3_deploy_key.sh
│   ├── 4_deploy_install_script.sh
│   ├── 5_network_plugin.sh 
│   ├── kube-flannel.yml
│   ├── kubeadm-config_master1.yaml
│   ├── kubeadm-config_master2.yaml
│   ├── kubeadm-config_master3.yaml
│   ├── node2_deploy.sh
│   └── node3_deploy.sh
└── preinstall.yaml                       ## Preinstaller (ansible)

1 directory, 15 files
```

`VM` 이 접근이 가능한 시스템 혹은 PC등, `ansible` 수행이 가능한 위치에서 `inventory` 작성을 하고 `playbook` 을 실행하면 됩니다.

## Inventory 변경
```yaml
[all]  
fastvm-centos-7-6-22    ansible_host=192.168.200.22
fastvm-centos-7-6-23    ansible_host=192.168.200.23
fastvm-centos-7-6-24    ansible_host=192.168.200.24

[all:vars]
ansible_ssh_user=root
ansible_ssh_pass=password
docker_package_version=docker-ce-18.06.1.ce
kubernetes_package_version=1.15.3-0
```
위와 같이 `VM` IP 정보, root 접속 정보, docker & kubernetes version 정보를 입력합니다.

## Playbook 수행
```bash
$ ansible-playbook -i inventory preinstall.yaml
```
해당 명령을 통해 preinstall playbook 을 수행합니다.

아래와 같이 완료가 되면 

<center><img src="/assets/images/post/2019-09-04-kubernetes/image1.png" style="max-width: 100%; height: auto;"></center>   


해당 시스템을 `Reboot` 하여, preinstaller playbook 을 통해 설정된 값이 적용되도록 합니다.

### Playbook 수행 내역
해당 preinstall playbook 은 아래와 같은 항목을 자동으로 설정합니다.
> 1. `firewalld` 중지 및 Disabled
> 2. `SELinux` Disabled
> 3. `SWAP` 중지 및 해제
> 4. Kernel Parameter 설정
> 5. Docker-CE, Kubernetes Repository 등록
> 6. Requirement Package 설치
> 7. systemd 설정

# Kubernetes 설치
`kubeadm` 을 이용하여 설치하기 위해 아래 명령을 Master node 에서 수행합니다.

```bash
$ kubeadm init --apiserver-advertise-address=<<control-plane node IP>>
```

수행이 완료가 되면 아래와 같이 Worker node 연결을 위한 `token` 이 생성됩니다.
<center><img src="/assets/images/post/2019-09-04-kubernetes/image2.png" style="max-width: 100%; height: auto;"></center>   

## `kubeconfig` 생성
```console
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config
```
`kubeconfig` 를 생성하면 `kubectl` 명령이 정상적으로 작동 할 것 입니다.

## Pod Network 설치
CNI 를 설치하기 위해 하기 문서를 참고합니다.   
참고 문서 : [https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/)

이번 포스팅의 테스트에서는 Calico CNI 를 사용하도록 하겠습니다.

아래와 같이 `cailco.yaml` 을 배포합니다.
```bash
# kubectl apply -f https://docs.projectcalico.org/v3.8/manifests/calico.yaml 
configmap/calico-config created 
customresourcedefinition.apiextensions.k8s.io/felixconfigurations.crd.projectcalico.org created 
customresourcedefinition.apiextensions.k8s.io/ipamblocks.crd.projectcalico.org created 
customresourcedefinition.apiextensions.k8s.io/blockaffinities.crd.projectcalico.org created 
customresourcedefinition.apiextensions.k8s.io/ipamhandles.crd.projectcalico.org created 
customresourcedefinition.apiextensions.k8s.io/ipamconfigs.crd.projectcalico.org created 
customresourcedefinition.apiextensions.k8s.io/bgppeers.crd.projectcalico.org created 
customresourcedefinition.apiextensions.k8s.io/bgpconfigurations.crd.projectcalico.org created 
customresourcedefinition.apiextensions.k8s.io/ippools.crd.projectcalico.org created 
customresourcedefinition.apiextensions.k8s.io/hostendpoints.crd.projectcalico.org created 
customresourcedefinition.apiextensions.k8s.io/clusterinformations.crd.projectcalico.org created 
customresourcedefinition.apiextensions.k8s.io/globalnetworkpolicies.crd.projectcalico.org created 
customresourcedefinition.apiextensions.k8s.io/globalnetworksets.crd.projectcalico.org created 
customresourcedefinition.apiextensions.k8s.io/networkpolicies.crd.projectcalico.org created 
customresourcedefinition.apiextensions.k8s.io/networksets.crd.projectcalico.org created 
clusterrole.rbac.authorization.k8s.io/calico-kube-controllers created 
clusterrolebinding.rbac.authorization.k8s.io/calico-kube-controllers created 
clusterrole.rbac.authorization.k8s.io/calico-node created
clusterrolebinding.rbac.authorization.k8s.io/calico-node created 
daemonset.apps/calico-node created 
serviceaccount/calico-node created 
deployment.apps/calico-kube-controllers created 
serviceaccount/calico-kube-controllers created
```

배포가 완료가 되면 아래와 같이 `calico` 관련 Pod 이 생성이 되고 _Running_ 상태가 되면 CNI 설치가 완료가 된 것 입니다.

```bash
$ kubectl get pod -n kube-system 
NAME                                               READY   STATUS    RESTARTS   AGE 
pod/calico-kube-controllers-65b8787765-brdv7       1/1     Running   0          117s
pod/calico-node-lggxn                              1/1     Running   0          117s
pod/coredns-5c98db65d4-m6svd                       1/1     Running   0          23m
pod/coredns-5c98db65d4-x7gcb                       1/1     Running   0          23m
pod/etcd-fastvm-centos-7-6-22                      1/1     Running   1          22m
pod/kube-apiserver-fastvm-centos-7-6-22            1/1     Running   1          22m
pod/kube-controller-manager-fastvm-centos-7-6-22   1/1     Running   5          22m
pod/kube-proxy-82v78                               1/1     Running   1          23m
pod/kube-scheduler-fastvm-centos-7-6-22            1/1     Running   5          22m
```

## Worker node 연결
Master node 가 초기화가 되고, 마지막에 생성된 `token` 값을 연결할 Worker node 에 입력합니다.

```bash
$ kubeadm join 192.168.200.22:6443 --token cdw8cj.4guf1fr9e7shc7u8 \
  --discovery-token-ca-cert-hash sha256:bc3604fb648338821d84ddf5b5259064ae5ceb2ee159f708d6741b2d1e7c65a2
```

<center><img src="/assets/images/post/2019-09-04-kubernetes/image3.png" style="max-width: 100%; height: auto;"></center>   


위와 같이 Worker node 가 연결 되는 것을 확인하였습니다.
사용할 모든 Worker node 에 수행합니다.

## 배포 완료
<center><img src="/assets/images/post/2019-09-04-kubernetes/image4.png" style="max-width: 100%; height: auto;"></center>   

# APP 배포 테스트
구성이 완료된 kubernetes 가 정상적으로 작동하는지 APP 을 배포하여 테스트하도록 하겠습니다.

* Pod 생성
```bash
$ kubectl run test-httpd --image=httpd  
deployment.apps/test-httpd created 
```

* Pod 생성 확인
```bash
$ kubectl get po  
NAME                          READY   STATUS    RESTARTS   AGE 
test-httpd-7dd7c96c8f-hvbzl   1/1     Running   0          31s 
```

* Service 생성
```bash
$ kubectl expose deployment.apps/test-httpd --port 80 
service/test-httpd exposed 
```

* Service 작동 확인

```bash
$ curl 10.97.176.30 
<html><body><h1>It works!</h1></body></html>
```

이처럼 손쉽게 kubernetes 테스트 환경을 구축 하였습니다.

# 참고 문서
- Kubernetes Preinstaller github : [https://github.com/chhanz/k8s-install-script](https://github.com/chhanz/k8s-install-script)
- `kubeadm`을 이용한 설치 : [https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/)
- `calico` CNI 설치 : [https://docs.projectcalico.org/v3.8/getting-started/kubernetes/installation/calico](https://docs.projectcalico.org/v3.8/getting-started/kubernetes/installation/calico)

