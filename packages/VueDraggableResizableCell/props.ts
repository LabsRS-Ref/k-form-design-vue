/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-02-28 10:26:57
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 * @LastEditTime : 2022-04-01 14:02:05
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
   * @description: 初始化宽度
   * @type: {Number}
   * @default: 100
   */
  w: {
    type: Number,
    default: 0,
    validator: (val: number) => val >= 0,
  },
  /**
   * @description: 初始化高度
   * @type: {Number}
   * @default: 0
   */
  h: {
    type: Number,
    default: 0,
    validator: (val: number) => val >= 0,
  },
  /**
   * @description: 坐标轴
   * @type: {String}
   * @default: "both"
   */
  axis: {
    type: String,
    default: "both",
    validator: (val: string) => ["x", "y", "both"].includes(val),
  },
  /**
   * @description: 对齐网格尺寸
   * @type: {Array}
   * @default: [1, 1]
   */
  grid: {
    type: Array,
    default: () => [1, 1],
  },
  /**
   * @description: 比例
   * @type: {Number}
   * @default: 1
   */
  scale: {
    type: [Number, Array],
    default: 1,
    validator: (val: number | number[]) => {
      if (typeof val === "number") {
        return val > 0;
      }

      return val.length === 2 && val[0] > 0 && val[1] > 0;
    },
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
   * @description: 是否默认激活
   * @type: {Boolean}
   * @default: false
   */
  active: {
    type: Boolean,
    default: false,
  },
  /**
   * @description: 是否阻止被释放
   * @type: {Boolean}
   * @default: false
   */
  preventDeactivation: {
    type: Boolean,
    default: false,
  },
  /**
   * @description: 禁用用户选择
   * @type: {Boolean}
   * @default: true
   */
  disableUserSelect: {
    type: Boolean,
    default: true,
  },
  /**
   * @description: 原生拖拽是否可用
   * @type: {Boolean}
   * @default: false
   */
  enableNativeDrag: {
    type: Boolean,
    default: false,
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
   * @description: 判断是否可以触发拖拽开始, 交由外部使用者自行判断.
   * @note: 如果返回false, 则不会触发拖拽开始. 这个函数会直接破坏掉内部计算过程
   * @type: {Function}
   * @default: () => true
   */
  checkEnableDragStart: {
    type: [Function, null],
    default: null,
    validator: (val: any) => {
      return isFunction(val) || val === null;
    },
  },
  /**
   * @description: 判断是否可用继续Resize, 交由外部使用者自行判断
   * @type: {Function}
   * @default: () => true
   */
  checkEnableContinueResize: {
    type: [Function, null],
    default:
      (handle: any, left: number, top: number, width: number, height: number) =>
      () =>
        true,
    validator: (val: any) => {
      return isFunction(val) || val === null;
    },
  },
  /**
   * @description: 判断是否可用继续拖拽, 交由外部使用者自行判断
   * @type: {Function}
   * @default: () => true
   */
  checkEnableContinueDrag: {
    type: [Function, null],
    default: (left: number, top: number, width: number, height: number) => () =>
      true,
    validator: (val: any) => {
      return isFunction(val) || val === null;
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
  InnerNodeRawDataHooks: {
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
   * @description: wrapper 包裹元素的尺寸关键影响因子（元素）
   * 再计算最佳的包裹尺寸的时候，如果匹配到关键影响因子，则会计算关键影响因子的尺寸，并忽略其他元素的影响
   * @note 优先级说明：最重要的因子，放到数组的最前端，探测到最先匹配到的元素。（主要是受到父元素按次序查找子元素的算法影响）
   * @type {Array, Function}
   * @default: []
   */
  wrapperSizeKIFOfElements: {
    type: [Array, Function],
    default: () => [],
    validator: (val: any[]) => {
      if (isFunction(val)) {
        return true;
      }

      return (
        Array.isArray(val) &&
        val.every((item) => {
          return typeof item === "string" || isFunction(item);
        })
      );
    },
  },
  /**
   * @description: 初始化布局的钩子函数，用于主逻辑处理完后，再调用
   * @type: {Function}
   * @default: () => {}
   */
  initDefaultLayoutHook: {
    type: Function,
    default: () => {},
    validator: (val: any) => {
      return isFunction(val);
    },
  },
  /**
   * @description: 组件核心内部方法的一些Hooks操作
   * @example:
   */
  coreHooks: {
    type: Object,
    default: () => ({}),
    validator: (val: any) => {
      return Object.keys(val).every(
        (key) => isFunction(val[key]) || Array.isArray(val[key])
      );
    },
  },
  /**
   * @description: 观察元素变化的钩子函数，用于观察对象的变化，可以在这里做一些逻辑处理
   */
  observeHooks: {
    type: Object,
    default: () => ({}),
    validator: (val: { [x: string]: any }) => {
      return Object.keys(val).every((key) => {
        return (
          (Array.isArray(val[key]) || isFunction(val[key])) &&
          ["before", "on", "after"].includes(key)
          // (key.startsWith("after") || key.startsWith("before"))
        );
      });
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
