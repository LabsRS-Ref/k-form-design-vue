/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-21 20:08:50
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/VueDraggableResizableCell/steps/cell-self-resize.ts
 * @LastEditTime : 2022-03-24 21:28:42
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
  updateHTMLNodeStyle,
} from "../util";


const stepName = "cell-self-resize";

export default {
  install: (vdrCell: IVDRCell, options: IResizeStepOptions = {}) => {
    const {leftOffset = 0, topOffset = 0,  widthOffset = 0, heightOffset = 0, onHooks = [], parent = null } = options;

    const {
      left: wrapperInitialLeft,
      top: wrapperInitialTop,
      width: wrapperInitialWidth,
      height: wrapperInitialHeight,
      boundingClientRect: wrapperInitialClientRect,
    } = vdrCell.getWrapperInitialData();

    vdrCell.registerResizeStep(stepName, () => {
      // 获得当前节点的初始化尺寸
      const nodeInfo = vdrCell.getCellRootNodeInitInfo();
      const rect = nodeInfo.boundingClientRect;
      const { left: initialLeft, top: initialTop, width: initialWidth, height: initialHeight } = rect;

      const { left: wrapperBoundClientLeft, top: wrapperBoundClientTop } = wrapperInitialClientRect;
      const { borderLeftWidth, borderTopWidth } = vdrCell.getWrapperBorder();

      debug(`${stepName} ::begin`, `${vdrCell._uid}`, {
        initialLeft,
        initialTop,
        initialWidth,
        initialHeight,
      });

      const newLeft = Math.floor(initialLeft - wrapperBoundClientLeft + leftOffset - borderLeftWidth);
      const newTop = Math.floor(initialTop - wrapperBoundClientTop + topOffset - borderTopWidth);
      const newWidth = Math.floor(widthOffset + initialWidth);
      const newHeight = Math.floor(heightOffset + initialHeight);

      const leftExp = `${newLeft}px`;
      const topExp = `${newTop}px`;
      const widthExp = `${newWidth}px`;
      const heightExp = `${newHeight}px`;

      // 更新元素的style
      const ele = vdrCell.getCellElement();
      updateHTMLNodeStyle(ele, `left`, leftExp);
      updateHTMLNodeStyle(ele, `top`, topExp);
      updateHTMLNodeStyle(ele, `width`, widthExp);
      updateHTMLNodeStyle(ele, `height`, heightExp);

      // 更新元素的VNode
      const node = vdrCell.getCellVNode();
      updateVNodeStyle(node, `left`, leftExp);
      updateVNodeStyle(node, `top`, topExp);
      updateVNodeStyle(node, `width`, widthExp);
      updateVNodeStyle(node, `height`, heightExp);

      debug(`${stepName} ::end`, `${vdrCell._uid}`, {
        newLeft,
        newTop,
        newWidth,
        newHeight,
      });
    });
  }
};