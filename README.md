# 表单设计器 k-form-design

[Open in Replit.com](https://replit.com/@lauer3912/k-form-design-vue-1)

## 简介

设计器布局参考form-generator项目，基于vue和ant-design-vue实现的表单设计器，样式使用less作为开发语言，主要功能是能通过简单操作来生成配置表单，生成可保存的JSON数据，并能将JSON还原成表单，使表单开发更简单更快速

注：该项目不兼容vue3.0项目，暂无后续兼容vue3.0的计划


## 特性
- 可视化配置页面
- 提供栅格、表格等布局
- 布局嵌套使用
- 提供预览、保存、生成json、生成可执行代码等操作
- 支持表单验证
- 快速获取表单数据
- 自定义组件插入
- 自定义主题色

## 组件
- KFormDesign 表单设计器（基于可视化操作快速设计出表单页面，生成配置json或页面）
- KFormBuild 表单构建器（根据设计器中获取的配置json数据，快速构建出表单页面）



## 安装
```cmd
# 使用yarn 
yarn add k-form-design

# 使用npm 
npm i k-form-design --save
```

## 引入组件
``` javascript
// 在main.js引入

import KFormDesign from 'k-form-design'
import 'k-form-design/lib/k-form-design.css'
Vue.use(KFormDesign)
```

## 使用组件
``` html
<template>
  <div>
   <k-form-design />
  </div>
</template>
```


License
---
[MIT](https://github.com/Kchengz/k-form-design/blob/master/LICENSE)
Copyright (c) 2019 Kchengz

