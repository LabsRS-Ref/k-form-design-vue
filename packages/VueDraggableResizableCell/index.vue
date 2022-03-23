/* eslint-disable camelcase, no-unused-vars */
<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-02-14 15:21:25
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 * @LastEditTime : 2022-03-23 21:09:21
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
    :class="classNamesForCell"
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
    @dragstop="onDragEndEvent"
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
  checkToDo,
  isFunction,
  splice,
  getBoundingClientRect,
  isPointInDOMRect,
  forEachNode,
  getDocumentElementFontSize,
  fitTextToBox,
  boundNumberFilter,
} from "./util";

// 导入steps
import cellSelfResizeStep from "./steps/cell-self-resize";
import fixTransitionResizeIssuesStep from "./steps/fix-transition-resize-issues";
import fixInnerElementResizeIssuesStep from "./steps/fix-inner-element-resize-issues";

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

      width: 10,
      height: 10,

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

      isResizing: false,
      isDragging: false,

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
    classNamesForCell() {
      const cls = this.className;
      return [
        cls,
        {
          [`${cls}-tip`]: this.tip.trim().length > 0,
          [`${cls}-hide-border`]: !(this.draggable || this.resizable),
        },
      ];
    },
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
        return DEF.resizeScope.filter((item) => this.resizeScope.includes(item));
      }
      if (this.resizeScopeManipulation === "difference") {
        return DEF.resizeScope.filter((item) => !this.resizeScope.includes(item));
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
    xy() {
      return {
        x: this.x,
        y: this.y,
      };
    },
    wh() {
      return {
        w: this.w,
        h: this.h,
      };
    },
  },
  watch: {
    size(val, oldVal) {
      debug("watch", `[vid=${this._uid},parent=${this.cell.parent?._uid}] size change`, val, oldVal);
      this.computeAndUpdateLayout({
        consultWidth: val.width,
        consultHeight: val.height,
      });
    },
    xy(val) {
      this.left = val.x;
      this.top = val.y;
    },
    wh(val, oldVal) {
      debug("watch", `[vid=${this._uid},parent=${this.cell.parent?._uid}] wh change`, val, oldVal);
      this.computeAndUpdateLayout({
        consultWidth: val.w,
        consultHeight: val.h,
      });
    },
  },
  created() {
    debug("created", `[vid=${this._uid},parent=${this.cell.parent?._uid}]`);
    this.updateHierarchy();
    store.cells.push(this);
    this.sentEvent(DEF.internalEvent.created, this);
  },
  beforeMount() {
    debug("beforeMount", `[vid=${this._uid},parent=${this.cell.parent?._uid}]`, this.xy, this.wh);
    this.initHooks();
    this.sentEvent(DEF.internalEvent.beforeMount, this);
  },
  mounted() {
    debug("mounted", `[vid=${this._uid},parent=${this.cell.parent?._uid}]`, this.$el);
    this.computeAndUpdateLayout({ updateCache: true });
    this.sentEvent(DEF.internalEvent.mounted, this);
  },
  updated() {
    debug("updated", this._uid);
    this.sentEvent(DEF.internalEvent.updated, this);
  },
  destroyed() {
    debug("destroyed", this._uid);
    splice(store.cells, this);
    const { parent } = this.cell;
    splice(parent?.cell?.children, this);
    this.sentEvent(DEF.internalEvent.destroyed, this);
  },
  methods: {
    /** 统一由函数发送事件 */
    sentEvent(eventName, ...args) {
      debug("sentEvent", `[vid=${this._uid},parent=${this.cell.parent?._uid}]`, eventName, ...args);
      this.$emit(eventName, ...args);
    },
    /** 更新层次结构 */
    updateHierarchy() {
      let parentCell = null;
      let parent = this.$parent;
      while (parent) {
        if (this.isTypeOfCell(parent)) {
          parentCell = parent;
          break;
        }
        parent = parent?.$parent;
      }
      if (parentCell) {
        this.cell.parent = parentCell;
        parentCell.cell.children.push(this);
      }

      // debug
      debug("updateHierarchy", `${this._uid} created`, `parent:${this.$parent._uid}`, {
        store,
        this: this,
        parentCell,
      });
    },
    /**
     * 独立方法：用于同一处理组件挂载后的整体操作
     * 计算及更新布局，包括子元素的布局
     * @param {number} consultLeft 参考左边距, 默认 null, 相对于父元素，用于平移transform特性
     * @param {number} consultTop 参考顶边距, 默认 null, 相对于父元素，用于平移transform特性
     * @param {number} consultWidth 参考宽度，默认0
     * @param {number} consultHeight 参考高度，默认0
     * @param {boolean} updateCache 是否更新缓存
     */
    computeAndUpdateLayout({
      consultLeft = this.left,
      consultTop = this.top,
      consultWidth = 0,
      consultHeight = 0,
      updateCache = false,
    } = {}) {
      debug("computeAndUpdateLayout", `${this._uid}`, {
        consultLeft,
        consultTop,
        consultWidth,
        consultHeight,
        updateCache,
      });
      // 自适应内部元素的大小(考虑line-height的影响)
      const { width: w, height: h } = this.getCellBestWrapperSize({
        consultWidth,
        consultHeight,
        recursiveCalcChildrenNodes: updateCache,
      });

      // 计算边界
      if (!updateCache) {
        this.updateChildrenLayout({ left: consultLeft, top: consultTop, width: w, height: h });
      } else {
        this.changePosition(consultLeft, consultTop);
        this.changeSize(w, h);
      }

      // 更新缓存数据
      if (updateCache) {
        this.cacheCellLayoutData({ width: this.width, height: this.height });
        this.cell.aspectRatioInitialized = true;
      }

      // 调用钩子函数, 方便开发者自定义操作, 开发者可以修改实例的属性及状态
      // @example (self) => {self.width = 100; self.height = 100;}
      this.computeAndUpdateLayoutHook(this, { consultWidth, consultHeight });

      // notice the parent cell to update layout
      if (this.cell.parent) {
        this.cell.parent.computeAndUpdateLayout();
      }
    },
    /**
     * 获取内部事件类型
     */
    getInternalEventType() {
      return DEF.internalEvent;
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
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      return new DOMRect(rect.left + scrollLeft, rect.top + scrollTop, rect.width, rect.height);
    },
    /**
     * 获得Cell最佳的包裹宽高
     * @param {number} consultWidth 参考宽度
     * @param {number} consultHeight 参考高度
     * @param {boolean} recursiveCalcChildrenNodes 递归计算子元素的最佳包裹宽高 (默认false)
     * @returns {object} {width, height}
     */
    getCellBestWrapperSize({ consultWidth = 0, consultHeight = 0, recursiveCalcChildrenNodes = false } = {}) {
      const rect = this.getCellBoundingClientRect();
      const { width: scrollWidth, height: scrollHeight } = this.getCellScrollSize();
      const { width: offsetWidth, height: offsetHeight } = this.getCellOffsetSize();

      // 选择最优的数值
      const useBest = (args) => Math.max(...args);

      const ele = this.getCellElement();
      // 有些元素，不能获取offsetWidth和offsetHeight， 例如：SVG元素，需要使用scrollWidth和scrollHeight
      const useScrollSize = ["SVG"].includes(ele?.nodeName);

      // 有的时候，子元素的宽度和高度都超过了容器
      let childNodeMaxWidth = 0;
      let childNodeMaxHeight = 0;
      if (recursiveCalcChildrenNodes) {
        forEachNode(ele, (htmlNode) => {
          const { width, height } = getBoundingClientRect(htmlNode);
          // TODO: 是否考虑 offset 和 scrollSize
          childNodeMaxWidth = Math.max(childNodeMaxWidth, width || 0);
          childNodeMaxHeight = Math.max(childNodeMaxHeight, height || 0);
        });
      }

      const [calcWidth, calcHeight] = [
        useBest([rect.width, offsetWidth, consultWidth, this.minWidth, ...[useScrollSize ? scrollWidth : 0]]),
        useBest([rect.height, offsetHeight, consultHeight, this.minHeight, ...[useScrollSize ? scrollHeight : 0]]),
      ];

      // 计算最佳宽高
      const [finalWidth, finalHeight] = [
        useBest([calcWidth, childNodeMaxWidth]),
        useBest([calcHeight, childNodeMaxHeight]),
      ];

      // TODO: 补充针对maxWidth，maxHeight的处理

      debug("getCellBestWrapperSize", `${this._uid}`, {
        finalWidth,
        finalHeight,
        offsetWidth,
        offsetHeight,
        scrollWidth,
        scrollHeight,
        rect,
      });

      return {
        width: finalWidth,
        height: finalHeight,
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
      const { $options: options } = vueInstance;
      return !!(
        options?.computed?.isVueDraggableResizableCell &&
        [vueComponentName, `<${vueComponentName}>`].includes(options?.name)
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
            hooksOnAfter.reduce((state, fn) => check(state) && check(fn(e, ctx, ...args)), {});
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
      const beforeHooks = [].concat(this.cellChildNodeInitInfoHooks?.beforeInit || []);
      const onCacheHooks = [].concat(this.cellChildNodeInitInfoHooks?.onCacheEachNode || []);
      const afterHooks = [].concat(this.cellChildNodeInitInfoHooks?.afterInit || []);

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
          // eslint-disable-next-line no-return-assign
          (hook) => (extraInfo = Object.assign(extraInfo, hook(this, node, key, extraInfo) || {}))
        );
        const boundingClientRect = getBoundingClientRect(node);

        // FIXME: 如果是根元素，要考略传递过来的宽高，有可能计算后的包裹尺寸要大于根元素本身的尺寸
        if (key === -1) {
          boundingClientRect.width = Math.max(boundingClientRect.width, width);
          boundingClientRect.height = Math.max(boundingClientRect.height, height);
        }

        const fontSize = parseFloat(this.getHTMLElementComputedStyle(node, "font-size"));
        const lineHeight = parseFloat(this.getHTMLElementComputedStyle(node, "line-height"));
        const getDefaultFontSize = getDocumentElementFontSize;
        const vnode = node?.__vue__?.$vnode ?? null;

        if (!vnode) {
          // TODO: 验证VNode不存在的情况，是否正常
          checkToDo(vnode, "vnode is null", { node });
        }

        this.cell.cache[key] = this.cell.cache[key] ?? {};

        // 公共数据
        const common = {
          // 对应的VNode节点
          vnode,
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
          lineHeight: Number.isNaN(lineHeight) ? getDefaultFontSize() * 1.5 : lineHeight,
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

      const [beforeHooks = [], afterHooks = [], beforeEachHooks = [], afterEachHooks = []] = [
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
          context = newContext;
          step = newStep;
        });
        const effectHandler = step(this, context);
        // 调用后置钩子
        afterEachHooks.forEach((hook) => hook(this, { key, step, context, effectHandler }));
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
    /** 更新所有子节点布局 */
    updateChildrenLayout({ left = -1, top = -1, width = 0, height = 0, force = false } = {}) {
      const willResize = [
        [this.left, left],
        [this.top, top],
        [this.width, width],
        [this.height, height],
      ].some(([origin, target]) => {
        return origin !== target;
      });

      // debug
      debug("updateChildrenLayout", `${this._uid}`, { left, top, width, height, force, willResize });

      if (willResize || force) {
        // 重新调整Cell的布局
        this.resizeCell(left, top, width, height);
        // 副作用启动
        this.activeAllResizeEffects();
        // 更新Cell的位置及尺寸
        this.changePosition(left, top);
        this.changeSize(width, height);
      }
    },
    /** 变更位置 */
    changePosition(left = 0, top = 0) {
      debug("changePosition", `${this._uid}`, { left, top });
      this.left = assignNoNullValue(this.left, left);
      this.top = assignNoNullValue(this.top, top);
    },
    /** 变更大小 */
    changeSize(width = 0, height = 0) {
      debug("changeSize", `${this._uid}`, { width, height });
      checkAssert(width >= 0, `width is not available [${width}], must be greater than 0`);
      checkAssert(height >= 0, `"height is not available [${height}], must be greater than 0`);

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
      debug("resizeCell", `${this._uid}`, { l, t, w, h, parent });

      const beforeHooks = [].concat(this.resizeHooks?.beforeResizeCell || []);
      const afterHooks = [].concat(this.resizeHooks?.afterResizeCell || []);
      const onHooks = [].concat(this.resizeHooks?.onResizeCellForEachNode || []);
      beforeHooks.forEach((hook) => hook(this, l, t, w, h));

      const rootNodeInitInfo = this.getCellRootNodeInitInfo();
      const {
        left: initLeft,
        top: initTop,
        width: initWidth,
        height: initHeight,
      } = rootNodeInitInfo.boundingClientRect;

      // 计算偏移量
      const offsetLeft = l - initLeft;
      const offsetTop = t - initTop;
      debug("resizeCell-offset", `${this._uid}`, offsetLeft, offsetTop);

      // 宽度变化比例(精确)
      const widthChangeRatio = w / initWidth;
      const widthOffset = w - initWidth;
      // 高度变化比例(精确)
      const heightChangeRatio = h / initHeight;
      const heightOffset = h - initHeight;

      // TODO: 为组件使用者提供参数选择缩放插值算法
      // 获得矩形尺寸变化比例，采用的算法：最近邻插值
      // Note: 缩放比例计算方式
      // 1. 最近邻插值：
      // 2. 双线性插值：
      // 3. 双三次插值：
      const changeRatio = Math.min(widthChangeRatio, heightChangeRatio);

      // 解决动画问题
      fixTransitionResizeIssuesStep.install(this);
      // 解决Cell自身缩放问题
      cellSelfResizeStep.install(this);
      // 解决内部元素变更的问题
      fixInnerElementResizeIssuesStep.install(this, {
        w,
        h,
        offsetLeft,
        offsetTop,
        widthChangeRatio,
        heightChangeRatio,
        changeRatio,
        widthOffset,
        heightOffset,
        onHooks,
        parent,
      });

      // 运行所有的resizeStep
      this.runResizeSteps();

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
      const fn = (getChildrenFn = () => [], context = this) => {
        const children = getChildrenFn(context);
        if (children.length === 0) return false;
        return children.some((child) => {
          if (this.isTypeOfCell(child)) {
            return child.isPointInCell(point);
          }
          return fn(getChildrenFn, child);
        });
      };
      return fn((context) => context?.$children, this);
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
      if (this.hasChildrenCellContainsPoint({ x: mouseX, y: mouseY })) return false;

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
          if (!this.enableResizeWidth && Math.floor(width) !== Math.floor(this.width)) return false;
          if (!this.enableResizeHeight && Math.floor(height) !== Math.floor(this.height)) return false;
          return true;
        },
        () => {
          if (this.enableResizeWidth && Math.floor(width) <= 0) return false;
          if (this.enableResizeHeight && Math.floor(height) <= 0) return false;
          return true;
        },
        () => {
          if (this.enableResizeWidth && Math.floor(width) < Math.floor(this.minWidth)) return false;
          if (this.enableResizeHeight && Math.floor(height) < Math.floor(this.minHeight)) return false;
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
      // 不管是否允许，都转发事件
      this.sentEvent(DEF.internalEvent.dragStart, this, e);

      // check enable drag for event
      const mouseX = e.touches ? e.touches[0].pageX : e.pageX;
      const mouseY = e.touches ? e.touches[0].pageY : e.pageY;

      // check the mouse is in the cell child node
      if (this.hasChildrenCellContainsPoint({ x: mouseX, y: mouseY })) return false;

      this.sentEvent(DEF.internalEvent.cellDragStart, this, e);

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
      this.sentEvent(DEF.internalEvent.resizing, this, {
        left,
        top,
        width,
        height,
      });

      const params = JSON.stringify({ left, top, width, height });
      if (this.tempData.lastResizeInfo === params) return;

      this.isResizing = true;
      debug("onResizingEvent", `${this._uid} =`, { left, top, width, height });

      const beforeHooks = [].concat(this.resizeHooks?.beforeResizing || []);
      const afterHooks = [].concat(this.resizeHooks?.afterResizing || []);

      beforeHooks.forEach((hook) => hook(this, left, top, width, height));
      // 同步更新内部元素
      this.resizeCell(left, top, width, height, parent);
      afterHooks.forEach((hook) => hook(this, left, top, width, height));

      // 发送事件
      this.sentEvent(DEF.internalEvent.cellResizing, this, {
        left,
        top,
        width,
        height,
      });

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
      debug(`onResizeStopEvent`, `${this._uid}`, { left, top, width, height });
      this.sentEvent(DEF.internalEvent.resizestop, this, {
        left,
        top,
        width,
        height,
      });

      const beforeHooks = [].concat(this.resizeHooks?.beforeResizeStop || []);
      const afterHooks = [].concat(this.resizeHooks?.afterResizeStop || []);
      beforeHooks.forEach((hook) => hook(this, left, top, width, height));

      // 更新当前容器元素的属性值
      this.changePosition(left, top);
      this.changeSize(width, height);

      // 副作用启动
      this.activeAllResizeEffects();

      // 钩子函数
      afterHooks.forEach((hook) => hook(this, left, top, width, height));

      this.sentEvent(DEF.internalEvent.cellResizeEnd, this, {
        left,
        top,
        width,
        height,
      });
      this.isResizing = false;
    },
    /**
     * 拖拽的回调
     * @param {number} left
     * @param {number} top
     */
    onDraggingEvent(left, top) {
      this.sentEvent(DEF.internalEvent.dragging, this, { left, top });

      const params = JSON.stringify({ left, top });
      if (this.tempData.lastDraggingInfo === params) return;

      this.isDragging = true;
      debug(`onDraggingEvent`, `${this._uid}`);

      const beforeHooks = [].concat(this.dragHooks?.beforeDragging || []);
      const afterHooks = [].concat(this.dragHooks?.afterDragging || []);
      beforeHooks.forEach((hook) => hook(this, left, top));

      // 更新当前容器元素的属性值
      this.changePosition(left, top);

      afterHooks.forEach((hook) => hook(this, left, top));
      this.sentEvent(DEF.internalEvent.cellDragging, this, { left, top });

      // 记录最后一次的改变信息
      this.tempData.lastDraggingInfo = params;
    },
    /**
     * 拖拽结束的事件通知
     * @param {number} left
     * @param {number} top
     */
    onDragEndEvent(left, top) {
      this.sentEvent(DEF.internalEvent.dragEnd, { left, top });

      const beforeHooks = [].concat(this.dragHooks?.beforeDragEnd || []);
      const afterHooks = [].concat(this.dragHooks?.afterDragEnd || []);
      beforeHooks.forEach((hook) => hook(this, left, top));

      // 更新当前容器元素的属性值
      this.changePosition(left, top);

      afterHooks.forEach((hook) => hook(this, left, top));
      this.sentEvent(DEF.internalEvent.cellDragEnd, this, { left, top });

      this.isDragging = false;
    },
    /**
     * 挂载激活事件
     */
    onActivatedEvent() {
      this.sentEvent(DEF.internalEvent.activated, this);
    },
    /**
     * 未激活选择事件
     */
    onDeactivatedEvent() {
      this.sentEvent(DEF.internalEvent.deactivated, this);
    },
  },
};
</script>
<style lang="less" scoped>
.cell-hide-border {
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
