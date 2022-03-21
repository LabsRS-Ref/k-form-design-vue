/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-21 13:47:29
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/VueDraggableResizableCell/steps/fix-inner-element-resize-issues.ts
 * @LastEditTime : 2022-03-21 20:04:55
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
    const ele = vdrCell.getCellElement();
    vdrCell.registerResizeStep("fix-inner-ele-resize-issue", () => {
      // 方便函数
      const _getNodeInfo = (key: string, context = {}, instance: IVDRCell = vdrCell) => {
        const nodeInfo = instance.getCellChildNodeInitInfoByKey(key);
        checkAssert(nodeInfo, "nodeInfo is not available", {
          context,
          instance,
        });
        return nodeInfo;
      };
  
      // 遍历内部元素
      // @ts-ignore
      forEachNode(ele, (htmlNode) => {
        const node = htmlNode as HTMLElement;
        debug("resizeCell-inner-ele-resize-issue", `${vdrCell._uid}`, node);
        // 检测是否为嵌套子Cell中的元素，
        // 如果是，根据处理策略是交由嵌套子Cell处理，还是直接不处理
        const nestingCell = vdrCell.getANestedLevel0ChildCell(node);
        if (nestingCell) {
          // 嵌套子Cell
          if (vdrCell.enableResizeNestingCell) {
            // T计算偏移，left, top 应该放到合适位置
            const { left, top } = nestingCell;
  
            // 计算尺寸
            const method = vdrCell.nestingCellResizeStrategy;
            const widths = [
              nestingCell.width + widthOffset,
              nestingCell.width,
              Math.floor(nestingCell.width * widthChangeRatio + 0.5),
            ];
            const heights = [
              nestingCell.height + heightOffset,
              nestingCell.height,
              Math.floor(nestingCell.height * heightChangeRatio + 0.5),
            ];
            const [_, width, height] = [
              [method === "resize-wh", widths[0], heights[0]],
              [method === "resize-w", widths[0], heights[1]],
              [method === "resize-h", widths[1], heights[0]],
              [method === "resize-wh-ratio", widths[2], heights[2]],
              [method === "resize-w-ratio", widths[2], heights[1]],
              [method === "resize-h-ratio", widths[1], heights[2]],
            ].filter(([m]) => m)[0];
            // 根据宽度和高度重新设位置及尺寸
            nestingCell.onResizingEvent(left, top, width, height, parent);
            // 注册自身子Cell的resize副作用事件
            vdrCell.registerResizeEffect(`nesting-cell-resize-effect-${nestingCell._uid}-${vdrCell._uid}`, () => {
              debug(`nesting-cell-resize-effect call`, `${nestingCell._uid}-${vdrCell._uid}`, {
                left,
                top,
                width,
                height,
                widthChangeRatio,
                heightChangeRatio,
              });
              // 计算新的left， top，width，height
              nestingCell.onResizeStopEvent(left, top, width, height);
            });
          }
          return;
        }

        // 内部有Button
        if (node?.nodeName === "BUTTON") {
          // @ts-ignore
          const key = node[(parent ?? vdrCell).privateMarkPropertyName];
          const nodeInfo = _getNodeInfo(key, { node, key }, parent ?? vdrCell);
          if (nodeInfo) {
            const { width: oldWidth, height: oldHeight } = nodeInfo.boundingClientRect;
            const newWidth = Math.floor(oldWidth * widthChangeRatio + 0.5);
            const newH = Math.floor(oldHeight * heightChangeRatio + 0.5);
            // eslint-disable-next-line no-param-reassign
            node.style.width = `${newWidth}px`;
            node.style.height = `${newH}px`;
          }
        }

        // 内部含有SVG元素时，需要计算比例
        if (vdrCell.enableResizeSvgSize && node?.nodeName === "svg") {
          // @ts-ignore
          const key = node[vdrCell.privateMarkPropertyName];
          const nodeInfo = _getNodeInfo(key, { node, key });
          if (!nodeInfo.isRootNode) {
            // @ts-ignore
            // eslint-disable-next-line no-param-reassign
            node.style.zoom = changeRatio * parseFloat(nodeInfo.style.zoom || 1.0);
          }
        }
  
        // 更新font-size
        if (vdrCell.enableResizeFontSize) {
          if (node?.nodeName === "#text") {
            const { parentNode, nodeValue } = node;
            // @ts-ignore
            const key = parentNode[(parent ?? vdrCell).privateMarkPropertyName];
            const nodeInfo = _getNodeInfo(key, { node, key, parentNode }, parent ?? vdrCell);
            if (nodeInfo) {
              // 计算合适的字体大小
              const {
                // 使用初始化值，这样能保证整体字体大小符合常规模式
                initial: {
                  fontSize: initialFontSize,
                  cell: { width = 1, height = 1 },
                },
              } = nodeInfo;
  
              // 计算(勿要超过容器高度)
              const fitFontSize = fitTextToBox.px(
                nodeValue,
                // @ts-ignore
                parentNode.clientWidth,
                // @ts-ignore
                parentNode.clientHeight,
                vdrCell.getHTMLElementComputedStyle(parentNode, "font-family")
              );
              const ratioFontSize = Math.min(w / width, h / height) * initialFontSize;
  
              const strategy = vdrCell.resizeFontStrategy;
              const [_, fontSize] = [
                [strategy === "ratio", ratioFontSize],
                [strategy === "fit", fitFontSize],
                [strategy === "auto", Math.min(ratioFontSize, fitFontSize)],
              ].filter(([m]) => m)[0];
  
              debug(`update-font-size`, `${vdrCell._uid}`, {
                fontSize,
                ratioFontSize,
                fitFontSize,
                initialFontSize,
                width,
                height,
              });
              // @ts-ignore
              // eslint-disable-next-line no-param-reassign
              parentNode.style.fontSize = `${fontSize}px`;
            }
          }
  
          if (node?.nodeName === "INPUT") {
            // @ts-ignore
            const key = node[(parent ?? vdrCell).privateMarkPropertyName];
            const nodeInfo = _getNodeInfo(key, { node, key }, parent ?? vdrCell);
            if (nodeInfo) {
              // eslint-disable-next-line no-param-reassign
              node.style.fontSize = `${changeRatio * parseFloat(nodeInfo.fontSize)}px`;
            }
          }
        }
  
        // @ts-ignore
        onHooks.forEach((hook) => hook(vdrCell, node, w, h, changeRatio));
      });
  
      return () => {};
    });
  }
};