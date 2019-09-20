--- 
layout: post
title: "[Docker] nvidia container runtime 설정"
description: " "
author: chhanz
date: 2019-09-20
tags: [docker]
category: docker
---

# nvidia container runtime 설정
* * *
nvidia container runtime 을 설정하기 위해서는 꼭 `docker-ce` 로 `docker` 가 설치가 되어 있어야 됩니다.   
***(일반 RHEL/CentOS에서 제공되는 `docker` package로는 설치 불가)***

## docker-ce 설치
* _yum-utils_ 설치
```console
$ yum -y install yum-utils
```
* _docker-ce_ Repository 연결   
```console
$ yum-config-manager \ 
>     --add-repo \
>     https://download.docker.com/linux/centos/docker-ce.repo
Loaded plugins: fastestmirror 
adding repo from: https://download.docker.com/linux/centos/docker-ce.repo 
grabbing file https://download.docker.com/linux/centos/docker-ce.repo to /etc/yum.repos.d/docker-ce.repo 
repo saved to /etc/yum.repos.d/docker-ce.repo 
$ 
```
   
* _docker-ce_ 설치
```console
$ yum install docker-ce
```
   
* _docker_ 서비스 시작
```console
$ systemctl enable docker
Created symlink from /etc/systemd/system/multi-user.target.wants/docker.service to /usr/lib/systemd/system/docker.service. 
$ systemctl start docker
```

* `docker` 기본 runtime 확인
```
# docker info 
... 중략
 Runtimes: runc
 Default Runtime: runc
 Init Binary: docker-init
 containerd version: 894b81a4b802e4eb2a91d1ce216b8817763c29fb
 runc version: 425e105d5a03fabd737a126ad93d62a9eeede87f
 init version: fec3683
... 중략
```
위와 같이 Default 로 지정된 runtime 은 `runc` 입니다.   

## nvidia container runtime 설치
* _nvidia container runtime_ repository 연결
```console
$ distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
$ curl -s -L https://nvidia.github.io/nvidia-container-runtime/$distribution/nvidia-container-runtime.repo | \
  sudo tee /etc/yum.repos.d/nvidia-container-runtime.repo
```
_참고문서 : [https://nvidia.github.io/nvidia-container-runtime/](https://nvidia.github.io/nvidia-container-runtime/)_  
   
* _nvidia container runtime_ 설치
```console
$ yum install nvidia-container-runtime
```
   
* _Daemon configuration file_   수정 및 _systemd_ 수정
    * _Daemon configuration file_ 수정
```console
$ vi /etc/docker/daemon.json
{
    "default-runtime": "nvidia",
        "runtimes": {
            "nvidia": {
                "path": "/usr/bin/nvidia-container-runtime",
                "runtimeArgs": []
         }
    }
}
```
   
    * _systemd_ 수정
```console
$ mkdir -p /etc/systemd/system/docker.service.d
$ tee /etc/systemd/system/docker.service.d/override.conf <<EOF
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd --host=fd:// --add-runtime=nvidia=/usr/bin/nvidia-container-runtime
EOF
$ systemctl daemon-reload
$ systemctl restart docker
```
   
* _nvidia container runtime_ 설치 확인
```console
$ docker info 
... 중략
 Runtimes: nvidia runc
 Default Runtime: nvidia
 Init Binary: docker-init
 containerd version: 894b81a4b802e4eb2a91d1ce216b8817763c29fb
 runc version: 425e105d5a03fabd737a126ad93d62a9eeede87f
 init version: fec3683
... 중략
```
위와 같이 사용가능한 `docker` runtime 은 `nvidia`, `runc` 이고 Default runtime 은 `nvidia` 입니다.   
앞으로 `docker run` 명령을 통해 생성되는 container 는 `nvidia-container-runtime` 을 이용하여 생성될 것입니다.   
   
# 마치며
- - -
상기 내용은 NVIDIA DGX Station 시스템에 Red Hat 운영체제 설치하고 CUDA 설정을 하면서 경험한 내용입니다.

```console
[root@localhost sosreport-test-2019-xx-xx-xxxxxx]# cat proc/driver/nvidia/gpus/*/information
Model:       Tesla V100-DGXS-16GB
IRQ:         144
GPU UUID:    GPU-11111111-1111-1111-1111-111111111111
Video BIOS:      88.00.24.00.01
Bus Type:    PCIe
DMA Size:    47 bits
DMA Mask:    0x7fffffffffff
Bus Location:    0000:07:00.0
Device Minor:    0
Blacklisted:     No
Model:       Tesla V100-DGXS-16GB
IRQ:         145
GPU UUID:    GPU-22222222-2222-2222-2222-222222222222
Video BIOS:      88.00.24.00.01
Bus Type:    PCIe
DMA Size:    47 bits
DMA Mask:    0x7fffffffffff
Bus Location:    0000:08:00.0
Device Minor:    1
Blacklisted:     No
Model:       Tesla V100-DGXS-16GB
IRQ:         146
GPU UUID:    GPU-33333333-3333-3333-3333-333333333333
Video BIOS:      88.00.24.00.01
Bus Type:    PCIe
DMA Size:    47 bits
DMA Mask:    0x7fffffffffff
Bus Location:    0000:0e:00.0
Device Minor:    2
Blacklisted:     No
Model:       Tesla V100-DGXS-16GB
IRQ:         147
GPU UUID:    GPU-44444444-4444-4444-4444-444444444444
Video BIOS:      88.00.24.00.01
Bus Type:    PCIe
DMA Size:    47 bits
DMA Mask:    0x7fffffffffff
Bus Location:    0000:0f:00.0
Device Minor:    3
Blacklisted:     No
```
[`Tesla V100`](https://www.nvidia.com/ko-kr/data-center/tesla-v100/) 이 무려 4장이나 설치된 어마어마한 장비였습니다....... :(

# 참고 문서
* * *
* NVIDIA DGX Station : [https://www.nvidia.com/ko-kr/data-center/dgx-station/](https://www.nvidia.com/ko-kr/data-center/dgx-station/)
* NVIDIA Repository : [https://nvidia.github.io/nvidia-container-runtime/](https://nvidia.github.io/nvidia-container-runtime/)
* Github nvidia-container-runtime : [https://github.com/NVIDIA/nvidia-container-runtime](https://github.com/NVIDIA/nvidia-container-runtime)
* Install `docker-ce` : [https://docs.docker.com/install/linux/docker-ce/centos/](https://docs.docker.com/install/linux/docker-ce/centos/)