<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-18 09:03:05
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/layoutItem.vue
 * @LastEditTime : 2022-03-27 09:48:27
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->
<template>
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
</template>
<script>
import LayoutItems from "./layoutItems";

const { baseClass: base, layouts, nodes } = LayoutItems;
export default {
  name: "layoutItem",
  extends: base,
  computed: {
    enableUseLayoutWidth() {
      const { type } = this.record;
      return !!this.layoutComponent || ["html", "divider"].includes(type);
    },
    layoutComponent() {
      const { type } = this.record;
      return {
        "free-layout": layouts.freeLayout,
        table: layouts.tableLayout,
        tabs: layouts.tabsLayout,
        grid: layouts.gridLayout,
        card: layouts.cardLayout,
      }[type];
    },
    nodeComponent() {
      const { type } = this.record;
      return (
        {
          batch: nodes.batchNode,
          selectInputList: nodes.selectInputListNode,
        }[type] || nodes.baseNode
      );
    },
  },
  components: {
    ...layouts,
    ...nodes,
  },
};
</script>
