/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-21 15:59:15
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/VueDraggableResizableCell/steps/fix-transition-resize-issues.ts
 * @LastEditTime : 2022-03-29 09:19:28
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 */
// types
import Vue, { VNode } from "vue";
import { IVDRCell,  IResizeStepOptions } from "../types"

import {
  debug,
  checkAssert,
  forEachNode,
  updateVNodeStyle,
  updateHTMLNodeStyle,
} from "../util";


export default {
  install: (vdrCell: IVDRCell, options: IResizeStepOptions = {}) => {
    const { widthOffset = 0, heightOffset = 0, widthChangeRatio = 1, heightChangeRatio = 1, changeRatio = 1, w = 0, h = 0, onHooks = [], parent = null } = options;
    const ele = vdrCell.getCellElement();
    vdrCell.registerResizeStep(
      "fix-transition-issue",
      // @ts-ignore
      (_, { ele: element }) => {
        // 是否递归循环处理子节点
        const recursiveChildNodes = true;
        const rootHandle = () => {
          if (typeof vdrCell.reserveCellTransition === "boolean" && !vdrCell.reserveCellTransition) {
            // eslint-disable-next-line no-param-reassign
            element.style.transition = "none";
          } else if (typeof vdrCell.reserveCellTransition === "string") {
            // eslint-disable-next-line no-param-reassign
            element.style.transition = vdrCell.reserveCellTransition;
          }

          // 恢复内部元素的样式Resize前的样式
          return () => {
            if (!vdrCell.getCellOriginalStyle().transition) {
              // eslint-disable-next-line no-param-reassign
              element.style.transition = "";
            } else {
              // eslint-disable-next-line no-param-reassign
              element.style.transition = vdrCell.getCellOriginalStyle().transition;
            }
          };
        };
        const allChildNodesHandle = () => {
          forEachNode(ele, (htmlNode) => {
            const node = htmlNode as HTMLElement;
            let transition = "";
            if (typeof vdrCell.reserveCellTransition === "boolean" && !vdrCell.reserveCellTransition) {
              transition = "none";
            } else if (typeof vdrCell.reserveCellTransition === "string") {
              transition = vdrCell.reserveCellTransition;
            }

            //@ts-ignore
            const key = node[vdrCell.privateMarkPropertyName];
            const nodeInfo = vdrCell.getCellChildNodeInitInfoByKey(key);

            //@ts-ignore
            if (![undefined, null].includes(node.style?.transition)) {
              // eslint-disable-next-line no-param-reassign
              node.style.transition = transition;
            }

            return true;
          });

          return () => {
            forEachNode(ele, (htmlNode) => {
              const node = htmlNode as HTMLElement;
              //@ts-ignore
              const key = node[vdrCell.privateMarkPropertyName];
              const nodeInfo = vdrCell.getCellChildNodeInitInfoByKey(key);
              //@ts-ignore
              if (![undefined, null].includes(node?.style?.transition) && nodeInfo) {
                // eslint-disable-next-line no-param-reassign
                node.style.transition = nodeInfo?.style?.transition;
              }

              return true;
            });
          };
        };

        return recursiveChildNodes ? allChildNodesHandle() : rootHandle();
      },
      { ele }
    );
  }
};