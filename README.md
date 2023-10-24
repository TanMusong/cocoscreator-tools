# CocosCreator Tools
[![Node.js Package](https://github.com/TanMusong/cocoscreator-tools/actions/workflows/npm-publish-github-packages.yml/badge.svg)](https://github.com/TanMusong/cocoscreator-tools/actions/workflows/npm-publish-github-packages.yml)
[![NPM version](https://img.shields.io/npm/v/cocoscreator-tools.svg)](https://www.npmjs.com/package/cocoscreator-tools)
Cocos Creator命令行工具集。

### Install
```bash
npm install -g cocoscreator-tools
```

### Usage
```bash
cct d|decrypt <jsc file path> #解密jsc
        -xxtea <xxtea key> \
        -compress|-zip #可选，标记该js是否被压缩

cct e|encrypt <js file path> \ #加密js
        -xxtea <xxtea key> \
        -compress|-zip #可选，标记该js是否被压缩

cct u2b <uuid> #uuid转base64
cct b2u <base64> #base64转uuid

# 以下为实验性功能，可能存在较多Bug，完善中
cct up|unpack <apk path> \ #apk解包
        -output <output apk assets path> \

cct p|pack <apk assets path> \ #apk打包
        -output <output apk path> \
        -keystore <keystore path> \ #可选，不传将使用工具内debug.keystore
        -storepass <keystore password> \ #仅在传入-keystore时需要
        -alias <keystore alias> \ #仅在传入-keystore时需要
        -keypass <keystore alias password> \ #仅在传入-keystore时需要

cct web <build out> \ #缩放Web构建后的图片，再在游戏中加载放大。用于发布对效果要求不高的广告情况下，压缩包体
        -resize-image <scale number>

# 保存默认配置，之后的命令未输入相关参数时使用默认配置
cct config set -xxtea|-keystore|-storepass|-alias|-keypass value
cct config set -compress true|false

cct config del -xxtea|-keystore|-storepass|-alias|-keypass|-compress # 删除默认配置
cct config get -xxtea|-keystore|-storepass|-alias|-keypass|-compress # 显示默认配置，不输入key则显示全部

```