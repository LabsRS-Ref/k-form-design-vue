/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-28 10:17:03
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/layoutItems/components.js
 * @LastEditTime : 2022-03-28 10:23:48
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 */

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
// components
import toolBar from "./components/toolBar.vue";

export const layouts = {
  cardLayout,
  freeLayout,
  gridLayout,
  tableLayout,
  tabsLayout,
};

export const nodes = {
  baseNode,
  batchNode,
  selectInputListNode,
};

export const widgets = {
  toolBar,
};
