---
layout: post
title: "[HACMP71] Force remove cluster"
description: " "
author: chhanz
date: 2014-07-25
tags: [aix, hacmp]
category: aix
---

# Force remove cluster - PowerHA 7.1
* * *

HACMP 7.1 에서 CAAVG 가 삭제가 안되면서, Cluster 를 제거 할 수 없는 경우가 있습니다.   
해당 이슈가 발생 할 경우, 아래와 같이 진행 하면 됩니다.   

```
# lspv | grep caavg
hdiskpower426   000000000r508909      caavg_private     active    

There is caavg so customer failed to create new HA cluster.                                                                                                       
To remove CAA cluster, run below command at both nodes.

# export CAA_FORCE_ENABLED=1; rmcluster -fr hdiskpower426 <<== hdisk no.           

which has CAAVG at each node.  
```

만약 위 방법으로 Cluster 제거가 안되었다면,

```
1. # dd if=/dev/zero of=/dev/hdiskpowerXXX bs=1024k count=100 (from one of the nodes. ex)node1 )                                                           
2. reboot both nodes.  
```

주로 첫번째 방법으로 해결되었습니다. :)
