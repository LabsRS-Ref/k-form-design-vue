/* eslint-disable camelcase, no-unused-vars */
<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-02-14 15:21:25
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 * @LastEditTime : 2022-04-02 16:34:52
 * @FilePath     : /k-form-design-vue/packages/VueDraggableResizableCell/Cell-debug.vue
 * @Description  : Created by sunzhifeng, Please coding something here
-->
<template>
  <VueDraggableResizable
    v-lazy-load
    :x="left"
    :y="top"
    :z="zIndex"
    :w="width"
    :h="height"
    :axis="axis"
    :grid="grid"
    :scale="scale"
    :prevent-deactivation="preventDeactivation"
    :disable-user-select="disableUserSelect"
    :enable-native-drag="enableNativeDrag"
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
    :active="active"
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
import "mutationobserver-shim";
import VueDraggableResizable from "vue-draggable-resizable";
import "vue-draggable-resizable/dist/VueDraggableResizable.css";

// # 定义
import DEF from "./def";
import props from "./props";
import createState from "./state";
import { createLazyLoadDirective } from "./directives";
import {
  debug as debugUtil,
  assignNoNullValue,
  checkAssert,
  checkToDo,
  isFunction,
  tryRunHooks,
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
    cacheDefaultLayout: 0,
    "resizeCell-offset": 0,
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
        const fn = ctx?.initDefaultLayout;
        if (isFunction(fn)) {
          fn({ ...data });
        }
      }
    }),
  },
  props,
  data() {
    return createState(this);
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
      return this.finalResizeScope.includes("width");
    },
    enableResizeHeight() {
      return this.finalResizeScope.includes("height");
    },
    enableResizeSvgSize() {
      return this.finalResizeScope.includes("svg-size");
    },
    enableResizeFontSize() {
      return this.finalResizeScope.includes("font-size");
    },
    enableResizeLineHeight() {
      return this.finalResizeScope.includes("line-height");
    },
    enableResizeNestingCell() {
      return this.finalResizeScope.includes("nesting-cell");
    },
    enableResizeInnerElementSize() {
      return this.finalResizeScope.includes("inner-element-size");
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
        .filter((item) => Object.values(item).some(Boolean))
        .map((item) => Object.keys(item)[0]);
    },
    wrapperSize() {
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
    wrapperSize(val, oldVal) {
      debug(
        "watch",
        `[vid=${this._uid},parent=${this.cell.parent?._uid}] wrapper size change`,
        val,
        oldVal
      );
      this.updateChildLayout({
        left: this.left,
        top: this.top,
        width: val.width,
        height: val.height,
      });
    },
    xy(val, oldVal) {
      debug(
        "watch",
        `[vid=${this._uid},parent=${this.cell.parent?._uid}] xy change`,
        val,
        oldVal
      );
      this.changePosition(val.x, val.y);
    },
    wh(val, oldVal) {
      debug(
        "watch",
        `[vid=${this._uid},parent=${this.cell.parent?._uid}] xywh change`,
        val,
        oldVal
      );
      this.changeSize(val.w, val.h);
    },
  },
  created() {
    debug("created", `[vid=${this._uid},parent=${this.cell.parent?._uid}]`);
    this.updateHierarchy();
    store.cells.push(this);
    this.sentEvent(DEF.internalEvent.created, this);
  },
  beforeMount() {
    debug(
      "beforeMount",
      `[vid=${this._uid},parent=${this.cell.parent?._uid}]`,
      this.xy,
      this.wh
    );
    this.initHooks();
    this.sentEvent(DEF.internalEvent.beforeMount, this);
  },
  mounted() {
    debug(
      "mounted",
      `[vid=${this._uid},parent=${this.cell.parent?._uid}]`,
      this.getCellWrapperElement()
    );
    // 元素挂载后的所有操作，统一调用
    this._onMounted();
  },
  updated() {
    debug("updated", this._uid);
    this.sentEvent(DEF.internalEvent.updated, this);
  },
  beforeUnmount() {
    debug(
      "beforeDestroy",
      `[vid=${this._uid},parent=${this.cell.parent?._uid}]`
    );
    // 发送要销毁事件
    this.sentEvent(DEF.internalEvent.beforeDestroy, this);
  },
  unmounted() {
    debug("destroyed", this._uid);
    splice(store.cells, this);
    const { parent } = this.cell;
    splice(parent?.cell?.children, this);
    this.sentEvent(DEF.internalEvent.destroyed, this);
  },
  methods: {
    /** 统一由函数发送事件 */
    sentEvent(eventName, ...args) {
      debug(
        "sentEvent",
        `[vid=${this._uid},parent=${this.cell.parent?._uid}]`,
        eventName,
        ...args
      );
      this.$emit(eventName, ...args);
    },
    /** Vue 生命周期 onMounted 回调函数 */
    _onMounted() {
      // HACK: 因为在mounted之后，this.getCellWrapperElement()还没有初始化，所以需要延迟执行
      // STUB: 发现这个时候拿到的是的 #comment节点，而不是真正的 #wrapper节点
      const init = () => {
        // 初始化最原始的计算布局状态, 其他部分的计算布局状态都是基于这个状态的
        debug(
          "_onMounted::initDefaultLayout",
          `[vid=${this._uid},parent=${this.cell.parent?._uid}]`
        );
        this.initDefaultLayout();
        // 根据外部配置强制更新子元素布局 (尺寸有效，才强制更新, 并使用自动计算的最佳尺寸中的最大值作为最终尺寸)
        if (this.w >= 0 && this.h >= 0) {
          debug(
            "_onMounted::updateChildLayout",
            `[vid=${this._uid},parent=${this.cell.parent?._uid}]`
          );
          this.updateChildLayout({
            left: this.x,
            top: this.y,
            width: Math.max(this.w, this.width),
            height: Math.max(this.h, this.height),
          });
        }

        // 安装观察服务
        if (this.resizable) {
          this.installObserveService();
        }

        // 发送挂载事件
        this.sentEvent(DEF.internalEvent.mounted, this);
      };

      // 检测挂载的元素不是comment节点, 必须是 Element 节点
      if (this.getInnerElement()?.nodeType === Node.ELEMENT_NODE) {
        init();
      } else {
        this.$nextTick(this._onMounted);
      }
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
      debug(
        "updateHierarchy",
        `${this._uid} created`,
        `parent:${this.$parent._uid}`,
        {
          store,
          this: this,
          parentCell,
        }
      );
    },
    /** 检测是否支持被观察 */
    checkEnableBeObserved(ele) {
      return (
        ele?.nodeType === window.Node.ELEMENT_NODE &&
        !this.roObserveEleList.includes(ele)
      );
    },
    /** 安装观察服务 */
    installObserveService() {
      debug(
        "installObserveService::begin",
        `[vid=${this._uid},parent=${this.cell.parent?._uid}]`
      );
      // 声明要观察的属性，影响size的属性还是比较多的，
      const observeAttributeNames = ["style"]; // no_use

      // 初始化resize观察者
      this.ro = new MutationObserver((mutationsList, observer) => {
        const beforeHooks = [].concat(this.observeHooks?.before || []);
        const onHooks = [].concat(this.observeHooks?.on || []);
        const afterHooks = [].concat(this.observeHooks?.after || []);

        // beforeHooks
        if (!tryRunHooks(beforeHooks, [this, mutationsList, observer])) {
          return;
        }

        const debugGroupName = "ObserveService::resize::callback";
        debug(
          `${debugGroupName}::begin`,
          `[vid=${this._uid},parent=${this.cell.parent?._uid}]`,
          mutationsList
        );

        if (
          this.isDragging ||
          this.isResizing ||
          this.getInnerElement()?.nodeType !== Node.ELEMENT_NODE
        ) {
          return;
        }

        const wrapperSize = this.getCellBestWrapperSize({
          consultWidth: 0,
          consultHeight: 0,
          recursiveCalcChildrenNodes: true,
        });

        // Hooks: 更新wrapper的尺寸
        if (
          !tryRunHooks(onHooks, [this], {
            wrapperSize,
            mutationsList,
            observer,
            cell: this.getInnerElement(),
            borderSize: this.calcRectWithWrapperBorderEx(0, 0),
          })
        ) {
          return;
        }

        debug(
          `${debugGroupName}::calc`,
          `[vid=${this._uid},parent=${this.cell.parent?._uid}]`,
          {
            wrapperSize,
            width: this.width,
            height: this.height,
          }
        );

        // 获取到最佳的，被要求的尺寸。(Note: consultWidth，consultHeight如果大于0且大于Wrapper的尺寸，会优先被使用)
        // 问题: 子元素放大尺寸，效果还可以接收，子元素缩小后，效果不理想。
        // 解决：通过设置边界， childNodeMaxWidth !== -1， childNodeMaxHeight !== -1 排除掉
        const willUpdateLayout = [
          wrapperSize.width !== this.width,
          wrapperSize.height !== this.height,
        ].some(Boolean);

        debug(
          `${debugGroupName}::willUpdateLayout`,
          `[vid=${this._uid},parent=${this.cell.parent?._uid}]`,
          willUpdateLayout
        );

        if (willUpdateLayout) {
          // 更新所有子节点布局
          this.updateChildLayout({
            left: this.left,
            top: this.top,
            width: wrapperSize.width,
            height: wrapperSize.height,
          });
        }

        debug(
          `${debugGroupName}::end`,
          `[vid=${this._uid},parent=${this.cell.parent?._uid}]`
        );

        // Hooks: 更新wrapper的尺寸
        tryRunHooks(afterHooks, [this, mutationsList, observer]);
      });

      // 哪些元素纳入观察队列
      const cellEle = this.getInnerElement();

      if (this.checkEnableBeObserved(cellEle)) {
        this.roObserveEleList.push(cellEle);

        // 问题: 有的组件子元素太多，都观察性能堪忧，应该提供主要观察的元素，更有效解决
        // 解决方案：引入关键子元素因子
        const kifElements = this.getKIFOfElements(cellEle, this);

        // 将子孙元素也加入观察
        const enableChildObserve = false;
        if (enableChildObserve) {
          forEachNode(cellEle, (htmlNode, index, list, level) => {
            const nestingCell = this.getANestedLevel0ChildCell(htmlNode);
            if (nestingCell) {
              return false;
            }

            if (this.checkEnableBeObserved(htmlNode)) {
              this.roObserveEleList.push(htmlNode);
              this.ro.observe(htmlNode);
            }

            // 是否存在关键子元素因子，如果存在，后续的子元素不再观察
            if (kifElements.includes(htmlNode)) {
              return false;
            }

            return true;
          });
        }

        // 观察Cell的尺寸变化
        this.ro.observe(cellEle, {
          childList: true,
          attributes: true,
          attributeFilter: observeAttributeNames, // 影响size的属性还是比较多的，简单化暂时不做严格处理，直接把所有的属性都观察
          subtree: true,
        });
      }

      this.$once("hook:beforeDestroy", () => {
        // 卸载观察服务
        this.uninstallObserveService();
      });

      debug(
        "installObserveService::end",
        `[vid=${this._uid},parent=${this.cell.parent?._uid}]`,
        {
          roObserveEleList: this.roObserveEleList,
          ro: this.ro,
        }
      );
    },
    /** 卸载观察服务 */
    uninstallObserveService() {
      debug(
        "uninstallObserveService",
        `[vid=${this._uid},parent=${this.cell.parent?._uid}]`
      );
      this.roObserveEleList = [];
      this.ro.disconnect();
      delete this.ro;
    },
    /**
     * 独立方法：用于统一处理组件挂载后的整体操作
     * 初始化默认布局信息：计算及更新布局，包括子元素的布局
     * @param {number} consultLeft 参考左边距, 默认 null, 相对于父元素，用于平移transform特性
     * @param {number} consultTop 参考顶边距, 默认 null, 相对于父元素，用于平移transform特性
     * @param {number} consultWidth 参考宽度，默认0
     * @param {number} consultHeight 参考高度，默认0
     */
    initDefaultLayout({
      consultLeft = this.left,
      consultTop = this.top,
      consultWidth = 0,
      consultHeight = 0,
    } = {}) {
      debug("initDefaultLayout", `${this._uid}`, {
        consultLeft,
        consultTop,
        consultWidth,
        consultHeight,
      });
      const [left, top] = [consultLeft, consultTop];

      // 自适应内部元素的大小(考虑line-height的影响)
      const { width, height } = this.getCellBestWrapperSize({
        consultWidth,
        consultHeight,
        recursiveCalcChildrenNodes: true,
      });

      // 缓存默认布局信息
      this.cacheDefaultLayout({
        left,
        top,
        width,
        height,
      });
      this.cell.aspectRatioInitialized = true;

      // 调用钩子函数, 方便开发者自定义操作, 开发者可以修改实例的属性及状态
      // @example (self) => {self.width = 100; self.height = 100;}
      this.initDefaultLayoutHook(this, { consultWidth, consultHeight });

      // 变更位置及尺寸
      this.updateChildLayout({
        left,
        top,
        width,
        height,
      });
    },
    /**
     * 获取内部事件类型
     */
    getInternalEventType() {
      return DEF.internalEvent;
    },
    /**
     * 获得挂载后的元素，特指包裹元素
     */
    getCellWrapperElement() {
      return this.$el;
    },
    /**
     * 获得内部单元的VNode
     */
    getVNodeOfInnerElement() {
      checkAssert(this.$children.length > 0, "The cell node is not available");
      // 挂载完成后，才有$children
      if (this.$children.length < 1) return null;
      return this.$children[0].$slots.default[0];
    },
    /**
     * 获得内部单元
     */
    getInnerElement() {
      const { elm = null } = this.getVNodeOfInnerElement();
      // STUB: 如果没有elm，则返回null
      // checkAssert(elm?.nodeType !== Node.ELEMENT_NODE, "The cell node is not available, must a element node", {
      //   elm,
      //   nodeType: elm?.nodeType,
      // });
      return elm;
    },
    /**
     * 获得内部单元的边界矩形信息
     */
    getInnerEleBoundingClientRect() {
      const ele = this.getInnerElement();
      return getBoundingClientRect(ele);
    },
    getInnerEleLineHeight() {
      const ele = this.getInnerElement();
      return parseFloat(window.getComputedStyle(ele).lineHeight);
    },
    getInnerEleScrollSize() {
      const ele = this.getInnerElement();
      return {
        width: ele?.scrollWidth || 0,
        height: ele?.scrollHeight || 0,
      };
    },
    getInnerEleOffsetSize() {
      const ele = this.getInnerElement();
      // [Bug] svg图标
      return {
        width: ele?.offsetWidth || 0,
        height: ele?.offsetHeight || 0,
      };
    },
    /**
     * 获得内部单元相对于文档的偏移量矩形信息
     */
    getInnerEleOffsetRect() {
      const rect = this.getInnerEleBoundingClientRect();
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
    getCellWrapperElementOffsetRect() {
      const ele = this.getCellWrapperElement();
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      return new DOMRect(
        ele.offsetLeft + scrollLeft,
        ele.offsetTop + scrollTop,
        ele.offsetWidth,
        ele.offsetHeight
      );
    },
    /**
     * 获得关键影响Wrapper尺寸的子元素数组
     */
    getKIFOfElements(rootEle, ...args) {
      const kifElementList = [];
      const kif = this.wrapperSizeKIFOfElements;

      // 定义一个函数，用于获取子元素的约束
      const extractFnc = (data, relativeEle, ...options) => {
        [].concat(data).forEach((item) => {
          const array = [];
          if (isFunction(item)) {
            array.push(...[].concat(item(...options)));
          } else {
            array.push(...[].concat(item));
          }

          array.forEach((o) => {
            if (o?.nodeType === window.Node.ELEMENT_NODE) {
              kifElementList.push(o);
            } else if (o?.nodeType === window.Node.TEXT_NODE) {
              kifElementList.push(o.parentElement);
            } else if (typeof o === "string") {
              kifElementList.push(relativeEle.querySelector(o));
            }
          });
        });
      };

      if (isFunction(kif)) {
        const array = [].concat(kif(...args));
        extractFnc(array, rootEle, ...args);
      } else if (Array.isArray(kif) || typeof kif === "string") {
        extractFnc([].concat(kif), rootEle, ...args);
      }

      debug("getKIFOfElements", `${this._uid}`, {
        kifElementList,
        kif,
        args,
      });

      return kifElementList;
    },
    getKIFOfElementsMaxRect() {
      const ele = this.getInnerElement();
      const kifEleList = this.getKIFOfElements(ele, this);

      // 选择最优的数值
      const useBest = (args) => Math.max(...args);

      let maxWidth = -1;
      let maxHeight = -1;

      // 计算关键影响子元素的最大宽高
      kifEleList.forEach((kifEle) => {
        const { width, height } = getBoundingClientRect(kifEle);
        maxWidth = useBest([maxWidth, width]);
        maxHeight = useBest([maxHeight, height]);
      });

      return {
        width: maxWidth,
        height: maxHeight,
      };
    },
    /**
     * 获得Cell最佳的包裹宽高
     * @param {number} consultWidth 参考宽度
     * @param {number} consultHeight 参考高度
     * @param {boolean} recursiveCalcChildrenNodes 递归计算子元素的最佳包裹宽高 (默认false)
     * @returns {object} {width, height}
     */
    getCellBestWrapperSize({
      consultWidth = 0,
      consultHeight = 0,
      recursiveCalcChildrenNodes = false,
    } = {}) {
      debug("getCellBestWrapperSize::begin", `${this._uid}`, {
        consultWidth,
        consultHeight,
        recursiveCalcChildrenNodes,
      });
      const rect = this.getInnerEleBoundingClientRect();
      const { width: scrollWidth, height: scrollHeight } =
        this.getInnerEleScrollSize();
      const { width: offsetWidth, height: offsetHeight } =
        this.getInnerEleOffsetSize();

      // 选择最优的数值
      const useBest = (args) => Math.max(...args);

      const ele = this.getInnerElement();
      // 有些元素，不能获取offsetWidth和offsetHeight， 例如：SVG元素，需要使用scrollWidth和scrollHeight
      const useScrollSize = ["SVG"].includes(ele?.nodeName);

      // 有的时候，子元素的宽度和高度都超过了容器
      let childNodeMaxWidth = 0;
      let childNodeMaxHeight = 0;

      // 问题: 如果子元素太多，会影响性能，应该提供一个配置项，只检测指定的元素大小及方法
      // 解决方案: 检测是否有设置关键影响因子. 配置项，可以指定检测的元素，以及检测的方法
      // 计算关键影响子元素的最大宽高
      const { width: kifEleMaxWidth, height: kifEleMaxHeight } =
        this.getKIFOfElementsMaxRect();

      if ([kifEleMaxWidth, kifEleMaxHeight].some((item) => item > 0)) {
        childNodeMaxWidth = kifEleMaxWidth;
        childNodeMaxHeight = kifEleMaxHeight;
      } else if (recursiveCalcChildrenNodes) {
        // 递归所有子节点
        forEachNode(ele, (htmlNode) => {
          const { width, height } = getBoundingClientRect(htmlNode);
          // TODO: 是否考虑 offset 和 scrollSize
          childNodeMaxWidth = Math.max(childNodeMaxWidth, width || 0);
          childNodeMaxHeight = Math.max(childNodeMaxHeight, height || 0);

          // 检测是否为子Cell，如果是，则不需要再深入检测了。
          const nestingCell = this.getANestedLevel0ChildCell(htmlNode);
          if (nestingCell) {
            return false;
          }

          return true;
        });
      }

      const [calcWidth, calcHeight] = [
        useBest([
          rect.width,
          offsetWidth,
          consultWidth,
          this.minWidth,
          ...[useScrollSize ? scrollWidth : 0],
        ]),
        useBest([
          rect.height,
          offsetHeight,
          consultHeight,
          this.minHeight,
          ...[useScrollSize ? scrollHeight : 0],
        ]),
      ];

      // 如果采用的子元素最大的尺寸，那么需要计算Cell的Border的尺寸，用以容纳子元素的边界
      // NOTE: 特别要注意，这里要计算的是不是Vue实例关联的元素，而是slot提供的元素
      // 计算最佳宽高
      const { width: finalWidth, height: finalHeight } =
        this.calcRectWithWrapperBorderEx(
          useBest([calcWidth, childNodeMaxWidth]),
          useBest([calcHeight, childNodeMaxHeight])
        );

      const context = {
        runtime: {
          finalWidth,
          finalHeight,
          calcWidth,
          calcHeight,
          childNodeMaxWidth,
          childNodeMaxHeight,
          offsetWidth,
          offsetHeight,
          scrollWidth,
          scrollHeight,
          rect,
          ele,
        },
        params: {
          consultWidth,
          consultHeight,
          recursiveCalcChildrenNodes,
        },
      };
      // TODO: 补充针对maxWidth，maxHeight的处理
      debug("getCellBestWrapperSize::end", `${this._uid}`, context);

      // 声明最佳的矩形
      const bestRect = {
        width: finalWidth,
        height: finalHeight,
      };

      // 调用hook，可以附加操作，允许组件使用者，自己控制最佳的矩形
      tryRunHooks(
        this.coreHooks?.getCellBestWrapperSize,
        [this, bestRect],
        context
      );

      return bestRect;
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
    isTypeOfCell(vueInstance = null) {
      const { $options: options } = vueInstance ?? {};
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
        return true;
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

      const ref = {
        nestingCell,
      };

      // 调用hook，可以附加操作，允许组件使用者，自己控制
      tryRunHooks(this.coreHooks?.getANestedLevel0ChildCell, [this, ref], {
        node,
      });

      return ref.nestingCell;
    },
    /**
     * 判断点是否在元素内
     * @param {Object} point 点, 注意使用的是PageX和PageY
     * @summary 注意文档滚动
     */
    isPointInCell(point = { x: 0, y: 0 }) {
      const rect = this.getCellWrapperElementOffsetRect();
      return isPointInDOMRect(point, rect);
    },
    isPointInInnerElement(point = { x: 0, y: 0 }) {
      const rect = this.getInnerEleOffsetRect();
      return isPointInDOMRect(point, rect);
    },
    /**
     * 初始化WebEventHooks
     *
     * @param {Object} hookMap
     * @param {VNode} vnode
     * @param {function} getProperty
     */
    private_initEventHooks(
      hookMap = {},
      vnode = null,
      getProperty = ($vnode) => {}
    ) {
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
    cacheDefaultLayout({ left = 0, top = 0, width = 1, height = 1 }) {
      debug("cacheDefaultLayout", `${this._uid}`, { width, height });
      const ele = this.getInnerElement();
      const beforeHooks = [].concat(
        this.InnerNodeRawDataHooks?.beforeInit || []
      );
      const onCacheHooks = [].concat(
        this.InnerNodeRawDataHooks?.onCacheEachNode || []
      );
      const afterHooks = [].concat(this.InnerNodeRawDataHooks?.afterInit || []);

      if (
        !tryRunHooks(beforeHooks, [this], { ele, left, top, width, height })
      ) {
        return;
      }

      // 原本的宽高比
      const aspectRatio = width / height;

      // 标记元素
      let key = -1;
      forEachNode(
        ele,
        // callback
        (node, index, list, level, parentNode) => {
          // eslint-disable-next-line no-param-reassign
          node[this.privateMarkPropertyName] = key;

          // 定义扩展信息
          let extraInfo = {};
          onCacheHooks.forEach(
            // eslint-disable-next-line no-return-assign
            (hook) =>
              (extraInfo = Object.assign(
                extraInfo,
                hook(this, node, key, extraInfo) || {}
              ))
          );

          // HACK: 出现嵌套子Cell的情况，是否需要处理, 直接放弃处理，交由子Cell自己处理
          const nestingCell = this.getANestedLevel0ChildCell(node);
          if (nestingCell) {
            return false;
          }

          const boundingClientRect = getBoundingClientRect(node);
          const fontSize = parseFloat(
            this.getHTMLElementComputedStyle(node, "font-size")
          );
          const lineHeight = parseFloat(
            this.getHTMLElementComputedStyle(node, "line-height")
          );
          const getDefaultFontSize = getDocumentElementFontSize;
          const vnode = node?.__vue__?.$vnode ?? null;

          if (!vnode) {
            // TODO: 验证VNode不存在的情况，是否正常
            // checkToDo(vnode, "vnode is null", { node });
          }

          this.cell.cache[key] = this.cell.cache[key] ?? {};

          // 公共数据
          const common = {
            // 对应的VNode节点
            vnode,
            // 关联的ParentNode
            parentNode,
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
              // wrapper = this.getCellWrapperElement()
              wrapper: {
                // 相对于Wrapper的相对位置
                left,
                top,
                width,
                height,
                // 相对于视口的矩形
                boundingClientRect: getBoundingClientRect(
                  this.getCellWrapperElement()
                ),
                // 边框
                border: this.getCellWrapperBorder(),
              },
            });

          // 要缓存的属性
          this.cell.cache[key] = Object.freeze({
            // 扩展属性
            ...extraInfo,
            // 公共属性
            ...common,
            // 初始化状态
            initial,
            // HTML Node
            node,
            // 是否是Cell根节点，只有key === -1时才是
            isRootNode: key === -1,
          });

          // key自增
          key += 1;

          return true;
        },
        // context
        { parent: this.getCellWrapperElement() }
      );

      tryRunHooks(afterHooks, [this], { ele, left, top, width, height });
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
          context = newContext;
          step = newStep;
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
    getInnerChildRawDataByKey(key) {
      return this.cell.cache[key];
    },
    /**
     * 获得根Cell节点的初始化数据
     */
    getInnerRootNodeRawData() {
      return this.cell.cache[-1];
    },
    /**
     * 获得Cell最原始的样式信息
     */
    getInnerRootNodeOriginalStyle() {
      return this.getInnerRootNodeRawData().style;
    },
    /**
     * 获得挂载元素的Border信息
     */
    getCellWrapperBorder() {
      const wrapperElement = this.getCellWrapperElement();
      const [
        borderLeftWidth,
        borderRightWidth,
        borderTopWidth,
        borderBottomWidth,
      ] = [
        parseFloat(window.getComputedStyle(wrapperElement).borderLeftWidth),
        parseFloat(window.getComputedStyle(wrapperElement).borderRightWidth),
        parseFloat(window.getComputedStyle(wrapperElement).borderTopWidth),
        parseFloat(window.getComputedStyle(wrapperElement).borderBottomWidth),
      ];
      return {
        borderLeftWidth,
        borderRightWidth,
        borderTopWidth,
        borderBottomWidth,
      };
    },
    /**
     * 计算挂载元素的Border信息的矩形区域
     */
    calcRectWithWrapperBorder(rect) {
      const {
        borderLeftWidth,
        borderRightWidth,
        borderTopWidth,
        borderBottomWidth,
      } = this.getCellWrapperBorder();
      return {
        left: rect.left - borderLeftWidth,
        top: rect.top - borderTopWidth,
        width: rect.width + borderLeftWidth + borderRightWidth,
        height: rect.height + borderTopWidth + borderBottomWidth,
      };
    },
    /**
     * 计算挂载元素的Border信息的矩形区域扩展函数
     */
    calcRectWithWrapperBorderEx(w, h) {
      return this.calcRectWithWrapperBorder({
        left: 0,
        top: 0,
        width: w,
        height: h,
      });
    },
    /**
     * 获得挂载元素的初始化数据
     */
    getWrapperInitialData() {
      const rootNodeRawData = this.getInnerRootNodeRawData();
      return rootNodeRawData.initial.wrapper;
    },
    /** 更新所有子节点布局 */
    updateChildLayout({ left = 0, top = 0, width = 0, height = 0 } = {}) {
      debug("updateChildLayout", `${this._uid}`, { left, top, width, height });
      // 重新调整Cell的布局
      this.resizeCell(left, top, width, height);
      // 副作用启动
      this.activeAllResizeEffects();
      // 重新更新Cell的位置及尺寸
      this.changePosition(left, top);
      this.changeSize(width, height);

      // 调用hook，可以附加操作，允许组件使用者，自己控制
      tryRunHooks(this.coreHooks?.updateChildLayout, [this], {
        left,
        top,
        width,
        height,
      });
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
      debug("resizeCell ::begin", `${this._uid}`, { l, t, w, h, parent });

      const beforeHooks = [].concat(this.resizeHooks?.beforeResizeCell || []);
      const afterHooks = [].concat(this.resizeHooks?.afterResizeCell || []);
      const onHooks = [].concat(
        this.resizeHooks?.onResizeCellForEachNode || []
      );
      beforeHooks.forEach((hook) => hook(this, { l, t, w, h, parent }));

      // 获得Cell的包裹节点（this.$el元素）的初始化尺寸
      const {
        left: wrapperInitialLeft,
        top: wrapperInitialTop,
        width: wrapperInitialWidth,
        height: wrapperInitialHeight,
      } = this.getWrapperInitialData();

      // 获得Cell的包裹节点（this.$el元素）的Border大小
      const {
        borderLeftWidth,
        borderTopWidth,
        borderRightWidth,
        borderBottomWidth,
      } = this.getCellWrapperBorder();
      const blr = borderLeftWidth + borderRightWidth;
      const btb = borderTopWidth + borderBottomWidth;

      // 计算位置的偏移量 （由于包裹组件使用 translate css 样式解决位置变化，因此始终直接传入 (0,0) 就可以）
      const leftOffset = 0; //  l - wrapperInitialLeft;
      const topOffset = 0; // t - wrapperInitialTop;

      // 计算宽高的偏移量
      const widthOffset = w - wrapperInitialWidth;
      const heightOffset = h - wrapperInitialHeight;

      debug("resizeCell-offset", `${this._uid}`, {
        leftOffset,
        topOffset,
        widthOffset,
        heightOffset,
      });

      // 宽度变化比例(精确)
      const widthChangeRatio = (w - blr) / (wrapperInitialWidth - blr);
      // 高度变化比例(精确)
      const heightChangeRatio = (h - btb) / (wrapperInitialHeight - btb);

      // TODO: 为组件使用者提供参数选择缩放插值算法
      // 获得矩形尺寸变化比例，采用的算法：最近邻插值
      // Note: 缩放比例计算方式
      // 1. 最近邻插值：
      // 2. 双线性插值：
      // 3. 双三次插值：
      const changeRatio = Math.min(widthChangeRatio, heightChangeRatio);

      // 公共Resize步骤Options
      const options = {
        w,
        h,
        leftOffset,
        topOffset,
        widthOffset,
        heightOffset,
        widthChangeRatio,
        heightChangeRatio,
        changeRatio,
        onHooks,
        parent,
      };

      // hooks
      Array.from([])
        .concat(this.resizeHooks?.beforeInternalResizeStepsRegister || [])
        .forEach((hook) => hook(this, options, { l, t, w, h, parent }));

      // 解决动画问题
      fixTransitionResizeIssuesStep.install(this, options);
      // 解决Cell自身缩放问题
      cellSelfResizeStep.install(this, options);
      // 解决内部元素变更的问题
      if (this.enableResizeInnerElementSize) {
        fixInnerElementResizeIssuesStep.install(this, options);
      }

      // hooks
      Array.from([])
        .concat(this.resizeHooks?.afterInternalResizeStepsRegister || [])
        .forEach((hook) => hook(this, options, { l, t, w, h, parent }));

      // 运行所有的resizeStep
      this.runResizeSteps();

      // after hooks
      afterHooks.forEach((hook) => hook(this, { l, t, w, h, parent }));

      debug("resizeCell ::end", `${this._uid}`, { l, t, w, h, parent });
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
            Math.floor(width) !== Math.floor(this.width)
          )
            return false;
          if (
            !this.enableResizeHeight &&
            Math.floor(height) !== Math.floor(this.height)
          )
            return false;
          return true;
        },
        () => {
          if (this.enableResizeWidth && Math.floor(width) <= 0) return false;
          if (this.enableResizeHeight && Math.floor(height) <= 0) return false;
          return true;
        },
        () => {
          if (
            this.enableResizeWidth &&
            Math.floor(width) < Math.floor(this.minWidth)
          )
            return false;
          if (
            this.enableResizeHeight &&
            Math.floor(height) < Math.floor(this.minHeight)
          )
            return false;
          return true;
        },
        () => {
          // 外部函数调用检查是否可以继续Resize
          return (
            this.checkEnableContinueResize(handle, left, top, width, height) &&
            true
          );
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

      let allow = true;

      // check the mouse is in the cell child node
      if (this.hasChildrenCellContainsPoint({ x: mouseX, y: mouseY })) {
        allow = false;
      }

      // 调用外部函数检查是否允许拖拽
      if (isFunction(this?.checkEnableDragStart)) {
        allow = this.checkEnableDragStart(this, e);
      }

      this.sentEvent(DEF.internalEvent.cellDragStart, this, e, allow);

      return allow;
    },
    /**
     * 是否允许拖拽继续
     * @param {number} left 新的left值
     * @param {number} top 新的top值
     * @returns {boolean} true, 允许，false，不允许
     */
    checkAllowContinueDrag(left = 0, top = 0) {
      // check enable drag for left or top
      // 外部函数检查是否可以继续拖拽
      const beAllowed =
        this.checkEnableContinueDrag(left, top, this.width, this.height) &&
        true;
      return beAllowed;
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
      this.isResizing = true;
      debug("onResizingEvent", `${this._uid} =`, {
        left,
        top,
        width,
        height,
        parent,
      });

      this.sentEvent(DEF.internalEvent.resizing, this, {
        left,
        top,
        width,
        height,
        parent,
      });

      const params = JSON.stringify({ left, top, width, height });
      if (this.tempData.lastResizeInfo === params) return;

      const beforeHooks = [].concat(this.resizeHooks?.beforeResizing || []);
      const afterHooks = [].concat(this.resizeHooks?.afterResizing || []);

      beforeHooks.forEach((hook) =>
        hook(this, left, top, width, height, parent)
      );
      // 同步更新内部元素
      this.resizeCell(left, top, width, height, parent);
      afterHooks.forEach((hook) =>
        hook(this, left, top, width, height, parent)
      );

      // 发送事件
      this.sentEvent(DEF.internalEvent.cellResizing, this, {
        left,
        top,
        width,
        height,
        parent,
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
     * @param {object} parent 用于嵌套Cell的指明有谁引起的，直接穿透
     */
    onResizeStopEvent(left, top, width, height, parent = null) {
      debug(`onResizeStopEvent`, `${this._uid}`, { left, top, width, height });
      this.sentEvent(DEF.internalEvent.resizestop, this, {
        left,
        top,
        width,
        height,
        parent,
      });

      const beforeHooks = [].concat(this.resizeHooks?.beforeResizeStop || []);
      const afterHooks = [].concat(this.resizeHooks?.afterResizeStop || []);
      beforeHooks.forEach((hook) =>
        hook(this, left, top, width, height, parent)
      );

      // 同步更新内部元素
      this.resizeCell(left, top, width, height, parent);

      // 更新当前容器元素的属性值
      this.changePosition(left, top);
      this.changeSize(width, height);

      // 副作用启动
      this.activeAllResizeEffects();

      // 钩子函数
      afterHooks.forEach((hook) =>
        hook(this, left, top, width, height, parent)
      );

      this.sentEvent(DEF.internalEvent.cellResizeEnd, this, {
        left,
        top,
        width,
        height,
        parent,
      });
      this.isResizing = false;
      this.tempData.lastResizeInfo = null;
    },
    /**
     * 拖拽的回调
     * @param {number} left
     * @param {number} top
     */
    onDraggingEvent(left, top) {
      this.isDragging = true;
      debug(`onDraggingEvent`, `${this._uid}`);
      const { width, height } = this;

      this.sentEvent(DEF.internalEvent.dragging, this, {
        left,
        top,
        width,
        height,
      });

      const params = JSON.stringify({ left, top });
      if (this.tempData.lastDraggingInfo === params) return;

      const beforeHooks = [].concat(this.dragHooks?.beforeDragging || []);
      const afterHooks = [].concat(this.dragHooks?.afterDragging || []);
      beforeHooks.forEach((hook) => hook(this, left, top));

      // 更新当前容器元素的属性值
      this.changePosition(left, top);

      afterHooks.forEach((hook) => hook(this, left, top));
      this.sentEvent(DEF.internalEvent.cellDragging, this, {
        left,
        top,
        width,
        height,
      });

      // 记录最后一次的改变信息
      this.tempData.lastDraggingInfo = params;
    },
    /**
     * 拖拽结束的事件通知
     * @param {number} left
     * @param {number} top
     */
    onDragEndEvent(left, top) {
      debug(`onDragEndEvent`, `${this._uid}`);
      const { width, height } = this;

      this.sentEvent(DEF.internalEvent.dragEnd, { left, top, width, height });

      const beforeHooks = [].concat(this.dragHooks?.beforeDragEnd || []);
      const afterHooks = [].concat(this.dragHooks?.afterDragEnd || []);
      beforeHooks.forEach((hook) => hook(this, left, top));

      // 更新当前容器元素的属性值
      this.changePosition(left, top);

      afterHooks.forEach((hook) => hook(this, left, top));
      this.sentEvent(DEF.internalEvent.cellDragEnd, this, {
        left,
        top,
        width,
        height,
      });

      this.isDragging = false;
      this.tempData.lastDraggingInfo = null;
    },
    /**
     * 挂载激活事件
     */
    onActivatedEvent() {
      this.isActive = true;
      this.sentEvent(DEF.internalEvent.activated, this);
    },
    /**
     * 未激活选择事件
     */
    onDeactivatedEvent() {
      this.isActive = false;
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
