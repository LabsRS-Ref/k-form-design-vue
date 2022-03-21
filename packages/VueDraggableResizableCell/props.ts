/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-02-28 10:26:57
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 * @LastEditTime : 2022-03-21 21:57:24
 * @FilePath     : /k-form-design-vue/packages/VueDraggableResizableCell/props.ts
 * @Description  : Created by sunzhifeng, Please coding something here
 */

import DEF, {
  TResizeScope,
  TResizeFontStrategy,
  TNestingCellResizeStrategy,
  TResizeScopeManipulation,
} from "./def";
import { isFunction } from "./util";

const props = {
  /**
   * @description: 是否限制在被包裹的父元素容器内拖拽或者改变大小
   */
  constraintsInParent: {
    type: Boolean,
    default: () => false,
  },
  /**
   * @description: css 样式 class name
   */
  className: {
    type: String,
    default: "cell",
  },
  classNameVDR: {
    type: String,
    default: "vdr",
  },
  classNameDraggable: {
    type: String,
    default: "draggable",
  },
  classNameResizable: {
    type: String,
    default: "resizable",
  },
  classNameDragging: {
    type: String,
    default: "dragging",
  },
  classNameResizing: {
    type: String,
    default: "resizing",
  },
  classNameActive: {
    type: String,
    default: "active",
  },
  classNameHandle: {
    type: String,
    default: "handle",
  },
  /**
   * @description: 设置（相对）逻辑上的顶点坐标 x 的值
   * @type: {Number}
   * @default: 0
   * @summary 用于初始化位置
   */
  x: {
    type: Number,
    default: 0,
  },
  /**
   * @description: 设置（相对）逻辑上的顶点坐标 y 的值
   * @type: {Number}
   * @default: 0
   * @summary 用于初始化位置
   */
  y: {
    type: Number,
    default: 0,
  },
  /**
   * @description: z-index 值
   * @type: {Number | String}
   * @default: "auto"
   * @summary 用于初始化位置
   */
  z: {
    type: [String, Number],
    default: "auto",
    validator: (val: number | string) =>
      typeof val === "string" ? val === "auto" : val >= 0,
  },
  /**
   * @description: 设置Cell最小宽度
   * @type: {Number}
   * @default: 0
   */
  minWidth: {
    type: Number,
    default: 1,
    validator: (val: number) => val >= 1,
  },
  /**
   * @description: 设置Cell最小高度
   * @type: {Number}
   * @default: 0
   */
  minHeight: {
    type: Number,
    default: 1,
    validator: (val: number) => val >= 1,
  },
  /**
   * @description: 设置Cell 最大宽度
   * @type: {Number|null}
   * @default: null 未设置
   */
  maxWidth: {
    type: Number,
    default: null,
    validator: (val: number) => val >= 0,
  },
  /**
   * @description: 设置Cell 最大高度
   * @type: {Number|null}
   * @default: null 未设置
   */
  maxHeight: {
    type: Number,
    default: null,
    validator: (val: number) => val >= 0,
  },
  /**
   * @description: 是否可以拖拽
   * @type: {Boolean}
   * @default: true 可以拖拽
   */
  draggable: {
    type: Boolean,
    default: true,
  },
  /**
   * @description: 是否可以改变大小
   * @type: {Boolean}
   * @default: true 可以改变大小
   */
  resizable: {
    type: Boolean,
    default: true,
  },
  /**
   * @description: 改变大小的应用范围
   * @type: {Array}
   * @default: ["width","height"]
   * @see {@link DEF.defaultResizeScope}
   * @see {@link TResizeScope}
   */
  resizeScope: {
    type: Array,
    default: () => DEF.defaultResizeScope,
    validator: (val: any[]) => {
      return val.every((item) => {
        if (isFunction(item)) {
          DEF.resizeScope.includes(item());
        }
        if (DEF.resizeScope.includes(item as TResizeScope)) {
          return true;
        }
        return false;
      });
    },
  },
  /**
   * @description: 改变大小的数据的与默认值的运算方式
   * @type: {String}
   * @default: "assign"
   * @enum: ["assign","intersect","difference", "union"]
   * @see {@link DEF.resizeScopeManipulation}
   */
  resizeScopeManipulation: {
    type: String,
    default: () => "assign",
    validator: (val: string) => {
      return DEF.resizeScopeManipulation.includes(
        val as TResizeScopeManipulation
      );
    },
  },
  resizeFontStrategy: {
    type: String,
    default: () => "auto",
    validator: (val: string) => {
      return DEF.resizeFontStrategies.includes(val as TResizeFontStrategy);
    },
  },
  /**
   * @description: 嵌套Cell Resize的时候，采用的方式
   * @type: {String}
   * @default: @DEF.defaultNestingCellResizeStrategy
   * @see {@link DEF.nestingCellResizeStrategies}
   */
  nestingCellResizeStrategy: {
    type: String,
    default: () => DEF.defaultNestingCellResizeStrategy,
    validator: (val: string) => {
      return DEF.nestingCellResizeStrategies.includes(
        val as TNestingCellResizeStrategy
      );
    },
  },
  /**
   * @description: resize 的钩子函数
   */
  resizeHooks: {
    type: Object,
    default: () => ({}),
    validator: (val: { [x: string]: any }) => {
      return Object.keys(val).every((key) => {
        return (
          typeof val[key] === "function" &&
          DEF.supportResizeHookNames.includes(key)
        );
      });
    },
  },
  /**
   * @description: 拖拽的钩子函数
   */
  draggableHooks: {
    type: Object,
    default: () => ({}),
    validator: (val: { [x: string]: any }) => {
      return Object.keys(val).every((key) => {
        return (
          typeof val[key] === "function" &&
          DEF.supportDraggableHookNames.includes(key)
        );
      });
    },
  },
  /**
   * @description: resize的时候是否保持宽高比
   * @type: {Boolean}
   * @default: false 不保持
   */
  lockAspectRatio: {
    type: Boolean,
    default: false,
  },
  /**
   * @description: 是否自动设置最小宽度
   * @type: {Boolean}
   * @default: true
   */
  autoMinWidthSet: {
    type: Boolean,
    default: true,
  },
  /**
   * @description: 是否自动设置最小高度
   * @type: {Boolean}
   * @default: true
   */
  autoMinHeightSet: {
    type: Boolean,
    default: true,
  },
  /**
   * @description: 重置Cell的 transition 属性的方式
   * @type: {String | Boolean}
   * @default: "none"
   */
  reserveCellTransition: {
    type: [String, Boolean],
    default: "none",
  },
  /**
   * @description: 绑定数据的属性名称, 用于解决存储原始数据
   * @type: {String}
   * @default: "__$cell_$id__"
   * @constant: 必须以 __$cell_ 字符串为开头
   */
  markPropertyName: {
    type: String,
    default: "__$cell_$id__",
    validator: (val: string) => {
      return val.trim() !== "" && val.trim().startsWith("__$cell_");
    },
  },
  /**
   * @description: Cell节点初始化的时候钩子函数
   */
  cellChildNodeInitInfoHooks: {
    type: Object,
    default: () => ({}),
    validator: (val: { [x: string]: any }) => {
      return Object.keys(val).every((key) => {
        return (
          typeof val[key] === "function" &&
          (key.startsWith("after") || key.startsWith("before"))
        );
      });
    },
  },
  /**
   * @description: Cell 节点监听的事件的钩子函数
   * @type: {Object}
   * @default: {}
   * @note: 可以监听的事件有: click, dblclick, mousedown, mouseup, mousemove, mouseenter, mouseleave, mouseover, mouseout, contextmenu, wheel, keydown, keypress, keyup, dragstart, drag, dragend, dragenter, dragleave, dragover, drop, touchstart, touchmove, touchend, touchcancel
   * @example:
   * {
   *  before_click: (e) => { log('before_click', e); },
   *  after_click: (e) => { log('after_click', e); }
   * }
   *
   */
  childrenListenerHooks: {
    type: Object,
    default: () => ({}),
    validator: (val: { [x: string]: any }) => {
      return Object.keys(val).every((key) => {
        return (
          typeof val[key] === "function" &&
          (key.startsWith("after_") || key.startsWith("before_"))
        );
      });
    },
  },
  /**
   * @description: 计算及更新布局的钩子函数，用于主逻辑处理完后，再调用
   * @type: {Function}
   * @default: () => {}
   */
  computeAndUpdateLayoutHook: {
    type: Function,
    default: () => {},
    validator: (val: any) => {
      return typeof val === "function";
    },
  },
  /**
   * @description: 提示信息，用于鼠标悬浮在Cell上的提示信息
   * @type: {String}
   * @default: ""
   */
  tip: {
    type: String,
    default: "",
  },
};

export default props;
