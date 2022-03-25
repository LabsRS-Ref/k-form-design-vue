/* eslint-disable @typescript-eslint/ban-ts-comment */
/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-04 16:48:38
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 * @LastEditTime : 2022-03-25 19:00:22
 * @FilePath     : /k-form-design-vue/packages/VueDraggableResizableCell/index.ts
 * @Description  : Created by sunzhifeng, Please coding something here
 */
import { createLazyLoadDirective } from "./directives";
// @ts-ignore
import Cell from "./Cell.vue";
import * as util from "./util";

export function install(Vue: any) {
  // @ts-ignore
  if (install?.installed) {
    return;
  }
  // eslint-disable-next-line no-param-reassign
  // @ts-ignore
  install.installed = true;
  Vue.component(Cell.name, Cell);
}

export const utils = util;
export const directives = {
  createLazyLoadDirective,
};

// default export
export default Cell;
