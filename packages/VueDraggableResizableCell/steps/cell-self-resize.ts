/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-21 20:08:50
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/VueDraggableResizableCell/steps/cell-self-resize.ts
 * @LastEditTime : 2022-03-21 21:44:53
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 */
// types
import Vue, { VNode } from "vue";
import { IVDRCell,  IResizeStepOptions } from "../types"

import {
  debug,
  checkAssert,
  forEachNode,
  fitTextToBox,
} from "../util";


export default {
  install: (vdrCell: IVDRCell, options: IResizeStepOptions = {}) => {
    const { widthOffset = 0, heightOffset = 0, widthChangeRatio = 1, heightChangeRatio = 1, changeRatio = 1, w = 0, h = 0, onHooks = [], parent = null } = options;
    vdrCell.registerResizeStep("resize-cell-width-and-height", () => {
      const ele = vdrCell.getCellElement();
      const widthExp = `${w}px`;
      const heightExp = `${h}px`;
      if (ele.style.width !== widthExp) {
        ele.style.width = widthExp;
      }
      if (ele.style.height !== heightExp) {
        ele.style.height = heightExp;
      }
    });
  }
};