<!--
 * @Description: 将数据通过k-form-item组件解析，生成控件
 * @Author: kcz
 * @Date: 2019-12-30 00:37:05
 * @LastEditTime : 2022-03-25 21:19:24
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/formNode.vue
 -->
<template>
  <!-- <component :is="wrapper" v-bind="wrapperProps" @cellDragging="handleCellDragging"> -->
  <Fragment>
    <component v-if="isVDRCellEnable" :is="wrapper" v-bind="wrapperProps" v-on="{ ...$listeners, ...wrapperListeners }">
      <kFormItem :formConfig="config" :record="record" />
    </component>
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
  methods: {
    sentEventMessage(eventName, ...args) {
      console.log("%c%s", "color: #22e633", "sentEventMessage", eventName, ...args);
      this.$emit(eventName, ...args);
    },
    updateVDRCellOptions(options = {}) {
      Object.assign(this.vdrCellOptions, options);
    },
    handleActivated(t) {
      console.log("%c%s", "color: #84e600", "handleActivated");
      this.sentEventMessage("handleSelectItem", this.record);
      this.updateVDRCellOptions({
        w: t.width,
        h: t.height,
      });
    },
    handleDeactivated() {},
    handleCellDragStart(_) {
      console.log("%c%s", "color: #44e600", "handleCellDragStart");
    },
    handleCellDragging(_, { left, top }) {
      console.log("%c%s", "color: #00a3cc", "handleCellDragging");
      this.updateVDRCellOptions({
        x: left,
        y: top,
      });
    },
    handleCellDragEnd(_) {
      console.log("%c%s", "color: #aa00ff", "handleCellDragEnd");
    },
    handleCellResizeStart(_) {},
    handleCellResizing(_, { left: x, top: y, width: w, height: h }) {
      this.updateVDRCellOptions({
        x,
        y,
        w,
        h,
      });
    },
    handleCellResizeEnd(_) {},
  },
};
</script>
