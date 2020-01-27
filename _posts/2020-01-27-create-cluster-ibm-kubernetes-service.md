---
layout: post
title: "[Kubernetes] IBM Cloud Kubernetes Service 를 Free Tier 로 사용해보자!"
description: " "
author: chhanz
date: 2020-01-27
tags: [kubernetes, cloud]
category: kubernetes
---

# 목차
+ [IBM Cloud Kubernetes Service 생성](#ibm-cloud-kubernetes-service-생성)   
+ [IBM Cloud Cli 및 Kubectl 설치](#ibm-cloud-cli-및-kubectl-설치)   
+ [Deploy Sample Service](#deploy-sample-service)   
+ [Delete Kubernetes Cluster](#delete-kubernetes-cluster)   
+ [참고 자료](#참고-자료)   
   
# 관리형 Kubernetes Service
> 각 Public Cloud Provider 에서는 관리형 Kubernetes Service를 제공하고 있습니다.   
> `AWS` 에서는 Amazon Elastic Kubernetes Service([`AWS EKS`](https://aws.amazon.com/ko/eks/)),   
> `Azure` 에서는 Azure Kubernetes Service([`AKS`](https://azure.microsoft.com/ko-kr/services/kubernetes-service/))의 이름으로 서비스를 하고 있으며,   
> `IBM` 에서는 IBM Cloud Kubernetes Service([`IKS`](https://www.ibm.com/kr-ko/cloud/container-service)) 라는 서비스를 제공하고 있습니다.   
   
이번 포스팅에서는 무료로 관리형 Kubernetes 서비스를 이용 할 수 있는 `IBM Cloud Kubernetes Service`(이하 `IKS`) 를 이용하여   
Cluster 를 생성하고 Sample 서비스를 배포해보도록 하겠습니다.   
   
# IBM Cloud Kubernetes Service 생성
IKS 서비스 생성을 위해서는 IBM Cloud 계정 생성이 필요하며, 해당 계정에 신용카드 등록이 필요합니다.   
(신용카드 등록은 하지만 `Free` 요금제 사용으로 추가 과금은 없습니다.)   
또한 `IKS` `Free` 요금제의 경우, Cluster 의 사용 기간이 한달이며, 한달 후엔 Cluster 사용이 중지됩니다.   
   
<img src="/assets/images/post/2020-01-27-iks/1-login.png" style="max-width: 95%; height: auto;">   
[IBM Cloud](https://cloud.ibm.com/login) 에 접속하여 Login 합니다.   
   
<img src="/assets/images/post/2020-01-27-iks/2-dash.png" style="max-width: 95%; height: auto;">   
위와 같이 IBM Cloud Dashboard 를 확인 할 수 있습니다.   
   
<img src="/assets/images/post/2020-01-27-iks/3-menu.png" style="max-width: 95%; height: auto;">   
Kubernetes 서비스를 이용하기 위해서는 `메뉴`를 선택하고 `Kubernetes` 를 선택합니다.   
   
<img src="/assets/images/post/2020-01-27-iks/4-create-kube-cluster.png" style="max-width: 95%; height: auto;">   
Kubernetes 항목에서 `Create Cluster` 를 선택합니다.   
   
<img src="/assets/images/post/2020-01-27-iks/5-select-free.png" style="max-width: 95%; height: auto;">   
위와 같이 요금제를 `Free` 선택을 하여 과금없는 관리형 Kubernetes 서비스 생성을 할 수 있습니다.   
`Create Cluster` 를 선택하여 Cluster 생성을 진행합니다.   

<img src="/assets/images/post/2020-01-27-iks/6-create-cluster.png" style="max-width: 95%; height: auto;">   
CLI 접근을 위해 `IBM Cloud Cli` 설치 방법 및 `kubeconfig` 설정에 대한 가이드가 안내 됩니다.   
   
<img src="/assets/images/post/2020-01-27-iks/7-overview.png" style="max-width: 95%; height: auto;">   
위와 같이 Worker node 배포가 진행되며, 일정 시간이 지나면 아래와 같이 배포가 완료 됩니다.   
   
<img src="/assets/images/post/2020-01-27-iks/8-complete-create-cluster.png" style="max-width: 95%; height: auto;">   
`IKS` 생성이 완료 되었습니다.   
   
<img src="/assets/images/post/2020-01-27-iks/9-chk-kube-dash.png" style="max-width: 95%; height: auto;">   
`IKS` 서비스가 배포가 완료되면, `Kubernetes-dashboard` 가 Pod 으로 생성됩니다.   
위와 같이 `Kubernetes-dashboard` 로 접속하여 Kubernetes 를 사용 할 수도 있습니다.   
   
# IBM Cloud Cli 및 Kubectl 설치
IBM Cloud Cli 설치에 사용되는 운영체제는 `CentOS 7.7` 을 사용 하였습니다.   
   
* IBM Cloud Cli 설치   
```bash
$ curl -sL https://ibm.biz/idt-installer | bash 
```
자동으로 필요한 패키지 설치합니다.   
설치가 완료된 후, ssh 재접속을 하면 `ibmcloud(ic)` 라는 명령어가 사용 가능합니다.

```bash
[root@fastvm-centos-7-7-31 ~]# ic
NAME:
  ibmcloud - A command line tool to interact with IBM Cloud
  Find more information at: https://ibm.biz/cli-docs

USAGE:
  [environment variables] ibmcloud [global options] command [arguments...] [command options]

VERSION:
  0.22.0+5ccbbea-2020-01-21T09:34:49+00:00

COMMANDS:
  api                                   Set or view target API endpoint
  login                                 Log user in
  target                                Set or view the targeted region, account, resource group, org or space
  config                                Write default values to the config
  update                                Update CLI to the latest version
  logout                                Log user out
  regions                               List all the regions
  version                               Print the version
  resource                              Manage resource groups and resources
  iam                                   Manage identities and access to resources
  dev                                   Create, develop, deploy, and monitor applications
  app                                   [Deprecated] Manage Cloud Foundry applications and application related domains and routes.
  service                               [Deprecated] Manage Cloud Foundry services.
  billing                               Retrieve usage and billing information
  plugin                                Manage plug-ins and plug-in repositories
  cf                                    Run Cloud Foundry CLI with IBM Cloud CLI context
  catalog                               Manage catalog
  account                               Manage accounts, users, orgs and spaces
  enterprise                            Manage enterprise, account groups and accounts.
  cfee                                  Manage Cloud Foundry Enterprise Environments
  cloud-functions, wsk, functions, fn   Manage Cloud Functions
  cos                                   Interact with IBM Cloud Object Storage services
  cr                                    Manage IBM Cloud Container Registry content and configuration.
  cs, ks, oc                            Manage IBM Cloud Kubernetes Service clusters.
  sl                                    Manage Classic infrastructure services
  help, h                               Show help

Enter 'ibmcloud help [command]' for more information about a command.

ENVIRONMENT VARIABLES:
  IBMCLOUD_COLOR=false                     Do not colorize output
  IBMCLOUD_ANALYTICS=false                 Do not collect usage statistics for analytics
  IBMCLOUD_VERSION_CHECK=false             Do not check latest version for update
  IBMCLOUD_HTTP_TIMEOUT=5                  A time limit for HTTP requests
  IBMCLOUD_API_KEY=api_key_value           API Key used for login
  IBMCLOUD_TRACE=true                      Print API request diagnostics to stdout
  IBMCLOUD_TRACE=path/to/trace.log         Append API request diagnostics to a log file
  IBMCLOUD_HOME=path/to/dir                Path to config directory

GLOBAL OPTIONS:
  --version, -v                      Print the version
  --help, -h                         Show help

[root@fastvm-centos-7-7-31 ~]#
```   
   
* Login IBM Cloud   
아래 명령을 입력하여 Login 을 합니다.   
```bash
$ ibmcloud login -a cloud.ibm.com -r us-south
```
아래와 같은 Login 과정이 필요합니다.   

```bash
[root@fastvm-centos-7-7-31 ~]# ibmcloud login -a cloud.ibm.com -r us-south
API endpoint: https://cloud.ibm.com

Email> "계정명@이메일"

Password> "패스워드"
Authenticating...
OK

Targeted account CheolHee Han`s Account ("Account ID") <-> "Account ID"

Targeted region us-south


API endpoint:      https://cloud.ibm.com
Region:            us-south
User:              "계정명@이메일"
Account:           CheolHee Han`s Account ("Account ID") <-> "Account ID"
Resource group:    No resource group targeted, use 'ibmcloud target -g RESOURCE_GROUP'
CF API endpoint:
Org:
Space:

Tip: If you are managing Cloud Foundry applications and services
- Use 'ibmcloud target --cf' to target Cloud Foundry org/space interactively, or use 'ibmcloud target --cf-api ENDPOINT -o ORG -s SPACE' to target the org/space.
- Use 'ibmcloud cf' if you want to run the Cloud Foundry CLI with current IBM Cloud CLI context.
```

   
* `Kubeconfig` 설정   
아래 명령을 입력하고 생성된 Export 명령을 입력합니다.   

```bash
[root@fastvm-centos-7-7-31 ~]# ibmcloud ks cluster config --cluster "IKS Cluster ID"
Kubernetes version 1.16 has removed deprecated APIs. For more information, see <http://ibm.biz/k8s-1-16-apis>

If you have clusters that run Kubernetes versions 1.11, 1.12 or 1.13, update them now to continue receiving important security updates and support. Kubernetes version 1.13 is deprecated and will be unsupported 22 February 2020. Versions 1.12 and earlier are already unsupported. For more information and update actions, see <https://ibm.biz/iks-versions>

WARNING: The behavior of this command in your current CLI version is deprecated, and becomes unsupported when CLI version 1.0 is released in March 2020. To use the new behavior now, set the 'IKS_BETA_VERSION' environment variable. In bash, run 'export IKS_BETA_VERSION=1'.
Note: Changing the beta version can include other breaking changes. For more information, see http://ibm.biz/iks-cli-v1

OK
The configuration for "IKS Cluster ID" was downloaded successfully.

Export environment variables to start using Kubernetes.

export KUBECONFIG=/root/.bluemix/plugins/container-service/clusters/"IKS Cluster ID"/kube-config-hou02-chhanz-kubecluster.yml

[root@fastvm-centos-7-7-31 ~]# export KUBECONFIG=/root/.bluemix/plugins/container-service/clusters/"IKS Cluster ID"/kube-config-hou02-chhanz-kubecluster.yml
```

   
* Kubernetes 상태 확인   
아래와 같이 `kubectl` 명령을 통해 확인이 가능합니다.   
```bash
[root@fastvm-centos-7-7-31 ~]# kubectl get nodes
NAME           STATUS   ROLES    AGE    VERSION
10.76.68.233   Ready    <none>   107s   v1.15.8+IKS
[root@fastvm-centos-7-7-31 ~]#
```
   

# Deploy Sample Service
`IKS` 에 Web 서비스를 올려보도록 하겠습니다.   
   
* `sample-httpd` 배포   
아래와 같이 `sample-httpd` Container 이미지를 `IKS` 에 배포합니다.

```bash
[root@fastvm-centos-7-7-31 ~]# kubectl run sample-httpd --image=han0495/sample-httpd 
kubectl run --generator=deployment/apps.v1 is DEPRECATED and will be removed in a future version. Use kubectl run --generator=run-pod/v1 or kubectl create instead.
deployment.apps/sample-httpd created

[root@fastvm-centos-7-7-31 ~]# kubectl get all
NAME                                READY   STATUS    RESTARTS   AGE
pod/sample-httpd-86b74f6f64-7gcmj   1/1     Running   0          7s   << 'Pod 배포 완료'

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   172.21.0.1   <none>        443/TCP   33m

NAME                           READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/sample-httpd   1/1     1            1           8s

NAME                                      DESIRED   CURRENT   READY   AGE
replicaset.apps/sample-httpd-86b74f6f64   1         1         1       8s
```

* Expose Service   
아래 명령을 통해 `sample-httpd` 를 외부에 서비스 가능하도록 `svc` 를 생성합니다.

```bash
[root@fastvm-centos-7-7-31 ~]# kubectl expose deployment.apps/sample-httpd --port=80 --type=NodePort
service/sample-httpd exposed

[root@fastvm-centos-7-7-31 ~]# kubectl get svc
NAME           TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE
kubernetes     ClusterIP   172.21.0.1       <none>        443/TCP        37m
sample-httpd   NodePort    172.21.162.229   <none>        80:31154/TCP   5s     << 'expose 완료'
```
   
* 접속 테스트   
<img src="/assets/images/post/2020-01-27-iks/11-publicip.png" style="max-width: 95%; height: auto;">   
`IKS` Cluster 메뉴에서 Worker nodes 에서 `Public IP` 확인이 가능합니다.   
   
<img src="/assets/images/post/2020-01-27-iks/10-chk-sample-service.png" style="max-width: 95%; height: auto;">   
위와 같이 `http://50.23.5.197:31154` 로 접속하면, 정상적으로 Web 서비스가 작동하는 것을 확인 할 수 있습니다.   
   
# Delete Kubernetes Cluster
<img src="/assets/images/post/2020-01-27-iks/12-delete-cluster.png" style="max-width: 95%; height: auto;">   
위와 같이 Cluster 메뉴에서 `Delete Cluster` 를 선택하고 일정 시간후엔 Cluster 가 삭제가 됩니다.   

# 참고 자료
* Source 자료   
    - `sample-httpd-github` : [https://github.com/chhanz/sample-httpd-example](https://github.com/chhanz/sample-httpd-example)   
* Docker Image 정보   
    - `sample-httpd-dockerhub` : [https://hub.docker.com/r/han0495/sample-httpd](https://hub.docker.com/r/han0495/sample-httpd)   