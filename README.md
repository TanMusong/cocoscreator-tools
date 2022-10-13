# CocosCreator Tools
[![Node.js Package](https://github.com/TanMusong/cocoscreator-tools/actions/workflows/npm-publish-github-packages.yml/badge.svg)](https://github.com/TanMusong/cocoscreator-tools/actions/workflows/npm-publish-github-packages.yml)
[![NPM version](https://img.shields.io/npm/v/cocoscreator-tools.svg)](https://www.npmjs.com/package/cocoscreator-tools)

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

# 实验性功能，完善中
# 目前仅基于Windows 11系统下CocosCreator 2.4.8创建的简单的Android测试项目进行开发测试，不保证有效
cct apk <apk path> \ #cocos creator apk修改
        -out <output apk path> \
        -compress|-zip \ #可选，标记该js是否被压缩
        -xxtea <xxtea key> \
        -keystore <keystore path> \ #可选，不传将使用工具内debug.keystore
        -storepass <keystore password> \ #仅在传入-keystore时需要
        -alias <keystore alias> \ #仅在传入-keystore时需要
        -keypass <keystore alias password> \ #仅在传入-keystore时需要
        -log #修改log配置，用于release包强制打开日志
```