/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-21 15:01:39
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/VueDraggableResizableCell/types.ts
 * @LastEditTime : 2022-03-21 15:03:46
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 */

import Vue, { VNode } from "vue";

export interface IVDRCell extends Vue {
  [key: string]: any;
}

export interface IResizeStepOptions {
  widthOffset?: number;
  heightOffset?: number;
  widthChangeRatio?: number;
  heightChangeRatio?: number;
  changeRatio?: number;
  w?: number;
  h?: number;
  onHooks?: any[];
  parent?: IVDRCell;
};
