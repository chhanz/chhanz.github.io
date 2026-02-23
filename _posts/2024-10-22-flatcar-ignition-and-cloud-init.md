---
layout: post
title: "Flatcar Container Linux on AWS 에서 ignition 및 cloud-init 설정"
description: ""
author: chhanz
date: 2024-10-22
tags: [linux]
category: linux
---

# Flatcar Container Linux 란?
Flatcar Container Linux 는 기존 CoreOS Container Linux 에서 Fork 해서 만들어진 컨테이너 리눅스 배포판입니다.   
   
# Ignition vs Cloud-init
Ignition 이란 컨테이너 리눅스 운영체제에서 사용되는 low-level 시스템 구성 도구입니다.   
`Ignition` 은 첫번째 부팅에서 실행이 되도록 설정이 되어있고 초반 컨테이너 리눅스 운영체제의 구성을 담당하는 역할을 하고 있습니다.   
그리고 `cloud-init` 으로 말하지만 컨테이너 리눅스 운영체제에서는 `coreos-cloudinit` 혹은 `oem-cloudinit` 를 통해 일반적인 리눅스의 `cloud-init` 과 유사한 동작을 지원하는 것으로 생각하면 좋을 것 같습니다.   
   
# Ignition 배포 관련
이번 글에서는 AWS 에서 Ignition 을 사용하는 방법을 작성할 예정입니다.   
만약 온프레미스 혹은 기타 환경에서는 Matchbox 를 이용하여 Ignition 배포 서버를 구성하는 것도 하나의 방법입니다.   
관련 내용은 이전 포스트 - ["Matchbox 를 이용하여 OpenShift 배포서버 구성"](https://tech.chhanz.xyz/openshift/2021/01/26/matchbox/) 를 참고 부탁 드리겠습니다.   
   
# AWS EC2 에서 Ignition 사용하는 법
온프레미스와 다르게 EC2 에서 Ignition 을 통해 컨테이너 리눅스를 구성하려면 "사용자 데이터 (user-data)" 기능을 활용하면 됩니다.   
아래는 EC2 에서 사용된 Ignition 예제입니다.   
   
```console
variant: flatcar
version: 1.0.0
storage:
  files:
    - filesystem: "root"
      path:       "/etc/hostname"
      mode:       0644
      contents:
        inline: chhanz-coreos

passwd:
  users:
    - name: test
      ssh_authorized_keys:
        - "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC0g+ZTxC7weoIJLUafOgrm+h"

kernel_arguments:
  should_exist:
    - selinux=0

systemd:
  units:
    - name: nginx.service
      enabled: true
      contents: |
        [Unit]
        Description=NGINX example
        After=docker.service
        Requires=docker.service
        [Service]
        TimeoutStartSec=0
        ExecStartPre=-/usr/bin/docker rm --force nginx1
        ExecStart=/usr/bin/docker run --name nginx1 --pull always --log-driver=journald --net host docker.io/nginx:1
        ExecStop=/usr/bin/docker stop nginx1
        Restart=always
        RestartSec=5s
        [Install]
        WantedBy=multi-user.target
```
   
위와 같이 Hostname 을 변경하고 커널 파라미터를 추가, 사용자를 추가, SSH 키 설정, nginx 컨테이너 실행을 한번에 설정하는 Ignition 입니다.   
이렇게 작성된 yaml 을 아래와 같은 방법으로 ignition 형태로 변환합니다.   
   
```console
# cat test.yml | docker run --rm -i quay.io/coreos/butane:latest > ignition.json
warning at $.storage.files.0.filesystem, line 5 col 7: Unused key filesystem

# cat ignition.json
{"ignition":{"version":"3.3.0"},"kernelArguments":{"shouldExist":["selinux=0"]},"passwd":{"users":[{"name":"test","sshAuthorizedKeys":["ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC0g+ZTxC7weoIJLUafOgrm+h"]}]},"storage":{"files":[{"path":"/etc/hostname","contents":{"compression":"","source":"data:,chhanz-coreos"},"mode":420}]},"systemd":{"units":[{"contents":"[Unit]\nDescription=NGINX example\nAfter=docker.service\nRequires=docker.service\n[Service]\nTimeoutStartSec=0\nExecStartPre=-/usr/bin/docker rm --force nginx1\nExecStart=/usr/bin/docker run --name nginx1 --pull always --log-driver=journald --net host docker.io/nginx:1\nExecStop=/usr/bin/docker stop nginx1\nRestart=always\nRestartSec=5s\n[Install]\nWantedBy=multi-user.target     \n","enabled":true,"name":"nginx.service"}]}}
```
   
생성된 json 형태의 구문을 EC2 를 생성 할 때, 사용자 데이터에 넣고 인스턴스를 생성합니다.   
   
![](/assets/images/post/2024-10-22-flatcar/user-data.png)   
   
# Ignition 자세히 살펴보기   
인스턴스가 생성이 완료되면 아래와 같이 Ignition 에 설정이 된 것과 같이 시스템이 구성이 된 것을 볼 수 있습니다.   
   
```console
chhanz-coreos ~ # hostnamectl
 Static hostname: chhanz-coreos
       Icon name: computer-vm
         Chassis: vm 🖴
      Machine ID: ec29b9b6230b9fa5d3bd9f6d59235eb4
         Boot ID: 80a30c047ef14867a2369ef9ca857e2e
  Virtualization: xen
Operating System: Flatcar Container Linux by Kinvolk 3975.2.2 (Oklo)
     CPE OS Name: cpe:2.3:o:flatcar-linux:flatcar_linux:3975.2.2:*:*:*:*:*:*:*
          Kernel: Linux 6.6.54-flatcar
    Architecture: x86-64
 Hardware Vendor: Xen
  Hardware Model: HVM domU
Firmware Version: 4.11.amazon
   Firmware Date: Thu 2006-08-24
    Firmware Age: 18y 1month 3w 2d
    
chhanz-coreos ~ # cat /proc/cmdline
rootflags=rw mount.usrflags=ro BOOT_IMAGE=/flatcar/vmlinuz-a mount.usr=/dev/mapper/usr verity.usr=PARTUUID=7130c94a-213a-4e5a-8e26-6cce9662f132 rootflags=rw mount.usrflags=ro consoleblank=0 root=LABEL=ROOT console=ttyS0,115200n8 flatcar.first_boot=detected flatcar.oem.id=ec2 modprobe.blacklist=xen_fbfront net.ifnames=0 nvme_core.io_timeout=4294967295 selinux=0 verity.usrhash=1839da262570fb938be558d95db7fc3d986a0d71e1b77d40d35a3e2a1bac7dcd

chhanz-coreos ~ # getenforce
Disabled

chhanz-coreos ~ # id test
uid=1000(test) gid=1000(test) groups=1000(test)

chhanz-coreos ~ # cat /home/test/.ssh/authorized_keys.d/ignition
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC0g+ZTxC7weoIJLUafOgrm+h...

chhanz-coreos ~ # docker ps -a
CONTAINER ID   IMAGE     COMMAND                  CREATED         STATUS         PORTS     NAMES
996911a27ae6   nginx:1   "/docker-entrypoint.…"   3 minutes ago   Up 3 minutes             nginx1
```
   
아래와 같은 방법으로 Ignition 의 로그를 살펴 볼 수 있습니다.   
아래 로그는 ignition 을 user-data 에서 가지고 오는 과정에 대한 로그입니다.   
```console
$ journalctl -b | grep ignition
...
Oct 22 01:11:31 localhost systemd[1]: Starting ignition-fetch.service - Ignition (fetch)...
Oct 22 01:11:31 localhost ignition[839]: Ignition 2.18.0
Oct 22 01:11:31 localhost ignition[839]: Stage: fetch
Oct 22 01:11:31 localhost ignition[839]: no configs at "/usr/lib/ignition/base.d"
Oct 22 01:11:31 localhost ignition[839]: no config dir at "/usr/lib/ignition/base.platform.d/aws"
Oct 22 01:11:31 localhost ignition[839]: PUT http://169.254.169.254/latest/api/token: attempt #1
Oct 22 01:11:31 localhost ignition[839]: PUT result: OK
Oct 22 01:11:31 localhost ignition[839]: parsed url from cmdline: ""
Oct 22 01:11:31 localhost ignition[839]: no config URL provided
Oct 22 01:11:31 localhost ignition[839]: reading system config file "/usr/lib/ignition/user.ign"
Oct 22 01:11:31 localhost ignition[839]: no config at "/usr/lib/ignition/user.ign"  <<<----!!!
Oct 22 01:11:31 localhost ignition[839]: PUT http://169.254.169.254/latest/api/token: attempt #1   
Oct 22 01:11:31 localhost ignition[839]: PUT result: OK
Oct 22 01:11:31 localhost ignition[839]: GET http://169.254.169.254/2019-10-01/user-data: attempt #1    <<<---!!! 사용자 데이터에서 ignition 을 가져옴
Oct 22 01:11:31 localhost ignition[839]: GET result: OK
...
```
   
아래 로그는 ignition 에 의해서 시스템이 구성되는 로그입니다.   

```console
Oct 22 01:11:32 localhost ignition[1056]: INFO     : Ignition 2.18.0
Oct 22 01:11:32 localhost ignition[1056]: INFO     : Stage: files
Oct 22 01:11:32 localhost ignition[1056]: INFO     : no configs at "/usr/lib/ignition/base.d"
Oct 22 01:11:32 localhost ignition[1056]: INFO     : no config dir at "/usr/lib/ignition/base.platform.d/aws"
Oct 22 01:11:32 localhost ignition[1056]: INFO     : PUT http://169.254.169.254/latest/api/token: attempt #1
Oct 22 01:11:32 localhost ignition[1056]: INFO     : PUT result: OK
Oct 22 01:11:32 localhost ignition[1056]: DEBUG    : files: compiled without relabeling support, skipping
Oct 22 01:11:32 localhost ignition[1056]: INFO     : files: ensureUsers: op(1): [started]  creating or modifying user "test"
Oct 22 01:11:32 localhost ignition[1056]: DEBUG    : files: ensureUsers: op(1): executing: "useradd" "--root" "/sysroot" "--create-home" "--password" "*" "test"
Oct 22 01:11:33 localhost ignition[1056]: INFO     : files: ensureUsers: op(1): [finished] creating or modifying user "test"
Oct 22 01:11:33 localhost ignition[1056]: INFO     : files: ensureUsers: op(2): [started]  adding ssh keys to user "test"
Oct 22 01:11:33 localhost ignition[1056]: INFO     : files: ensureUsers: op(2): [finished] adding ssh keys to user "test"
Oct 22 01:11:33 localhost ignition[1056]: INFO     : files: createFilesystemsFiles: createFiles: op(3): [started]  writing file "/sysroot/etc/hostname"
Oct 22 01:11:33 localhost ignition[1056]: INFO     : files: createFilesystemsFiles: createFiles: op(3): [finished] writing file "/sysroot/etc/hostname"
Oct 22 01:11:33 localhost ignition[1056]: INFO     : files: op(4): [started]  processing unit "nginx.service"
Oct 22 01:11:33 localhost ignition[1056]: wrote ssh authorized keys file for user: test
Oct 22 01:11:33 localhost ignition[1056]: INFO     : files: op(4): op(5): [started]  writing unit "nginx.service" at "/sysroot/etc/systemd/system/nginx.service"
Oct 22 01:11:33 localhost ignition[1056]: INFO     : files: op(4): op(5): [finished] writing unit "nginx.service" at "/sysroot/etc/systemd/system/nginx.service"
Oct 22 01:11:33 localhost ignition[1056]: INFO     : files: op(4): [finished] processing unit "nginx.service"
Oct 22 01:11:33 localhost ignition[1056]: INFO     : files: op(6): [started]  setting preset to enabled for "nginx.service"
Oct 22 01:11:33 localhost ignition[1056]: INFO     : files: op(6): [finished] setting preset to enabled for "nginx.service"
Oct 22 01:11:33 localhost ignition[1056]: INFO     : files: createResultFile: createFiles: op(7): [started]  writing file "/sysroot/etc/.ignition-result.json"
Oct 22 01:11:33 localhost ignition[1056]: INFO     : files: createResultFile: createFiles: op(7): [finished] writing file "/sysroot/etc/.ignition-result.json"
Oct 22 01:11:33 localhost ignition[1056]: INFO     : files: files passed
Oct 22 01:11:33 localhost ignition[1056]: INFO     : Ignition finished successfully
```
      
# 참고 문서    
* [https://www.flatcar.org/docs/latest/installing/cloud/aws-ec2/](https://www.flatcar.org/docs/latest/installing/cloud/aws-ec2/)   
* [https://coreos.github.io/ignition/getting-started/](https://coreos.github.io/ignition/getting-started/)   
* [https://www.flatcar.org/docs/latest/provisioning/ignition/#ignition-vs-coreos-cloudinit](https://www.flatcar.org/docs/latest/provisioning/ignition/#ignition-vs-coreos-cloudinit)   