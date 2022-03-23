/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-02-28 10:25:12
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 * @LastEditTime : 2022-03-24 21:47:08
 * @FilePath     : /k-form-design-vue/packages/VueDraggableResizableCell/def.ts
 * @Description  : Created by sunzhifeng, Please coding something here
 */

/**
 * 定义Resize的作用范围
 */
export type TResizeScope =
  | "width"
  | "height"
  | "svg-size"
  | "font-size"
  | "line-height"
  | "inner-element-size"
  | "nesting-cell";

/**
 * 定义字体大小Resize的策略
 */
export type TResizeFontStrategy =
  | "ratio" // 按比例缩放
  | "fit" // FitToBox 模式下不换行
  | "auto"; // 取比例缩放及FitToBox模式下不换行的最小值

/**
 * 定义嵌套Cell的Resize的策略
 */
export type TNestingCellResizeStrategy =
  | "resize-wh" // 普通的 resize (步进方式)
  | "resize-w" // 步进方式，只改变宽度
  | "resize-h" // 步进方式，只改变高度
  | "resize-wh-ratio" // 宽高比例保持不变
  | "resize-w-ratio" // 宽度比例保持不变，只改变宽度
  | "resize-h-ratio"; // 高度比例保持不变，只改变高度

export type TResizeScopeManipulation =
  | "assign" // 直接赋值
  | "=" // 直接赋值
  | "union" // 求并集
  | "∪" // 求并集
  | "intersect" // 求交集
  | "∩" // 求交集
  | "difference" // 求差集
  | "∈"; // 求差集

const def = {
  /**
   * @description: 改变大小的应用范围
   */
  resizeScope: [
    "width",
    "height",
    "svg-size",
    "font-size",
    "line-height",
    "inner-element-size",
    "nesting-cell", // 嵌套单元同时可以resize
  ] as TResizeScope[],
  /** @description: 默认改变大小的应用范围 */
  defaultResizeScope: [
    "width",
    "height",
    "svg-size",
    "font-size",
    "line-height",
  ] as TResizeScope[],
  /** @description 支持的字体resize策略 */
  resizeFontStrategies: ["ratio", "fit", "auto"] as TResizeFontStrategy[],
  /** @description: 默认字体resize策略 */
  defaultResizeFontStrategy: "ratio" as TResizeFontStrategy,
  /** @description 支持的嵌套单元格resize方式 */
  nestingCellResizeStrategies: [
    "resize-wh",
    "resize-w",
    "resize-h",
    "resize-wh-ratio",
    "resize-w-ratio",
    "resize-h-ratio",
  ] as TNestingCellResizeStrategy[],
  defaultNestingCellResizeStrategy: "resize-wh" as TNestingCellResizeStrategy,
  /**
   * @description: 改变大小的数据的与默认值的运算方式
   * @type: {String}
   * @default: "assign"
   * @enum: ["assign","intersect","difference"]
   * @example: "assign" 直接赋值
   *           "intersect" 取交集
   *           "difference" 取差集
   *           "union" 取并集
   */
  resizeScopeManipulation: [
    "assign",
    "intersect",
    "difference",
    "union",
  ] as TResizeScopeManipulation[],
  // 支持的resize 钩子函数的名称
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
    "onResizeCellForEachNode",
  ],
  // 支持的拖拽钩子函数的名称
  supportDraggableHookNames: [
    "beforeDragging",
    "afterDragging",
    "beforeDragStop",
    "afterDragStop",
    "beforeDragCell",
    "afterDragCell",
  ],
  /**
   * @description: 内部事件类型，用于外部组件监听
   * @type: {Object}
   */
  internalEvent: {
    cellResizeEnd: "cellResizeEnd",
    cellResizeStart: "cellResizeStart",
    cellResizing: "cellResizing",
    cellDragStart: "cellDragStart",
    cellDragging: "cellDragging",
    cellDragEnd: "cellDragEnd",
    dragStart: "dragStart",
    dragging: "dragging",
    dragEnd: "dragEnd",
    resizing: "resizing",
    resizestop: "resizestop",
    activated: "activated",
    deactivated: "deactivated",
    // Vue 组件生命周期事件
    created: "created",
    mounted: "mounted",
    destroyed: "destroyed",
    updated: "updated",
    beforeCreate: "beforeCreate",
    beforeMount: "beforeMount",
    beforeDestroy: "beforeDestroy",
  },
};
export default def;
