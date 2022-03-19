/* eslint-disable no-empty */
/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-18 11:42:28
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/.eslintrc.js
 * @LastEditTime : 2022-03-19 21:38:48
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 */

const def = (enable = 1, currentValue, restValue) => {
  const defaultValueMap = {
    Object: {},
    Array: [],
    Function: () => {},
  };

  let defaultValue;
  try {
    defaultValue =
      restValue === undefined
        ? defaultValueMap[currentValue.constructor.name]
        : restValue;
  } catch (error) {}

  return [1, true].includes(enable) ? currentValue : defaultValue;
};

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    /* 引入 eslint-config-airbnb-base 规则 */
    "airbnb-base",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "prettier",
    "plugin:prettier/recommended",
    "prettier/vue",
    "plugin:vue/essential",
    "@vue/prettier",
  ],
  plugins: ["prettier"],
  // add your custom rules here
  rules: {
    // eslint 对eslint 内置规则的定制
    ...def(1, {
      "no-unused-vars": "warn",
      "no-underscore-dangle": [0],
      "func-names": [0],
      "promise/param-names": [0],
    }),
    ...def(1, {
      "vue/no-v-model-argument": ["warn"],
      "vue/no-mutating-props": ["warn"],
      "vue/no-v-for-template-key-on-child": [0],
      "vue/no-v-for-template-key": [0],
    }),
    ...def(1, {
      "import/extensions": [0],
      "import/no-extraneous-dependencies": [0],
      "import/no-unresolved": [0],
    }),

    // prettier/prettier 对prettier规则的定制
    ...def(1, {
      "prettier/prettier": [
        "error",
        {
          // 使用 2 个空格缩进
          tabWidth: 2,
          // 不使用缩进符，而使用空格
          useTabs: false,
          // 行尾需要有分号
          semi: true,
          // 不使用单引号
          singleQuote: false,
          // 对象的 key 仅在必要时用引号
          quoteProps: "as-needed",
          // jsx 不使用单引号，而使用双引号
          jsxSingleQuote: false,
          // 末尾不需要逗号
          trailingComma: "es5",
          // 大括号内的首尾需要空格
          bracketSpacing: true,
          // jsx 标签的反尖括号需要换行
          jsxBracketSameLine: true,
          // 箭头函数，只有一个参数的时候，也需要括号
          arrowParens: "always",
          // 每个文件格式化的范围是文件的全部内容
          rangeStart: 0,
          rangeEnd: Infinity,
          // 不需要写文件开头的 @prettier
          requirePragma: false,
          // 不需要自动在文件开头插入 @prettier
          insertPragma: false,
          // 使用默认的折行标准
          proseWrap: "preserve",
          // 根据显示样式决定 html 要不要折行
          htmlWhitespaceSensitivity: "css",
          // 换行符使用 lf
          endOfLine: "lf",
        },
        {
          usePrettierrc: false,
        },
      ],
    }),

    // @typescript-eslint
    ...def(1, {
      "@typescript-eslint/no-var-requires": [0],
      "@typescript-eslint/no-empty-function": [0],
      "@typescript-eslint/no-explicit-any": [0],
      "@typescript-eslint/no-unused-vars": [0],
      "@typescript-eslint/explicit-module-boundary-types": [0],
    }),
  },
};
