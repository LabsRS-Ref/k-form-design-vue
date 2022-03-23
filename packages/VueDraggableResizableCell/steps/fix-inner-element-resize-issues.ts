/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-21 13:47:29
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/VueDraggableResizableCell/steps/fix-inner-element-resize-issues.ts
 * @LastEditTime : 2022-03-24 21:29:30
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

const stepName = "fix-inner-ele-resize-issue";

type TChangeFontSizeOptions = {
  vdrCell: IVDRCell;
  nodeInfo: any;
  node: ParentNode | null;
  nodeValue: string | null;
  w: number;
  h: number;
}

/** 通用改变字体大小的算法 */
function changeFontSize(options: TChangeFontSizeOptions) {
  const { nodeInfo, node, nodeValue, w, h, vdrCell } = options;
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
    node.clientWidth,
    // @ts-ignore
    node.clientHeight,
    vdrCell.getHTMLElementComputedStyle(node, "font-family")
  );
  const ratioFontSize = Math.min(w / width, h / height) * initialFontSize;

  const strategy = vdrCell.resizeFontStrategy;
  const [_, fontSize] = [
    [strategy === "ratio", ratioFontSize],
    [strategy === "fit", fitFontSize],
    [strategy === "auto", Math.min(ratioFontSize, fitFontSize)],
  ].filter(([m]) => m)[0];

  debug(`${stepName} ::${node?.nodeName}::begin`, `${vdrCell._uid}`, {
    ratioFontSize,
    fitFontSize,
    initialFontSize,
    width,
    height,
  });

  // @ts-ignore
  // eslint-disable-next-line no-param-reassign
  node.style.fontSize = `${fontSize}px`;

  // update vnode
  const { vnode } = nodeInfo;
  updateVNodeStyle(vnode, `fontSize`, `${fontSize}px`);

  debug(`${stepName} ::${node?.nodeName}::end`, `${vdrCell._uid}`, {
    fontSize,
  });
}

export default {
  install: (vdrCell: IVDRCell, options: IResizeStepOptions = {}) => {
    const { leftOffset = 0, topOffset = 0, widthOffset = 0, heightOffset = 0, widthChangeRatio = 1, heightChangeRatio = 1, changeRatio = 1, w = 0, h = 0, onHooks = [], parent = null } = options;
    const ele = vdrCell.getCellElement();
    const {
      left: wrapperInitialLeft,
      top: wrapperInitialTop,
      width: wrapperInitialWidth,
      height: wrapperInitialHeight,
      boundingClientRect: wrapperInitialClientRect,
    } = vdrCell.getWrapperInitialData();


    // 注册resize步骤
    vdrCell.registerResizeStep(stepName, () => {
      // 方便函数
      const _getNodeInfo = (key: string, context = {}, instance: IVDRCell = vdrCell) => {
        const nodeInfo = instance.getCellChildNodeInitInfoByKey(key);
        checkAssert(nodeInfo, "nodeInfo is not available", {
          context,
          instance,
        });
        debug("_getNodeInfo", `${instance._uid}`, { nodeInfo });
        return nodeInfo;
      };
  
      // 遍历内部元素
      // @ts-ignore
      forEachNode(ele, (htmlNode) => {
        const node = htmlNode as HTMLElement;
        debug(`${stepName} ::begin`, `${vdrCell._uid} - {nodeName=${node?.nodeName}}`, node);
        // 检测是否为嵌套子Cell中的元素，
        // 如果是，根据处理策略是交由嵌套子Cell处理，还是直接不处理
        const nestingCell = vdrCell.getANestedLevel0ChildCell(node);
        if (nestingCell) {
          // 嵌套子Cell
          if (vdrCell.enableResizeNestingCell) {
            // T计算偏移，left, top 应该放到合适位置
            const { left, top } = nestingCell;
  
            // 计算尺寸
            const strategy = vdrCell.nestingCellResizeStrategy;
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

            // 根据不同的策略，计算宽度和高度
            const [_, width, height] = [
              [strategy === "resize-wh", widths[0], heights[0]],
              [strategy === "resize-w", widths[0], heights[1]],
              [strategy === "resize-h", widths[1], heights[0]],
              [strategy === "resize-wh-ratio", widths[2], heights[2]],
              [strategy === "resize-w-ratio", widths[2], heights[1]],
              [strategy === "resize-h-ratio", widths[1], heights[2]],
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

        // 执行过程中，可以hook一些逻辑
        // @ts-ignore
        const canContinue = onHooks.some((hook) => hook(vdrCell, node, options));
        if (!canContinue) {
          // return;
        }

        // 内部有Button
        if (node?.nodeName === "BUTTON") {
          // @ts-ignore
          const key = node[(parent ?? vdrCell).privateMarkPropertyName];
          const nodeInfo = _getNodeInfo(key, { node, key }, parent ?? vdrCell);
          if (nodeInfo) {
            const { left: initialLeft, top: initialTop, width: initialWidth, height: initialHeight } = nodeInfo.boundingClientRect;

            const { left: wrapperBoundClientLeft, top: wrapperBoundClientTop } = wrapperInitialClientRect;
            const { borderLeftWidth, borderTopWidth, borderRightWidth, borderBottomWidth } = vdrCell.getWrapperBorder();

            // TODO：位置偏移计算
            const newLeft = Math.floor(initialLeft - wrapperBoundClientLeft + leftOffset - borderLeftWidth);
            const newTop = Math.floor(initialTop - wrapperBoundClientTop + topOffset - borderTopWidth);
            const newWidth = Math.floor(widthOffset + initialWidth);
            const newHeight = Math.floor(heightOffset + initialHeight);

            // 判断不处理的条件
            // TODO: 需要考虑left top 的条件
            // const conditions = [
            //   [initialWidth === newWidth, initialHeight === newHeight].every((m) => !!m), // 宽高没有变化
            //   [newWidth === 0, newHeight === 0].some((m) => !!m), // 任何为0的都不处理
            // ]

            // if (conditions.some((m) => !!m)) {
            //   debug(`${stepName} ::${node?.nodeName}::skip`, `${vdrCell._uid}`, node);
            //   return;
            // }

            debug(`${stepName} ::${node?.nodeName}::begin`, `${vdrCell._uid}`, {
              initialLeft,
              initialTop,
              initialWidth,
              initialHeight,
              leftOffset,
              topOffset,
              widthOffset,
              heightOffset,
              nodeInfo,
              node,
            });

            // eslint-disable-next-line no-param-reassign
            updateHTMLNodeStyle(node, `left`, `${newLeft}px`);
            updateHTMLNodeStyle(node, `top`, `${newTop}px`);
            updateHTMLNodeStyle(node, `width`, `${newWidth}px`);
            updateHTMLNodeStyle(node, `height`, `${newHeight}px`);

            // update vnode
            const { vnode } = nodeInfo;
            updateVNodeStyle(vnode, `left`, `${newLeft}px`);
            updateVNodeStyle(vnode, `top`, `${newTop}px`);
            updateVNodeStyle(vnode, `width`, `${newWidth}px`);
            updateVNodeStyle(vnode, `height`, `${newHeight}px`);

            debug(`${stepName} ::${node?.nodeName}::end`, `${vdrCell._uid}`, {
              newLeft,
              newTop,
              newWidth,
              newHeight,
              nodeInfo,
              node,
            })
          }
        }

        // 内部含有SVG元素时，需要计算比例
        if (vdrCell.enableResizeSvgSize && node?.nodeName === "svg") {
          // @ts-ignore
          const key = node[vdrCell.privateMarkPropertyName];
          const nodeInfo = _getNodeInfo(key, { node, key });
          if (!nodeInfo.isRootNode) {
            const newZoom = changeRatio * parseFloat(nodeInfo?.style?.zoom ?? 1.0);

            // 判断不处理的条件
            const conditions = [
              [newZoom === 0].some((m) => !!m), // 任何为0的都不处理
            ]

            if (conditions.some((m) => !!m)) {
              debug(`${stepName} ::${node?.nodeName}::skip`, `${vdrCell._uid}`, node);
              return;
            }

            debug(`${stepName} ::${node?.nodeName}::begin`, `${vdrCell._uid}`, {
              oldZoom: parseFloat(nodeInfo?.style?.zoom ?? 1.0),
              newZoom,
              changeRatio,
              nodeInfo,
            });

            // @ts-ignore
            // eslint-disable-next-line no-param-reassign
            node.style.zoom = newZoom;

            // update vnode
            const { vnode } = nodeInfo;
            updateVNodeStyle(vnode, `zoom`, newZoom);

            debug(`${stepName} ::${node?.nodeName}::end`, `${vdrCell._uid}`, {
              newZoom,
              changeRatio,
              nodeInfo,
            });
          }
        }
  
        // 更新font-size
        if (vdrCell.enableResizeFontSize && ["#text", "INPUT"].includes(node?.nodeName)) {
          switch (node?.nodeName) {
            case "#text":
              {
                const { parentNode, nodeValue } = node;
                // @ts-ignore
                const key = parentNode[(parent ?? vdrCell).privateMarkPropertyName];
                const nodeInfo = _getNodeInfo(key, { node, key, parentNode }, parent ?? vdrCell);
    
                changeFontSize({
                  nodeInfo,
                  nodeValue,
                  node: parentNode,
                  vdrCell,
                  w,
                  h,
                });
              };
              break;
            case "INPUT":
              {
                // @ts-ignore
                const key = node[(parent ?? vdrCell).privateMarkPropertyName];
                const nodeInfo = _getNodeInfo(key, { node, key }, parent ?? vdrCell);

                changeFontSize({
                  nodeInfo,
                  nodeValue: node?.nodeValue,
                  node,
                  vdrCell,
                  w,
                  h,
                });
              };
              break;

            default:
              break;
          }
        }

        debug(`${stepName} ::end`, `${vdrCell._uid} - {nodeName=${node?.nodeName}}`, node);
      });

      return () => {};
    });
  }
};