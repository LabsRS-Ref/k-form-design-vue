/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-04 09:11:42
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : \k-form-design-vue\babel.config.js
 * @LastEditTime : 2022-03-17 09:16:14
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 */
module.exports = {
  presets: ["@vue/babel-preset-app"],
  // 按需加载
  plugins: [
    // "@babel/plugin-transform-member-expression-literals",
    // "@babel/plugin-transform-property-literals",
    // // "@babel/plugin-transform-object-assign",
    // "@babel/plugin-proposal-object-rest-spread",

    // // 特性开启：支持类属性 https://babeljs.io/docs/en/babel-plugin-proposal-class-properties
    // "@babel/plugin-proposal-class-properties",

    // // 特性开启：支持类静态代码块 https://babeljs.io/docs/en/babel-plugin-proposal-class-static-block
    // "@babel/plugin-proposal-class-static-block",

    // // 特性开启：支持类私有属性 https://babeljs.io/docs/en/babel-plugin-proposal-private-property-in-object
    // ["@babel/plugin-proposal-private-property-in-object", { loose: true }],

    // // 特性开启：支持类私有函数 https://babeljs.io/docs/en/babel-plugin-proposal-private-methods
    // ["@babel/plugin-proposal-private-methods", { loose: true }],

    // // 特性开启：支持装饰器
    // [
    //   "@babel/plugin-proposal-decorators",
    //   {
    //     decoratorsBeforeExport: true,
    //     legacy: false
    //   }
    // ],
    // // "@babel/plugin-proposal-export-default-from",

    // // 特性开启：支持链式语法 ？问号形式 https://babeljs.io/docs/en/babel-plugin-proposal-optional-chaining
    // "@babel/plugin-proposal-optional-chaining",

    // // 特性开启：支持空值合并计算 https://babeljs.io/docs/en/babel-plugin-proposal-nullish-coalescing-operator
    // "@babel/plugin-proposal-nullish-coalescing-operator",

    // // 特性开启：支持部分参数应用 https://babeljs.io/docs/en/babel-plugin-proposal-partial-application
    // "@babel/plugin-proposal-partial-application",

    // // 特性开启：支持throw 表达式方式 https://babeljs.io/docs/en/babel-plugin-proposal-throw-expressions
    // "@babel/plugin-proposal-throw-expressions",

    // // 特性开启：支持数字使用下划线分割方式 @babel/plugin-proposal-numeric-separator
    // "@babel/plugin-proposal-numeric-separator",

    // // 特性开启：支持逻辑赋值 https://babeljs.io/docs/en/babel-plugin-proposal-logical-assignment-operators
    // "@babel/plugin-proposal-logical-assignment-operators",

    // // 特性开启：支持function.sent特性 https://babeljs.io/docs/en/babel-plugin-proposal-function-sent
    // "@babel/plugin-proposal-function-sent",

    // // 特性开启：支持::符号函数绑定特性 https://babeljs.io/docs/en/babel-plugin-proposal-function-bind
    // "@babel/plugin-proposal-function-bind",

    // "@babel/plugin-syntax-dynamic-import",

    [
      "babel-plugin-import", // 7.x 版本写法，如果是6.x版本应为：'import'
      {
        libraryName: "ant-design-vue",
        libraryDirectory: "es",
        style: true // 强制使用less
      },
      "ant-design-vue" // 可以直接使用 ant-design-vue 组件
    ]
  ]
};
