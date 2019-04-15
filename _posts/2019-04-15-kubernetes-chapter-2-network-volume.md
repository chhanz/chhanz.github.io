---
layout: post
title: "[Kubernetes] Kubernetes Volume #2"
description: "Network Volume - nfs / cephfs / ceph rbd"
author: chhanz
date: 2019-04-15
tags: [kubernetes]
category: kubernetes
---

* * *   
이번 포스팅은 Kubernetes Korea Group의 Kubernetes Architecture Study 모임에서 스터디 후, 발표된 내용입니다.   
Link : [k8skr-study-architecture Github](https://github.com/grepsean/k8skr-study-architecture)
* * *   
   
# Kubernetes Volume #2   
* * *   
저번 포스팅 [Kubernetes Volume #1](https://chhanz.github.io/kubernetes/2019/04/12/kubernetes-chapter-1-volume/) 에서는 Local Volume 에 관련된 emptyDir / hostPath / gitRepo 에 대해 설명드렸습니다.   
   
이어서 이번 포스팅에서는 Network Volume 으로 사용될 nfs / cephfs / ceph rbd 를 예제와 함께 알아보도록 하겠습니다.   
   
# Persistent Volume 와 Persistent Volume Claim   
* * *   
Persistent Volume 와 Persistent VolumeClaim 가 있는데, 
> **Persistent Volume**(이하 PV) 는 Kubernetes 에서 관리되는 저장소로 Pod 과는 다른 수명 주기로 관리됩니다.   
Pod 이 재실행 되더라도, PV의 데이터는 정책에 따라 **유지/삭제**가 됩니다.   
   
> **Persistent Volume Claim**(이하 PVC) 는 PV를 추상화하여 개발자가 손쉽게 PV를 사용 가능하게 만들어주는 기능입니다.   
개발자는 사용에 필요한 Volume의 크기, Volume의 정책을 선택하고 요청만 하면 됩니다.   
운영자는 개발자의 요청에 맞게 PV 를 생성하게 되고, PVC는 해당 PV를 가져가게 됩니다.   
   
![](/assets/images/post/2019-04-15-kubernetes-volume/image1.png)   
   
이와 같은 방식을 **Static Provisioning** 이라 합니다.   
예제를 통해 Static Provisioning을 확인 해보겠습니다.   

# **Static Provisioning**
* * *
## **NFS**
NFS 서버를 PV로 사용하는 방식입니다.   
예제에 활용될 yaml 파일 내용은 아래와 같습니다.   
~~~yaml   
[root@m01 pod-example]# cat nfs-pod.yml
apiVersion: v1
kind: Pod
metadata:
  name: nfs-nginx
spec:
  containers:
  - name: nginx
    image: nginx
    volumeMounts:
    - name: nfsvol
      mountPath: /usr/share/nginx/html
  volumes:
  - name : nfsvol
    nfs:
      path: /data/nfs-ngnix
      server: 192.168.13.10
~~~   
위 yaml 파일을 이용해 Pod 을 생성하면   
~~~sh   
[root@m01 pod-example]# kubectl describe po nfs-nginx
Name:               nfs-nginx
Namespace:          default
Priority:           0
PriorityClassName:  <none>
Node:               w03/192.168.13.16
Start Time:         Sun, 14 Apr 2019 13:44:52 +0900
Labels:             <none>
Annotations:        <none>
Status:             Running
IP:                 10.233.89.5
Containers:
  nginx:
    Container ID:   docker://20fa842803535803e1c0c48c204cffe1d464f9f96e3fcf4d7eed11c0bb8aeed0
    Image:          nginx
    Image ID:       docker-pullable://nginx@sha256:50174b19828157e94f8273e3991026dc7854ec7dd2bbb33e7d3bd91f0a4b333d
    Port:           <none>
    Host Port:      <none>
    State:          Running
      Started:      Sun, 14 Apr 2019 13:45:13 +0900
    Ready:          True
    Restart Count:  0
    Environment:    <none>
    Mounts:
      /usr/share/nginx/html from nfsvol (rw)
      /var/run/secrets/kubernetes.io/serviceaccount from default-token-9vmtn (ro)
Conditions:
  Type              Status
  Initialized       True
  Ready             True
  ContainersReady   True
  PodScheduled      True
Volumes:
  nfsvol:
    Type:      NFS (an NFS mount that lasts the lifetime of a pod)
    Server:    192.168.13.10
    Path:      /data/nfs-ngnix
    ReadOnly:  false
  default-token-9vmtn:
    Type:        Secret (a volume populated by a Secret)
    SecretName:  default-token-9vmtn
    Optional:    false
QoS Class:       BestEffort
Node-Selectors:  <none>
Tolerations:     node.kubernetes.io/not-ready:NoExecute for 300s
                 node.kubernetes.io/unreachable:NoExecute for 300s
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  50s   default-scheduler  Successfully assigned default/nfs-nginx to w03
  Normal  Pulling    46s   kubelet, w03       pulling image "nginx"
  Normal  Pulled     28s   kubelet, w03       Successfully pulled image "nginx"
  Normal  Created    28s   kubelet, w03       Created container
  Normal  Started    28s   kubelet, w03       Started container
~~~   
nfs-nginx 라는 Pod 이 생성이 되고 위와 같이 **nfsvol** 이라는 Volume 이 Attach 된 것을 확인 할 수 있습니다.   
nginx 서비스가 연결된 Volume 을 통해 서비스가 되는지 확인해봅니다.  
~~~sh
[root@m01 pod-example]# curl 10.233.89.5
<html>
<body>
<p>NFS Index-v1</p>
</body>
</html>
[root@m01 pod-example]#

# Pod 내부에 접근해서 확인
[root@m01 pod-example]# kubectl exec -ti nfs-nginx /bin/bash
root@nfs-nginx:/#
root@nfs-nginx:/# cd /usr/share/nginx/html/
root@nfs-nginx:/usr/share/nginx/html# cat index.html
<html>
<body>
<p>NFS Index-v1</p>
</body>
</html>
root@nfs-nginx:/usr/share/nginx/html#
~~~   
**NFS Index-v1** 라는 index.html 을 가지고 있는 Volume 입니다.   
NFS 서버에 직접 접근해서 index.html 파일을 수정해보겠습니다.   
~~~sh   
[root@kube-depoly nfs-ngnix]# pwd
/data/nfs-ngnix
[root@kube-depoly nfs-ngnix]# cat index.html
<html>
<body>
<p>NFS Index-v1</p>
</body>
</html>
[root@kube-depoly nfs-ngnix]# vi index.html        // index.html 수정
[root@kube-depoly nfs-ngnix]# cat index.html
<html>
<body>
<p>NFS Index-v2</p>
</body>
</html>
[root@kube-depoly nfs-ngnix]#

# 적용 확인
[root@m01 pod-example]# curl 10.233.89.5
<html>
<body>
<p>NFS Index-v2</p>
</body>
</html>
[root@m01 pod-example]#
~~~   
이와 같이 Pod 에 NFS 서버가 연결 되어 있는 것을 확인 할 수 있었습니다.   
~~~sh
# NFS 로 Volume Attach 되어 있음
root@nfs-nginx:/usr/share/nginx/html# mount | grep nfs
192.168.13.10:/data/nfs-ngnix on /usr/share/nginx/html type nfs4 (rw,relatime,vers=4.1,rsize=262144,wsize=262144,namlen=255,hard,proto=tcp,timeo=600,retrans=2,sec=sys,clientaddr=192.168.13.15,local_lock=none,addr=192.168.13.10)
root@nfs-nginx:/usr/share/nginx/html#
~~~   
   
## **cephfs**
Software Defined Storage 인 ceph 를 이용하는 방식입니다.   
> Worker 노드에서 cephfs 를 사용하기 위해 ceph-common 패키지를 설치합니다.   
~~~sh   
# yum -y install epel-release
# rpm -Uvh https://download.ceph.com/rpm-luminous/el7/noarch/ceph-release-1-0.el7.noarch.rpm
# yum -y install ceph-common
~~~   

cephfs 를 사용하기 위해서는 Key 가 필요로 한데, 아래와 같은 방식으로 Key 값을 수집하고 Kubernete Secret 에 등록합니다.   

~~~sh
[root@s01 yum.repos.d]# ceph auth get client.admin
exported keyring for client.admin
[client.admin]
    key = AQC6s6Vc83jwKBAAtckE6yz3eTM9lWwK60QNYw==
    caps mds = "allow *"
    caps mgr = "allow *"
    caps mon = "allow *"
    caps osd = "allow *"
[root@s01 yum.repos.d]#
 
[root@s01 ceph]# ceph-authtool -p ceph.client.admin.keyring
AQC6s6Vc83jwKBAAtckE6yz3eTM9lWwK60QNYw==
[root@s01 ceph]#

# Secret 생성
[root@m01 cephfs]# cat ceph-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: ceph-secret
data:
  key: QVFDNnM2VmM4M2p3S0JBQXRja0U2eXozZVRNOWxXd0s2MFFOWXc9PQ==

[root@m01 cephfs]# kubectl create -f ceph-secret.yaml
secret/ceph-secret created

[root@m01 cephfs]# kubectl get secret ceph-secret
NAME          TYPE     DATA   AGE
ceph-secret   Opaque   1      23s
[root@m01 cephfs]# kubectl get secret ceph-secret -o yaml
apiVersion: v1
data:
  key: QVFDNnM2VmM4M2p3S0JBQXRja0U2eXozZVRNOWxXd0s2MFFOWXc9PQ==
kind: Secret
metadata:
  creationTimestamp: "2019-04-14T06:13:44Z"
  name: ceph-secret
  namespace: default
  resourceVersion: "873772"
  selfLink: /api/v1/namespaces/default/secrets/ceph-secret
  uid: 7515ad43-5e7c-11e9-ba95-001a4a160172
type: Opaque
[root@m01 cephfs]#
~~~   
Pod 에 cephfs Volume 을 연결합니다.   
~~~yaml   
[root@m01 cephfs]# cat cephfs-with-secret.yaml
apiVersion: v1
kind: Pod
metadata:
  name: cephfs-httpd
spec:
  containers:
  - name: cephfs-httpd
    image: httpd
    volumeMounts:
    - mountPath: /usr/local/apache2/htdocs
      name: cephfs
  volumes:
  - name: cephfs
    cephfs:
      monitors:
      - 192.168.13.6:6789
      - 192.168.13.7:6789
      - 192.168.13.8:6789
      user: admin
      path: /httpd-index
      secretRef:
        name: ceph-secret
      readOnly: false
~~~   
cephfs 의 /httpd-index 경로에는 index.html 이 존재합니다.   
Pod 을 생성합니다.   
~~~sh   
[root@m01 cephfs]# kubectl create -f cephfs-with-secret.yaml
pod/cephfs-httpd created
[root@m01 cephfs]# kubectl get po
NAME                              READY   STATUS    RESTARTS   AGE
cephfs-httpd                      1/1     Running   0          24s
load-generator-557649ddcd-jq987   1/1     Running   1          4d20h
php-apache-9bd5c887f-p6lrq        1/1     Running   0          4d20h
[root@m01 cephfs]#
 
[root@m01 cephfs]# kubectl describe po cephfs-httpd
Name:               cephfs-httpd
Namespace:          default
Priority:           0
PriorityClassName:  <none>
Node:               w03/192.168.13.16
Start Time:         Sun, 14 Apr 2019 15:16:48 +0900
Labels:             <none>
Annotations:        <none>
Status:             Running
IP:                 10.233.89.6
Containers:
  cephfs-httpd:
    Container ID:   docker://71e17fb3708a68448fdded4a20c81af63716a1146156dc5a5b4b8145a290f3dc
    Image:          httpd
    Image ID:       docker-pullable://httpd@sha256:b4096b744d92d1825a36b3ace61ef4caa2ba57d0307b985cace4621139c285f7
    Port:           <none>
    Host Port:      <none>
    State:          Running
      Started:      Sun, 14 Apr 2019 15:17:04 +0900
    Ready:          True
    Restart Count:  0
    Environment:    <none>
    Mounts:
      /usr/local/apache2/htdocs from cephfs (rw)
      /var/run/secrets/kubernetes.io/serviceaccount from default-token-9vmtn (ro)
Conditions:
  Type              Status
  Initialized       True
  Ready             True
  ContainersReady   True
  PodScheduled      True
Volumes:
  cephfs:
    Type:        CephFS (a CephFS mount on the host that shares a pods lifetime)
    Monitors:    [192.168.13.6:6789 192.168.13.7:6789 192.168.13.8:6789]
    Path:        /httpd-index
    User:        admin
    SecretFile:
    SecretRef:   &LocalObjectReference{Name:ceph-secret,}
    ReadOnly:    false
  default-token-9vmtn:
    Type:        Secret (a volume populated by a Secret)
    SecretName:  default-token-9vmtn
    Optional:    false
QoS Class:       BestEffort
Node-Selectors:  <none>
Tolerations:     node.kubernetes.io/not-ready:NoExecute for 300s
                 node.kubernetes.io/unreachable:NoExecute for 300s
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  36s   default-scheduler  Successfully assigned default/cephfs-httpd to w03
  Normal  Pulling    33s   kubelet, w03       pulling image "httpd"
  Normal  Pulled     21s   kubelet, w03       Successfully pulled image "httpd"
  Normal  Created    20s   kubelet, w03       Created container
  Normal  Started    20s   kubelet, w03       Started container
[root@m01 cephfs]#

# Pod 테스트
[root@m01 cephfs]# curl 10.233.89.6
cephfs Index - v1
[root@m01 cephfs]#
~~~
cephfs는 NFS 와 매우 유사합니다. 그로 인해 NFS와 동일하게 PV에 직접 접근해서 파일 내용을 수정하고, Volume Attach 내용을 확인 할 수 있습니다.   
~~~sh   
# Mount 확인 - Pod 이 작동중인 Worker 노드
[root@w03 ~]# mount | grep ceph
192.168.13.6:6789,192.168.13.7:6789,192.168.13.8:6789:/httpd-index on /var/lib/kubelet/pods/e2b5c688-5e7c-11e9-ba95-001a4a160172/volumes/kubernetes.io~cephfs/cephfs type ceph (rw,relatime,name=admin,secret=<hidden>,acl,wsize=16777216)
[root@w03 ~]#
[root@w03 ~]# cd /var/lib/kubelet/pods/e2b5c688-5e7c-11e9-ba95-001a4a160172/volumes/kubernetes.io~cephfs/cephfs
[root@w03 cephfs]# ls -la
합계 1
drwxr-xr-x 1 root root  1  4월 14 15:05 .
drwxr-x--- 3 root root 20  4월 14 15:16 ..
-rw-r--r-- 1 root root 18  4월 14 15:05 index.html
[root@w03 cephfs]# cat index.html
cephfs Index - v1
[root@w03 cephfs]#

# Cephfs 에 접근해서 직접 파일 수정
[root@kube-depoly httpd-index]# pwd
/cephfs/httpd-index
[root@kube-depoly httpd-index]# vi index.html
[root@kube-depoly httpd-index]# cat index.html
cephfs Index - v2
[root@kube-depoly httpd-index]#
 
[root@m01 cephfs]# curl 10.233.89.6
cephfs Index - v2
[root@m01 cephfs]#
~~~   
   
   지금까지 Static Provisioning 관련 해서 확인 해보았습니다.   
      
개발자가 PVC를 통해 시스템 관리자에게 PV를 요구하는 과정을 통해 PV를 할당 받고 사용이 가능한데 이 과정을 자동화를 하게 되면 Dynamic Provisioning 이라고 합니다.   

# **Dynamic Provisioning**
* * *
## **ceph rbd**
Dynamic Provisioning는 PVC를 통해 요청하는 PV대해 동적으로 생성을 해주는 제공 방식을 말합니다.   
개발자는 StorageClass 를 통해 필요한 Storage Type을 지정하여 동적으로 할당을 받을 수 있습니다.   
~~~sh   
# Secret 생성 - ceph Login을 위한 Key
[root@m01 ceph-rbd]# kubectl create -f ceph-admin-secret.yml
secret/ceph-admin-secret created
[root@m01 ceph-rbd]# kubectl create -f ceph-secret.yml
secret/ceph-secret created
~~~   
~~~yaml   
# StorageClass 생성
[root@m01 ceph-rbd]# cat class.yaml
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: rbd
provisioner: ceph.com/rbd
parameters:
  monitors: 192.168.13.6:6789,192.168.13.7:6789,192.168.13.8:6789
  pool: kube
  adminId: admin
  adminSecretNamespace: kube-system
  adminSecretName: ceph-admin-secret
  userId: kube
  userSecretNamespace: kube-system
  userSecretName: ceph-secret
  imageFormat: "2"
  imageFeatures: layering
[root@m01 ceph-rbd]# kubectl get sc
NAME   PROVISIONER    AGE
rbd    ceph.com/rbd   17h
[root@m01 ceph-rbd]#
~~~   
StorageClass yaml 파일을 보면 **provisioner: ceph.com/rbd** 항목이 있습니다.   
> 위와 같이 ceph rbd 를 제공해줄 provisioner 가 필요합니다.   
> provisioner 상세 배포 방식은 [ceph-rbd-depoly](https://github.com/kubernetes-incubator/external-storage/blob/master/ceph/rbd/deploy/README.md)
문서를 참조합니다.   
   

~~~sh
# Pod 
[root@m01 ceph-rbd]# kubectl get po -n kube-system | grep rbd
rbd-provisioner-67b4857bcd-7ctlz           1/1     Running   0          17h

# Pod 상세 내역
[root@m01 ceph-rbd]# kubectl describe po rbd-provisioner-67b4857bcd-7ctlz -n kube-system
Name:               rbd-provisioner-67b4857bcd-7ctlz
Namespace:          kube-system
Priority:           0
PriorityClassName:  <none>
Node:               w02/192.168.13.15
Start Time:         Sun, 14 Apr 2019 21:13:49 +0900
Labels:             app=rbd-provisioner
                    pod-template-hash=67b4857bcd
Annotations:        <none>
Status:             Running
IP:                 10.233.96.9
Controlled By:      ReplicaSet/rbd-provisioner-67b4857bcd
Containers:
  rbd-provisioner:
    Container ID:   docker://8f25dca0c870685dc0140294787124e288793243ed6120921d278c701b6c7039
    Image:          quay.io/external_storage/rbd-provisioner:latest
    Image ID:       docker-pullable://quay.io/external_storage/rbd-provisioner@sha256:94fd36b8625141b62ff1addfa914d45f7b39619e55891bad0294263ecd2ce09a
    Port:           <none>
    Host Port:      <none>
    State:          Running
      Started:      Sun, 14 Apr 2019 21:13:54 +0900
    Ready:          True
    Restart Count:  0
    Environment:
      PROVISIONER_NAME:  ceph.com/rbd
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from rbd-provisioner-token-79f4c (ro)
Conditions:
  Type              Status
  Initialized       True
  Ready             True
  ContainersReady   True
  PodScheduled      True
Volumes:
  rbd-provisioner-token-79f4c:
    Type:        Secret (a volume populated by a Secret)
    SecretName:  rbd-provisioner-token-79f4c
    Optional:    false
QoS Class:       BestEffort
Node-Selectors:  <none>
Tolerations:     node.kubernetes.io/not-ready:NoExecute for 300s
                 node.kubernetes.io/unreachable:NoExecute for 300s
Events:          <none>
~~~   
PVC 를 통해 rbd PV를 요청합니다.  
~~~yaml   
[root@m01 ceph-rbd]# cat claim.yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: rbd-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: rbd
  resources:
    requests:
      storage: 2Gi 
~~~   
~~~sh   
# PVC 생성
[root@m01 ceph-rbd]# kubectl create -f claim.yaml
persistentvolumeclaim/rbd-pvc created

# PVC 확인
[root@m01 ceph-rbd]# kubectl get pvc
NAME            STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
claim1          Bound    pvc-fe9d8199-5eae-11e9-ba95-001a4a160172   1Gi        RWO            rbd            17h
nginx-vol-pvc   Bound    nginx-pv                                   3Gi        RWX                           17h
rbd-pvc         Bound    pvc-5b571f95-5f43-11e9-ba95-001a4a160172   2Gi        RWO            rbd            3s

# PV 연결 확인
[root@m01 ceph-rbd]# kubectl get pv
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                   STORAGECLASS   REASON   AGE
nginx-pv                                   3Gi        RWX            Retain           Bound    default/nginx-vol-pvc                           17h
pvc-5b571f95-5f43-11e9-ba95-001a4a160172   2Gi        RWO            Delete           Bound    default/rbd-pvc         rbd                     5s
pvc-fe9d8199-5eae-11e9-ba95-001a4a160172   1Gi        RWO            Delete           Bound    default/claim1          rbd                     17h
[root@m01 ceph-rbd]#
~~~   
위와 같이 PVC 를 요청하자 바로 PV가 ceph rbd 형식으로 생성이 되고 Attach 된 것을 확인 할 수 있었습니다.   
~~~sh   
[root@m01 ceph-rbd]# kubectl logs -f rbd-provisioner-67b4857bcd-7ctlz -n kube-system
I0414 12:13:54.944458       1 main.go:85] Creating RBD provisioner ceph.com/rbd with identity: ceph.com/rbd
I0414 12:13:54.949989       1 leaderelection.go:185] attempting to acquire leader lease  kube-system/ceph.com-rbd...
I0414 12:13:55.001529       1 leaderelection.go:194] successfully acquired lease kube-system/ceph.com-rbd
I0414 12:13:55.001754       1 event.go:221] Event(v1.ObjectReference{Kind:"Endpoints", Namespace:"kube-system", Name:"ceph.com-rbd", UID:"c5bb0c91-5eae-11e9-b387-001a4a160174", APIVersion:"v1", ResourceVersion:"919145", FieldPath:""}): type: 'Normal' reason: 'LeaderElection' rbd-provisioner-67b4857bcd-7ctlz_c5ecdcd7-5eae-11e9-a9ca-6e9439dbce0f became leader
I0414 12:13:55.001901       1 controller.go:631] Starting provisioner controller ceph.com/rbd_rbd-provisioner-67b4857bcd-7ctlz_c5ecdcd7-5eae-11e9-a9ca-6e9439dbce0f!
I0414 12:13:55.102448       1 controller.go:680] Started provisioner controller ceph.com/rbd_rbd-provisioner-67b4857bcd-7ctlz_c5ecdcd7-5eae-11e9-a9ca-6e9439dbce0f!
I0414 12:15:33.439001       1 controller.go:987] provision "default/claim1" class "rbd": started
I0414 12:15:33.455112       1 event.go:221] Event(v1.ObjectReference{Kind:"PersistentVolumeClaim", Namespace:"default", Name:"claim1", UID:"fe9d8199-5eae-11e9-ba95-001a4a160172", APIVersion:"v1", ResourceVersion:"919428", FieldPath:""}): type: 'Normal' reason: 'Provisioning' External provisioner is provisioning volume for claim "default/claim1"
I0414 12:15:35.895596       1 provision.go:132] successfully created rbd image "kubernetes-dynamic-pvc-00ab7b91-5eaf-11e9-a9ca-6e9439dbce0f"
I0414 12:15:35.895798       1 controller.go:1087] provision "default/claim1" class "rbd": volume "pvc-fe9d8199-5eae-11e9-ba95-001a4a160172" provisioned
I0414 12:15:35.895924       1 controller.go:1101] provision "default/claim1" class "rbd": trying to save persistentvvolume "pvc-fe9d8199-5eae-11e9-ba95-001a4a160172"
I0414 12:15:35.934205       1 controller.go:1108] provision "default/claim1" class "rbd": persistentvolume "pvc-fe9d8199-5eae-11e9-ba95-001a4a160172" saved
I0414 12:15:35.934420       1 controller.go:1149] provision "default/claim1" class "rbd": succeeded
I0414 12:15:35.935026       1 event.go:221] Event(v1.ObjectReference{Kind:"PersistentVolumeClaim", Namespace:"default", Name:"claim1", UID:"fe9d8199-5eae-11e9-ba95-001a4a160172", APIVersion:"v1", ResourceVersion:"919428", FieldPath:""}): type: 'Normal' reason: 'ProvisioningSucceeded' Successfully provisioned volume pvc-fe9d8199-5eae-11e9-ba95-001a4a160172
I0415 05:57:32.016818       1 controller.go:987] provision "default/rbd-pvc" class "rbd": started
I0415 05:57:32.037901       1 event.go:221] Event(v1.ObjectReference{Kind:"PersistentVolumeClaim", Namespace:"default", Name:"rbd-pvc", UID:"5b571f95-5f43-11e9-ba95-001a4a160172", APIVersion:"v1", ResourceVersion:"1081791", FieldPath:""}): type: 'Normal' reason: 'Provisioning' External provisioner is provisioning volume for claim "default/rbd-pvc"
I0415 05:57:33.772819       1 provision.go:132] successfully created rbd image "kubernetes-dynamic-pvc-5be57bb6-5f43-11e9-a9ca-6e9439dbce0f"
I0415 05:57:33.773007       1 controller.go:1087] provision "default/rbd-pvc" class "rbd": volume "pvc-5b571f95-5f43-11e9-ba95-001a4a160172" provisioned
I0415 05:57:33.773112       1 controller.go:1101] provision "default/rbd-pvc" class "rbd": trying to save persistentvvolume "pvc-5b571f95-5f43-11e9-ba95-001a4a160172"
I0415 05:57:33.793499       1 controller.go:1108] provision "default/rbd-pvc" class "rbd": persistentvolume "pvc-5b571f95-5f43-11e9-ba95-001a4a160172" saved
I0415 05:57:33.793633       1 controller.go:1149] provision "default/rbd-pvc" class "rbd": succeeded
I0415 05:57:33.793801       1 controller.go:987] provision "default/rbd-pvc" class "rbd": started
I0415 05:57:33.794971       1 event.go:221] Event(v1.ObjectReference{Kind:"PersistentVolumeClaim", Namespace:"default", Name:"rbd-pvc", UID:"5b571f95-5f43-11e9-ba95-001a4a160172", APIVersion:"v1", ResourceVersion:"1081791", FieldPath:""}): type: 'Normal' reason: 'ProvisioningSucceeded' Successfully provisioned volume pvc-5b571f95-5f43-11e9-ba95-001a4a160172
I0415 05:57:33.826515       1 controller.go:996] provision "default/rbd-pvc" class "rbd": persistentvolume "pvc-5b571f95-5f43-11e9-ba95-001a4a160172" already exists, skipping
~~~  
- 참조: rbd-provisioner docker log   
   
Pod 에 PVC를 yaml 추가하여 Pod 생성 할때, PV를 요청하고 StorageClass 를 이용해서 동적으로 Volume을 할당 받았습니다.   
아래는 Pod 에 PVC를 추가한 yaml 구문 Template 입니다.   
~~~yaml   
[root@m01 ceph-rbd]# cat test-pod.yaml
kind: Pod
apiVersion: v1
metadata:
  name: test-pod
spec:
  containers:
  - name: test-pod
    image: gcr.io/google_containers/busybox:1.24
    command:
    - "/bin/sh"
    args:
    - "-c"
    - "touch /mnt/SUCCESS && exit 0 || exit 1"
    volumeMounts:
    - name: pvc
      mountPath: "/mnt"
  restartPolicy: "Never"
  volumes:
  - name: pvc
    persistentVolumeClaim:
      claimName: claim1
~~~   
   
지금까지 포스팅에서 소개된 Volume 은 Kubernetes 에서 제공되는 일부 입니다.   
다양한 Volume 을 제공하고 있으며, 상세 내용은 첨부된 문서 참고하시고 운영하시는 환경에 맞게 사용하면 됩니다.   
감사합니다.   
   
# 참고 문서
* * *   
**- ceph rbd 관련**   
  * [RBD Volume Provisioner for Kubernetes 1.5+](https://github.com/kubernetes-incubator/external-storage/tree/master/ceph/rbd)
  * [RBD Volume Provisioner On Kubernetes Depolyment](https://github.com/kubernetes-incubator/external-storage/blob/master/ceph/rbd/deploy/README.md)
  * [Example Ceph rbd](https://docs.openshift.com/container-platform/3.5/install_config/storage_examples/ceph_example.html)
     
**- Kubernetes 문서**   
  * [PV 관련](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)
  * [Types of Volumes](https://kubernetes.io/docs/concepts/storage/volumes/#types-of-volumes)
  * [PV Access Mode 관련](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes)
  * [PV Reclaim Policy](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#reclaim-policy)
  * [Example PVC](https://kubernetes.io/docs/tasks/configure-pod-container/configure-persistent-volume-storage/)

**- Example yaml**    
  * [chhanz Github](https://github.com/chhanz/k8s-study-example)
   
