/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-17 11:12:53
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/Cell/def.js
 * @LastEditTime : 2022-03-17 11:19:45
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 */
const def = {
  resizeScope: [
    "width",
    "height",
    "svg-size",
    "font-size",
    "line-height",
    "nesting-cell"
  ],
  defaultResizeScope: ["width", "height"],
  resizeFontStrategies: ["ratio", "fit", "auto"],
  defaultResizeFontStrategy: "ratio",
  nestingCellResizeStrategies: [
    "resize-wh",
    "resize-w",
    "resize-h",
    "resize-wh-ratio",
    "resize-w-ratio",
    "resize-h-ratio"
  ],
  defaultNestingCellResizeStrategy: "resize-wh",
  resizeScopeManipulation: ["assign", "intersect", "difference", "union"],
  supportResizeHookNames: [
    "beforeResizing",
    "afterResizing",
    "beforeResizeStop",
    "afterResizeStop",
    "beforeResizeCell",
    "afterResizeCell",
    "beforeRunAllResizeSteps",
    "beforeRunEachResizeStep",
    "afterRunEachResizeStep",
    "afterRunAllResizeSteps",
    "onResizeCellForEachNode"
  ],
  supportDraggableHookNames: [
    "beforeDragging",
    "afterDragging",
    "beforeDragStop",
    "afterDragStop",
    "beforeDragCell",
    "afterDragCell"
  ],
  instanceEventType: {
    cellResizeEnd: "cell-resize-end",
    cellResizeStart: "cell-resize-start",
    cellResizing: "cell-resizing",
    cellDragStart: "cell-drag-start",
    cellDragging: "cell-dragging",
    cellDragEnd: "cell-drag-end",
    dragging: "dragging",
    resizing: "resizing",
    resizestop: "resizestop",
    deactivated: "deactivated"
  }
};
export default def;
