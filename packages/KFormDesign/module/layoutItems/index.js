/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-19 10:12:32
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/layoutItems/index.js
 * @LastEditTime : 2022-03-19 12:30:41
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 */

import baseClass from "./baseItem.vue";

// layouts
import cardLayout from "./layout/card";
import freeLayout from "./layout/free";
import gridLayout from "./layout/grid";
import tableLayout from "./layout/table";
import tabsLayout from "./layout/tabs";
// nodes
import baseNode from "./node/base";
import batchNode from "./node/batch";
import selectInputListNode from "./node/selectInputList";

export const layoutItems = {
  baseClass,
  layouts: {
    cardLayout,
    freeLayout,
    gridLayout,
    tableLayout,
    tabsLayout,
  },
  nodes: {
    baseNode,
    batchNode,
    selectInputListNode,
  },
};

export default layoutItems;
