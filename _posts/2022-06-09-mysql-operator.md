---
layout: post
title: "[Kubernetes] MySQL Operator"
description: ""
author: chhanz
date: 2022-06-09
tags: [kubernetes]
category: kubernetes
---

# MySQL Operator
<center><img src="https://dev.mysql.com/doc/mysql-operator/en/images/mysql-operator-architecture.png" style="max-width: 95%; height: auto;"></center>    
   
MySQL Operator 는 MySQL 서버 및 MySQL 라우터 그룹으로 구성된 하나 이상의 MySQL InnoDB 클러스터 관리에 중점을 둔 Operator 입니다.   
MySQL Operator 자체는 Kubernetes 클러스터에서 실행되며 MySQL Operator 를 통해 계속 사용 가능하고 실행 중인지 확인하는 역할을 합니다.   
   
# Operator 배포
Helm 을 이용하여 MySQL Operator 를 배포 하겠습니다.   
   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# helm repo add mysql-operator https://mysql.github.io/mysql-operator/
"mysql-operator" has been added to your repositories
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# helm repo update
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "mysql-operator" chart repository
...Successfully got an update from the "nfs-subdir-external-provisioner" chart repository
Update Complete. ⎈Happy Helming!⎈
```
Helm Repo 를 추가합니다.    

```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# helm install mysql-operator mysql-operator/mysql-operator --namespace mysql-operator --create-namespace --version 2.0.4
NAME: mysql-operator
LAST DEPLOYED: Thu Jun  9 14:27:17 2022
NAMESPACE: mysql-operator
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
Create an InnoDB Cluster by executing:
1. When using a source distribution / git clone: `helm install [cluster-name] -n [ns-name] ~/helm/mysql-innodbcluster`
2. When using Helm repos :  `helm install [cluster-name] -n [ns-name] mysql-innodbcluster`
```
위와 같이 Operator 를 배포합니다.   
   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~/mysql# k get pod -n mysql-operator
NAME                              READY   STATUS    RESTARTS   AGE
mysql-operator-659ff68ccf-qz9zk   1/1     Running   0          1m
```
위와 같이 Operator 가 배포가 되었고, 이 Operator 를 이용하여 MySQL Cluster 를 생성 할 수 있습니다.   
   
# MySQL InnoDB Cluster 생성
MySQL InnoDB Cluster 는 MySQL 의 High Availability 를 유지하기 위한 솔루션입니다.   
   
Cluster 를 생성하기전에 기본 설정값을 수정하기 위해 Operator 에서 Default Values 를 추출합니다.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~/mysql# helm show values mysql-operator/mysql-innodbcluster > values.yml
```
   
DB 접근 `Password` 수정 및 `tls.UseSelfSigned` 를 활성화 합니다.   
`tls.UseSelfSigned` 는 자체 서명된 TLS 인증서를 사용하도록 설정하는 옵션입니다.   
(참고: [`https://dev.mysql.com/doc/mysql-operator/en/mysql-operator-properties.html`](https://dev.mysql.com/doc/mysql-operator/en/mysql-operator-properties.html))    
```diff
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~/mysql# git diff origin.yml values.yml
diff --git a/origin.yml b/values.yml
index a1173c6..608071c 100644
--- a/origin.yml
+++ b/values.yml
@@ -8,11 +8,11 @@ image:
 credentials:
   root:
     user: root
-#    password: sakila
+    password: testtest
     host: "%"
 
 tls:
-  useSelfSigned: false
+  useSelfSigned: true
 #  caSecretName:
 #  serverCertAndPKsecretName:
 #  routerCertAndPKsecretName:
```
   
수정한 `values.yml` 을 이용하여 아래와 같이 MySQL Cluster 를 생성합니다.   
```bash
$ helm install mycluster mysql-operator/mysql-innodbcluster --namespace mysql-cluster --create-namespace --version 2.0.4 --values values.yml
NAME: mycluster
LAST DEPLOYED: Thu Jun  9 14:40:43 2022
NAMESPACE: mysql-cluster
STATUS: deployed
REVISION: 1
TEST SUITE: None
```
   
생성된 Cluster 는 아래와 같이 확인이 가능합니다.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~/mysql# kubectl get innodbcluster -A
NAMESPACE       NAME        STATUS   ONLINE   INSTANCES   ROUTERS   AGE
mysql-cluster   mycluster   ONLINE   3        3           1         4m12s
 
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~/mysql# k get pod -n mysql-cluster
NAME                                READY   STATUS    RESTARTS   AGE
mycluster-0                         2/2     Running   0          4m27s
mycluster-1                         2/2     Running   0          4m27s
mycluster-2                         2/2     Running   0          4m27s
mycluster-router-5f9758dc8f-rv9w8   1/1     Running   0          2m32s
```
   
# MySQL InnoDB Cluster 구성 확인
기본적으로 아래와 같이 Statefulset 으로 Pod 가 실행됩니다.   
<center><img src="/assets/images/post/2022-06-09-mysql-operator/1.png" style="max-width: 95%; height: auto;"></center>    
   
Pod 내부에는 `initContainer` 와 `Container` 로 아래와 같이 실행됩니다.   
<center><img src="/assets/images/post/2022-06-09-mysql-operator/2.png" style="max-width: 95%; height: auto;"></center>    
   
여기서 `mysql` Container 는 MySQL 서버 자체를 구동하는 Container 이고, `Sidecar` Container 는 Operator 와 협력하여 Cluster Node 를 관리하는 역할을 하는 Container 입니다.   
([`https://dev.mysql.com/doc/mysql-operator/en/mysql-operator-introduction.html`](https://dev.mysql.com/doc/mysql-operator/en/mysql-operator-introduction.html))   
   
각각의 Pod 는 PVC 를 통해 PV 를 제공 받고 DB 데이터를 저장합니다.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~/mysql# k get pvc -n mysql-cluster
NAME                  STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
datadir-mycluster-0   Bound    pvc-809cb6ea-8533-46af-8b49-e45c34bf766d   2Gi        RWO            local-path     46m
datadir-mycluster-1   Bound    pvc-3ae1160d-4d61-4383-aa57-aeb994baf53e   2Gi        RWO            local-path     46m
datadir-mycluster-2   Bound    pvc-5063684b-cb50-43a9-ae1f-e56cb2467097   2Gi        RWO            local-path     46m
```
   
# Cluster DB 접근
아래와 같이 Operator 혹은 Cluster Pod 의 `mysqlsh` 을 통해 DB 접근이 가능합니다.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~/mysql# k exec -ti -n mysql-operator mysql-operator-659ff68ccf-qz9zk -- /bin/bash
bash-4.4$ mysqlsh mysqlx://root@mycluster.mysql-cluster.svc.cluster.local --password=testtest
Cannot set LC_ALL to locale en_US.UTF-8: No such file or directory
MySQL Shell 8.0.29
 
Copyright (c) 2016, 2022, Oracle and/or its affiliates.
Oracle is a registered trademark of Oracle Corporation and/or its affiliates.
Other names may be trademarks of their respective owners.
 
Type '\help' or '\?' for help; '\quit' to exit.
WARNING: Using a password on the command line interface can be insecure.
Creating an X protocol session to 'root@mycluster.mysql-cluster.svc.cluster.local'
Fetching schema names for autocompletion... Press ^C to stop.
Your MySQL connection id is 8000 (X protocol)
Server version: 8.0.29 MySQL Community Server - GPL
No default schema selected; type \use <schema> to set one.
 MySQL  mycluster.mysql-cluster.svc.cluster.local:33060+ ssl  JS >
```
   
처음 Shell 로 접근하면 `JS` JavaScript mode 로 작동하며, `\sql` 명령을 통해 SQL mode 로 변경 할 수 있습니다.   
   
```bash
MySQL  mycluster.mysql-cluster.svc.cluster.local:33060+ ssl  JS > \sql
Switching to SQL mode... Commands end with ;
 MySQL  mycluster.mysql-cluster.svc.cluster.local:33060+ ssl  SQL >  show databases;
+-------------------------------+
| Database                      |
+-------------------------------+
| information_schema            |
| mysql                         |
| mysql_innodb_cluster_metadata |
| performance_schema            |
| sys                           |
+-------------------------------+
5 rows in set (0.0014 sec)
```
   
현재 Headless Service 로 DB 를 접근하였는데 어떤 Pod 로 접근 했는지 Hostname 을 확인하여 확인해봅시다.   
```bash
 MySQL  mycluster.mysql-cluster.svc.cluster.local:33060+ ssl  SQL > select @@hostname;
+-------------+
| @@hostname  |
+-------------+
| mycluster-0 |
+-------------+
1 row in set (0.0014 sec)
```
`mycluster-0` (`chhan-k8s-3` node) 에서 기동중입니다.   
   
MySQL Cluster 의 Member 구성 및 Member Role 은 아래와 같이 확인이 가능합니다.   
```bash
MySQL  mycluster.mysql-cluster.svc.cluster.local:33060+ ssl  SQL > SELECT MEMBER_HOST, MEMBER_ROLE FROM performance_schema.replication_group_members;
+-----------------------------------------------------------------+-------------+
| MEMBER_HOST                                                     | MEMBER_ROLE |
+-----------------------------------------------------------------+-------------+
| mycluster-0.mycluster-instances.mysql-cluster.svc.cluster.local | PRIMARY     |
| mycluster-1.mycluster-instances.mysql-cluster.svc.cluster.local | SECONDARY   |
| mycluster-2.mycluster-instances.mysql-cluster.svc.cluster.local | SECONDARY   |
+-----------------------------------------------------------------+-------------+
3 rows in set (0.0011 sec)

MySQL  mycluster.mysql-cluster.svc.cluster.local:33060+ ssl  SQL > SELECT MEMBER_ID,MEMBER_STATE FROM performance_schema.replication_group_members;
+--------------------------------------+--------------+
| MEMBER_ID                            | MEMBER_STATE |
+--------------------------------------+--------------+
| c51b915c-e7b6-11ec-90cd-568d842354d2 | ONLINE       |
| cfe0387a-e7b6-11ec-914d-329a1132d044 | ONLINE       |
| cff531ee-e7b6-11ec-8f97-22bfd5ed1e67 | ONLINE       |
+--------------------------------------+--------------+
3 rows in set (0.0015 sec)
```
   
# Cluster Takeover scenario
Kubernetes Cluster node 의 장애가 발생할 때, MySQL Cluster 는 정상적으로 고가용성(High Availability)을 유지하는지 확인해보겠습니다.   
   
먼저 장애가 발생할 Node 는 Primary role 로 작동중인 `mycluster-0` 입니다.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~/mysql# k get pod -o wide -n mysql-cluster
NAME                                READY   STATUS    RESTARTS   AGE   IP              NODE          NOMINATED NODE   READINESS GATES
mycluster-0                         2/2     Running   0          69m   172.16.234.39   chhan-k8s-3   <none>           2/2
...
```
    
`chhan-k8s-3` node 에서 동작중이며, Statefulset 특성을 이용하여 해당 노드를 Scaheduling 을 Disalbe 하고 Pod 를 강제로 삭제하여 장애 상황과 유사한 상태로 만듭니다.    
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~/mysql# k drain chhan-k8s-3
node/chhan-k8s-3 cordoned
error: unable to drain node "chhan-k8s-3" due to error:[cannot delete DaemonSet-managed Pods (use --ignore-daemonsets to ignore): kube-system/calico-node-mp8l4, kube-system/kube-proxy-rnj8c, cannot delete Pods with local storage (use --delete-emptydir-data to override): mysql-cluster/mycluster-0, mysql-operator/mysql-operator-659ff68ccf-qz9zk], continuing command...
There are pending nodes to be drained:
 chhan-k8s-3
cannot delete DaemonSet-managed Pods (use --ignore-daemonsets to ignore): kube-system/calico-node-mp8l4, kube-system/kube-proxy-rnj8c
cannot delete Pods with local storage (use --delete-emptydir-data to override): mysql-cluster/mycluster-0, mysql-operator/mysql-operator-659ff68ccf-qz9zk
```
Node Drain 진행   
   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~/mysql# k get node
NAME          STATUS                     ROLES                  AGE   VERSION
chhan-k8s-1   Ready                      control-plane,master   15d   v1.23.6
chhan-k8s-2   Ready                      <none>                 15d   v1.23.6
chhan-k8s-3   Ready,SchedulingDisabled   <none>                 15d   v1.23.6     <<<
chhan-k8s-4   Ready                      <none>                 15d   v1.23.6

(☁ |DOIK-Lab:default) root@chhan-k8s-1:~/mysql# k delete pod -n mysql-cluster mycluster-0
pod "mycluster-0" deleted
```
Node 상태 확인 및 Pod 삭제   
   
Pod 가 삭제되면서 기존에 Headless Service 를 통해 `mycluster-0` 으로 SQL 접근이 disconnected 되면서 reconnected 가 되었습니다.   
```bash
MySQL  mycluster.mysql-cluster.svc.cluster.local:33060+ ssl  SQL > SELECT MEMBER_ID,MEMBER_STATE FROM performance_schema.replication_group_members;
ERROR: 2006: MySQL server has gone away
The global session got disconnected..
Attempting to reconnect to 'mysqlx://root@mycluster.mysql-cluster.svc.cluster.local:33060'..
The global session was successfully reconnected.
```
   
Cluster Member 를 확인해보니,   
```bash
 MySQL  mycluster.mysql-cluster.svc.cluster.local:33060+ ssl  SQL > SELECT MEMBER_ID,MEMBER_STATE FROM performance_schema.replication_group_members;
+--------------------------------------+--------------+
| MEMBER_ID                            | MEMBER_STATE |
+--------------------------------------+--------------+
| cfe0387a-e7b6-11ec-914d-329a1132d044 | ONLINE       |
| cff531ee-e7b6-11ec-8f97-22bfd5ed1e67 | ONLINE       |
+--------------------------------------+--------------+
2 rows in set (0.0014 sec)
 
 MySQL  mycluster.mysql-cluster.svc.cluster.local:33060+ ssl  SQL > SELECT MEMBER_HOST, MEMBER_ROLE FROM performance_schema.replication_group_members;
+-----------------------------------------------------------------+-------------+
| MEMBER_HOST                                                     | MEMBER_ROLE |
+-----------------------------------------------------------------+-------------+
| mycluster-1.mycluster-instances.mysql-cluster.svc.cluster.local | PRIMARY     |
| mycluster-2.mycluster-instances.mysql-cluster.svc.cluster.local | SECONDARY   |
+-----------------------------------------------------------------+-------------+
2 rows in set (0.0022 sec)
```
위와 같이 `mycluster-0` 이 Member 에서 사라지고 Primary 는 `mycluster-1` 로 변경 되었습니다.   
   
복구 시나리오는 아래와 같습니다.   
```bash
"Enable Scheduling"
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~/mysql# k uncordon chhan-k8s-3
node/chhan-k8s-3 uncordoned
 
"Check node"
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~/mysql# k get nodes
NAME          STATUS   ROLES                  AGE   VERSION
chhan-k8s-1   Ready    control-plane,master   15d   v1.23.6
chhan-k8s-2   Ready    <none>                 15d   v1.23.6
chhan-k8s-3   Ready    <none>                 15d   v1.23.6
chhan-k8s-4   Ready    <none>                 15d   v1.23.6
 
"Recover Pod"
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~/mysql# k get pod -o wide -n mysql-cluster
NAME                                READY   STATUS    RESTARTS   AGE     IP              NODE          NOMINATED NODE   READINESS GATES
mycluster-0                         2/2     Running   0          3m13s   172.16.234.42   chhan-k8s-3   <none>           2/2
mycluster-1                         2/2     Running   0          76m     172.16.110.26   chhan-k8s-2   <none>           2/2
mycluster-2                         2/2     Running   0          76m     172.16.107.22   chhan-k8s-4   <none>           2/2
mycluster-router-5f9758dc8f-rv9w8   1/1     Running   0          75m     172.16.110.28   chhan-k8s-2   <none>           <none>
```
   
위와 같이 다시 `mycluster-0` 가 정상 실행이 되고,   
```bash
MySQL  mycluster.mysql-cluster.svc.cluster.local:33060+ ssl  SQL > SELECT MEMBER_HOST, MEMBER_ROLE FROM performance_schema.replication_group_members;
+-----------------------------------------------------------------+-------------+
| MEMBER_HOST                                                     | MEMBER_ROLE |
+-----------------------------------------------------------------+-------------+
| mycluster-0.mycluster-instances.mysql-cluster.svc.cluster.local | SECONDARY   |
| mycluster-1.mycluster-instances.mysql-cluster.svc.cluster.local | PRIMARY     |
| mycluster-2.mycluster-instances.mysql-cluster.svc.cluster.local | SECONDARY   |
+-----------------------------------------------------------------+-------------+
3 rows in set (0.0009 sec)

MySQL  mycluster.mysql-cluster.svc.cluster.local:33060+ ssl  SQL > SELECT MEMBER_ID,MEMBER_STATE FROM performance_schema.replication_group_members;
+--------------------------------------+--------------+
| MEMBER_ID                            | MEMBER_STATE |
+--------------------------------------+--------------+
| c51b915c-e7b6-11ec-90cd-568d842354d2 | ONLINE       |
| cfe0387a-e7b6-11ec-914d-329a1132d044 | ONLINE       |
| cff531ee-e7b6-11ec-8f97-22bfd5ed1e67 | ONLINE       |
+--------------------------------------+--------------+
3 rows in set (0.0011 sec)
```
Member 에 추가가 되었지만 Primary 는 서비스 유지의 안정성을 위해 Rollback 이 되지 않았습니다.   
   
# Operator 를 이용한 MySQL 설정 변경 
Operator 가 정상적으로 Config 를 Monitoring 하고 Change 에 대해 반영을 하는지 확인해보겠습니다.   
***하지만 결론적으로 모든 것이 완벽하게 작동하지는 않았습니다.***    
   
개인적으론 SQL 문을 통한 설정 및 안정성을 위해 미구현되었거나, 차후 구현 예정일 것이라 생각됩니다.   
그래도 MySQL Cluster 구동 절차의 이해를 돕기위해 아래와 같이 테스트 해보았습니다.   
   
## 테스트
테스트 설정은 `max_connections` DB 속성값입니다.   
현재는 아래와 같이 `151` 로 설정 되어 있습니다.   
```bash
MySQL  mycluster.mysql-cluster.svc.cluster.local:33060+ ssl  SQL > SHOW VARIABLES LIKE "max_connections";
+-----------------+-------+
| Variable_name   | Value |
+-----------------+-------+
| max_connections | 151   |
+-----------------+-------+
1 row in set (0.0037 sec)
```
   
현재 MySQL 설정은 Configmap 에 저장되고 Operator 가 Cluster 를 기동할 때 사용합니다.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~/mysql# k get -n mysql-cluster cm mycluster-initconf
NAME                 DATA   AGE
mycluster-initconf   8      84m
```
위 Configmap 을 수정합니다.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~/mysql# k edit -n mysql-cluster cm mycluster-initconf
...
  my.cnf.in: |
    # Server identity related options (not shared across instances).
    # Do not edit.
    [mysqld]
    server_id=@@SERVER_ID@@
    report_host=@@HOSTNAME@@
    datadir=/var/lib/mysql
    loose_mysqlx_socket=/var/run/mysqld/mysqlx.sock
    socket=/var/run/mysqld/mysql.sock
    local-infile=1
    max_connections=250     <<
...
```
Pod 내의 `/etc/my.cnf` 에 설정값이 반영되어 들어가도록 해당 값을 입력합니다.   
   
이후 설정값을 적용하기 위해 강제로 Pod 를 삭제하여 재시작 합니다.
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~/mysql# k delete pod -n mysql-cluster mycluster-0
pod "mycluster-0" deleted
```
Pod 가 삭제되고 Statefulset 에 의해 자동으로 재생성이 되면서 InitContainer 인 `initconf` 가 Configmap 기준으로 MySQL 설정 파일을 새로 작성합니다.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~/mysql# k logs -n mysql-cluster  mycluster-0 initconf
.... 생략
2022-06-09T07:10:49 - [INFO] [initmysql] Configuring mysql pod mysql-cluster/mycluster-0, datadir=/var/lib/mysql
.... 생략
/mnt/initconf:
total 0
lrwxrwxrwx 1 root mysql 19 Jun  9 07:10 00-basic.cnf -> ..data/00-basic.cnf
lrwxrwxrwx 1 root mysql 31 Jun  9 07:10 01-group_replication.cnf -> ..data/01-group_replication.cnf
lrwxrwxrwx 1 root mysql 17 Jun  9 07:10 02-ssl.cnf -> ..data/02-ssl.cnf
lrwxrwxrwx 1 root mysql 19 Jun  9 07:10 99-extra.cnf -> ..data/99-extra.cnf
lrwxrwxrwx 1 root mysql 27 Jun  9 07:10 initdb-localroot.sql -> ..data/initdb-localroot.sql
lrwxrwxrwx 1 root mysql 23 Jun  9 07:10 livenessprobe.sh -> ..data/livenessprobe.sh
lrwxrwxrwx 1 root mysql 16 Jun  9 07:10 my.cnf.in -> ..data/my.cnf.in
lrwxrwxrwx 1 root mysql 24 Jun  9 07:10 readinessprobe.sh -> ..data/readinessprobe.sh
.... 생략
```
   
위와 같은 과정을 통해 반영이 완료가 되면 아래와 같이 설정 적용이 된 것을 확인 할 수 있습니다.   
```bash
MySQL  mycluster-0.mycluster-instances.mysql-cluster.svc.cluster.local:33060+ ssl  SQL > SHOW VARIABLES LIKE "max_connections";
+-----------------+-------+
| Variable_name   | Value |
+-----------------+-------+
| max_connections | 250   |
+-----------------+-------+
1 row in set (0.0027 sec)
 
 MySQL  mycluster-1.mycluster-instances.mysql-cluster.svc.cluster.local:33060+ ssl  SQL > SHOW VARIABLES LIKE "max_connections";
+-----------------+-------+
| Variable_name   | Value |
+-----------------+-------+
| max_connections | 151   |
+-----------------+-------+
1 row in set (0.0020 sec)
```
   
위와 같이 `mycluster-0` 과 `mycluster-1` 의 설정값이 다른 이유는 Operator 가 Configmap 의 변경을 감지하고   
자동으로 Rolling Update 하는 과정이 없기 때문입니다.   
   
모든 Cluster 가 동일한 설정값을 적용하기 위해서는 SQL 문으로 Config 를 수정하거나 모든 Pod 를 재시작을 하는 방법이 필요할 것 같습니다.   
    
# 참고 문서
* [https://dev.mysql.com/doc/mysql-operator/en/mysql-operator-introduction.html](https://dev.mysql.com/doc/mysql-operator/en/mysql-operator-introduction.html)    
* [https://dev.mysql.com/doc/mysql-operator/en/mysql-operator-properties.html](https://dev.mysql.com/doc/mysql-operator/en/mysql-operator-properties.html)    
* [https://dev.mysql.com/doc/mysql-operator/en/mysql-operator-introduction.html](https://dev.mysql.com/doc/mysql-operator/en/mysql-operator-introduction.html)    