<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-18 09:03:05
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/layoutItem.vue
 * @LastEditTime : 2022-04-01 17:45:18
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->
<template>
  <component
    :is="getWrapperBy(record)"
    v-bind="{
      ...getWrapperPropsBy(record, $props, $attrs),
    }"
    v-on="{
      ...getWrapperListenersBy(record, $listeners),
    }"
  >
    <div
      data-name="layoutItem"
      :class="{
        'layout-width': enableUseLayoutWidth,
      }"
    >
      <component
        :is="layoutComponent || nodeComponent"
        v-bind="{
          ...$props,
          ...$attrs,
        }"
        v-on="{
          ...$listeners,
        }"
      />
    </div>
  </component>
</template>
<script>
import LayoutItems from "./layoutItems";

const { baseClass: base } = LayoutItems;
export default {
  name: "layoutItem",
  extends: base,
  computed: {
    enableUseLayoutWidth() {
      const { type } = this.record;
      return !!this.layoutComponent || ["html", "divider"].includes(type);
    },
  },
  methods: {
    isVDRItem(type) {
      return (
        Object.keys(this.registeredLayoutTypeMap).includes(type) &&
        this.vdrCellEnabled
      );
    },
    getWrapperBy({ type }) {
      const { VueDraggableResizableCell } = this.$options.components;
      const isVDRCell = this.isVDRItem(type);
      // HACK: 使用Fragment组件，会出错，单独嵌入简单的Item时，使用 div 替代
      return isVDRCell ? VueDraggableResizableCell : "div";
    },
    getWrapperPropsBy(item) {
      if (this.isVDRItem(item.type)) {
        return {
          ...item.vdrCellOptions,
        };
      }
      return {};
    },
    getWrapperListenersBy(item) {
      if (this.isVDRItem(item.type)) {
        const updateVDRCellLayout = ({
          left: x,
          top: y,
          width: w,
          height: h,
        }) => {
          // eslint-disable-next-line no-param-reassign
          item.vdrCellOptions = {
            ...item.vdrCellOptions,
            x,
            y,
            w,
            h,
          };
        };
        return {
          activated: (cell) => {
            this.handleSelectItem(item);
            updateVDRCellLayout(cell);
          },
          deactivated: (cell) => updateVDRCellLayout(cell),
          cellDragStart: (cell) => updateVDRCellLayout(cell),
          cellDragging: (cell) => updateVDRCellLayout(cell),
          cellDragEnd: (cell) => updateVDRCellLayout(cell),
          cellResizeEnd: (cell) => updateVDRCellLayout(cell),
          cellResizeStart: (cell) => updateVDRCellLayout(cell),
          cellResizing: (cell) => updateVDRCellLayout(cell),
        };
      }

      return {};
    },
  },
};
</script>
