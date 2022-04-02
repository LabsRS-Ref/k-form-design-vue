/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-01 10:24:28
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 * @LastEditTime : 2022-04-02 21:07:10
 * @FilePath     : /k-form-design-vue/packages/VueDraggableResizableCell/util.ts
 * @Description  : Created by sunzhifeng, Please coding something here
 */

import Vue, { VNode } from "vue";

/**
 * 判断是否为函数
 * @param func any 变量
 * @returns {boolean}
 */
export function isFunction(func: any): boolean {
  return (
    typeof func === "function" ||
    Object.prototype.toString.call(func) === "[object Function]"
  );
}

/**
 * 以一种尝试方式执行Hook
 * @param hooks Hook函数的数组
 * @param args Hook函数的参数 未知数量
 * @param options Hook函数参数，末尾参数
 * @param config 执行Hook的配置
 * @returns {boolean} 是否按要求执行了Hook，返回值用于其他用途
 * // TODO: 查看哪些地方需要用到这个函数
 */
export function tryRunHooks(
  hooks: any[],
  args: any[],
  options: any,
  config: {
    ignoreError?: boolean;
    ignoreNoTrusted?: boolean;
    ignoreReturn?: boolean;
  } = {
    ignoreError: true,
    ignoreReturn: false,
  }
): boolean {
  const cloneHooks = Array.from(hooks || []);

  if (cloneHooks.length === 0) {
    return true;
  }
  const hook = cloneHooks.shift();
  let res = true;
  if (isFunction(hook)) {
    try {
      res = hook(...args, options);
    } catch (e) {
      if (!config.ignoreError) {
        throw e;
      }
    }
    if (res === false && !config.ignoreReturn) {
      return false;
    }
  }
  return tryRunHooks(cloneHooks, args, options, config);
}

export function getBoundingClientRect(el: HTMLElement): DOMRect {
  if (el && isFunction(el.getBoundingClientRect)) {
    return el.getBoundingClientRect();
  }
  return DOMRect.fromRect();
}

export type TNodeOrVueInstance = Node | Vue | VNode | null;
export type TForEachNodeCallback1 = (
  node: TNodeOrVueInstance,
  index?: number,
  list?: TNodeOrVueInstance[] | NodeList,
  level?: number,
  parentNode?: TNodeOrVueInstance | null
) => boolean;

export type TForEachNodeCallback2 = (
  node: TNodeOrVueInstance,
  options: {
    index?: number;
    list?: TNodeOrVueInstance[] | NodeList;
    level?: number;
    parentNode?: TNodeOrVueInstance | null;
  }
) => boolean;

export type TForEachNodeCallback =
  | TForEachNodeCallback1
  | TForEachNodeCallback2;

export type TForEachNodeOptions = {
  deep?: boolean;
  levels?: any[];
  parent?: TNodeOrVueInstance;
};
/**
 * 方便函数：循环处理每一个节点(Node, Vue实例)
 * @param {Node | Vue} 节点对象，可以是标准的HTML Node节点，也可以是Vue实例
 * @param {function} callback 前置回调函数
 * @param {Object} options 选项
 */
export function forEachNode(
  currentNode: TNodeOrVueInstance = null,
  callback: TForEachNodeCallback = () => true,
  // options
  { deep = true, levels = [] as any[], parent = null }: TForEachNodeOptions = {}
): void {
  let canContinue = true;
  if (isFunction(callback)) {
    canContinue = callback(
      currentNode,
      0,
      [currentNode],
      levels.length - 1,
      parent
    );
  }

  // 无效节点或者不能继续循环
  if (!currentNode || !canContinue) return;

  // 循环处理子节点
  let childNodes: TNodeOrVueInstance[] | NodeList = [];
  if (currentNode instanceof Vue) {
    if ((currentNode as Vue).$vnode) {
      childNodes = (currentNode as Vue).$children;
    } else if ((currentNode as VNode).children) {
      childNodes = (currentNode as VNode)?.componentInstance?.$children || [];
    }
  } else if (currentNode instanceof Node) {
    childNodes = (currentNode as Node).childNodes;
  }

  levels.push(currentNode);
  (childNodes ?? []).forEach(
    (
      child: TNodeOrVueInstance,
      index: number,
      list: TNodeOrVueInstance[] | NodeList
    ) => {
      if (deep) {
        forEachNode(child, callback, {
          deep,
          levels,
          parent: currentNode as any,
        });
      } else if (isFunction(callback)) {
        callback(child, index, list, levels.length - 1, currentNode);
      }
    }
  );
}

/**
 * 获得未知节点上的Vue实例
 * @param {TNodeOrVueInstance} currentNode
 * @returns Vue | null | undefined
 */
export function getVueInstanceByUnknownNode(
  currentNode: TNodeOrVueInstance
): Vue | null | undefined {
  if (currentNode instanceof Vue) {
    if ((currentNode as Vue).$vnode) {
      return currentNode as Vue;
    }

    if ((currentNode as VNode).componentInstance) {
      return (currentNode as VNode).componentInstance;
    }

    return null;
  }

  if (currentNode instanceof Node) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return currentNode?.__vue__;
  }
  return null;
}

/**
 * 判断Vue实例对应的Node节点包含给定的子节点
 * @param vueInstance Vue实例
 * @param node 普通的HTML Node 节点
 * @returns {boolean}
 */
export function checkVueInstanceContainsNode(
  vueInstance: Vue,
  node: Node
): boolean {
  if (vueInstance.$el) {
    return vueInstance.$el.contains(node);
  }
  return false;
}

// 判断点是否在矩形内
export function isPointInRect(
  point: { x: number; y: number },
  rect: { x: number; y: number; width: number; height: number }
) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

// 判断点是否在BoundingClientRect内
export function isPointInDOMRect(
  point: { x: number; y: number },
  rect: DOMRect
) {
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  );
}

/**
 * 获得元素的偏移信息
 * @param el HTMLElement 元素
 * @returns DOMRect
 */
export function getOffsetRect(el: HTMLElement): DOMRect {
  if (el) {
    return new DOMRect(
      el.offsetLeft,
      el.offsetTop,
      el.offsetWidth,
      el.offsetHeight
    );
  }

  return new DOMRect();
}

export function getPageOffsetRect(el: HTMLElement): DOMRect {
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  if (el) {
    const rect = getBoundingClientRect(el);
    return new DOMRect(
      rect.left + scrollLeft,
      rect.top + scrollTop,
      rect.width,
      rect.height
    );
  }

  return new DOMRect();
}

/**
 * 获得元素相对于视口的坐标
 * @param el HTMLElement 元素
 * @returns { x: number; y: number }
 */
export function getOffset(el: HTMLElement): { x: number; y: number } {
  if (el && isFunction(el.getBoundingClientRect)) {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + document.body.scrollLeft,
      y: rect.top + document.body.scrollTop,
    };
  }
  return { x: 0, y: 0 };
}

/**
 * 判断是否为Vue Transition组件的tag Name
 * @param name string 变量
 * @returns
 */
export function isTransitionComponentName(name: string): boolean {
  return ["transition-group", "TransitionGroup"].includes(name);
}

/**
 * 判断是否是一个 Vue 内置的Transition组件
 * @param slots
 * @returns {boolean}
 */
export function isTransitionComponent(slots: any): boolean {
  if (!Array.isArray(slots)) {
    return false;
  }
  if (slots.length !== 1) {
    return false;
  }
  const [{ componentOptions }] = slots;
  if (!componentOptions) {
    return false;
  }
  const { tag } = componentOptions;
  return isTransitionComponentName(tag);
}

/**
 * 获得Video元素的控件尺寸
 * @param videoElement video 元素
 * @returns {{width: number, height:number}}
 * @summary This code will give you the dimensions of the video tag (not the dimensions of the video itself)
 */
export function getVideoControlDimensions(videoElement: HTMLVideoElement): {
  width: number;
  height: number;
} {
  if (videoElement) {
    return {
      width: videoElement.offsetWidth,
      height: videoElement.offsetHeight,
    };
  }
  return {
    width: 0,
    height: 0,
  };
}

/**
 * 获得正在播放的视频的尺寸
 * @param videoElement video 元素
 * @returns {{width: number, height:number}}
 */
export function getVideoDimensions(videoElement: HTMLVideoElement): {
  width: number;
  height: number;
} {
  if (videoElement) {
    return {
      width: videoElement.videoWidth,
      height: videoElement.videoHeight,
    };
  }
  return {
    width: 0,
    height: 0,
  };
}

/**
 * 创建一个 IntersectionObserver
 * @param element HTMLElement
 * @param observerHandler {Function}
 */
export function createIntersectionObserver(
  element: HTMLElement,
  observerHandler: (...args: any) => void
) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        observerHandler(element);
        observer.unobserve(element);
      }
    });
  });
  observer.observe(element);
}

/**
 * 添加监听事件
 * @param el HTMLElement
 * @param {string} event 事件类型
 * @param {function} handler 监听函数
 * @returns void
 */
export function addEvent(el: any, event: string, handler: () => void) {
  if (!el) {
    return;
  }
  if (el.attachEvent) {
    el.attachEvent(`on${event}`, handler);
  } else if (el.addEventListener) {
    el.addEventListener(event, handler, true);
  } else {
    // eslint-disable-next-line no-param-reassign
    el[`on${event}`] = handler;
  }
}

/**
 * 移除监听事件
 * @param el HTMLElement
 * @param {string} event 事件类型
 * @param {function} handler 监听函数
 * @returns void
 */
export function removeEvent(el: any, event: string, handler: () => void) {
  if (!el) {
    return;
  }
  if (el.detachEvent) {
    el.detachEvent(`on${event}`, handler);
  } else if (el.removeEventListener) {
    el.removeEventListener(event, handler, true);
  } else {
    // eslint-disable-next-line no-param-reassign
    el[`on${event}`] = null;
  }
}

/**
 * 获得文档的设置的字体大小
 * @summary This code will give you the font size of the document
 *  in pixels.
 * @default 16px = 1em = 16/16 = 1, 1em = 1rem = 16px
 * @returns {number}
 */
export function getDocumentElementFontSize(): number {
  return (
    parseFloat(window.getComputedStyle(document.documentElement).fontSize) ||
    16.0 // 16px as a default
  );
}

/**
 * rem 单位转换成 px
 * @param {number} rem 单位
 * @returns {number} px
 */
export function remToPx(rem: number): number {
  return rem * getDocumentElementFontSize();
}

/**
 * 获取文本的宽度
 * @param {string} text 文本
 * @param {string} font 字体
 * @returns {number}
 */
export function getTextWidth(text: string, font: string): number | never {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (context) {
    context.font = font;
    return context.measureText(text).width;
  }
  throw new Error("Canvas is not supported");
}

/**
 * 获得完全填充文本的字体大小
 * @param {string} text 文本
 * @param {number} clientHeight 容器高度
 * @param {number} clientWidth 容器宽度
 * @param {string} fontFamily 字体名称
 * @returns {string} 字体大小, 单位rem
 */
export function fitTextToBox(
  text = "",
  clientHeight = 0,
  clientWidth = 0,
  fontFamily = ""
): string {
  const factor = getDocumentElementFontSize();
  const bh = clientHeight / factor;
  const bw = clientWidth / factor;
  const fh = 1;
  const fw = getTextWidth(text, `${fh}rem ${fontFamily}`);
  const scaleFont = (2.0 * Math.sqrt(bh * bw)) / Math.sqrt(fw);
  const fontSize = `${scaleFont * fh}rem`;
  return fontSize;
}

// 方便函数调用
fitTextToBox.px = (...args: any[]) =>
  remToPx(parseFloat(fitTextToBox(...args)));

/**
 * 计算边界值
 * @param value 传入值
 * @param min 最小边界
 * @param max 最大边界
 * @returns {number} 返回严格的最小值和最大值
 */
export function restrictToBounds(value: number, min: number, max: number) {
  if (min !== null && value < min) {
    return min;
  }

  if (max !== null && max < value) {
    return max;
  }

  return value;
}

/**
 * 边界值刷选
 * @param {number[]} args 参考数值
 * @param {object} options 选项
 *    {boolean} selectMaxValue 是否选择最大值
 *    {number} maxValueOffset 最大值偏移量
 *    {number} minValueOffset 最小值偏移量
 * @returns {number}
 */
export function boundNumberFilter(
  args: number[],
  { selectMaxValue = true, maxValueOffset = 0, minValueOffset = 0 } = {}
): number {
  const fn = selectMaxValue ? Math.max : Math.min;
  return fn(
    Math.round(fn(...args) + maxValueOffset),
    Math.floor(fn(...args) + minValueOffset)
  );
}

// 内置链式调用函数
boundNumberFilter.max = (args: number[], options: any) =>
  boundNumberFilter(args, {
    ...options,
    selectMaxValue: true,
  });
// 内置链式调用函数
boundNumberFilter.min = (args: number[], options: any) =>
  boundNumberFilter(args, {
    ...options,
    selectMaxValue: false,
  });

/**
 * 赋值非空值
 * @param curValue 当前值
 * @param newValue 新值
 * @returns 合适的值
 */
export function assignNoNullValue(curValue = 0, newValue = 0) {
  return curValue !== newValue && newValue !== null ? newValue : curValue;
}

/**
 * 删除数组中的指定元素
 * @param list
 * @param ele
 */
export function splice(list: any[] = [], ele: any = undefined) {
  if (Array.isArray(list)) {
    const index = list.indexOf(ele);
    if (index > -1) {
      list.splice(index, 1);
    }
  }
}

/**
 * 断言
 * @param {boolean} condition 条件
 * @param {any[]} args 其他参数
 * @returns {void}
 */
export function checkAssert(condition: boolean, ...args: any[]): void {
  // eslint-disable-next-line no-console
  console.assert(condition, ...args);
}

export function checkToDo(condition: boolean, ...args: any[]): void {
  // eslint-disable-next-line no-console
  if (!condition) {
    console.warn("%c%s", "color:red", ...args);
  }
}

/**
 * 调试语句
 * @param args
 */
export function debug(group: string, ...args: any[]) {
  const filters: string[] = [];
  if (filters.includes(group)) return;
  // eslint-disable-next-line no-console
  console.log(`[${group}]☛`, ...args);
}

/**
 * 更新VNode data 样式数据
 * @param vnode
 * @param styleKey
 * @param styleValue
 */
export function updateVNodeStyle(
  vnode: VNode,
  styleKey: string,
  styleValue: string | number | boolean
) {
  // @ts-ignore
  const styleRef = vnode?.data?.style || {};
  if (typeof styleRef === "string") {
    if (vnode?.data?.style) {
      // @ts-ignore
      // eslint-disable-next-line no-param-reassign
      vnode.data.style = styleValue;
    }
  } else if (typeof styleRef === "object") {
    Object.assign(styleRef, { [styleKey]: styleValue });
  }
}

/**
 * 更新Node 样式数据
 * @param node
 * @param styleKey
 * @param styleValue
 */
export function updateHTMLNodeStyle(
  node: HTMLElement,
  styleKey: string,
  styleValue: string | number | boolean
) {
  // @ts-ignore
  const styleRef = node?.style || {};
  if (typeof styleRef === "string") {
    if (node?.style) {
      // @ts-ignore
      // eslint-disable-next-line no-param-reassign
      node.style = styleValue;
    }
  } else if (typeof styleRef === "object") {
    Object.assign(styleRef, { [styleKey]: styleValue });
  }
}
