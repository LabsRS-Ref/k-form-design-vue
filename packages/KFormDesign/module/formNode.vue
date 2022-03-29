<!--
 * @Description: 将数据通过k-form-item组件解析，生成控件
 * @Author: kcz
 * @Date: 2019-12-30 00:37:05
 * @LastEditTime : 2022-03-29 14:21:15
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/formNode.vue
 -->
<template>
  <div v-if="vdrCellEnabled">
    <component ref="wrapper" :is="wrapper" v-bind="wrapperProps" v-on="{ ...$listeners, ...wrapperListeners }">
      <kFormItem :formConfig="config" :record="record" />
    </component>
    <div ref="wrapper-toolbar" class="vdr-item-toolbar" :class="{ active: record.key === selectItem.key }">
      <tool-bar v-bind="$props" v-on="{ ...$listeners }" />
    </div>
  </div>

  <!-- 非VDRCell模式（旧模式） -->
  <div
    v-else
    class="drag-move-box"
    :class="{ active: record.key === selectItem.key }"
    @click.stop="sentEventMessage('handleSelectItem', record)"
  >
    <div class="form-item-box">
      <kFormItem :formConfig="config" :record="record" />
    </div>
    <div v-if="!hideModel" class="show-key-box" v-text="record.label + (record.model ? '/' + record.model : '')" />
    <tool-bar v-bind="$props" v-on="{ ...$listeners }" />
  </div>
</template>
<script>
/*
 * author kcz
 * date 2019-11-20
 * description 通过json生成的单个表单节点
 */

import { Fragment } from "vue-fragment";
import { computePosition, shift, flip, inline, offset } from "@floating-ui/dom";

// projects
import VueDraggableResizableCell from "../../VueDraggableResizableCell/index";
import kFormItem from "../../KFormItem/index";
import { widgets } from "./layoutItems/components";

const { toolBar: ToolBar } = widgets;

export default {
  props: {
    record: {
      type: Object,
      required: true,
    },
    selectItem: {
      type: Object,
      default: () => {},
    },
    config: {
      type: Object,
      required: true,
    },
    hideModel: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    /** 获得针对 VueDraggableResizableCell 的选项 */
    vdrCellOptions() {
      const { vdrCellOptions = {} } = this.record;
      return vdrCellOptions;
    },
    /** 判断是否启用了 VueDraggableResizableCell */
    vdrCellEnabled() {
      const { enable = false } = this.vdrCellOptions;
      return enable;
    },
    wrapper() {
      return this.vdrCellEnabled ? VueDraggableResizableCell : Fragment;
    },
    wrapperProps() {
      // TODO：根据每种组件的特性，提供不同的 props
      // eg. 例如：这里针对 editor 组件，用于
      let addonProps = {};
      if (this.record.type === "editor") {
        addonProps = {
          wrapperSizeKIFOfCriticalChildElements: [".quill-editor"],
        };
      }

      return this.vdrCellEnabled
        ? {
            ...this.vdrCellOptions,
            ...addonProps,
          }
        : {};
    },
    wrapperListeners() {
      return this.vdrCellEnabled
        ? {
            activated: this.handleActivated,
            deactivated: this.handleDeactivated,
            cellDragStart: this.handleCellDragStart,
            cellDragging: this.handleCellDragging,
            cellDragEnd: this.handleCellDragEnd,
            cellResizeEnd: this.handleCellResizeEnd,
            cellResizeStart: this.handleCellResizeStart,
            cellResizing: this.handleCellResizing,
          }
        : {};
    },
  },
  components: {
    VueDraggableResizableCell,
    Fragment,
    kFormItem,
    ToolBar,
  },
  mounted() {
    this.updateVDRCellLayout();
  },
  methods: {
    sentEventMessage(eventName, ...args) {
      console.log("%c%s", "color: #22e633", "sentEventMessage", eventName, ...args);
      this.$emit(eventName, ...args);
    },
    updateVDRCellOptions(options = {}) {
      if (this.vdrCellEnabled) {
        Object.assign(this.vdrCellOptions, options);
      }
    },
    updateVDRToolbar(options = {}) {
      if (this.vdrCellEnabled) {
        this.updateToolbarPosition(this.$refs.wrapper, this.$refs[`wrapper-toolbar`], options);
      }
    },
    updateToolbarPosition(wrapper, toolbar, options = {}) {
      const wrapperEle = wrapper?.$el || wrapper;
      const wrapperToolbarEle = toolbar?.$el || toolbar;
      console.log("%c%s", "color: #22e633", "updateToolbarPosition ::begin", wrapperEle, wrapperToolbarEle);

      computePosition(wrapperEle, wrapperToolbarEle, {
        placement: "top-end",
        middleware: [shift(), flip(), inline(), offset(4)],
      }).then(({ x, y }) => {
        Object.assign(wrapperToolbarEle.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
        console.log("%c%s", "color: #22dd43", "updateToolbarPosition ::end", wrapperEle, wrapperToolbarEle);
      });
    },
    updateVDRCellLayout() {
      if (this.vdrCellEnabled) {
        const { wrapper } = this.$refs;
        const options = {
          x: wrapper.left,
          y: wrapper.top,
          w: wrapper.width,
          h: wrapper.height,
        };
        this.updateVDRCellOptions(options);
        this.updateVDRToolbar(options);
      }
    },
    handleActivated(t) {
      console.log("%c%s", "color: #84e600", "handleActivated");
      this.sentEventMessage("handleSelectItem", this.record);
      this.updateVDRCellLayout();
    },
    handleDeactivated() {},
    handleCellDragStart(_) {
      console.log("%c%s", "color: #44e600", "handleCellDragStart");
    },
    handleCellDragging(_, { left: x, top: y }) {
      console.log("%c%s", "color: #00a3cc", "handleCellDragging");
      this.updateVDRCellLayout();
    },
    handleCellDragEnd(_, { left: x, top: y }) {
      console.log("%c%s", "color: #aa00ff", "handleCellDragEnd");
      this.updateVDRCellLayout();
    },
    handleCellResizeStart(_) {},
    handleCellResizing(_, { left: x, top: y, width: w, height: h }) {
      this.updateVDRCellLayout();
    },
    handleCellResizeEnd(_, { left: x, top: y, width: w, height: h }) {
      this.updateVDRCellLayout();
    },
  },
};
</script>

<style scoped>
.vdr-item-toolbar {
  display: none;
  position: absolute;
  background: #555;
  color: white;
  font-weight: bold;
  padding: 0px 4px;
  font-size: 90%;
}

.active {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 10px;
}
</style>
