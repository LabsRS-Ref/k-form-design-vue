/* eslint-disable camelcase, no-unused-vars */
<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-02-14 15:21:25
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 * @LastEditTime : 2022-03-18 15:10:11
 * @FilePath     : /k-form-design-vue/packages/VueDraggableResizableCell/index.vue
 * @Description  : Created by sunzhifeng, Please coding something here
-->
<template>
  <!--  可拖拽的按钮，要自适应元素 -->
  <VueDraggableResizable
    v-lazy-load
    :x="left"
    :y="top"
    :z="z"
    :w="width"
    :h="height"
    :min-width="minWidth"
    :min-height="minHeight"
    :max-width="maxWidth"
    :max-height="maxHeight"
    :class="[className, { [className + '-tip']: tip.trim().length > 0 }]"
    :class-name="classNameVDR"
    :class-name-draggable="classNameDraggable"
    :class-name-dragging="classNameDragging"
    :class-name-resizable="classNameResizable"
    :class-name-resizing="classNameResizing"
    :class-name-active="classNameActive"
    :class-name-handle="classNameHandle"
    :data-tip="tip"
    :handles="handlesSet"
    :draggable="draggable"
    :resizable="enableResize"
    :lock-aspect-ratio="isLockAspectRatio"
    :on-resize-start="checkAllowResizeStart"
    :on-resize="checkAllowContinueResize"
    :on-drag-start="checkAllowDragStart"
    :on-drag="checkAllowContinueDrag"
    :parent="constraintsInParent"
    @dragging="onDraggingEvent"
    @resizing="onResizingEvent"
    @resizestop="onResizeStopEvent"
    @activated="onActivatedEvent"
    @deactivated="onDeactivatedEvent"
  >
    <slot></slot>
  </VueDraggableResizable>
</template>
<script>
import VueDraggableResizable from "vue-draggable-resizable";
import "vue-draggable-resizable/dist/VueDraggableResizable.css";

// # 定义
import DEF from "./def";
import props from "./props";
import { createLazyLoadDirective } from "./directives";
import {
  debug as debugUtil,
  assignNoNullValue,
  checkAssert,
  isFunction,
  getBoundingClientRect,
  isPointInDOMRect,
  forEachNode,
  getOffsetRect,
  addEvent,
  removeEvent,
  getDocumentElementFontSize,
  fitTextToBox,
  boundNumberFilter,
} from "./util";

const debug = (...args) => {
  const group = args[0];
  const filters = {
    cacheCellLayoutData: 0,
    "resizeCell-offset": 1,
    onResizingEvent: 1,
  };

  if (Object.keys(filters).includes(group) && !!filters[group]) {
    return;
  }
  debugUtil(...args.slice(0));
};

// 全局本地化store，用于处理Cell之间的交互等操作
const store = {
  cells: [],
};

const vueComponentName = "VueDraggableResizableCell";

export default {
  name: vueComponentName,
  components: {
    VueDraggableResizable,
  },
  directives: {
    lazyLoad: createLazyLoadDirective(({ load, type, data }, { vnode }) => {
      debug("lazyLoad", `lazyLoad`, vnode);
      if (["img", "video", "audio"].includes(type)) {
        const ctx = vnode.context;
        // Case1: 图片是延迟加载出来的，所以直接计算BoundingClientRect不准确
        // Case2: 视频延迟加载，需要等待视频加载完成后，计算视频真实的宽度和高度
        ctx.computeAndUpdateLayout(data);
      }
    }),
  },
  props,
  data() {
    return {
      left: this.x,
      top: this.y,
      right: null,
      bottom: null,

      width: 100,
      height: 100,

      cell: {
        parent: null,
        children: [],
        cache: {},
        aspectRatioInitialized: false,
        resizeSteps: {},
        effects: {
          resize: {},
        },
      },
      tempData: {
        lastResizeInfo: null,
        lastDraggingInfo: null,
      },
      history: {
        undo: [],
        redo: [],
      },
    };
  },
  computed: {
    isVueDraggableResizableCell() {
      return true;
    },
    privateMarkPropertyName() {
      return `${this.markPropertyName}__${this._uid}_private_mark__`;
    },
    finalResizeScope() {
      if (this.resizeScopeManipulation === "assign") {
        return this.resizeScope;
      }
      if (this.resizeScopeManipulation === "intersect") {
        return DEF.resizeScope.filter((item) =>
          this.resizeScope.includes(item)
        );
      }
      if (this.resizeScopeManipulation === "difference") {
        return DEF.resizeScope.filter(
          (item) => !this.resizeScope.includes(item)
        );
      }
      if (this.resizeScopeManipulation === "union") {
        return [...new Set([...this.resizeScope, ...DEF.resizeScope])];
      }
      return [];
    },
    enableResize() {
      return this.resizable;
    },
    enableResizeWidth() {
      return this.resizable && this.finalResizeScope.includes("width");
    },
    enableResizeHeight() {
      return this.resizable && this.finalResizeScope.includes("height");
    },
    enableResizeSvgSize() {
      return this.resizable && this.finalResizeScope.includes("svg-size");
    },
    enableResizeFontSize() {
      return this.resizable && this.finalResizeScope.includes("font-size");
    },
    enableResizeLineHeight() {
      return this.resizable && this.finalResizeScope.includes("line-height");
    },
    enableResizeNestingCell() {
      return this.resizable && this.finalResizeScope.includes("nesting-cell");
    },
    isLockAspectRatio() {
      return this.lockAspectRatio && this.cell.aspectRatioInitialized;
    },
    handlesSet() {
      return [
        { tl: this.enableResizeHeight },
        { tm: this.enableResizeHeight },
        { tr: this.enableResizeHeight },
        { ml: this.enableResizeWidth },
        { mr: this.enableResizeWidth },
        { bl: this.enableResizeHeight },
        { bm: this.enableResizeHeight },
        { br: this.enableResizeHeight },
      ]
        .filter((item) => Object.values(item).includes(true))
        .map((item) => Object.keys(item)[0]);
    },
    size() {
      return {
        width: this.width,
        height: this.height,
      };
    },
  },
  watch: {
    size(val, oldVal) {
      debug(
        "watch",
        `[vid=${this._uid},parent=${this.cell.parent?._uid}] size change`,
        val,
        oldVal
      );
      this.computeAndUpdateLayout();
    },
  },
  created() {
    debug(
      "created",
      `${this._uid} created`,
      ` parent: ${this.$parent._uid}`,
      this
    );
    let parent = this.$parent;
    while (parent) {
      if (this.isTypeOfCell(parent)) {
        this.cell.parent = parent;
        parent.cell.children.push(this);
        break;
      }
      parent = parent?.$parent;
    }
    store.cells.push(this);
  },
  beforeMount() {
    this.initHooks();
  },
  mounted() {
    this.computeAndUpdateLayout();
  },
  updated() {
    debug("updated", this._uid);
  },
  destroyed() {
    store.cells.splice(store.cells.indexOf(this), 1);
  },
  methods: {
    /**
     * 独立方法：用于同一处理组件挂载后的整体操作
     * 计算及更新布局，包括子元素的布局
     * @param {number} consultLeft 参考左边距, 默认 null, 相对于父元素，用于平移transform特性
     * @param {number} consultTop 参考顶边距, 默认 null, 相对于父元素，用于平移transform特性
     * @param {number} consultWidth 参考宽度，默认0
     * @param {number} consultHeight 参考高度，默认0
     */
    computeAndUpdateLayout({
      consultLeft = this.left,
      consultTop = this.top,
      consultWidth = 0,
      consultHeight = 0,
    } = {}) {
      debug("computeAndUpdateLayout", `${this._uid}`);
      // 自适应内部元素的大小(考虑line-height的影响)
      const { width: w, height: h } = this.getCellBestWrapperSize({
        consultWidth,
        consultHeight,
      });

      // 计算边界
      this.changePosition(consultLeft, consultTop);
      this.changeSize(w, h);

      // 更新缓存数据
      this.cacheCellLayoutData({ width: w, height: h });
      this.cell.aspectRatioInitialized = true;

      // 调用钩子函数, 方便开发者自定义操作, 开发者可以修改实例的属性及状态
      // @example (self) => {self.width = 100; self.height = 100;}
      this.computeAndUpdateLayoutHook(this, { consultWidth, consultHeight });

      // notice the parent cell to update layout
      if (this.cell.parent) {
        this.cell.parent.computeAndUpdateLayout();
      }
    },
    /**
     * 获取实例事件类型
     */
    getInstanceEventType() {
      return DEF.instanceEventType;
    },
    /**
     * 获得内部单元的VNode
     */
    getCellVNode() {
      checkAssert(this.$children.length > 0, "The cell node is not available");
      // 挂载完成后，才有$children
      if (this.$children.length < 1) return null;
      return this.$children[0].$slots.default[0];
    },
    /**
     * 获得内部单元
     */
    getCellElement() {
      return this.getCellVNode().elm;
    },
    /**
     * 获得内部单元的边界矩形信息
     */
    getCellBoundingClientRect() {
      const ele = this.getCellElement();
      return getBoundingClientRect(ele);
    },
    getCellLineHeight() {
      const ele = this.getCellElement();
      return parseFloat(window.getComputedStyle(ele).lineHeight);
    },
    getCellScrollSize() {
      const ele = this.getCellElement();
      return {
        width: ele?.scrollWidth || 0,
        height: ele?.scrollHeight || 0,
      };
    },
    getCellOffsetSize() {
      const ele = this.getCellElement();
      // [Bug] svg图标
      return {
        width: ele?.offsetWidth || 0,
        height: ele?.offsetHeight || 0,
      };
    },
    /**
     * 获得内部单元相对于文档的偏移量矩形信息
     */
    getCellOffsetRect() {
      const rect = this.getCellBoundingClientRect();
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      return new DOMRect(
        rect.left + scrollLeft,
        rect.top + scrollTop,
        rect.width,
        rect.height
      );
    },
    /**
     * 获得Cell最佳的包裹宽高
     */
    getCellBestWrapperSize({ consultWidth = 0, consultHeight = 0 }) {
      const rect = this.getCellBoundingClientRect();
      const {
        width: scrollWidth,
        height: scrollHeight,
      } = this.getCellScrollSize();
      const {
        width: offsetWidth,
        height: offsetHeight,
      } = this.getCellOffsetSize();

      // 选择最优的数值
      const useBest = boundNumberFilter;

      // 有些元素，不能获取offsetWidth和offsetHeight， 例如：SVG元素，需要使用scrollWidth和scrollHeight
      const ele = this.getCellElement();
      const useScrollSize = ["SVG"].includes(ele?.nodeName);

      return {
        width: useBest([
          rect.width,
          offsetWidth,
          consultWidth,
          ...[useScrollSize ? scrollWidth : 0],
        ]),
        height: useBest([
          rect.height,
          offsetHeight,
          consultHeight,
          ...[useScrollSize ? scrollHeight : 0],
        ]),
      };
    },
    /**
     * 获得HTML元素的计算样式
     */
    getHTMLElementComputedStyle(ele, prop) {
      try {
        return window.getComputedStyle(ele, null).getPropertyValue(prop);
      } catch (e) {
        return null;
      }
    },
    /**
     * 判断是否为本组件实例
     */
    isTypeOfCell(vueInstance) {
      return !!(
        vueInstance?.isVueDraggableResizableCell &&
        [vueComponentName, `<${vueComponentName}>`].includes(vueInstance?._name)
      );
    },
    /**
     * 获得子孙嵌套的所有Cell树数据, 包括节点的层级关系
     * @summary 只返回本组件实例的树形结构, Map中的key，参照版本号的处理方式，eg. 1.0 = level.index
     */
    getDescendantCells() {
      const cells = {};
      const levels = [];
      forEachNode(this, (node, index, list, level, parentNode) => {
        if (this.isTypeOfCell(node) && node !== this) {
          // cells[node.id] = node;
          cells[`${level}.${index}`] = {
            node,
            level,
            index,
            parentNode,
          };
        }
        levels.push(level);
      });
      return cells;
    },
    /**
     * 根据跟定的node节点获得最近的后代Cell
     */
    getANestedLevel0ChildCell(node) {
      const children = this.getDescendantCells();
      const childList = [];

      // 根据节点的级别和索引获得子节点
      Object.keys(children)
        .sort((a, b) => a - b) // FIXME: 排序算法，需要参照版本号比较
        .forEach((key) => {
          const { node: item } = children[key];
          childList.push(item);
        });

      let nestingCell = null;
      childList.some((cell) => {
        if (this.isTypeOfCell(cell) && cell !== this) {
          const ele = cell.$el;
          if (ele.contains(node)) {
            nestingCell = cell;
            return true;
          }
        }
        return false;
      });
      return nestingCell;
    },
    /**
     * 判断点是否在元素内
     * @param {Object} point 点, 注意使用的是PageX和PageY
     * @summary 注意文档滚动
     */
    isPointInCell(point = { x: 0, y: 0 }) {
      const rect = this.getCellOffsetRect();
      return isPointInDOMRect(point, rect);
    },
    /**
     * 初始化WebEventHooks
     *
     * @param {Object} hookMap
     * @param {VNode} vnode
     * @param {function} getProperty
     */
    private_initEventHooks(hookMap = {}, vnode, getProperty = ($vnode) => {}) {
      const ref = (getProperty && getProperty(vnode)) || {};
      const check = (res) => ![false].includes(res);
      Object.keys(ref).forEach((key) => {
        const hooksOnBefore = [].concat(hookMap[`before_${key}`] || []);
        const hooksOnAfter = [].concat(hookMap[`after_${key}`] || []);
        const fns = [].concat(ref[key] || []);
        const ctx = { vnode, key, ref };

        const handler = (e, ...args) => {
          // debug(key, e, args, { before_hooks, after_hooks, fns });
          const returnValForBeforeHooks = hooksOnBefore.reduce(
            (state, fn) => check(state) && check(fn(e, ctx, ...args)),
            {}
          );
          // debug(key, "before_res", before_res);

          if (returnValForBeforeHooks) {
            fns.forEach((fn) => fn(e, ...args));
            hooksOnAfter.reduce(
              (state, fn) => check(state) && check(fn(e, ctx, ...args)),
              {}
            );
          }
        };
        handler.__extra__ = {
          ...(handler.__extra__ || {}),
          key,
          fns,
          before_hooks: hooksOnBefore,
          after_hooks: hooksOnAfter,
        };

        ref[key] = handler;
      });
    },
    initHooks() {
      const hookMap = this.childrenListenerHooks;

      const reduce = (vnodeList = []) => {
        vnodeList.forEach((vnode) => {
          this.private_initEventHooks(hookMap, vnode, (_ /* vnode */) => {
            if (vnode?.componentOptions?.listeners) {
              return vnode.componentOptions.listeners;
            }
            return {};
          });

          reduce(vnode?.children || []);
        });
      };

      reduce(
        Object.keys(this.$slots)
          .map((key) => [].concat(this.$slots[key] || []))
          .flat()
      );
    },
    /**
     * 预先处置, 缓存一些Cell的状态数据
     */
    cacheCellLayoutData({ width, height }) {
      debug("cacheCellLayoutData", `${this._uid}`, { width, height });
      const ele = this.getCellElement();
      const beforeHooks = [].concat(
        this.cellChildNodeInitInfoHooks?.beforeInit || []
      );
      const onCacheHooks = [].concat(
        this.cellChildNodeInitInfoHooks?.onCacheEachNode || []
      );
      const afterHooks = [].concat(
        this.cellChildNodeInitInfoHooks?.afterInit || []
      );

      beforeHooks.forEach((hook) => hook(this, ele));

      // 原本的宽高比
      const aspectRatio = width / height;

      // 标记元素
      let key = -1;
      forEachNode(ele, (node) => {
        // eslint-disable-next-line no-param-reassign
        node[this.privateMarkPropertyName] = key;
        let extraInfo = {};
        onCacheHooks.forEach(
          (hook) =>
            (extraInfo = Object.assign(
              extraInfo,
              hook(this, node, key, extraInfo) || {}
            ))
        );
        const boundingClientRect = getBoundingClientRect(node);

        const fontSize = parseFloat(
          this.getHTMLElementComputedStyle(node, "font-size")
        );
        const lineHeight = parseFloat(
          this.getHTMLElementComputedStyle(node, "line-height")
        );
        const getDefaultFontSize = getDocumentElementFontSize;

        this.cell.cache[key] = this.cell.cache[key] ?? {};

        // 公共数据
        const common = {
          // 关联的内联样式Style数据
          style: JSON.parse(JSON.stringify(node?.style ?? {})),
          // 关联的CSS样式类名
          class: node?.className || "",
          // 相对于视口的矩形
          boundingClientRect,
          // 宽高比
          aspectRatio,
          // 字体大小，可能为NaN
          fontSize: Number.isNaN(fontSize) ? getDefaultFontSize() : fontSize,
          // 行高，可能为NaN
          lineHeight: Number.isNaN(lineHeight)
            ? getDefaultFontSize() * 1.5
            : lineHeight,
        };

        // 初始化状态, 用于记录最初状态，不用频繁更新
        const initial =
          this.cell.cache[key]?.initial ||
          Object.freeze({
            ...common,
            cell: {
              width,
              height,
            },
          });

        // 要缓存的属性
        this.cell.cache[key] = Object.freeze({
          ...extraInfo,
          ...common,
          initial,
          // HTML Node
          node,
          // 是否是Cell根节点，只有key === -1时才是
          isRootNode: key === -1,
        });

        key += 1;
      });

      afterHooks.forEach((hook) => hook(this, ele));
    },
    /**
     * 注册Resize步骤
     * @param {string} key 关键key
     * @param {function} step 操作步骤
     * @param {object} context 操作步骤的上下文
     */
    registerResizeStep(key, step = () => {}, context = {}) {
      if (!key) return;
      const { resizeSteps } = this.cell;
      // eslint-disable-next-line no-param-reassign
      step.__extra__ = { key, context };
      resizeSteps[key] = step;
    },
    /**
     * 注册Resize的副作用
     * @param {string} key 副作用唯一Key
     * @param {function} effect 副作用函数
     * @param {Object} options 选项
     */
    registerResizeEffect(key, effect = () => {}, { overwrite = true } = {}) {
      if (!key) return;
      const {
        effects: { resize: resizeEffects },
      } = this.cell;

      if (overwrite && isFunction(resizeEffects[key])) {
        resizeEffects[key] = effect;
      } else {
        resizeEffects[key] = effect;
      }
    },
    /**
     * 运行所有的Resize操作步骤（这些步骤被注册到Cell上）
     */
    runResizeSteps() {
      const {
        resizeSteps,
        effects: { resize: resizeEffects },
      } = this.cell;

      const [
        beforeHooks = [],
        afterHooks = [],
        beforeEachHooks = [],
        afterEachHooks = [],
      ] = [
        "beforeRunAllResizeSteps",
        "afterRunAllResizeSteps",
        "beforeRunEachResizeStep",
        "afterRunEachResizeStep",
      ].map((key) => this.resizeHooks[key] || []);

      // 调用前置钩子
      beforeHooks.forEach((hook) => hook(this, resizeSteps, resizeEffects));

      // 循环调用
      Object.keys(resizeSteps).forEach((key) => {
        let step = resizeSteps[key];
        let context = step.__extra__?.context;
        // 调用前置钩子，支持resize步骤函数重置及上下文环境重置
        beforeEachHooks.forEach((hook) => {
          const { step: newStep, context: newContext } = hook(this, {
            key,
            step,
            context,
          });
          context && (context = newContext);
          step && (step = newStep);
        });
        const effectHandler = step(this, context);
        // 调用后置钩子
        afterEachHooks.forEach((hook) =>
          hook(this, { key, step, context, effectHandler })
        );
        if (isFunction(effectHandler)) {
          effectHandler.__extra__ = { key, context };
          this.registerResizeEffect(key, effectHandler);
        }
      });

      // 调用后置钩子
      afterHooks.forEach((hook) => hook(this, resizeSteps, resizeEffects));
    },
    /**
     * 激活某个Resize的副作用函数
     *
     * @param {string} key 关键key值
     */
    activeResizeEffect(key) {
      if (!key) return;
      const {
        effects: { resize: resizeEffects },
      } = this.cell;
      const fn = resizeEffects[key];
      if (fn) {
        const context = fn.__extra__?.context;
        fn(this, context);
      }
    },
    /**
     * 激活所有Resize的副作用函数
     */
    activeAllResizeEffects() {
      const {
        effects: { resize: resizeEffects },
      } = this.cell;
      Object.keys(resizeEffects).forEach((key) => {
        this.activeResizeEffect(key);
      });
      this.cell.effects.resize = {};
      this.cell.resizeSteps = {};
    },
    /**
     * 获得子节点的初始化数据
     *
     * @param {string} key 关键key值
     */
    getCellChildNodeInitInfoByKey(key) {
      return this.cell.cache[key];
    },
    /**
     * 获得根Cell节点的初始化数据
     */
    getCellRootNodeInitInfo() {
      return this.cell.cache[-1];
    },
    /**
     * 获得Cell最原始的样式信息
     */
    getCellOriginalStyle() {
      return this.getCellRootNodeInitInfo().style;
    },
    changePosition(left = 0, top = 0) {
      this.left = assignNoNullValue(this.left, left);
      this.top = assignNoNullValue(this.top, top);
    },
    changeSize(width = 0, height = 0) {
      checkAssert(
        width >= 0,
        `width is not available [${width}], must be greater than 0`
      );
      checkAssert(
        height >= 0,
        `"height is not available [${height}], must be greater than 0`
      );

      this.width = assignNoNullValue(this.width, width);
      this.height = assignNoNullValue(this.height, height);
    },
    /**
     * 设置Cell的尺寸
     * @param {number} l left 左坐标值
     * @param {number} t top 顶坐标值
     * @param {number} w 宽度
     * @param {number} h 高度
     * @param {object} parent 用于嵌套Cell的指明有谁引起的，直接穿透
     *
     * @Note:
     * 包含两个部分的元素需要处理
     * (1) HTML 元素
     * (2) Vue Node
     */
    resizeCell(l, t, w, h, parent = null) {
      const beforeHooks = [].concat(this.resizeHooks?.beforeResizeCell || []);
      const afterHooks = [].concat(this.resizeHooks?.afterResizeCell || []);
      const onHooks = [].concat(
        this.resizeHooks?.onResizeCellForEachNode || []
      );
      beforeHooks.forEach((hook) => hook(this, l, t, w, h));

      // 计算偏移量
      const offsetLeft = l - this.left;
      const offsetTop = t - this.top;
      debug("resizeCell-offset", `${this._uid}`, offsetLeft, offsetTop);

      // 宽度变化比例(精确)
      const widthChangeRatio = w / this.width;
      const widthOffset = w - this.width;
      // 高度变化比例(精确)
      const heightChangeRatio = h / this.height;
      const heightOffset = h - this.height;
      // 获得矩形尺寸变化比例
      const changeRatio = Math.min(widthChangeRatio, heightChangeRatio);

      // 同步更新内部元素的大小及解决动画问题
      const ele = this.getCellElement();
      // debug(`ele =`, ele);
      this.registerResizeStep("resize-cell-width-and-height", () => {
        ele.style.width = `${w}px`;
        ele.style.height = `${h}px`;
      });

      // FIX：解决动画问题
      this.registerResizeStep(
        "fix-root-ele-transition-issue",
        (_, { ele: element }) => {
          const recursiveChildNodes = false;
          const rootHandle = () => {
            if (
              typeof this.reserveCellTransition === "boolean" &&
              !this.reserveCellTransition
            ) {
              // eslint-disable-next-line no-param-reassign
              element.style.transition = "none";
            } else if (typeof this.reserveCellTransition === "string") {
              // eslint-disable-next-line no-param-reassign
              element.style.transition = this.reserveCellTransition;
            }

            // 恢复内部元素的样式Resize前的样式
            return () => {
              if (!this.getCellOriginalStyle().transition) {
                // eslint-disable-next-line no-param-reassign
                element.style.transition = "";
              } else {
                // eslint-disable-next-line no-param-reassign
                element.style.transition = this.getCellOriginalStyle().transition;
              }
            };
          };
          const allChildNodesHandle = () => {
            forEachNode(ele, (node) => {
              let transition = "";
              if (
                typeof this.reserveCellTransition === "boolean" &&
                !this.reserveCellTransition
              ) {
                transition = "none";
              } else if (typeof this.reserveCellTransition === "string") {
                transition = this.reserveCellTransition;
              }

              const key = node[this.privateMarkPropertyName];
              const nodeInfo = this.getCellChildNodeInitInfoByKey(key);

              if (![undefined, null].includes(node.style?.transition)) {
                // eslint-disable-next-line no-param-reassign
                node.style.transition = transition;
              }
            });

            return () => {
              forEachNode(ele, (node) => {
                const key = node[this.privateMarkPropertyName];
                const nodeInfo = this.getCellChildNodeInitInfoByKey(key);
                if (
                  ![undefined, null].includes(node?.style?.transition) &&
                  nodeInfo
                ) {
                  // eslint-disable-next-line no-param-reassign
                  node.style.transition = nodeInfo?.style?.transition;
                }
              });
            };
          };

          return recursiveChildNodes ? allChildNodesHandle() : rootHandle();
        },
        { ele }
      );

      // FIX: 解决vnode节点data数据没有被更新
      this.registerResizeStep("fix-root-vnode-data-issue", () => {
        // 更新内部元素的VNode
        const node = this.getCellVNode();
        if (node.data?.style?.width) {
          node.data.style.width = `${w}px`;
        }
        if (node.data?.style?.height) {
          node.data.style.height = `${h}px`;
        }
      });

      // FIX: 解决内部元素变更的问题
      1 &&
        this.registerResizeStep("fix-inner-ele-resize-issue", () => {
          // 方便函数
          const _getNodeInfo = (key, context = {}, instance = this) => {
            const nodeInfo = instance.getCellChildNodeInitInfoByKey(key);
            checkAssert(nodeInfo, "nodeInfo is not available", {
              context,
              instance,
            });
            return nodeInfo;
          };

          // 遍历内部元素
          forEachNode(ele, (node) => {
            // 检测是否为嵌套子Cell中的元素，
            // 如果是，根据处理策略是交由嵌套子Cell处理，还是直接不处理
            const nestingCell = this.getANestedLevel0ChildCell(node);
            if (nestingCell) {
              // 嵌套子Cell
              if (this.enableResizeNestingCell) {
                // T计算偏移，left, top 应该放到合适位置
                const { left, top } = nestingCell;

                // 计算尺寸
                const method = this.nestingCellResizeStrategy;
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
                this.registerResizeEffect(
                  `nesting-cell-resize-effect-${nestingCell._uid}-${this._uid}`,
                  () => {
                    debug(
                      `nesting-cell-resize-effect call`,
                      `${nestingCell._uid}-${this._uid}`,
                      {
                        left,
                        top,
                        width,
                        height,
                        widthChangeRatio,
                        heightChangeRatio,
                      }
                    );
                    // 计算新的left， top，width，height
                    nestingCell.onResizeStopEvent(left, top, width, height);
                  }
                );
              }
              return;
            }

            // debug(`node =`, node);
            // 内部含有SVG元素时，需要计算比例
            if (this.enableResizeSvgSize && node?.nodeName === "svg") {
              const key = node[this.privateMarkPropertyName];
              const nodeInfo = _getNodeInfo(key, { node, key });
              if (!nodeInfo.isRootNode) {
                // eslint-disable-next-line no-param-reassign
                node.style.zoom =
                  changeRatio * parseFloat(nodeInfo.style.zoom || 1.0);
              }
            }

            // 更新font-size
            if (this.enableResizeFontSize) {
              if (node?.nodeName === "#text") {
                const { parentNode, nodeValue } = node;
                const key =
                  parentNode[(parent ?? this).privateMarkPropertyName];
                const nodeInfo = _getNodeInfo(
                  key,
                  { node, key, parentNode },
                  parent ?? this
                );
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
                    parentNode.clientWidth,
                    parentNode.clientHeight,
                    this.getHTMLElementComputedStyle(parentNode, "font-family")
                  );
                  const ratioFontSize =
                    Math.min(w / width, h / height) * initialFontSize;

                  const strategy = this.resizeFontStrategy;
                  const [_, fontSize] = [
                    [strategy === "ratio", ratioFontSize],
                    [strategy === "fit", fitFontSize],
                    [strategy === "auto", Math.min(ratioFontSize, fitFontSize)],
                  ].filter(([m]) => m)[0];

                  debug(`update-font-size`, `${this._uid}`, {
                    fontSize,
                    ratioFontSize,
                    fitFontSize,
                    initialFontSize,
                    width,
                    height,
                  });
                  // eslint-disable-next-line no-param-reassign
                  parentNode.style.fontSize = `${fontSize}px`;
                }
              }

              if (node?.nodeName === "INPUT") {
                const key = node[(parent ?? this).privateMarkPropertyName];
                const nodeInfo = _getNodeInfo(
                  key,
                  { node, key },
                  parent ?? this
                );
                if (nodeInfo) {
                  // eslint-disable-next-line no-param-reassign
                  node.style.fontSize = `${changeRatio *
                    parseFloat(nodeInfo.fontSize)}px`;
                }
              }
            }

            onHooks.forEach((hook) => hook(this, node, w, h, changeRatio));
          });

          return () => {};
        });

      // 运行所有的resizeStep
      this.runResizeSteps();

      // 发送事件
      this.$emit(DEF.instanceEventType.cellResizing, this, w, h);

      // after hooks
      afterHooks.forEach((hook) => hook(this, w, h));
    },
    /**
     * 判断是否有子Cell包含点，
     * @param {object} point 点, x: number, y: number, 特指文档坐标系 pageX, pageY
     * @param {object} [options] 选项
     * @return {boolean}
     */
    hasChildrenCellContainsPoint(point = { x: 0, y: 0 }, options = {}) {
      const fn = (children = []) => {
        if (children.length === 0) return false;
        return children.some((child) => {
          if (this.isTypeOfCell(child)) {
            return child.isPointInCell(point);
          }
          return fn(child.$children);
        });
      };
      return fn(this.$children);
    },
    /**
     * 是否允许Resize启动
     * @param {any} handle
     * @param {Event} e resize事件对象
     * @returns {boolean} true, 允许，false，不允许
     */
    checkAllowResizeStart(handle, e) {
      // check enable resize for event
      const mouseX = e.touches ? e.touches[0].pageX : e.pageX;
      const mouseY = e.touches ? e.touches[0].pageY : e.pageY;

      // check the mouse is in the cell child node
      if (this.hasChildrenCellContainsPoint({ x: mouseX, y: mouseY }))
        return false;

      return true;
    },
    /**
     * 调用Resize的Check函数, 检查是否允许Resize继续
     * @param {number} w 新的宽度
     * @param {number} h 新的高度
     * @returns {boolean} true, 允许，false，不允许
     */
    checkAllowContinueResize(handle, left, top, width, height) {
      // check enable resize for width or height
      const checkFns = [
        () => {
          if (
            !this.enableResizeWidth &&
            Math.round(width) !== Math.round(this.width)
          )
            return false;
          if (
            !this.enableResizeHeight &&
            Math.round(height) !== Math.round(this.height)
          )
            return false;

          return true;
        },
      ];

      const resizable = checkFns.every((fn) => fn());
      return resizable;
    },
    /**
     * 是否允许拖拽启动
     * @param {Event} e 事件对象
     * @returns {boolean} true, 允许，false，不允许
     */
    checkAllowDragStart(e) {
      // check enable drag for event
      const mouseX = e.touches ? e.touches[0].pageX : e.pageX;
      const mouseY = e.touches ? e.touches[0].pageY : e.pageY;

      // check the mouse is in the cell child node
      if (this.hasChildrenCellContainsPoint({ x: mouseX, y: mouseY }))
        return false;

      return true;
    },
    /**
     * 是否允许拖拽继续
     * @param {number} left 新的left值
     * @param {number} top 新的top值
     * @returns {boolean} true, 允许，false，不允许
     */
    checkAllowContinueDrag(left = 0, top = 0) {
      return true;
    },
    /**
     * 改变大小事件的回调
     * @param {number} left 新的left值
     * @param {number} top 新的top值
     * @param {number} width
     * @param {number} height
     * @param {object} parent 用于嵌套Cell的指明有谁引起的，直接穿透
     */
    onResizingEvent(left, top, width, height, parent = null) {
      const params = JSON.stringify({ left, top, width, height });
      if (this.tempData.lastResizeInfo === params) return;

      debug("onResizingEvent", `${this._uid} =`, { left, top, width, height });

      const beforeHooks = [].concat(this.resizeHooks?.beforeResizing || []);
      const afterHooks = [].concat(this.resizeHooks?.afterResizing || []);

      beforeHooks.forEach((hook) => hook(this, left, top, width, height));
      // 同步更新内部元素
      this.resizeCell(left, top, width, height, parent);
      afterHooks.forEach((hook) => hook(this, left, top, width, height));

      // 记录最后一次的改变信息
      this.tempData.lastResizeInfo = params;
    },
    /**
     * @description 当Cell 尺寸改变后的回调
     * @param {number} left 新的left值
     * @param {number} top 新的top值
     * @param {number} width 新的宽度
     * @param {number} height 新的高度
     */
    onResizeStopEvent(left, top, width, height) {
      debug(`onResizeStopEvent`, `${this._uid}`);
      const beforeHooks = [].concat(this.resizeHooks?.beforeResizeStop || []);
      const afterHooks = [].concat(this.resizeHooks?.afterResizeStop || []);
      beforeHooks.forEach((hook) => hook(this, left, top, width, height));

      // 更新当前容器元素的属性值
      this.changePosition(left, top);
      this.changeSize(width, height);
      this.$emit(DEF.instanceEventType.cellResizeEnd, left, top, width, height);

      // 副作用启动
      this.activeAllResizeEffects();

      // 钩子函数
      afterHooks.forEach((hook) => hook(this, left, top, width, height));
    },
    /**
     * 拖拽的回调
     * @param {number} left
     * @param {number} top
     */
    onDraggingEvent(left, top) {
      const params = JSON.stringify({ left, top });
      if (this.tempData.lastDraggingInfo === params) return;
      debug(`onDraggingEvent`, `${this._uid}`);

      const beforeHooks = [].concat(this.dragHooks?.beforeDragging || []);
      const afterHooks = [].concat(this.dragHooks?.afterDragging || []);
      beforeHooks.forEach((hook) => hook(this, left, top));

      // 更新当前容器元素的属性值
      this.changePosition(left, top);

      afterHooks.forEach((hook) => hook(this, left, top));

      // 记录最后一次的改变信息
      this.tempData.lastDraggingInfo = params;
    },
    /**
     * 挂载激活事件
     */
    onActivatedEvent() {
      // debug(`onActivatedEvent)
    },
    /**
     * 未激活选择事件
     */
    onDeactivatedEvent() {
      debug("onDeactivatedEvent", `${this._uid}`);
    },
  },
};
</script>
<style lang="less" scoped>
.cell {
  border: none;
}

.cell-tip {
  &:after {
    content: attr(data-tip);
    display: none;
    position: absolute;
    padding: 5px 10px;
    left: 50%;
    bottom: 100%;
    width: max-content;
    margin-bottom: 12px;
    // transform: translateX(-50%);
    font-size: 12px;
    color: #fff;
    cursor: default;
    background: rgba(0, 0, 0, 0.8);
    z-index: 1;
  }

  // 悬浮时显示的箭头
  // &:before {
  //   content: " ";
  //   position: absolute;
  //   display: none;
  //   left: 50%;
  //   bottom: 100%;
  //   // transform: translateX(-50%);
  //   margin-bottom: 3px;
  //   width: 0;
  //   height: 0;
  //   border-left: 6px solid transparent;
  //   border-right: 6px solid transparent;
  //   border-top: 9px solid #000;
  // }

  &:hover {
    &:after,
    &:before {
      display: block;
    }
  }
}
</style>
