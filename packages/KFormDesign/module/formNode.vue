<!--
 * @Description: 将数据通过k-form-item组件解析，生成控件
 * @Author: kcz
 * @Date: 2019-12-30 00:37:05
 * @LastEditTime : 2022-03-21 10:06:50
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/formNode.vue
 -->
<template>
  <!-- <component :is="wrapper" v-bind="wrapperProps" @cellDragging="handleCellDragging"> -->
  <component :is="wrapper" v-bind="wrapperProps" v-on="{ ...$listeners, ...wrapperListeners }">
    <div class="drag-move-box" :class="{ active: record.key === selectItem.key }">
      <div class="form-item-box">
        <kFormItem :formConfig="config" :record="record" />
      </div>
      <div v-if="!hideModel" class="show-key-box" v-text="record.label + (record.model ? '/' + record.model : '')" />
      <div
        class="copy"
        :class="record.key === selectItem.key ? 'active' : 'unactivated'"
        @click.stop="$emit('handleCopy')"
      >
        <a-icon type="copy" />
      </div>
      <div
        class="delete"
        :class="record.key === selectItem.key ? 'active' : 'unactivated'"
        @click.stop="$emit('handleDelete')"
      >
        <a-icon type="delete" />
      </div>
    </div>
  </component>
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
            resizeScope: ["svg-size"],
            resizeScopeManipulation: "union",
            parent: true,
            x: this.vdrCellOptions.x,
            y: this.vdrCellOptions.y,
            initWidth: this.vdrCellOptions.width,
            initHeight: this.vdrCellOptions.height,
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
  },
  methods: {
    handleActivated() {
      this.$emit("handleSelectItem", this.record);
    },
    handleDeactivated() {},
    handleCellDragStart(_) {
      console.log("%c%s", "color: #44e600", "handleCellDragStart");
    },
    handleCellDragging(_, { left, top }) {
      console.log("%c%s", "color: #00a3cc", "handleCellDragging");
      this.vdrCellOptions.x = left;
      this.vdrCellOptions.y = top;
    },
    handleCellDragEnd(_) {
      console.log("%c%s", "color: #aa00ff", "handleCellDragEnd");
    },
    handleCellResizeStart(_) {},
    handleCellResizing(_, { left, top, width, height }) {
      this.vdrCellOptions.width = width;
      this.vdrCellOptions.height = height;
      this.vdrCellOptions.x = left;
      this.vdrCellOptions.y = top;
    },
    handleCellResizeEnd(_) {},
  },
};
</script>
