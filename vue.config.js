const debug = process.env.NODE_ENV !== 'production'
module.exports = {
  devServer: {
    disableHostCheck: true
  },
  pages: {
    index: {
      // 页面入口
      entry: "examples/main.js",
      // 模板来源
      template: "pubilc/index.html",
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
      config.devtool = 'source-map'
    }
  }
};
