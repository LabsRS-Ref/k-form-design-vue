/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-04 09:11:43
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/vue.config.js
 * @LastEditTime : 2022-03-17 10:21:31
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 */
const debug = process.env.NODE_ENV !== "production";
module.exports = {
  devServer: {
    // disableHostCheck: true
  },
  pages: {
    index: {
      // 页面入口
      entry: "examples/main.js",
      // 模板来源
      template: "public/index.html",
      // 输出文件名
      filename: "index.html"
    }
  },
  productionSourceMap: false,
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          "primary-color": "#13c2c2",
          // "primary-color": "#9867f7",
          "layout-color": "#9867f7"
          // "layout-color": "#ee88aa"
        },
        javascriptEnabled: true
      }
    }
  },
  configureWebpack: config => {
    // 开发环境配置
    if (debug) {
      config.devtool = "source-map";
    }
  }
};
