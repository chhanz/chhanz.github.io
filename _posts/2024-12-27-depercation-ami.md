---
layout: post
title: "[AWS] Deprecation AMI 찾기"
description: ""
author: chhanz
date: 2024-12-27
tags: [aws]
category: aws
---

# Deprecation AMI 찾기

```bash
$ aws ec2 describe-images --include-deprecated \
--query 'sort_by(Images, &CreationDate)[*].[CreationDate,Name,ImageId]' \
--filters "Name=name,Values=amzn*" --output table
----------------------------------------------------------------------------------------------------------
|                                             DescribeImages                                             |
+---------------------------+---------------------------------------------------+------------------------+
|  2015-11-20T23:21:42.000Z|  amzn-ami-vpc-nat-hvm-2015.09.1.x86_64-ebs         |  ami-4118d72f          |
|  2015-12-03T00:10:27.000Z|  amzn-ami-hvm-2015.09.1.x86_64-ebs                 |  ami-259b554b          |
|  2015-12-03T00:22:59.000Z|  amzn-ami-hvm-2015.09.1.x86_64-gp2                 |  ami-249b554a          |
|  2016-02-10T22:18:15.000Z|  amzn-ami-hvm-2015.09.2.x86_64-s3                  |  ami-871fd1e9          |
|  2016-02-10T22:19:34.000Z|  amzn-ami-hvm-2015.09.2.x86_64-gp2                 |  ami-4d1fd123          |
|  2016-03-16T23:46:38.000Z|  amzn-ami-hvm-2016.03.0.x86_64-gp2                 |  ami-6598510b          |
|  2016-03-16T23:46:41.000Z|  amzn-ami-vpc-nat-hvm-2016.03.0.x86_64-ebs         |  ami-0199506f          |
|  2016-04-30T00:36:05.000Z|  amzn-ami-hvm-2016.03.1.x86_64-gp2                 |  ami-cf32faa1          |
|  2016-06-03T23:18:45.000Z|  amzn-ami-hvm-2016.03.2.x86_64-s3                  |  ami-a7ed26c9          |
|  2016-06-03T23:19:29.000Z|  amzn-ami-hvm-2016.03.2.x86_64-ebs                 |  ami-a8ed26c6          |
|  2016-06-03T23:19:33.000Z|  amzn-ami-hvm-2016.03.2.x86_64-gp2                 |  ami-69e92207          |
|  2016-06-22T11:08:29.000Z|  amzn-ami-hvm-2016.03.3.x86_64-s3                  |  ami-d4408bba          |
```

# 참고 - RHEL 이전 버전 AMI 찾기
```bash
$ aws ec2 describe-images --owners 309956199498 \
--query 'sort_by(Images, &CreationDate)[*].[CreationDate,Name,ImageId]' \
--filters "Name=name,Values=RHEL-7*" --region ap-northeast-2 --output table --include-deprecated
----------------------------------------------------------------------------------------------------------
|                                             DescribeImages                                             |
+---------------------------+---------------------------------------------------+------------------------+
|  2016-01-15T00:03:42.000Z |  RHEL-7.1_HVM-20150803-x86_64-1-Hourly2-GP2       |  ami-86c10fe8          |
|  2016-01-15T02:01:38.000Z |  RHEL-7.2_HVM_GA-20151112-x86_64-1-Hourly2-GP2    |  ami-44db152a          |
|  2016-01-19T15:51:54.000Z |  RHEL-7.0_HVM_GA-20150209-x86_64-1-Hourly2-GP2    |  ami-c3c10fad          |
|  2016-02-20T03:50:40.000Z |  RHEL-7.2_HVM-20160219-x86_64-2-Hourly2-GP2       |  ami-872be5e9          |
|  2016-03-02T16:08:46.000Z |  RHEL-7.2_HVM-20160301-x86_64-3-Hourly2-GP2       |  ami-d35d93bd          |
|  2016-11-07T17:36:11.000Z |  RHEL-7.3_HVM_GA-20161026-x86_64-1-Hourly2-GP2    |  ami-6447930a          |
|  2016-11-30T00:49:10.000Z |  RHEL-7.2_HVM-20161025-x86_64-1-Hourly2-GP2       |  ami-a9e532c7          |
|  2017-04-25T00:48:46.000Z |  RHEL-7.3_HVM-20170424-x86_64-1-Hourly2-GP2       |  ami-5346943d          |
|  2017-05-15T17:18:39.000Z |  RHEL-7.3_HVM-20170424-x86_64-2-Hourly2-GP2       |  ami-a33ce1cd          |
|  2017-05-18T18:54:26.000Z |  RHEL-7.4_HVM_Beta-20170518-x86_64-1-Hourly2-GP2  |  ami-a15588cf          |
|  2017-06-14T21:13:38.000Z |  RHEL-7.3_HVM-20170613-x86_64-4-Hourly2-GP2       |  ami-908f50fe          |
|  2017-07-24T15:58:10.000Z |  RHEL-7.4_HVM_GA-20170724-x86_64-1-Hourly2-GP2    |  ami-7d964f13          |
|  2017-08-08T15:57:23.000Z |  RHEL-7.4_HVM_GA-20170808-x86_64-2-Hourly2-GP2    |  ami-0f5a8361          |
|  2018-01-04T02:30:47.000Z |  RHEL-7.4_HVM-20180103-x86_64-2-Hourly2-GP2       |  ami-26f75748          |
|  2018-01-22T17:41:31.000Z |  RHEL-7.4_HVM-20180122-x86_64-1-Hourly2-GP2       |  ami-90a201fe          |
|  2018-01-23T02:53:53.000Z |  RHEL-7.5_Beta_HVM-20180116-x86_64-2-Hourly2-GP2  |  ami-87b310e9          |
|  2018-03-23T21:01:17.000Z |  RHEL-7.5_HVM_GA-20180322-x86_64-1-Hourly2-GP2    |  ami-3eee4150          |
|  2018-08-15T15:34:15.000Z |  RHEL-7.5_HVM-20180813-x86_64-0-Hourly2-GP2       |  ami-0d226f15e3e46903a |
|  2018-08-16T18:58:00.000Z |  RHEL-7.6_HVM_BETA-20180814-x86_64-0-Hourly2-GP2  |  ami-063e3f34265b0856f |
|  2018-10-17T13:32:34.000Z |  RHEL-7.6_HVM_GA-20181017-x86_64-0-Hourly2-GP2    |  ami-07be38aae5985872f |
|  2019-02-06T00:14:04.000Z |  RHEL-7.6_HVM_GA-20190128-x86_64-0-Hourly2-GP2    |  ami-041b16ca28f036753 |
|  2019-05-15T17:00:56.000Z |  RHEL-7.6_HVM-20190515-x86_64-0-Hourly2-GP2       |  ami-0428adb59828114c2 |
|  2019-06-05T08:46:10.000Z |  RHEL-7.7_HVM_BETA-20190530-x86_64-1-Hourly2-GP2  |  ami-047d17217b03026be |
|  2019-06-18T20:00:06.000Z |  RHEL-7.6_HVM-20190618-x86_64-0-Hourly2-GP2       |  ami-0f84aff229263c1fc |
|  2019-07-24T09:08:23.000Z |  RHEL-7.7_HVM_GA-20190723-x86_64-1-Hourly2-GP2    |  ami-0b5425629eb18a008 |
|  2019-09-23T13:37:03.000Z |  RHEL-7.7_HVM-20190923-x86_64-0-Hourly2-GP2       |  ami-0708fd0ae9a663e02 |
|  2019-10-21T11:53:58.000Z |  RHEL-7.8_HVM_BETA-20191009-x86_64-6-Hourly2-GP2  |  ami-01231df628b9e3538 |
```
   
# 참고 문서
* [https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ami-deprecate.html#describe-deprecate-ami](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ami-deprecate.html#describe-deprecate-ami)   
* [Red Hat Enterprise Linux Images (AMI) Available on Amazon Web Services (AWS)](https://access.redhat.com/solutions/15356)