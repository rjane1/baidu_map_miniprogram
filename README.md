# Baidu-map-miniprogram

> Baidu-map-miniprogram

> 可实现功能：根据百度地图API获取地址经纬度信息；搜索、访达地址并更新经纬度。

## Build Setup

``` bash
# 运行项目准备工作
> 微信小程序：
  使用教程：https://gitchat.csdn.net/activity/5a93dd1719113f3d4bb9691d?utm_source=so
> 申请百度地图ak密钥：
  地址：http://lbsyun.baidu.com/index.php？title=%E9%A6%96%E9%A1%B5
  流程：注册 -> 登录 -> 控制台 ->创建应用，创建应用时，应用名称自定义，应用类型选择“微信小程序”，APPID为小程序的appId，然后提交。最终得到ak，将其粘贴至代码中相应位置即可。

```

## 接口
函数位置于/pages/map/map.js
（）

## 逆地址解析
函数位置于/pages/map/map.js

（此部分均被注释掉，wx.request()和bmap.regeocoding()分别为两种地址解析方法，但尚存运行问题，运用时可忽略）