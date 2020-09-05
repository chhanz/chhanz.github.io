---
layout: post
title: "[Kubernetes] Ansible 으로 k3s 배포하기 (on VMware)"
description: " "
author: chhanz
date: 2020-09-05
tags: [kubernetes]
category: kubernetes
---
# Ansible 을 이용하여 k3s 배포해보자
<center><br><img src="/assets/images/post/2020-09-05-k3s/0.png" style="max-width: 95%; height: auto;"><br>   
</center> 
## k3s 란?
`Rancher` 에서 IoT / Edge / ARM 등의 가벼운 시스템에 Kubernetes 서비스를 올리기 위해 만들어진 Lightweight Kubernetes 입니다.   
   
## Ansible.fast-k3s 란?
저는 평소엔 사내 교육이나 테스트를 위해 주로 Minikube 를 이용하였습니다.   
Minikube 도 Linux laptop 인지 Windows (version) laptop 인지 Mac 인지 확인해서 설치를 가이드 해야되는 불편함이 있었습니다.   

그래서 VMware (vCenter) 에 생성되어 있는 Template 를 이용하여 자동으로 Kubernetes 테스트 환경을 만드는 Playbook 을 만들었습니다.   
   
## Requirements
> 현재는 VMware 만 VM Provisioning 하도록 만들어져 있습니다.    
> 향후에 필요하다면 KVM / RHV / oVirt 등 개발 예정입니다.   
> 미지원하는 Hypervisor 는 k3s `Tag` 를 이용해서 k3s 만 배포하면 됩니다.   
   
* vCenter 6.7 (Tested)   
* CentOS 7.7 Minimal Install Template   
* Static IP   
* Ansible >= 2.9.6 (Tested)   
* [https://github.com/chhanz/ansible.fast-k3s](https://github.com/chhanz/ansible.fast-k3s)   
   
## Playbook 사용 방법
* Ansible 로 VMware 통제하기 위해서는 아래와 같이 Python module 을 설치 해야됩니다.   
    + pyvmomi >= 7.0
    ```console
    $ pip install -r requirements.txt
    ```

* git clone 및 variable 수정   

```console
$ git clone https://github.com/chhanz/ansible.fast-k3s.git
$ cd ansible.fast-k3s
```

```yaml
$ vi vm_information.yml   
---
### variable information 'vcenter'
vcenter_server: "vc.changeme.com"
vcenter_user: "Administrator@vsphere.local"
vcenter_pass: "password"
datacenter_name: "Datacenter"
cluster_name: "Cluster"
datastore_name: "Datastore-1"
vm_network: "VM Network"

### variable 'virtual machine"
vm_template: "c7.7-template"
vm_netmask: "255.255.255.0"
vm_gateway: "192.168.0.1"
vm_dns: "1.1.1.1"
```
위와 같이 `vm_information.yml` 을 VM 을 배포할 vCenter 정보를 수정하고. 배포에 사용될 VM Template, VM 에 사용될 IP 정보를 입력합니다.   
   
* Playbook 실행
    + deploy lab environment 'k3s'   
    ```bash
    $ ansible-playbook -i inventory deploy-k3s.yml 
    ```
    VM Provisioning 과 k3s 배포를 위한 Playbook.    
    + (option) only deploy vm   
    ```bash
    $ ansible-playbook -i inventory deploy-k3s.yml -t vm
    ```
    VM Provisioning 배포를 위한 Playbook.   
    + (option) only install k3s   
    ```bash
    $ ansible-playbook -i inventory deploy-k3s.yml -t k3s
    ```
    k3s 배포를 위한 Playbook.   

## 배포 예제
* Playbook 수행 결과   
<img src="/assets/images/post/2020-09-05-k3s/1.png" style="max-width: 95%; height: auto;"><br>   
   
* VM 생성 결과    
  
* k3s 배포 결과    
<img src="/assets/images/post/2020-09-05-k3s/4.png" style="max-width: 95%; height: auto;"><br>   
```bash
[root@k3s-10-50-1-42 ~]# kubectl get nodes
NAME             STATUS   ROLES    AGE     VERSION
k3s-10-50-1-42   Ready    master   9m29s   v1.18.8+k3s1
[root@k3s-10-50-1-42 ~]#
```
   
# Known Issue
1.  k3s 는 공식적으로 Ubuntu 만 지원하는 것으로 되어 있습니다.   
    하지만 아래와 같이 CentOS/RHEL 계열 추가 작업이 진행중이며, 설치는 가능하나 `firewalld` 및 `SELinux` 에 대해 검토 진행중인 것으로 보입니다.   
    ([https://github.com/rancher/k3s/issues/1371](https://github.com/rancher/k3s/issues/1371))   
2.  `vmware_guest` module 을 이용하여 Ubuntu 를 배포하면 Static IP 설정을 못하는 이슈가 있습니다.   
    이는 `open-vm-tools` 에서 아직 `netplan` 을 이용한 네트워크 설정이 아직 미지원이라 그렇습니다.   
    ([https://docs.ansible.com/ansible/latest/scenario_guides/vmware_scenarios/vmware_troubleshooting.html](https://docs.ansible.com/ansible/latest/scenario_guides/vmware_scenarios/vmware_troubleshooting.html))   
   
# 참고 문서
* [https://docs.ansible.com/ansible/latest/modules/vmware_guest_module.html](https://docs.ansible.com/ansible/latest/modules/vmware_guest_module.html)   
* [https://rancher.com/docs/k3s/latest/en/installation/](https://rancher.com/docs/k3s/latest/en/installation/)   
* [https://github.com/chhanz/ansible.fast-k3s](https://github.com/chhanz/ansible.fast-k3s)   