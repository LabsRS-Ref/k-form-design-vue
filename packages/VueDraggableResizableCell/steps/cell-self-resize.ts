/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-21 20:08:50
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/VueDraggableResizableCell/steps/cell-self-resize.ts
 * @LastEditTime : 2022-03-22 21:36:54
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
  updateVNodeStyle,
} from "../util";


export default {
  install: (vdrCell: IVDRCell, options: IResizeStepOptions = {}) => {
    const { widthOffset = 0, heightOffset = 0, widthChangeRatio = 1, heightChangeRatio = 1, changeRatio = 1, w = 0, h = 0, onHooks = [], parent = null } = options;
    vdrCell.registerResizeStep("resize-cell-width-and-height", () => {
      const widthExp = `${w}px`;
      const heightExp = `${h}px`;

      // 更新元素的style
      const ele = vdrCell.getCellElement();
      if (ele?.style?.width && ele?.style?.width !== widthExp) {
        ele.style.width = widthExp;
      }
      if (ele?.style?.height && ele?.style?.height !== heightExp) {
        ele.style.height = heightExp;
      }

      // 更新元素的VNode
      const node = vdrCell.getCellVNode();
      updateVNodeStyle(node, `width`, widthExp);
      updateVNodeStyle(node, `height`, heightExp);
    });
  }
};