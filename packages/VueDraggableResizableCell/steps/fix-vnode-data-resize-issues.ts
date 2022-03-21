/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-21 17:06:42
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/VueDraggableResizableCell/steps/fix-vnode-data-resize-issues.ts
 * @LastEditTime : 2022-03-21 17:25:52
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
    vdrCell.registerResizeStep("fix-root-vnode-data-issue", () => {
      // 更新内部元素的VNode
      const node = vdrCell.getCellVNode();
      if (node.data?.style?.width) {
        node.data.style.width = `${w}px`;
      }
      if (node.data?.style?.height) {
        node.data.style.height = `${h}px`;
      }
    });
  }
};