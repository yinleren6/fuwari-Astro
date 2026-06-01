---
title: Linux 搭建 iSCSI 服务器流程
published: 2026-06-01
tags:
  - Markdown
  - Blogging
  - 教程
  - linux
  - 系统
category: 知识
draft: true
---


# Linux 搭建 iSCSI 服务器流程

1.安装服务端程序 `target`

版本: `Debian 12.5`

```text-x-sh
sudo apt install targetcli-fb
```

2.检查磁盘信息

```text-plain
sudo lsblk	分区信息
sudo fdisk -l	磁盘信息
```

3.iscsi添加硬盘

```text-plain
进入子系统
sudo targetcli

列出虚拟菜单
ls
```

**添加虚拟共享硬盘**

```text-plain
/backstores/block create name=MyDisk(共享名称) dev=/dev/sda3(分区名称)
/backstores/block create name=Misaka-Storage dev=/dev/sda1
```

添加iscsi target资源

```text-plain
/iscsi create wwn=iqn.2024-06.com.example:server 格式为: [格式].[年份]-[月份].com.[自定义名称]
/iscsi create wwn=iqn.2025-09.com.moe:server 格式为: [格式].[年份]-[月份].com.[自定义名称]
```

设置访问控制表(ACL)

```text-plain
/iscsi/iqn.2024-06.com.moe:server/tpg1/acls create iqn.2025-09.com.moe:client  格式为: [名称]:[自定义名称]
/iscsi/iqn.2025-09.com.moe:server/tpg1/acls create iqn.2025-09.com.moe:client  格式为: [名称]:[自定义名称]
```

添加luns设备

```text-plain
/iscsi/iqn.2024-06.com.moe:server/tpg1/luns create /backstores/block/共享名称
/iscsi/iqn.2025-09.com.moe:server/tpg1/luns create /backstores/block/Misaka-Storage
```

设置iscsi服务端要监听的IP(网卡)

```text-plain
/iscsi/iqn.2024-06.com.moe:server/tpg1/portals create 0.0.0.0:3260	监听本地主机所有的网卡
/iscsi/iqn.2025-09.com.moe:server/tpg1/portals create 0.0.0.0:3260	监听本地主机所有的网卡
```

4.启动target服务

```text-plain
sudo systemctl enable rtslib-fb-targetctl
sudo systemctl restart rtslib-fb-targetctl
```

**Windows 添加ISCSI硬盘流程**

- 控制面板-→Windows工具-→服务
- 在Windows操作系统中已开启Microsoft iSCSI Initiator Service服务
- 控制面板-→Windows工具-→ISCSI发起工具
- 点击发现选项卡-→发现门户 输入服务器IP和端口
- 点击配置选项卡-→点击更改,填入发起程序名称
- 点击目标选项卡-→应该可以看到一条记录,点击连接
- 接下来打开控制面板-→Windows工具-→计算机管理-→磁盘管理--可以看到添加的硬盘