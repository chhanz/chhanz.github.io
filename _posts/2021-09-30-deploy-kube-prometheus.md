---
layout: post
title: "[Kubernetes] kube-prometheus 배포 (use storageclass)"
description: ""
author: chhanz
date: 2021-09-30
tags: [kubernetes]
category: kubernetes
---

# kube-prometheus 배포
Kubernetes cluster 를 모니터링 하기 위해 Prometheus 를 구성하고 사용하려고 한다.   
Prometheus 에는 다양한 배포 방법이 있으나 이번 글에선 `kube-prometheus` 를 이용하여 Kubernetes Cluster 에 배포 해보도록 한다.   
   
# Kubernetes Cluster 정보
사용된 Kubernetes Cluster 환경은 아래와 같습니다.   
```bash
root@node1:~# kubectl get nodes -o wide
NAME    STATUS   ROLES                  AGE   VERSION   INTERNAL-IP       EXTERNAL-IP   OS-IMAGE             KERNEL-VERSION     CONTAINER-RUNTIME
node1   Ready    control-plane,master   41d   v1.20.7   192.168.200.26    <none>        Ubuntu 20.04.2 LTS   5.4.0-80-generic   cri-o://1.20.3
node2   Ready    control-plane,master   41d   v1.20.7   192.168.200.81    <none>        Ubuntu 20.04.2 LTS   5.4.0-80-generic   cri-o://1.20.3
node3   Ready    control-plane,master   41d   v1.20.7   192.168.200.145   <none>        Ubuntu 20.04.2 LTS   5.4.0-80-generic   cri-o://1.20.3
node4   Ready    <none>                 41d   v1.20.7   192.168.200.108   <none>        Ubuntu 20.04.2 LTS   5.4.0-80-generic   cri-o://1.20.3
node5   Ready    <none>                 41d   v1.20.7   192.168.200.61    <none>        Ubuntu 20.04.2 LTS   5.4.0-80-generic   cri-o://1.20.3
node6   Ready    <none>                 13d   v1.20.7   192.168.200.116   <none>        Ubuntu 20.04.2 LTS   5.4.0-80-generic   cri-o://1.20.5
```
   
Persistent Volume 는 StorageClass 를 이용하고 `ceph-csi` 를 이용하여 `rbd` 를 제공 받습니다.   
```bash
root@node1:~# kubectl get sc
NAME         PROVISIONER        RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
csi-rbd-sc   rbd.csi.ceph.com   Delete          Immediate           true                   13d
```
   
# clone
`kuber-prometheus` source 를 clone 합니다.   
```bash
root@node1:~/imsi# git clone https://github.com/prometheus-operator/kube-prometheus.git
Cloning into 'kube-prometheus'...
remote: Enumerating objects: 13531, done.
remote: Counting objects: 100% (2030/2030), done.
remote: Compressing objects: 100% (864/864), done.
remote: Total 13531 (delta 1270), reused 1603 (delta 993), pack-reused 11501
Receiving objects: 100% (13531/13531), 6.68 MiB | 12.56 MiB/s, done.
Resolving deltas: 100% (8399/8399), done.
```
   
Kubernetes Version 에 맞는 release version 을 선택합니다.   
[Kubernetes compatibility matrix](https://github.com/prometheus-operator/kube-prometheus#kubernetes-compatibility-matrix) 는 해당 [문서](https://github.com/prometheus-operator/kube-prometheus#kubernetes-compatibility-matrix)를 참고 합니다.   
```bash
root@node1:~/imsi# cd kube-prometheus/
root@node1:~/imsi/kube-prometheus# git checkout release-0.8
Branch 'release-0.8' set up to track remote branch 'release-0.8' from 'origin'.
Switched to a new branch 'release-0.8'
```
   
## source 수정
`Prometheus-operator` 는 [Kubernetes CRD](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/) 를 사용하여 관리, 배포 됩니다.      
Persistent Volume 사용을 위해 `prometheus` 와 `alertmanager` 는 아래와 같이 CRD spec 에 맞게 수정합니다.   
   
### `prometheus-prometheus.yaml` 수정
```diff
root@node1:~/imsi/kube-prometheus/manifests# git diff prometheus-prometheus.yaml
diff --git a/manifests/prometheus-prometheus.yaml b/manifests/prometheus-prometheus.yaml
index e45a86f..69cb53a 100644
--- a/manifests/prometheus-prometheus.yaml
+++ b/manifests/prometheus-prometheus.yaml
@@ -46,3 +46,10 @@ spec:
   serviceMonitorNamespaceSelector: {}
   serviceMonitorSelector: {}
   version: 2.26.0
+  storage:
+    volumeClaimTemplate:
+      spec:
+        storageClassName: csi-rbd-sc
+        resources:
+          requests:
+            storage: 50Gi
```

### `alertmanager-alertmanager.yaml` 수정   
```diff
root@node1:~/imsi/kube-prometheus/manifests# git diff alertmanager-alertmanager.yaml
diff --git a/manifests/alertmanager-alertmanager.yaml b/manifests/alertmanager-alertmanager.yaml
index f4c02a7..008e0df 100644
--- a/manifests/alertmanager-alertmanager.yaml
+++ b/manifests/alertmanager-alertmanager.yaml
@@ -33,3 +33,10 @@ spec:
     runAsUser: 1000
   serviceAccountName: alertmanager-main
   version: 0.21.0
+  storage:
+    volumeClaimTemplate:
+      spec:
+        storageClassName: csi-rbd-sc
+        resources:
+          requests:
+            storage: 10Gi
```
   
위와 같이 StorageClass 는 `csi-rbd-sc` 를 사용하고 CRD spec 에 맞게 `volumeClaimTemplate` 작성합니다.   
   
### `grafana-pvc.yaml` 작성   
grafana 의 경우, CRD 로 관리가 안되므로 grafana 의 pvc 생성을 합니다.   
```yaml
root@node1:~/imsi/kube-prometheus/manifests# cat grafana-pvc.yaml 
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: grafana-storage-pvc
  namespace: monitoring
spec:
  storageClassName: csi-rbd-sc
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 50Gi
```
   
### `grafana-deployment.yaml` 수정   
grafana 에서 pvc 를 사용하도록 아래와 같이 수정합니다.   
```diff
root@node1:~/imsi/kube-prometheus/manifests# git diff grafana-deployment.yaml
diff --git a/manifests/grafana-deployment.yaml b/manifests/grafana-deployment.yaml
index c69b637..446a486 100644
--- a/manifests/grafana-deployment.yaml
+++ b/manifests/grafana-deployment.yaml
@@ -130,8 +130,9 @@ spec:
         runAsUser: 65534
       serviceAccountName: grafana
       volumes:
-      - emptyDir: {}
-        name: grafana-storage
+      - name: grafana-storage
+        persistentVolumeClaim:
+          claimName: grafana-storage-pvc
```

# deploy
아래와 같이 `kube-prometheus` 를 배포합니다.   
```bash
root@node1:~/imsi/kube-prometheus# kubectl create -f ./manifests/setup/
namespace/monitoring created
customresourcedefinition.apiextensions.k8s.io/alertmanagerconfigs.monitoring.coreos.com created
customresourcedefinition.apiextensions.k8s.io/alertmanagers.monitoring.coreos.com created
customresourcedefinition.apiextensions.k8s.io/podmonitors.monitoring.coreos.com created
customresourcedefinition.apiextensions.k8s.io/probes.monitoring.coreos.com created
customresourcedefinition.apiextensions.k8s.io/prometheuses.monitoring.coreos.com created
customresourcedefinition.apiextensions.k8s.io/prometheusrules.monitoring.coreos.com created
customresourcedefinition.apiextensions.k8s.io/servicemonitors.monitoring.coreos.com created
customresourcedefinition.apiextensions.k8s.io/thanosrulers.monitoring.coreos.com created
clusterrole.rbac.authorization.k8s.io/prometheus-operator created
clusterrolebinding.rbac.authorization.k8s.io/prometheus-operator created
deployment.apps/prometheus-operator created
service/prometheus-operator created
serviceaccount/prometheus-operator created
```
   
```bash
root@node1:~/imsi/kube-prometheus# kubectl get all -n monitoring 
NAME                                       READY   STATUS    RESTARTS   AGE
pod/prometheus-operator-7775c66ccf-4ckkh   2/2     Running   0          18s
...
```
`prometheus-operator` resource 가 시작되면 다음 resource 를 배포합니다.   
   
```bash
root@node1:~/imsi/kube-prometheus# kubectl create -f ./manifests/
...
```
   
# check
아래와 같이 CRD 를 통해 상태를 확인합니다.   
```bash
root@node1:~/imsi/kube-prometheus# kubectl get prometheus -n monitoring 
NAME   VERSION   REPLICAS   AGE
k8s    2.26.0    2          23s

root@node1:~/imsi/kube-prometheus# kubectl get alertmanager -n monitoring
NAME   VERSION   REPLICAS   AGE
main   0.21.0    3          41s
```
   
```bash
root@node1:~/imsi/kube-prometheus/manifests# kubectl get all -n monitoring 
NAME                                       READY   STATUS    RESTARTS   AGE
pod/alertmanager-main-0                    2/2     Running   0          3m21s
pod/alertmanager-main-1                    2/2     Running   0          2m41s
pod/alertmanager-main-2                    2/2     Running   0          9m32s
pod/blackbox-exporter-55c457d5fb-2ddng     3/3     Running   0          9m32s
pod/grafana-795d45f967-89jmb               1/1     Running   0          9m29s
pod/kube-state-metrics-76f6cb7996-69x45    3/3     Running   0          9m29s
pod/node-exporter-clwhk                    2/2     Running   0          9m27s
pod/node-exporter-kslcr                    2/2     Running   0          9m28s
pod/node-exporter-mmrm6                    2/2     Running   0          9m27s
pod/node-exporter-rxn79                    2/2     Running   0          9m27s
pod/node-exporter-shxrk                    2/2     Running   0          9m27s
pod/node-exporter-x5vjm                    2/2     Running   0          9m27s
pod/prometheus-adapter-59df95d9f5-7tlcr    1/1     Running   0          9m26s
pod/prometheus-adapter-59df95d9f5-nghzv    1/1     Running   0          9m26s
pod/prometheus-k8s-0                       2/2     Running   1          9m22s
pod/prometheus-k8s-1                       2/2     Running   1          9m22s
pod/prometheus-operator-7775c66ccf-4ckkh   2/2     Running   0          10m
...
```
   
pod 가 run 되면 `kube-prometheus` 가 배포 완료 되었습니다.   
   
# expose
grafana 접근을 위해 grafana service 를 수정합니다.   
```bash
root@node1:~/imsi/kube-prometheus/manifests# kubectl get service -n monitoring grafana
NAME          TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)                      AGE
grafana       ClusterIP   10.233.1.30     <none>        3000/TCP                     9m31s

root@node1:~/imsi/kube-prometheus/manifests# kubectl edit service/grafana -n monitoring
service/grafana edited

root@node1:~/imsi/kube-prometheus/manifests# kubectl get service -n monitoring grafana 
NAME      TYPE       CLUSTER-IP    EXTERNAL-IP   PORT(S)          AGE
grafana   NodePort   10.233.1.30   <none>        3000:30020/TCP   11m
```
   
# WEB GUI
   <center><img src="/assets/images/post/2021-09-30-kube-prometheus/1.png" style="max-width: 95%; height: auto;"></center>   
노출된 NodePort `30020` 을 통해 위와 같이 `grafana` 에 접근 할 수 있습니다.   
초기 계정 및 패스워드는 `admin` / `admin` 입니다.   
(접속 후엔 해당 계정 패스워드 변경을 진행하도록 나옵니다.)   
   
<center><img src="/assets/images/post/2021-09-30-kube-prometheus/2.png" style="max-width: 95%; height: auto;"></center>   
위와 같이 `kube-prometheus` 는 kubernetes cluster 를 모니터링하기 위한 dashboard 가 사전에 설정이 되어 있습니다.   
해당 dashboard 를 이용하면 kubernetes cluster 를 손쉽게 모니터링 할 수 있습니다.   
   
또한 기존 `grafana` 와 같이 dashboard 를 생성하고 Import 도 가능합니다.   
   

# 참고 문서
* [https://github.com/prometheus-operator/kube-prometheus#kubernetes-compatibility-matrix](https://github.com/prometheus-operator/kube-prometheus#kubernetes-compatibility-matrix)   
* [https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/)   