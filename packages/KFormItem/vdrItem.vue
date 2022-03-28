<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-23 10:20:44
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormItem/vdrItem.vue
 * @LastEditTime : 2022-03-25 08:48:00
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->
<template>
  <Fragment>
    <component :is="wrapper" v-bind="wrapperProps" v-on="wrapperListeners">
      <kFormItem v-bind="props" v-on="$listeners" />
    </component>
  </Fragment>
</template>
<script>
import { Fragment } from "vue-fragment";
import VDRCell from "../VueDraggableResizableCell/index";
import kFormItem from "./index";

export default {
  computed: {
    /** 不指定组件默认的props，全部来自 $attrs 作为props内容 */
    props() {
      return {
        ...this.$attrs,
      };
    },
    /** 获得针对 VDRCell 的选项 */
    vdrCellOptions() {
      const { vdrCellOptions = {} } = this.props.record;
      return vdrCellOptions;
    },
    /** 判断是否启用了 VDRCell */
    vdrCellEnabled() {
      const { enable = false } = this.vdrCellOptions;
      return enable;
    },
    wrapper() {
      return this.vdrCellEnabled ? VDRCell : Fragment;
    },
    wrapperProps() {
      // const vdrCellPropsKeyNames = Object.keys(VDRCellProps);
      return this.vdrCellEnabled
        ? {
            ...this.vdrCellOptions,
            draggable: false,
            resizable: false,
          }
        : {};
    },
    wrapperListeners() {
      return this.vdrCellEnabled
        ? {
            mounted: this.handleVDRCellMounted,
            // activated: this.handleActivated,
            // deactivated: this.handleDeactivated,
            // cellDragStart: this.handleCellDragStart,
            // cellDragging: this.handleCellDragging,
            // cellDragEnd: this.handleCellDragEnd,
            // cellResizeEnd: this.handleCellResizeEnd,
            // cellResizeStart: this.handleCellResizeStart,
            // cellResizing: this.handleCellResizing,
          }
        : {};
    },
  },
  components: {
    VDRCell,
    Fragment,
    kFormItem,
  },
  methods: {
    updateVDRCellOptions(options = {}) {
      Object.assign(this.vdrCellOptions, options);
    },
    handleVDRCellMounted(t) {
      // t.updateChildrenLayout({
      //   left: t.x,
      //   top: t.y,
      //   width: t.w,
      //   height: t.h,
      //   force: true,
      // });
    },
    handleActivated(t) {
      this.$emit("handleSelectItem", this.props.record);
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
