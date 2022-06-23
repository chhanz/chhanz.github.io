---
layout: post
title: "[Kubernetes] Cloud Native PostgreSQL Operator (CloudNativePG)"
description: ""
author: chhanz
date: 2022-06-23
tags: [kubernetes]
category: kubernetes
---

# Cloud Native PostgreSQL Operator (CloudNativePG)
***Cloud Native PostgreSQL Operator (이하 CloudNativePG) 란?***   
모든 Kubernetes Cluster 에서 PostgreSQL Workload 를 관리하도록 설계된 Operator 입니다.    
기본적으로 Primary/Standby 구조, Native Streaming Replication 사용하는 PostgreSQL Database Cluster 생성/관리 됩니다.   
   
# Install CloudNativePG
Manifest 를 이용한 설치 ([공식 문서](https://github.com/cloudnative-pg/cloudnative-pg/blob/main/docs/src/installation_upgrade.md#directly-using-the-operator-manifest)) 는 아래와 같은 방법으로 진행합니다.   
```bash
kubectl apply -f \
  https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/main/releases/cnpg-1.15.1.yaml
```
   
관련하여 Helm Chart 로도 관리가 가능하도록 Chart 를 제공하고 있습니다.   
   
이번 포스팅에선 Helm Chart 를 이용한 설치에 대한 내용을 담도록 하겠습니다.   
   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# helm repo add cnpg https://cloudnative-pg.github.io/charts
"cnpg" has been added to your repositories
```
위와 같이 Helm repo 를 추가를 하고    
   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# helm upgrade --install cnpg \
  --namespace cnpg-system \
  --create-namespace \
  cnpg/cloudnative-pg
Release "cnpg" does not exist. Installing it now.
NAME: cnpg
LAST DEPLOYED: Thu Jun 23 10:10:42 2022
NAMESPACE: cnpg-system
STATUS: deployed
REVISION: 1
NOTES:
CloudNativePG operator should be installed in namespace "cnpg-system".
You can now create a PostgreSQL cluster with 3 nodes in the current namespace as follows:
 
cat <<EOF | kubectl apply -f -
# Example of PostgreSQL cluster
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: cluster-example
spec:
  instances: 3
  storage:
    size: 1Gi
EOF
 
kubectl get cluster
```
`helm install` 을 이용하여 Chart 를 배포합니다.   
([공식 문서 - CloudNativePG Helm Chart](https://github.com/cloudnative-pg/charts))   
   
Operator 가 아래와 같이 배포가 됩니다.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# kubectl get all -n cnpg-system
NAME                                       READY   STATUS    RESTARTS   AGE
pod/cnpg-cloudnative-pg-77797b57d9-6n592   1/1     Running   0          2m14s
 
NAME                           TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE
service/cnpg-webhook-service   ClusterIP   10.200.1.188   <none>        443/TCP   2m14s
 
NAME                                  READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/cnpg-cloudnative-pg   1/1     1            1           2m14s
 
NAME                                             DESIRED   CURRENT   READY   AGE
replicaset.apps/cnpg-cloudnative-pg-77797b57d9   1         1         1       2m1
```
   
CloudNativePG 에서 사용되는 CRD 는 아래와 같습니다.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# kubectl get crd | grep post
backups.postgresql.cnpg.io                            2022-06-23T01:10:43Z
clusters.postgresql.cnpg.io                           2022-06-23T01:10:43Z
poolers.postgresql.cnpg.io                            2022-06-23T01:10:43Z
scheduledbackups.postgresql.cnpg.io                   2022-06-23T01:10:43Z
```
   
# PostgreSQL Cluster 생성
아래 Example Yaml 을 이용하여 PostgreSQL Cluster 를 생성해보도록 하겠습니다.   
```yaml
# Example of PostgreSQL cluster
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: mycluster
spec:
  imageName: ghcr.io/cloudnative-pg/postgresql:14.2
  instances: 3
  storage:
    size: 3Gi
  postgresql:
    parameters:
      max_worker_processes: "40"
      timezone: "Asia/Seoul"
    pg_hba:
      - host all postgres all trust
  primaryUpdateStrategy: unsupervised
  enableSuperuserAccess: true
  bootstrap:
    initdb:
      database: app
      encoding: UTF8
      localeCType: C
      localeCollate: C
      owner: app
```
   
위 Yaml 생성하고 Create 합니다.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# kubectl create -f mycluster1.yaml
cluster.postgresql.cnpg.io/mycluster created
```
   
Cluster 의 생성 진행도 확인 및 상태 확인은 아래와 같은 방법으로 진행 합니다.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# kubectl describe cluster
...
Events:
  Type    Reason                       Age   From            Message
  ----    ------                       ----  ----            -------
  Normal  CreatingPodDisruptionBudget  74s   cloudnative-pg  Creating PodDisruptionBudget mycluster-primary
  Normal  CreatingPodDisruptionBudget  74s   cloudnative-pg  Creating PodDisruptionBudget mycluster
  Normal  CreatingServiceAccount       74s   cloudnative-pg  Creating ServiceAccount
  Normal  CreatingRole                 74s   cloudnative-pg  Creating Cluster Role
  Normal  CreatingInstance             74s   cloudnative-pg  Primary instance (initdb)
  Normal  CreatingInstance             28s   cloudnative-pg  Creating instance mycluster-2
  Normal  CreatingInstance             95s   cloudnative-pg  Creating instance mycluster-3
```
상세 내역에서 Event Log 가 확인이 가능하고   
   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# kubectl get cluster
NAME        AGE     INSTANCES   READY   STATUS                     PRIMARY
mycluster   3m31s   3           3       Cluster in healthy state   mycluster-1
```
위와 같이 간단한 상태도 확인이 가능합니다.   
   
# Plugin 설치
위에서 소개한 것과 같이 간단하게 Cluster 상태 확인이 가능하지만 상세한 확인 및 관리를 위해서는 아래 문서를 참고하여 `Kubectl` Plugin 을 설치해야됩니다.   
([https://github.com/cloudnative-pg/cloudnative-pg/blob/main/docs/src/cnpg-plugin.md](https://github.com/cloudnative-pg/cloudnative-pg/blob/main/docs/src/cnpg-plugin.md))   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# curl -sSfL \
  https://github.com/cloudnative-pg/cloudnative-pg/raw/main/hack/install-cnpg-plugin.sh | \
  sudo sh -s -- -b /usr/local/bin
cloudnative-pg/cloudnative-pg info checking GitHub for latest tag
cloudnative-pg/cloudnative-pg info found version: 1.15.1 for v1.15.1/linux/x86_64
cloudnative-pg/cloudnative-pg info installed /usr/local/bin/kubectl-cnpg
```
   
Plugin을 이용하면 아래와 같이 Cluster 의 상세 정보 확인이 가능합니다.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# kubectl cnpg status mycluster
Cluster Summary
Name:               mycluster
Namespace:          default
System ID:          7112239011699195924
PostgreSQL Image:   ghcr.io/cloudnative-pg/postgresql:14.2
Primary instance:   mycluster-1
Status:             Cluster in healthy state
Instances:          3
Ready instances:    3
Current Write LSN:  0/6000060 (Timeline: 1 - WAL File: 000000010000000000000006)
 
Certificates Status
Certificate Name       Expiration Date                Days Left Until Expiration
----------------       ---------------                --------------------------
mycluster-ca           2022-09-21 01:14:15 +0000 UTC  89.99
mycluster-replication  2022-09-21 01:14:15 +0000 UTC  89.99
mycluster-server       2022-09-21 01:14:15 +0000 UTC  89.99
 
Continuous Backup status
Not configured
 
Streaming Replication status
Name         Sent LSN   Write LSN  Flush LSN  Replay LSN  Write Lag  Flush Lag  Replay Lag  State      Sync State  Sync Priority
----         --------   ---------  ---------  ----------  ---------  ---------  ----------  -----      ----------  -------------
mycluster-2  0/6000060  0/6000060  0/6000060  0/6000060   00:00:00   00:00:00   00:00:00    streaming  async       0
mycluster-3  0/6000060  0/6000060  0/6000060  0/6000060   00:00:00   00:00:00   00:00:00    streaming  async       0
 
Instances status
Name         Database Size  Current LSN  Replication role  Status  QoS         Manager Version
----         -------------  -----------  ----------------  ------  ---         ---------------
mycluster-1  33 MB          0/6000060    Primary           OK      BestEffort  1.15.1
mycluster-2  33 MB          0/6000060    Standby (async)   OK      BestEffort  1.15.1
mycluster-3  33 MB          0/6000060    Standby (async)   OK      BestEffort  1.15.1
```
   
# DB 접근
생성된 Cluster 의 DB 에 접근하고 간단하게 Example Datebase 를 생성해보도록 하겠습니다.   
   
```console
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# kubectl exec -ti mycluster-1 -- /bin/bash
Defaulted container "postgres" out of: postgres, bootstrap-controller (init)
postgres@mycluster-1:/$ psql -U postgres
psql (14.2 (Debian 14.2-1.pgdg110+1))
Type "help" for help.
 
postgres-# \conninfo      "## 연결 상태 확인"
You are connected to database "postgres" as user "postgres" via socket in "/controller/run" at port "5432".     

postgres-# \l             "## 데이터베이스 목록 확인"
                             List of databases
   Name    |  Owner   | Encoding | Collate | Ctype |   Access privileges
-----------+----------+----------+---------+-------+-----------------------
 app       | app      | UTF8     | C       | C     |
 postgres  | postgres | UTF8     | C       | C     |
 template0 | postgres | UTF8     | C       | C     | =c/postgres          +
           |          |          |         |       | postgres=CTc/postgres
 template1 | postgres | UTF8     | C       | C     | =c/postgres          +
           |          |          |         |       | postgres=CTc/postgres
(4 rows)
```
   
아래와 같이 초기 Cluster 구성에 넣은 설정값을 확인해보겠습니다.   
```console
postgres=# SELECT * FROM pg_timezone_names WHERE name = current_setting('TIMEZONE');
    name    | abbrev | utc_offset | is_dst
------------+--------+------------+--------
 Asia/Seoul | KST    | 09:00:00   | f
(1 row)
```
   
PostgreSQL Tutorial 에서 제공하는 DVD Rental database 를 이용하여 실제 데이터를 생성한 Cluster 에 넣어보겠습니다.   
([https://www.postgresqltutorial.com/postgresql-getting-started/load-postgresql-sample-database/](https://www.postgresqltutorial.com/postgresql-getting-started/load-postgresql-sample-database/))       
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# wget https://www.postgresqltutorial.com/wp-content/uploads/2019/05/dvdrental.zip
...
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# unzip dvdrental.zip
Archive:  dvdrental.zip
  inflating: dvdrental.tar
```
아래 명령을 이용하여 pod 내에 data 를 복사합니다.    
참고로 pod 내의 filesystem 은 Read-Only 로 되어 있어 PV 가 연결된 `/var/lib/postgresql/data` (rw) 경로로 data 를 복사합니다.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# kubectl cp dvdrental.tar mycluster-1:/var/lib/postgresql/data/ -c postgres
```
   
## DB 테스트
아래 명령어를 이용하여 데이터베이스를 생성합니다.   
```bash
postgres@mycluster-1:~/data$ psql -U postgres -c "CREATE DATABASE dvdrental;"
CREATE DATABASE
```
   
위에서 복사한 DVD rental data 를 이용하여 데이터베이스를 복구합니다.   
```bash
postgres@mycluster-1:~/data$ pg_restore -U postgres -d dvdrental dvdrental.tar
```
   
복구가 잘 되었는지 확인합니다.   
```console
postgres@mycluster-1:~/data$ psql
psql (14.2 (Debian 14.2-1.pgdg110+1))
Type "help" for help.
 
postgres=# \c dvdrental
You are now connected to database "dvdrental" as user "postgres".
dvdrental=# \dt
             List of relations
 Schema |     Name      | Type  |  Owner
--------+---------------+-------+----------
 public | actor         | table | postgres
 public | address       | table | postgres
 public | category      | table | postgres
 public | city          | table | postgres
 public | country       | table | postgres
 public | customer      | table | postgres
 public | film          | table | postgres
 public | film_actor    | table | postgres
 public | film_category | table | postgres
 public | inventory     | table | postgres
 public | language      | table | postgres
 public | payment       | table | postgres
 public | rental        | table | postgres
 public | staff         | table | postgres
 public | store         | table | postgres
(15 rows)
```
   
데이터베이스가 정상적으로 Read/Write 가 되는지 테스트 해보겠습니다.   
테스트용 테이블을 생성합니다.   
```console
dvdrental=# CREATE TABLE testtable
(
  networkid uuid PRIMARY KEY,
  facility_layer character varying(30),
  snode_id uuid,
  snode_layer character varying(30),
  enode_id uuid
);
CREATE TABLE
 
```
아래와 같이 정상적으로 생성이 되었습니다.    
```console
dvdrental=# \dt
             List of relations
 Schema |     Name      | Type  |  Owner
--------+---------------+-------+----------
 public | actor         | table | postgres
...생략
 public | testtable     | table | postgres      <<
(16 rows)
```
    
지금까지 `mycluster-1` instance 에서 DB 테스트를 하였는데 `mycluster-2` instance 에서도 DB 접근이 가능한지 테스트 해보겠습니다.   
```console
postgres@mycluster-2:/$ psql
psql (14.2 (Debian 14.2-1.pgdg110+1))
Type "help" for help.
 
postgres-# \l
                             List of databases
   Name    |  Owner   | Encoding | Collate | Ctype |   Access privileges
-----------+----------+----------+---------+-------+-----------------------
 app       | app      | UTF8     | C       | C     |
 dvdrental | postgres | UTF8     | C       | C     |
 postgres  | postgres | UTF8     | C       | C     |
 template0 | postgres | UTF8     | C       | C     | =c/postgres          +
           |          |          |         |       | postgres=CTc/postgres
 template1 | postgres | UTF8     | C       | C     | =c/postgres          +
           |          |          |         |       | postgres=CTc/postgres
(5 rows)
 
dvdrental-# \dt
             List of relations
 Schema |     Name      | Type  |  Owner
--------+---------------+-------+----------
 public | actor         | table | postgres
 public | address       | table | postgres
 public | category      | table | postgres
 public | city          | table | postgres
 public | country       | table | postgres
 public | customer      | table | postgres
 public | film          | table | postgres
 public | film_actor    | table | postgres
 public | film_category | table | postgres
 public | inventory     | table | postgres
 public | language      | table | postgres
 public | payment       | table | postgres
 public | rental        | table | postgres
 public | staff         | table | postgres
 public | store         | table | postgres
(15 rows)
 
dvdrental=# CREATE TABLE testtable2
(
  networkid uuid PRIMARY KEY,
  facility_layer character varying(30),
  snode_id uuid,
  snode_layer character varying(30),
  enode_id uuid
);
ERROR:  cannot execute CREATE TABLE in a read-only transaction
dvdrental=#
```
위와 같이 `Read` 는 가능하지만 `Write` 는 안되는 것을 볼 수 있습니다.   
   
이는 초반에 설명한 것과 같이 Primary/Standby 구성의 Database Cluster 라서 그렇습니다.    
그리하여 Operator 는 아래와 같이 용도별로 instance 에 접근을 할 수 있는 `Service` 를 제공하고 있습니다.    
    
# Service
## Instance 정보    
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# kubectl get pod -o wide
NAME          READY   STATUS    RESTARTS   AGE   IP              NODE          NOMINATED NODE   READINESS GATES
mycluster-1   1/1     Running   0          64m   172.16.110.33   chhan-k8s-2   <none>           <none>
mycluster-2   1/1     Running   0          63m   172.16.234.49   chhan-k8s-3   <none>           <none>
mycluster-3   1/1     Running   0          62m   172.16.107.26   chhan-k8s-4   <none>           <none>
```
   
## Service `Any` 정보   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# kubectl describe svc mycluster-any | grep Endpoint
Endpoints:         172.16.107.26:5432,172.16.110.33:5432,172.16.234.49:5432
```
Endpoint 로 3개의 Instance IP 를 확인 할 수 있습니다.   
   
## Service `RO` 정보 (Read-Only)
```bash
☁ |DOIK-Lab:default) root@chhan-k8s-1:~# kubectl describe svc mycluster-ro | grep Endpoint
Endpoints:         172.16.107.26:5432,172.16.234.49:5432
```
Standby Instance 인 `mycluster-2` 와 `mycluster-3` 의 IP 를 확인 할 수 있습니다.   
   
## Service `RW` 정보 (Read/Write)
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# kubectl describe svc mycluster-rw | grep Endpoint
Endpoints:         172.16.110.33:5432
```
Primary Instance 인 `mycluster-1` 의 IP 를 확인 할 수 있습니다.   
    
이런 특성을 이용하여 DB 접근 분산 및 고가용성을 유지 할 수 있습니다.   
     
# 장애 시나리오
Pod 가 죽는 경우(Node Down or 알수없는 오류)에는 어떻게 Operator 가 DB 의 고가용성을 유지하는지 확인하도록 하겠습니다.    
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# kubectl delete pod mycluster-1
pod "mycluster-1" deleted
```
Pod 삭제를 합니다.   
    
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# kubectl get pod -o wide
NAME          READY   STATUS    RESTARTS   AGE   IP              NODE          NOMINATED NODE   READINESS GATES
mycluster-1   1/1     Running   0          11s   172.16.110.36   chhan-k8s-2   <none>           <none>          << 재생성
mycluster-2   1/1     Running   0          66m   172.16.234.49   chhan-k8s-3   <none>           <none>
mycluster-3   1/1     Running   0          65m   172.16.107.26   chhan-k8s-4   <none>           <none>
```
해당 테스트는 Pod 만 삭제가 된 것이므로 Pod 가 재생성이 되고 기존에 PVC 를 이용하여 PV 도 다시 재연결하여 복구를 하였습니다.    
    
여기서 핵심은 Instance 의 role 이 변경되는 점입니다.   

```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# kubectl get cluster
NAME        AGE   INSTANCES   READY   STATUS                     PRIMARY
mycluster   67m   3           3       Cluster in healthy state   mycluster-2
 
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# kubectl cnpg status mycluster
...
Instances status
Name         Database Size  Current LSN  Replication role  Status  QoS         Manager Version
----         -------------  -----------  ----------------  ------  ---         ---------------
mycluster-1  48 MB          0/800B2D8    Standby (async)   OK      BestEffort  1.15.1
mycluster-2  49 MB          0/800B2D8    Primary           OK      BestEffort  1.15.1               <<< 변경
mycluster-3  48 MB          0/800B2D8    Standby (async)   OK      BestEffort  1.15.1
 
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# kubectl describe svc mycluster-rw | grep End
Endpoints:         172.16.234.49:5432       << 변경
```
Primary Instance 변경 및 `rw` Endpoint 가 변경된 것을 확인 할 수 있습니다.   
   
# Upgrade PostgreSQL 
운영중인 Cluster 의 PostgreSQL Upgrade 가 Operator 를 이용하면 손쉽게 가능합니다.   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# kubectl cnpg status mycluster  | grep Image
PostgreSQL Image:   ghcr.io/cloudnative-pg/postgresql:14.2
```
현재 버전은 14.2 입니다.   
   
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# kubectl edit cluster mycluster
...
  imageName: ghcr.io/cloudnative-pg/postgresql:14.3
...
```
`kubectl edit` 명령을 통해 `cluster CRD` 를 수정합니다.    
`imageName` 을 `14.3` 으로 변경하고 저장합니다.    
    
각각의 Instance 가 중지되고 다시 생성이 되는 과정이 진행됩니다.    
여기서 중요한 점은 Operator 가 Replication role 을 확인하고 Standby 부터 Upgrade 를 진행하는 것을 볼 수 있습니다.    
    
현재 `mycluster-2` 가 Primary 였고 `mycluster-1`, `mycluster-3` 이 Standby 였습니다.    
첫번째로 `mycluster-3` 이 중지 되고 Upgrade 를 진행합니다.    
두번째로 `mycluster-1` 이 중지 되고 Upgrade 를 진행합니다.    
세번째로 `mycluster-2` 가 Upgrade 되기전에 Replication role 에 의해 Primary role 을 Upgrade 가 된 Instance 로 변경합니다.    
마지막으로 Role 변경이 완료되면 `mycluster-2` 를 Upgrade 하고 PostgreSQL Upgrade 가 완료 됩니다.    
    
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# kubectl cnpg status mycluster  | grep Image
PostgreSQL Image:   ghcr.io/cloudnative-pg/postgresql:14.3
 
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# kubectl get pod -w
....
NAME          READY   STATUS    RESTARTS   AGE
mycluster-1   1/1     Running   0          62s
mycluster-2   1/1     Running   0          28s
mycluster-3   1/1     Running   0          88s
```
   
아래와 같이 Role 이 변경되었고 정상적으로 Cluster 가 작동중인 것을 확인 할 수 있습니다.    
```bash
(☁ |DOIK-Lab:default) root@chhan-k8s-1:~# kubectl cnpg status mycluster | tail -n6
Instances status
Name         Database Size  Current LSN  Replication role  Status  QoS         Manager Version
----         -------------  -----------  ----------------  ------  ---         ---------------
mycluster-1  49 MB          0/A007728    Primary           OK      BestEffort  1.15.1       << 변경된 Role
mycluster-2  48 MB          0/A007728    Standby (async)   OK      BestEffort  1.15.1
mycluster-3  48 MB          0/A007728    Standby (async)   OK      BestEffort  1.15.1
```
    
# 마치며
이전에 작성한 MySQL Operator 보다 Operator 의 완성도가 높고 관리가 편리하여 사용하기 좋은 Operator 인 것 같습니다.    
    
# 참고 자료
* [https://cloudnative-pg.io/](https://cloudnative-pg.io/)    
* [https://www.postgresqltutorial.com/postgresql-getting-started/postgresql-sample-database/](https://www.postgresqltutorial.com/postgresql-getting-started/postgresql-sample-database/)    
* [https://github.com/cloudnative-pg/cloudnative-pg](https://github.com/cloudnative-pg/cloudnative-pg)    