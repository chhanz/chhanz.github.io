---
layout: post
title: "[Kubernetes] Kubernetes Volume #1"
description: "emptyDir / hostPath / gitRepo"
author: chhanz
date: 2019-04-12
tags: [kubernetes]
category: kubernetes
---

* * *   
이번 포스팅은 Kubernetes Korea Group의 Kubernetes Architecture Study 모임에서 스터디 후, 발표된 내용입니다.   
Link : [k8skr-study-architecture Github](https://github.com/grepsean/k8skr-study-architecture)
* * *   
   
# Kubernetes Volume   
* * *   
Kubernetes 에서 Volume 으로 사용 가능한 유형은 아래와 같습니다.   
> - emptyDir   
> - hostPath   
> - gitRepo   
> - Openstack Cinder   
> - cephfs   
> - iscsi   
> - rbd   
> - 그 외 Public Cloud Storage   
   
이처럼 Kubernetes 에서는 다양한 Volume 을 지원합니다.   
책에 소개된 emptyDir / hostPath / gitRepo 에 대해 예제와 함께 어떤식으로 사용이 되는지 확인 해보겠습니다.   
추가로 책에는 없는 nfs / cephfs / rbd 를 Kubernetes Volume 으로 사용 해보겠습니다.   
   
# emptyDir   
* * *   
emptyDir 은 Pod 과 함께 생성되고, 삭제되는 임시 Volume 입니다.   
컨테이너 단위로 관리되는 것이 아니고 Pod 단위로 관리가 되기 때문에 Pod 내 컨테이너가 Error 로 인해 삭제 혹은 재시작이 되더라도 emptyDir 은 삭제가 되지 않고 계속 사용이 가능합니다.   

## emptyDir 예제   
~~~bash   
# cat fortuneloop.sh
#!/bin/bash
trap "exit" SIGINT
mkdir /var/htdocs
while :
do
    echo $(date) Writing fortune to /var/htdocs/index.html
    /usr/games/fortune > /var/htdocs/index.html
    sleep 10
done
~~~   
위 스크립트를 이용해서 Docker 이미지를 Build 합니다.   
~~~Dockerfile
FROM ubuntu:latest
RUN apt-get update ; apt-get -y install fortune
ADD fortuneloop.sh /bin/fortuneloop.sh
ENTRYPOINT /bin/fortuneloop.sh
~~~   
Docker Image 를 Build 합니다.   
~~~bash   
# docker build -t han0495/fortune .
Sending build context to Docker daemon  3.072kB
Step 1/4 : FROM ubuntu:latest
 ---> 94e814e2efa8
Step 2/4 : RUN apt-get update ; apt-get -y install fortune
 ---> Running in 3c8f694a68af

< 중 략 >

Removing intermediate container 3c8f694a68af
 ---> 1e8b262e7bdf
Step 3/4 : ADD fortuneloop.sh /bin/fortuneloop.sh
 ---> 3eee41108b5b
Step 4/4 : ENTRYPOINT /bin/fortuneloop.sh
 ---> Running in 082ee707cdf1
Removing intermediate container 082ee707cdf1
 ---> 58d2d430a7b4
Successfully built 58d2d430a7b4
Successfully tagged han0495/fortune:latest
[root@m01 inside]#
~~~   
아래와 같은 yaml 파일을 작성합니다.   
~~~yml   
# cat fortune.yml
apiVersion: v1
kind: Pod
metadata:
  name: fortune
spec:
  containers:
  - image: han0495/fortune
    name: html-generator
    volumeMounts:
    - name: html
      mountPath: /var/htdocs
  - image: nginx:alpine
    name: web-server
    volumeMounts:
    - name: html
      mountPath: /usr/share/nginx/html
      readOnly: true
    ports:
    - containerPort: 80
      protocol: TCP
  volumes:
  - name: html
    emptyDir: {}
~~~   
작성한 yaml 파일을 이용하여, Pod을 생성합니다.   
~~~sh   
[root@m01 fortune]# kubectl get po
NAME                              READY   STATUS    RESTARTS   AGE
fortune                           2/2     Running   0          5m10s
load-generator-557649ddcd-nl6js   1/1     Running   1          6d18h
php-apache-9bd5c887f-nm4h5        1/1     Running   0          6d18h
tomcat-f94554bb9-gkhpz            1/1     Running   0          7d
web-7d77974d4c-gd76n              1/1     Running   0          7d2h
 
[root@m01 fortune]# kubectl describe po fortune
Name:               fortune
Namespace:          default
Priority:           0
PriorityClassName:  <none>
Node:               w03/192.168.13.16
Start Time:         Mon, 08 Apr 2019 17:41:40 +0900
Labels:             <none>
Annotations:        <none>
Status:             Running
IP:                 10.233.89.8
Containers:
  html-generator:
    Container ID:   docker://e25bc8c3b94a2a02edc8b983eb77214a4644a99a3931c1f96f131819060cc676
    Image:          han0495/fortune
    Image ID:       docker-pullable://han0495/fortune@sha256:63d5786a84e67dcd5eec70d516d5788c8e3c3a90d23f23bec1825f7a4526bb00
    Port:           <none>
    Host Port:      <none>
    State:          Running
      Started:      Mon, 08 Apr 2019 17:42:01 +0900
    Ready:          True
    Restart Count:  0
    Environment:    <none>
    Mounts:
      /var/htdocs from html (rw)
      /var/run/secrets/kubernetes.io/serviceaccount from default-token-vt6hm (ro)
  web-server:
    Container ID:   docker://ed7c2fd5adbb919fde6ed01d1a80fa74df689d1aa99bc8d883b1b68ed918dd09
    Image:          nginx:alpine
    Image ID:       docker-pullable://nginx@sha256:d5e177fed5e4f264e55b19b84bdc494078a06775612a4f60963f296756ea83aa
    Port:           80/TCP
    Host Port:      0/TCP
    State:          Running
      Started:      Mon, 08 Apr 2019 17:42:09 +0900
    Ready:          True
    Restart Count:  0
    Environment:    <none>
    Mounts:
      /usr/share/nginx/html from html (ro)
      /var/run/secrets/kubernetes.io/serviceaccount from default-token-vt6hm (ro)
Conditions:
  Type              Status
  Initialized       True
  Ready             True
  ContainersReady   True
  PodScheduled      True
Volumes:
  html:
    Type:    EmptyDir (a temporary directory that shares a pod's lifetime)
    Medium:
  default-token-vt6hm:
    Type:        Secret (a volume populated by a Secret)
    SecretName:  default-token-vt6hm
    Optional:    false
QoS Class:       BestEffort
Node-Selectors:  <none>
Tolerations:     node.kubernetes.io/not-ready:NoExecute for 300s
                 node.kubernetes.io/unreachable:NoExecute for 300s
Events:
  Type    Reason     Age    From               Message
  ----    ------     ----   ----               -------
  Normal  Scheduled  5m26s  default-scheduler  Successfully assigned default/fortune to w03
  Normal  Pulling    5m23s  kubelet, w03       pulling image "han0495/fortune"
  Normal  Pulled     5m5s   kubelet, w03       Successfully pulled image "han0495/fortune"
  Normal  Created    5m5s   kubelet, w03       Created container
  Normal  Started    5m4s   kubelet, w03       Started container
  Normal  Pulling    5m4s   kubelet, w03       pulling image "nginx:alpine"
  Normal  Pulled     4m56s  kubelet, w03       Successfully pulled image "nginx:alpine"
  Normal  Created    4m56s  kubelet, w03       Created container
  Normal  Started    4m56s  kubelet, w03       Started container
[root@m01 fortune]#
~~~   
실제로 파일이 Docker 이미지에 넣은 스크립트가 동작하는지 확인합니다.   
~~~sh   
[root@m01 fortune]# kubectl exec -ti fortune /bin/bash
Defaulting container name to html-generator.
Use 'kubectl describe pod/fortune -n default' to see all of the containers in this pod.
root@fortune:/#
root@fortune:/# cd /var
root@fortune:/var# cd htdocs/
root@fortune:/var/htdocs# ls
index.html
root@fortune:/var/htdocs#
root@fortune:/var/htdocs# cat index.html
You are standing on my toes.
root@fortune:/var/htdocs# while true
> do
> date
> cat index.html
> sleep 10
> done
Mon Apr  8 08:48:43 UTC 2019
Artistic ventures highlighted.  Rob a museum.
Mon Apr  8 08:48:53 UTC 2019
Never reveal your best argument.
Mon Apr  8 08:49:03 UTC 2019
You can create your own opportunities this week.  Blackmail a senior executive.
Mon Apr  8 08:49:13 UTC 2019
You have a strong appeal for members of the opposite sex.
Mon Apr  8 08:49:23 UTC 2019
You will be reincarnated as a toad; and you will be much happier.
^C
root@fortune:/var/htdocs#
~~~   
   
# hostPath   
* * *   
hostPath는 로컬 디스크의 경로를 Pod 에 Mount 해서 사용하는 Volume 방식입니다.   
Docker 에서 -v 옵션으로 Volume 을 연결하는 것과 동일하다고 생각하면 됩니다.   

## hostPath 예제   
~~~yaml   
# cat hostpath-pod.yml
apiVersion: v1
kind: Pod
metadata:
  name: hostpath
spec:
  containers:
  - name: nginx
    image: nginx
    volumeMounts:
    - name: volumepath
      mountPath: /usr/share/nginx/html
  volumes:
  - name : volumepath
    hostPath:
      path: /imsi
      type: Directory
~~~   
nginx 의 index Directory 에 /imsi 라는 로컬 디스크 경로를 Mount 합니다.   
이후 Pod 을 해당 yaml 을 이용해서 구동합니다.   
~~~sh   
[root@m01 pod-example]# kubectl exec -ti hostpath -- /bin/bash
root@hostpath:/#
root@hostpath:/# ls
bin  boot  dev  etc  home  lib  lib64  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var
root@hostpath:/#
root@hostpath:/# cd /usr
root@hostpath:/usr# cd share/
root@hostpath:/usr/share# cd nginx/
root@hostpath:/usr/share/nginx# cd html/
root@hostpath:/usr/share/nginx/html# ls
root@hostpath:/usr/share/nginx/html#
root@hostpath:/usr/share/nginx/html# touch test
root@hostpath:/usr/share/nginx/html# exit
exit
[root@m01 pod-example]#
~~~
Pod 이 구동된 Worker의 로컬 디스크 /imsi 경로를 확인해보면 아래와 같이 파일이 생성된 것을 확인 할 수 있습니다.   
~~~sh
[root@w01 ~]# ls -la /imsi
합계 0
drwxrwxrwx   2 root root  18  4월  9 13:15 .
dr-xr-xr-x. 18 root root 256  4월  9 09:45 ..
-rw-r--r--   1 root root   0  4월  9 13:15 test
[root@w01 ~]#
~~~   
   
# gitRepo   
* * *   
gitRepo 는 github에 있는 Repository 에서 Source 를 Clone 하고 해당 Clone 된 데이터를 Pod 의 Volume으로 할당합니다.   
   
# gitRepo 예제   
~~~yaml   
# cat git-http.yml
apiVersion: v1
kind: Pod
metadata:
  name: gitrepo-httpd
spec:
  containers:
  - image: httpd
    name: web-server
    volumeMounts:
    - name: html
      mountPath: /usr/local/apache2/htdocs
      readOnly: true
    ports:
    - containerPort: 80
      protocol: TCP
  volumes:
  - name: html
    gitRepo:
      repository: https://github.com/chhanz/docker_training.git
      revision: master
      directory: .
~~~   
위와 같이 Github에서 docker_training.git Source를 Clone 합니다.   
~~~sh
[root@m01 tmp]# kubectl describe po gitrepo-httpd
Name:               gitrepo-httpd
Namespace:          default
Priority:           0
PriorityClassName:  <none>
Node:               w02/192.168.13.15
Start Time:         Mon, 08 Apr 2019 21:51:43 +0900
Labels:             <none>
Annotations:        <none>
Status:             Pending
IP:
Containers:
  web-server:
    Container ID:
    Image:          nginx:alpine
    Image ID:
    Port:           80/TCP
    Host Port:      0/TCP
    State:          Waiting
      Reason:       ContainerCreating
    Ready:          False
    Restart Count:  0
    Environment:    <none>
    Mounts:
      /usr/share/nginx/html from html (ro)
      /var/run/secrets/kubernetes.io/serviceaccount from default-token-vt6hm (ro)
Conditions:
  Type              Status
  Initialized       True
  Ready             False
  ContainersReady   False
  PodScheduled      True
Volumes:
  html:
    Type:        GitRepo (a volume that is pulled from git when the pod is created)
    Repository:  https://github.com/chhanz/docker_training.git
    Revision:    master
  default-token-vt6hm:
    Type:        Secret (a volume populated by a Secret)
    SecretName:  default-token-vt6hm
    Optional:    false
QoS Class:       BestEffort
Node-Selectors:  <none>
Tolerations:     node.kubernetes.io/not-ready:NoExecute for 300s
                 node.kubernetes.io/unreachable:NoExecute for 300s
Events:
  Type     Reason       Age              From               Message
  ----     ------       ----             ----               -------
  Normal   Scheduled    6s               default-scheduler  Successfully assigned default/gitrepo-httpd to w02
  Warning  FailedMount  1s (x4 over 5s)  kubelet, w02       MountVolume.SetUp failed for volume "html" : failed to exec 'git clone -- https://github.com/chhanz/docker_training.git .': : executable file not found in $PATH
~~~   
위와 같이 에러가 발생하며, Volume 이 Mount 가 안되었습니다.   
이유는 Pod 이 실행될 Worker 노드에 git 명령어가 없어서 발생된 에러였습니다.   
~~~sh
[root@m01 gitrepo-pv]# kubectl describe po gitrepo-httpd
Name:               gitrepo-httpd
Namespace:          default
Priority:           0
PriorityClassName:  <none>
Node:               w01/192.168.13.14
Start Time:         Mon, 08 Apr 2019 21:58:23 +0900
Labels:             <none>
Annotations:        <none>
Status:             Running
IP:                 10.233.118.8
Containers:
  web-server:
    Container ID:   docker://38158075431bab4e7cfe22e34b615e66ac04e37ad7832a531d811cd67b27962a
    Image:          httpd
    Image ID:       docker-pullable://httpd@sha256:b4096b744d92d1825a36b3ace61ef4caa2ba57d0307b985cace4621139c285f7
    Port:           80/TCP
    Host Port:      0/TCP
    State:          Running
      Started:      Mon, 08 Apr 2019 21:58:49 +0900
    Ready:          True
    Restart Count:  0
    Environment:    <none>
    Mounts:
      /usr/local/apache2/htdocs from html (ro)
      /var/run/secrets/kubernetes.io/serviceaccount from default-token-vt6hm (ro)
Conditions:
  Type              Status
  Initialized       True
  Ready             True
  ContainersReady   True
  PodScheduled      True
Volumes:
  html:
    Type:        GitRepo (a volume that is pulled from git when the pod is created)
    Repository:  https://github.com/chhanz/docker_training.git
    Revision:    master
  default-token-vt6hm:
    Type:        Secret (a volume populated by a Secret)
    SecretName:  default-token-vt6hm
    Optional:    false
QoS Class:       BestEffort
Node-Selectors:  <none>
Tolerations:     node.kubernetes.io/not-ready:NoExecute for 300s
                 node.kubernetes.io/unreachable:NoExecute for 300s
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  28s   default-scheduler  Successfully assigned default/gitrepo-httpd to w01
  Normal  Pulling    21s   kubelet, w01       pulling image "httpd"
  Normal  Pulled     0s    kubelet, w01       Successfully pulled image "httpd"
  Normal  Created    0s    kubelet, w01       Created container
  Normal  Started    0s    kubelet, w01       Started container
[root@m01 gitrepo-pv]# kubectl get po
NAME                              READY   STATUS    RESTARTS   AGE
fortune                           2/2     Running   0          4h17m
gitrepo-httpd                     1/1     Running   0          33s
load-generator-557649ddcd-nl6js   1/1     Running   1          6d22h
php-apache-9bd5c887f-nm4h5        1/1     Running   0          6d22h
tomcat-f94554bb9-gkhpz            1/1     Running   0          7d4h
web-7d77974d4c-gd76n              1/1     Running   0          7d6h
[root@m01 gitrepo-pv]#
~~~
위와 같이 Worker 노드에 git 명령을 설치한 이후, 정상적으로 Volume 이 Mount 되는 것을 확인 할 수 있었습니다.   
~~~sh
[root@w01 /]# find * | grep index.html
 
var/lib/kubelet/pods/fcd69917-59fd-11e9-a751-001a4a160172/volumes/kubernetes.io~git-repo/html/index.html
 
[root@w01 /]# cd var/lib/kubelet/pods/fcd69917-59fd-11e9-a751-001a4a160172/volumes/kubernetes.io~git-repo/html/
[root@w01 html]# ls
copy.html  index.html  README.md  util
[root@w01 html]# ls -la
total 20
drwxrwxrwx 4 root root   82 Apr  8 21:58 .
drwxr-xr-x 3 root root   18 Apr  8 21:58 ..
-rw-r--r-- 1 root root 2070 Apr  8 21:58 copy.html
drwxr-xr-x 8 root root  180 Apr  8 21:58 .git
-rw-r--r-- 1 root root 9594 Apr  8 21:58 index.html
-rw-r--r-- 1 root root  108 Apr  8 21:58 README.md
drwxr-xr-x 2 root root   23 Apr  8 21:58 util
[root@w01 html]#
[root@w01 html]#
[root@w01 html]# cat README.md
# Docker Training ReadMe
Custumer training page
 
 - index.html
 - copy.html     // Copy&Paste
 - putty.exe
~~~   
위와 같이 Worker 노드에 해당 git Source 를 Clone 하고 Pod 에 Mount 된 것을 확인 할 수 있었습니다.
~~~sh
## Master Node
[root@m01 gitrepo-pv]# kubectl delete -f git-http.yml
pod "gitrepo-httpd" deleted
 
## Worker Node
[root@w01 kubernetes.io~git-repo]# cd ..
cd: error retrieving current directory: getcwd: cannot access parent directories: No such file or directory
[root@w01 ..]# ls
[root@w01 ..]#
[root@w01 ..]# ls -la
total 0
[root@w01 ..]# pwd
/var/lib/kubelet/pods/fcd69917-59fd-11e9-a751-001a4a160172/volumes/kubernetes.io~git-repo/..
[root@w01 ..]#
[root@w01 ..]#
[root@w01 ..]# cd ..
cd: error retrieving current directory: getcwd: cannot access parent directories: No such file or directory
[root@w01 ..]# ls
[root@w01 ..]#
[root@w01 ..]# ls -la /var/lib/kubelet/pods/fcd69917-59fd-11e9-a751-001a4a160172/
ls: cannot access /var/lib/kubelet/pods/fcd69917-59fd-11e9-a751-001a4a160172/: No such file or directory
[root@w01 ..]#
~~~
이처럼 해당 Pod이 삭제되면 Clone 된 Git Source는 삭제가 되는 것을 확인 하였습니다.   
위 테스트를 진행해보니 Git Source 를 Clone 만하고 Github Repository를 계속 Sync하는 것은 아닌 것으로 확인 하였습니다.   
   
지금까지 emptyDir / hostPath / gitRepo 에 대해 예제를 통해 확인 하였습니다.   
nfs / cephfs / rbd 은 다음 포스팅에서 이어서 설명하도록 하겠습니다.   
   