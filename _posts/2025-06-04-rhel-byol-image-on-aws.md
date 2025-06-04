---
layout: post
title: "RHEL BYOL AMI 생성 가이드"
description: "Use Red Hat Insights"
author: chhanz
date: 2025-06-04
tags: [linux]
category: linux
---

# RHEL BYOL AMI 생성

AWS 와 같은 기타 CSP 를 사용하게 되면 PAYG 라이센스의 RHEL 을 사용합니다.   
PAYG 라이센스가 아닌 BYOL (Bring Your Own License) RHEL 을 사용하면서, OpenSCAP 프로파일 적용, 파티션 구분 및 파일시스템 분리 등을 위한 커스텀한 RHEL BYOL AMI 을 생성하는 방안에 대해 설명을 드리겠습니다.   
   
***이번 포스팅은 AWS 를 대상으로 진행이 되었으나, GCP, Azure, Oracle Cloud, VMWare, qcow2, iso 로 사용 가능한 이미지가 생성에도 활용이 가능합니다.***   

## Recommanded

* Developers Subscription 등록 필요
    * https://developers.redhat.com/blog/2021/02/10/how-to-activate-your-no-cost-red-hat-enterprise-linux-subscription
* 아래 페이지에서도 등록이 가능합니다.
    * https://developers.redhat.com/products/rhel/download
* <center><img src="/assets/images/post/2025-06-04-rhel-byol/1.png" style="max-width: 95%; height: auto;"></center>  
* 정상적으로 등록이 된다면 아래와 같이 서브스크립션이 확인이 될 것입니다.
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/2.png" style="max-width: 95%; height: auto;"></center>  

* * *

## How to create BYOL AMI

1. [Red Hat Insights](https://www.redhat.com/en/technologies/management/insights) > Inventory > Images
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/3.png" style="max-width: 95%; height: auto;"></center>  
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/4.png" style="max-width: 95%; height: auto;"></center>  
2. Select target environment > AWS
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/5.png" style="max-width: 95%; height: auto;"></center>  
    * Select the RHEL Release version
        * <center><img src="/assets/images/post/2025-06-04-rhel-byol/6.png" style="max-width: 95%; height: auto;"></center>  
3. Enter the account ID for shared AMI 
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/7.png" style="max-width: 95%; height: auto;"></center>  
4. Select “Registration method”
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/8.png" style="max-width: 95%; height: auto;"></center>  
5. Select the “[OpenSCAP](https://www.open-scap.org/) profile”
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/9.png" style="max-width: 95%; height: auto;"></center>  
6. File system configuration
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/10.png" style="max-width: 95%; height: auto;"></center>  
7. Select the “Disable repeatable build“ for use the newest state of repositories
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/11.png" style="max-width: 95%; height: auto;"></center>  
8. (optional) if you need custom repositories, add custom repository information
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/12.png" style="max-width: 95%; height: auto;"></center>  
9. (optional) if you need additional packages
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/13.png" style="max-width: 95%; height: auto;"></center>  
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/14.png" style="max-width: 95%; height: auto;"></center>  
10. (optional) if you need add user
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/15.png" style="max-width: 95%; height: auto;"></center>  
11. Select the timezone
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/16.png" style="max-width: 95%; height: auto;"></center>  
12. Select the Locale
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/17.png" style="max-width: 95%; height: auto;"></center>  
13. Select the hostname
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/18.png" style="max-width: 95%; height: auto;"></center>  
14. (optional) Customize kernel name and kernel arguments.
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/19.png" style="max-width: 95%; height: auto;"></center>  
15. (optional) Customize firewall settings for your image.
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/20.png" style="max-width: 95%; height: auto;"></center>  
16. (optional) Enable, disable and mask systemd services.
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/21.png" style="max-width: 95%; height: auto;"></center>  
17. (optional) Configure the image with a custom script that will execute on its first boot.
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/22.png" style="max-width: 95%; height: auto;"></center>  
18. Select the Blueprint name
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/23.png" style="max-width: 95%; height: auto;"></center>  
19. Review
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/24.png" style="max-width: 95%; height: auto;"></center>  
20. Create blueprint and build image
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/25.png" style="max-width: 95%; height: auto;"></center>  
21. building the image
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/26.png" style="max-width: 95%; height: auto;"></center>  
22. Shared AMI
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/27.png" style="max-width: 95%; height: auto;"></center>  
    * <center><img src="/assets/images/post/2025-06-04-rhel-byol/28.png" style="max-width: 95%; height: auto;"></center>  
23. Create the instance from shared AMI

```
[root@ip-172-31-8-200 ~]# cat /var/log/messages | grep rhel-image
Jun  4 01:16:27 ip-172-31-8-200 systemd: Hostname set to <rhel-image-builder>.

[root@ip-172-31-8-200 ~]# cat /etc/redhat-release
Red Hat Enterprise Linux release 10.0 (Coughlan)

[root@ip-172-31-8-200 ~]# df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme0n1p3   20G  1.9G   18G  10% /
devtmpfs        4.0M     0  4.0M   0% /dev
tmpfs           1.8G     0  1.8G   0% /dev/shm
efivarfs        128K  3.6K  120K   3% /sys/firmware/efi/efivars
tmpfs           707M  8.6M  698M   2% /run
tmpfs           1.0M     0  1.0M   0% /run/credentials/systemd-journald.service
/dev/nvme0n1p2  200M  8.4M  192M   5% /boot/efi
tmpfs           1.0M     0  1.0M   0% /run/credentials/serial-getty@ttyS0.service
tmpfs           1.0M     0  1.0M   0% /run/credentials/getty@tty1.service
tmpfs           354M  4.0K  354M   1% /run/user/1001

[root@ip-172-31-8-200 ~]# lsblk
NAME        MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
nvme0n1     259:0    0   20G  0 disk
├─nvme0n1p1 259:1    0    1M  0 part
├─nvme0n1p2 259:2    0  200M  0 part /boot/efi
└─nvme0n1p3 259:3    0 19.8G  0 part /

[root@ip-172-31-8-200 ~]# rpm -qa | egrep "cloud-init|tmux"
cloud-init-24.4-3.el10.noarch
tmux-3.3a-13.20230918gitb202a2f.el10.x86_64
```

```
[root@ip-172-31-8-200 ~]# subscription-manager status
+-------------------------------------------+
   System Status Details
+-------------------------------------------+
Overall Status: Not registered

[root@ip-172-31-8-200 ~]# yum repolist
Updating Subscription Management repositories.
Unable to read consumer identity

This system is not registered with an entitlement server. You can use "rhc" or "subscription-manager" to register.

No repositories available
```

* * *

## Register subscription

```
[root@ip-172-31-8-200 ~]# subscription-manager register
Registering to: subscription.rhsm.redhat.com:443/subscription
Username: chhanz
Password: ******
The system has been registered with ID: 1234-1234-1234-1234-1234
The registered system name is: ip-172-31-8-200.ap-northeast-2.compute.internal
[root@ip-172-31-8-200 ~]# subscription-manager status
+-------------------------------------------+
   System Status Details
+-------------------------------------------+
Overall Status: Registered

[root@ip-172-31-8-200 ~]# yum repolist
Updating Subscription Management repositories.
repo id                                                      repo name
rhel-10-for-x86_64-appstream-rpms                            Red Hat Enterprise Linux 10 for x86_64 - AppStream (RPMs)
rhel-10-for-x86_64-baseos-rpms                               Red Hat Enterprise Linux 10 for x86_64 - BaseOS (RPMs)
```
   
# 참고 자료
* [https://docs.redhat.com/ko/documentation/red_hat_enterprise_linux/8/html/creating_customized_images_by_using_insights_image_builder/index](https://docs.redhat.com/ko/documentation/red_hat_enterprise_linux/8/html/creating_customized_images_by_using_insights_image_builder/index)   