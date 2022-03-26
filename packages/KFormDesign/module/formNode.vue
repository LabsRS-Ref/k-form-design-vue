<!--
 * @Description: 将数据通过k-form-item组件解析，生成控件
 * @Author: kcz
 * @Date: 2019-12-30 00:37:05
 * @LastEditTime : 2022-03-26 21:05:02
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/formNode.vue
 -->
<template>
  <!-- <component :is="wrapper" v-bind="wrapperProps" @cellDragging="handleCellDragging"> -->
  <Fragment>
    <Fragment v-if="isVDRCellEnable">
      <component ref="wrapper" :is="wrapper" v-bind="wrapperProps" v-on="{ ...$listeners, ...wrapperListeners }">
        <kFormItem :formConfig="config" :record="record" />
      </component>
      <div ref="wrapper-toolbar" class="vdr-item-toolbar" :class="{ active: record.key === selectItem.key }">
        <tool-bar v-bind="$props" v-on="{ ...$listeners }" />
      </div>
    </Fragment>

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
  </Fragment>
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
import { components } from "./layoutItems";

const { toolBar: ToolBar } = components;

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
    isVDRCellEnable() {
      const { enable = false } = this.vdrCellOptions;
      return enable;
    },
    wrapper() {
      return this.isVDRCellEnable ? VueDraggableResizableCell : Fragment;
    },
    wrapperProps() {
      return this.isVDRCellEnable
        ? {
            ...this.vdrCellOptions,
          }
        : {};
    },
    wrapperListeners() {
      return this.isVDRCellEnable
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
    if (this.isVDRCellEnable) {
      this.updateVDRCellLayout();
    }
  },
  updated() {
    if (this.isVDRCellEnable) {
      this.updateVDRToolbar();
    }
  },
  methods: {
    sentEventMessage(eventName, ...args) {
      console.log("%c%s", "color: #22e633", "sentEventMessage", eventName, ...args);
      this.$emit(eventName, ...args);
    },
    updateVDRCellOptions(options = {}) {
      if (this.isVDRCellEnable) {
        Object.assign(this.vdrCellOptions, options);
      }
    },
    updateVDRToolbar(options = {}) {
      this.updateToolbarPosition(this.$refs.wrapper, this.$refs[`wrapper-toolbar`], options);
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
    updateVDRCellLayout(options = {}) {
      this.updateVDRCellOptions(options);
      this.updateVDRToolbar(options);
    },
    handleActivated(t) {
      console.log("%c%s", "color: #84e600", "handleActivated");
      this.sentEventMessage("handleSelectItem", this.record);
      const { left: x, top: y } = t;
      this.updateVDRCellLayout({ x, y });
    },
    handleDeactivated() {},
    handleCellDragStart(_) {
      console.log("%c%s", "color: #44e600", "handleCellDragStart");
    },
    handleCellDragging(_, { left: x, top: y }) {
      console.log("%c%s", "color: #00a3cc", "handleCellDragging");
      this.updateVDRCellLayout({ x, y });
    },
    handleCellDragEnd(_, { left: x, top: y }) {
      console.log("%c%s", "color: #aa00ff", "handleCellDragEnd");
      this.updateVDRCellLayout({ x, y });
    },
    handleCellResizeStart(_) {},
    handleCellResizing(_, { left: x, top: y, width: w, height: h }) {
      this.updateVDRCellLayout({ x, y, w, h });
    },
    handleCellResizeEnd(_, { left: x, top: y, width: w, height: h }) {
      this.updateVDRCellLayout({ x, y, w, h });
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
